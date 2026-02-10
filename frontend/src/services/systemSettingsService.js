import { axiosJWT } from '../config/axiosJWT';
import axiosPublic from '../config/axiosPublic';

const API_URL = '/api/settings';

// Public: Get contact info
export const getContactInfo = async () => {
    const response = await axiosPublic.get(`${API_URL}/contact`);
    return response.data;
};

// Public: Get shipping settings
export const getShippingSettings = async () => {
    const response = await axiosPublic.get(`${API_URL}/shipping`);
    return response.data;
};

// Admin: Get all settings
export const getSettings = async () => {
    const response = await axiosJWT.get(`${API_URL}`);
    return response.data;
};

// Admin: Update settings
export const updateSettings = async (data) => {
    const response = await axiosJWT.put(`${API_URL}`, data);
    return response.data;
};

// Admin: Update shipping settings
export const updateShippingSettings = async (data) => {
    const response = await axiosJWT.put(`${API_URL}/shipping`, data);
    return response.data;
};

// Admin: Add branch
export const addBranch = async (branchData) => {
    const response = await axiosJWT.post(`${API_URL}/branches`, branchData);
    return response.data;
};

// Admin: Update branch
export const updateBranch = async (branchId, branchData) => {
    const response = await axiosJWT.put(`${API_URL}/branches/${branchId}`, branchData);
    return response.data;
};

// Admin: Delete branch
export const deleteBranch = async (branchId) => {
    const response = await axiosJWT.delete(`${API_URL}/branches/${branchId}`);
    return response.data;
};
