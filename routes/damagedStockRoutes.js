const express =require("express")
const { createDamageStock, getAllDamagedStockItem } = require("../controllers/damagedStockController")

const damagedRouter=express.Router()

damagedRouter.post ('/',createDamageStock)
damagedRouter.get ('/',getAllDamagedStockItem)

module.exports=damagedRouter
