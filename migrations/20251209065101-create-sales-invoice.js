"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sales_invoices", {
      sale_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      bill_no: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },

      bill_date: {
        type: Sequelize.DATEONLY,
      },

      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      total_gst: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },

      total_discount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },

      net_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },

      doctor_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      prescription_no: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      store_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "stores",
          key: "store_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "customers",
          key: "customer_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sales_invoices");
  },
};
