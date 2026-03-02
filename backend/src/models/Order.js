const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    variantInfo: {
        size: { type: String },
        color: { type: String },
        colorCode: { type: String },
        sku: { type: String },
    },
    productName: {
        type: String,
        required: true,
    },
    productImage: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    salePercent: {
        type: Number,
        default: 0,
    },
    finalPrice: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    subtotal: {
        type: Number,
        required: true,
    },
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    provinceCode: {
        type: String,
    },
    provinceName: {
        type: String,
    },
    districtCode: {
        type: String,
    },
    districtName: {
        type: String,
    },
    wardCode: {
        type: String,
    },
    wardName: {
        type: String,
    },
    addressDetail: {
        type: String,
        required: true,
    },
});

const orderSchema = new mongoose.Schema({
    orderCode: {
        type: String,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    subtotal: {
        type: Number,
        required: true,
    },
    shippingFee: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'vnpay'],
        default: 'cod',
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'failed'],
        default: 'unpaid',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'shipping', 'cancelled', 'delivered'],
        default: 'pending',
    },
    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
    }],
    note: {
        type: String,
    },
    rejectionReason: {
        type: String,
    },
    deliveredAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Generate order code before saving (Mongoose 9.x - no need for next callback)
orderSchema.pre('save', function () {
    if (!this.orderCode) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.orderCode = `TN${year}${month}${day}${random}`;
    }
});

// Virtual for formatted status
orderSchema.virtual('statusText').get(function () {
    const statusMap = {
        pending: 'Đang chờ duyệt',
        approved: 'Đã duyệt',
        rejected: 'Từ chối',
        shipping: 'Đang giao hàng',
        cancelled: 'Đã hủy',
        delivered: 'Giao thành công',
    };
    return statusMap[this.status] || this.status;
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
