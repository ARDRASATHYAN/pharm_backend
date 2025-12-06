
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseReturn = sequelize.define('PurchaseReturn', {
    return_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    purchase_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'purchase_invoices', // table name string works too
        key: 'purchase_id',
      },
    },
    store_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'stores',
        key: 'store_id',
      },
    },
    return_date: {
      type: DataTypes.DATEONLY,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'purchase_returns',
    timestamps: false,
  });

  PurchaseReturn.associate = (db) => {
    PurchaseReturn.belongsTo(db.PurchaseInvoice, { foreignKey: 'purchase_id', as: 'purchase' });
    PurchaseReturn.belongsTo(db.Store, { foreignKey: 'store_id', as: 'store' });
    PurchaseReturn.belongsTo(db.User, { foreignKey: 'created_by', as: 'creator' });
    PurchaseReturn.hasMany(db.PurchaseReturnItem, {
      foreignKey: "return_id",
      as: "purchaseReturnItems",

    });
  }

    return PurchaseReturn;
  }
