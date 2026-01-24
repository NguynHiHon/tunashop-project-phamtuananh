const databaseconfig = require('./src/config/databaseConfig')
const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors');
const router = require('./src/routers/index');
const cookieparser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const socketMiddleware = require('./src/socket/socketMiddleware');
const initializeChatSocket = require('./src/socket/chatSocket');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST']
    }
});

// Socket.IO middleware (authentication)
io.use(socketMiddleware);

// Initialize chat socket handlers
initializeChatSocket(io);

// Express middleware
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(cookieparser());

app.use(express.json());

app.use('/api', router);

// Connect database
databaseconfig();

// Start server
server.listen(process.env.PORT, () => {
    try {
        console.log(`🚀 Server đã được khởi tạo và chạy ở cổng ${process.env.PORT}`)
        console.log(`⚡ Socket.IO đã được kích hoạt`)

    } catch (error) {
        console.error('Lỗi khi khởi tạo server:', error);
    }
});
