import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        // Conversations
        conversations: [],
        currentConversation: null,
        conversationsLoading: false,
        conversationsError: null,

        // Messages
        messages: [],
        messagesLoading: false,
        messagesError: null,

        // Users
        users: [],
        usersLoading: false,

        // Typing indicators
        typingUsers: [], // [{ userId, conversationId }]

        // Online status
        onlineUsers: [], // [userId, userId...]

        // Unread counts
        totalUnreadCount: 0,
    },
    reducers: {
        // ============ CONVERSATIONS ============
        setConversationsLoading: (state, action) => {
            state.conversationsLoading = action.payload;
        },
        setConversations: (state, action) => {
            state.conversations = action.payload;
            state.conversationsLoading = false;
            state.conversationsError = null;
        },
        setConversationsError: (state, action) => {
            state.conversationsError = action.payload;
            state.conversationsLoading = false;
        },
        addConversation: (state, action) => {
            const exists = state.conversations.find(
                c => c._id === action.payload._id
            );
            if (!exists) {
                state.conversations.unshift(action.payload);
            }
        },
        updateConversation: (state, action) => {
            const index = state.conversations.findIndex(
                c => c._id === action.payload._id
            );
            if (index !== -1) {
                state.conversations[index] = action.payload;
                // Đưa conversation lên đầu
                const updated = state.conversations.splice(index, 1)[0];
                state.conversations.unshift(updated);
            }
        },
        removeConversation: (state, action) => {
            state.conversations = state.conversations.filter(
                c => c._id !== action.payload
            );
        },
        setCurrentConversation: (state, action) => {
            state.currentConversation = action.payload;
        },
        clearCurrentConversation: (state) => {
            state.currentConversation = null;
            state.messages = [];
        },

        // ============ MESSAGES ============
        setMessagesLoading: (state, action) => {
            state.messagesLoading = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
            state.messagesLoading = false;
            state.messagesError = null;
        },
        setMessagesError: (state, action) => {
            state.messagesError = action.payload;
            state.messagesLoading = false;
        },
        addMessage: (state, action) => {
            const exists = state.messages.find(
                m => m._id === action.payload._id
            );
            if (!exists) {
                state.messages.push(action.payload);
            }
        },
        updateMessage: (state, action) => {
            const index = state.messages.findIndex(
                m => m._id === action.payload._id
            );
            if (index !== -1) {
                state.messages[index] = action.payload;
            }
        },
        prependMessages: (state, action) => {
            // Để load more messages (pagination)
            state.messages = [...action.payload, ...state.messages];
        },
        clearMessages: (state) => {
            state.messages = [];
        },
        markMessagesAsRead: (state, action) => {
            const { conversationId } = action.payload;
            state.messages.forEach(msg => {
                if (msg.conversationId === conversationId && !msg.isRead) {
                    msg.isRead = true;
                }
            });
        },

        // ============ USERS ============
        setUsersLoading: (state, action) => {
            state.usersLoading = action.payload;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
            state.usersLoading = false;
        },
        clearUsers: (state) => {
            state.users = [];
        },

        // ============ TYPING ============
        addTypingUser: (state, action) => {
            const { userId, conversationId } = action.payload;
            const exists = state.typingUsers.find(
                t => t.userId === userId && t.conversationId === conversationId
            );
            if (!exists) {
                state.typingUsers.push({ userId, conversationId });
            }
        },
        removeTypingUser: (state, action) => {
            const { userId, conversationId } = action.payload;
            state.typingUsers = state.typingUsers.filter(
                t => !(t.userId === userId && t.conversationId === conversationId)
            );
        },
        clearTypingUsers: (state) => {
            state.typingUsers = [];
        },

        // ============ ONLINE STATUS ============
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        addOnlineUser: (state, action) => {
            if (!state.onlineUsers.includes(action.payload)) {
                state.onlineUsers.push(action.payload);
            }
        },
        removeOnlineUser: (state, action) => {
            state.onlineUsers = state.onlineUsers.filter(
                id => id !== action.payload
            );
        },

        // ============ UNREAD COUNT ============
        updateTotalUnreadCount: (state) => {
            const currentUserId = state.currentConversation?.participants.find(
                p => p._id !== state.currentConversation.participants[0]._id
            )?._id;

            state.totalUnreadCount = state.conversations.reduce((total, conv) => {
                const unread = conv.unreadCount?.get?.(currentUserId) || 0;
                return total + unread;
            }, 0);
        },

        // ============ RESET ============
        resetChatState: (state) => {
            state.conversations = [];
            state.currentConversation = null;
            state.messages = [];
            state.users = [];
            state.typingUsers = [];
            state.onlineUsers = [];
            state.totalUnreadCount = 0;
            state.conversationsLoading = false;
            state.messagesLoading = false;
            state.usersLoading = false;
            state.conversationsError = null;
            state.messagesError = null;
        },
    },
});

export const {
    // Conversations
    setConversationsLoading,
    setConversations,
    setConversationsError,
    addConversation,
    updateConversation,
    removeConversation,
    setCurrentConversation,
    clearCurrentConversation,

    // Messages
    setMessagesLoading,
    setMessages,
    setMessagesError,
    addMessage,
    updateMessage,
    prependMessages,
    clearMessages,
    markMessagesAsRead,

    // Users
    setUsersLoading,
    setUsers,
    clearUsers,

    // Typing
    addTypingUser,
    removeTypingUser,
    clearTypingUsers,

    // Online status
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,

    // Unread
    updateTotalUnreadCount,

    // Reset
    resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
