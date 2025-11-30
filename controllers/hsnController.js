const db = require('../models'); // ← points to models/index.js
const { HSN } = db; 
const { Op } = require("sequelize");

// create hsn
exports.createHSN = async (req, res) => {
  try {
    const { hsn_code, description, gst_percent } = req.body;
    if (!hsn_code) {
      return res.status(400).json({ message: 'HSN code is required' });
    }
    const existingHSN = await HSN.findOne({ where: { hsn_code } });
    if (existingHSN) {
      return res.status(409).json({ message: 'HSN code already exists' });
    }

    const newHSN = await HSN.create({
      hsn_code,
      description,      
        gst_percent:gst_percent ?? 0,
    });
    res.status(201).json({ message: 'HSN created successfully', data: newHSN });
  } catch (error) {
    console.error('Error creating HSN:', error);
    res.status(500).json({ message: 'Internal server error' });
  } 
};


// get all hsns
exports.getAllHSNs = async (req, res) => {
  try {
    const hsnList = await HSN.findAll();
    res.status(200).json({ data: hsnList });
  } catch (error) {
    console.error('Error fetching HSNs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};  


// get hsn by id
exports.getHSNById = async (req, res) => {
  try {
    const { id } = req.params;
    const hsn = await HSN.findByPk(id);
    if (!hsn) {
        return res.status(404).json({ message: 'HSN not found' });
    }
    res.status(200).json({ data: hsn });
  } catch (error) {
    console.error('Error fetching HSN by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  } 
};

// update hsn
exports.updateHSN = async (req, res) => {
  try {
    const { id } = req.params;
    const { hsn_code, description, gst_percent } = req.body;
    const hsn = await HSN.findByPk(id);
    if (!hsn) {
        return res.status(404).json({ message: 'HSN not found' });
    }
    if (hsn_code) {
      const duplicate = await HSN.findOne({
        where: {
          hsn_code,
          hsn_id: { [Op.ne]: id }, 
        },
      });

      if (duplicate) {
        return res.status(409).json({ message: "HSN code already exists" });
      }

      hsn.hsn_code = hsn_code;
    }

    if (description !== undefined) hsn.description = description;
    if (gst_percent !== undefined) hsn.gst_percent = gst_percent;   
    await hsn.save();
    res.status(200).json({ message: 'HSN updated successfully', data: hsn });
  } catch (error) {
    console.error('Error updating HSN:', error);
    res.status(500).json({ message: 'Internal server error' });
  } 
};


// delete hsn
exports.deleteHSN = async (req, res) => {
  try {
    const { id } = req.params;  
    const hsn = await HSN.findByPk(id);
    if (!hsn) {
        return res.status(404).json({ message: 'HSN not found' });
    }
    await hsn.destroy();
    res.status(200).json({ message: 'HSN deleted successfully' });
    } catch (error) {
    console.error('Error deleting HSN:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};