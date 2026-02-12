import { axiosPublic } from '../config/axiosPublic';
import {
    loginStart,
    loginSuccess,
    loginFailure,
    registerStart,
    registerSuccess,
    registerFailure,
    logout
} from '../redux/clices/authSlice';
import { setAccessToken, clearToken } from '../redux/clices/tokenSlice';
import { clearUserProfile } from '../redux/clices/userSlice';
import { resetCart } from '../redux/clices/cartSlice';
import {
    googleLoginStart,
    googleLoginSuccess,
    googleLoginFailure,
} from '../redux/clices/googleAuthSlice';

// Sign In
export const signInUser = async (user, dispatch, navigate) => {
    dispatch(loginStart());
    try {
        const res = await axiosPublic.post('/api/auth/signIn', user);

        // Dispatch user info vào authSlice
        const userwithoutToken = { ...res.data.user };
        delete userwithoutToken.accessToken;
        dispatch(loginSuccess({ user: userwithoutToken }));

        // Dispatch accessToken vào tokenSlice
        dispatch(setAccessToken(res.data.user.accessToken));

        // Điều hướng theo role
        if (res.data.user.role === 'admin') {
            navigate("/admin/dashboard");
        } else {
            navigate("/");
        }

        return res.data;
    } catch (error) {
        dispatch(loginFailure());
        throw error;
    }
};

// Sign Up
export const signUpUser = async (user, dispatch, navigate) => {
    dispatch(registerStart());
    try {
        const res = await axiosPublic.post('/api/auth/signUp', user);
        dispatch(registerSuccess());
        navigate("/signin");
        return res.data;
    } catch (error) {
        dispatch(registerFailure());
        throw error;
    }
};

// Sign Out
export const signOutUser = async (dispatch, navigate) => {
    try {
        await axiosPublic.post('/api/auth/signOut');
        dispatch(logout());
        dispatch(clearToken());
        dispatch(clearUserProfile());
        dispatch(resetCart());
        navigate('/');
    } catch (error) {
        // Ngay cả khi API call thất bại, vẫn logout ở frontend
        console.error("SignOut API call failed:", error);
        dispatch(logout());
        dispatch(clearToken());
        dispatch(clearUserProfile());
        dispatch(resetCart());
        navigate('/');
    }
};

// Refresh Token (nếu cần)
export const refreshAccessToken = async (dispatch) => {
    try {
        const res = await axiosPublic.post('/api/auth/refresh-token');
        dispatch(setAccessToken(res.data.accessToken));
        return res.data.accessToken;
    } catch (error) {
        dispatch(logout());
        dispatch(clearToken());
        dispatch(clearUserProfile());
        dispatch(resetCart());
        throw error;
    }
};

// Google Sign In
export const googleSignIn = async (credential, dispatch, navigate) => {
    dispatch(googleLoginStart());
    try {
        const res = await axiosPublic.post('/api/auth/google', { credential });

        // Dispatch user info vào authSlice (giống signIn thường)
        const userWithoutToken = { ...res.data.user };
        delete userWithoutToken.accessToken;
        dispatch(loginSuccess({ user: userWithoutToken }));

        // Dispatch accessToken vào tokenSlice
        dispatch(setAccessToken(res.data.user.accessToken));

        // Đánh dấu google login thành công
        dispatch(googleLoginSuccess());

        // Điều hướng theo role
        if (res.data.user.role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/');
        }

        return res.data;
    } catch (error) {
        const msg = error?.response?.data?.message || error?.message || 'Đăng nhập Google thất bại';
        dispatch(googleLoginFailure(msg));
        dispatch(loginFailure());
        throw error;
    }
};




