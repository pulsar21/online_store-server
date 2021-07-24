const Router = require('express');
const typeController = require('../controllers/typeController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const { check } = require('express-validator');
const router = new Router();

router.post('/', 
    [
        check('name', 'Имя типа не должно быть пустым').notEmpty(),
        check('name', 'Имя типа должен быть больше 15 символов').isLength({max: 20})
    ],
    authMiddleware,
    checkRoleMiddleware('ADMIN'),
    typeController.create
);
router.get('/', typeController.getTypes);
router.get('/search', typeController.searchTypes);
router.put('/:id', 
    [
        check('name', 'Имя типа не должно быть пустым').notEmpty(),
        check('name', 'Имя типа должен быть больше 15 символов').isLength({max: 20})
    ],
    authMiddleware,
    checkRoleMiddleware('ADMIN'),  
    typeController.update
);
router.delete('/:id', authMiddleware ,checkRoleMiddleware('ADMIN'), typeController.remove);

module.exports = router;