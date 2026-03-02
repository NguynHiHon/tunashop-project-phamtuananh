const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController');
const { verifyAccessToken } = require('../middlewares/authMiddleWare');

// Tạo URL thanh toán VNPay (cần đăng nhập)
router.post('/create-payment', verifyAccessToken, vnpayController.createPayment);

// Return URL - VNPay redirect về sau thanh toán (public, không cần token)
router.get('/return', vnpayController.vnpayReturn);

// IPN URL - VNPay server gọi để xác nhận (public)
router.get('/ipn', vnpayController.vnpayIPN);

module.exports = router;
