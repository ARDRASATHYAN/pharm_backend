const express = require('express');
const { createStore, getAllStores, getStoreById, updateStoreById, deleteStoreById } = require('../controllers/storeController');


const storeRouter = express.Router();


// Routes

storeRouter.post('/', createStore);
storeRouter.get('/', getAllStores);
storeRouter.get('/:id', getStoreById);
storeRouter.put('/:id', updateStoreById);
storeRouter.delete('/:id', deleteStoreById);

module.exports = storeRouter;