const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const User = require("./User");
const Customer = require("./Customer");

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
      references: {
        model: "User",
        key: "UserID",
      },
    },
    CustomerID: {
      type: DataTypes.INTEGER,
      references: {
        model: "Customer",
        key: "CustomerID",
      },
    },
  },
  {
    tableName: "ExportOrder",
    timestamps: false,
  }
);

ExportOrder.belongsTo(User, { foreignKey: "UserID" });
ExportOrder.belongsTo(Customer, { foreignKey: "CustomerID" });

module.exports = ExportOrder;
