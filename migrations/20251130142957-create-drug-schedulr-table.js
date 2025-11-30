'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('drug_schedule_master', {
      schedule_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      schedule_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      schedule_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      requires_prescription: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      restricted_sale: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('drug_schedule_master');
  }
};
