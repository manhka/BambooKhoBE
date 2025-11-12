const express = require("express");
const router = express.Router();
const chartController = require("../controllers/chartController");
const { verifyAdmin, verifyToken } = require("../middlewares/authMiddleware");

router.get("/import-export", verifyToken, chartController.getImportExportChart);

module.exports = router;
