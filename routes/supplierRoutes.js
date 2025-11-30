const express = require('express');
const { createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const supplierRouter = express.Router();


// Define your Supplier routes here
supplierRouter.post('/', createSupplier);
supplierRouter.get('/', getAllSuppliers);                   
supplierRouter.get('/:id', getSupplierById);
supplierRouter.put('/:id', updateSupplier);
supplierRouter.delete('/:id', deleteSupplier);

module.exports = supplierRouter;