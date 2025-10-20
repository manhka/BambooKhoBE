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
    warranty_time: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    ReturnedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    warranty_status: {
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

ExportDetail.belongsTo(ExportOrder, { foreignKey: "ExportID" });
ExportDetail.belongsTo(Product, { foreignKey: "BarcodeProduct" });

module.exports = ExportDetail;
