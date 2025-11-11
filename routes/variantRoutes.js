const express = require("express");
const router = express.Router();
const variantController = require("../controllers/VariantController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/create", verifyToken, variantController.createVariants);

router.post("/batch", verifyToken, variantController.updateVariants);

router.get(
  "/product-variants/:barcode",
  verifyToken,
  variantController.getVariantsByProduct
);

router.delete("/:id", verifyToken, variantController.deleteVariant);

module.exports = router;
