const sequelize = require("../configs/db");
const Product = require("./Product");
const Variant = require("./Variant");

Product.hasMany(Variant, {
  foreignKey: "BarcodeProduct",
  sourceKey: "BarcodeProduct",
});
Variant.belongsTo(Product, {
  foreignKey: "BarcodeProduct",
  targetKey: "BarcodeProduct",
});

module.exports = { sequelize, Product, Variant };
