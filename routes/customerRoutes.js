// routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const customerController = require("../controllers/CustomerController");

router.get("/search", customerController.searchCustomers);

module.exports = router;
