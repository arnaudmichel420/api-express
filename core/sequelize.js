const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(
  "mysql://root:ldL2s7DXCIDflpxAExPbfz37D0QA7L@127.0.0.1:3306/to-do-list?serverVersion=10.11.2-MariaDB&charset=utf8mb4",
  {
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: false,
  }
); // Example for postgres

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = sequelize;
