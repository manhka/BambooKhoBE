const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Brand = sequelize.define(
  "Brand",
  {
    BrandID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    BrandName: {
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
    tableName: "Brand",
    timestamps: false,
  }
);

module.exports = Brand;
