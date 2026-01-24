import React from 'react';
import { useSelector } from 'react-redux';

const formatTime = (date) => {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const MessageItem = ({ message }) => {
    const { currentUser } = useSelector((state) => state.auth);
    const isSender = message.sender._id === currentUser._id;

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: isSender ? 'flex-end' : 'flex-start',
                marginBottom: '16px',
                padding: '0 16px',
            }}
        >
            <div
                style={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSender ? 'flex-end' : 'flex-start',
                }}
            >
                {/* Username (chỉ hiện khi là người nhận) */}
                {!isSender && (
                    <div
                        style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: '4px',
                            paddingLeft: '12px',
                        }}
                    >
                        {message.sender.username}
                    </div>
                )}

                {/* Message bubble */}
                <div
                    style={{
                        padding: '10px 14px',
                        borderRadius: isSender
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                        backgroundColor: isSender ? '#667eea' : '#f3f4f6',
                        color: isSender ? 'white' : '#1f2937',
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                >
                    <div style={{ fontSize: '15px', lineHeight: '1.5' }}>
                        {message.content}
                    </div>
                </div>

                {/* Time & Status */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                        fontSize: '11px',
                        color: '#9ca3af',
                        paddingLeft: isSender ? '0' : '12px',
                        paddingRight: isSender ? '12px' : '0',
                    }}
                >
                    <span>{formatTime(message.createdAt)}</span>
                    {isSender && (
                        <span>
                            {message.isRead ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
