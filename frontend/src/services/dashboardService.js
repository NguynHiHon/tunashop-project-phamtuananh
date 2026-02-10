import { axiosJWT } from '../config/axiosJWT';

const API_URL = '/api/dashboard';

// Get overview statistics
export const getOverviewStats = async () => {
    const response = await axiosJWT.get(`${API_URL}/overview`);
    return response.data;
};

// Get revenue by period
export const getRevenueByPeriod = async (period = 'month', limit = 12) => {
    const response = await axiosJWT.get(`${API_URL}/revenue`, {
        params: { period, limit }
    });
    return response.data;
};

// Get recent orders
export const getRecentOrders = async (limit = 5) => {
    const response = await axiosJWT.get(`${API_URL}/recent-orders`, {
        params: { limit }
    });
    return response.data;
};

// Get top selling products
export const getTopSellingProducts = async (limit = 5) => {
    const response = await axiosJWT.get(`${API_URL}/top-products`, {
        params: { limit }
    });
    return response.data;
};

// Get order trends
export const getOrderTrends = async () => {
    const response = await axiosJWT.get(`${API_URL}/order-trends`);
    return response.data;
};

// Get inventory alerts
export const getInventoryAlerts = async () => {
    const response = await axiosJWT.get(`${API_URL}/inventory-alerts`);
    return response.data;
};
