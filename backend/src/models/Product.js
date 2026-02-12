// Product model
const mongoose = require('mongoose');

// Variant schema for size/color combinations
const VariantSchema = new mongoose.Schema({
    sku: { type: String }, // Unique SKU for this variant
    size: { type: String, trim: true }, // e.g., "S", "M", "L", "XL", "39", "40", "41"
    color: { type: String, trim: true }, // e.g., "Đỏ", "Xanh", "Đen"
    colorCode: { type: String, trim: true }, // Hex color code e.g., "#FF0000"
    stock: { type: Number, default: 0, min: 0 },
    priceAdjustment: { type: Number, default: 0 }, // Additional price for this variant
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, // Specific image for this variant
    isActive: { type: Boolean, default: true },
}, { _id: true });

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    productTypeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ProductType' },
    attributes: [
        {
            attributeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Attribute' },
            value: { type: String, required: true }
        }
    ],
    price: { type: Number, required: true },
    // Simple per-product sale fields (one active sale at a time)
    salePercent: { type: Number, min: 0, max: 100, default: 0 },
    saleStartAt: { type: Date },
    saleEndAt: { type: Date },
    warranty: { type: String }, // e.g. "12 tháng"
    stock: { type: Number, default: 0 }, // Total stock (for products without variants)

    // Variant support
    hasVariants: { type: Boolean, default: false },
    variants: [VariantSchema],
    // Available sizes and colors for this product (for quick filtering)
    availableSizes: [{ type: String }],
    availableColors: [{
        name: { type: String },
        code: { type: String } // Hex color code
    }],

    defaultImageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    imageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    description: { type: String }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Helper to check if date is within sale window
function isWithinSaleWindow(saleStartAt, saleEndAt) {
    const now = new Date();
    // If saleStartAt exists and is a valid date, check if now >= startDate
    // If saleStartAt doesn't exist or is invalid, consider it as "started immediately"
    const startDate = saleStartAt ? new Date(saleStartAt) : null;
    const endDate = saleEndAt ? new Date(saleEndAt) : null;

    const startOk = !startDate || isNaN(startDate.getTime()) || startDate.getTime() <= now.getTime();
    const endOk = !endDate || isNaN(endDate.getTime()) || endDate.getTime() >= now.getTime();

    return startOk && endOk;
}

// Final price considering sale window, percent/absolute discount
ProductSchema.virtual('finalPrice').get(function () {
    const { price, salePercent, saleStartAt, saleEndAt } = this;
    const inWindow = isWithinSaleWindow(saleStartAt, saleEndAt);
    if (!inWindow) return price;

    const pct = Number(salePercent) || 0;
    const hasPct = pct > 0;

    let discounted = price;
    if (hasPct) discounted = Math.max(0, price * (1 - pct / 100));
    return discounted;
});

ProductSchema.virtual('isOnSale').get(function () {
    const { salePercent, saleStartAt, saleEndAt } = this;
    const hasValue = (Number(salePercent) || 0) > 0;
    if (!hasValue) return false;
    return isWithinSaleWindow(saleStartAt, saleEndAt);
});

// Sale status for debugging/display purposes
ProductSchema.virtual('saleStatus').get(function () {
    const { salePercent, saleStartAt, saleEndAt } = this;
    const hasValue = (Number(salePercent) || 0) > 0;
    if (!hasValue) return 'none';

    const now = new Date();
    const startDate = saleStartAt ? new Date(saleStartAt) : null;
    const endDate = saleEndAt ? new Date(saleEndAt) : null;

    if (startDate && !isNaN(startDate.getTime()) && startDate.getTime() > now.getTime()) {
        return 'scheduled'; // Sale is scheduled for the future
    }
    if (endDate && !isNaN(endDate.getTime()) && endDate.getTime() < now.getTime()) {
        return 'expired'; // Sale has ended
    }
    return 'active'; // Sale is currently active
});

// Virtual for total stock (sum of all variant stocks if hasVariants, else stock field)
ProductSchema.virtual('totalStock').get(function () {
    if (this.hasVariants && this.variants?.length > 0) {
        return this.variants
            .filter(v => v.isActive)
            .reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return this.stock || 0;
});

// Method to get variant price (base price + adjustment, apply sale if active)
ProductSchema.methods.getVariantPrice = function (variantId) {
    if (!this.hasVariants || !variantId) return this.finalPrice;

    const variant = this.variants.id(variantId);
    if (!variant) return this.finalPrice;

    const basePrice = this.price + (variant.priceAdjustment || 0);

    // Apply sale if active
    const now = new Date();
    const inWindow = (!this.saleStartAt || this.saleStartAt <= now) && (!this.saleEndAt || this.saleEndAt >= now);
    if (!inWindow) return basePrice;

    const pct = Number(this.salePercent) || 0;
    if (pct > 0) return Math.max(0, basePrice * (1 - pct / 100));
    return basePrice;
};

// Method to get variant stock
ProductSchema.methods.getVariantStock = function (variantId) {
    if (!this.hasVariants || !variantId) return this.stock;

    const variant = this.variants.id(variantId);
    return variant ? variant.stock : 0;
};

// Method to check if specific variant is available
ProductSchema.methods.isVariantAvailable = function (variantId, quantity = 1) {
    if (!this.hasVariants || !variantId) return this.stock >= quantity;

    const variant = this.variants.id(variantId);
    return variant && variant.isActive && variant.stock >= quantity;
};

// Pre-save hook to update availableSizes and availableColors from variants
ProductSchema.pre('save', function () {
    if (this.hasVariants && this.variants?.length > 0) {
        // Extract unique sizes
        const sizes = [...new Set(this.variants
            .filter(v => v.isActive && v.size)
            .map(v => v.size))];
        this.availableSizes = sizes;

        // Extract unique colors
        const colorMap = new Map();
        this.variants
            .filter(v => v.isActive && v.color)
            .forEach(v => {
                if (!colorMap.has(v.color)) {
                    colorMap.set(v.color, { name: v.color, code: v.colorCode || '' });
                }
            });
        this.availableColors = Array.from(colorMap.values());
    }
});

module.exports = mongoose.model('Product', ProductSchema);