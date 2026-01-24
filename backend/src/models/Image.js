// Image model
const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    url_Image: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

module.exports = mongoose.model('Image', ImageSchema);