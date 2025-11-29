'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [];
    const roles = ['Admin','Manager','Pharmacist','Billing','StoreKeeper'];

    for (let i = 1; i <= 40; i++) {
      const passwordHash = await bcrypt.hash('Password123', 10); // same password for all
      users.push({
        username: `user${i}`,
        password_hash: passwordHash,
        full_name: `User ${i}`,
        role: roles[i % roles.length],
        is_active: i % 5 === 0 ? false : true, // every 5th user inactive
        created_at: new Date()
      });
    }

    await queryInterface.bulkInsert('users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
