const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController");
const { verifyToken } = require("../middlewares/authMiddleware");

// POST /api/products/create
router.post(
  "/create",
  verifyToken,
  productController.createProductWithVariants
);
router.put(
  "/update/:barcode",
  verifyToken,
  productController.updateProductWithVariants
);
router.get("/", verifyToken, productController.getAllProducts);

router.patch(
  "/archive/:barcode",
  verifyToken,
  productController.archiveProduct
);
router.get(
  "/stock/list-warning",
  verifyToken,
  productController.getLowStockProducts
);
router.get(
  "/stock/number-warning",
  verifyToken,
  productController.getLowStockCount
);
router.get(
  "/stock/number-product",
  verifyToken,
  productController.getTotalProducts
);
router.get(
  "/details/:barcode",
  verifyToken,
  productController.getProductDetail
);
router.get(
  "/all-for-lookup",
  verifyToken,
  productController.getProductsForLookup
);
// doanh thu tháng
router.get(
  "/monthly-revenue",
  verifyToken,
  productController.getMonthlyRevenue
);
module.exports = router;
