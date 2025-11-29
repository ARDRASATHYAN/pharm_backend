const { Op } = require('sequelize');
const { User } = require('../models');


//create user
exports.register = async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;

        if (!username || !password)
            return res.status(400).json({ message: 'Username and password required' });

        const existing = await User.findOne({ where: { username } });
        if (existing) return res.status(409).json({ message: 'Username already exists' });

        const user = await User.create({ username, password_hash: password, full_name, role });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                user_id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                is_active: user.is_active
            }
        });
    } catch (err) {
        console.error('register error', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


/*get all user with search like username and fullname and filters status,role also,
default 10 data at one api call*/
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { full_name: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) where.role = role;
    if (status) where.is_active = status.toLowerCase() === 'active';

    const offset = (page - 1) * limit;

    const { rows: users, count } = await User.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['user_id', 'ASC']],
      attributes: { exclude: ['password_hash'] },
    });
    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      total: count,
      totalPages,
      page: parseInt(page),
      perPage: parseInt(limit),
      users
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


/* get user by id */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params; // user_id from URL

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }, // never send password
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (err) {
    console.error('getUserById error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


/* update user by id*/ 
exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, is_active, password } = req.body;


    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields only if they are sent
    if (full_name !== undefined) user.full_name = full_name;
    if (role !== undefined) user.role = role;
    if (is_active !== undefined) user.is_active = is_active; // true/false

    if (password) {
      user.password_hash = password; 
    }

    await user.save(); 

   
    res.json({
      message: 'User updated successfully',
      user: {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    });

  } catch (err) {
    console.error('updateUserById error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* delete user by id*/ 
exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error('deleteUserById error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


