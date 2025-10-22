const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const SupplierReturnOrder = require("./SupplierReturnOrder");
const Product = require("./Product");

const SupplierReturnDetail = sequelize.define(
  "SupplierReturnDetail",
  {
    SupplierReturnDetailID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    SupplierReturnOrderID: {
      type: DataTypes.INTEGER,
      references: {
        model: SupplierReturnOrder,
        key: "ReturnID",
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
    tableName: "SupplierReturnDetail",
    timestamps: false,
  }
);

module.exports = SupplierReturnDetail;
