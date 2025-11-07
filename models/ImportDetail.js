const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const ImportOrder = require("./ImportOrder");
const Product = require("./Product");

const ImportDetail = sequelize.define(
  "ImportDetail",
  {
    ImportDetailID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UnitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    Total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    ImportID: {
      type: DataTypes.INTEGER,
      references: {
        model: ImportOrder,
        key: "ImportID",
      },
    },
    BarcodeProduct: {
      type: DataTypes.STRING(100),
      references: {
        model: Product,
        key: "BarcodeProduct",
      },
    },
  },
  {
    tableName: "ImportDetail",
    timestamps: false,
  }
);

module.exports = ImportDetail;
