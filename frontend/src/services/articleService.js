import { axiosJWT } from '../config/axiosJWT';
import { axiosPublic } from '../config/axiosPublic';

const API_URL = '/api/articles';

// ============ PUBLIC ============

// Get published articles
export const getPublishedArticles = async (params = {}) => {
    const response = await axiosPublic.get(`${API_URL}/published`, { params });
    return response.data;
};

// Get featured articles
export const getFeaturedArticles = async (limit = 5) => {
    const response = await axiosPublic.get(`${API_URL}/featured`, { params: { limit } });
    return response.data;
};

// Get latest articles
export const getLatestArticles = async (limit = 6) => {
    const response = await axiosPublic.get(`${API_URL}/latest`, { params: { limit } });
    return response.data;
};

// Get article by slug
export const getArticleBySlug = async (slug) => {
    const response = await axiosPublic.get(`${API_URL}/slug/${slug}`);
    return response.data;
};

// ============ ADMIN ============

// Get all articles (admin)
export const getAllArticles = async (params = {}) => {
    const response = await axiosJWT.get(`${API_URL}/admin`, { params });
    return response.data;
};

// Get article by ID (admin)
export const getArticleById = async (id) => {
    const response = await axiosJWT.get(`${API_URL}/admin/${id}`);
    return response.data;
};

// Create article
export const createArticle = async (data) => {
    const response = await axiosJWT.post(`${API_URL}/admin`, data);
    return response.data;
};

// Update article
export const updateArticle = async (id, data) => {
    const response = await axiosJWT.put(`${API_URL}/admin/${id}`, data);
    return response.data;
};

// Delete article
export const deleteArticle = async (id) => {
    const response = await axiosJWT.delete(`${API_URL}/admin/${id}`);
    return response.data;
};

// Publish article
export const publishArticle = async (id) => {
    const response = await axiosJWT.post(`${API_URL}/admin/${id}/publish`);
    return response.data;
};

// Archive article
export const archiveArticle = async (id) => {
    const response = await axiosJWT.post(`${API_URL}/admin/${id}/archive`);
    return response.data;
};
