const warehouseService = require('../services/warehouseService');

const warehouseController = {
    // GET /api/warehouse - Lấy thông tin kho
    async getWarehouse(req, res) {
        try {
            const warehouse = await warehouseService.getWarehouse();
            res.json({
                status: 'success',
                data: warehouse
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // PUT /api/warehouse - Cập nhật thông tin kho
    async updateWarehouse(req, res) {
        try {
            const warehouse = await warehouseService.updateWarehouse(req.body);
            res.json({
                status: 'success',
                message: 'Cập nhật thông tin kho thành công',
                data: warehouse
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // GET /api/warehouse/support-staff - Lấy danh sách nhân viên support
    async getSupportStaff(req, res) {
        try {
            const staff = await warehouseService.getSupportStaff();
            res.json({
                status: 'success',
                data: staff
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // GET /api/warehouse/available-staff - Lấy danh sách user có thể làm support
    async getAvailableStaff(req, res) {
        try {
            const staff = await warehouseService.getAvailableStaff();
            res.json({
                status: 'success',
                data: staff
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // POST /api/warehouse/support-staff - Thêm nhân viên support
    async addSupportStaff(req, res) {
        try {
            const { userId, isActive, priority, maxConcurrentChats } = req.body;

            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Thiếu userId'
                });
            }

            const warehouse = await warehouseService.addSupportStaff(userId, {
                isActive,
                priority,
                maxConcurrentChats
            });

            res.json({
                status: 'success',
                message: 'Đã phân công nhân viên hỗ trợ chat',
                data: warehouse
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // DELETE /api/warehouse/support-staff/:userId - Xóa nhân viên support
    async removeSupportStaff(req, res) {
        try {
            const { userId } = req.params;
            const warehouse = await warehouseService.removeSupportStaff(userId);

            res.json({
                status: 'success',
                message: 'Đã xóa nhân viên khỏi danh sách hỗ trợ',
                data: warehouse
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // PUT /api/warehouse/support-staff/:userId - Cập nhật trạng thái nhân viên
    async updateStaffStatus(req, res) {
        try {
            const { userId } = req.params;
            const updates = req.body;

            const warehouse = await warehouseService.updateStaffStatus(userId, updates);

            res.json({
                status: 'success',
                message: 'Cập nhật trạng thái nhân viên thành công',
                data: warehouse
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // GET /api/warehouse/assigned-support - Lấy nhân viên được phân công (cho khách hàng chat)
    async getAssignedSupport(req, res) {
        try {
            const staff = await warehouseService.getAssignedSupportStaff();

            if (!staff) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Không có nhân viên hỗ trợ sẵn sàng'
                });
            }

            res.json({
                status: 'success',
                data: staff
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    // PUT /api/warehouse/chat-strategy - Cập nhật chiến lược phân công chat
    async updateChatStrategy(req, res) {
        try {
            const { strategy } = req.body;
            const warehouse = await warehouseService.updateChatAssignmentStrategy(strategy);

            res.json({
                status: 'success',
                message: 'Cập nhật chiến lược phân công thành công',
                data: warehouse
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
};

module.exports = warehouseController;
