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
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    Unit: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    timestamps: true,
  }
);

Variant.belongsTo(Product, {
  foreignKey: "BarcodeProduct",
  targetKey: "BarcodeProduct",
});

module.exports = Variant;
