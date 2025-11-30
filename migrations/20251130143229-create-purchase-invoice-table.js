'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('purchase_invoices', {
      purchase_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      invoice_no: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      invoice_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.DECIMAL(12,2),
        allowNull: false,
        defaultValue: 0,
      },
      total_gst: {
        type: Sequelize.DECIMAL(12,2),
        allowNull: false,
        defaultValue: 0,
      },
      total_discount: {
        type: Sequelize.DECIMAL(12,2),
        allowNull: false,
        defaultValue: 0,
      },
      net_amount: {
        type: Sequelize.DECIMAL(12,2),
        allowNull: false,
        defaultValue: 0,
      },
      store_id: {
        type: Sequelize.INTEGER,
        references: { model: 'stores', key: 'store_id' },
        onDelete: 'SET NULL',
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        references: { model: 'suppliers', key: 'supplier_id' },
        onDelete: 'SET NULL',
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'user_id' },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('purchase_invoices');
  }
};
