const returnService = require('../services/returnService');

const returnController = {
    async searchOrder(req, res) {
        try {
            const { orderCode } = req.query;
            const order = await returnService.findOrderByCode(orderCode);
            return res.json({ success: true, data: order });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async createReturn(req, res) {
        try {
            const processedBy = req.user._id;
            const { orderCode, items, note, reason } = req.body;
            const record = await returnService.createReturn({ orderCode, items, note, reason, processedBy });
            return res.status(201).json({ success: true, data: record });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    async listReturns(req, res) {
        try {
            const { page = 1, limit = 20, search } = req.query;
            const result = await returnService.listReturns({
                page: parseInt(page),
                limit: parseInt(limit),
                search,
            });
            return res.json({ success: true, ...result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    },

    async getReturnDetail(req, res) {
        try {
            const record = await returnService.getReturnById(req.params.id);
            return res.json({ success: true, data: record });
        } catch (error) {
            return res.status(404).json({ success: false, message: error.message });
        }
    },
};

module.exports = returnController;
