'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

  const PurchaseItems = sequelize.define(
    'PurchaseItems',
    {
      purchase_item_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      batch_no: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      free_qty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      purchase_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      mrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      sale_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
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
      p_discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
      },

      p_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },

      scheme_discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
      },

      scheme_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },

      taxable_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },

      gst_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },

      cgst: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },

      sgst: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },

      igst: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },

      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },

      purchase_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'purchase_invoices',
          key: 'purchase_id',
        },
        onDelete: 'CASCADE',
      },

      item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'items_master',
          key: 'item_id',
        },
        onDelete: 'SET NULL',
      },
    },
    {
      tableName: 'purchase_items',
      timestamps: false,
    }
  );

  PurchaseItems.associate = (db) => {
    PurchaseItems.belongsTo(db.PurchaseInvoice, {
      foreignKey: 'purchase_id',
      as: 'purchaseInvoice',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    PurchaseItems.belongsTo(db.Item, {
      foreignKey: 'item_id',
      as: 'item',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  };

  return PurchaseItems;
};
