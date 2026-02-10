import { axiosJWT } from '../config/axiosJWT';
import { axiosPublic } from '../config/axiosPublic';

const warehouseService = {
    // Lấy thông tin kho (public)
    async getWarehouse() {
        const response = await axiosPublic.get('/api/warehouse');
        return response.data;
    },

    // Cập nhật thông tin kho (admin)
    async updateWarehouse(data) {
        const response = await axiosJWT.put('/api/warehouse', data);
        return response.data;
    },

    // Lấy danh sách nhân viên support (admin)
    async getSupportStaff() {
        const response = await axiosJWT.get('/api/warehouse/support-staff');
        return response.data;
    },

    // Lấy danh sách user có thể làm support (admin)
    async getAvailableStaff() {
        const response = await axiosJWT.get('/api/warehouse/available-staff');
        return response.data;
    },

    // Thêm nhân viên support (admin)
    async addSupportStaff(userId, options = {}) {
        const response = await axiosJWT.post('/api/warehouse/support-staff', {
            userId,
            ...options
        });
        return response.data;
    },

    // Xóa nhân viên support (admin)
    async removeSupportStaff(userId) {
        const response = await axiosJWT.delete(`/api/warehouse/support-staff/${userId}`);
        return response.data;
    },

    // Cập nhật trạng thái nhân viên (admin)
    async updateStaffStatus(userId, updates) {
        const response = await axiosJWT.put(`/api/warehouse/support-staff/${userId}`, updates);
        return response.data;
    },

    // Lấy nhân viên được phân công để chat (user)
    async getAssignedSupport() {
        const response = await axiosJWT.get('/api/warehouse/assigned-support');
        return response.data;
    },

    // Cập nhật chiến lược phân công chat (admin)
    async updateChatStrategy(strategy) {
        const response = await axiosJWT.put('/api/warehouse/chat-strategy', { strategy });
        return response.data;
    }
};

export default warehouseService;
