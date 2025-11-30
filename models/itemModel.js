'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Item = sequelize.define(
    'Item',
    {
      item_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      barcode: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      brand: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      generic_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      manufacturer: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      hsn_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'hsn_master',
          key: 'hsn_id',
        },
      },
      schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'drug_schedule_master',
          key: 'schedule_id',
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      item_type: {
        type: DataTypes.ENUM('Medicine', 'OTC', 'Consumable', 'Accessory', 'Other'),
        defaultValue: 'Medicine',
      },
      pack_size: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
      },
    },
    {
      tableName: 'items_master',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  // Correct Sequelize v6 Association Method
  Item.associate = (db) => {
    Item.belongsTo(db.HSN, {
      foreignKey: 'hsn_id',
      as: 'hsn',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    Item.belongsTo(db.DrugSchedule, {
      foreignKey: 'schedule_id',
      as: 'schedule',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  };

  return Item;
};
