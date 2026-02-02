const express = require('express');
const router = express.Router();
const productTypeController = require('../controllers/productTypeController');
const authMiddleWare = require('../middlewares/authMiddleWare');

// Public routes (có thể dùng cho frontend hiển thị)
router.get('/all', productTypeController.getAll);

// Admin only routes - Yêu cầu đăng nhập và quyền admin
router.get('/', authMiddleWare.verifyAdmin, productTypeController.getMany);
router.get('/:id', authMiddleWare.verifyAdmin, productTypeController.getOne);
router.post('/', authMiddleWare.verifyAdmin, productTypeController.create);
router.put('/:id', authMiddleWare.verifyAdmin, productTypeController.update);
router.delete('/:id', authMiddleWare.verifyAdmin, productTypeController.delete);

module.exports = router;