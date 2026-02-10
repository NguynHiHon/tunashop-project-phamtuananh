import { axiosJWT } from '../config/axiosJWT';

const API_URL = '/api/cart';

// Get cart
export const getCart = async () => {
    const response = await axiosJWT.get(API_URL);
    return response.data;
};

// Get cart count
export const getCartCount = async () => {
    const response = await axiosJWT.get(`${API_URL}/count`);
    return response.data;
};

// Add to cart
export const addToCart = async (productId, quantity = 1, variantId = null) => {
    const payload = { productId, quantity };
    if (variantId) payload.variantId = variantId;
    const response = await axiosJWT.post(`${API_URL}/add`, payload);
    return response.data;
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity, variantId = null) => {
    const params = variantId ? `?variantId=${variantId}` : '';
    const response = await axiosJWT.patch(`${API_URL}/item/${productId}${params}`, { quantity });
    return response.data;
};

// Remove from cart
export const removeFromCart = async (productId, variantId = null) => {
    const params = variantId ? `?variantId=${variantId}` : '';
    const response = await axiosJWT.delete(`${API_URL}/item/${productId}${params}`);
    return response.data;
};

// Clear cart
export const clearCart = async () => {
    const response = await axiosJWT.delete(`${API_URL}/clear`);
    return response.data;
};
