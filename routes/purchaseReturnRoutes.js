const express = require('express');
const { createPurchaseReturn } = require('../controllers/purchaseReturnController');


const purchaseReturnRouter = express.Router();

// Define your Supplier routes here
purchaseReturnRouter.post('/', createPurchaseReturn);
// purchaseRouter.post('/', createPurchase);
// purchaseRouter.get('/invoice', getAllInvoices);


 
module.exports = purchaseReturnRouter;