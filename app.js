const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env.local") });
const express = require("express");
const log = require("morgan");
const mysql = require("mysql2");
const sequelize = require("./core/sequelize");
const cors = require("cors");

const logger = require("./middlewares/logger");
const authMiddleware = require("./middlewares/authMiddleware");

const indexRouter = require("./routes/index");
const taskRouter = require("./routes/task");
const authRouter = require("./routes/auth");

const app = express();

app.use(
  cors({
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(log("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);

app.use("/auth", authRouter);
app.use("/", indexRouter);
app.use(authMiddleware);
app.use("/api/tasks", taskRouter);

module.exports = app;
