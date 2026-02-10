import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Badge,
    TextField,
    IconButton,
    CircularProgress,
    Chip,
    Divider,
    Alert,
} from '@mui/material';
import {
    Send as SendIcon,
    SupportAgent,
    Person,
    Circle,
} from '@mui/icons-material';
import chatService from '../../services/chatService';
import socketService from '../../services/socketService';
import {
    setConversations,
    setCurrentConversation,
    setMessages,
    addMessage,
} from '../../redux/clices/chatSlice';

const SupportChatManagement = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.auth);
    const { conversations, currentConversation, messages, onlineUsers } = useSelector(
        (state) => state.chat
    );

    const [loading, setLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Partner info for current conversation
    const partner = currentConversation?.participants?.find(
        (p) => p._id !== currentUser?._id
    );
    const isPartnerOnline = onlineUsers.includes(partner?._id);

    // Load conversations
    const loadConversations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await chatService.getConversations();
            // Backend returns { conversations: [...] }
            if (response.conversations) {
                dispatch(setConversations(response.conversations || []));
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    // Load messages for a conversation
    const loadMessages = useCallback(async (conversationId) => {
        setMessagesLoading(true);
        try {
            const response = await chatService.getMessages(conversationId);
            // Backend returns { messages: [...] }
            if (response.messages) {
                dispatch(setMessages(response.messages || []));
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setMessagesLoading(false);
        }
    }, [dispatch]);

    // Select conversation
    const handleSelectConversation = (conversation) => {
        dispatch(setCurrentConversation(conversation));
        loadMessages(conversation._id);
        socketService.joinConversation(conversation._id);

        // Mark as read
        const partnerId = conversation.participants.find(p => p._id !== currentUser._id)?._id;
        if (partnerId) {
            socketService.markAsRead(conversation._id, partnerId);
        }
    };

    // Send message
    const handleSend = async () => {
        if (!messageInput.trim() || !currentConversation || !partner) return;

        const content = messageInput.trim();
        setMessageInput('');
        setSending(true);

        try {
            socketService.sendMessage(partner._id, content, currentConversation._id, 'text');

            // Optimistic update
            const newMessage = {
                _id: Date.now().toString(),
                content,
                sender: { _id: currentUser._id, username: currentUser.username },
                receiver: { _id: partner._id },
                conversationId: currentConversation._id,
                createdAt: new Date().toISOString(),
            };
            dispatch(addMessage(newMessage));
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle typing
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        if (partner && currentConversation) {
            socketService.sendTyping(partner._id, currentConversation._id);
        }
    };

    // Listen for new support chats and messages
    useEffect(() => {
        loadConversations();

        // Listen for new support chats
        socketService.onNewSupportChat(() => {
            loadConversations();
        });

        // Listen for typing
        if (currentConversation) {
            socketService.onUserTyping((data) => {
                if (data.conversationId === currentConversation._id) {
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 2000);
                }
            });
        }

        return () => {
            if (currentConversation) {
                socketService.leaveConversation(currentConversation._id);
            }
        };
    }, [loadConversations, currentConversation]);

    // Auto-scroll messages
    const messagesEndRef = React.useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Format time
    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();

        if (isToday) {
            return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Chat hỗ trợ khách hàng
            </Typography>

            <Paper sx={{ height: 'calc(100% - 60px)', display: 'flex', overflow: 'hidden' }}>
                {/* Conversations List */}
                <Box
                    sx={{
                        width: 320,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Cuộc hội thoại ({conversations?.length || 0})
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : conversations?.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                            <SupportAgent sx={{ fontSize: 48, mb: 1 }} />
                            <Typography>Chưa có cuộc hội thoại nào</Typography>
                        </Box>
                    ) : (
                        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
                            {conversations?.map((conv) => {
                                const convPartner = conv.participants?.find(
                                    (p) => p._id !== currentUser?._id
                                );
                                const isOnline = onlineUsers.includes(convPartner?._id);
                                const isSelected = currentConversation?._id === conv._id;
                                const unread = conv.unreadCount?.[currentUser?._id] || 0;

                                return (
                                    <ListItem
                                        key={conv._id}
                                        button
                                        onClick={() => handleSelectConversation(conv)}
                                        sx={{
                                            bgcolor: isSelected ? 'action.selected' : 'inherit',
                                            '&:hover': { bgcolor: 'action.hover' },
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                badgeContent={
                                                    isOnline ? (
                                                        <Circle sx={{ fontSize: 12, color: 'success.main' }} />
                                                    ) : null
                                                }
                                            >
                                                <Avatar>
                                                    <Person />
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography
                                                        fontWeight={unread > 0 ? 'bold' : 'normal'}
                                                        noWrap
                                                    >
                                                        {convPartner?.name || convPartner?.username || 'Khách'}
                                                    </Typography>
                                                    {unread > 0 && (
                                                        <Chip
                                                            size="small"
                                                            label={unread}
                                                            color="error"
                                                            sx={{ height: 20, fontSize: 11 }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    noWrap
                                                >
                                                    {conv.lastMessage?.content || 'Chưa có tin nhắn'}
                                                </Typography>
                                            }
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                                        </Typography>
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </Box>

                {/* Chat Area */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!currentConversation ? (
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'text.secondary',
                            }}
                        >
                            <SupportAgent sx={{ fontSize: 64, mb: 2, color: 'primary.main' }} />
                            <Typography variant="h6">Chọn cuộc hội thoại để bắt đầu</Typography>
                            <Typography variant="body2">
                                Các tin nhắn từ khách hàng sẽ hiển thị ở đây
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                        isPartnerOnline ? (
                                            <Circle sx={{ fontSize: 12, color: 'success.main' }} />
                                        ) : null
                                    }
                                >
                                    <Avatar>
                                        <Person />
                                    </Avatar>
                                </Badge>
                                <Box>
                                    <Typography fontWeight="bold">
                                        {partner?.name || partner?.username || 'Khách hàng'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {isPartnerOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Messages */}
                            <Box
                                sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    p: 2,
                                    bgcolor: '#f5f5f5',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                }}
                            >
                                {messagesLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : messages?.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                                        <Typography>Chưa có tin nhắn</Typography>
                                    </Box>
                                ) : (
                                    messages?.map((msg, index) => {
                                        const isOwn = msg.sender?._id === currentUser?._id;
                                        return (
                                            <Box
                                                key={msg._id || index}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        maxWidth: '60%',
                                                        bgcolor: isOwn ? 'primary.main' : 'white',
                                                        color: isOwn ? 'white' : 'text.primary',
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        boxShadow: 1,
                                                    }}
                                                >
                                                    <Typography variant="body2">{msg.content}</Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            textAlign: 'right',
                                                            opacity: 0.7,
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        {formatTime(msg.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })
                                )}
                                {isTyping && (
                                    <Box sx={{ display: 'flex' }}>
                                        <Chip size="small" label="Đang nhập..." sx={{ bgcolor: 'white' }} />
                                    </Box>
                                )}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Input */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    gap: 1,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Nhập tin nhắn..."
                                    value={messageInput}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyPress}
                                    disabled={sending}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={handleSend}
                                    disabled={!messageInput.trim() || sending}
                                >
                                    {sending ? <CircularProgress size={24} /> : <SendIcon />}
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default SupportChatManagement;
