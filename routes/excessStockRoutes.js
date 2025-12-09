const express=require("express")
const { createExcessItem, getAllExcessItem } = require("../controllers/excessStockController")

const excessStockRouter= express.Router()

excessStockRouter.post("/",createExcessItem);
excessStockRouter.get("/",getAllExcessItem)


module.exports=excessStockRouter;