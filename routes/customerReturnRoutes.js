const express = require("express");
const router = express.Router();
const customerReturnController = require("../controllers/CustomerReturnController");
const { verifyToken } = require("../middlewares/authMiddleware");
router.get("/warranty", customerReturnController.getWarrantyProducts);
router.get(
  "/warranty/:exportDetailId",
  customerReturnController.getWarrantyProductById
);

router.post(
  "/create",
  verifyToken,
  customerReturnController.createCustomerReturn
);

router.get("/list", verifyToken, customerReturnController.getCustomerReturns);

router.get("/detail/:id", customerReturnController.getCustomerReturnById);

module.exports = router;
