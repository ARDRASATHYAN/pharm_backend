const express=require('express');
const { createSales } = require('../controllers/salesController');
const saleRouter=express.Router()

saleRouter.post("/",createSales);

module.exports=saleRouter