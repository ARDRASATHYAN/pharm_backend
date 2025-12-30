const db = require('../models');
const { StoreStock, Item, Store } = db;
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




exports.getCurrentStockReport = async (req, res) => {
  try {
    let { store_id, page = 1, perPage = 10, low_stock, near_expiry_days = 90 } = req.query;

    if (!store_id) {
      return res.status(400).json({ success: false, message: 'store_id is required' });
    }
    page = parseInt(page);
    perPage = parseInt(perPage);

    const offset = (page - 1) * perPage;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nearExpiryDate = new Date();
    nearExpiryDate.setDate(today.getDate() + Number(near_expiry_days));

    const REORDER_LEVEL = 10;

    const stockWhere = {
      store_id,
      qty_in_stock: { [Op.gt]: 0 },
      expiry_date: { [Op.gte]: today },
    };

    const { rows, count } = await StoreStock.findAndCountAll({
      where: stockWhere,
      offset,
      limit: perPage,
      include: [
        {
          model: Item,
          as: 'item',// make sure your DB column is correct
          where: { is_active: true },
        },
        {
          model: Store,
          as: 'store',
          attributes: ['store_name'],
        },
      ],
      order: [['expiry_date', 'ASC']],
    });

    const data = rows.map((row) => {
      const qty = Number(row.qty_in_stock);
      const costPrice = Number(row.cost_price);
      const stockValue = qty * costPrice;
      const isLowStock = qty <= REORDER_LEVEL;
      const isNearExpiry = new Date(row.expiry_date) <= nearExpiryDate;
      const isExpired = new Date(row.expiry_date) < today;

      return {
        item_id: row.item.item_id,
        item_name: row.item.name,
        batch_no: row.batch_no,
        expiry_date: row.expiry_date,
        quantity: qty,
        sale_price:row.sale_price,
        cost_price: costPrice.toFixed(2),
        mrp: Number(row.mrp).toFixed(2),
        stock_value: stockValue.toFixed(2),
        low_stock: isLowStock && !isExpired,
        near_expiry: isNearExpiry && !isExpired,
        expired: isExpired,
        store: row.store,
      };
    });

    let filteredData = data;
    if (low_stock === 'true') filteredData = filteredData.filter(d => d.low_stock);

    return res.json({
      success: true,
      data: filteredData,
      pagination: {
        total: count,
        page,
        limit: perPage,
        totalPages: Math.ceil(count / perPage),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current stock report',
      error: error.message,
    });
  }
};


// GET Out of Stock Items
exports.getOutOfStockItems = async (req, res) => {
  try {
    const { store_id, page = 1, perPage = 10 } = req.query;

    if (!store_id) {
      return res.status(400).json({ success: false, message: 'store_id is required' });
    }

    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);
    const offset = (pageNum - 1) * perPageNum;

    // Include items with qty_in_stock = 0
    const stockWhere = {
      store_id,
      qty_in_stock: 0
    };

    const { rows, count } = await StoreStock.findAndCountAll({
      where: stockWhere,
      offset,
      limit: perPageNum,
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['item_id', 'name'],
          where: { is_active: true }
        },
        {
          model: Store,
          as: 'store',
          attributes: ['store_name']
        }
      ],
      order: [['expiry_date', 'ASC']]
    });

    const data = rows.map(row => ({
      item_id: row.item.item_id,
      item_name: row.item.name,
      batch_no: row.batch_no,
      expiry_date: row.expiry_date,
      quantity: Number(row.qty_in_stock),
      cost_price: Number(row.cost_price).toFixed(2),
      mrp: Number(row.mrp).toFixed(2),
      stock_value: (Number(row.qty_in_stock) * Number(row.cost_price)).toFixed(2),
      store: row.store
    }));

    return res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: pageNum,
        limit: perPageNum,
        totalPages: Math.ceil(count / perPageNum)
      }
    });

  } catch (error) {
    console.error('Error fetching out-of-stock items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch out-of-stock items',
      error: error.message
    });
  }
};




