const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

const SHIPPING_THRESHOLD = 500000; // Free shipping for orders >= 500k
const SHIPPING_FEE = 50000; // 50k shipping fee

// Calculate shipping fee based on subtotal
const calculateShippingFee = (subtotal) => {
    return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
};

// Helper: Deduct stock when order is placed
const deductStock = async (items) => {
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        const quantity = item.quantity;

        if (product.hasVariants && item.variantId) {
            // Has variant: deduct both variant stock and product total stock
            const variant = product.variants.id(item.variantId);
            if (variant) {
                variant.stock = Math.max(0, variant.stock - quantity);
            }
            product.stock = Math.max(0, product.stock - quantity);
        } else {
            // No variant: deduct product stock only
            product.stock = Math.max(0, product.stock - quantity);
        }

        await product.save();
    }
};

// Helper: Restore stock when order is cancelled/rejected
const restoreStock = async (items) => {
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        const quantity = item.quantity;

        if (product.hasVariants && item.variantId) {
            // Has variant: restore both variant stock and product total stock
            const variant = product.variants.id(item.variantId);
            if (variant) {
                variant.stock += quantity;
            }
            product.stock += quantity;
        } else {
            // No variant: restore product stock only
            product.stock += quantity;
        }

        await product.save();
    }
};

// Create order from cart or direct buy
const createOrder = async (userId, orderData) => {
    const { items, shippingAddress, note } = orderData;

    if (!items || items.length === 0) {
        throw new Error('Đơn hàng phải có ít nhất 1 sản phẩm');
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressDetail) {
        throw new Error('Thông tin giao hàng không đầy đủ');
    }

    // Validate and get product info
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
        const product = await Product.findById(item.productId).populate('defaultImageId');
        if (!product) {
            throw new Error(`Sản phẩm ${item.productId} không tồn tại`);
        }

        // Handle variant if applicable
        let variant = null;
        let variantInfo = null;
        let priceAdjustment = 0;
        let stockToCheck = product.stock;

        if (product.hasVariants) {
            if (!item.variantId) {
                throw new Error(`Vui lòng chọn size/màu sắc cho sản phẩm ${product.name}`);
            }
            variant = product.variants.id(item.variantId);
            if (!variant) {
                throw new Error(`Biến thể sản phẩm không tồn tại`);
            }
            if (!variant.isActive) {
                throw new Error(`Biến thể sản phẩm không khả dụng`);
            }
            stockToCheck = variant.stock;
            priceAdjustment = variant.priceAdjustment || 0;
            variantInfo = {
                size: variant.size,
                color: variant.color,
                colorCode: variant.colorCode,
                sku: variant.sku,
            };
        }

        // Check stock
        if (stockToCheck < item.quantity) {
            const variantDesc = variantInfo ? ` (${variantInfo.size || ''} ${variantInfo.color || ''})` : '';
            throw new Error(`Sản phẩm ${product.name}${variantDesc} không đủ số lượng (còn ${stockToCheck})`);
        }

        // Check if product is on sale (matching Product model virtual logic)
        const now = new Date();
        const isOnSale = product.salePercent > 0 &&
            (!product.saleStartAt || now >= new Date(product.saleStartAt)) &&
            (!product.saleEndAt || now <= new Date(product.saleEndAt));

        const basePrice = product.price + priceAdjustment;
        const finalPrice = isOnSale
            ? Math.round(basePrice * (1 - product.salePercent / 100))
            : basePrice;

        const itemSubtotal = finalPrice * item.quantity;

        const orderItem = {
            productId: product._id,
            productName: product.name,
            productImage: variant?.imageId?.url_Image || product.defaultImageId?.url_Image || '',
            price: basePrice,
            salePercent: isOnSale ? product.salePercent : 0,
            finalPrice,
            quantity: item.quantity,
            subtotal: itemSubtotal,
        };

        if (product.hasVariants && item.variantId) {
            orderItem.variantId = item.variantId;
            orderItem.variantInfo = variantInfo;
        }

        orderItems.push(orderItem);
        subtotal += itemSubtotal;
    }

    // Deduct stock for all items (both variant and product stock)
    await deductStock(items.map((item, idx) => ({
        productId: orderItems[idx].productId,
        variantId: item.variantId,
        quantity: item.quantity,
    })));

    const shippingFee = calculateShippingFee(subtotal);
    const total = subtotal + shippingFee;

    const order = new Order({
        userId,
        items: orderItems,
        shippingAddress,
        subtotal,
        shippingFee,
        total,
        paymentMethod: 'cod',
        status: 'pending',
        statusHistory: [{
            status: 'pending',
            changedAt: new Date(),
            changedBy: userId,
            note: 'Đơn hàng được tạo',
        }],
        note,
    });

    await order.save();
    return order;
};

// Get orders for user
const getUserOrders = async (userId, options = {}) => {
    const { page = 1, limit = 10, status } = options;
    const query = { userId };
    if (status) query.status = status;

    const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'username email');

    const total = await Order.countDocuments(query);

    return {
        data: orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

// Get order by ID
const getOrderById = async (orderId, userId = null) => {
    const query = { _id: orderId };
    if (userId) query.userId = userId;

    const order = await Order.findOne(query)
        .populate('userId', 'username email phone')
        .populate('statusHistory.changedBy', 'username');

    if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
    }

    return order;
};

// Get all orders (admin)
const getAllOrders = async (options = {}) => {
    const { page = 1, limit = 20, status, search } = options;
    const query = {};

    if (status) query.status = status;
    if (search) {
        query.$or = [
            { orderCode: { $regex: search, $options: 'i' } },
            { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
            { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
        ];
    }

    const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'username email phone');

    const total = await Order.countDocuments(query);

    // Get stats
    const stats = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    return {
        data: orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        stats: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    };
};

// Update order status (admin)
const updateOrderStatus = async (orderId, newStatus, adminId, note = '') => {
    const validTransitions = {
        pending: ['approved', 'rejected'],
        approved: ['shipping', 'cancelled'],
        shipping: ['delivered', 'cancelled'],
        rejected: [],
        cancelled: [],
        delivered: [],
    };

    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
    }

    if (!validTransitions[order.status]?.includes(newStatus)) {
        throw new Error(`Không thể chuyển từ "${order.status}" sang "${newStatus}"`);
    }

    order.status = newStatus;
    order.statusHistory.push({
        status: newStatus,
        changedAt: new Date(),
        changedBy: adminId,
        note,
    });

    if (newStatus === 'rejected') {
        order.rejectionReason = note;
        // Restore stock when order is rejected
        await restoreStock(order.items);
    }

    if (newStatus === 'cancelled') {
        // Restore stock when order is cancelled by admin
        await restoreStock(order.items);
    }

    if (newStatus === 'delivered') {
        order.deliveredAt = new Date();
    }

    await order.save();
    return order;
};

// Cancel order (user)
const cancelOrder = async (orderId, userId, reason = '') => {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
    }

    if (!['pending', 'approved'].includes(order.status)) {
        throw new Error('Chỉ có thể hủy đơn hàng đang chờ duyệt hoặc đã duyệt');
    }

    order.status = 'cancelled';
    order.statusHistory.push({
        status: 'cancelled',
        changedAt: new Date(),
        changedBy: userId,
        note: reason || 'Khách hàng hủy đơn',
    });

    // Restore stock when order is cancelled by user
    await restoreStock(order.items);

    await order.save();
    return order;
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    calculateShippingFee,
    SHIPPING_THRESHOLD,
    SHIPPING_FEE,
};
