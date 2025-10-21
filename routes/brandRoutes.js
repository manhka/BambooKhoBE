const express = require("express");
const router = express.Router();
const BrandController = require("../controllers/BrandController");

router.get("/", BrandController.getAllBrands);

router.get("/:id", BrandController.getBrandById);

router.get("/search/by-name", BrandController.getBrandByName);

module.exports = router;
