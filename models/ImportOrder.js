const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const ImportOrder = sequelize.define(
  "ImportOrder",
  {
    ImportID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ImportDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    SupplierID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Supplier",
        key: "SupplierID",
      },
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "User",
        key: "UserID",
      },
    },
  },
  {
    tableName: "ImportOrder",
    timestamps: false,
  }
);

module.exports = ImportOrder;
