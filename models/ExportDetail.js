const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const ExportOrder = require("./ExportOrder");
const Product = require("./Product");

const ExportDetail = sequelize.define(
  "ExportDetail",
  {
    ExportDetailID: {
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
    ExportID: {
      type: DataTypes.INTEGER,
      references: {
        model: "ExportOrder",
        key: "ExportID",
      },
    },
    BarcodeProduct: {
      type: DataTypes.STRING(100),
      references: {
        model: "Product",
        key: "BarcodeProduct",
      },
    },
    WarrantyTime: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    ReturnedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    WarrantyStartTime: { type: DataTypes.DATE, allowNull: true },
    WarrantyEndTime: { type: DataTypes.DATE, allowNull: true },
    WarrantyStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    tableName: "ExportDetail",
    timestamps: false,
  }
);

module.exports = ExportDetail;
