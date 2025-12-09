const express=require('express');
const { createSales, getAllSalesInvoice } = require('../controllers/salesController');
const saleRouter=express.Router()

saleRouter.post("/",createSales);
saleRouter.get("/",getAllSalesInvoice)
module.exports=saleRouter