'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('excess_stock', {
      excess_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'store_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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
        allowNull: false,
      },

      qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      entry_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('excess_stock');
  },
};
