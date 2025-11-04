import app from "../app.js";
import { sequelize } from "../models/index.js";

export async function setup() {
  await sequelize.sync({ force: true });
}
export async function teardown() {
  await sequelize.drop();
  await sequelize.close();
}
