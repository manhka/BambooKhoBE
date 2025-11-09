// models/index.js
const sequelize = require("../configs/db");

// 🔹 Import các model
const Product = require("./Product");
const Variant = require("./Variant");
const Category = require("./Category");
const Brand = require("./Brand");
const User = require("./User");
const Customer = require("./Customer");
const ExportOrder = require("./ExportOrder");
const ExportDetail = require("./ExportDetail");
const CustomerReturnOrder = require("./CustomerReturnOrder");
const CustomerReturnDetail = require("./CustomerReturnDetail");
const ImportOrder = require("./ImportOrder");
const ImportDetail = require("./ImportDetail");
const Supplier = require("./Supplier");
const SupplierReturnOrder = require("./SupplierReturnOrder");
const SupplierReturnDetail = require("./SupplierReturnDetail");
const StaffActivity = require("./StaffActivity");
const Activity = require("./Activity");

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
Customer.hasMany(ExportOrder, { foreignKey: "CustomerID", as: 'ExportOrders' });
ExportOrder.belongsTo(Customer, { foreignKey: "CustomerID", as: 'Customer' }); 

User.hasMany(ExportOrder, { foreignKey: "UserID", as: 'CreatedExportOrders' }); 
ExportOrder.belongsTo(User, { foreignKey: "UserID", as: 'User' }); 

ExportOrder.hasMany(ExportDetail, { foreignKey: "ExportID", as: 'ExportDetails' }); 
ExportDetail.belongsTo(ExportOrder, { foreignKey: "ExportID", as: 'ExportOrder' });

Product.hasMany(ExportDetail, { foreignKey: "BarcodeProduct", as: 'ExportDetails' }); 
ExportDetail.belongsTo(Product, { foreignKey: "BarcodeProduct", as: 'Product' }); 

/* ===========================================================
   3. CUSTOMER RETURN ORDER / DETAIL
   =========================================================== */
User.hasMany(CustomerReturnOrder, { foreignKey: "UserID" });
CustomerReturnOrder.belongsTo(User, { foreignKey: "UserID" });

ExportOrder.hasMany(CustomerReturnOrder, { foreignKey: "ExportID" });
CustomerReturnOrder.belongsTo(ExportOrder, { foreignKey: "ExportID" });

CustomerReturnOrder.hasMany(CustomerReturnDetail, {
  foreignKey: "CustomerReturnOrderID",
});
CustomerReturnDetail.belongsTo(CustomerReturnOrder, {
  foreignKey: "CustomerReturnOrderID",
});

Product.hasMany(CustomerReturnDetail, { foreignKey: "BarcodeProduct" });
CustomerReturnDetail.belongsTo(Product, { foreignKey: "BarcodeProduct" });

/* ===========================================================
   4. IMPORT ORDER / DETAIL
   =========================================================== */
Supplier.hasMany(ImportOrder, { foreignKey: "SupplierID", as: 'ImportOrders' }); 
ImportOrder.belongsTo(Supplier, { foreignKey: "SupplierID", as: 'Supplier' });

User.hasMany(ImportOrder, { foreignKey: "UserID", as: 'CreatedImportOrders' }); 
ImportOrder.belongsTo(User, { foreignKey: "UserID", as: 'User' }); 

ImportOrder.hasMany(ImportDetail, { foreignKey: "ImportID", as: 'ImportDetails' }); 
ImportDetail.belongsTo(ImportOrder, { foreignKey: "ImportID", as: 'ImportOrder' }); 

Product.hasMany(ImportDetail, { foreignKey: "BarcodeProduct", as: 'ImportDetails' }); 
ImportDetail.belongsTo(Product, { foreignKey: "BarcodeProduct", as: 'Product' }); 

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
   6. AUDIT (STAFF ACTIVITY) 
   =========================================================== */
User.hasMany(StaffActivity, { foreignKey: "UserID", as: 'StaffActivities' });
StaffActivity.belongsTo(User, { foreignKey: "UserID", as: 'User' });

Activity.hasMany(StaffActivity, { foreignKey: "ActivityID", as: 'ActivityLogs' });
StaffActivity.belongsTo(Activity, { foreignKey: "ActivityID", as: 'ActivityType' });

/* ===========================================================
    EXPORT ALL
   =========================================================== */
module.exports = {
  sequelize,
  Product,
  Variant,
  Customer,
  Category,
  Brand,
  User,
  ExportOrder,
  ExportDetail,
  CustomerReturnOrder,
  CustomerReturnDetail,
  ImportOrder,
  ImportDetail,
  Supplier,
  SupplierReturnOrder,
  SupplierReturnDetail,
  StaffActivity,
  Activity,
};
