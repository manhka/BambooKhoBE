const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");

router.get("/", CategoryController.getAllCategories);

router.get("/search/by-name", CategoryController.getCategoryByName);

router.get("/:id", CategoryController.getCategoryById);

router.post("/", CategoryController.createCategory);

router.put("/:id", CategoryController.updateCategory);

router.put("/:id/restore", CategoryController.restoreCategory);

router.delete("/:id", CategoryController.deleteCategory);

module.exports = router;
