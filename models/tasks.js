const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../core/sequelize");
const User = require("./users");

class Task extends Model {}

Task.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [0, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 5000],
      },
    },
    done: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "tasks",
  }
);

Task.belongsTo(User, { as: "user", foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(Task, { as: "tasks", foreignKey: "userId", onDelete: "CASCADE" });

module.exports = Task;
