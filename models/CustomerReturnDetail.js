const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const CustomerReturnOrder = require("./CustomerReturnOrder");
const Product = require("./Product");

const CustomerReturnDetail = sequelize.define(
  "CustomerReturnDetail",
  {
    CustomerReturnDetailID: {
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
    CustomerReturnOrderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CustomerReturnOrder,
        key: "ReturnID",
      },
    },
    BarcodeProduct: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: Product,
        key: "BarcodeProduct",
      },
    },
  },
  {
    tableName: "CustomerReturnDetail",
    timestamps: false,
  }
);

CustomerReturnOrder.hasMany(CustomerReturnDetail, {
  foreignKey: "CustomerReturnOrderID",
  sourceKey: "ReturnID",
});

CustomerReturnDetail.belongsTo(CustomerReturnOrder, {
  foreignKey: "CustomerReturnOrderID",
  targetKey: "ReturnID",
});

Product.hasMany(CustomerReturnDetail, {
  foreignKey: "BarcodeProduct",
  sourceKey: "BarcodeProduct",
});

CustomerReturnDetail.belongsTo(Product, {
  foreignKey: "BarcodeProduct",
  targetKey: "BarcodeProduct",
});

module.exports = CustomerReturnDetail;
