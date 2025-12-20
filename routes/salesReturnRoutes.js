const express = require('express');
const { createSalesReturn, getAllSaleReturn, getSaleReturnItems } = require('../controllers/salesReturnController');


const salesReturnRouter = express.Router();

// Define your Supplier routes here
salesReturnRouter.post('/', createSalesReturn);
salesReturnRouter.get('/', getAllSaleReturn);
salesReturnRouter.get('/item', getSaleReturnItems);


 
module.exports = salesReturnRouter;