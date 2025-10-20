require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const customerReturnRoutes = require("./routes/customerReturnRoutes");
const sequelize = require("./configs/db");

const app = express();
app.use(bodyParser.json());

app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/customer-return", customerReturnRoutes);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
