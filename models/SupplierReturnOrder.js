const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const ImportOrder = require("./ImportOrder");
const User = require("./User");

const SupplierReturnOrder = sequelize.define(
  "SupplierReturnOrder",
  {
    ReturnID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ReturnDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ImportID: {
      type: DataTypes.INTEGER,
      references: {
        model: ImportOrder,
        key: "ImportID",
      },
    },
    UserID: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "UserID",
      },
    },
  },
  {
    tableName: "SupplierReturnOrder",
    timestamps: false,
  }
);

module.exports = SupplierReturnOrder;
