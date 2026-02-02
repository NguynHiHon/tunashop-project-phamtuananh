// Attribute model
const mongoose = require('mongoose');

const AttributeSchema = new mongoose.Schema({

    name: { type: String, required: true }, // e.g. "Brand"
    name_vi: { type: String, required: true }, // e.g. "Thương hiệu"
    type: { type: String, required: true }, // e.g. "select", "number", "text"
    options: [{ type: String }] // e.g. ["VNB", "Yonex"]
});

module.exports = mongoose.model('Attribute', AttributeSchema);