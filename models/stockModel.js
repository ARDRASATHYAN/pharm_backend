'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

  const StoreStock = sequelize.define(
    'StoreStock',
    {
      stock_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'store_id',
        },
      },

      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'items_master',
          key: 'item_id',
        },
      },

      batch_no: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      mrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      purchase_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      sale_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      gst_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      qty_in_stock: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },


      sale_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
      },

      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      tableName: 'store_stock',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['store_id', 'item_id', 'batch_no'],
        },
      ],
    }
  );
  StoreStock.associate = (db) => {
    StoreStock.belongsTo(db.Store, {
      foreignKey: 'store_id',
      as: 'store',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    StoreStock.belongsTo(db.Item, {
      foreignKey: 'item_id',
      as: 'item',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return StoreStock;
};
