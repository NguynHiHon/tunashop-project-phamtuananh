const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null, // null if product has no variants
    },
    // Store variant info for display (size, color)
    variantInfo: {
        size: { type: String },
        color: { type: String },
        colorCode: { type: String },
        sku: { type: String },
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
}, {
    timestamps: true,
});

// Virtual to calculate total items
cartSchema.virtual('totalItems').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
