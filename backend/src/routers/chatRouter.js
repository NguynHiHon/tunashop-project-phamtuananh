const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleWare = require('../middlewares/authMiddleWare');

const router = express.Router();

// Tất cả routes yêu cầu authentication
router.use(authMiddleWare.verifyAccessToken);

// Conversations
router.post('/conversations', chatController.createOrGetConversation);
router.get('/conversations', chatController.getConversations);
router.delete('/conversations/:conversationId', chatController.deleteConversation);

// Messages
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.patch('/conversations/:conversationId/read', chatController.markAsRead);

// Users
router.get('/users', chatController.getUsers);

module.exports = router;
