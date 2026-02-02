const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attributeController');
const authMiddleWare = require('../middlewares/authMiddleWare');

// Public routes
router.get('/all', attributeController.getAll);

// Admin only routes - Yêu cầu đăng nhập và quyền admin
router.get('/', authMiddleWare.verifyAdmin, attributeController.getMany);
router.get('/:id', authMiddleWare.verifyAdmin, attributeController.getOne);
router.post('/', authMiddleWare.verifyAdmin, attributeController.create);
router.put('/:id', authMiddleWare.verifyAdmin, attributeController.update);
router.delete('/:id', authMiddleWare.verifyAdmin, attributeController.delete);

module.exports = router;