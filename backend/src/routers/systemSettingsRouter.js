const express = require('express');
const router = express.Router();
const systemSettingsController = require('../controllers/systemSettingsController');
const { verifyAccessToken, verifyAdmin } = require('../middlewares/authMiddleWare');

// Public routes
router.get('/contact', systemSettingsController.getContactInfo);
router.get('/shipping', systemSettingsController.getShippingSettings);

// Admin routes
router.get('/', verifyAccessToken, systemSettingsController.getSettings);
router.put('/', verifyAccessToken, systemSettingsController.updateSettings);
router.put('/shipping', verifyAccessToken, systemSettingsController.updateShippingSettings);

// Branch management (admin)
router.post('/branches', verifyAccessToken, systemSettingsController.addBranch);
router.put('/branches/:branchId', verifyAccessToken, systemSettingsController.updateBranch);
router.delete('/branches/:branchId', verifyAccessToken, systemSettingsController.deleteBranch);

module.exports = router;
