import { axiosPublic } from '../config/axiosPublic';
import { axiosJWT } from '../config/axiosJWT';

const API = '/api/contact';

const contactService = {
    // public
    async send(data) {
        const res = await axiosPublic.post(API, data);
        return res.data;
    },
    // admin
    async list(params = {}) {
        const res = await axiosJWT.get(API, { params });
        return res.data;
    },
    async get(id) {
        const res = await axiosJWT.get(`${API}/${id}`);
        return res.data;
    },
    async update(id, updates) {
        const res = await axiosJWT.put(`${API}/${id}`, updates);
        return res.data;
    },
    async remove(id) {
        const res = await axiosJWT.delete(`${API}/${id}`);
        return res.data;
    }
};

export default contactService;