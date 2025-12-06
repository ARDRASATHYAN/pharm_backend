const express = require('express');
const { createPurchase, getPurchaseReport, getAllInvoices, getPurchaseItems, getItemsByPurchaseId } = require('../controllers/purchaseController');

const purchaseRouter = express.Router();

// Define your Supplier routes here
purchaseRouter.get('/report', getPurchaseReport);
purchaseRouter.post('/', createPurchase);
purchaseRouter.get('/invoice', getAllInvoices);
purchaseRouter.get('/items', getPurchaseItems);
purchaseRouter.get("/purchaseid-item", getItemsByPurchaseId);




 
module.exports = purchaseRouter;