require("dotenv").config();
const express = require("express");
require("./models");
const bodyParser = require("body-parser");
const cors = require("cors");

// routes
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const customerReturnRoutes = require("./routes/customerReturnRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const importRoutes = require("./routes/importRoutes");
const exportRoutes = require("./routes/exportRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const customerRoutes = require("./routes/customerRoutes");
const activityRoutes = require("./routes/activityRoute");
const reportRoutes = require("./routes/reportRoute");
const chartRoutes = require("./routes/chartRoute");

const sequelize = require("./configs/db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// mount ONE TIME ONLY
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/customer-return", customerReturnRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/charts", chartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/import-orders", importRoutes);
app.use("/api/export-orders", exportRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
})();

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
