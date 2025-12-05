
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => { 
  const PurchaseReturnItem = sequelize.define('PurchaseReturnItem', {
    return_item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    return_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'purchase_returns',
        key: 'return_id',
      },
      onDelete: 'CASCADE', 
      onUpdate: 'CASCADE',
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items_master',
        key: 'item_id',
      },
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE',
    },
    batch_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    qty: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
  }, {
    tableName: 'purchase_return_items',
    timestamps: false,
  });


  PurchaseReturnItem.associate = (db) => {
    PurchaseReturnItem.belongsTo(db.PurchaseReturn, { foreignKey: 'return_id', as: 'purchaseReturn' });
    PurchaseReturnItem.belongsTo(db.Item, { foreignKey: 'item_id', as: 'item' });
  }

  return PurchaseReturnItem;
}
