import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/Chat/ChatList';
import ChatBox from '../components/Chat/ChatBox';
import { axiosPublic } from '../config/axiosPublic';
import { setAccessToken } from '../redux/clices/tokenSlice';
import { logout } from '../redux/clices/authSlice';
import test from 'node:test';
import { useState } from 'react';

const ChatAppPages = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { accessToken } = useSelector((state) => state.token);
    const [test, setTest] = useState(null);
    // Redirect nếu chưa login
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signin');
        }
    }, [isAuthenticated, navigate]);

    // Refresh token nếu chưa có accessToken
    useEffect(() => {
        const refreshTokenIfNeeded = async () => {
            if (isAuthenticated && !accessToken) {
                try {
                    const res = await axiosPublic.post('/api/auth/refresh-token');
                    const newAccessToken = res.data?.accessToken;
                    if (newAccessToken) {
                        dispatch(setAccessToken(newAccessToken));
                    }
                } catch (error) {
                    console.error('Failed to refresh token:', error);
                    dispatch(logout());
                    navigate('/signin');
                }
            }
        };

        refreshTokenIfNeeded();
    }, [isAuthenticated, accessToken, dispatch, navigate]);

    // Socket listeners đã được setup ở App.jsx (global level)
    // Không cần setup lại ở đây để tránh duplicate listeners

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                backgroundColor: '#f3f4f6',
            }}
        >
            {/* Container */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '1400px',
                    height: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    backgroundColor: 'white',
                    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                }}
            >
                {/* Chat List */}
                <ChatList />

                {/* Chat Box */}
                <ChatBox />
            </div>
        </div>
    );
};

export default ChatAppPages;
