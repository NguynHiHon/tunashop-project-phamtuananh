const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyAdmin } = require('../middlewares/authMiddleWare');

// Public submit
router.post('/', contactController.submit);

// Admin routes
router.use(verifyAdmin);
router.get('/', contactController.list);
router.get('/:id', contactController.get);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.remove);

module.exports = router;