const ApiError = require("../error/ApiError");
const { Notification, User } = require("../models/models");
const { validationResult } = require('express-validator');

class NotificationController {
    async create(req, res, next) {
        try {
            const {title, id, full_name} = req.body;
            const notification = await Notification.create({
                title: title,
                userId: id,
                full_name: full_name
            });
            return res.status(200).json({notification});   
        } catch (error) {
            next(ApiError.badRequest('Ошибка нотификаций'))
        }
    }
    async getNotitifications(req, res, next) {
        try {
            let { limit, page, sort } = req.query;
            page = page || 1;
            limit = limit || 9;
            const offset = page * limit - limit;
            let notifications;
            switch(sort) {
                case 'asc_title':
                    notifications = await Notification.findAndCountAll({ limit, offset, order: [['title', 'ASC']] });
                    break;
                case 'desc_title':
                    notifications = await Notification.findAndCountAll({ limit, offset, order: [['title', 'DESC']] });
                    break;
                case 'asc_createdAt':
                    notifications = await Notification.findAndCountAll({ limit, offset, order:  [['createdAt', 'ASC']] });  
                    break;
                case 'desc_createdAt':
                    notifications = await Notification.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']] });  
                    break;
                case 'asc_updatedAt':
                    notifications = await Notification.findAndCountAll({ limit, offset, order:  [['updatedAt', 'ASC']] });  
                    break;
                case 'desc_updatedAt':
                    notifications = await Notification.findAndCountAll({ limit, offset, order:  [['updatedAt', 'DESC']] });  
                    break;
                default:
                    notifications = await Notification.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']] });
                    break;
            }
            return res.status(200).json({notifications});
        } catch (error) {
            next(ApiError.badRequest('Ошибка при получение всех нотификаций'))
        }   
    }
    
    async searchNotifications(req, res, next) {
        try {
            const searchName = req.query.search;
            if (searchName === '') {
                next(ApiError.internal('Ошибка при поиске устройтсв'))
            }
            let notifications = await Notification.findAndCountAll()
            notifications = notifications.rows.filter(notification => notification.title.includes(searchName)); 
            res.status(200).json({notifications});
        } catch (error) {
            console.log(error)   
            next(ApiError.internal('Ошибка при поиске оповещения'))
        }
    }

    async removeAll(req, res, next) {
        try {
            const notifications = await Notification.destroy({where: {}, truncate: true});
            return res.status(200).json({notifications});
        } catch (error) {
            next(ApiError.badRequest('Ошибка при получение всех нотификаций'))
        }
    }

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await Notification.destroy({
                where: {id}
            })
            return res.status(200).json({id: id});   
        } catch (error) {
            next(ApiError.badRequest('Ошибка при удаление типа!'))
        }
    }

}
module.exports = new NotificationController();