const express = require('express');
const { getAllHSNs, createHSN, getHSNById, updateHSN, deleteHSN } = require('../controllers/hsnController');

const hsnRouter = express.Router();

// Define your HSN routes here
hsnRouter.post('/',createHSN);
hsnRouter.get('/',getAllHSNs)
hsnRouter.get('/:id',getHSNById);
hsnRouter.put('/:id',updateHSN);
hsnRouter.delete('/:id',deleteHSN);


module.exports = hsnRouter;