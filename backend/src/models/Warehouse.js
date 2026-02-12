const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    // Thông tin cơ bản kho
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'Kho chính TunaShop'
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    hotline: {
        type: String,
        trim: true
    },

    // Địa chỉ kho
    address: {
        type: String,
        required: true
    },
    province: { type: String },
    district: { type: String },
    ward: { type: String },

    // Tọa độ (cho map)
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    mapUrl: { type: String }, // Google Maps embed URL

    // Social links for contact page
    social: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
    },

    // Thông tin hoạt động
    workingHours: {
        monday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
        tuesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
        wednesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
        thursday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
        friday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
        saturday: { open: { type: String, default: '08:00' }, close: { type: String, default: '17:00' }, isOpen: { type: Boolean, default: true } },
        sunday: { open: { type: String, default: '09:00' }, close: { type: String, default: '12:00' }, isOpen: { type: Boolean, default: false } },
    },

    // Nhân viên hỗ trợ chat (support staff)
    supportStaff: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isActive: { type: Boolean, default: true }, // Có đang làm việc không
        priority: { type: Number, default: 0 }, // Ưu tiên phân công (số cao = ưu tiên cao)
        maxConcurrentChats: { type: Number, default: 10 }, // Số chat tối đa cùng lúc
        currentChatCount: { type: Number, default: 0 }, // Đếm số chat đang handle
        assignedAt: { type: Date, default: Date.now }
    }],

    // Cách phân công chat
    chatAssignmentStrategy: {
        type: String,
        enum: ['round-robin', 'least-busy', 'random', 'priority'],
        default: 'least-busy'
    },

    // Index cho round-robin
    lastAssignedIndex: { type: Number, default: 0 },

    // Trạng thái kho
    isActive: { type: Boolean, default: true },

    // Ghi chú nội bộ
    notes: { type: String }
}, {
    timestamps: true
});

// Static method: Lấy warehouse settings (singleton)
warehouseSchema.statics.getWarehouse = async function () {
    let warehouse = await this.findOne().populate('supportStaff.userId', 'username email name phone role');
    if (!warehouse) {
        warehouse = await this.create({
            name: 'Kho chính TunaShop',
            email: 'kho@tunashop.vn',
            address: 'Số 123, Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
            phone: '0123 456 789',
            social: { facebook: '', instagram: '', youtube: '' }
        });
    }
    return warehouse;
};

// Static method: Cập nhật warehouse
warehouseSchema.statics.updateWarehouse = async function (data) {
    let warehouse = await this.findOne();
    if (!warehouse) {
        warehouse = await this.create(data);
    } else {
        Object.assign(warehouse, data);
        await warehouse.save();
    }
    return warehouse.populate('supportStaff.userId', 'username email name phone role');
};

// Static method: Lấy nhân viên support để phân công chat
warehouseSchema.statics.getAssignedSupportStaff = async function () {
    const warehouse = await this.findOne().populate('supportStaff.userId', 'username email name role');

    if (!warehouse || !warehouse.supportStaff || warehouse.supportStaff.length === 0) {
        return null;
    }

    // Lọc nhân viên đang active
    const activeStaff = warehouse.supportStaff.filter(s => s.isActive && s.userId);

    if (activeStaff.length === 0) {
        return null;
    }

    let assignedStaff;

    switch (warehouse.chatAssignmentStrategy) {
        case 'round-robin':
            // Lấy theo thứ tự vòng tròn
            const index = warehouse.lastAssignedIndex % activeStaff.length;
            assignedStaff = activeStaff[index];
            warehouse.lastAssignedIndex = (warehouse.lastAssignedIndex + 1) % activeStaff.length;
            await warehouse.save();
            break;

        case 'least-busy':
            // Lấy người ít chat nhất và chưa đạt max
            assignedStaff = activeStaff
                .filter(s => s.currentChatCount < s.maxConcurrentChats)
                .sort((a, b) => a.currentChatCount - b.currentChatCount)[0];
            break;

        case 'priority':
            // Lấy theo priority cao nhất
            assignedStaff = activeStaff
                .filter(s => s.currentChatCount < s.maxConcurrentChats)
                .sort((a, b) => b.priority - a.priority)[0];
            break;

        case 'random':
        default:
            // Random trong danh sách active
            assignedStaff = activeStaff[Math.floor(Math.random() * activeStaff.length)];
            break;
    }

    return assignedStaff ? assignedStaff.userId : null;
};

// Instance method: Thêm nhân viên support
warehouseSchema.methods.addSupportStaff = async function (userId, options = {}) {
    const exists = this.supportStaff.find(s => s.userId.toString() === userId.toString());
    if (exists) {
        throw new Error('Nhân viên này đã được phân công');
    }

    this.supportStaff.push({
        userId,
        isActive: options.isActive !== undefined ? options.isActive : true,
        priority: options.priority || 0,
        maxConcurrentChats: options.maxConcurrentChats || 10
    });

    await this.save();
    return this.populate('supportStaff.userId', 'username email name phone role');
};

// Helper to normalize various id shapes to string
const _normalizeId = (v) => {
    if (!v && v !== 0) return '';
    if (typeof v === 'string') return v;
    if (v._id) return String(v._id);
    if (v.toString) return v.toString();
    return String(v);
};

// Instance method: Xóa nhân viên support
warehouseSchema.methods.removeSupportStaff = async function (userId) {
    const id = _normalizeId(userId);
    this.supportStaff = this.supportStaff.filter(s => _normalizeId(s.userId) !== id);
    await this.save();
    return this.populate('supportStaff.userId', 'username email name phone role');
};

// Instance method: Cập nhật trạng thái nhân viên
warehouseSchema.methods.updateStaffStatus = async function (userId, updates) {
    const id = _normalizeId(userId);
    const staff = this.supportStaff.find(s => _normalizeId(s.userId) === id);
    if (!staff) {
        throw new Error('Không tìm thấy nhân viên');
    }

    Object.assign(staff, updates);
    await this.save();
    return this.populate('supportStaff.userId', 'username email name phone role');
};

// Instance method: Tăng số chat của nhân viên
warehouseSchema.methods.incrementChatCount = async function (userId) {
    const id = _normalizeId(userId);
    const staff = this.supportStaff.find(s => _normalizeId(s.userId) === id);
    if (staff) {
        staff.currentChatCount += 1;
        await this.save();
    }
};

// Instance method: Giảm số chat của nhân viên
warehouseSchema.methods.decrementChatCount = async function (userId) {
    const id = _normalizeId(userId);
    const staff = this.supportStaff.find(s => _normalizeId(s.userId) === id);
    if (staff && staff.currentChatCount > 0) {
        staff.currentChatCount -= 1;
        await this.save();
    }
};

module.exports = mongoose.model('Warehouse', warehouseSchema);
