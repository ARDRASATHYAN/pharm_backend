"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const data = [
      { schedule_code: "A", schedule_name: "Schedule A", created_at: now },
      { schedule_code: "B", schedule_name: "Schedule B", created_at: now },
      { schedule_code: "C", schedule_name: "Schedule C", created_at: now },
      { schedule_code: "D", schedule_name: "Schedule D", created_at: now },
      { schedule_code: "E", schedule_name: "Schedule E", created_at: now },
      { schedule_code: "F", schedule_name: "Schedule F", created_at: now },
      { schedule_code: "G", schedule_name: "Schedule G", created_at: now },
      { schedule_code: "H", schedule_name: "Schedule H", created_at: now },
      { schedule_code: "I", schedule_name: "Schedule I", created_at: now },
      { schedule_code: "J", schedule_name: "Schedule J", created_at: now },
    ];

    await queryInterface.bulkInsert("drug_schedule_master", data);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("drug_schedule_master", null, {});
  },
};
