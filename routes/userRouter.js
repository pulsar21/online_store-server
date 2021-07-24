const Router = require('express')
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const { check } = require('express-validator');
const router = new Router()

router.post('/follow-notification', 
    [
        check('email', 'Username must not be empty').notEmpty(),
        check('email', 'Incorrect email').isEmail().normalizeEmail(),
    ],
    userController.followNotification
);
router.get('/follow-notification/all',
    authMiddleware,
    checkRoleMiddleware('ADMIN'),
    userController.getFollowNotification
);
router.get('/follow-notification/search', authMiddleware, checkRoleMiddleware('ADMIN') ,userController.searchFollowNotification);
router.post('/registration', 
    [
        check('email', 'Username must not be empty').notEmpty(),
        check('email', 'Incorrect email').isEmail().normalizeEmail(),
        check('full_name', 'Name & Surname must not be empty').notEmpty(),
        check('password', 'Password must not be empty').notEmpty(),
        check('password', 'Password must be more than 4 and less than 15 characters').isLength({min: 4, max: 15}),
        check('confirmPassword', 'Confirm password must not be empty').notEmpty(),
    ], 
    userController.registration
);
router.post('/login', 
    [
        check('email', 'Username must not be empty').notEmpty(),
        check('password', 'Password must not be empty').notEmpty(),
    ], 
    userController.login
);
router.get('/', authMiddleware, checkRoleMiddleware('ADMIN'), userController.getUsers);
router.get('/admin', authMiddleware, checkRoleMiddleware('ADMIN'), userController.getAdmins);
router.get('/admin/search', authMiddleware, checkRoleMiddleware('ADMIN') ,userController.searchAdmins);
router.get('/search', authMiddleware, checkRoleMiddleware('ADMIN') ,userController.searchUsers);
router.get('/sort', authMiddleware, checkRoleMiddleware('ADMIN') ,userController.sortUsers);
router.get('/auth', authMiddleware, userController.auth);
router.get('/:id', authMiddleware, userController.getOne);
router.patch('/:id',
    [
        check('full_name', 'Name & Surname must not be empty').notEmpty(),
        check('email', 'Username must not be empty').notEmpty(),
        check('email', 'Incorrect email').isEmail().normalizeEmail(),
    ],
    authMiddleware, 
    userController.update
);
router.delete('/:id', authMiddleware, checkRoleMiddleware('ADMIN'), userController.remove);
router.post('/forgot-password', 
    [
        check('email', 'Username must not be empty').notEmpty(),
        check('email', 'Incorrect email').isEmail().normalizeEmail(),
    ],
    userController.forgot
);
router.get('/reset-password/:id/:token', userController.reset);
router.patch('/reset-password/:id/:token', 
    [
        check('password', 'Password must not be empty').notEmpty(),
        check('password', 'Password must be more than 4 and less than 15 characters').isLength({min: 5, max: 20}),
        check('confirmPassword', 'Confirm password must not be empty').notEmpty(),
    ],  
    userController.reset
);
router.post('/verify/:id/:token',
    [
        check('currentCode', 'The code must not be empty and must be 4 digits long').notEmpty(), 
    ],
    userController.verify
);
router.post('/',
    [
        check('email', 'Username must not be empty').notEmpty(),
        check('email', 'Incorrect email').isEmail().normalizeEmail(),
        check('full_name', 'Name & Surname must not be empty').notEmpty(),
        check('password', 'Password must not be empty').notEmpty(),
        check('password', 'Password must be more than 4 and less than 15 characters').isLength({min: 4, max: 15}),
    ],
    authMiddleware,
    checkRoleMiddleware('ADMIN'), 
    userController.create
);
router.post('/google', userController.authGoogle);
router.post('/facebook', userController.authFacebook);

module.exports = router;