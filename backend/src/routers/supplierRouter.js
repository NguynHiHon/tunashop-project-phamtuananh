const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { verifyAdmin } = require('../middlewares/authMiddleWare');

router.get('/', verifyAdmin, supplierController.list);
router.post('/', verifyAdmin, supplierController.create);
router.put('/:id', verifyAdmin, supplierController.update);
router.delete('/:id', verifyAdmin, supplierController.remove);

module.exports = router;
