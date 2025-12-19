'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addColumn('store_stock', 'cost_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Cost per unit'
    });

    await queryInterface.addColumn('store_stock', 'sale_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Sale per unit'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('store_stock', 'sale_price');
    await queryInterface.removeColumn('store_stock', 'cost_price');
  }
};
