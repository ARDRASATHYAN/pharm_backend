const db = require("../models");
const calculateSaleRate = require("../utils/calculateSaleRate");
const { convertToLastDateOfMonth } = require("../utils/convertToLastDateOfMonth");

const PurchaseInvoice = db.PurchaseInvoice;
const PurchaseItems = db.PurchaseItems;
const Item = db.Item;
const HSN = db.HSN;
const StoreStock = db.StoreStock;
const Supplier = db.Supplier;
const Store = db.Store;



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
        created_by: req.body.created_by,
        total_amount: total_amount ?? 0,
        total_gst: total_gst ?? 0,
        total_discount: total_discount ?? 0,
        net_amount: net_amount ?? 0,
      },
      { transaction: t }
    );

    // 2️⃣ LOOP ITEMS
    for (const item of items) {
      const {
        item_id,
        batch_no,
        pack_size,
        expiry_date,
        qty,
        purchase_rate,
        mrp,
        gst_percent,

        // SALES DISCOUNT
        discount_percent = 0,
        discount_amount = 0,

        // PURCHASE DISCOUNT
        p_discount_percent = 0,
        p_discount_amount = 0,
        p_discount_type = "percent",

        free_qty = 0,
        sale_rate = null,

        // SCHEME DISCOUNT
        scheme_discount_percent = 0,
        scheme_discount_amount = 0,
        scheme_discount_type = "percent",
      } = item;

      if (!item_id) {
        await t.rollback();
        return res.status(400).json({ message: "item_id is required for each item" });
      }

      const dbItem = await Item.findByPk(item_id);
      if (!dbItem) {
        await t.rollback();
        return res.status(400).json({ message: `Item ${item_id} not found` });
      }

      const qtyNum = Number(qty || 0);
      const freeQtyNum = Number(free_qty || 0);
      const purchaseRateNum = Number(purchase_rate || 0);
      const mrpNum = Number(mrp || 0);
      const gstPercentNum = Number(gst_percent || 0);

      const pDiscPercentNum = Number(p_discount_percent || 0);
      const pDiscAmountNum = Number(p_discount_amount || 0);

      const schemeDiscPercentNum = Number(scheme_discount_percent || 0);
      const schemeDiscAmountNum = Number(scheme_discount_amount || 0);

      // ---------- GROSS AMOUNT ----------
      const grossAmount = qtyNum * purchaseRateNum;

      // ---------- PURCHASE DISCOUNT ----------
      const pDiscType = (p_discount_type || "percent").toLowerCase();
      let purchaseDiscountAmount = 0;
      if (pDiscType === "amount") {
        purchaseDiscountAmount = pDiscAmountNum;
      } else {
        purchaseDiscountAmount = (grossAmount * pDiscPercentNum) / 100;
      }

      // ---------- SCHEME DISCOUNT ----------
      const schemeDiscType = (scheme_discount_type || "percent").toLowerCase();
      let schemeDiscount = 0;
      if (schemeDiscType === "amount") {
        schemeDiscount = schemeDiscAmountNum;
      } else {
        schemeDiscount = (grossAmount * schemeDiscPercentNum) / 100;
      }

      // ---------- TAXABLE AMOUNT ----------
      const taxableAmount = grossAmount - purchaseDiscountAmount - schemeDiscount;

      // ---------- GST ----------
      const gstAmount = (taxableAmount * gstPercentNum) / 100;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      const igst = 0;

      // ---------- TOTAL LINE ----------
      const totalAmount = taxableAmount + gstAmount;

      // ---------- SALE RATE ----------
      const finalSaleRate = sale_rate ?? calculateSaleRate({ mrp: mrpNum, discount_percent });

      // ---------- CREATE PURCHASE ITEM ----------
      await PurchaseItems.create(
        {
          purchase_id: purchaseInvoice.purchase_id,
          item_id,

          batch_no,
          pack_size,
          expiry_date: convertToLastDateOfMonth(expiry_date),

          qty: qtyNum,
          free_qty: freeQtyNum,

          purchase_rate: purchaseRateNum,
          mrp: mrpNum,
          sale_rate: finalSaleRate,

          discount_percent,
          discount_amount,

          p_discount_percent: pDiscPercentNum,
          p_discount_amount: purchaseDiscountAmount,

          scheme_discount_percent: schemeDiscPercentNum,
          scheme_discount_amount: schemeDiscount,

          taxable_amount: taxableAmount,

          gst_percent: gstPercentNum,
          cgst,
          sgst,
          igst,

          total_amount: totalAmount,
        },
        { transaction: t }
      );

      // ---------- UPDATE STOCK ----------
      const packSizeNum = Number(pack_size || 1);
      const finalQty = packSizeNum * (qtyNum + freeQtyNum);
      const unitSalePrice = finalSaleRate / packSizeNum;
const unitCostPrice = totalAmount / finalQty;

      let stock = await StoreStock.findOne({
        where: { store_id, item_id, batch_no: batch_no || null },
        transaction: t,
      });

      if (stock) {
        await stock.update(
          {
            qty_in_stock: Number(stock.qty_in_stock || 0) + finalQty,
            mrp: mrpNum,
            purchase_rate: purchaseRateNum,
            sale_rate: finalSaleRate,
            gst_percent: gstPercentNum,
            expiry_date: convertToLastDateOfMonth(expiry_date),
            sale_price:unitSalePrice,
            cost_price:unitCostPrice,
              discount_percent,
          discount_amount,
          },
          { transaction: t }
        );
      } else {
        await StoreStock.create(
          {
            store_id,
            item_id,
            batch_no,
            expiry_date: convertToLastDateOfMonth(expiry_date),
            mrp: mrpNum,
            purchase_rate: purchaseRateNum,
            sale_rate: finalSaleRate,
            gst_percent: gstPercentNum,
            qty_in_stock: finalQty,
            sale_price: unitSalePrice,   
    cost_price: unitCostPrice,
      discount_percent,
          discount_amount,
          },
          { transaction: t }
        );
      }
    }

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
    const { from_date, to_date, store_id, supplier_id, page = 1, perPage = 10 } = req.query;

    const whereInvoice = {};
    if (from_date) whereInvoice.invoice_date = { [db.Sequelize.Op.gte]: from_date };
    if (to_date) whereInvoice.invoice_date = {
      ...whereInvoice.invoice_date,
      [db.Sequelize.Op.lte]: to_date
    };
    if (store_id) whereInvoice.store_id = store_id;
    if (supplier_id) whereInvoice.supplier_id = supplier_id;

    const limit = parseInt(perPage, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const { rows: invoices, count: total } = await PurchaseInvoice.findAndCountAll({
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
      limit,
      offset,
      distinct: true,
      col: 'purchase_id',
    });

    res.status(200).json({
      success: true,
      page: parseInt(page, 10),
      perPage: limit,
      total,
      totalPages: Math.ceil(total / limit),
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
      limit,
      perPage
    } = req.query;

    const pageSize = Number(perPage || limit || 10);
    const offset = (page - 1) * pageSize;

    // Filters on invoice table
    const invoiceWhere = {};
    if (from_date && to_date) {
      invoiceWhere.invoice_date = {
        [db.Sequelize.Op.between]: [from_date, to_date],
      };
    }
    if (supplier_id) invoiceWhere.supplier_id = supplier_id;
    if (store_id) invoiceWhere.store_id = store_id;
    if (invoice_no) invoiceWhere.invoice_no = invoice_no;

    const itemWhere = {};
    if (item_id) itemWhere.item_id = item_id;

    // 1️⃣ Count total item rows
    const total = await PurchaseItems.count({
      where: itemWhere,
      include: [
        {
          model: PurchaseInvoice,
          as: "purchaseInvoice",
          where: invoiceWhere,
        },
      ],
    });

    // 2️⃣ Fetch paginated item rows
    const rows = await PurchaseItems.findAll({
      where: itemWhere,
      include: [
        {
          model: PurchaseInvoice,
          as: "purchaseInvoice",
          where: invoiceWhere,
          include: [
            {
              model: Supplier,
              as: "supplier",
              attributes: ["supplier_name", "phone", "email"],
            },
            {
              model: Store,
              as: "store",
              attributes: ["store_name", "phone", "email"],
            },
          ],
        },
        {
          model: Item,
          as: "item",
          attributes: ["name", "hsn_id"],
          include: [
            {
              model: HSN,
              as: "hsn",
              attributes: ["hsn_code"],
            },
          ],
        },
      ],
      order: [["purchase_item_id", "DESC"]],
      limit: pageSize,
      offset,
    });

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      perPage: pageSize,
      totalPages: Math.ceil(total / pageSize),
      data: rows,
    });

  } catch (error) {
    console.error("Purchase Report Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.getPurchaseItems = async (req, res) => {
  try {
    const data = await PurchaseItems.findAll({
      include: [
        {
          model: PurchaseInvoice,
          as: "purchaseInvoice",
          attributes: ["invoice_no"],
        },
      ],
    });
    res.json(data);
  } catch (error) {
    console.error("Error fetching purchase items:", error);
    res.status(500).json({ message: "Error fetching purchase items" });
  }
};



exports.getItemsByPurchaseId = async (req, res) => {
  try {
    const { purchase_id } = req.query;

    if (!purchase_id) {
      return res.status(400).json({
        success: false,
        message: "purchase_id is required",
      });
    }

    const items = await PurchaseItems.findAll({
      where: {
        purchase_id,
      },
      include: [
        {
          model: Item,
          as: "item",
          // attributes: ["name"], 

          include: [
            {
              model: HSN,
              as: "hsn",
              attributes: ["hsn_code"]
            }
          ]
          
        },
          {
            model:PurchaseInvoice,
            as:"purchaseInvoice"
          }
      
        
       
      ],
      order: [["purchase_item_id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error getting items by purchase_id:", error);
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
