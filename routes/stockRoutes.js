const express = require('express');
const { getAllStocks, getStoreStockByStoreAndItem } = require('../controllers/stockController');
const stockRouter = express.Router();


// Define your Stock routes here

stockRouter.get('/',getAllStocks);
stockRouter.get("/store-stock", getStoreStockByStoreAndItem);


module.exports = stockRouter;

