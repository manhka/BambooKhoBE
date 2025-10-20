const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Customer = sequelize.define(
  "Customer",
  {
    CustomerID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    CustomerName: {
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
  },
  {
    tableName: "Customer",
    timestamps: false,
  }
);

module.exports = Customer;
