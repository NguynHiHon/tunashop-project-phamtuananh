
const userService = require('../services/userService');

const userController = {

    getMe: async (req, res) => {
        try {
            const user = req.user;
            const userInfo = await userService.getInfor(user.id);
            return res.status(200).json({ message: 'Lấy thông tin người dùng thành công', userInfo });
        } catch (error) {
            const status = error.status || 500;
            let message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({
                message,
            });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await userService.getAllUsers();
            return res.status(200).json({ message: 'Lấy danh sách người dùng thành công', users });
        } catch (error) {
            const status = error.status || 500;
            let message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({
                message,
            });
        }
    },

    createUser: async (req, res) => {
        try {
            const data = req.body;
            const user = await userService.create(data);
            return res.status(201).json({ message: 'User created', data: user });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    getUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await userService.getUser(id);
            return res.status(200).json({ data: user });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await userService.updateUser(id, req.body);
            return res.status(200).json({ message: 'User updated', data: updated });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message, errors: error.details || undefined });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            await userService.deleteUser(id);
            return res.status(200).json({ message: 'User deleted' });
        } catch (error) {
            const status = error.status || 500;
            const message = error.message || 'INTERNAL_SERVER_ERROR';
            return res.status(status).json({ message });
        }
    }
};

module.exports = userController; 