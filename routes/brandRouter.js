const Router = require('express');
const brandController = require('../controllers/brandController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const { check } = require('express-validator');
const router = new Router();

router.post('/', 
    [
        check('name', 'Имя бренда не должно быть пустым').notEmpty(),
    ],
    authMiddleware,
    checkRoleMiddleware('ADMIN'),
    brandController.create
);
router.get('/', brandController.getBrands);
router.get('/search', brandController.searchBrands);
router.put('/:id', 
    [
        check('name', 'Имя бренда не должно быть пустым').notEmpty(),
    ],
    authMiddleware,
    checkRoleMiddleware('ADMIN'),  
    brandController.update
);
router.delete('/:id', authMiddleware, checkRoleMiddleware('ADMIN'), brandController.remove);

module.exports = router;