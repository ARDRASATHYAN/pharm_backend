const express=require('express');
const { createSales, getAllSalesInvoice, getItemsBySalesId, getTotalCustomers, getTotalSalesNetAmount, getTodaySalesNetAmount } = require('../controllers/salesController');
const saleRouter=express.Router()

saleRouter.post("/",createSales);
saleRouter.get("/",getAllSalesInvoice)
saleRouter.get("/saleid-item", getItemsBySalesId);
saleRouter.get("/sale-customer", getTotalCustomers);
saleRouter.get("/total-sales", getTotalSalesNetAmount);
saleRouter.get("/today-sales", getTodaySalesNetAmount);

module.exports=saleRouter