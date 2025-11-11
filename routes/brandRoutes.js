const express = require("express");
const router = express.Router();
const BrandController = require("../controllers/BrandController");
const BrandValidator = require("../validators/BrandValidator");
const { verifyToken } = require("../middlewares/authMiddleware");

// GET routes
router.get("/", BrandController.getAllBrands);
router.get(
  "/search/by-name",
  BrandValidator.validateSearchByName,
  BrandController.getBrandByName
);
router.get(
  "/:id",
  verifyToken,
  BrandValidator.validateBrandId,
  BrandController.getBrandById
);

// POST routes
router.post(
  "/",
  verifyToken,
  BrandValidator.validateCreateBrand,
  BrandController.createBrand
);

// PUT routes
router.put(
  "/:id",
  verifyToken,
  BrandValidator.validateUpdateBrand,
  BrandController.updateBrand
);
router.put(
  "/:id/restore",
  verifyToken,
  BrandValidator.validateBrandId,
  BrandController.restoreBrand
);

// DELETE routes
router.delete(
  "/:id",
  verifyToken,
  BrandValidator.validateBrandId,
  BrandController.deleteBrand
);

module.exports = router;
