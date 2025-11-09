const express = require("express");
const router = express.Router();
const BrandController = require("../controllers/BrandController");
const BrandValidator = require("../validators/BrandValidator");

// GET routes
router.get("/", BrandController.getAllBrands);
router.get(
  "/search/by-name",
  BrandValidator.validateSearchByName,
  BrandController.getBrandByName
);
router.get("/:id", BrandValidator.validateBrandId, BrandController.getBrandById);

// POST routes
router.post(
  "/",
  BrandValidator.validateCreateBrand,
  BrandController.createBrand
);

// PUT routes
router.put(
  "/:id",
  BrandValidator.validateUpdateBrand,
  BrandController.updateBrand
);
router.put(
  "/:id/restore",
  BrandValidator.validateBrandId,
  BrandController.restoreBrand
);

// DELETE routes
router.delete(
  "/:id",
  BrandValidator.validateBrandId,
  BrandController.deleteBrand
);

module.exports = router;
