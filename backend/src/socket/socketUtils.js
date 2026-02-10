// Socket instance holder
let io = null;

const setIO = (socketIO) => {
    io = socketIO;
};

const getIO = () => {
    return io;
};

// Emit to admins/staff only
const emitToAdmins = async (event, data) => {
    if (!io) return;

    // Emit to admin room
    io.to('admin_room').emit(event, data);
};

// Emit new order notification
const emitNewOrder = async (order) => {
    if (!io) {
        console.log('emitNewOrder: io is null, cannot emit');
        return;
    }

    const orderData = {
        orderId: order._id,
        orderCode: order.orderCode,
        customerName: order.shippingAddress?.name || 'Khách hàng',
        total: order.total,
        createdAt: order.createdAt,
    };
    
    console.log('Emitting new_order event:', orderData);
    io.emit('new_order', orderData);
};

// Emit order status update
const emitOrderStatusUpdate = async (order) => {
    if (!io) return;

    // Emit to specific user
    const userId = order.user?.toString() || order.user?._id?.toString();
    if (userId) {
        io.to(userId).emit('order_status_updated', {
            orderId: order._id,
            orderCode: order.orderCode,
            status: order.status,
            updatedAt: order.updatedAt,
        });
    }

    // Also emit to admin room
    io.emit('order_updated', {
        orderId: order._id,
        orderCode: order.orderCode,
        status: order.status,
    });
};

module.exports = {
    setIO,
    getIO,
    emitToAdmins,
    emitNewOrder,
    emitOrderStatusUpdate,
};
