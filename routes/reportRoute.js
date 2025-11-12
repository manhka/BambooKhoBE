const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.get("/quarter", verifyToken, reportController.getQuarterReport);

router.get(
  "/export-quarter",
  verifyAdmin,
  reportController.exportQuarterReport
);

module.exports = router;
