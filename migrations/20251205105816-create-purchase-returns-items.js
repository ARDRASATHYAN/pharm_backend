'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('purchase_return_items', {
      return_item_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      return_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_returns',
          key: 'return_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'items_master',
          key: 'item_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      batch_no: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('purchase_return_items');
  },
};
