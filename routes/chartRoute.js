const express = require("express");
const router = express.Router();
const chartController = require("../controllers/chartController");

router.get("/import-export", chartController.getImportExportChart);

module.exports = router;
