require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const customerReturnRoutes = require("./routes/customerReturnRoutes");
const userRoutes = require("./routes/userRoute");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const customerRoutes = require("./routes/customerRoutes");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./configs/db");
const activityRoutes = require("./routes/activityRoute");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/customer-return", customerReturnRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/customers", customerRoutes);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
})();

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
