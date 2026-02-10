const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { verifyAccessToken, verifyAdmin } = require('../middlewares/authMiddleWare');

// Public routes
// GET /api/warehouse - Lấy thông tin kho (công khai - cho trang liên hệ)
router.get('/', warehouseController.getWarehouse);

// GET /api/warehouse/assigned-support - Lấy nhân viên support để chat (cần đăng nhập)
router.get('/assigned-support', verifyAccessToken, warehouseController.getAssignedSupport);

// Admin/Staff routes
// GET /api/warehouse/support-staff - Lấy danh sách nhân viên support (admin only)
router.get('/support-staff', verifyAdmin, warehouseController.getSupportStaff);

// GET /api/warehouse/available-staff - Lấy user có thể làm support (admin only)
router.get('/available-staff', verifyAdmin, warehouseController.getAvailableStaff);

// PUT /api/warehouse - Cập nhật thông tin kho (admin only)
router.put('/', verifyAdmin, warehouseController.updateWarehouse);

// POST /api/warehouse/support-staff - Thêm nhân viên support (admin only)
router.post('/support-staff', verifyAdmin, warehouseController.addSupportStaff);

// DELETE /api/warehouse/support-staff/:userId - Xóa nhân viên support (admin only)
router.delete('/support-staff/:userId', verifyAdmin, warehouseController.removeSupportStaff);

// PUT /api/warehouse/support-staff/:userId - Cập nhật trạng thái nhân viên (admin only)
router.put('/support-staff/:userId', verifyAdmin, warehouseController.updateStaffStatus);

// PUT /api/warehouse/chat-strategy - Cập nhật chiến lược phân công (admin only)
router.put('/chat-strategy', verifyAdmin, warehouseController.updateChatStrategy);

module.exports = router;
