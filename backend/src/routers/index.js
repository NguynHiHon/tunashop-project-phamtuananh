
const express = require('express');
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const chatRouter = require('./chatRouter');
const productTypeRouter = require('./productTypeRouter');
const attributeRouter = require('./attributeRouter');
const productRouter = require('./productRouter');
const cloudinaryRouter = require('./cloudinary');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/chat', chatRouter);
router.use('/product-types', productTypeRouter);
router.use('/attributes', attributeRouter);
router.use('/cloudinary', cloudinaryRouter);
router.use('/products', productRouter);
module.exports = router;