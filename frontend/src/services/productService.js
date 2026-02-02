// Product Service - Chứa các API calls thuần túy
import { axiosPublic } from '../config/axiosPublic';
import { axiosJWT } from '../config/axiosJWT';

const API_BASE_URL = '/api/products';

// GET /api/products - Lấy danh sách
export const getProducts = async (params) => {
	const response = await axiosPublic.get(API_BASE_URL, { params });

	return response.data;
};

// GET /api/products/:id - Lấy chi tiết một sản phẩm
export const getProduct = async (id) => {
	const response = await axiosPublic.get(`${API_BASE_URL}/${id}`);
	return response.data;
};

// POST /api/products - Tạo sản phẩm mới (data may include images: [url,...] and defaultImageUrl)
export const createProduct = async (data) => {
	validateProductPayload(data, { requireRequired: true });
	const response = await axiosJWT.post(API_BASE_URL, data);

	return response.data;
};

// PUT /api/products/:id - Cập nhật sản phẩm (data may include images: [url,...])
export const updateProduct = async (id, data) => {

	validateProductPayload(data, { requireRequired: false });
	const response = await axiosJWT.put(`${API_BASE_URL}/${id}`, data);
	return response.data;
};

// DELETE /api/products/:id - Xóa sản phẩm
export const deleteProduct = async (id) => {
	const response = await axiosJWT.delete(`${API_BASE_URL}/${id}`);
	return response.data;
};

export const getAllProducts = async () => {
	const res = await axiosPublic.get(API_BASE_URL);
	return res.data;
};

export default { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getAllProducts };

// --- Validation helper ---
function isValidUrl(s) {
	try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch (e) { return false; }
}

export function validateProductPayload(data = {}, opts = { requireRequired: true }) {
	const errors = [];
	if (opts.requireRequired) {
		if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') errors.push('name is required');
		if (!data.productTypeId || typeof data.productTypeId !== 'string' || data.productTypeId.trim() === '') errors.push('productTypeId is required');
		if (data.price === undefined || data.price === null || isNaN(Number(data.price))) errors.push('price is required and must be a number');
	}
	if (data.stock !== undefined && (isNaN(Number(data.stock)) || Number(data.stock) < 0)) errors.push('stock must be a non-negative number');
	if (data.attributes !== undefined) {
		if (!Array.isArray(data.attributes)) errors.push('attributes must be an array');
		else data.attributes.forEach((a, idx) => {
			if (!a || !a.attributeId) errors.push(`attributes[${idx}].attributeId is required`);
			if (a.value === undefined) errors.push(`attributes[${idx}].value is required`);
		});
	}
	if (data.images !== undefined) {
		if (!Array.isArray(data.images)) errors.push('images must be an array of URLs');
		else data.images.forEach((u, idx) => { if (!isValidUrl(u)) errors.push(`images[${idx}] is not a valid URL`); });
	}

	if (errors.length > 0) {
		const err = new Error('Validation failed');
		err.details = errors;
		throw err;
	}
}

