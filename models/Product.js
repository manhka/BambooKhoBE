const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const Brand = require("./Brand");
const Category = require("./Category");

const Product = sequelize.define(
  "Product",
  {
    BarcodeProduct: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    ProductName: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    NumberOfProduct: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    Image: {
      type: DataTypes.STRING(250),
    },
    Description: {
      type: DataTypes.TEXT,
    },
    IsArchive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    BrandID: {
      type: DataTypes.INTEGER,
      references: {
        model: "Brand",
        key: "BrandID",
      },
    },
    CategoryID: {
      type: DataTypes.INTEGER,
      references: {
        model: "Category",
        key: "CategoryID",
      },
    },
    CostPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    SalePrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },

    CreateAt: {
      type: DataTypes.DATE,
    },
    UpdateAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "Product",
    timestamps: false,
  }
);

Product.belongsTo(Brand, { foreignKey: "BrandID" });
Product.belongsTo(Category, { foreignKey: "CategoryID" });

module.exports = Product;
