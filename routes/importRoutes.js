const express = require('express');
const router = express.Router();
const importController = require('../controllers/ImportController');
const upload = require('../middlewares/uploadMiddleware');
const { verifyToken } = require('../middlewares/authMiddleware'); 
router.post(
    '/upload', 
    verifyToken, 
    upload.single('excelFile'), 
    importController.uploadImportFile
);

router.get('/', verifyToken, importController.getImportHistory);
router.get('/:id', verifyToken, importController.getImportOrderDetail);


module.exports = router;