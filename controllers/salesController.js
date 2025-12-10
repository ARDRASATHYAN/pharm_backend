// controllers/salesController.js
const db = require('../models');
const { removeStock } = require('../utils/StockService');
const { SalesInvoices, SalesItems, Customer } = db;

exports.createSales = async (req, res) => {
    const t = await db.sequelize.transaction();

    try {
        const {
            bill_no,
            bill_date,
            total_amount,
            total_gst,
            total_discount,
            net_amount,
            store_id,
            created_by,
            customer: customerData,
            item = []
        } = req.body;

        // Validation
        if (!bill_no) return res.status(400).json({ message: "Bill number required" });
        if (!customerData?.customer_name) return res.status(400).json({ message: "Customer name required" });
        if (!Array.isArray(item) || item.length === 0) return res.status(400).json({ message: "At least one sale item required" });

        // 1) Create or update customer
        let customer;
        if (customerData.customer_id) {
            await Customer.update(customerData, { where: { customer_id: customerData.customer_id }, transaction: t });
            customer = await Customer.findByPk(customerData.customer_id, { transaction: t });
        } else {
            customer = await Customer.create(customerData, { transaction: t });
        }
        const customer_id = customer.customer_id;

        // 2) Create sales invoice
        const newInvoice = await SalesInvoices.create({
            bill_no,
            bill_date,
            total_amount,
            total_gst,
            total_discount,
            net_amount,
            store_id,
            customer_id,
            created_by
        }, { transaction: t });

        const itemsToInsert = [];

        // 3) Process each item: remove stock & prepare for bulk insert
        for (const it of item) {
            // Remove stock
            await removeStock({
                store_id,
                item_id: it.item_id,
                batch_no: it.batch_no,
                qty: Number(it.qty),
                transaction: t
            });

            // Prepare SalesItems insert
            itemsToInsert.push({
                sale_id: newInvoice.sale_id,
                item_id: Number(it.item_id),
                batch_no: it.batch_no,
                qty: Number(it.qty),
                rate: Number(it.rate),
                gst_percent: Number(it.gst_percent),
                discount_percent: Number(it.discount_percent),
                total_amount: Number(it.total_amount)
            });
        }

        // 4) Bulk insert SalesItems
        await SalesItems.bulkCreate(itemsToInsert, { transaction: t });

        // Commit transaction
        await t.commit();

        return res.status(201).json({
            message: "Sales created successfully",
            data: {
                invoice: newInvoice,
                items: itemsToInsert,
                customer
            }
        });

    } catch (err) {
        await t.rollback();
        console.error("Create Sales Error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};


exports.getAllSalesInvoice = async (req, res) => {
  try {
    let { search = "", page = 1, perpage = 10 } = req.query;

    page = parseInt(page);
    perpage = parseInt(perpage);

    const offset = (page - 1) * perpage;

    const { count, rows } = await SalesInvoices.findAndCountAll({
      offset,
      limit: perpage,
      include: [
        { model: SalesItems, as: "items" },
        { model: Customer, as: "customer" },
      ],
      order: [["sale_id", "DESC"]],
    });

    return res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit: perpage,
        totalPages: Math.ceil(count / perpage),
      },
      message: "Sales invoices fetched successfully",
    });

  } catch (err) {
    console.error("Get All Sales Invoices Error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

