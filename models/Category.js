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
    CreateAt: {
      type: DataTypes.DATE,
    },
    UpdateAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "Category",
    timestamps: false,
  }
);

module.exports = Category;
