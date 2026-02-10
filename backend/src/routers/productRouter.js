const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middlewares/authMiddleWare');

router.get('/', productController.getProducts);
router.get('/brands', productController.getBrands);
router.post('/', verifyAdmin, productController.createProduct);
router.get('/:id', productController.getProduct);
router.put('/:id', verifyAdmin, productController.updateProduct);
router.put('/:id/sale', verifyAdmin, productController.updateProductSale);
router.delete('/:id', verifyAdmin, productController.deleteProduct);

module.exports = router;
