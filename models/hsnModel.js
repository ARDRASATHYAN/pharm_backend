'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HSN = sequelize.define(
    'HSN',
    {
      hsn_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      hsn_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gst_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
       defaultValue: 0,
      },
    },
    {
      tableName: 'hsn_master',
      timestamps: false,
    }
  );

  // Associations
  HSN.associate = (db) => {
    HSN.hasMany(db.Item, {
      foreignKey: 'hsn_id',
      as: 'items',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  };

  return HSN;
};
