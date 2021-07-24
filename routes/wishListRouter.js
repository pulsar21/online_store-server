const Router = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const { check } = require('express-validator');
const wishListController = require('../controllers/wishListController');
const router = new Router();


router.get('/:id', 
    authMiddleware,
    wishListController.getAll
);

router.post('/', 
    authMiddleware,
    wishListController.create
);

router.delete('/:id', 
    authMiddleware,
    wishListController.remove
)


module.exports = router;