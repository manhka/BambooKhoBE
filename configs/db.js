const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("bambookho", "root", "123456789", {
  host: "localhost",
  dialect: "mysql",
  port: 3306,
});

sequelize
  .authenticate()
  .then(() => console.log("Kết nối MySQL thành công!"))
  .catch((err) => console.error("Kết nối thất bại:", err));

module.exports = sequelize;
