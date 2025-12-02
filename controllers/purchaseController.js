const db = require("../models");
const { convertToLastDateOfMonth } = require("../utils/convertToLastDateOfMonth");

const PurchaseInvoice = db.PurchaseInvoice;
const PurchaseItems = db.PurchaseItems;
const Item = db.Item;
const HSN = db.HSN;
const StoreStock = db.StoreStock;
const Supplier=db.Supplier;
const Store=db.Store;



exports.createPurchase = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      supplier_id,
      invoice_no,
      invoice_date,
      store_id,
      items,
      total_amount,
      total_gst,
      total_discount,
      net_amount,
    } = req.body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    if (!store_id) {
      return res.status(400).json({ message: "Store is required" });
    }

    if (!supplier_id) {
      return res.status(400).json({ message: "Supplier is required" });
    }

    // 1️⃣ CREATE PURCHASE INVOICE
    const purchaseInvoice = await PurchaseInvoice.create(
      {
        supplier_id,
        invoice_no,
        invoice_date,
        store_id,
        total_amount: total_amount ?? 0,
        total_gst: total_gst ?? 0,
        total_discount: total_discount ?? 0,
        net_amount: net_amount ?? 0,
      },
      { transaction: t }
    );


    // 2️⃣ LOOP THROUGH ALL ITEMS
    for (const item of items) {
      const {
        item_id,
        batch_no,
        expiry_date,
        qty,
        purchase_rate,
        mrp,
        discount_percent,
        gst_percent,

        // optional fields for now – you can add them from UI later if needed
        free_qty = 0,
        sale_rate = null,
        scheme_discount_percent = 0,
        scheme_discount_amount = 0,
      } = item;

      if (!item_id) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "item_id is required for each item row" });
      }

      // Make sure item exists
      const dbItem = await Item.findByPk(item_id);
      if (!dbItem) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: `Item with id ${item_id} not found` });
      }
const finalExpiryDate = convertToLastDateOfMonth(expiry_date);
      const qtyNum = Number(qty || 0);
      const purchaseRateNum = Number(purchase_rate || 0);
      const discPercentNum = Number(discount_percent || 0);
      const gstPercentNum = Number(gst_percent || 0);
      const freeQtyNum = Number(free_qty || 0);
      const mrpNum = Number(mrp || 0);

      // 2.1️⃣ CALCULATIONS (match your frontend logic)
      const grossAmount = qtyNum * purchaseRateNum; // Qty * Rate
      const discountAmount = (grossAmount * discPercentNum) / 100;
      const taxableAmount = grossAmount - discountAmount;
      const gstAmount = (taxableAmount * gstPercentNum) / 100;
      const lineTotal = taxableAmount + gstAmount;

      // Split GST into CGST/SGST (assuming intra-state)
      const halfGst = gstAmount / 2;

      // 2.2️⃣ CREATE PURCHASE ITEM (ALL FIELDS FROM MODEL)
      await PurchaseItems.create(
        {
          purchase_id: purchaseInvoice.purchase_id,
          item_id: dbItem.item_id,

          batch_no,
          expiry_date:finalExpiryDate,

          qty: qtyNum,
          free_qty: freeQtyNum,

          purchase_rate: purchaseRateNum,
          mrp: mrpNum,
          sale_rate,

          discount_percent: discPercentNum,
          discount_amount: discountAmount,

          scheme_discount_percent,
          scheme_discount_amount,

          taxable_amount: taxableAmount,

          gst_percent: gstPercentNum,
          cgst: halfGst,
          sgst: halfGst,
          igst: 0,

          total_amount: lineTotal,
        },
        { transaction: t }
      );

      // 2.3️⃣ UPDATE / CREATE STORE STOCK
      let stock = await StoreStock.findOne({
        where: {
          store_id,
          item_id: dbItem.item_id,
          batch_no: batch_no || null,
        },
        transaction: t,
      });

      const finalQty = qtyNum + freeQtyNum;

      if (stock) {
        await stock.update(
          {
            qty_in_stock: Number(stock.qty_in_stock || 0) + finalQty,
            mrp: mrpNum,
            purchase_rate: purchaseRateNum,
            sale_rate: sale_rate ?? stock.sale_rate,
            gst_percent: gstPercentNum,
            expiry_date:finalExpiryDate,
          },
          { transaction: t }
        );
      } else {
        await StoreStock.create(
          {
            store_id,
            item_id: dbItem.item_id,
            batch_no,
            expiry_date:finalExpiryDate,
            mrp: mrpNum,
            purchase_rate: purchaseRateNum,
            sale_rate,
            gst_percent: gstPercentNum,
            qty_in_stock: finalQty,
          },
          { transaction: t }
        );
      }
    }

    // 3️⃣ COMMIT TRANSACTION
    await t.commit();

    return res.status(201).json({
      message: "Purchase Invoice Created Successfully",
      purchase_id: purchaseInvoice.purchase_id,
    });
  } catch (error) {
    await t.rollback();
    console.error("Purchase Invoice Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getAllInvoices = async (req, res) => {
  try {
    // Optional: add filters (date range, supplier, store)
    const { from_date, to_date, store_id, supplier_id } = req.query;

    const whereInvoice = {};
    if (from_date) whereInvoice.invoice_date = { [db.Sequelize.Op.gte]: from_date };
    if (to_date) whereInvoice.invoice_date = { ...whereInvoice.invoice_date, [db.Sequelize.Op.lte]: to_date };
    if (store_id) whereInvoice.store_id = store_id;
    if (supplier_id) whereInvoice.supplier_id = supplier_id;

    const invoices = await PurchaseInvoice.findAll({
      where: whereInvoice,
      include: [
        { model: Supplier, as: "supplier" },
        { model: Store, as: "store" },
        {
          model: PurchaseItems,
          as: "items",
          include: [{ model: Item, as: "item" }],
        },
      ],
      order: [["invoice_date", "DESC"]],
    });

    res.status(200).json({
      success: true,
      total: invoices.length,
      data: invoices,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



exports.getPurchaseReport = async (req, res) => {
  try {
    const {
      from_date,
      to_date,
      supplier_id,
      store_id,
      invoice_no,
      item_id,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (page - 1) * limit;

    // 🔍 Build dynamic filter
    const where = {};

    if (from_date && to_date) {
      where.invoice_date = { [db.Sequelize.Op.between]: [from_date, to_date] };
    }

    if (supplier_id) where.supplier_id = supplier_id;
    if (store_id) where.store_id = store_id;
    if (invoice_no) where.invoice_no = invoice_no;

    // Include conditions for items
    const itemFilter = {};
    if (item_id) itemFilter.item_id = item_id;

    // 📌 Fetch invoice + item details
    const result = await PurchaseInvoice.findAndCountAll({
      where,
      include: [
        { 
          model:Supplier,
          as:"supplier",
          attributes:["supplier_name","phone","email"]
        },
        { 
          model:Store,
          as:"store",
          attributes:["store_name","phone","email"]
        },
        {
          model: PurchaseItems,
          as: "items",
          where: Object.keys(itemFilter).length > 0 ? itemFilter : undefined,
          required: false,
          include: [
            {
              model: Item,
              as: "item",
              attributes: ["name", "hsn_id"],
              include:[
                {
                  model:HSN,
                  as:"hsn",
                  attributes:["hsn_code"]

                },
              ]
            },
          ],
        },
      ],
      order: [["invoice_date", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });

    return res.status(200).json({
      success: true,
      total: result.count,
      page: Number(page),
      pages: Math.ceil(result.count / limit),
      data: result.rows,
    });
  } catch (error) {
    console.error("Purchase Report Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




// exports.createPurchase = async (req, res) => {
//   const t = await db.sequelize.transaction();

//   try {
//     const {
//       supplier_id,
//       invoice_no,
//       invoice_date,
//       store_id,
//       items
//     } = req.body;

//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ message: "Items are required" });
//     }

//     // ===============================
//     // 1️⃣ CREATE PURCHASE INVOICE
//     // ===============================
//     const purchaseInvoice = await PurchaseInvoice.create(
//       {
//         supplier_id,
//         invoice_no,
//         invoice_date,
//         store_id
//       },
//       { transaction: t }
//     );

//     // ===============================
//     // 2️⃣ LOOP THROUGH ALL ITEMS
//     // ===============================
//     for (const item of items) {
//       const {
//         item_name,
//         hsn_code,
//         batch_no,
//         expiry_date,
//         qty,
//         free_qty,
//         purchase_rate,
//         mrp,
//         sale_rate,
//         discount_percent,
//         discount_amount,
//         scheme_discount_percent,
//         scheme_discount_amount,
//         taxable_amount,
//         gst_percent,
//         cgst,
//         sgst,
//         igst,
//         total_amount
//       } = item;

//       // ===============================
//       // 2.1️⃣ FIND OR CREATE HSN
//       // ===============================
//       let hsn = await HSN.findOne({
//         where: { hsn_code }
//       });

//       if (!hsn) {
//         hsn = await HSN.create(
//           {
//             hsn_code,
//             description: `${item_name} - Auto Added`
//           },
//           { transaction: t }
//         );
//       }

//       // ===============================
//       // 2.2️⃣ FIND OR CREATE ITEM
//       // ===============================
//       let dbItem = await Item.findOne({
//   where: { sku: item.sku }
// });

// if (!dbItem) {
//   dbItem = await Item.create(
//     {
//       sku: item.sku,    // REQUIRED NOW
//       name: item_name,
//       hsn_id: hsn.hsn_id,
//       mrp,
//       sale_rate
//     },
//     { transaction: t }
//   );
// }


//       // ===============================
//       // 2.3️⃣ CREATE PURCHASE ITEM
//       // ===============================
//       await PurchaseItems.create(
//         {
//           purchase_id: purchaseInvoice.purchase_id,
//           item_id: dbItem.item_id,
//           batch_no,
//           expiry_date,
//           qty,
//           free_qty,
//           purchase_rate,
//           mrp,
//           sale_rate,
//           discount_percent,
//           discount_amount,
//           scheme_discount_percent,
//           scheme_discount_amount,
//           taxable_amount,
//           gst_percent,
//           cgst,
//           sgst,
//           igst,
//           total_amount
//         },
//         { transaction: t }
//       );

//       // ===============================
//       // 2.4️⃣ UPDATE STORE STOCK
//       // ===============================

//       let stock = await StoreStock.findOne({
//         where: {
//           store_id,
//           item_id: dbItem.item_id,
//           batch_no
//         }
//       });

//       const finalQty = Number(qty) + Number(free_qty || 0);

//       if (stock) {
//         // Update existing stock
//         await stock.update(
//           {
//             qty_in_stock: Number(stock.qty_in_stock) + finalQty,
//             mrp,
//             purchase_rate,
//             sale_rate,
//             gst_percent,
//             expiry_date
//           },
//           { transaction: t }
//         );
//       } else {
//         // Create new stock record
//         await StoreStock.create(
//           {
//             store_id,
//             item_id: dbItem.item_id,
//             batch_no,
//             expiry_date,
//             mrp,
//             purchase_rate,
//             sale_rate,
//             gst_percent,
//             qty_in_stock: finalQty
//           },
//           { transaction: t }
//         );
//       }
//     }

//     // Commit all operations
//     await t.commit();

//     return res.status(201).json({
//       message: "Purchase Invoice Created Successfully",
//       purchase_id: purchaseInvoice.purchase_id
//     });

//   } catch (error) {
//     await t.rollback();
//     console.error("Purchase Invoice Error:", error);
//     return res.status(500).json({ message: "Internal Server Error", error });
//   }
// };
