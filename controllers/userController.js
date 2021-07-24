const ApiError = require("../error/ApiError");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Basket, UserFollowNotification } = require("../models/models");
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const sequelize = require("sequelize");
const sendMail = require('../services/sendMail');

const uuid = require('uuid');
const sendFollowNotification = require("../services/sendFollowNotification");
const verifyAccount = require("../services/verifyAccount");
const codeGenerator = require("../services/codeGenerator");

const generateJwt = (id, full_name ,email, role, basket, code=null) => {
    const payload = {
        id,
        full_name,
        email,
        role,
        basket,
        code
    };
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '24h' });
};

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            const { full_name, email, password, confirmPassword, role } = req.body;
            const candidate = await User.findOne({ where: { email } });

            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Registration error!', errors })
            }

            if (password !== confirmPassword) {
                return next(ApiError.badRequest('Passwords are not saved'));
            }

            if (candidate) {
                return next(ApiError.badRequest(`User with this ${email} already exists`));
            };

            const code = codeGenerator();
            const hashPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT, 10));
            const user = await User.create({ full_name, email, role, password: hashPassword});
            const basket = await Basket.create({ userId: user.id });
            const token = generateJwt(user.id, user.full_name, user.email, user.role, basket, code);
            const link = `${process.env.CLIENT_URL}/verify/${user.id}/${token}`;
            
            await verifyAccount(user.email, link, code);
            return res.status(200).json({token, message: 'Registration completed successfully!'});   
        } catch (error) {
            console.log(error);
            return next(ApiError.badRequest('Registration error!'));
        };
    };

    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            const { email, password } = req.body;
            const user = await User.findOne({ where: {email} });
            const comparePassword = bcrypt.compareSync(password, user.password);

            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Login error!', errors })
            }

            if (!user) {
                return next(ApiError.badRequest(`User ${email} not found`));
            }

            if (!comparePassword) {
                return next(ApiError.badRequest('Wrong password entered'));
            }

            const token = generateJwt(user.id, user.full_name, user.email, user.role);
            return res.status(200).json({token, message: `You are logged in under ${user.email}!`});   
        } catch (error) {
            console.log(error);
            return next(ApiError.badRequest('Login error!'));
        }
    }

    async auth(req, res, next) {
        try {
            const token = generateJwt(req.user.id, req.user.full_name, req.user.email, req.user.role, req.user.basket);
            return res.status(200).json({token});  
        } catch (error) {
            console.log(error);
            return next(ApiError.unAuthorized('Authentication failed!'));
        }
    }


    async followNotification(req, res, next) {
        try {
            const errors = validationResult(req);
            const { email } = req.body;
            const candidate_email = await UserFollowNotification.findOne({ where: {email} });

            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Error while subscribing to user alert!', errors })
            }

            if (candidate_email) {
                return next(ApiError.badRequest(`User ${email} is already subscribed`));
            }

            await sendFollowNotification(email);
            const follow_email = await UserFollowNotification.create({email});
            return res.status(200).json({follow_email, message: `Subscription to ${email} is confirmed!`});
        } catch (error) {
            console.log(error);
            return next(ApiError.badRequest('Error while subscribing to user alert!'));
        }
    }

    async getFollowNotification(req, res, next) {
        try {
            let { limit, page, sort } = req.query;
            page = page || 1;
            limit = limit || 9;
            const offset = page * limit - limit;
            let follow_notification;
            switch(sort) {
                case 'asc_email':
                    follow_notification = await UserFollowNotification.findAndCountAll({ limit, offset, order: [['email', 'ASC']] })
                    break;
                case 'desc_email':
                    follow_notification = await UserFollowNotification.findAndCountAll({ limit, offset, order: [['email', 'DESC']] }) 
                    break;
                case 'asc_createdAt':
                    follow_notification = await UserFollowNotification.findAndCountAll({ limit, offset, order: [['createdAt', 'ASC']] }) 
                    break;
                case 'desc_createdAt':
                    follow_notification = await UserFollowNotification.findAndCountAll({ limit, offset, order: [['createdAt', 'DESC']] }) 
                    break;
                case 'asc_updatedAt':
                    follow_notification = await UserFollowNotification.findAndCountAll({ limit, offset, order: [['updatedAt', 'ASC']] }) 
                    break;
                case 'desc_updatedAt':
                    follow_notification = await UserFollowNotification.findAndCountAll({ limit, offset, order: [['updatedAt', 'DESC']] }) 
                    break;
                default:
                    follow_notification = await UserFollowNotification.findAndCountAll({ limit, offset, order: [['createdAt', 'DESC']] });
                    break;
            }
            return res.status(200).json({follow_notification});
        } catch (error) {
            console.log(error);
            return next(ApiError.badRequest('Error receiving all notifications!'));
        }
    }

    async searchFollowNotification(req, res, next) {
        try {
            const searchName = req.query.search;
            if (searchName === '') {
                next(ApiError.internal('Ошибка при поиске устройтсв'))
            }
            let follow_notification = await UserFollowNotification.findAll()
            follow_notification = follow_notification.filter(follow => follow.email.includes(searchName)); 
            return res.status(200).json({follow_notification});
        } catch (error) {
            console.log(error)   
            return next(ApiError.badRequest('Ошибка при поиске подписок на оповещение!'));
        }
    }

    async forgot(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при вастановления пароля', errors })
            }
            const { email } = req.body;
            const user = await User.findOne({ where: {email} });
            if (!user) {
                return next(ApiError.badRequest(`Пользователь ${email} не найден`));
            }
            const token = generateJwt(user.id, user.full_name ,user.email, user.role);
            const link = `${process.env.CLIENT_URL}/reset-password/${user.id}/${token}`;
            await sendMail(email, link);
            return res.status(200).json({link, message: `Для изменение пароля проверьте свой ${user.email}`})
        } catch (error) {
            console.log(error);
            return next(ApiError.badRequest('Ошибка при вастановления пароля!'));
        }
    }

    async reset(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при изменение пароля', errors })
            }
            const { id, token } = req.params;
            const { email } = jwt.verify(token, process.env.SECRET_KEY);
            const user = await User.findOne({ where: {email} });
            const { password, confirmPassword } = req.body;
        
            const comparePassword = bcrypt.compareSync(password, user.password);
            if (comparePassword) {
                return next(ApiError.badRequest('Такой пароль уже используется'));
            }
            if (password !== confirmPassword) {
                return next(ApiError.badRequest('Пароли не савподают'));
            }
            const hashPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT, 10));
            await User.update({
                password: hashPassword
            }, { returning: true, where: { id }})
            return res.status(200).json({user, message: `Пароль у ${user.email} изменен!`});  
        } catch (error) {
            console.log(error);
            return next(ApiError.badRequest('Ошибка при изменение пароля!'));
        }
    }

    async verify(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при верификации пользователя', errors })
            }
            const { id, token } = req.params;
            const { email, code } = jwt.verify(token, process.env.SECRET_KEY);
            const { currentCode } = req.body;
        
            if (code !== currentCode) {
                return next(ApiError.badRequest('Не правильный код!'));
            }

            return res.status(200).json({token, message: `Пользователь ${email} верифициран`});  
        } catch (error) {
            console.log(error);
            return next(ApiError.badRequest('Ошибка при верификации пользователя!'));
        }
    }

    async create(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при добавление пользователя', errors })
            }
            let { email, full_name, password, confirmPassword, role } = req.body;
            if (!email || !password) {
                return next(ApiError.badRequest('Не корректная почта или пароль'));
            };
            if (password !== confirmPassword) {
                return next(ApiError.badRequest('Пароли не савподают'));
            }
            const candidate = await User.findOne({ where: { email } });
            if (candidate) {
                return next(ApiError.badRequest(`Пользователь с таким ${email} уже существует`));
            };
            const hashPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT, 10));
            const user = await User.create({email, full_name, password: hashPassword, role});
            return res.status(200).json({user, message: `Пользователь с таким ${email} добавлен`});   
        } catch (error) {
            return next(ApiError.badRequest('Ошибка при добавление пользователя!'));
        }
    }

    async getUsers(req, res, next) {
        try {
            let { limit, page, sort } = req.query;
            page = page || 1;
            limit = limit || 9;
            const offset = page * limit - limit;
            let users;
            switch(sort) {
                case 'asc_name':
                    users = await User.findAndCountAll({ limit, offset, order:  [['full_name', 'ASC']] });
                    break;
                case 'desc_name':
                    users = await User.findAndCountAll({ limit, offset, order:  [['full_name', 'DESC']] });  
                    break;
                case 'asc_createdAt':
                    users = await User.findAndCountAll({ limit, offset, order:  [['createdAt', 'ASC']] });  
                    break;
                case 'desc_createdAt':
                    users = await User.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']] });  
                    break;
                case 'asc_updatedAt':
                    users = await User.findAndCountAll({ limit, offset, order:  [['updatedAt', 'ASC']] });  
                    break;
                case 'desc_updatedAt':
                    users = await User.findAndCountAll({ limit, offset, order:  [['updatedAt', 'DESC']] });  
                    break;
                default:
                    users = await User.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']]});
                    break;
            };
            return res.status(200).json({users});  
        } catch (error) {
            return next(ApiError.badRequest('Ошибка при получение всех пользователей!'));
        }
    }

    async getAdmins(req, res, next) {
        try {
            let { limit, page, sort } = req.query;
            page = page || 1;
            limit = limit || 100;
            const offset = page * limit - limit;
            let users;
            switch(sort) {
                case 'asc_name':
                    users = await User.findAndCountAll({ limit, offset, order:  [['full_name', 'ASC']] });
                    break;
                case 'desc_name':
                    users = await User.findAndCountAll({ limit, offset, order:  [['full_name', 'DESC']] });  
                    break;
                case 'asc_createdAt':
                    users = await User.findAndCountAll({ limit, offset, order:  [['createdAt', 'ASC']] });  
                    break;
                case 'desc_createdAt':
                    users = await User.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']] });  
                    break;
                case 'asc_updatedAt':
                    users = await User.findAndCountAll({ limit, offset, order:  [['updatedAt', 'ASC']] });  
                    break;
                case 'desc_updatedAt':
                    users = await User.findAndCountAll({ limit, offset, order:  [['updatedAt', 'DESC']] });  
                    break;
                default:
                    users = await User.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']]});
                    break;
            };
            const admins = users;
            return res.status(200).json({admins});  
        } catch (error) {
            return next(ApiError.badRequest('Ошибка при получение всех админов!'));
        }
    }

    async searchAdmins(req, res, next) {
        try {
            const searchName = req.query.search;
            let users = await User.findAll();
            users = users.filter(user => user.role === 'ADMIN' && user); 
            const admins = users.filter(user => user.email.includes(searchName) || user.full_name.includes(searchName)); 
            return res.status(200).json({admins});
        } catch (error) {
            console.log(error)   
            return next(ApiError.badRequest('Ошибка при поиске пользователей!'));
        }
    }

    async searchUsers(req, res, next) {
        try {
            const searchName = req.query.search;
            if (searchName === '') {
                next(ApiError.internal('Ошибка при поиске устройтсв'))
            }
            let users = await User.findAll()
            users = users.filter(user => user.email.includes(searchName) || user.full_name.includes(searchName)); 
            return res.status(200).json({users});
        } catch (error) {
            console.log(error)   
            return next(ApiError.badRequest('Ошибка при поиске пользователей!'));
        }
    }

    async sortUsers(req, res, next) {
        try {
            const sort = req.query.sort;
            let users;
            switch(sort) {
                case 'asc_email':
                    users = await User.findAll({ order: [sequelize.literal('email ASC')] });
                    break;
                case 'desc_email':
                    users = await User.findAll({ order: [sequelize.literal('email DESC')] });
                    break;
                default:
                    users = await User.findAll();
                    break;
            };
            res.status(200).json({users});
        } catch (error) {
            console.log(error)   
            return next(ApiError.badRequest('Ошибка при сортировке пользователей!'));
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User.findOne({
                where: {id},
            })
            return res.status(200).json({
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            });      
        } catch (error) {
            return next(ApiError.badRequest('Ошибка при получение пользователя!'));
        } 
    }

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await User.destroy({
                where: {id}
            })
            res.status(200).json({id: id});
        } catch (error) {
            return next(ApiError.badRequest('Ошибка при удаление пользователя!'));
        }
    }

    async update(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при изменение пользователя', errors })
            }
            const { id } = req.params;
            const { email, full_name } = req.body
            let updateUser = await User.update({
                email,
                full_name
            }, { returning: true, where: { id }})
            updateUser = updateUser[1].map(user => user);
            const user = {
                id: updateUser[0].id,
                email: updateUser[0].email,
                full_name: updateUser[0].full_name,
                role: updateUser[0].role,
                createdAt: updateUser[0].createdAt,
                updatedAt: updateUser[0].updatedAt,
            }
            return res.status(200).json({user, message: `${user.email} настройки были изменены!`});   
        } catch (error) {
            return next(ApiError.badRequest('Ошибка при изменение пользователя!'));
        }
    }

    async authGoogle(req, res, next) {
        try {
            let { token, id } = req.body;
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
            const { name, email, picture, email_verified } = ticket.getPayload();
            const candidate = await User.findOne({ where: {email} });
            if (candidate) {
                return next(ApiError.badRequest(`Пользователь с таким ${email} уже существует`));
            }
            if (!email_verified) {
                return res.status(400).json({ message: 'Ошибка при авторизаций через Google'})
            } else {
                const token = generateJwt(id, name, email, 'USER');
                return res.status(200).json({token, message: `Вы авторизовались под ${email}`})
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Ошибка при авторизаций через Google' })
        }
    }

    async authFacebook(req, res) {
        try {
            const { id, token } = req.body;
            res.status(200).json({id, token})
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка при авторизаций через Facebook!' });
        }
    }
}

module.exports = new UserController();