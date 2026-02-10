const cartService = require('../services/cartService');

// Get cart
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await cartService.getCart(userId);

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Add to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity = 1, variantId = null } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'productId là bắt buộc',
            });
        }

        const cart = await cartService.addToCart(userId, productId, quantity, variantId);

        res.json({
            success: true,
            message: 'Đã thêm vào giỏ hàng',
            data: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { quantity } = req.body;
        const variantId = req.query.variantId || null;

        if (typeof quantity !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'quantity phải là số',
            });
        }

        const cart = await cartService.updateCartItem(userId, productId, quantity, variantId);

        res.json({
            success: true,
            message: 'Đã cập nhật giỏ hàng',
            data: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Remove from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { variantId = null } = req.query;

        const cart = await cartService.removeFromCart(userId, productId, variantId);

        res.json({
            success: true,
            message: 'Đã xóa khỏi giỏ hàng',
            data: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await cartService.clearCart(userId);

        res.json({
            success: true,
            message: 'Đã xóa giỏ hàng',
            data: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get cart count
const getCartCount = async (req, res) => {
    try {
        const userId = req.user._id;
        const count = await cartService.getCartCount(userId);

        res.json({
            success: true,
            data: { count },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount,
};
