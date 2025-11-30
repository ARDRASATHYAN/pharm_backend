'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define(
  'Customer',
  {
    customer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    email: {
      type: DataTypes.STRING(100),
    },
    gst_no: {
      type: DataTypes.STRING(20),
    },
    doctor_name: {
      type: DataTypes.STRING(150),
    },
    prescription_no: {
      type: DataTypes.STRING(100),
    },
  },
  {
    tableName: 'customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

  return Customer;
};
