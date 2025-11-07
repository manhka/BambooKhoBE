const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Supplier = sequelize.define(
  "Supplier",
  {
    SupplierID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    SupplierName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Address: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    Phone: {
      type: DataTypes.STRING(12),
      allowNull: true,
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "Supplier",
    timestamps: false,
  }
);

module.exports = Supplier;
