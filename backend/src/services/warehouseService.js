const Warehouse = require('../models/Warehouse');
const User = require('../models/Users');

const warehouseService = {
    // Lấy thông tin kho (singleton)
    async getWarehouse() {
        return await Warehouse.getWarehouse();
    },

    // Cập nhật thông tin kho
    async updateWarehouse(data) {
        return await Warehouse.updateWarehouse(data);
    },

    // Lấy danh sách nhân viên support
    async getSupportStaff() {
        const warehouse = await Warehouse.getWarehouse();
        return warehouse.supportStaff || [];
    },

    // Lấy danh sách user có thể làm support (staff hoặc admin)
    async getAvailableStaff() {
        const warehouse = await Warehouse.getWarehouse();
        const assignedIds = warehouse.supportStaff.map(s => s.userId?._id?.toString() || s.userId?.toString());

        // Lấy staff/admin chưa được phân công
        const availableUsers = await User.find({
            role: { $in: ['staff', 'admin'] },
            _id: { $nin: assignedIds }
        }).select('username email name phone role');

        return availableUsers;
    },

    // Thêm nhân viên support
    async addSupportStaff(userId, options = {}) {
        // Kiểm tra user có tồn tại và là staff/admin
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Không tìm thấy người dùng');
        }
        if (!['staff', 'admin'].includes(user.role)) {
            throw new Error('Chỉ có thể phân công staff hoặc admin');
        }

        const warehouse = await Warehouse.getWarehouse();
        return await warehouse.addSupportStaff(userId, options);
    },

    // Xóa nhân viên support
    async removeSupportStaff(userId) {
        const warehouse = await Warehouse.getWarehouse();
        return await warehouse.removeSupportStaff(userId);
    },

    // Cập nhật trạng thái nhân viên
    async updateStaffStatus(userId, updates) {
        const warehouse = await Warehouse.getWarehouse();
        return await warehouse.updateStaffStatus(userId, updates);
    },

    // Lấy nhân viên được phân công để chat
    async getAssignedSupportStaff() {
        return await Warehouse.getAssignedSupportStaff();
    },

    // Tăng số chat của nhân viên
    async incrementChatCount(userId) {
        const warehouse = await Warehouse.getWarehouse();
        await warehouse.incrementChatCount(userId);
    },

    // Giảm số chat của nhân viên
    async decrementChatCount(userId) {
        const warehouse = await Warehouse.getWarehouse();
        await warehouse.decrementChatCount(userId);
    },

    // Cập nhật chiến lược phân công chat
    async updateChatAssignmentStrategy(strategy) {
        const validStrategies = ['round-robin', 'least-busy', 'random', 'priority'];
        if (!validStrategies.includes(strategy)) {
            throw new Error('Chiến lược phân công không hợp lệ');
        }

        const warehouse = await Warehouse.getWarehouse();
        warehouse.chatAssignmentStrategy = strategy;
        await warehouse.save();
        return warehouse;
    }
};

module.exports = warehouseService;
