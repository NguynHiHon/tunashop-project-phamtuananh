import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    // Kết nối socket
    connect(token) {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io('http://localhost:9999', {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            this.isConnected = true;
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.isConnected = false;
        });

        return this.socket;
    }

    // Ngắt kết nối
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // ============ EMIT EVENTS ============

    // Gửi tin nhắn
    sendMessage(receiverId, content, conversationId, type = 'text') {
        if (!this.socket?.connected) {
            throw new Error('Socket chưa được kết nối');
        }
        this.socket.emit('send_message', {
            receiverId,
            content,
            conversationId,
            type,
        });
    }

    // Typing indicator
    sendTyping(receiverId, conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { receiverId, conversationId });
        }
    }

    // Stop typing
    sendStopTyping(receiverId, conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('stop_typing', { receiverId, conversationId });
        }
    }

    // Đánh dấu đã đọc
    markAsRead(conversationId, partnerId) {
        if (this.socket?.connected) {
            this.socket.emit('mark_as_read', { conversationId, partnerId });
        }
    }

    // Join conversation room
    joinConversation(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('join_conversation', { conversationId });
        }
    }

    // Leave conversation room
    leaveConversation(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('leave_conversation', { conversationId });
        }
    }

    // Yêu cầu chat với nhân viên support
    requestSupport() {
        if (this.socket?.connected) {
            this.socket.emit('request_support', {});
        }
    }

    // Kết thúc chat support
    endSupportChat(staffId) {
        if (this.socket?.connected) {
            this.socket.emit('end_support_chat', { staffId });
        }
    }

    // ============ LISTEN EVENTS ============

    // Nhận tin nhắn mới
    onReceiveMessage(callback) {
        if (this.socket) {
            this.socket.on('receive_message', callback);
        }
    }

    // Confirm tin nhắn đã gửi
    onMessageSent(callback) {
        if (this.socket) {
            this.socket.on('message_sent', callback);
        }
    }

    // Tin nhắn đã được đọc
    onMessageRead(callback) {
        if (this.socket) {
            this.socket.on('message_read', callback);
        }
    }

    // Messages đã được đánh dấu đã đọc
    onMessagesMarkedRead(callback) {
        if (this.socket) {
            this.socket.on('messages_marked_read', callback);
        }
    }

    // User đang typing
    onUserTyping(callback) {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    // User dừng typing
    onUserStopTyping(callback) {
        if (this.socket) {
            this.socket.on('user_stop_typing', callback);
        }
    }

    // Conversation được cập nhật
    onConversationUpdated(callback) {
        if (this.socket) {
            this.socket.on('conversation_updated', callback);
        }
    }

    // User online
    onUserOnline(callback) {
        if (this.socket) {
            this.socket.on('user_online', callback);
        }
    }

    // User offline
    onUserOffline(callback) {
        if (this.socket) {
            this.socket.on('user_offline', callback);
        }
    }

    // Error
    onError(callback) {
        if (this.socket) {
            this.socket.on('error', callback);
        }
    }

    // Support được phân công
    onSupportAssigned(callback) {
        if (this.socket) {
            this.socket.on('support_assigned', callback);
        }
    }

    // Không có support sẵn sàng
    onSupportUnavailable(callback) {
        if (this.socket) {
            this.socket.on('support_unavailable', callback);
        }
    }

    // Có chat support mới (cho staff)
    onNewSupportChat(callback) {
        if (this.socket) {
            this.socket.on('new_support_chat', callback);
        }
    }

    // Chat support đã kết thúc
    onSupportChatEnded(callback) {
        if (this.socket) {
            this.socket.on('support_chat_ended', callback);
        }
    }

    // ============ ORDER NOTIFICATIONS ============

    // Có đơn hàng mới (cho admin)
    onNewOrder(callback) {
        if (this.socket) {
            this.socket.on('new_order', callback);
        }
    }

    // Đơn hàng được cập nhật
    onOrderUpdated(callback) {
        if (this.socket) {
            this.socket.on('order_updated', callback);
        }
    }

    // Trạng thái đơn hàng thay đổi (cho user)
    onOrderStatusUpdated(callback) {
        if (this.socket) {
            this.socket.on('order_status_updated', callback);
        }
    }

    offNewOrder() {
        if (this.socket) {
            this.socket.off('new_order');
        }
    }

    offOrderUpdated() {
        if (this.socket) {
            this.socket.off('order_updated');
        }
    }

    offOrderStatusUpdated() {
        if (this.socket) {
            this.socket.off('order_status_updated');
        }
    }

    offNewSupportChat() {
        if (this.socket) {
            this.socket.off('new_support_chat');
        }
    }

    // ============ REMOVE LISTENERS ============

    offReceiveMessage() {
        if (this.socket) {
            this.socket.off('receive_message');
        }
    }

    offMessageSent() {
        if (this.socket) {
            this.socket.off('message_sent');
        }
    }

    offMessageRead() {
        if (this.socket) {
            this.socket.off('message_read');
        }
    }

    offUserTyping() {
        if (this.socket) {
            this.socket.off('user_typing');
        }
    }

    offUserStopTyping() {
        if (this.socket) {
            this.socket.off('user_stop_typing');
        }
    }

    offConversationUpdated() {
        if (this.socket) {
            this.socket.off('conversation_updated');
        }
    }

    offUserOnline() {
        if (this.socket) {
            this.socket.off('user_online');
        }
    }

    offUserOffline() {
        if (this.socket) {
            this.socket.off('user_offline');
        }
    }

    offError() {
        if (this.socket) {
            this.socket.off('error');
        }
    }

    // Remove tất cả listeners
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }

    // ============ UTILITY ============

    // Check connection status
    isSocketConnected() {
        return this.socket?.connected || false;
    }

    // Get socket instance
    getSocket() {
        return this.socket;
    }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
