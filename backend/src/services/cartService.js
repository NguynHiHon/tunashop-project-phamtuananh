const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart with populated product info
const getCart = async (userId) => {
    let cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        populate: { path: 'defaultImageId' },
    });

    if (!cart) {
        cart = new Cart({ userId, items: [] });
        await cart.save();
    }

    // Calculate totals and check product availability
    const items = [];
    let subtotal = 0;

    for (const item of cart.items) {
        if (!item.productId) continue; // Product was deleted

        const product = item.productId;

        // Check if product is on sale (matching Product model virtual logic)
        const now = new Date();
        const isOnSale = product.salePercent > 0 &&
            (!product.saleStartAt || now >= new Date(product.saleStartAt)) &&
            (!product.saleEndAt || now <= new Date(product.saleEndAt));

        // Get variant info if applicable
        let variant = null;
        let variantStock = product.stock;
        let priceAdjustment = 0;

        if (product.hasVariants && item.variantId) {
            variant = product.variants?.id(item.variantId);
            if (variant) {
                variantStock = variant.stock;
                priceAdjustment = variant.priceAdjustment || 0;
            }
        }

        const basePrice = product.price + priceAdjustment;
        const finalPrice = isOnSale
            ? Math.round(basePrice * (1 - product.salePercent / 100))
            : basePrice;

        const itemSubtotal = finalPrice * item.quantity;
        subtotal += itemSubtotal;

        items.push({
            productId: product._id,
            variantId: item.variantId || null,
            variantInfo: item.variantInfo || null,
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                basePrice,
                salePercent: isOnSale ? product.salePercent : 0,
                finalPrice,
                isOnSale,
                hasVariants: product.hasVariants,
                image: variant?.imageId?.url_Image || product.defaultImageId?.url_Image || '',
                stock: variantStock,
            },
            quantity: item.quantity,
            subtotal: itemSubtotal,
            addedAt: item.addedAt,
        });
    }

    // Calculate shipping
    const shippingFee = subtotal >= 500000 ? 0 : (subtotal > 0 ? 50000 : 0);
    const total = subtotal + shippingFee;

    return {
        _id: cart._id,
        userId: cart.userId,
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        shippingFee,
        freeShippingThreshold: 500000,
        amountToFreeShipping: Math.max(0, 500000 - subtotal),
        total,
    };
};

// Add item to cart (with optional variant)
const addToCart = async (userId, productId, quantity = 1, variantId = null) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Sản phẩm không tồn tại');
    }

    // Validate variant if product has variants
    let variantInfo = null;
    if (product.hasVariants) {
        if (!variantId) {
            throw new Error('Vui lòng chọn size/màu sắc');
        }
        const variant = product.variants.id(variantId);
        if (!variant) {
            throw new Error('Biến thể sản phẩm không tồn tại');
        }
        if (!variant.isActive) {
            throw new Error('Biến thể sản phẩm không khả dụng');
        }
        if (variant.stock < quantity) {
            throw new Error('Số lượng vượt quá tồn kho');
        }
        variantInfo = {
            size: variant.size,
            color: variant.color,
            colorCode: variant.colorCode,
            sku: variant.sku,
        };
    } else {
        if (product.stock < quantity) {
            throw new Error('Số lượng vượt quá tồn kho');
        }
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, items: [] });
    }

    // Check if product (with same variant) already in cart
    const existingItemIndex = cart.items.findIndex((item) => {
        const sameProduct = item.productId.toString() === productId.toString();
        const sameVariant = product.hasVariants
            ? (item.variantId?.toString() === variantId?.toString())
            : true;
        return sameProduct && sameVariant;
    });

    if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        const newItem = {
            productId,
            quantity,
            addedAt: new Date(),
        };
        if (product.hasVariants && variantId) {
            newItem.variantId = variantId;
            newItem.variantInfo = variantInfo;
        }
        cart.items.push(newItem);
    }

    await cart.save();
    return getCart(userId);
};

// Update item quantity in cart (with optional variant)
const updateCartItem = async (userId, productId, quantity, variantId = null) => {
    if (quantity < 1) {
        return removeFromCart(userId, productId, variantId);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new Error('Giỏ hàng không tồn tại');
    }

    const itemIndex = cart.items.findIndex((item) => {
        const sameProduct = item.productId.toString() === productId.toString();
        const sameVariant = variantId
            ? (item.variantId?.toString() === variantId?.toString())
            : !item.variantId;
        return sameProduct && sameVariant;
    });

    if (itemIndex < 0) {
        throw new Error('Sản phẩm không có trong giỏ hàng');
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    return getCart(userId);
};

// Remove item from cart (with optional variant)
const removeFromCart = async (userId, productId, variantId = null) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new Error('Giỏ hàng không tồn tại');
    }

    cart.items = cart.items.filter((item) => {
        const sameProduct = item.productId.toString() === productId.toString();
        const sameVariant = variantId
            ? (item.variantId?.toString() === variantId?.toString())
            : !item.variantId;
        return !(sameProduct && sameVariant);
    });

    await cart.save();
    return getCart(userId);
};

// Clear cart
const clearCart = async (userId) => {
    const cart = await Cart.findOne({ userId });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    return { items: [], totalItems: 0, subtotal: 0, shippingFee: 0, total: 0 };
};

// Get cart item count
const getCartCount = async (userId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount,
};
