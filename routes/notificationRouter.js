const Router = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const { check } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const router = new Router();

router.post('/', authMiddleware, checkRoleMiddleware('ADMIN'), notificationController.create);
router.get('/', authMiddleware, checkRoleMiddleware('ADMIN'), notificationController.getNotitifications);
router.delete('/:id', authMiddleware, checkRoleMiddleware('ADMIN'), notificationController.remove)
router.get('/search', authMiddleware, checkRoleMiddleware('ADMIN'), notificationController.searchNotifications);
router.delete('/', authMiddleware, checkRoleMiddleware('ADMIN'), notificationController.removeAll);

module.exports = router;