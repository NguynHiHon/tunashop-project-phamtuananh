const Attribute = require('../models/Attribute');

const attributeService = {
    // Lấy danh sách thuộc tính với phân trang, sắp xếp, tìm kiếm
    getMany: async ({ page = 1, perPage = 10, sortField = 'name', sortOrder = 'asc', search = '' }) => {
        try {
            const skip = (page - 1) * perPage;
            const sortDirection = sortOrder === 'desc' ? -1 : 1;

            // Build query với tìm kiếm
            let query = {};
            if (search) {
                query = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { name_vi: { $regex: search, $options: 'i' } },
                        { type: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            const [attributes, total] = await Promise.all([
                Attribute.find(query)
                    .sort({ [sortField]: sortDirection })
                    .skip(skip)
                    .limit(perPage),
                Attribute.countDocuments(query)
            ]);

            return {
                data: attributes,
                total,
                page,
                perPage,
                totalPages: Math.ceil(total / perPage)
            };
        } catch (error) {
            throw error;
        }
    },

    // Lấy tất cả thuộc tính (không phân trang)
    getAll: async () => {
        try {
            const attributes = await Attribute.find();
            return attributes;
        } catch (error) {
            throw error;
        }
    },

    // Lấy một thuộc tính theo ID
    getOne: async (id) => {
        try {
            const attribute = await Attribute.findById(id);
            if (!attribute) {
                const err = new Error('ATTRIBUTE_NOT_FOUND');
                err.status = 404;
                throw err;
            }
            return attribute;
        } catch (error) {
            throw error;
        }
    },

    // Tạo thuộc tính mới
    create: async (data) => {
        try {
            const { name, name_vi, type, options = [] } = data;

            if (!name || !name_vi || !type) {
                const err = new Error('INVALID_INPUT');
                err.status = 400;
                throw err;
            }

            // Validate type
            const validTypes = ['select', 'number', 'text', 'boolean', 'date'];
            if (!validTypes.includes(type)) {
                const err = new Error('INVALID_ATTRIBUTE_TYPE');
                err.status = 400;
                throw err;
            }

            // Kiểm tra tên đã tồn tại
            const existing = await Attribute.findOne({ name });
            if (existing) {
                const err = new Error('ATTRIBUTE_EXISTS');
                err.status = 409;
                throw err;
            }

            const attribute = await Attribute.create({ name, name_vi, type, options });
            return attribute;
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật thuộc tính
    update: async (id, data) => {
        try {
            const { name, name_vi, type, options } = data;

            const attribute = await Attribute.findById(id);
            if (!attribute) {
                const err = new Error('ATTRIBUTE_NOT_FOUND');
                err.status = 404;
                throw err;
            }

            // Kiểm tra tên trùng (trừ chính nó)
            if (name) {
                const existing = await Attribute.findOne({
                    _id: { $ne: id },
                    name
                });
                if (existing) {
                    const err = new Error('ATTRIBUTE_EXISTS');
                    err.status = 409;
                    throw err;
                }
            }

            // Validate type nếu có
            if (type) {
                const validTypes = ['select', 'number', 'text', 'boolean', 'date'];
                if (!validTypes.includes(type)) {
                    const err = new Error('INVALID_ATTRIBUTE_TYPE');
                    err.status = 400;
                    throw err;
                }
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (name_vi) updateData.name_vi = name_vi;
            if (type) updateData.type = type;
            if (options !== undefined) updateData.options = options;

            const updated = await Attribute.findByIdAndUpdate(id, updateData, { new: true });
            return updated;
        } catch (error) {
            throw error;
        }
    },

    // Xóa thuộc tính
    delete: async (id) => {
        try {
            const attribute = await Attribute.findById(id);
            if (!attribute) {
                const err = new Error('ATTRIBUTE_NOT_FOUND');
                err.status = 404;
                throw err;
            }

            await Attribute.findByIdAndDelete(id);
            return { message: 'Attribute deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = attributeService;