const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const Product = require("./Product");

const Variant = sequelize.define(
  "Variant",
  {
    VariantID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    AttributeName: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    Value: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    Unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    Description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    BarcodeProduct: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: Product,
        key: "BarcodeProduct",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "Variant",
    timestamps: false,
  }
);

module.exports = Variant;
