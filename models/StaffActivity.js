const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const User = require("./User");
const Activity = require("./Activity");

const StaffActivity = sequelize.define(
  "StaffActivity",
  {
    StaffActivityID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "UserID",
      },
    },
    ActivityID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Activity,
        key: "ActivityID",
      },
    },
    CreatedAt: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "StaffActivity",
    timestamps: false,
  }
);

StaffActivity.belongsTo(Activity, { foreignKey: "ActivityID" });
Activity.hasMany(StaffActivity, { foreignKey: "ActivityID" });
module.exports = StaffActivity;
