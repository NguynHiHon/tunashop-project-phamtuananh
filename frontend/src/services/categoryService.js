import { axiosJWT } from '../config/axiosJWT';

// ============ PRODUCT TYPES ============

export const getProductTypes = async (params = {}) => {
    const response = await axiosJWT.get('/api/product-types', { params });
    return response.data;
};

export const getAllProductTypes = async () => {
    const response = await axiosJWT.get('/api/product-types/all');
    return response.data;
};

export const getProductType = async (id) => {
    const response = await axiosJWT.get(`/api/product-types/${id}`);
    return response.data;
};

export const createProductType = async (data) => {
    const response = await axiosJWT.post('/api/product-types', data);
    return response.data;
};

export const updateProductType = async (id, data) => {
    const response = await axiosJWT.put(`/api/product-types/${id}`, data);
    return response.data;
};

export const deleteProductType = async (id) => {
    const response = await axiosJWT.delete(`/api/product-types/${id}`);
    return response.data;
};

// ============ ATTRIBUTES ============

export const getAttributes = async (params = {}) => {
    const response = await axiosJWT.get('/api/attributes', { params });
    return response.data;
};

export const getAllAttributes = async () => {
    const response = await axiosJWT.get('/api/attributes/all');
    return response.data;
};

export const getAttribute = async (id) => {
    const response = await axiosJWT.get(`/api/attributes/${id}`);
    return response.data;
};

export const createAttribute = async (data) => {
    const response = await axiosJWT.post('/api/attributes', data);
    return response.data;
};

export const updateAttribute = async (id, data) => {
    const response = await axiosJWT.put(`/api/attributes/${id}`, data);
    return response.data;
};

export const deleteAttribute = async (id) => {
    const response = await axiosJWT.delete(`/api/attributes/${id}`);
    return response.data;
};