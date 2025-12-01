const db = require('../models'); 
const { StoreStock } = db;

async function addStock({ store_id, item_id, batch_no = null, qty = 0, mrp = null, purchase_rate = null, sale_rate = null, gst_percent = null, expiry_date = null }, transaction) {
  const stock = await StoreStock.findOne({
    where: { store_id, item_id, batch_no },
    transaction,
  });

  if (stock) {
    await stock.update(
      {
        qty_in_stock: Number(stock.qty_in_stock || 0) + qty,
        mrp: mrp ?? stock.mrp,
        purchase_rate: purchase_rate ?? stock.purchase_rate,
        sale_rate: sale_rate ?? stock.sale_rate,
        gst_percent: gst_percent ?? stock.gst_percent,
        expiry_date: expiry_date ?? stock.expiry_date,
      },
      { transaction }
    );
  } else {
    await StoreStock.create(
      {
        store_id,
        item_id,
        batch_no,
        expiry_date,
        mrp,
        purchase_rate,
        sale_rate,
        gst_percent,
        qty_in_stock: qty,
      },
      { transaction }
    );
  }
}

async function removeStock({ store_id, item_id, batch_no = null, qty = 0 }, transaction) {
  const stock = await StoreStock.findOne({
    where: { store_id, item_id, batch_no },
    transaction,
  });

  if (!stock) throw new Error(`Stock not found for item_id ${item_id}`);

  const newQty = Number(stock.qty_in_stock || 0) - qty;
  if (newQty < 0) throw new Error(`Not enough stock for item_id ${item_id}`);

  await stock.update({ qty_in_stock: newQty }, { transaction });
}

module.exports = { addStock, removeStock };
