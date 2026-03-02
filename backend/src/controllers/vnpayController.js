const Order = require('../models/Order');
const vnpayService = require('../services/vnpayService');

// Tạo URL thanh toán VNPay từ đơn hàng đã tạo
const createPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        if (order.paymentMethod !== 'vnpay') {
            return res.status(400).json({ success: false, message: 'Đơn hàng không sử dụng phương thức VNPay' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Đơn hàng đã được thanh toán' });
        }

        // Lấy IP của client
        const ipAddr =
            req.headers['x-forwarded-for'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            '127.0.0.1';

        const paymentUrl = vnpayService.createPaymentUrl(order, ipAddr);

        res.json({
            success: true,
            data: { paymentUrl },
        });
    } catch (error) {
        console.error('[VNPay] createPayment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Return URL - VNPay redirect về đây sau khi khách thanh toán
// Backend xác thực chữ ký, cập nhật paymentStatus, rồi redirect về frontend
const vnpayReturn = async (req, res) => {
    try {
        const result = vnpayService.verifyReturnData(req.query);

        const frontendBase = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

        if (!result.isValid) {
            // Chữ ký không hợp lệ - có thể bị giả mạo
            return res.redirect(
                `${frontendBase}/vnpay-return?status=invalid&message=Chu+ky+khong+hop+le`
            );
        }

        // Cập nhật paymentStatus dựa trên orderCode (txnRef)
        const order = await Order.findOne({ orderCode: result.txnRef });

        if (order) {
            if (result.isSuccess) {
                order.paymentStatus = 'paid';
                await order.save();
                // Chỉ khi thanh toán thành công mới thông báo cho admin
                const { emitNewOrder } = require('../socket/socketUtils');
                emitNewOrder(order);
            } else {
                // Thanh toán thất bại/hủy → tự động hủy đơn hàng
                order.paymentStatus = 'failed';
                order.status = 'cancelled';
                order.statusHistory.push({
                    status: 'cancelled',
                    changedAt: new Date(),
                    note: `VNPay: Thanh toán thất bại (mã ${result.responseCode})`,
                });
                await order.save();
                // Hoàn trả tồn kho
                const Product = require('../models/Product');
                for (const item of order.items) {
                    const product = await Product.findById(item.productId);
                    if (!product) continue;
                    if (product.hasVariants && item.variantId) {
                        const variant = product.variants.id(item.variantId);
                        if (variant) variant.stock += item.quantity;
                        product.stock += item.quantity;
                    } else {
                        product.stock += item.quantity;
                    }
                    await product.save();
                }
            }
        }

        const status = result.isSuccess ? 'success' : 'failed';
        const orderId = order ? order._id.toString() : '';

        return res.redirect(
            `${frontendBase}/vnpay-return?status=${status}&orderId=${orderId}&orderCode=${result.txnRef}&amount=${order?.total || ''}&responseCode=${result.responseCode}`
        );
    } catch (error) {
        console.error('[VNPay] vnpayReturn error:', error);
        const frontendBase = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
        return res.redirect(`${frontendBase}/vnpay-return?status=error`);
    }
};

// IPN URL - VNPay server gọi để xác nhận giao dịch (server-to-server)
// Cần HTTPS trên production; để lại để hoàn chỉnh flow
const vnpayIPN = async (req, res) => {
    try {
        const result = vnpayService.verifyReturnData(req.query);

        if (!result.isValid) {
            return res.json({ RspCode: '97', Message: 'Chu ky khong hop le' });
        }

        const order = await Order.findOne({ orderCode: result.txnRef });

        if (!order) {
            return res.json({ RspCode: '01', Message: 'Khong tim thay don hang' });
        }

        if (order.paymentStatus === 'paid') {
            return res.json({ RspCode: '02', Message: 'Don hang da thanh toan' });
        }

        // So sánh số tiền để tránh gian lận
        if (Math.round(order.total) !== result.amount) {
            return res.json({ RspCode: '04', Message: 'So tien khong hop le' });
        }

        order.paymentStatus = result.isSuccess ? 'paid' : 'failed';
        await order.save();

        return res.json({ RspCode: '00', Message: 'Xac nhan thanh cong' });
    } catch (error) {
        console.error('[VNPay] IPN error:', error);
        return res.json({ RspCode: '99', Message: 'Loi he thong' });
    }
};

module.exports = {
    createPayment,
    vnpayReturn,
    vnpayIPN,
};
