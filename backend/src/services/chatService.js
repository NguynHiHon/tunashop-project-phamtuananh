const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/Users');

const chatService = {
    // Tạo hoặc lấy conversation giữa 2 user
    async findOrCreateConversation(userId1, userId2) {
        try {
            // Sắp xếp participants để tránh trùng lặp
            const sortedParticipants = [userId1, userId2].sort();

            // Tìm conversation có cả 2 user
            let conversation = await Conversation.findOne({
                participants: { $all: sortedParticipants, $size: 2 }
            }).populate('participants', 'username role');

            // Nếu chưa có, tạo mới
            if (!conversation) {
                conversation = await Conversation.create({
                    participants: sortedParticipants,
                    unreadCount: {}
                });

                // Populate sau khi tạo
                conversation = await Conversation.findById(conversation._id)
                    .populate('participants', 'username role');
            }

            return conversation;
        } catch (error) {
            throw new Error(`Lỗi khi tạo conversation: ${error.message}`);
        }
    },

    // Lấy tất cả conversations của user
    async getConversationsByUserId(userId, limit = 20, skip = 0) {
        try {
            const conversations = await Conversation.find({
                participants: userId
            })
                .populate('participants', 'username role')
                .populate('lastMessage.sender', 'username')
                .sort({ updatedAt: -1 })
                .limit(limit)
                .skip(skip);

            return conversations;
        } catch (error) {
            throw new Error(`Lỗi khi lấy conversations: ${error.message}`);
        }
    },

    // Lấy messages của conversation
    async getMessagesByConversationId(conversationId, limit = 50, skip = 0) {
        try {
            const messages = await Message.find({ conversationId })
                .populate('sender', 'username role')
                .populate('receiver', 'username role')
                .sort({ createdAt: 1 }) // Cũ → mới
                .limit(limit)
                .skip(skip);

            return messages;
        } catch (error) {
            throw new Error(`Lỗi khi lấy messages: ${error.message}`);
        }
    },

    // Tạo message mới
    async createMessage(data) {
        try {
            const { conversationId, sender, receiver, content, type = 'text' } = data;

            // Validate content
            if (!content || content.trim().length === 0) {
                throw new Error('Nội dung tin nhắn không được rỗng');
            }

            // Tạo message
            const message = await Message.create({
                conversationId,
                sender,
                receiver,
                content: content.trim(),
                type,
                isRead: false
            });

            // Populate sender và receiver
            await message.populate('sender', 'username role');
            await message.populate('receiver', 'username role');

            // Cập nhật conversation
            await this.updateConversation(conversationId, message);

            return message;
        } catch (error) {
            throw new Error(`Lỗi khi tạo message: ${error.message}`);
        }
    },

    // Cập nhật conversation với message mới nhất
    async updateConversation(conversationId, message) {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Không tìm thấy conversation');
            }

            // Cập nhật lastMessage
            conversation.lastMessage = {
                content: message.content,
                sender: message.sender._id,
                createdAt: message.createdAt
            };

            // Tăng unreadCount cho receiver
            const receiverId = message.receiver._id.toString();
            const currentCount = conversation.unreadCount.get(receiverId) || 0;
            conversation.unreadCount.set(receiverId, currentCount + 1);

            await conversation.save();

            return conversation;
        } catch (error) {
            throw new Error(`Lỗi khi cập nhật conversation: ${error.message}`);
        }
    },

    // Đánh dấu messages đã đọc
    async markMessagesAsRead(conversationId, userId) {
        try {
            // Cập nhật tất cả messages chưa đọc trong conversation
            await Message.updateMany(
                {
                    conversationId,
                    receiver: userId,
                    isRead: false
                },
                { isRead: true }
            );

            // Reset unreadCount
            const conversation = await Conversation.findById(conversationId);
            if (conversation) {
                conversation.unreadCount.set(userId.toString(), 0);
                await conversation.save();
            }

            return true;
        } catch (error) {
            throw new Error(`Lỗi khi đánh dấu đã đọc: ${error.message}`);
        }
    },

    // Lấy danh sách users để chat (trừ bản thân)
    async getUsersForChat(currentUserId, search = '', limit = 20) {
        try {
            const query = { _id: { $ne: currentUserId } };

            if (search) {
                query.username = { $regex: search, $options: 'i' };
            }

            const users = await User.find(query)
                .select('username role')
                .limit(limit);

            return users;
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách users: ${error.message}`);
        }
    },

    // Xóa conversation
    async deleteConversation(conversationId, userId) {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Không tìm thấy conversation');
            }

            // Kiểm tra user có quyền xóa không
            const isParticipant = conversation.participants.some(
                p => p.toString() === userId.toString()
            );

            if (!isParticipant) {
                throw new Error('Bạn không có quyền xóa conversation này');
            }

            // Xóa tất cả messages
            await Message.deleteMany({ conversationId });

            // Xóa conversation
            await Conversation.findByIdAndDelete(conversationId);

            return true;
        } catch (error) {
            throw new Error(`Lỗi khi xóa conversation: ${error.message}`);
        }
    }
};

module.exports = chatService;
