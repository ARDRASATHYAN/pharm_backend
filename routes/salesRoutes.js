const express=require('express');
const { createSales, getAllSalesInvoice, getItemsBySalesId } = require('../controllers/salesController');
const saleRouter=express.Router()

saleRouter.post("/",createSales);
saleRouter.get("/",getAllSalesInvoice)
saleRouter.get("/saleid-item", getItemsBySalesId);

module.exports=saleRouter