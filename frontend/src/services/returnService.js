import { axiosJWT } from '../config/axiosJWT';

const API_URL = '/api/returns/admin';

const returnService = {
    async searchOrder(orderCode) {
        const res = await axiosJWT.get(`${API_URL}/search`, { params: { orderCode } });
        return res.data;
    },
    async createReturn(payload) {
        const res = await axiosJWT.post(API_URL, payload);
        return res.data;
    },
    async list(params = {}) {
        const res = await axiosJWT.get(API_URL, { params });
        return res.data;
    },
    async get(id) {
        const res = await axiosJWT.get(`${API_URL}/${id}`);
        return res.data;
    },
};

export default returnService;
