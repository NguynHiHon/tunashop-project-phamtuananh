const productTypeService = require('../services/productTypeService');

const productTypeController = {
    // GET /api/product-types - Lấy danh sách với phân trang
    getMany: async (req, res) => {
        try {
            const { page = 1, perPage = 10, sortField = 'name', sortOrder = 'asc', search = '' } = req.query;

            const result = await productTypeService.getMany({
                page: parseInt(page),
                perPage: parseInt(perPage),
                sortField,
                sortOrder,
                search
            });

            return res.status(200).json(result);
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    // GET /api/product-types/all - Lấy tất cả (không phân trang)
    getAll: async (req, res) => {
        try {
            const productTypes = await productTypeService.getAll();
            return res.status(200).json({ data: productTypes });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    // GET /api/product-types/:id - Lấy một loại sản phẩm
    getOne: async (req, res) => {
        try {
            const { id } = req.params;
            const productType = await productTypeService.getOne(id);
            return res.status(200).json({ data: productType });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    // POST /api/product-types - Tạo loại sản phẩm mới
    create: async (req, res) => {
        try {
            const productType = await productTypeService.create(req.body);
            return res.status(201).json({
                message: 'Product type created successfully',
                data: productType
            });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    // PUT /api/product-types/:id - Cập nhật loại sản phẩm
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const productType = await productTypeService.update(id, req.body);
            return res.status(200).json({
                message: 'Product type updated successfully',
                data: productType
            });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    // DELETE /api/product-types/:id - Xóa loại sản phẩm
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await productTypeService.delete(id);
            return res.status(200).json(result);
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    }
};

module.exports = productTypeController;