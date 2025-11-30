'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Supplier = sequelize.define(
        'Supplier',
        {
            supplier_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            supplier_name: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            address: {
                type: DataTypes.TEXT,
            },
            state: {
                type: DataTypes.STRING(100),
            },
            gst_no: {
                type: DataTypes.STRING(20),
            },
            phone: {
                type: DataTypes.STRING(20),
            },
            email: {
                type: DataTypes.STRING(100),
                validate: {
                    isEmail: true,
                }
            }
        },
        {
            tableName: 'suppliers',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
        }
    );

    return Supplier;
};
