const express = require('express');
const { getAllStocks, getStoreStockByStoreAndItem, getBatchBaseItemLowStock, getExpiringBatches, totalMedicines, getCurrentStockReport, getOutOfStockItems } = require('../controllers/stockController');
const stockRouter = express.Router();


// Define your Stock routes here

stockRouter.get('/',getAllStocks);
stockRouter.get("/store-stock", getStoreStockByStoreAndItem);
stockRouter.get('/low-stock',getBatchBaseItemLowStock);
stockRouter.get('/expiring-stock',getExpiringBatches );
stockRouter.get('/total-stock-medicine',totalMedicines );
stockRouter.get('/current-stock',getCurrentStockReport );
stockRouter.get('/outoff-stock',getOutOfStockItems );


module.exports = stockRouter;

