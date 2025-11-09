const express = require('express');
const router = express.Router();
const exportController = require('../controllers/ExportController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware'); 

router.post('/', verifyToken, exportController.createExportOrder);
router.get('/', verifyToken, exportController.getExportHistory);
router.get('/:id/excel', verifyToken, exportController.exportOrderToExcel);
router.get('/:id', verifyToken, exportController.getExportOrderDetail);

module.exports = router;