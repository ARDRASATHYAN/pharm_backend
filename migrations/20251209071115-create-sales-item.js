"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sales_items", {
      sale_item_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sales_invoices",
          key: "sale_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "items_master", // ❗ update if your table is named differently
          key: "item_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      batch_no: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      qty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      gst_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },

      discount_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },

      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("sales_items");
  },
};
