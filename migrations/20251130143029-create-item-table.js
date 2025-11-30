'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('items_master', {
      item_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      barcode: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      generic_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      manufacturer: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      hsn_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'hsn_master',
          key: 'hsn_id',
        },
        onDelete: 'SET NULL',
      },
      schedule_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'drug_schedule_master',
          key: 'schedule_id',
        },
        onDelete: 'SET NULL',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      item_type: {
        type: Sequelize.ENUM('Medicine','OTC','Consumable','Accessory','Other'),
        defaultValue: 'Medicine',
      },
      pack_size: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: 1,
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
    await queryInterface.dropTable('items_master');
  },
};
