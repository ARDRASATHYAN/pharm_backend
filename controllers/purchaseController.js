const db = require("../models");

const PurchaseInvoice = db.PurchaseInvoice;
const PurchaseItems = db.PurchaseItems;
const Item = db.Item;
const HSN = db.HSN;
const StoreStock = db.StoreStock;

exports.createPurchase = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      supplier_id,
      invoice_no,
      invoice_date,
      store_id,
      items
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    // ===============================
    // 1️⃣ CREATE PURCHASE INVOICE
    // ===============================
    const purchaseInvoice = await PurchaseInvoice.create(
      {
        supplier_id,
        invoice_no,
        invoice_date,
        store_id
      },
      { transaction: t }
    );

    // ===============================
    // 2️⃣ LOOP THROUGH ALL ITEMS
    // ===============================
    for (const item of items) {
      const {
        item_name,
        hsn_code,
        batch_no,
        expiry_date,
        qty,
        free_qty,
        purchase_rate,
        mrp,
        sale_rate,
        discount_percent,
        discount_amount,
        scheme_discount_percent,
        scheme_discount_amount,
        taxable_amount,
        gst_percent,
        cgst,
        sgst,
        igst,
        total_amount
      } = item;

      // ===============================
      // 2.1️⃣ FIND OR CREATE HSN
      // ===============================
      let hsn = await HSN.findOne({
        where: { hsn_code }
      });

      if (!hsn) {
        hsn = await HSN.create(
          {
            hsn_code,
            description: `${item_name} - Auto Added`
          },
          { transaction: t }
        );
      }

      // ===============================
      // 2.2️⃣ FIND OR CREATE ITEM
      // ===============================
      let dbItem = await Item.findOne({
  where: { sku: item.sku }
});

if (!dbItem) {
  dbItem = await Item.create(
    {
      sku: item.sku,    // REQUIRED NOW
      name: item_name,
      hsn_id: hsn.hsn_id,
      mrp,
      sale_rate
    },
    { transaction: t }
  );
}


      // ===============================
      // 2.3️⃣ CREATE PURCHASE ITEM
      // ===============================
      await PurchaseItems.create(
        {
          purchase_id: purchaseInvoice.purchase_id,
          item_id: dbItem.item_id,
          batch_no,
          expiry_date,
          qty,
          free_qty,
          purchase_rate,
          mrp,
          sale_rate,
          discount_percent,
          discount_amount,
          scheme_discount_percent,
          scheme_discount_amount,
          taxable_amount,
          gst_percent,
          cgst,
          sgst,
          igst,
          total_amount
        },
        { transaction: t }
      );

      // ===============================
      // 2.4️⃣ UPDATE STORE STOCK
      // ===============================

      let stock = await StoreStock.findOne({
        where: {
          store_id,
          item_id: dbItem.item_id,
          batch_no
        }
      });

      const finalQty = Number(qty) + Number(free_qty || 0);

      if (stock) {
        // Update existing stock
        await stock.update(
          {
            qty_in_stock: Number(stock.qty_in_stock) + finalQty,
            mrp,
            purchase_rate,
            sale_rate,
            gst_percent,
            expiry_date
          },
          { transaction: t }
        );
      } else {
        // Create new stock record
        await StoreStock.create(
          {
            store_id,
            item_id: dbItem.item_id,
            batch_no,
            expiry_date,
            mrp,
            purchase_rate,
            sale_rate,
            gst_percent,
            qty_in_stock: finalQty
          },
          { transaction: t }
        );
      }
    }

    // Commit all operations
    await t.commit();

    return res.status(201).json({
      message: "Purchase Invoice Created Successfully",
      purchase_id: purchaseInvoice.purchase_id
    });

  } catch (error) {
    await t.rollback();
    console.error("Purchase Invoice Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
