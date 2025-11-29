const { Store } = require('../models');

/* create store*/ 
exports.createStore = async (req, res) => {
  try {
    const {
      store_name,
      address,
      city,
      state,
      gst_no,
      phone,
      email,
    } = req.body;

    if (!store_name) {
      return res.status(400).json({ message: 'Store name is required' });
    }

    if (gst_no) {
      const existingGst = await Store.findOne({ where: { gst_no } });
      if (existingGst) {
        return res.status(409).json({ message: 'GST number already exists' });
      }
    }

    const store = await Store.create({
      store_name,
      address,
      city,
      state,
      gst_no,
      phone,
      email,
    });

    res.status(201).json({
      message: 'Store created successfully',
      store,
    });

  } catch (err) {
    console.error('createStore error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


/* get all store with search storename and city */ 

exports.getAllStores = async (req, res) => {
  try {
    const {
      search,
      city,
      page = 1,
      limit = 10,  
    } = req.query;

    const where = {};

    // Filter by city 
    if (city) {
      where.city = city; // or use Op.like if you want partial
      // where.city = { [Op.like]: `%${city}%` };
    }

    if (search) {
      where[Op.or] = [
        { store_name: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { rows: stores, count } = await Store.findAndCountAll({
      where,
      offset,
      limit: limitNum,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      total: count,
      totalPages,
      page: pageNum,
      perPage: limitNum,
      stores,
    });

  } catch (err) {
    console.error('getAllStores error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// get store by id
exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({ store });

  } catch (err) {
    console.error('getStoreById error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// update store by id
exports.updateStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      store_name,
      address,
      city,
      state,
      gst_no,
      phone,
      email,
    } = req.body;

    const store = await Store.findByPk(id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // If updating GST, check duplicate
    if (gst_no && gst_no !== store.gst_no) {
      const existingGst = await Store.findOne({
        where: {
          gst_no,
          store_id: { [Op.ne]: id },
        },
      });

      if (existingGst) {
        return res.status(409).json({ message: 'GST number already exists' });
      }
    }

    // Update fields 
    if (store_name !== undefined) store.store_name = store_name;
    if (address !== undefined) store.address = address;
    if (city !== undefined) store.city = city;
    if (state !== undefined) store.state = state;
    if (gst_no !== undefined) store.gst_no = gst_no;
    if (phone !== undefined) store.phone = phone;
    if (email !== undefined) store.email = email;

    await store.save();

    res.json({
      message: 'Store updated successfully',
      store,
    });

  } catch (err) {
    console.error('updateStoreById error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// delete by id
exports.deleteStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Hard delete
    await store.destroy();

    res.json({ message: 'Store deleted successfully' });

  } catch (err) {
    console.error('deleteStoreById error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};




