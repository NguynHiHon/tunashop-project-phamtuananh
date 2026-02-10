const SystemSettings = require('../models/SystemSettings');

// Get system settings (public)
const getSettings = async () => {
    return SystemSettings.getSettings();
};

// Update system settings (admin only)
const updateSettings = async (data) => {
    return SystemSettings.updateSettings(data);
};

// Get public contact info only
const getContactInfo = async () => {
    const settings = await SystemSettings.getSettings();
    return {
        siteName: settings.siteName,
        email: settings.email,
        phone: settings.phone,
        hotline: settings.hotline,
        address: settings.address,
        province: settings.province,
        district: settings.district,
        ward: settings.ward,
        socialLinks: settings.socialLinks,
        workingHours: settings.workingHours,
        branches: settings.branches,
    };
};

// Add branch
const addBranch = async (branchData) => {
    const settings = await SystemSettings.getSettings();
    settings.branches.push(branchData);
    await settings.save();
    return settings;
};

// Update branch
const updateBranch = async (branchId, branchData) => {
    const settings = await SystemSettings.getSettings();
    const branch = settings.branches.id(branchId);
    if (!branch) {
        throw new Error('Chi nhánh không tồn tại');
    }
    Object.assign(branch, branchData);
    await settings.save();
    return settings;
};

// Delete branch
const deleteBranch = async (branchId) => {
    const settings = await SystemSettings.getSettings();
    settings.branches.pull(branchId);
    await settings.save();
    return settings;
};

// Get shipping settings
const getShippingSettings = async () => {
    const settings = await SystemSettings.getSettings();
    return settings.shippingSettings;
};

// Update shipping settings
const updateShippingSettings = async (shippingData) => {
    const settings = await SystemSettings.getSettings();
    Object.assign(settings.shippingSettings, shippingData);
    await settings.save();
    return settings.shippingSettings;
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
