const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, CategoryController.getAllCategories);

router.get(
  "/search/by-name",
  verifyToken,
  CategoryController.getCategoryByName
);

router.get("/:id", verifyToken, CategoryController.getCategoryById);

router.post("/", verifyToken, CategoryController.createCategory);

router.put("/:id", verifyToken, CategoryController.updateCategory);

router.put("/:id/restore", verifyToken, CategoryController.restoreCategory);

router.delete("/:id", verifyToken, CategoryController.deleteCategory);

module.exports = router;
