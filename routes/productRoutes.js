const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");

// POST /api/products/create
router.post("/create", productController.createProductWithVariants);
router.put("/update/:barcode", productController.updateProductWithVariants);
router.get("/", productController.getAllProducts);
router.patch("/archive/:barcode", productController.archiveProduct);
router.get("/stock/list-warning", productController.getLowStockProducts);
router.get("/stock/number-warning", productController.getLowStockCount);
router.get("/stock/number-product", productController.getTotalProducts);
router.get("/details/:barcode", productController.getProductDetail);
router.get("/all-for-lookup", productController.getProductsForLookup);
// doanh thu tháng
router.get("/monthly-revenue", productController.getMonthlyRevenue);
module.exports = router;
