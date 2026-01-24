import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import chatService from '../../services/chatService';
import socketService from '../../services/socketService';
import {
    setMessages,
    setMessagesLoading,
    addMessage,
    markMessagesAsRead,
    addTypingUser,
    removeTypingUser,
} from '../../redux/clices/chatSlice';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import { toast } from 'sonner';

const ChatBox = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.auth);
    const { currentConversation, messages, messagesLoading, typingUsers, onlineUsers } =
        useSelector((state) => state.chat);

    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Partner info
    const partner = currentConversation?.participants.find(
        (p) => p._id !== currentUser._id
    );
    const isPartnerOnline = onlineUsers.includes(partner?._id);
    const isPartnerTyping = typingUsers.some(
        (t) => t.userId === partner?._id && t.conversationId === currentConversation?._id
    );

    // Load messages khi chọn conversation
    useEffect(() => {
        if (currentConversation) {
            loadMessages();
            
            // Join conversation room
            socketService.joinConversation(currentConversation._id);

            // Mark as read
            if (partner) {
                socketService.markAsRead(currentConversation._id, partner._id);
            }

            return () => {
                // Leave conversation room khi unmount
                socketService.leaveConversation(currentConversation._id);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentConversation?._id]);

    // Auto scroll to bottom khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Setup socket listeners
    useEffect(() => {
        // Confirm message đã gửi
        const handleMessageSent = (data) => {
            // Message đã được add qua optimistic update
        };

        // Partner typing
        const handleUserTyping = (data) => {
            dispatch(addTypingUser({
                userId: data.userId,
                conversationId: data.conversationId,
            }));

            setTimeout(() => {
                dispatch(removeTypingUser({
                    userId: data.userId,
                    conversationId: data.conversationId,
                }));
            }, 3000);
        };

        // Partner stop typing
        const handleUserStopTyping = (data) => {
            dispatch(removeTypingUser({
                userId: data.userId,
                conversationId: data.conversationId,
            }));
        };

        // Messages marked as read
        const handleMessageRead = (data) => {
            dispatch(markMessagesAsRead({ conversationId: data.conversationId }));
        };

        // Register listeners
        socketService.onMessageSent(handleMessageSent);
        socketService.onUserTyping(handleUserTyping);
        socketService.onUserStopTyping(handleUserStopTyping);
        socketService.onMessageRead(handleMessageRead);

        return () => {
            socketService.offMessageSent();
            socketService.offUserTyping();
            socketService.offUserStopTyping();
            socketService.offMessageRead();
        };
         
    }, [dispatch]);

    // Mark as read khi mở conversation
    useEffect(() => {
        if (currentConversation && partner) {
            socketService.markAsRead(currentConversation._id, partner._id);
        }
    }, [currentConversation?._id, partner?._id]);

    const loadMessages = async () => {
        if (!currentConversation) return;

        try {
            dispatch(setMessagesLoading(true));
            const response = await chatService.getMessages(currentConversation._id);
            dispatch(setMessages(response.messages || []));
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Không thể tải tin nhắn');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!messageInput.trim() || !currentConversation || !partner || isSending) {
            return;
        }

        const content = messageInput.trim();
        setMessageInput('');
        setIsSending(true);

        try {
            // Optimistic update
            const tempMessage = {
                _id: 'temp-' + Date.now(),
                conversationId: currentConversation._id,
                sender: currentUser,
                receiver: partner,
                content,
                type: 'text',
                isRead: false,
                createdAt: new Date().toISOString(),
            };
            dispatch(addMessage(tempMessage));

            // Gửi qua socket
            socketService.sendMessage(
                partner._id,
                content,
                currentConversation._id,
                'text'
            );

            // Stop typing
            socketService.sendStopTyping(partner._id, currentConversation._id);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Không thể gửi tin nhắn');
        } finally {
            setIsSending(false);
        }
    };

    const handleInputChange = (e) => {
        setMessageInput(e.target.value);

        // Typing indicator
        if (partner && currentConversation) {
            socketService.sendTyping(partner._id, currentConversation._id);

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Auto stop typing sau 3s
            typingTimeoutRef.current = setTimeout(() => {
                socketService.sendStopTyping(partner._id, currentConversation._id);
            }, 3000);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Nếu chưa chọn conversation
    if (!currentConversation) {
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f9fafb',
                    color: '#9ca3af',
                }}
            >
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>
                    Chọn một cuộc trò chuyện để bắt đầu
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
                height: '100%',
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
            >
                <div style={{ position: 'relative' }}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '16px',
                        }}
                    >
                        {partner?.username.charAt(0).toUpperCase()}
                    </div>
                    {isPartnerOnline && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#4ade80',
                                border: '2px solid white',
                                borderRadius: '50%',
                            }}
                        />
                    )}
                </div>
                <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                        {partner?.username}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {isPartnerOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 0',
                    backgroundColor: '#f9fafb',
                }}
            >
                {messagesLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        Đang tải tin nhắn...
                    </div>
                ) : messages.length > 0 ? (
                    <>
                        {messages.map((message) => (
                            <MessageItem key={message._id} message={message} />
                        ))}
                        {isPartnerTyping && <TypingIndicator username={partner?.username} />}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <div
                        style={{
                            padding: '40px 20px',
                            textAlign: 'center',
                            color: '#9ca3af',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
                        <div style={{ fontSize: '15px' }}>
                            Bắt đầu cuộc trò chuyện với {partner?.username}
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form
                onSubmit={handleSendMessage}
                style={{
                    padding: '16px 20px',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                }}
            >
                <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="Nhập tin nhắn..."
                    disabled={isSending}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '24px',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
                <button
                    type="submit"
                    disabled={!messageInput.trim() || isSending}
                    style={{
                        padding: '10px 24px',
                        backgroundColor: messageInput.trim() ? '#667eea' : '#e5e7eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '24px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        if (messageInput.trim()) {
                            e.currentTarget.style.backgroundColor = '#5568d3';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (messageInput.trim()) {
                            e.currentTarget.style.backgroundColor = '#667eea';
                        }
                    }}
                >
                    {isSending ? 'Đang gửi...' : 'Gửi'}
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
