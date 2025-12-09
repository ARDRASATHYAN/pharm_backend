const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SalesInvoices = sequelize.define(
    "SalesInvoices",
    {
      sale_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      bill_no: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      bill_date: {
        type: DataTypes.DATEONLY,
      },
      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      total_gst: {
        type: DataTypes.DECIMAL(12, 2),
      },
      total_discount: {
        type: DataTypes.DECIMAL(12, 2),
      },
      net_amount: {
        type: DataTypes.DECIMAL(12, 2),
      },
      doctor_name: {
        type: DataTypes.STRING(150),
      },
      prescription_no: {
        type: DataTypes.STRING(100),
      },
      store_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Store",
          key: "store_id",
        },
        allowNull: true,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Customer",
          key: "customer_id",
        },
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        references: {
          model: "User",
          key: "user_id",
        },
        allowNull: true,
      },
    },
    {
      tableName: "sales_invoices",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  SalesInvoices.associate = (db) => {
    SalesInvoices.belongsTo(db.Store, { foreignKey: "store_id", as: "store" });
    SalesInvoices.belongsTo(db.Customer, {
      foreignKey: "customer_id",
      as: "customer",
    });
    SalesInvoices.belongsTo(db.User, {
      foreignKey: "created_by",
      as: "creater",
    });
  };

  return SalesInvoices;
};
