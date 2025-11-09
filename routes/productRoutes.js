const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");

// POST /api/products/create
router.post("/create", productController.createProductWithVariants);
router.put("/update/:barcode", productController.updateProductWithVariants);
router.get("/", productController.getAllProducts);
router.patch("/archive/:barcode", productController.archiveProduct);
router.get("/stock/warning", productController.getLowStockProducts);
router.get("/details/:barcode", productController.getProductDetail);
router.get('/all-for-lookup', productController.getProductsForLookup);
module.exports = router;
