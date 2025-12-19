'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add p_discount_percent
    await queryInterface.addColumn('purchase_items', 'p_discount_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
    });

    // Add p_discount_amount
    await queryInterface.addColumn('purchase_items', 'p_discount_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert logic: Remove the columns if you undo the migration
    await queryInterface.removeColumn('purchase_items', 'p_discount_percent');
    await queryInterface.removeColumn('purchase_items', 'p_discount_amount');
  }
};