const express = require("express");
const router = express.Router();
const variantController = require("../controllers/VariantController");

router.post("/create", variantController.createVariants);

router.post("/batch", variantController.updateVariants);

router.get(
  "/product-variants/:barcode",
  variantController.getVariantsByProduct
);

router.delete("/:id", variantController.deleteVariant);

module.exports = router;
