const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    contactType: { type: String, enum: ['general', 'return', 'warranty'], default: 'general' },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'in_progress', 'handled'], default: 'new' },
    reply: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
