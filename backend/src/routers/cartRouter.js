const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyAccessToken } = require('../middlewares/authMiddleWare');

// All cart routes require authentication
router.use(verifyAccessToken);

// Get cart
router.get('/', cartController.getCart);

// Get cart count (for header badge)
router.get('/count', cartController.getCartCount);

// Add to cart
router.post('/add', cartController.addToCart);

// Update item quantity
router.patch('/item/:productId', cartController.updateCartItem);

// Remove item from cart
router.delete('/item/:productId', cartController.removeFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;
