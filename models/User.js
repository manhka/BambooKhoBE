const { DataTypes } = require('sequelize');
const sequelize = require('../configs/db'); 
const Role = require('./Role');
const StaffActivity = require('./StaffActivity'); 

const User = sequelize.define('User', {
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
    defaultValue: true,
  },
  RoleID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Role,
      key: 'RoleID',
    },
  },
}, {
  tableName: 'User',
  timestamps: false, 
});
User.belongsTo(Role, { foreignKey: 'RoleID' });
StaffActivity.belongsTo(User, { foreignKey: 'UserID' });

module.exports = User;
