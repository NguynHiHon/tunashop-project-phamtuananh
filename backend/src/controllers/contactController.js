const contactService = require('../services/contactService');

const contactController = {
    // Public: submit contact form
    async submit(req, res) {
        try {
            const payload = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                subject: req.body.subject,
                contactType: req.body.contactType,
                message: req.body.message,
            };

            if (!payload.name || !payload.email || !payload.message) {
                return res.status(400).json({ status: 'error', message: 'name, email and message are required' });
            }

            const msg = await contactService.createMessage(payload);
            return res.status(201).json({ status: 'success', data: msg });
        } catch (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
    },

    // Admin: list
    async list(req, res) {
        try {
            const skip = req.query.skip || 0;
            const limit = req.query.limit || 50;
            const data = await contactService.listMessages({ skip, limit });
            return res.json({ status: 'success', data });
        } catch (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
    },

    async get(req, res) {
        try {
            const msg = await contactService.getMessage(req.params.id);
            if (!msg) return res.status(404).json({ status: 'error', message: 'Not found' });
            return res.json({ status: 'success', data: msg });
        } catch (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
    },

    async update(req, res) {
        try {
            const updates = req.body || {};
            const msg = await contactService.updateMessage(req.params.id, updates);
            return res.json({ status: 'success', data: msg });
        } catch (err) {
            return res.status(400).json({ status: 'error', message: err.message });
        }
    },

    async remove(req, res) {
        try {
            await contactService.deleteMessage(req.params.id);
            return res.json({ status: 'success', message: 'Deleted' });
        } catch (err) {
            return res.status(400).json({ status: 'error', message: err.message });
        }
    }
};

module.exports = contactController;