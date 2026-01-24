import { axiosJWT } from '../config/axiosJWT';

const chatService = {
    // Tạo hoặc lấy conversation
    async createOrGetConversation(receiverId) {
        try {
            const response = await axiosJWT.post('/api/chat/conversations', {
                receiverId
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy danh sách conversations
    async getConversations(limit = 20, skip = 0) {
        try {
            const response = await axiosJWT.get('/api/chat/conversations', {
                params: { limit, skip }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy messages của conversation
    async getMessages(conversationId, limit = 50, skip = 0) {
        try {
            const response = await axiosJWT.get(
                `/api/chat/conversations/${conversationId}/messages`,
                { params: { limit, skip } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Gửi message (backup, chủ yếu dùng Socket)
    async sendMessage(conversationId, receiverId, content, type = 'text') {
        try {
            const response = await axiosJWT.post('/api/chat/messages', {
                conversationId,
                receiverId,
                content,
                type
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Đánh dấu đã đọc
    async markAsRead(conversationId) {
        try {
            const response = await axiosJWT.patch(
                `/api/chat/conversations/${conversationId}/read`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Lấy danh sách users
    async getUsers(search = '', limit = 20) {
        try {
            const response = await axiosJWT.get('/api/chat/users', {
                params: { search, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Xóa conversation
    async deleteConversation(conversationId) {
        try {
            const response = await axiosJWT.delete(
                `/api/chat/conversations/${conversationId}`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default chatService;
