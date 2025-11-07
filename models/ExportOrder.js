const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const ExportOrder = sequelize.define(
  "ExportOrder",
  {
    ExportID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ExportDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CustomerID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "ExportOrder",
    timestamps: false,
  }
);

module.exports = ExportOrder;
