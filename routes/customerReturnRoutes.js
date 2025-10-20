const express = require("express");
const router = express.Router();
const customerReturnController = require("../controllers/CustomerReturnController");

router.post("/create", customerReturnController.createCustomerReturn);

router.get("/list", customerReturnController.getCustomerReturns);

router.get("/detail/:id", customerReturnController.getCustomerReturnById);

module.exports = router;
