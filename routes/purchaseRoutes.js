const express = require('express');
const { createPurchase } = require('../controllers/purchaseController');

const purchaseRouter = express.Router();

// Define your Supplier routes here
purchaseRouter.post('/', createPurchase);

 
module.exports = purchaseRouter;