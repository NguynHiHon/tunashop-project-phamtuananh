const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

const supplierService = {
    async list({ search, limit = 200 } = {}) {
        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const items = await Supplier.find(query).sort({ name: 1 }).limit(Number(limit));
        return items;
    },

    async create(payload) {
        const { name, phone, email, address, note } = payload || {};
        if (!name || !String(name).trim()) {
            const err = new Error('name is required');
            err.status = 400;
            throw err;
        }
        const supplier = await Supplier.create({
            name: String(name).trim(),
            phone,
            email,
            address,
            note,
        });
        return supplier;
    },

    async update(id, payload) {
        if (!isValidObjectId(id)) {
            const err = new Error('Invalid supplier id');
            err.status = 400;
            throw err;
        }
        const supplier = await Supplier.findById(id);
        if (!supplier) {
            const err = new Error('Supplier not found');
            err.status = 404;
            throw err;
        }
        const { name, phone, email, address, note } = payload || {};
        if (name !== undefined) supplier.name = String(name).trim();
        if (phone !== undefined) supplier.phone = phone;
        if (email !== undefined) supplier.email = email;
        if (address !== undefined) supplier.address = address;
        if (note !== undefined) supplier.note = note;
        await supplier.save();
        return supplier;
    },

    async remove(id) {
        if (!isValidObjectId(id)) {
            const err = new Error('Invalid supplier id');
            err.status = 400;
            throw err;
        }
        await Supplier.findByIdAndDelete(id);
        return true;
    },
};

module.exports = supplierService;
