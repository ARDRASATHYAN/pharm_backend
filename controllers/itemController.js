const db = require('../models'); // ← points to models/index.js
const { Item, HSN, DrugSchedule } = db; 
const { Op } = require("sequelize");

exports.createItem = async (req, res) => {
  try {
    const {
      sku,
      barcode,
      name,
      brand,
      generic_name,
      manufacturer,
      hsn_id,
      pack_size,
      schedule_id,
      description,
      item_type,
    } = req.body;

    if (!sku || !name) {
      return res.status(400).json({ message: 'SKU and Name are required' });
    }

    // Duplicate SKU check
    const existingSKU = await Item.findOne({ where: { sku } });
    if (existingSKU) {
      return res.status(409).json({ message: 'Item with this SKU already exists' });
    }

    // Duplicate barcode check
    if (barcode) {
      const existingBarcode = await Item.findOne({ where: { barcode } });
      if (existingBarcode) {
        return res.status(409).json({ message: 'Item with this barcode already exists' });
      }
    }

    const newItem = await Item.create({
      sku,
      barcode: barcode || null,
      name,
      pack_size:pack_size||null,
      brand: brand || null,
      generic_name: generic_name || null,
      manufacturer: manufacturer || null,
      hsn_id: hsn_id || null,
      schedule_id: schedule_id || null,
      description: description || null,
      item_type: item_type || "Medicine",
    });

    return res.status(201).json({
      message: 'Item created successfully',
      data: newItem,
    });

  } catch (error) {
    console.error('Error creating Item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// get all items with optional search by name or sku
exports.getAllItems = async (req, res) => {
  try {
    let {
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Fetch with pagination
    const { rows: itemList, count } = await Item.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: HSN, as: "hsn" },
        { model: DrugSchedule, as: "schedule" },
      ],
      order: [["created_at", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      data: itemList,
      total: count,
      page,
      perPage: limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching Items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// get item by id
exports.getItemById = async (req, res) => {
    try {   
    const { id } = req.params;
    const item = await req.db.Item.findByPk(id, {
        include: [
            { model:HSN, as: 'hsn' },
            { model:DrugSchedule, as: 'schedule' },
        ],
    });
    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }   
    res.status(200).json({ data: item });
    } catch (error) {
    console.error('Error fetching Item by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
    }   
};

// update item
exports.updateItem = async (req, res) => {
    try {
    const { id } = req.params;
    const {
      sku,  
        barcode,
        name,
        brand,
        generic_name,   
        manufacturer,
        hsn_id,
        pack_size,
        schedule_id,
        description,
        item_type,
    } = req.body;
    const item = await Item.findByPk(id);    
    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }
    if (sku) {
      const existingSKU = await Item.findOne({
        where: {
            sku,    
            item_id: { [Op.ne]: id },
        },
      });   
        if (existingSKU) {
        return res.status(409).json({ message: 'Item with this SKU already exists' });
        }
        item.sku = sku;

    }
    if (barcode) {
        const existingBarcode = await Item.findOne({ 
        where: {
            barcode,
            item_id: { [Op.ne]: id },
        },
        });
        if (existingBarcode) {
        return res.status(409).json({ message: 'Item with this barcode already exists' });
        }
        item.barcode = barcode;
    }   
    if (name !== undefined) item.name = name;
    if (brand !== undefined) item.brand = brand;
    if (generic_name !== undefined) item.generic_name = generic_name;
    if (manufacturer !== undefined) item.manufacturer = manufacturer;
    if (hsn_id !== undefined) item.hsn_id = hsn_id;
    if (schedule_id !== undefined) item.schedule_id = schedule_id;
    if (description !== undefined) item.description = description;
    if (item_type !== undefined) item.item_type = item_type;
    if(pack_size!==undefined) item.pack_size=pack_size;
    await item.save();
    res.status(200).json({ message: 'Item updated successfully', data: item });
    } catch (error) {
    console.error('Error updating Item:', error);
    res.status(500).json({ message: 'Internal server error' });
    }       
};

// delete item  
exports.deleteItem = async (req, res) => {
    try {
    const { id } = req.params;  
    const item = await Item.findByPk(id);    
    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }   
    await item.destroy();    
    res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
    console.error('Error deleting Item:', error);
    res.status(500).json({ message: 'Internal server error' });
    }       
};
    