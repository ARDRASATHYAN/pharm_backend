const express = require('express');
const { createStore, getAllStores } = require('../controllers/storeController');


const storeRouter = express.Router();


// Routes

storeRouter.post('/', createStore);
storeRouter.get('/', getAllStores);
// storeRouter.delete('/:id', deleteStore);

module.exports = storeRouter;