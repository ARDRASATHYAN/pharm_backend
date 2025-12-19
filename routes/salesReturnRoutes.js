const express = require('express');
const { createSalesReturn } = require('../controllers/salesReturnController');


const salesReturnRouter = express.Router();

// Define your Supplier routes here
salesReturnRouter.post('/', createSalesReturn);
// salesReturnRouter.get('/purchase-return', getPurchaseReturn);
// purchaseRouter.post('/', createPurchase);
// purchaseRouter.get('/invoice', getAllInvoices);


 
module.exports = salesReturnRouter;