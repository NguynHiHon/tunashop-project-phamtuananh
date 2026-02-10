const dashboardService = require('../services/dashboardService');

// Get overview statistics
const getOverviewStats = async (req, res) => {
    try {
        const stats = await dashboardService.getOverviewStats();
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get revenue by period
const getRevenueByPeriod = async (req, res) => {
    try {
        const { period = 'month', limit = 12 } = req.query;
        const data = await dashboardService.getRevenueByPeriod(period, parseInt(limit));
        res.json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get recent orders
const getRecentOrders = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const orders = await dashboardService.getRecentOrders(parseInt(limit));
        res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get top selling products
const getTopSellingProducts = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const products = await dashboardService.getTopSellingProducts(parseInt(limit));
        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get order trends
const getOrderTrends = async (req, res) => {
    try {
        const trends = await dashboardService.getOrderTrends();
        res.json({
            success: true,
            data: trends,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get inventory alerts
const getInventoryAlerts = async (req, res) => {
    try {
        const alerts = await dashboardService.getInventoryAlerts();
        res.json({
            success: true,
            data: alerts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getOverviewStats,
    getRevenueByPeriod,
    getRecentOrders,
    getTopSellingProducts,
    getOrderTrends,
    getInventoryAlerts,
};
