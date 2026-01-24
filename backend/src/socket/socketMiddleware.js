const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const socketMiddleware = async (socket, next) => {
    try {
        // Lấy token từ handshake
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lấy user từ database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        // Gắn user vào socket
        socket.userId = user._id.toString();
        socket.user = user;

        next();
    } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
    }
};

module.exports = socketMiddleware;
