const Router = require('express');
const router = new Router();
const deviceRouter = require('./deviceRouter');
const userRouter = require('./userRouter');
const brandRouter = require('./brandRouter');
const typeRouter = require('./typeRouter');
const basketRouter = require('./basketRouter');
const notificationRouter = require('./notificationRouter');
const deliveryRouter = require('./deliveryRouter');
const wishListRouter = require('./wishListRouter');

router.use('/user', userRouter);
router.use('/type', typeRouter);
router.use('/brand', brandRouter);
router.use('/device', deviceRouter);
router.use('/basket', basketRouter);
router.use('/delivery', deliveryRouter);
router.use('/wishlist', wishListRouter);
router.use('/notification', notificationRouter);

module.exports = router;