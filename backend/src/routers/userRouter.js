
const express = require('express');
const userController = require('../controllers/userController');
const middleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/me', middleware.verifyAccessToken, userController.getMe);
router.get('/', middleware.verifyAccessToken, userController.getAllUsers);

module.exports = router;