'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('customers', {
      customer_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      address: Sequelize.TEXT,
      gst_no: Sequelize.STRING(20),
      phone: Sequelize.STRING(20),
      email: Sequelize.STRING(100),
      doctor_name: Sequelize.STRING(100),
      prescription_no: Sequelize.STRING(50),
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('customers');
  }
};
