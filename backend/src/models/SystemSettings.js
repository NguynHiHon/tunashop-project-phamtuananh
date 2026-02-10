const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema({
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    twitter: { type: String, trim: true },
    zalo: { type: String, trim: true },
}, { _id: false });

const workingHoursSchema = new mongoose.Schema({
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } },
}, { _id: false });

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    isMainBranch: { type: Boolean, default: false },
    mapUrl: { type: String }, // Google Maps embed URL
    coordinates: {
        lat: Number,
        lng: Number,
    },
});

const bankAccountSchema = new mongoose.Schema({
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    branch: { type: String },
    qrCodeUrl: { type: String },
}, { _id: false });

const systemSettingsSchema = new mongoose.Schema({
    // Basic Info
    siteName: {
        type: String,
        default: 'TunaShop',
    },
    logoUrl: {
        type: String,
    },
    faviconUrl: {
        type: String,
    },
    description: {
        type: String,
        maxlength: 500,
    },

    // Contact Info
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
    },
    hotline: {
        type: String,
    },

    // Main Address (Warehouse/HQ)
    address: {
        type: String,
        required: true,
    },
    province: { type: String },
    district: { type: String },
    ward: { type: String },

    // Social Links
    socialLinks: socialLinksSchema,

    // Working Hours
    workingHours: workingHoursSchema,

    // Branches/Stores
    branches: [branchSchema],

    // Bank Accounts for payment
    bankAccounts: [bankAccountSchema],

    // Shipping Settings
    shippingSettings: {
        freeShippingThreshold: { type: Number, default: 500000 },
        defaultShippingFee: { type: Number, default: 50000 },
        estimatedDeliveryDays: { type: Number, default: 3 },
    },

    // Business Registration
    businessInfo: {
        companyName: { type: String },
        taxCode: { type: String },
        registrationNumber: { type: String },
    },

    // SEO Settings
    seoSettings: {
        metaTitle: { type: String },
        metaDescription: { type: String },
        metaKeywords: [{ type: String }],
        ogImage: { type: String },
    },

    // Footer Content
    footerContent: {
        aboutText: { type: String, maxlength: 1000 },
        copyrightText: { type: String },
    },

    // Maintenance Mode
    maintenanceMode: {
        isEnabled: { type: Boolean, default: false },
        message: { type: String },
    },

    // Email Settings (for notifications)
    emailSettings: {
        smtpHost: { type: String },
        smtpPort: { type: Number },
        smtpUser: { type: String },
        smtpPassword: { type: String },
        fromEmail: { type: String },
        fromName: { type: String },
    },

    // Store Policies
    policies: {
        returnPolicy: { type: String },
        privacyPolicy: { type: String },
        termsOfService: { type: String },
        shippingPolicy: { type: String },
    },
}, {
    timestamps: true,
});

// Ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            email: 'contact@tunashop.vn',
            phone: '0123 456 789',
            address: 'Số 123, Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
        });
    }
    return settings;
};

systemSettingsSchema.statics.updateSettings = async function (data) {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create(data);
    } else {
        Object.assign(settings, data);
        await settings.save();
    }
    return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
