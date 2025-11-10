const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Activity = sequelize.define(
  "Activity",
  {
    ActivityID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ActivityName: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Activity",
    timestamps: false,
  }
);

module.exports = Activity;
