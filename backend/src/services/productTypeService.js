const ProductType = require('../models/ProductType');
const Attribute = require('../models/Attribute');

const productTypeService = {
    // Lấy danh sách loại sản phẩm với phân trang, sắp xếp, tìm kiếm
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
                        { name_vi: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            const [productTypes, total] = await Promise.all([
                ProductType.find(query)
                    .populate('listAttributeIds')
                    .sort({ [sortField]: sortDirection })
                    .skip(skip)
                    .limit(perPage),
                ProductType.countDocuments(query)
            ]);

            return {
                data: productTypes,
                total,
                page,
                perPage,
                totalPages: Math.ceil(total / perPage)
            };
        } catch (error) {
            throw error;
        }
    },

    // Lấy tất cả loại sản phẩm (không phân trang)
    getAll: async () => {
        try {
            const productTypes = await ProductType.find().populate('listAttributeIds');
            return productTypes;
        } catch (error) {
            throw error;
        }
    },

    // Lấy một loại sản phẩm theo ID
    getOne: async (id) => {
        try {
            const productType = await ProductType.findById(id).populate('listAttributeIds');
            if (!productType) {
                const err = new Error('PRODUCT_TYPE_NOT_FOUND');
                err.status = 404;
                throw err;
            }
            return productType;
        } catch (error) {
            throw error;
        }
    },

    // Tạo loại sản phẩm mới
    create: async (data) => {
        try {
            const { name, name_vi, listAttributeIds = [] } = data;

            if (!name || !name_vi) {
                const err = new Error('INVALID_INPUT');
                err.status = 400;
                throw err;
            }

            // Kiểm tra tên đã tồn tại
            const existing = await ProductType.findOne({
                $or: [{ name }, { name_vi }]
            });
            if (existing) {
                const err = new Error('PRODUCT_TYPE_EXISTS');
                err.status = 409;
                throw err;
            }

            // Kiểm tra các attribute ID có tồn tại không
            if (listAttributeIds.length > 0) {
                const attributes = await Attribute.find({ _id: { $in: listAttributeIds } });
                if (attributes.length !== listAttributeIds.length) {
                    const err = new Error('INVALID_ATTRIBUTE_IDS');
                    err.status = 400;
                    throw err;
                }
            }

            const productType = await ProductType.create({ name, name_vi, listAttributeIds });
            return await ProductType.findById(productType._id).populate('listAttributeIds');
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật loại sản phẩm
    update: async (id, data) => {
        try {
            const { name, name_vi, listAttributeIds } = data;

            const productType = await ProductType.findById(id);
            if (!productType) {
                const err = new Error('PRODUCT_TYPE_NOT_FOUND');
                err.status = 404;
                throw err;
            }

            // Kiểm tra tên trùng (trừ chính nó)
            if (name || name_vi) {
                const existing = await ProductType.findOne({
                    _id: { $ne: id },
                    $or: [
                        ...(name ? [{ name }] : []),
                        ...(name_vi ? [{ name_vi }] : [])
                    ]
                });
                if (existing) {
                    const err = new Error('PRODUCT_TYPE_EXISTS');
                    err.status = 409;
                    throw err;
                }
            }

            // Kiểm tra các attribute ID có tồn tại không
            if (listAttributeIds && listAttributeIds.length > 0) {
                const attributes = await Attribute.find({ _id: { $in: listAttributeIds } });
                if (attributes.length !== listAttributeIds.length) {
                    const err = new Error('INVALID_ATTRIBUTE_IDS');
                    err.status = 400;
                    throw err;
                }
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (name_vi) updateData.name_vi = name_vi;
            if (listAttributeIds !== undefined) updateData.listAttributeIds = listAttributeIds;

            const updated = await ProductType.findByIdAndUpdate(id, updateData, { new: true })
                .populate('listAttributeIds');
            return updated;
        } catch (error) {
            throw error;
        }
    },

    // Xóa loại sản phẩm
    delete: async (id) => {
        try {
            const productType = await ProductType.findById(id);
            if (!productType) {
                const err = new Error('PRODUCT_TYPE_NOT_FOUND');
                err.status = 404;
                throw err;
            }

            await ProductType.findByIdAndDelete(id);
            return { message: 'Product type deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = productTypeService;