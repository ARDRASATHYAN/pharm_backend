'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('damaged_stock', {
      damaged_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stores',       // table name
          key: 'store_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'items_master',   // table name
          key: 'item_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      batch_no: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      entry_date: {
        type: Sequelize.DATE,
        allowNull: true
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',         // table name
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('damaged_stock');
  }
};
