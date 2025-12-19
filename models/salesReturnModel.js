'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalesReturn = sequelize.define('SalesReturn', {
    return_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    return_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    total_taxable: {
      type: DataTypes.DECIMAL(12, 2),
    },
    total_gst: {
      type: DataTypes.DECIMAL(12, 2),
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    created_by: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'sales_returns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  SalesReturn.associate = (db) => {
    SalesReturn.belongsTo(db.SalesInvoices, {
      foreignKey: 'sale_id',
      as: 'sale',
    });
    SalesReturn.belongsTo(db.Store, {
      foreignKey: 'store_id',
      as: 'store',
    });
    SalesReturn.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    SalesReturn.hasMany(db.SaleReturnItem, {
      foreignKey: 'return_id',
      as: 'saleReturnItems',
    });
  };

  return SalesReturn;
};
