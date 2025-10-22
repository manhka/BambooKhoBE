const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Category = sequelize.define(
  "Category",
  {
    CategoryID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    CategoryName: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING(250),
    },
    IsArchive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Category",
    timestamps: true,
  }
);

module.exports = Category;
