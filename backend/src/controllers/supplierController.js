const supplierService = require('../services/supplierService');

const supplierController = {
    async list(req, res) {
        try {
            const { search, limit } = req.query;
            const items = await supplierService.list({ search, limit });
            return res.json({ data: items });
        } catch (err) {
            return res.status(500).json({ message: err.message || 'Internal server error' });
        }
    },

    async create(req, res) {
        try {
            const supplier = await supplierService.create(req.body);
            return res.status(201).json({ data: supplier });
        } catch (err) {
            return res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const supplier = await supplierService.update(id, req.body);
            return res.json({ data: supplier });
        } catch (err) {
            return res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
        }
    },

    async remove(req, res) {
        try {
            const { id } = req.params;
            await supplierService.remove(id);
            return res.json({ message: 'Supplier deleted' });
        } catch (err) {
            return res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
        }
    },
};

module.exports = supplierController;
