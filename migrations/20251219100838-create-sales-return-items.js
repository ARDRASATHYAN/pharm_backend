'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales_return_items', {
      return_item_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      return_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sales_returns',
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
        onDelete: 'RESTRICT',
      },

      batch_no: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      taxable_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      gst_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },

      gst_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sales_return_items');
  },
};
