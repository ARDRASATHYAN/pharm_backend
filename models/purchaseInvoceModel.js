'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

  const PurchaseInvoice = sequelize.define(
    'PurchaseInvoice',
    {
      purchase_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      invoice_no: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      invoice_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_gst: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total_discount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      net_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      store_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'stores',
          key: 'store_id',
        },
      },

      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'suppliers',
          key: 'supplier_id',
        },
      },

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'user_id',
        },
      },
    },
    {
      tableName: 'purchase_invoices',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  // ============================
  //      ASSOCIATIONS
  // ============================
  PurchaseInvoice.associate = (db) => {
    PurchaseInvoice.belongsTo(db.Store, {
      foreignKey: 'store_id',
      as: 'store',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    PurchaseInvoice.belongsTo(db.Supplier, {
      foreignKey: 'supplier_id',
      as: 'supplier',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // ➕ FIXED: Associate created_by to User model
    PurchaseInvoice.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'created_by_user',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    PurchaseInvoice.hasMany(db.PurchaseItems, {
  foreignKey: "purchase_id",
  as: "items",
});
  };

  return PurchaseInvoice;
};
