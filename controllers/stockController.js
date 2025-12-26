const db = require('../models');
const { StoreStock ,Item} = db; 
const { Op } = require("sequelize");

// Controller: getAllStocks with pagination
exports.getAllStocks = async (req, res) => {
  try {
    // Get page and limit from query params, default to page 1 and 10 items per page
   let { page = 1, perPage = 10 } = req.query; // use perPage
page = parseInt(page);
perPage = parseInt(perPage);

const offset = (page - 1) * perPage;

const { count, rows } = await StoreStock.findAndCountAll({
  offset,
  limit: perPage, // use perPage
  order: [['stock_id', 'ASC']],
    include: [
        {
          model: Item,
          as: "item",
          // attributes: ["item_id", "name"],
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
    console.error('Error fetching Stocks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getStoreStockByStoreAndItem = async (req, res) => {
  try {
    const { store_id, item_id } = req.query;

    if (!store_id) {
      return res.status(400).json({ message: "store_id is required" });
    }

    const where = { store_id };

    if (item_id) {
      where.item_id = item_id;
    }

    const data = await StoreStock.findAll({ where });
    res.json(data);
  } catch (err) {
    console.error("Error fetching store stock:", err);
    res.status(500).json({ message: "Error fetching store stock" });
  }
};


exports.getBatchBaseItemLowStock = async (req, res) => {
  try {
    let { limit = 10, store_id } = req.query;
    limit = parseFloat(limit);

    const whereCondition = {
      qty_in_stock: {
        [Op.lte]: limit,   // 🔥 THIS IS THE KEY
      },
    };

    if (store_id) {
      whereCondition.store_id = store_id;
    }

    // 1️⃣ FETCH ONLY LOW-STOCK BATCHES
    const lowBatches = await StoreStock.findAll({
      where: whereCondition,
      include: [
        {
          model: Item,
          as: "item",
          attributes: ["item_id", "name"],
        },
      ],
      order: [["qty_in_stock", "ASC"]],
    });

    // 2️⃣ GROUP BY ITEM
    const itemsMap = {};

    for (const row of lowBatches) {
      const itemId = row.item_id;

      if (!itemsMap[itemId]) {
        itemsMap[itemId] = {
          item_id: itemId,
          item_name: row.item.name,
          batches: [],
        };
      }

      itemsMap[itemId].batches.push({
        stock_id: row.stock_id,
        batch_no: row.batch_no,
        expiry_date: row.expiry_date,
        qty_in_stock: row.qty_in_stock,
        mrp: row.mrp,
      });
    }

    res.status(200).json({
      data: Object.values(itemsMap),
      lowStockLimit: limit,
    });
  } catch (error) {
    console.error("Low stock error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getExpiringBatches = async (req, res) => {
  try {
    let { store_id, days = 30 } = req.query;
    days = parseInt(days);

    const today = new Date();
    const expiryLimit = new Date();
    expiryLimit.setDate(today.getDate() + days);

    const whereCondition = {
      expiry_date: { [Op.lte]: expiryLimit },
    };

    if (store_id) whereCondition.store_id = store_id;

    const expiringBatches = await StoreStock.findAll({
      where: whereCondition,
      include: [
        { model: Item, as: "item", attributes: ["item_id", "name"] },
      ],
      order: [["expiry_date", "ASC"]],
    });

    // Group by item
    const grouped = {};
    expiringBatches.forEach((row) => {
      const itemId = row.item_id;
      if (!grouped[itemId]) {
        grouped[itemId] = {
          item_id: itemId,
          item_name: row.item.name,
          batches: [],
        };
      }
      grouped[itemId].batches.push({
        stock_id: row.stock_id,
        batch_no: row.batch_no,
        expiry_date: row.expiry_date,
        qty_in_stock: row.qty_in_stock,
      });
    });

    res.json({ data: Object.values(grouped) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expiring batches" });
  }
};

exports.totalMedicines = async (req, res) => {
  try {
    const total = await StoreStock.count({
      where: { store_id: 1 }, // optional filter by store
      distinct: true,
      col: "item_id",
    });

    return res.status(200).json({ total });
  } catch (error) {
    console.error("Error fetching total medicines:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


