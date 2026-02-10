const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyAccessToken, verifyAdmin } = require('../middlewares/authMiddleWare');

// ============ USER ROUTES ============
// Create order
router.post('/', verifyAccessToken, orderController.createOrder);

// Get my orders
router.get('/my-orders', verifyAccessToken, orderController.getMyOrders);

// Get order by ID (user)
router.get('/my-orders/:id', verifyAccessToken, orderController.getOrderById);

// Cancel order (user)
router.post('/my-orders/:id/cancel', verifyAccessToken, orderController.cancelOrder);

// Get shipping info (public)
router.get('/shipping-info', orderController.getShippingInfo);

// ============ ADMIN ROUTES ============
// Get all orders
router.get('/admin', verifyAdmin, orderController.getAllOrders);

// Get order detail (admin)
router.get('/admin/:id', verifyAdmin, orderController.getOrderDetail);

// Update order status
router.patch('/admin/:id/status', verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
