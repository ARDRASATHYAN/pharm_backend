const db = require('../models');
const { StoreStock } = db; 
const { Op } = require("sequelize");

exports.getAllStocks = async (req, res) => {
  try {
    const stockList = await StoreStock.findAll();    
    res.status(200).json({ data: stockList });
  } catch (error) {
    console.error('Error fetching Stocks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }       
};
