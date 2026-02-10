// ProductType model
const mongoose = require('mongoose');

const ProductTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },// e.g. "Badminton Racket"
    name_vi: { type: String, required: true }, // e.g. "Vợt cầu lông"
    listAttributeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' }]
});

module.exports = mongoose.model('ProductType', ProductTypeSchema);