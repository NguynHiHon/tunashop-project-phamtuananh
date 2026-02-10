import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Fab,
    Badge,
    Paper,
    Typography,
    IconButton,
    TextField,
    Avatar,
    CircularProgress,
    Slide,
    Zoom,
    Chip,
} from '@mui/material';
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    Send as SendIcon,
    SupportAgent,
    Circle,
} from '@mui/icons-material';
import socketService from '../../services/socketService';
import warehouseService from '../../services/warehouseService';
import chatService from '../../services/chatService';
import { toast } from 'sonner';

const ChatWidget = () => {
    const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [supportStaff, setSupportStaff] = useState(null);
    const [conversation, setConversation] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [noStaffAvailable, setNoStaffAvailable] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Listen for new messages
    useEffect(() => {
        if (!isAuthenticated || !conversation) return;

        const handleReceiveMessage = (data) => {
            if (data.message.conversationId === conversation._id) {
                setMessages(prev => [...prev, data.message]);
                if (!isOpen) {
                    setUnreadCount(prev => prev + 1);
                }
            }
        };

        const handleTyping = (data) => {
            if (data.conversationId === conversation?._id) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = (data) => {
            if (data.conversationId === conversation?._id) {
                setIsTyping(false);
            }
        };

        socketService.onReceiveMessage(handleReceiveMessage);
        socketService.onUserTyping(handleTyping);
        socketService.onUserStopTyping(handleStopTyping);

        return () => {
            socketService.offReceiveMessage();
            socketService.offUserTyping && socketService.socket?.off('user_typing');
            socketService.offUserStopTyping && socketService.socket?.off('user_stop_typing');
        };
    }, [isAuthenticated, conversation, isOpen]);

    // Start chat with support
    const startChat = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để chat với hỗ trợ');
            return;
        }

        setLoading(true);
        setNoStaffAvailable(false);
        try {
            // Get assigned support staff
            const response = await warehouseService.getAssignedSupport();
            if (response.status === 'success' && response.data) {
                const staff = response.data;
                setSupportStaff(staff);

                // Create or get conversation
                const convResponse = await chatService.createOrGetConversation(staff._id);
                // Backend returns { message: '...', conversation: {...} }
                if (convResponse.conversation) {
                    setConversation(convResponse.conversation);

                    // Load messages
                    const messagesResponse = await chatService.getMessages(convResponse.conversation._id);
                    // Backend returns { message: '...', messages: [...] }
                    if (messagesResponse.messages) {
                        setMessages(messagesResponse.messages || []);
                    }
                }
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            if (error.response?.status === 404) {
                setNoStaffAvailable(true);
            } else {
                toast.error('Lỗi kết nối. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Toggle chat
    const handleToggle = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);

        if (newIsOpen) {
            if (!conversation) {
                startChat();
            }
            setUnreadCount(0);
            // Focus input after opening
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    };

    // Send message
    const handleSend = async () => {
        if (!messageInput.trim() || !conversation || !supportStaff) return;

        const content = messageInput.trim();
        setMessageInput('');
        setSending(true);

        try {
            socketService.sendMessage(
                supportStaff._id,
                content,
                conversation._id,
                'text'
            );

            // Optimistic update
            const newMessage = {
                _id: Date.now().toString(),
                content,
                sender: { _id: currentUser._id, username: currentUser.username },
                receiver: { _id: supportStaff._id },
                conversationId: conversation._id,
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, newMessage]);
        } catch {
            toast.error('Lỗi gửi tin nhắn');
        } finally {
            setSending(false);
        }
    };

    // Handle typing
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);

        if (supportStaff && conversation) {
            socketService.sendTyping(supportStaff._id, conversation._id);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                socketService.sendStopTyping(supportStaff._id, conversation._id);
            }, 1000);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (messageInput.trim() && conversation && !sending && !noStaffAvailable) {
                handleSend();
            }
        }
    };

    // Don't show for staff/admin
    if (currentUser?.role === 'staff' || currentUser?.role === 'admin') {
        return null;
    }

    return (
        <>
            {/* Chat Button */}
            <Zoom in>
                <Fab
                    color="primary"
                    onClick={handleToggle}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1300,
                        width: 60,
                        height: 60,
                    }}
                >
                    <Badge badgeContent={unreadCount} color="error">
                        {isOpen ? <CloseIcon /> : <ChatIcon />}
                    </Badge>
                </Fab>
            </Zoom>

            {/* Chat Window */}
            <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
                <Paper
                    elevation={8}
                    sx={{
                        position: 'fixed',
                        bottom: 100,
                        right: 24,
                        width: { xs: 'calc(100vw - 48px)', sm: 380 },
                        height: 500,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        zIndex: 1300,
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                            <SupportAgent />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {supportStaff?.name || supportStaff?.username || 'Hỗ trợ khách hàng'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Circle sx={{ fontSize: 8, color: '#4caf50' }} />
                                <Typography variant="caption">Đang hoạt động</Typography>
                            </Box>
                        </Box>
                        <IconButton size="small" sx={{ color: 'white' }} onClick={() => setIsOpen(false)}>
                            <CloseIcon />
                        </IconButton>
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
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                <CircularProgress />
                            </Box>
                        ) : !isAuthenticated ? (
                            <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                                <SupportAgent sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography>Vui lòng đăng nhập để chat với hỗ trợ</Typography>
                            </Box>
                        ) : noStaffAvailable ? (
                            <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                                <SupportAgent sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    Hiện tại chưa có nhân viên hỗ trợ trực tuyến.
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Vui lòng thử lại sau hoặc liên hệ hotline.
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <IconButton color="primary" onClick={startChat} size="small">
                                        <Typography variant="caption">Thử lại</Typography>
                                    </IconButton>
                                </Box>
                            </Box>
                        ) : messages.length === 0 ? (
                            <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
                                <SupportAgent sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                                <Typography variant="body2">
                                    Xin chào! Chúng tôi có thể giúp gì cho bạn?
                                </Typography>
                            </Box>
                        ) : (
                            messages.map((msg, index) => {
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
                                                maxWidth: '75%',
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
                                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })
                        )}
                        {isTyping && (
                            <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                                <Chip
                                    size="small"
                                    label="Đang nhập..."
                                    sx={{ bgcolor: 'white' }}
                                />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input */}
                    {isAuthenticated && (
                        <Box
                            sx={{
                                p: 1.5,
                                bgcolor: 'white',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            {noStaffAvailable && (
                                <Typography variant="caption" color="warning.main" textAlign="center">
                                    Hiện tại chưa có nhân viên hỗ trợ. Vui lòng thử lại sau hoặc liên hệ hotline.
                                </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder={noStaffAvailable ? "Nhân viên sẽ sớm hỗ trợ bạn..." : "Nhập tin nhắn..."}
                                    value={messageInput}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyPress}
                                    disabled={loading || sending || noStaffAvailable}
                                    inputRef={inputRef}
                                    autoComplete="off"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        },
                                    }}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={handleSend}
                                    disabled={!messageInput.trim() || !conversation || sending || noStaffAvailable}
                                >
                                    {sending ? <CircularProgress size={24} /> : <SendIcon />}
                                </IconButton>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Slide>
        </>
    );
};

export default ChatWidget;
