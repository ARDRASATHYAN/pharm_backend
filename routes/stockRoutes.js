const express = require('express');
const { getAllStocks } = require('../controllers/stockController');
const stockRouter = express.Router();


// Define your Stock routes here

stockRouter.get('/',getAllStocks);


module.exports = stockRouter;

