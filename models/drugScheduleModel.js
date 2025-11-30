'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DrugSchedule = sequelize.define(
        'DrugSchedule',
        {
            schedule_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            schedule_code: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
            schedule_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            requires_prescription: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            restricted_sale: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            tableName: 'drug_schedule_master',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,

        }
    );

    // Associations
    DrugSchedule.associate = (db) => {
        DrugSchedule.hasMany(db.Item, {
            foreignKey: 'schedule_id',
            as: 'items',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
    };

    return DrugSchedule;
};
