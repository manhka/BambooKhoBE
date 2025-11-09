require("dotenv").config();
const express = require("express");
require('./models');
const bodyParser = require("body-parser");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const customerReturnRoutes = require("./routes/customerReturnRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const importRoutes = require('./routes/importRoutes');
const exportRoutes = require('./routes/exportRoutes');
const customerRoutes = require('./routes/customerRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./configs/db");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/customer-return", customerReturnRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use('/api/import-orders', importRoutes);
app.use('/api/export-orders', exportRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
