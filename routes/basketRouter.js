const Router = require('express');
const basketController = require('../controllers/basketController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const { check } = require('express-validator');
const router = new Router();


router.get('/:id', 
    authMiddleware,
    basketController.getAll
);

router.post('/', 
    authMiddleware,
    basketController.create
);

router.delete('/:id', 
    authMiddleware,
    basketController.remove
)

router.delete('/', 
    authMiddleware,
    basketController.reset
)


module.exports = router;