const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { verifyAdminOrStaff } = require('../middlewares/authMiddleWare');

// Admin/Staff routes
router.use(verifyAdminOrStaff);

// Search order by order code
router.get('/admin/search', returnController.searchOrder);

// Create return
router.post('/admin', returnController.createReturn);

// List returns
router.get('/admin', returnController.listReturns);

// Return detail
router.get('/admin/:id', returnController.getReturnDetail);

module.exports = router;
