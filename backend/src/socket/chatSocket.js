const chatService = require('../services/chatService');
const warehouseService = require('../services/warehouseService');

// Map để track online users
const onlineUsers = new Map(); // userId -> socketId

const initializeChatSocket = (io) => {
    io.on('connection', (socket) => {
        // Convert userId to string để đảm bảo format nhất quán
        const userIdString = socket.userId.toString();

        // Join room cá nhân (để nhận messages)
        socket.join(userIdString);

        // Thêm vào danh sách online
        onlineUsers.set(userIdString, socket.id);

        // Broadcast user online
        socket.broadcast.emit('user_online', { userId: userIdString });

        // ============ EVENT HANDLERS ============

        // Yêu cầu chat với nhân viên support
        socket.on('request_support', async (data) => {
            try {
                // Lấy nhân viên được phân công
                const supportStaff = await warehouseService.getAssignedSupportStaff();

                if (!supportStaff) {
                    return socket.emit('support_unavailable', {
                        message: 'Hiện tại không có nhân viên hỗ trợ sẵn sàng. Vui lòng thử lại sau.'
                    });
                }

                const staffId = supportStaff._id.toString();

                // Tạo hoặc lấy conversation giữa user và staff
                const conversation = await chatService.findOrCreateConversation(
                    socket.userId,
                    staffId
                );

                // Tăng số chat của nhân viên
                await warehouseService.incrementChatCount(staffId);

                // Gửi thông tin support staff và conversation cho user
                socket.emit('support_assigned', {
                    supportStaff: {
                        _id: supportStaff._id,
                        username: supportStaff.username,
                        name: supportStaff.name,
                        role: supportStaff.role
                    },
                    conversation
                });

                // Thông báo cho staff có chat mới
                io.to(staffId).emit('new_support_chat', {
                    userId: socket.userId,
                    conversation
                });
            } catch (error) {
                console.error('Error requesting support:', error);
                socket.emit('error', {
                    message: error.message,
                    code: 'REQUEST_SUPPORT_ERROR'
                });
            }
        });

        // Kết thúc chat support (giảm count)
        socket.on('end_support_chat', async (data) => {
            try {
                const { staffId } = data;
                if (staffId) {
                    await warehouseService.decrementChatCount(staffId);
                    socket.emit('support_chat_ended', { staffId });
                }
            } catch (error) {
                console.error('Error ending support chat:', error);
            }
        });

        // Gửi tin nhắn
        socket.on('send_message', async (data) => {
            try {
                const { receiverId, content, conversationId, type = 'text' } = data;

                // Validate
                if (!receiverId || !content || !conversationId) {
                    return socket.emit('error', {
                        message: 'Thiếu thông tin bắt buộc',
                        code: 'MISSING_FIELDS'
                    });
                }

                // Kiểm tra không tự gửi cho mình
                if (socket.userId === receiverId) {
                    return socket.emit('error', {
                        message: 'Không thể gửi tin nhắn cho chính mình',
                        code: 'INVALID_RECEIVER'
                    });
                }

                // Tạo message
                const message = await chatService.createMessage({
                    conversationId,
                    sender: socket.userId,
                    receiver: receiverId,
                    content,
                    type
                });

                // Lấy conversation đã cập nhật
                const conversation = await chatService.findOrCreateConversation(
                    socket.userId,
                    receiverId
                );

                // Convert IDs to string để đảm bảo format nhất quán
                const userIdString = socket.userId.toString();
                const receiverIdString = receiverId.toString();

                // Gửi cho người nhận (dùng string)
                io.to(receiverIdString).emit('receive_message', {
                    message,
                    conversation
                });

                // Confirm cho người gửi
                socket.emit('message_sent', {
                    message,
                    conversation
                });

                // Broadcast conversation_updated cho cả 2 (dùng string)
                io.to(userIdString).to(receiverIdString).emit('conversation_updated', {
                    conversation
                });
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', {
                    message: error.message,
                    code: 'SEND_MESSAGE_ERROR'
                });
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { receiverId, conversationId } = data;
            if (receiverId) {
                const receiverIdString = receiverId.toString();
                io.to(receiverIdString).emit('user_typing', {
                    userId: socket.userId.toString(),
                    conversationId
                });
            }
        });

        // Stop typing
        socket.on('stop_typing', (data) => {
            const { receiverId, conversationId } = data;
            if (receiverId) {
                const receiverIdString = receiverId.toString();
                io.to(receiverIdString).emit('user_stop_typing', {
                    userId: socket.userId.toString(),
                    conversationId
                });
            }
        });

        // Đánh dấu đã đọc
        socket.on('mark_as_read', async (data) => {
            try {
                const { conversationId } = data;

                if (!conversationId) {
                    return socket.emit('error', {
                        message: 'Thiếu conversationId',
                        code: 'MISSING_CONVERSATION_ID'
                    });
                }

                // Đánh dấu đã đọc
                await chatService.markMessagesAsRead(conversationId, socket.userId);

                // Lấy conversation để biết partner
                const conversation = await chatService.findOrCreateConversation(
                    socket.userId,
                    data.partnerId // Cần truyền partnerId từ client
                );

                // Thông báo cho người gửi (partner)
                const userIdString = socket.userId.toString();
                const partnerId = conversation.participants.find(
                    p => p._id.toString() !== userIdString
                )?._id.toString();

                if (partnerId) {
                    io.to(partnerId).emit('message_read', {
                        conversationId,
                        userId: userIdString
                    });
                }

                // Confirm cho bản thân
                socket.emit('messages_marked_read', {
                    conversationId
                });
            } catch (error) {
                console.error('Error marking as read:', error);
                socket.emit('error', {
                    message: error.message,
                    code: 'MARK_READ_ERROR'
                });
            }
        });

        // Join conversation room
        socket.on('join_conversation', (data) => {
            const { conversationId } = data;
            if (conversationId) {
                socket.join(conversationId);
            }
        });

        // Leave conversation room
        socket.on('leave_conversation', (data) => {
            const { conversationId } = data;
            if (conversationId) {
                socket.leave(conversationId);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            const userIdString = socket.userId.toString();

            // Xóa khỏi danh sách online
            onlineUsers.delete(userIdString);

            // Broadcast user offline
            socket.broadcast.emit('user_offline', { userId: userIdString });
        });
    });

    // Helper function để check user online
    io.isUserOnline = (userId) => {
        return onlineUsers.has(userId);
    };

    // Helper function để lấy danh sách online users
    io.getOnlineUsers = () => {
        return Array.from(onlineUsers.keys());
    };
};

module.exports = initializeChatSocket;
