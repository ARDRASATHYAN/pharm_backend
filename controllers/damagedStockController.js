const { Op } = require('sequelize');
const db = require('../models');
const { removeStock } = require('../utils/StockService');
const { DamagedStock, StoreStock, Store, Item, User } = db;

exports.createDamageStock = async (req, res) => {
   const t = await db.sequelize.transaction();
  const createdRows = [];

  try {
    const { store_id, entry_date, created_by, items = [] } = req.body;

    if (!store_id) return res.status(400).json({ message: "store_id required" });
    if (!created_by) return res.status(400).json({ message: "created_by required" });
    if (!items.length) {
      await t.rollback();
      return res.status(400).json({ message: "At least one damaged item is required" });
    }

    for (const row of items) {
      const { item_id, batch_no, qty, reason } = row;

      if (!item_id || !qty) {
        await t.rollback();
        return res.status(400).json({ message: "Each item must have item_id, batch_no and qty" });
      }

      const qtyNum = Number(qty);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        await t.rollback();
        return res.status(400).json({ message: "qty must be a positive number" });
      }

      // Check existing stock
      const existStockItem = await StoreStock.findOne({
        where: { item_id, store_id, batch_no },
        transaction: t,
      });

      if (!existStockItem) {
        await t.rollback();
        return res.status(400).json({ message: `Item ${item_id} does not exist in stock` });
      }

      if (qtyNum > parseFloat(existStockItem.qty)) {
        await t.rollback();
        return res.status(400).json({ message: `Insufficient quantity in stock for item ${item_id}` });
      }

      // Insert damaged stock
      const newDamagedItem = await DamagedStock.create({
        store_id,
        item_id,
        batch_no,
        qty: qtyNum,
        reason,
        entry_date,
        created_by
      }, { transaction: t });

      createdRows.push(newDamagedItem);

      // Decrease stock
      await removeStock({ store_id, item_id, batch_no, qty: qtyNum, transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      message: "Damaged stock recorded and stock decreased successfully",
      data: createdRows,
    });

  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json({
      message: "internal server error",
      error: err.message
    });
  }
};


exports.getAllDamagedStockItem = async (req, res) => {
    try {
        const where = {}
        const { search = "", page = 1, perpage = 10 } = req.query;

        const limit = parseInt(perpage);
        if (search) {
            where[Op.or] = [
                { batch_no: { [Op.like]: `%${search}%` } }
            ]
        }
        const offset = (page - 1) * limit;
        const { rows: damaged_item, count } = await DamagedStock.findAndCountAll({
            where,
            offset,
            limit,
            order: [['damaged_id', 'ASC']],
            include: [
                { model: db.Store, as: "store", attributes: ["store_name"] },
                { model: db.Item, as: "item", attributes: ["name"] },
                { model: db.User, as: "user", attributes: ["username"] },
            ],
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            total: count,
            totalPages,
            page: parseInt(page),
            perPage: limit,
            damaged_item
        });


    } catch (err) {
        res.status(500).json({
            message: "internal server error"
        })
    }
}
