'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('purchase_items', {
      purchase_item_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      purchase_id: {
        type: Sequelize.INTEGER,
        references: { model: 'purchase_invoices', key: 'purchase_id' },
        onDelete: 'CASCADE',
      },
      item_id: {
        type: Sequelize.INTEGER,
        references: { model: 'items_master', key: 'item_id' },
        onDelete: 'SET NULL',
      },
      batch_no: Sequelize.STRING(100),
      expiry_date: Sequelize.DATEONLY,
      qty: { type: Sequelize.INTEGER, allowNull: false },
      free_qty: { type: Sequelize.INTEGER, defaultValue: 0 },
      purchase_rate: Sequelize.DECIMAL(10,2),
      mrp: Sequelize.DECIMAL(10,2),
      sale_rate: Sequelize.DECIMAL(10,2),
      discount_percent: { type: Sequelize.DECIMAL(5,2), defaultValue: 0 },
      discount_amount: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      scheme_discount_percent: { type: Sequelize.DECIMAL(5,2), defaultValue: 0 },
      scheme_discount_amount: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      taxable_amount: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      gst_percent: Sequelize.DECIMAL(5,2),
      cgst: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      sgst: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      igst: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      total_amount: Sequelize.DECIMAL(12,2),
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('purchase_items');
  }
};
