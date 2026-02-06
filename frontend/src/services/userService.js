import { axiosJWT } from '../config/axiosJWT';
import {
    getUserProfileStart,
    getUserProfileSuccess,
    getUserProfileFailure,
    getUsersListStart,
    getUsersListSuccess,
    getUsersListFailure,
} from '../redux/clices/userSlice';


const userService = {

    fetchUserProfile: async (dispatch) => {
        dispatch(getUserProfileStart());
        try {
            const res = await axiosJWT.get('/api/users/me');
            dispatch(getUserProfileSuccess(res.data.userInfo));
            return res.data.userInfo;
        } catch (error) {
            dispatch(getUserProfileFailure());
            throw error;
        }
    },

    // Update User Profile (if needed later)
    updateUserProfile: async (userData) => {
        const res = await axiosJWT.put('/api/users/me', userData);
        return res.data;
    },
    // Get All Users (Admin only)

    getAllUser: async (dispatch) => {
        dispatch(getUsersListStart());
        try {
            const res = await axiosJWT.get('/api/users');
            dispatch(getUsersListSuccess(res.data));

            return res.data;
        } catch (error) {
            dispatch(getUsersListFailure(error));
            throw error;
        }
    },



    // Admin CRUD
    createUser: async (data) => {
        const res = await axiosJWT.post('/api/users', data);
        return res.data.data || res.data;
    },

    getUser: async (id) => {
        const res = await axiosJWT.get(`/api/users/${id}`);
        return res.data.data;
    },

    updateUser: async (id, data) => {
        const res = await axiosJWT.put(`/api/users/${id}`, data);
        return res.data.data;
    },

    deleteUser: async (id) => {
        const res = await axiosJWT.delete(`/api/users/${id}`);
        return res.data;
    }

};

export default userService;

