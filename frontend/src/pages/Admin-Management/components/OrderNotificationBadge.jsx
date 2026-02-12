import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Box,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    ShoppingCart,
    Chat as ChatIcon,
} from '@mui/icons-material';
import socketService from '../../../services/socketService';
import { toast } from 'sonner';

const OrderNotificationBadge = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Listen for new orders
    useEffect(() => {
        if (!currentUser || !['admin', 'staff'].includes(currentUser.role)) {
            return;
        }

        // Debug: Check socket connection status
        console.log('OrderNotificationBadge: Setting up listeners');
        console.log('Socket connected:', socketService.isConnected);
        console.log('Socket instance:', socketService.socket?.connected);

        // Setup listeners function
        const setupListeners = () => {
            console.log('OrderNotificationBadge: Registering socket listeners');

            // Remove any existing listeners first to prevent duplicates
            socketService.offNewOrder();
            socketService.offNewSupportChat();

            // Listen for new orders
            socketService.onNewOrder((data) => {
                console.log('Received new order:', data);
                const newNotification = {
                    id: data.orderId,
                    type: 'order',
                    title: 'Đơn hàng mới',
                    message: `${data.customerName} vừa đặt đơn hàng #${data.orderCode?.slice(-8) || data.orderId?.slice(-6)}`,
                    total: data.total,
                    createdAt: new Date(),
                    read: false,
                };

                setNotifications(prev => [newNotification, ...prev].slice(0, 20));
                setUnreadCount(prev => prev + 1);

                // Show toast
                toast.info(newNotification.message, {
                    action: {
                        label: 'Xem',
                        onClick: () => navigate('/management/orders'),
                    },
                });
            });

            // Listen for new support chat
            socketService.onNewSupportChat((data) => {
                console.log('Received new support chat:', data);

                // Don't show notification if user is already on support chat page
                if (window.location.pathname.includes('/management/support-chat')) {
                    console.log('Suppressing chat notification - user is on support chat page');
                    return;
                }

                const newNotification = {
                    id: data?.conversation?._id || Date.now().toString(),
                    type: 'chat',
                    title: 'Chat mới',
                    message: 'Có khách hàng cần hỗ trợ',
                    createdAt: new Date(),
                    read: false,
                };

                setNotifications(prev => [newNotification, ...prev].slice(0, 20));
                setUnreadCount(prev => prev + 1);

                toast.info('Có khách hàng mới cần hỗ trợ!', {
                    action: {
                        label: 'Chat',
                        onClick: () => navigate('/management/support-chat'),
                    },
                });
            });
        };

        // Track if listeners are already setup to prevent duplicates
        let listenersSetup = false;

        const setupOnce = () => {
            if (listenersSetup) {
                console.log('OrderNotificationBadge: Listeners already setup, skipping');
                return;
            }
            listenersSetup = true;
            setupListeners();
        };

        // Setup listeners immediately if socket is connected
        if (socketService.isSocketConnected()) {
            setupOnce();
        }

        // Retry with interval until socket is connected
        let retryCount = 0;
        const maxRetries = 10;
        const retryInterval = setInterval(() => {
            retryCount++;
            console.log(`OrderNotificationBadge: Retry ${retryCount}/${maxRetries}, socket connected: ${socketService.isSocketConnected()}`);

            if (socketService.isSocketConnected()) {
                setupOnce();
                clearInterval(retryInterval);
            } else if (retryCount >= maxRetries) {
                console.warn('OrderNotificationBadge: Max retries reached, socket not connected');
                clearInterval(retryInterval);
            }
        }, 1000);

        // Also listen for socket connect event
        const socket = socketService.getSocket();
        const onConnect = () => {
            console.log('OrderNotificationBadge: Socket connected event received');
            setupListeners();
        };
        socket?.on('connect', onConnect);

        return () => {
            clearInterval(retryInterval);
            socket?.off('connect', onConnect);
            socketService.offNewOrder();
            socketService.offNewSupportChat();
        };
    }, [currentUser, navigate]);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (notification) => {
        // Mark as read
        setNotifications(prev =>
            prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Navigate based on type
        if (notification.type === 'order') {
            navigate('/management/orders');
        } else if (notification.type === 'chat') {
            navigate('/management/support-chat');
        }

        handleClose();
    };

    const handleClearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
        handleClose();
    };

    // Don't render for non-admin/staff
    if (!currentUser || !['admin', 'staff'].includes(currentUser.role)) {
        return null;
    }

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        return d.toLocaleDateString('vi-VN');
    };

    return (
        <>
            <IconButton onClick={handleOpen} sx={{ color: 'inherit' }}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 360, maxHeight: 400 },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Thông báo
                    </Typography>
                    {notifications.length > 0 && (
                        <Typography
                            variant="caption"
                            sx={{ cursor: 'pointer', color: 'primary.main' }}
                            onClick={handleClearAll}
                        >
                            Xóa tất cả
                        </Typography>
                    )}
                </Box>
                <Divider />

                {notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                        <NotificationsIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                        <Typography variant="body2">Không có thông báo mới</Typography>
                    </Box>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                bgcolor: notification.read ? 'inherit' : 'action.hover',
                                '&:hover': { bgcolor: 'action.selected' },
                            }}
                        >
                            <ListItemIcon>
                                {notification.type === 'order' ? (
                                    <ShoppingCart color="primary" />
                                ) : (
                                    <ChatIcon color="success" />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" fontWeight={notification.read ? 'normal' : 'bold'}>
                                        {notification.title}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Typography variant="caption" component="span" display="block">
                                            {notification.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTime(notification.createdAt)}
                                        </Typography>
                                    </>
                                }
                            />
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default OrderNotificationBadge;
