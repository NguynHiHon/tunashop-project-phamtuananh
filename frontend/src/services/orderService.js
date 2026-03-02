import { axiosJWT } from '../config/axiosJWT';
import { axiosPublic } from '../config/axiosPublic';

const API_URL = '/api/orders';

// Create order
export const createOrder = async (orderData) => {
    const response = await axiosJWT.post(API_URL, orderData);
    return response.data;
};

// Get my orders
export const getMyOrders = async (params = {}) => {
    const response = await axiosJWT.get(`${API_URL}/my-orders`, { params });
    return response.data;
};

// Get order by ID
export const getOrderById = async (id) => {
    const response = await axiosJWT.get(`${API_URL}/my-orders/${id}`);
    return response.data;
};

// Cancel order
export const cancelOrder = async (id, reason = '') => {
    const response = await axiosJWT.post(`${API_URL}/my-orders/${id}/cancel`, { reason });
    return response.data;
};

// Get shipping info (public)
export const getShippingInfo = async () => {
    const response = await axiosPublic.get(`${API_URL}/shipping-info`);
    return response.data;
};

// ============ ADMIN ============

// Get all orders (admin)
export const getAllOrders = async (params = {}) => {
    const response = await axiosJWT.get(`${API_URL}/admin`, { params });
    return response.data;
};

// Get order detail (admin)
export const getOrderDetail = async (id) => {
    const response = await axiosJWT.get(`${API_URL}/admin/${id}`);
    return response.data;
};

// Update order status (admin)
export const updateOrderStatus = async (id, status, note = '') => {
    const response = await axiosJWT.patch(`${API_URL}/admin/${id}/status`, { status, note });
    return response.data;
};

// Tạo URL thanh toán VNPay từ orderId
export const createVNPayPayment = async (orderId) => {
    const response = await axiosJWT.post('/api/vnpay/create-payment', { orderId });
    return response.data;
};

