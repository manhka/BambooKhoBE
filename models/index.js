// models/index.js
const sequelize = require("../configs/db");

// Import tất cả model
const Product = require("./Product");
const Variant = require("./Variant");
const ImportOrder = require("./ImportOrder");
const ImportDetail = require("./ImportDetail");
const ExportOrder = require("./ExportOrder");
const ExportDetail = require("./ExportDetail");
const Supplier = require("./Supplier");
const Customer = require("./Customer");
const User = require("./User");

// ===== Quan hệ Product - Variant =====
Product.hasMany(Variant, {
  foreignKey: "BarcodeProduct",
  sourceKey: "BarcodeProduct",
});
Variant.belongsTo(Product, {
  foreignKey: "BarcodeProduct",
  targetKey: "BarcodeProduct",
});

// ===== Import =====
Supplier.hasMany(ImportOrder, { foreignKey: "SupplierID" });
ImportOrder.belongsTo(Supplier, { foreignKey: "SupplierID" });

ImportOrder.hasMany(ImportDetail, { foreignKey: "ImportID" });
ImportDetail.belongsTo(ImportOrder, { foreignKey: "ImportID" });

Product.hasMany(ImportDetail, { foreignKey: "BarcodeProduct", sourceKey: "BarcodeProduct" });
ImportDetail.belongsTo(Product, { foreignKey: "BarcodeProduct", targetKey: "BarcodeProduct" });

// ===== Export =====
Customer.hasMany(ExportOrder, { foreignKey: "CustomerID" });
ExportOrder.belongsTo(Customer, { foreignKey: "CustomerID" });

ExportOrder.hasMany(ExportDetail, { foreignKey: "ExportID" });
ExportDetail.belongsTo(ExportOrder, { foreignKey: "ExportID" });

Product.hasMany(ExportDetail, { foreignKey: "BarcodeProduct", sourceKey: "BarcodeProduct" });
ExportDetail.belongsTo(Product, { foreignKey: "BarcodeProduct", targetKey: "BarcodeProduct" });

// ===== Xuất các model =====
module.exports = {
  sequelize,
  Product,
  Variant,
  ImportOrder,
  ImportDetail,
  ExportOrder,
  ExportDetail,
  Supplier,
  Customer,
  User,
};
