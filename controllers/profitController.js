const { Op } = require('sequelize');
const db = require('../models');
const { SalesItems, SalesInvoices, Item, StoreStock } = db;

exports.getProfitMarginReport = async (req, res) => {
  try {
   const { store_id, from_date, to_date } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    // Filter for invoices
    const invoiceWhere = {};
    if (store_id) invoiceWhere.store_id = store_id;
    if (from_date && to_date) invoiceWhere.bill_date = { [Op.between]: [from_date, to_date] };

    // Fetch SalesItems with invoice and item info
    const { rows, count } = await SalesItems.findAndCountAll({
      include: [
        { model: SalesInvoices, as: 'invoice', attributes: ['bill_no', 'bill_date', 'store_id'], where: invoiceWhere },
        { model: Item, as: 'item', attributes: ['name'] },
      ],
      limit: Number(limit),
      offset,
      order: [['sale_item_id', 'DESC']],
    });

    // Map each row to calculate cost, profit, margin
   const data = await Promise.all(rows.map(async (row) => {
  const stock = await StoreStock.findOne({
    where: {
      item_id: row.item_id,
      batch_no: row.batch_no,
      store_id: row.invoice.store_id,
    },
  });

  const cost_price = stock ? parseFloat(stock.cost_price) : 0;
  const sale_value = parseFloat(row.qty) * parseFloat(row.rate);
  const cost_value = parseFloat(row.qty) * cost_price;
  const profit_value = sale_value - cost_value;
  const margin_percent = sale_value ? ((profit_value / sale_value) * 100) : 0;

  return {
    sale_item_id: row.sale_item_id,
    item_name: row.item.name,
    batch_no: row.batch_no,
    qty: parseFloat(row.qty).toFixed(2),
    sale_rate: parseFloat(row.rate).toFixed(2),
    sale_value: sale_value.toFixed(2),
    cost_price: cost_price.toFixed(2),
    cost_value: cost_value.toFixed(2),
    profit_value: profit_value.toFixed(2),
    margin_percent: margin_percent.toFixed(2),
    invoice: row.invoice,
  };
}));


    return res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profit report',
      error: error.message,
    });
  }
};
