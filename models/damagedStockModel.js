const { DataTypes } = require("sequelize");



module.exports = (sequelize) => {
    const DamagedStock = sequelize.define("DamagedStock", {
        damaged_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        store_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "Store",
                key: "store_id",
            },
            allowNull: false,
        },
        item_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "Item",
                key: "item_id",
            },
            allowNull: false,
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
            type: DataTypes.TEXT
        },
        entry_date: {
            type: DataTypes.DATE,
        },
        created_by: {
            type: DataTypes.INTEGER,
            references: {
                model: "User",
                key: "user_id"
            },
            allowNull: false,
        },
    },
        {
            tableName: "damaged_stock",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: false
        }
    );
    DamagedStock.associate = (db) => {
        DamagedStock.belongsTo(db.Store, { foreignKey: "store_id", as: "store" });
        DamagedStock.belongsTo(db.Item, { foreignKey: 'item_id', as: "item" });
        DamagedStock.belongsTo(db.User, { foreignKey: "created_by", as: "user" });
    }

    return DamagedStock;
}

