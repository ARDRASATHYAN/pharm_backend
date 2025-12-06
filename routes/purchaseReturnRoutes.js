const express = require('express');
const { createPurchaseReturn, getPurchaseReturn } = require('../controllers/purchaseReturnController');


const purchaseReturnRouter = express.Router();

// Define your Supplier routes here
purchaseReturnRouter.post('/', createPurchaseReturn);
purchaseReturnRouter.get('/purchase-return', getPurchaseReturn);
// purchaseRouter.post('/', createPurchase);
// purchaseRouter.get('/invoice', getAllInvoices);


 
module.exports = purchaseReturnRouter;