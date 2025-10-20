const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");

// POST /api/products/create
router.post("/create", productController.createProduct);
router.put("/update/:barcode", productController.updateProduct);
router.get("/", productController.getProducts);
router.patch("/:barcode/archive", productController.archiveProduct);
router.get("/stock/warning", productController.getLowStockProducts);
router.get("/details/:barcode", productController.viewProductDetails);
module.exports = router;
