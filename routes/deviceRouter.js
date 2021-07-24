const Router = require('express');
const deviceController = require('../controllers/deviceController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const router = new Router();

router.post('/', 
    [
        check('name', 'Имя продукта не должно быть пустым').notEmpty(),
        check('price', 'Цена не должна быть ниже 0').isFloat({min: 0}),
        check('count', 'Количетсво не должна быть ниже 0').isFloat({min: 0}),
        check('rating', 'Рейтинг должен быть числом от 0 до 5.').isFloat({min: 0, max: 5}),
        check('description', 'Описание продукта не должно быть пустым').notEmpty(),
        check('description', 'Описание продукта не должно быть меньше 5 и больше 10000 символов').isLength({min: 5, max: 10000}),
    ],
    deviceController.create
);
router.get('/', deviceController.getDevices);
router.get('/search', deviceController.searchDevices);
router.get('/filter-price-range-devices', deviceController.filterPriceRangeDevices);
router.get('/filter-rating-range-devices', deviceController.filterRatingRangeDevices);
router.get('/:id', deviceController.getOne);
router.delete('/:id', authMiddleware, checkRoleMiddleware('ADMIN'), deviceController.remove);
router.put('/:id',
    [
        check('name', 'Имя продукта не должно быть пустым').notEmpty(),
        check('price', 'Цена не должна быть ниже 0').isFloat({min: 0}),
        check('count', 'Количетсво не должна быть ниже 0').isFloat({min: 0}),
        check('rating', 'Рейтинг должен быть числом от 0 до 5.').isFloat({min: 0, max: 5}),
        check('description', 'Описание продукта не должно быть пустым').notEmpty(),
        check('description', 'Описание продукта не должно быть меньше 5 и больше 1000 символов').isLength({min: 5, max: 1000}),
    ],
    authMiddleware,
    checkRoleMiddleware('ADMIN'), 
    deviceController.update
);

module.exports = router;