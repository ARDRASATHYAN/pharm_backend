'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('suppliers', {
      supplier_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      supplier_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
      },
      state: {
        type: Sequelize.STRING(100),
      },
      gst_no: {
        type: Sequelize.STRING(20),
      },
      phone: {
        type: Sequelize.STRING(20),
      },
      email: {
        type: Sequelize.STRING(100),
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('suppliers');
  }
};
