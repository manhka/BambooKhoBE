const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/quarter", verifyToken, reportController.getQuarterReport);

router.get(
  "/export-quarter",
  verifyToken,
  reportController.exportQuarterReport
);

module.exports = router;
