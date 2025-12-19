'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addColumn('store_stock', 'discount_percent', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    
    });

    await queryInterface.addColumn('store_stock', 'discount_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('store_stock', 'discount_percent');
    await queryInterface.removeColumn('store_stock', 'discount_amount');
  }
};
