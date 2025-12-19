'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SaleReturnItem = sequelize.define('SaleReturnItem', {
    return_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    return_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batch_no: {
      type: DataTypes.STRING(100),
    },
    qty: {
      type: DataTypes.DECIMAL(10, 2),
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
    },

    taxable_amount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    gst_percent: {
      type: DataTypes.DECIMAL(5, 2),
    },
    gst_amount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
    },
  }, {
    tableName: 'sales_return_items',
    timestamps: false,
  });

  SaleReturnItem.associate = (db) => {
    SaleReturnItem.belongsTo(db.SalesReturn, {
      foreignKey: 'return_id',
      as: 'saleReturn',
    });
    SaleReturnItem.belongsTo(db.Item, {
      foreignKey: 'item_id',
      as: 'item',
    });
  };

  return SaleReturnItem;
};
