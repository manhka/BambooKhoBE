const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/quarter", reportController.getQuarterReport);

router.get("/export-quarter", reportController.exportQuarterReport); 

module.exports = router;