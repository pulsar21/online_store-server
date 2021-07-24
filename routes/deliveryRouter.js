const Router = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const { check } = require('express-validator');
const deliveryController = require('../controllers/deliveryController');
const router = new Router();


router.post('/:id', 
    authMiddleware,
    deliveryController.create
);

router.get('/:id', 
    authMiddleware,
    deliveryController.getAll
);



module.exports = router;