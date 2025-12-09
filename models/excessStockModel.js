const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const ExcessStock = sequelize.define(
        "ExcessStock",
        {
            excess_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            store_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Store",
                    key: "store_id",
                },
            },

            item_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Item",
                    key: "item_id",
                },
            },

            batch_no: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },

            qty: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },

            reason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            entry_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "User",
                    key: "user_id",
                },
            },
        },
        {
            tableName: "excess_stock",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: false,
        }
    );

    // 🔗 Associations
    ExcessStock.associate = (db) => {
        ExcessStock.belongsTo(db.Store, {
            foreignKey: "store_id",
            as: "store",
        });

        ExcessStock.belongsTo(db.Item, {
            foreignKey: "item_id",
            as: "item",
        });

        ExcessStock.belongsTo(db.User, {
            foreignKey: "created_by",
            as: "user",
        });
    };

    return ExcessStock;
};
