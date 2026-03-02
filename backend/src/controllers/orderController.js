const orderService = require('../services/orderService');
const cartService = require('../services/cartService');
const { emitNewOrder, emitOrderStatusUpdate } = require('../socket/socketUtils');

// Create order
const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { items, shippingAddress, note, paymentMethod = 'cod', clearCartAfter = true } = req.body;

        const order = await orderService.createOrder(userId, {
            items,
            shippingAddress,
            note,
            paymentMethod,
        });

        // Chỉ clear cart server-side cho COD (VNPay tự clear sau khi thanh toán thành công)
        if (order.paymentMethod === 'cod' && clearCartAfter) {
            await cartService.clearCart(userId);
        }

        // Chỉ thông báo admin với COD (VNPay sẽ thông báo sau khi thanh toán thành công)
        if (order.paymentMethod === 'cod') {
            emitNewOrder(order);
        }

        res.status(201).json({
            success: true,
            message: order.paymentMethod === 'vnpay'
                ? 'Đang chuyển đến trang thanh toán VNPay'
                : 'Đặt hàng thành công',
            data: order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get user's orders
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const result = await orderService.getUserOrders(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get order by ID (user)
const getOrderById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const order = await orderService.getOrderById(id, userId);

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Cancel order (user)
const cancelOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { reason } = req.body;

        const order = await orderService.cancelOrder(id, userId, reason);

        // Emit order status update notification
        emitOrderStatusUpdate(order);

        res.json({
            success: true,
            message: 'Đã hủy đơn hàng',
            data: order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ============ ADMIN ============

// Get all orders (admin)
const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;

        const result = await orderService.getAllOrders({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            search,
        });

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get order detail (admin)
const getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
    try {
        const adminId = req.user._id;
        const { id } = req.params;
        const { status, note } = req.body;

        const order = await orderService.updateOrderStatus(id, status, adminId, note);

        // Emit order status update notification to user
        emitOrderStatusUpdate(order);

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: order,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get shipping info
const getShippingInfo = async (req, res) => {
    res.json({
        success: true,
        data: {
            threshold: orderService.SHIPPING_THRESHOLD,
            fee: orderService.SHIPPING_FEE,
        },
    });
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    getOrderDetail,
    updateOrderStatus,
    getShippingInfo,
};
