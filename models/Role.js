const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Role = sequelize.define(
  "Role",
  {
    RoleID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    RoleName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "Role",
    timestamps: false,
  }
);

module.exports = Role;
