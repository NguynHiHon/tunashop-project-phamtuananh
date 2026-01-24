import React from 'react';

const TypingIndicator = ({ username }) => {
    return (
        <div
            style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#666',
                fontSize: '14px',
                fontStyle: 'italic',
            }}
        >
            <div style={{ display: 'flex', gap: '4px' }}>
                <div
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        animation: 'bounce 1.4s infinite ease-in-out',
                        animationDelay: '0s',
                    }}
                />
                <div
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        animation: 'bounce 1.4s infinite ease-in-out',
                        animationDelay: '0.2s',
                    }}
                />
                <div
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        animation: 'bounce 1.4s infinite ease-in-out',
                        animationDelay: '0.4s',
                    }}
                />
            </div>
            <span>{username || 'Đang'} đang nhập...</span>
            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-8px);
                    }
                }
            `}</style>
        </div>
    );
};

export default TypingIndicator;
