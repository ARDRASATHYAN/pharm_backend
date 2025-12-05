const express = require('express');
const { createPurchase, getPurchaseReport, getAllInvoices, getPurchaseItems } = require('../controllers/purchaseController');

const purchaseRouter = express.Router();

// Define your Supplier routes here
purchaseRouter.get('/report', getPurchaseReport);
purchaseRouter.post('/', createPurchase);
purchaseRouter.get('/invoice', getAllInvoices);
purchaseRouter.get('/items', getPurchaseItems);



 
module.exports = purchaseRouter;