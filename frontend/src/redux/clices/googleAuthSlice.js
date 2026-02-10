import { createSlice } from '@reduxjs/toolkit';

const googleAuthSlice = createSlice({
    name: 'googleAuth',
    initialState: {
        isFetching: false,
        error: false,
        errorMessage: null,
    },
    reducers: {
        googleLoginStart: (state) => {
            state.isFetching = true;
            state.error = false;
            state.errorMessage = null;
        },
        googleLoginSuccess: (state) => {
            state.isFetching = false;
            state.error = false;
            state.errorMessage = null;
        },
        googleLoginFailure: (state, action) => {
            state.isFetching = false;
            state.error = true;
            state.errorMessage = action.payload || 'Đăng nhập Google thất bại';
        },
        clearGoogleAuthState: (state) => {
            state.isFetching = false;
            state.error = false;
            state.errorMessage = null;
        },
    },
});

export const {
    googleLoginStart,
    googleLoginSuccess,
    googleLoginFailure,
    clearGoogleAuthState,
} = googleAuthSlice.actions;

export default googleAuthSlice.reducer;
