const attributeService = require('../services/attributeService');

const attributeController = {
    // GET /api/attributes - Lấy danh sách với phân trang
    getMany: async (req, res) => {
        try {
            const { page = 1, perPage = 10, sortField = 'name', sortOrder = 'asc', search = '' } = req.query;

            const result = await attributeService.getMany({
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

    // GET /api/attributes/all - Lấy tất cả (không phân trang)
    getAll: async (req, res) => {
        try {
            const attributes = await attributeService.getAll();
            return res.status(200).json({ data: attributes });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    // GET /api/attributes/:id - Lấy một thuộc tính
    getOne: async (req, res) => {
        try {
            const { id } = req.params;
            const attribute = await attributeService.getOne(id);
            return res.status(200).json({ data: attribute });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    // POST /api/attributes - Tạo thuộc tính mới
    create: async (req, res) => {
        try {
            const attribute = await attributeService.create(req.body);
            return res.status(201).json({
                message: 'Attribute created successfully',
                data: attribute
            });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    // PUT /api/attributes/:id - Cập nhật thuộc tính
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const attribute = await attributeService.update(id, req.body);
            return res.status(200).json({
                message: 'Attribute updated successfully',
                data: attribute
            });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    // DELETE /api/attributes/:id - Xóa thuộc tính
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await attributeService.delete(id);
            return res.status(200).json(result);
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    }
};

module.exports = attributeController;