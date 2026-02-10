const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyAdmin } = require('../middlewares/authMiddleWare');

// All dashboard routes require admin access
router.use(verifyAdmin);

// Get overview statistics
router.get('/overview', dashboardController.getOverviewStats);

// Get revenue by period
router.get('/revenue', dashboardController.getRevenueByPeriod);

// Get recent orders
router.get('/recent-orders', dashboardController.getRecentOrders);

// Get top selling products
router.get('/top-products', dashboardController.getTopSellingProducts);

// Get order trends (last 7 days)
router.get('/order-trends', dashboardController.getOrderTrends);

// Get inventory alerts
router.get('/inventory-alerts', dashboardController.getInventoryAlerts);

module.exports = router;
