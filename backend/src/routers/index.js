
const express = require('express');
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const chatRouter = require('./chatRouter');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/chat', chatRouter);
module.exports = router;