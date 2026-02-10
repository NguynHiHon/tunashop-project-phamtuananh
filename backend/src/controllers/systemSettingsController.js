const systemSettingsService = require('../services/systemSettingsService');

// Get all settings (admin)
const getSettings = async (req, res) => {
    try {
        const settings = await systemSettingsService.getSettings();
        res.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Update settings (admin)
const updateSettings = async (req, res) => {
    try {
        const settings = await systemSettingsService.updateSettings(req.body);
        res.json({
            success: true,
            message: 'Cập nhật cài đặt thành công',
            data: settings,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get public contact info
const getContactInfo = async (req, res) => {
    try {
        const contactInfo = await systemSettingsService.getContactInfo();
        res.json({
            success: true,
            data: contactInfo,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Add branch
const addBranch = async (req, res) => {
    try {
        const settings = await systemSettingsService.addBranch(req.body);
        res.status(201).json({
            success: true,
            message: 'Thêm chi nhánh thành công',
            data: settings.branches,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Update branch
const updateBranch = async (req, res) => {
    try {
        const settings = await systemSettingsService.updateBranch(req.params.branchId, req.body);
        res.json({
            success: true,
            message: 'Cập nhật chi nhánh thành công',
            data: settings.branches,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete branch
const deleteBranch = async (req, res) => {
    try {
        const settings = await systemSettingsService.deleteBranch(req.params.branchId);
        res.json({
            success: true,
            message: 'Xóa chi nhánh thành công',
            data: settings.branches,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get shipping settings
const getShippingSettings = async (req, res) => {
    try {
        const shippingSettings = await systemSettingsService.getShippingSettings();
        res.json({
            success: true,
            data: shippingSettings,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Update shipping settings
const updateShippingSettings = async (req, res) => {
    try {
        const shippingSettings = await systemSettingsService.updateShippingSettings(req.body);
        res.json({
            success: true,
            message: 'Cập nhật cài đặt vận chuyển thành công',
            data: shippingSettings,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getContactInfo,
    addBranch,
    updateBranch,
    deleteBranch,
    getShippingSettings,
    updateShippingSettings,
};
