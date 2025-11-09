const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/SupplierController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * GET /api/suppliers
 * Lấy danh sách tất cả nhà cung cấp (chỉ cần đăng nhập)
 */
router.get('/', verifyToken, supplierController.getAllSuppliers);
module.exports = router;