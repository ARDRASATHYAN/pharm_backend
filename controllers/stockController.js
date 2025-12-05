const db = require('../models');
const { StoreStock } = db; 
const { Op } = require("sequelize");

// Controller: getAllStocks with pagination
exports.getAllStocks = async (req, res) => {
  try {
    // Get page and limit from query params, default to page 1 and 10 items per page
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    // Fetch paginated data
    const { count, rows } = await StoreStock.findAndCountAll({
      offset,
      limit,
      order: [['stock_id', 'ASC']], // optional ordering
    });

    res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching Stocks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

