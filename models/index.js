// models/index.js
const sequelize = require("../configs/db");

// 🔹 Import các model
const Product = require("./Product");
const Variant = require("./Variant");
const Category = require("./Category");
const Brand = require("./Brand");
const Customer = require("./Customer");

const User = require("./User");
const ExportOrder = require("./ExportOrder");
const ExportDetail = require("./ExportDetail");
const CustomerReturnOrder = require("./CustomerReturnOrder");
const CustomerReturnDetail = require("./CustomerReturnDetail");
const ImportOrder = require("./ImportOrder");
const ImportDetail = require("./ImportDetail");
const Supplier = require("./Supplier");
const SupplierReturnOrder = require("./SupplierReturnOrder");
const SupplierReturnDetail = require("./SupplierReturnDetail");

/* ===========================================================
   1. CATEGORY / BRAND / PRODUCT / VARIANT
   =========================================================== */
Category.hasMany(Product, { foreignKey: "CategoryID" });
Product.belongsTo(Category, { foreignKey: "CategoryID" });

Brand.hasMany(Product, { foreignKey: "BrandID" });
Product.belongsTo(Brand, { foreignKey: "BrandID" });

Product.hasMany(Variant, { foreignKey: "BarcodeProduct" });
Variant.belongsTo(Product, { foreignKey: "BarcodeProduct" });

/* ===========================================================
   2. EXPORT ORDER / DETAIL
   =========================================================== */
User.hasMany(ExportOrder, { foreignKey: "UserID" });
ExportOrder.belongsTo(User, { foreignKey: "UserID" });
ExportOrder.belongsTo(Customer, { as: "Customer", foreignKey: "CustomerID" });
ExportOrder.hasMany(ExportDetail, { foreignKey: "ExportID" });
ExportDetail.belongsTo(ExportOrder, { foreignKey: "ExportID" });

Product.hasMany(ExportDetail, { foreignKey: "BarcodeProduct" });
ExportDetail.belongsTo(Product, { foreignKey: "BarcodeProduct" });

/* ===========================================================
   3. CUSTOMER RETURN ORDER / DETAIL
   =========================================================== */
User.hasMany(CustomerReturnOrder, { foreignKey: "UserID" });
CustomerReturnOrder.belongsTo(User, { foreignKey: "UserID" });

ExportOrder.hasMany(CustomerReturnOrder, { foreignKey: "ExportID" });
CustomerReturnOrder.belongsTo(ExportOrder, { foreignKey: "ExportID" });

CustomerReturnOrder.hasMany(CustomerReturnDetail, {
  as: "CustomerReturnDetails",
  foreignKey: "CustomerReturnOrderID",
});

CustomerReturnDetail.belongsTo(CustomerReturnOrder, {
  as: "CustomerReturnOrder",
  foreignKey: "CustomerReturnOrderID",
});

Product.hasMany(CustomerReturnDetail, {
  as: "CustomerReturnDetail",
  foreignKey: "BarcodeProduct",
});
CustomerReturnDetail.belongsTo(Product, {
  as: "Product",
  foreignKey: "BarcodeProduct",
});

/* ===========================================================
   4. IMPORT ORDER / DETAIL
   =========================================================== */
Supplier.hasMany(ImportOrder, { foreignKey: "SupplierID" });
ImportOrder.belongsTo(Supplier, { foreignKey: "SupplierID" });

User.hasMany(ImportOrder, { foreignKey: "UserID" });
ImportOrder.belongsTo(User, { foreignKey: "UserID" });

ImportOrder.hasMany(ImportDetail, { foreignKey: "ImportID" });
ImportDetail.belongsTo(ImportOrder, { foreignKey: "ImportID" });

Product.hasMany(ImportDetail, { foreignKey: "BarcodeProduct" });
ImportDetail.belongsTo(Product, { foreignKey: "BarcodeProduct" });

/* ===========================================================
   5. SUPPLIER RETURN ORDER / DETAIL
   =========================================================== */
// User tạo phiếu trả
User.hasMany(SupplierReturnOrder, { foreignKey: "UserID" });
SupplierReturnOrder.belongsTo(User, { foreignKey: "UserID" });

// Liên kết với ImportOrder gốc
ImportOrder.hasMany(SupplierReturnOrder, { foreignKey: "ImportID" });
SupplierReturnOrder.belongsTo(ImportOrder, { foreignKey: "ImportID" });

// SupplierReturnOrder 1 - N SupplierReturnDetail
SupplierReturnOrder.hasMany(SupplierReturnDetail, {
  foreignKey: "SupplierReturnOrderID",
});
SupplierReturnDetail.belongsTo(SupplierReturnOrder, {
  foreignKey: "SupplierReturnOrderID",
});

// Product 1 - N SupplierReturnDetail
Product.hasMany(SupplierReturnDetail, { foreignKey: "BarcodeProduct" });
SupplierReturnDetail.belongsTo(Product, { foreignKey: "BarcodeProduct" });

/* ===========================================================
    EXPORT ALL
   =========================================================== */
module.exports = {
  sequelize,
  Product,
  Variant,
  Category,
  Brand,
  User,
  ExportOrder,
  ExportDetail,
  Customer,
  CustomerReturnOrder,
  CustomerReturnDetail,
  ImportOrder,
  ImportDetail,
  Supplier,
  SupplierReturnOrder,
  SupplierReturnDetail,
};
