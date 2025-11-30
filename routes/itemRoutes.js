const express = require('express'); 
const { createItem, getAllItems, getItemById, updateItem, deleteItem } = require('../controllers/itemController');
const { col } = require('sequelize');
const itemRouter = express.Router();
// Define your Item routes here
itemRouter.post('/', createItem);
itemRouter.get('/',getAllItems);
itemRouter.get('/:id',getItemById);
itemRouter.put('/:id',updateItem);
itemRouter.delete('/:id',deleteItem)

module.exports = itemRouter;