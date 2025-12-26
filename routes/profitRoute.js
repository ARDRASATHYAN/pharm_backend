const express = require('express');
const { getProfitMarginReport } = require('../controllers/profitController');

const profitRouter = express.Router();


// Define your Stock routes here

profitRouter.get('/',getProfitMarginReport);


module.exports = profitRouter;

