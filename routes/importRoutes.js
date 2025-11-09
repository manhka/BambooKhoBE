const express = require('express');
const router = express.Router();
const importController = require('../controllers/ImportController');
const upload = require('../middlewares/uploadMiddleware');
// const { verifyToken } = require('../middlewares/authMiddleware'); 

router.post('/upload', upload.single('excelFile'), importController.uploadImportFile);
router.get('/', importController.getImportHistory);
//router.get('/:id', importController.getImportOrderDetail);

module.exports = router;