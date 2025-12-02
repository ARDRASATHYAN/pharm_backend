const express = require('express');
const { createPurchase, getPurchaseReport, getAllInvoices } = require('../controllers/purchaseController');

const purchaseRouter = express.Router();

// Define your Supplier routes here
purchaseRouter.get('/report', getPurchaseReport);
purchaseRouter.post('/', createPurchase);
purchaseRouter.get('/invoice', getAllInvoices);


 
module.exports = purchaseRouter;