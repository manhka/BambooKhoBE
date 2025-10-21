const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");

router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);
router.get("/search/by-name", CategoryController.getCategoryByName);

module.exports = router;
