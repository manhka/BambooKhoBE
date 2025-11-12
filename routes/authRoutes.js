const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.post("/register", verifyToken, authController.register);
router.post("/login", authController.login);

module.exports = router;
