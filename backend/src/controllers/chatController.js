const chatService = require('../services/chatService');

const chatController = {
    // Tạo hoặc lấy conversation
    async createOrGetConversation(req, res) {
        try {
            const currentUserId = req.user._id;
            const { receiverId } = req.body;

            if (!receiverId) {
                return res.status(400).json({ message: 'receiverId là bắt buộc' });
            }

            if (currentUserId.toString() === receiverId) {
                return res.status(400).json({ message: 'Không thể chat với chính mình' });
            }

            const conversation = await chatService.findOrCreateConversation(
                currentUserId,
                receiverId
            );

            res.status(200).json({
                message: 'Lấy conversation thành công',
                conversation
            });
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    },

    // Lấy danh sách conversations
    async getConversations(req, res) {
        try {
            const currentUserId = req.user._id;
            const { limit = 20, skip = 0 } = req.query;

            const conversations = await chatService.getConversationsByUserId(
                currentUserId,
                parseInt(limit),
                parseInt(skip)
            );

            res.status(200).json({
                message: 'Lấy danh sách conversations thành công',
                conversations,
                total: conversations.length
            });
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    },

    // Lấy messages của conversation
    async getMessages(req, res) {
        try {
            const currentUserId = req.user._id;
            const { conversationId } = req.params;
            const { limit = 50, skip = 0 } = req.query;

            // TODO: Kiểm tra user có quyền truy cập conversation không
            // (implement sau nếu cần)

            const messages = await chatService.getMessagesByConversationId(
                conversationId,
                parseInt(limit),
                parseInt(skip)
            );

            res.status(200).json({
                message: 'Lấy messages thành công',
                messages,
                total: messages.length
            });
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    },

    // Gửi message (backup, chủ yếu dùng Socket)
    async sendMessage(req, res) {
        try {
            const currentUserId = req.user._id;
            const { conversationId, receiverId, content, type = 'text' } = req.body;

            if (!conversationId || !receiverId || !content) {
                return res.status(400).json({
                    message: 'conversationId, receiverId và content là bắt buộc'
                });
            }

            const message = await chatService.createMessage({
                conversationId,
                sender: currentUserId,
                receiver: receiverId,
                content,
                type
            });

            res.status(201).json({
                message: 'Gửi message thành công',
                data: message
            });
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    },

    // Đánh dấu đã đọc
    async markAsRead(req, res) {
        try {
            const currentUserId = req.user._id;
            const { conversationId } = req.params;

            await chatService.markMessagesAsRead(conversationId, currentUserId);

            res.status(200).json({
                message: 'Đánh dấu đã đọc thành công'
            });
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    },

    // Lấy danh sách users
    async getUsers(req, res) {
        try {
            const currentUserId = req.user._id;
            const { search = '', limit = 20 } = req.query;

            const users = await chatService.getUsersForChat(
                currentUserId,
                search,
                parseInt(limit)
            );

            res.status(200).json({
                message: 'Lấy danh sách users thành công',
                users,
                total: users.length
            });
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    },

    // Xóa conversation
    async deleteConversation(req, res) {
        try {
            const currentUserId = req.user._id;
            const { conversationId } = req.params;

            await chatService.deleteConversation(conversationId, currentUserId);

            res.status(200).json({
                message: 'Xóa conversation thành công'
            });
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server',
                error: error.message
            });
        }
    }
};

module.exports = chatController;
