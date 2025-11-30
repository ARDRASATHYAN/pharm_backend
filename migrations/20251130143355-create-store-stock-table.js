'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('store_stock', {
      stock_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      store_id: {
        type: Sequelize.INTEGER,
        references: { model: 'stores', key: 'store_id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      item_id: {
        type: Sequelize.INTEGER,
        references: { model: 'items_master', key: 'item_id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      batch_no: Sequelize.STRING(100),
      expiry_date: Sequelize.DATEONLY,
      mrp: Sequelize.DECIMAL(10,2),
      purchase_rate: Sequelize.DECIMAL(10,2),
      sale_rate: Sequelize.DECIMAL(10,2),
      gst_percent: Sequelize.DECIMAL(5,2),
      qty_in_stock: { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('store_stock', ['store_id','item_id','batch_no'], { unique: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('store_stock');
  }
};
