const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("bamboo_kho", "root", "Huyquangle123", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => console.log("Kết nối MySQL thành công!"))
  .catch((err) => console.error("Kết nối thất bại:", err));

module.exports = sequelize;
