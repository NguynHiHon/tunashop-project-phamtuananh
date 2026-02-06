const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },

    // Contact fields
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    name: { type: String, trim: true },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema);