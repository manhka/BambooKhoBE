const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.post("/register", verifyToken, verifyAdmin, authController.register);
router.post("/login", authController.login);

module.exports = router;
