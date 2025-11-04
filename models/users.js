const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../core/sequelize");
const bcrypt = require("bcrypt");
class User extends Model {}

User.init(
  {
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [8, 100],
      },
    },
  },
  {
    hooks: {
      beforeSave: async (user, options) => {
        user.password = await bcrypt.hash(user.password, 12);
      },
    },
    sequelize,
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);

module.exports = User;
