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

