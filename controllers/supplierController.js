const db = require('../models'); // ← points to models/index.js
const { Supplier, Sequelize } = db; // destructure the models you need
const { Op } = Sequelize;


exports.createSupplier = async (req, res) => {
    try {
        const { supplier_name, address, gst_no, phone, email, state } = req.body;
        if (!supplier_name) {
            return res.status(400).json({ message: 'Supplier name is required' });
        }

        if (gst_no) {
            const gstExists = await Supplier.findOne({ where: { gst_no } });
            if (gstExists) {
                return res.status(409).json({ message: "Supplier with this GST number already exists" });
            }
            if (gst_no.length !== 15) {
                return res.status(400).json({ message: "GST number must be 15 characters" });
            }
        }

       
        if (email) {
            const emailExists = await Supplier.findOne({ where: { email } });
            if (emailExists) {
                return res.status(409).json({ message: "Supplier with this email already exists" });
            }
        }
        const newSupplier = await Supplier.create({
            supplier_name,
            address: address || null,
            gst_no: gst_no || null,
            phone: phone || null,
            email: email || null,
            state: state || null,
        });
        res.status(201).json({ message: 'Supplier created successfully', data: newSupplier });
    } catch (error) {
        console.error('Error creating Supplier:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// get all suppliers

exports.getAllSuppliers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { contact_person: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { rows: supplierList, count } = await Supplier.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      data: supplierList,
      total: count,
      page,
      perPage: limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching Suppliers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// get supplier by id
exports.getSupplierById = async (req, res) => {
  try {       
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);    
    if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json({ data: supplier });
  } catch (error) {
    console.error('Error fetching Supplier by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }       
};

// update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, address, gst_no, phone, email, state } = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    // Duplicate GST check
    if (gst_no) {
      const gstExists = await Supplier.findOne({
        where: { gst_no, supplier_id: { [Op.ne]: id } }
      });
      if (gstExists) return res.status(409).json({ message: "GST number already used by another supplier" });
      if (gst_no.length !== 15) return res.status(400).json({ message: "GST number must be 15 characters" });
    }

    // Duplicate Email check
    if (email) {
      const emailExists = await Supplier.findOne({
        where: { email, supplier_id: { [Op.ne]: id } }
      });
      if (emailExists) return res.status(409).json({ message: "Email already used by another supplier" });
    }

    await supplier.update({ supplier_name, address, gst_no, phone, email, state });
    res.status(200).json({ message: "Supplier updated successfully", data: supplier });
  } catch (error) {
    console.error("Error updating Supplier:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    await supplier.destroy();
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting Supplier:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.totalSuppliers = async (req, res) => {
  try {
    const total = await Supplier.count(); // counts all suppliers
    return res.status(200).json({ total });
  } catch (error) {
    console.error("Error fetching total suppliers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
