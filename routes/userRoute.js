const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.get("/role", userController.getUsersByRole);

router.put(
  "/toggle/:id",
  verifyToken,
  verifyAdmin,
  userController.toggleUserStatus
);

router.put("/edit/:id", verifyToken, verifyAdmin, userController.updateUser);

module.exports = router;
