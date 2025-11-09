const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, customerController.getAllCustomers); 
router.post('/', verifyToken, customerController.createCustomer);
router.get('/detail/:id', verifyToken, customerController.getCustomerDetail);
router.put('/update/:id', verifyToken, customerController.updateCustomer);

module.exports = router;