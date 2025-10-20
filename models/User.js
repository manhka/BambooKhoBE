const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const Role = require("./Role");

const User = sequelize.define(
  "User",
  {
    UserID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Username: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Phone: {
      type: DataTypes.STRING(12),
      allowNull: true,
    },
    Status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    RoleID: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: "RoleID",
      },
    },
  },
  {
    tableName: "User",
    timestamps: false,
  }
);

// ===== Relations =====
User.belongsTo(Role, { foreignKey: "RoleID" });

module.exports = User;
