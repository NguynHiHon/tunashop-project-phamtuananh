const ContactMessage = require('../models/ContactMessage');

const contactService = {
    async createMessage(payload) {
        const msg = await ContactMessage.create(payload);
        return msg;
    },

    async listMessages({ skip = 0, limit = 50 } = {}) {
        const items = await ContactMessage.find().sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit));
        const total = await ContactMessage.countDocuments();
        return { items, total };
    },

    async getMessage(id) {
        return await ContactMessage.findById(id);
    },

    async updateMessage(id, updates) {
        const msg = await ContactMessage.findById(id);
        if (!msg) throw new Error('Message not found');
        Object.assign(msg, updates);
        await msg.save();
        return msg;
    },

    async deleteMessage(id) {
        await ContactMessage.findByIdAndDelete(id);
        return true;
    }
};

module.exports = contactService;