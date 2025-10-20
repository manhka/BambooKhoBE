const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const User = require("./User");
const ExportOrder = require("./ExportOrder");

const CustomerReturnOrder = sequelize.define(
  "CustomerReturnOrder",
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
    UserID: {
      type: DataTypes.INTEGER,
      references: {
        model: "User",
        key: "UserID",
      },
    },
    ExportID: {
      type: DataTypes.INTEGER,
      references: {
        model: "ExportOrder",
        key: "ExportID",
      },
    },
  },
  {
    tableName: "CustomerReturnOrder",
    timestamps: false,
  }
);

CustomerReturnOrder.belongsTo(User, { foreignKey: "UserID" });
CustomerReturnOrder.belongsTo(ExportOrder, { foreignKey: "ExportID" });

module.exports = CustomerReturnOrder;
