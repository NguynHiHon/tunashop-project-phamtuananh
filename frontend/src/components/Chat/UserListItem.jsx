import React from 'react';
import { useSelector } from 'react-redux';

const UserListItem = ({ user, onClick }) => {
    const { onlineUsers } = useSelector((state) => state.chat);
    const isOnline = onlineUsers.includes(user._id);

    return (
        <div
            onClick={() => onClick(user)}
            style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
            <div style={{ position: 'relative' }}>
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                    }}
                >
                    {user.username.charAt(0).toUpperCase()}
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
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', fontSize: '15px' }}>
                    {user.username}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                    {user.role}
                </div>
            </div>
        </div>
    );
};

export default UserListItem;
