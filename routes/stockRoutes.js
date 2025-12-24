const express = require('express');
const { getAllStocks, getStoreStockByStoreAndItem, getBatchBaseItemLowStock, getExpiringBatches } = require('../controllers/stockController');
const stockRouter = express.Router();


// Define your Stock routes here

stockRouter.get('/',getAllStocks);
stockRouter.get("/store-stock", getStoreStockByStoreAndItem);
stockRouter.get('/low-stock',getBatchBaseItemLowStock);
stockRouter.get('/expiring-stock',getExpiringBatches );


module.exports = stockRouter;

