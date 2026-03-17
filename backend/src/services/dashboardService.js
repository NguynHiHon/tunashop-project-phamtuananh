const User = require('../models/Users');
const Product = require('../models/Product');
const ProductType = require('../models/ProductType');
const Order = require('../models/Order');
const Article = require('../models/Article');

// Get overview statistics
const getOverviewStats = async () => {
    const [
        totalUsers,
        usersByRole,
        totalProducts,
        totalProductTypes,
        productsOnSale,
        lowStockProducts,
        orderStats,
        revenueStats,
        totalArticles,
    ] = await Promise.all([
        // Total users
        User.countDocuments(),

        // Users by role
        User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),

        // Total products
        Product.countDocuments(),

        // Total product types
        ProductType.countDocuments(),

        // Products on sale (currently active)
        // Consider saleStartAt/saleEndAt optional: if not provided, treat as unbounded
        Product.countDocuments({
            salePercent: { $gt: 0 },
            $and: [
                {
                    $or: [
                        { saleStartAt: { $exists: false } },
                        { saleStartAt: null },
                        { saleStartAt: { $lte: new Date() } },
                    ]
                },
                {
                    $or: [
                        { saleEndAt: { $exists: false } },
                        { saleEndAt: null },
                        { saleEndAt: { $gte: new Date() } },
                    ]
                }
            ]
        }),

        // Low stock products (<=5 items)
        Product.countDocuments({ stock: { $lte: 5 } }),

        // Order statistics by status
        Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } }
        ]),

        // Revenue stats - only from delivered orders
        Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$total' }
                }
            }
        ]),

        // Total articles
        Article.countDocuments(),
    ]);

    // Process user roles
    const userRoles = usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {
        user: 0, staff: 0, admin: 0
    });

    // Process order stats
    const orderStatusStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        shipping: 0,
        cancelled: 0,
        delivered: 0,
        returned: 0,
    };
    let totalOrdersCount = 0;
    orderStats.forEach(s => {
        orderStatusStats[s._id] = s.count;
        totalOrdersCount += s.count;
    });

    // Revenue info
    const revenue = revenueStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    return {
        users: {
            total: totalUsers,
            byRole: userRoles,
        },
        products: {
            total: totalProducts,
            categories: totalProductTypes,
            onSale: productsOnSale,
            lowStock: lowStockProducts,
        },
        orders: {
            total: totalOrdersCount,
            byStatus: orderStatusStats,
            pending: orderStatusStats.pending,
            processing: orderStatusStats.approved + orderStatusStats.shipping,
            completed: orderStatusStats.delivered,
            cancelled: orderStatusStats.cancelled + orderStatusStats.rejected,
            returned: orderStatusStats.returned,
        },
        revenue: {
            total: Math.round(revenue.totalRevenue),
            ordersDelivered: revenue.totalOrders,
            avgOrderValue: Math.round(revenue.avgOrderValue || 0),
        },
        articles: {
            total: totalArticles,
        },
    };
};

// Get revenue by time period
const getRevenueByPeriod = async (period = 'month', limit = 12) => {
    let dateFormat;
    let dateGroup;

    switch (period) {
        case 'day':
            dateFormat = '%Y-%m-%d';
            dateGroup = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
            break;
        case 'week':
            dateFormat = '%Y-%U';
            dateGroup = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
            break;
        case 'month':
        default:
            dateFormat = '%Y-%m';
            dateGroup = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
            break;
    }

    const revenues = await Order.aggregate([
        { $match: { status: 'delivered' } },
        {
            $group: {
                _id: dateGroup,
                revenue: { $sum: '$total' },
                orders: { $sum: 1 },
                date: { $first: '$createdAt' }
            }
        },
        { $sort: { date: -1 } },
        { $limit: limit },
        { $sort: { date: 1 } }
    ]);

    return revenues.map(r => ({
        period: r._id,
        revenue: r.revenue,
        orders: r.orders,
    }));
};

// Get recent orders
const getRecentOrders = async (limit = 5) => {
    return Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'username email name')
        .select('orderCode status total createdAt shippingAddress');
};

// Get top selling products
const getTopSellingProducts = async (limit = 5) => {
    const topProducts = await Order.aggregate([
        { $match: { status: 'delivered' } },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.productId',
                productName: { $first: '$items.productName' },
                productImage: { $first: '$items.productImage' },
                totalSold: { $sum: '$items.quantity' },
                totalRevenue: { $sum: '$items.subtotal' }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit }
    ]);

    return topProducts;
};

// Get order trends (last 7 days)
const getOrderTrends = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trends = await Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                orders: { $sum: 1 },
                revenue: { $sum: '$total' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return trends.map(t => ({
        date: `${t._id.year}-${String(t._id.month).padStart(2, '0')}-${String(t._id.day).padStart(2, '0')}`,
        orders: t.orders,
        revenue: t.revenue,
    }));
};

// Get inventory alerts
const getInventoryAlerts = async () => {
    const outOfStock = await Product.find({ stock: 0 })
        .select('name stock price')
        .populate('defaultImageId', 'url_Image')
        .limit(10);

    const lowStock = await Product.find({ stock: { $gt: 0, $lte: 5 } })
        .select('name stock price')
        .populate('defaultImageId', 'url_Image')
        .limit(10);

    return {
        outOfStock: outOfStock.map(p => ({
            _id: p._id,
            name: p.name,
            stock: p.stock,
            price: p.price,
            image: p.defaultImageId?.url_Image,
        })),
        lowStock: lowStock.map(p => ({
            _id: p._id,
            name: p.name,
            stock: p.stock,
            price: p.price,
            image: p.defaultImageId?.url_Image,
        })),
    };
};

module.exports = {
    getOverviewStats,
    getRevenueByPeriod,
    getRecentOrders,
    getTopSellingProducts,
    getOrderTrends,
    getInventoryAlerts,
};
