const db = require('../models');
const { removeStock } = require('../utils/StockService');
const { PurchaseReturn, PurchaseReturnItem, PurchaseItems,PurchaseInvoice,Item } = db;


exports.createPurchaseReturn = async (req, res) => {
  const t = await PurchaseReturn.sequelize.transaction();

  try {
    const { purchase_id, store_id, created_by, return_date, reason, items } = req.body;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: "Items array is required." });
    }

    // 1️⃣ Create return header
    const purchaseReturn = await PurchaseReturn.create(
      {
        purchase_id,
        store_id,
        created_by,
        return_date: return_date || new Date(),
        reason,
        total_amount: 0,
      },
      { transaction: t }
    );

    let totalAmount = 0;

    // 2️⃣ Loop items
    for (const i of items) {
      const { item_id, batch_no, qty, item_reason, scheme_discount_percent = 0, discount_percent = 0 } = i;

      if (!item_id || !batch_no || !qty) {
        throw new Error("item_id, batch_no, qty are required.");
      }

      // 3️⃣ Fetch original purchase item
      const purchaseItem = await PurchaseItems.findOne({
        where: { purchase_id, item_id, batch_no },
        include: [{ model: Item, as: "item", attributes: ["pack_size"] }],
        transaction: t,
      });




      if (!purchaseItem) {
        throw new Error(`No purchase item found for item ${item_id}, batch ${batch_no}`);
      }


      
 const pack_size = Number(purchaseItem.item?.pack_size) || 1;

const packQty = Number(qty);                 // entered qty
const unitQty = packQty * pack_size;         // stock units
const purchase_rate = Number(purchaseItem.purchase_rate);
const packRate = Number(purchaseItem.purchase_rate); // PACK RATE
const gst_percent = Number(purchaseItem.gst_percent || 0);
const discountPercent = Number(purchaseItem.discount_percent || 0);
const schemePercent = Number(purchaseItem.scheme_discount_percent || 0);


// ✅ Amount calculation MUST use PACK QTY
const baseAmount = packQty * packRate;

const discountAmount = baseAmount * (discountPercent / 100);
const schemeAmount = baseAmount * (schemePercent / 100);

const taxableAmount = baseAmount - discountAmount - schemeAmount;
const gstAmount = taxableAmount * (gst_percent / 100);
const totalItemAmount = taxableAmount + gstAmount;

totalAmount += totalItemAmount;



      // 5️⃣ Save return item
      await PurchaseReturnItem.create(
        {
          return_id: purchaseReturn.return_id,
          item_id,
          batch_no,
          qty,
          rate: purchase_rate,
          discount_percent,
          scheme_discount_percent,
          gst_percent,
          amount: totalItemAmount,
          reason: item_reason || null,
          expiry_date: purchaseItem.expiry_date,
        },
        { transaction: t }
      );

      // 6️⃣ Reduce stock
      await removeStock(
        {
          store_id,
          item_id,
          batch_no,
         qty: unitQty,
        },
        t
      );
    }

    // 7️⃣ Update return header total
    await purchaseReturn.update(
      { total_amount: totalAmount },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      return_id: purchaseReturn.return_id,
      total_amount: totalAmount,
    });
  } catch (err) {
    await t.rollback();
    console.error("Purchase Return Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


// Optional: Get purchase return by ID with items
exports.getPurchaseReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseReturn = await PurchaseReturn.findOne({
      where: { return_id: id },
      include: [
        {
          model: PurchaseReturnItem,
          as: "items",
        },
      ],
    });

    if (!purchaseReturn) {
      return res.status(404).json({ success: false, message: "Purchase return not found" });
    }

    return res.json({ success: true, purchaseReturn });
  } catch (err) {
    console.error("Error fetching purchase return:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.getPurchaseReturn = async (req, res) => {
  try {
    let { page = 1, perPage = 10 } = req.query;

    page = Math.max(parseInt(page) || 1, 1);
    perPage = Math.max(parseInt(perPage) || 10, 1);

    const offset = (page - 1) * perPage;

    const { count, rows } = await PurchaseReturn.findAndCountAll({
      distinct: true, // 🔥 IMPORTANT
      offset,
      limit: perPage,
      order: [["return_id", "DESC"]],

      include: [
        {
          model: PurchaseReturnItem,
          as: "purchaseReturnItems",
          attributes: [
            "return_item_id",
            "item_id",
            "batch_no",
            "qty",
            "rate",
            "amount",
          ],
        },
        {
          model: PurchaseInvoice,
          as: "purchase",
          attributes: [
            "purchase_id",
            "invoice_no",
            "invoice_date",
            "total_amount",
            "net_amount",
          ],
        },
      ],
    });

    res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit: perPage,
        totalPages: Math.ceil(count / perPage),
      },
    });

  } catch (error) {
    console.error("Error fetching Purchase Returns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase returns",
    });
  }
};


