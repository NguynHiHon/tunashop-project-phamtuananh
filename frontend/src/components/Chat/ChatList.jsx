import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import chatService from '../../services/chatService';
import {
    setConversations,
    setConversationsLoading,
    setConversationsError,
    setCurrentConversation,
    setUsers,
} from '../../redux/clices/chatSlice';
import UserListItem from './UserListItem';
import { toast } from 'sonner';

const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    return d.toLocaleDateString('vi-VN');
};

const ChatList = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.auth);
    const { conversations, conversationsLoading, users, onlineUsers } = useSelector(
        (state) => state.chat
    );
    const [showUserList, setShowUserList] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadConversations = async () => {
        try {
            dispatch(setConversationsLoading(true));
            const response = await chatService.getConversations();
            dispatch(setConversations(response.conversations || []));
        } catch (error) {
            console.error('Error loading conversations:', error);
            dispatch(setConversationsError(error.message));
            toast.error('Không thể tải danh sách chat');
        }
    };

    const loadUsers = async () => {
        try {
            const response = await chatService.getUsers(searchTerm);
            dispatch(setUsers(response.users || []));
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Không thể tải danh sách người dùng');
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (showUserList) {
            loadUsers();
        }
    }, [showUserList, searchTerm]);

    const handleConversationClick = (conversation) => {
        dispatch(setCurrentConversation(conversation));
    };

    const handleUserClick = async (user) => {
        try {
            const response = await chatService.createOrGetConversation(user._id);
            dispatch(setCurrentConversation(response.conversation));
            setShowUserList(false);
            
            // Reload conversations để cập nhật list
            loadConversations();
        } catch (error) {
            console.error('Error creating conversation:', error);
            toast.error('Không thể tạo cuộc trò chuyện');
        }
    };

    const getPartnerInfo = (conversation) => {
        return conversation.participants.find(
            (p) => p._id !== currentUser._id
        );
    };

    const getUnreadCount = (conversation) => {
        const unreadMap = conversation.unreadCount;
        if (unreadMap instanceof Map) {
            return unreadMap.get(currentUser._id) || 0;
        }
        return unreadMap?.[currentUser._id] || 0;
    };

    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    return (
        <div
            style={{
                width: '320px',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: 'white',
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '16px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                    {showUserList ? 'Chọn người chat' : 'Tin nhắn'}
                </h2>
                <button
                    onClick={() => setShowUserList(!showUserList)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {showUserList ? '×' : '+'}
                </button>
            </div>

            {/* Search */}
            {showUserList && (
                <div style={{ padding: '12px' }}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                        }}
                    />
                </div>
            )}

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversationsLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        Đang tải...
                    </div>
                ) : showUserList ? (
                    // User List
                    users.length > 0 ? (
                        users.map((user) => (
                            <UserListItem
                                key={user._id}
                                user={user}
                                onClick={handleUserClick}
                            />
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            Không tìm thấy người dùng
                        </div>
                    )
                ) : (
                    // Conversation List
                    conversations.length > 0 ? (
                        conversations.map((conversation) => {
                            const partner = getPartnerInfo(conversation);
                            const unreadCount = getUnreadCount(conversation);
                            const isOnline = isUserOnline(partner?._id);

                            return (
                                <div
                                    key={conversation._id}
                                    onClick={() => handleConversationClick(conversation)}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f3f4f6',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor = '#f9fafb')
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor = 'white')
                                    }
                                >
                                    {/* Avatar */}
                                    <div style={{ position: 'relative' }}>
                                        <div
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background:
                                                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '18px',
                                            }}
                                        >
                                            {partner?.username.charAt(0).toUpperCase()}
                                        </div>
                                        {isOnline && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '2px',
                                                    right: '2px',
                                                    width: '12px',
                                                    height: '12px',
                                                    backgroundColor: '#4ade80',
                                                    border: '2px solid white',
                                                    borderRadius: '50%',
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'baseline',
                                                marginBottom: '4px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontWeight: unreadCount > 0 ? '600' : '500',
                                                    fontSize: '15px',
                                                }}
                                            >
                                                {partner?.username}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                {formatTime(conversation.lastMessage?.createdAt)}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '14px',
                                                    color: '#6b7280',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    fontWeight: unreadCount > 0 ? '500' : '400',
                                                }}
                                            >
                                                {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                                            </span>
                                            {unreadCount > 0 && (
                                                <div
                                                    style={{
                                                        minWidth: '20px',
                                                        height: '20px',
                                                        borderRadius: '10px',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '0 6px',
                                                    }}
                                                >
                                                    {unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div
                            style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                color: '#9ca3af',
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                            <div style={{ fontSize: '15px' }}>Chưa có cuộc trò chuyện nào</div>
                            <div style={{ fontSize: '13px', marginTop: '8px' }}>
                                Nhấn + để bắt đầu chat
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ChatList;
