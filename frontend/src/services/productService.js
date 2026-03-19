import { axiosJWT } from '../config/axiosJWT';
import { axiosPublic } from '../config/axiosPublic';

// ============ ADMIN (authenticated) ============

export const getProducts = async (params = {}) => {
    const response = await axiosJWT.get('/api/products', { params });
    return response.data;
};

export const getProduct = async (id) => {
    const response = await axiosJWT.get(`/api/products/${id}`);
    return response.data;
};

export const createProduct = async (data) => {
    const response = await axiosJWT.post('/api/products', data);
    return response.data;
};

export const updateProduct = async (id, data) => {
    const response = await axiosJWT.put(`/api/products/${id}`, data);
    return response.data;
};

export const updateProductSale = async (id, data) => {
    const response = await axiosJWT.put(`/api/products/${id}/sale`, data);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axiosJWT.delete(`/api/products/${id}`);
    return response.data;
};

// ============ PUBLIC ============

export const getAllProducts = async (params = {}) => {
    const response = await axiosPublic.get('/api/products', { params });
    return response.data;
};

export const getProductTypesPublic = async () => {
    const response = await axiosPublic.get('/api/product-types/all');
    return response.data;
};

export const getBrands = async () => {
    const response = await axiosPublic.get('/api/products/brands');
    return response.data;
};

// ============ SUPPLIERS (admin) ============

export const getSuppliers = async (params = {}) => {
    const response = await axiosJWT.get('/api/suppliers', { params });
    return response.data;
};

export const createSupplier = async (data) => {
    const response = await axiosJWT.post('/api/suppliers', data);
    return response.data;
};

// ============ VALIDATION ============

export const validateProductPayload = (payload) => {
    const errors = [];
    if (!payload.name || !payload.name.trim()) errors.push('Tên sản phẩm là bắt buộc');
    if (!payload.productTypeId) errors.push('Loại sản phẩm là bắt buộc');
    if (payload.price === undefined || payload.price === '' || isNaN(Number(payload.price))) errors.push('Giá phải là số hợp lệ');
    if (payload.stock !== undefined && (isNaN(Number(payload.stock)) || Number(payload.stock) < 0)) errors.push('Số lượng tồn kho phải >= 0');
    return errors;
};
