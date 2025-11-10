const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
router.get("/", verifyToken, userController.getAllUsers);
router.get("/role", userController.getUsersByRole);
router.put(
  "/toggle/:id",
  verifyToken,
  verifyAdmin,
  userController.toggleUserStatus
);

router.put("/edit/:id", verifyToken, verifyAdmin, userController.updateUser);
module.exports = router;
