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
          attributes: ["item_id", "name"],
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

