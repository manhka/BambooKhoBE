const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, userController.getAllUsers);

module.exports = router;