"use strict";

const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tasks = [];

    for (let i = 0; i < 200; i++) {
      tasks.push({
        userId: faker.helpers.rangeToNumber({ min: 1, max: 50 }),
        title: faker.lorem.words({ min: 1, max: 4}),
        description: faker.lorem.paragraph(),
        done: faker.datatype.boolean(0.5),
        date: faker.date.future(),
      });
    }

    await queryInterface.bulkInsert("Tasks", tasks, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Tasks", null, {});
  },
};
