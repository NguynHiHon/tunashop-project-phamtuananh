const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    variantInfo: {
        size: { type: String },
        color: { type: String },
        colorCode: { type: String },
        sku: { type: String },
    },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
}, { _id: false });

const returnSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderCode: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [returnItemSchema], default: [] },
    refundAmount: { type: Number, required: true },
    status: { type: String, enum: ['confirmed'], default: 'confirmed' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String },
    note: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Return', returnSchema);
