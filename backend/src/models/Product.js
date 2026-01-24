// Product model
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    productTypeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'ProductType' },
    attributes: [
        {
            attributeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Attribute' },
            value: { type: String, required: true }
        }
    ],
    price: { type: Number, required: true },
    warranty: { type: String }, // e.g. "12 tháng"
    stock: { type: Number, default: 0 },
    defaultImageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
    imageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    description: { type: String }
});

module.exports = mongoose.model('Product', ProductSchema);