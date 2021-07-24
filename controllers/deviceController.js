const { Device, DeviceInfo, Type } = require("../models/models");
const uuid = require('uuid');
const path = require('path');
const { validationResult } = require('express-validator');
const ApiError = require("../error/ApiError");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const _ = require("lodash");
const SearchBuilder = require("sequelize-search-builder/src/search-builder");

class DeviceController {
    async create(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при добавление устройтсво', errors })
            }
            let { name, price, count, rating, description, brandId, typeId, info } = req.body;
            const { img } = req.files;
            let fileName = uuid.v4() + '.jpg'
            img.mv(path.resolve(__dirname, '..', 'static', fileName))

            const device = await Device.create({name, price, count, rating, description, brandId, typeId, img: fileName});

            if (info) {
                info = JSON.parse(info);
                info.forEach(async(i) => {
                    await DeviceInfo.create({
                        title: i.title,
                        description: i.description,
                        deviceId: device.id
                    })
                })
            }

            return res.status(200).json({device, message: `${name} устройство было создано`});   
        } catch (error) {
            next(ApiError.badRequest('Ошибка при добавление устройтсво'))
        }
    }
    async getDevices(req, res, next) {
        try {
            let { brandId, typeId, limit, page, sort } = req.query;
            page = page || 1;
            limit = limit || 8;
            let offset = page * limit - limit;
            let devices;
            if (!brandId && !typeId) {
                switch(sort) {
                    case 'asc_name':
                        devices = await Device.findAndCountAll({ limit, offset, include: [{ model: DeviceInfo, as: 'info' }], order: [['name', 'ASC']] })
                        break;
                    case 'desc_name':
                        devices = await Device.findAndCountAll({ limit, offset,  include: [{ model: DeviceInfo, as: 'info' }], order: [['name', 'DESC']] }) 
                        break;
                    case 'asc_price':
                        devices = await Device.findAndCountAll({ limit, offset,  include: [{ model: DeviceInfo, as: 'info' }],  order: [['price', 'ASC']] })
                        break;
                    case 'desc_price':
                        devices = await Device.findAndCountAll({ limit, offset, include: [{ model: DeviceInfo, as: 'info' }], order: [['price', 'DESC']] }) 
                        break;
                    case 'asc_rating':
                        devices = await Device.findAndCountAll({ limit, offset, include: [{ model: DeviceInfo, as: 'info' }], order: [['rating', 'ASC']] })
                        break;
                    case 'desc_rating':
                        devices = await Device.findAndCountAll({ limit, offset, include: [{ model: DeviceInfo, as: 'info' }], order: [['rating', 'DESC']] }) 
                        break;
                    case 'asc_createdAt':
                        devices = await Device.findAndCountAll({ limit, offset, include: [{ model: DeviceInfo, as: 'info' }], order: [['createdAt', 'ASC']] }) 
                        break;
                    case 'desc_createdAt':
                        devices = await Device.findAndCountAll({ limit, offset, include: [{ model: DeviceInfo, as: 'info' }], order: [['createdAt', 'DESC']] }) 
                        break;
                    case 'asc_updatedAt':
                        devices = await Device.findAndCountAll({ limit, offset, include: [{ model: DeviceInfo, as: 'info' }], order: [['updatedAt', 'ASC']] }) 
                        break;
                    case 'desc_updatedAt':
                        devices = await Device.findAndCountAll({ limit, offset, include: [{ model: DeviceInfo, as: 'info' }], order: [['updatedAt', 'DESC']] }) 
                        break;
                    default:
                        devices = await Device.findAndCountAll({ limit, offset, include: [{ model: DeviceInfo, as: 'info' }]}) 
                        break;
                }
            }
            if (brandId && !typeId) {
                switch(sort) {
                    case 'asc_name':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['name', 'ASC']] })
                        break;
                    case 'desc_name':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['name', 'DESC']] }) 
                        break;
                    case 'asc_price':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['price', 'ASC']] })
                        break;
                    case 'desc_price':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['price', 'DESC']] }) 
                        break;
                    case 'asc_rating':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['rating', 'ASC']] })
                        break;
                    case 'desc_rating':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['rating', 'DESC']] }) 
                        break;
                    case 'asc_createdAt':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['createdAt', 'ASC']] }) 
                        break;
                    case 'desc_createdAt':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['createdAt', 'DESC']] }) 
                        break;
                    case 'asc_updatedAt':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['updatedAt', 'ASC']] }) 
                        break;
                    case 'desc_updatedAt':
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset, order: [['updatedAt', 'DESC']] }) 
                        break;
                    default:
                        devices = await Device.findAndCountAll({ where: { brandId }, limit, offset}) 
                        break;
                }
            }
            if (!brandId && typeId) {
                switch(sort) {
                    case 'asc_name':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['name', 'ASC']] })
                        break;
                    case 'desc_name':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['name', 'DESC']] }) 
                        break;
                    case 'asc_price':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['price', 'ASC']] })
                        break;
                    case 'desc_price':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['price', 'DESC']] }) 
                        break;
                    case 'asc_rating':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['rating', 'ASC']] })
                        break;
                    case 'desc_rating':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['rating', 'DESC']] }) 
                        break;
                    case 'asc_createdAt':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['createdAt', 'ASC']] }) 
                        break;
                    case 'desc_createdAt':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['createdAt', 'DESC']] }) 
                        break;
                    case 'asc_updatedAt':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['updatedAt', 'ASC']] }) 
                        break;
                    case 'desc_updatedAt':
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset, order: [['updatedAt', 'DESC']] }) 
                        break;
                    default:
                        devices = await Device.findAndCountAll({ where: { typeId }, limit, offset}) 
                        break;
                }
            }
            if (brandId && typeId) {
                switch(sort) {
                    case 'asc_name':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['name', 'ASC']] })
                        break;
                    case 'desc_name':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['name', 'DESC']] }) 
                        break;
                    case 'asc_price':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['price', 'ASC']] })
                        break;
                    case 'desc_price':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['price', 'DESC']] }) 
                        break;
                    case 'asc_rating':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['rating', 'ASC']] })
                        break;
                    case 'desc_rating':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['rating', 'DESC']] }) 
                        break;
                    case 'asc_createdAt':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['createdAt', 'ASC']] }) 
                        break;
                    case 'desc_createdAt':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['createdAt', 'DESC']] }) 
                        break;
                    case 'asc_updatedAt':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['updatedAt', 'ASC']] }) 
                        break;
                    case 'desc_updatedAt':
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset, order: [['updatedAt', 'DESC']] }) 
                        break;
                    default:
                        devices = await Device.findAndCountAll({ where: { typeId, brandId }, limit, offset}) 
                        break;
                }
            }
            return res.status(200).json({devices});     
        } catch (error) {
            next(ApiError.internal('Ошибка при получение всех устройтсв'))
        }
    }

    async searchDevices(req, res, next) {
        try {
            let limit = 8;
            const { brandId, typeId } = req.query;
            const searchName = req.query.search;
            let devices;
            if (!brandId && !typeId) {
                devices = await Device.findAndCountAll({limit})
            }
            if (brandId && !typeId) {
                devices = await Device.findAndCountAll({ limit, where: { brandId } })
            }
            if (!brandId && typeId) {
                devices = await Device.findAndCountAll({ limit, where: { typeId } })
            }
            if (brandId && typeId) {
                devices = await Device.findAndCountAll({ limit, where: { brandId, typeId } })
            }
            devices = devices.rows.filter(device => device.name.toLowerCase().includes(searchName.toLowerCase())); 
            res.status(200).json({devices});
        } catch (error) {
            console.log(error)   
            next(ApiError.internal('Ошибка при поиске устройтсв'))
        }
    }

    async filterPriceRangeDevices(req, res, next) {
        try {
            const { priceMin, priceMax, brandId } = req.query;
            let devices = await Device.findAndCountAll({limit: 8, offset:1, where: {brandId}});
            if(Number(priceMin) === 0 && Number(priceMax) === 0) {
                next(ApiError.internal('Цены не изменились'))
            }
            devices = devices.rows?.filter(device => {
                if (device.price >= Number(priceMin) && device.price <= Number(priceMax)) {
                    return device;
                }
            }).sort();
            res.status(200).json({devices});
        } catch (error) {
            console.log(error)   
            next(ApiError.internal('Ошибка при фильтрации цен'))
        }
    }

    async filterRatingRangeDevices(req, res, next) {
        try {
            const { ratingMin, ratingMax, brandId } = req.query;
            let devices = await Device.findAndCountAll({limit: 8, offset:1, where: {brandId}});
            if(Number(ratingMin) === 0 && Number(ratingMax) === 0) {
                next(ApiError.internal('Цены не изменились'))
            }
            devices = devices.rows?.filter(device => {
                if (device.rating >= Number(ratingMin) && device.rating <= Number(ratingMax)) {
                    return device;
                }
            }).sort();
            res.status(200).json({devices});
        } catch (error) {
            console.log(error)   
            next(ApiError.internal('Ошибка при фильтрации цен'))
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            let device = await Device.findOne({
                where: {id},
                include: [{ model: DeviceInfo, as: 'info' }]
            },)
            return res.status(200).json({device});   
        } catch (error) {
            next(ApiError.internal('Ошибка при получение этого устройтсво'))
        }   
    }
    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await Device.destroy({
                where: {id}
            })
            return res.status(200).json({id: id});  
        } catch (error) {
            next(ApiError.internal('Ошибка при удаление устройтсво'))
        }
    }
    async update(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при изменение устройтсво', errors })
            }
            const { id } = req.params;
            const { name, price, count, rating, description } = req.body;
            let updateDevice = await Device.update({
                name: name,
                price: price,
                count: count,
                rating: rating,
                description: description
            }, { returning: true, where: { id }})
            updateDevice = updateDevice[1].map(type => type);
            const device = {
                id: updateDevice[0].id,
                name: updateDevice[0].name,
                price: updateDevice[0].price,
                count: updateDevice[0].count,
                rating: updateDevice[0].rating,
                description: updateDevice[0].description,
                img: updateDevice[0].img,
                createdAt: updateDevice[0].createdAt,
                updatedAt: updateDevice[0].updatedAt,
            }
            return res.status(200).json({device, message: `${req.body.name} устройтсво был изменен!`});
        } catch (error) {
            next(ApiError.internal('Ошибка при изменение устройтсво'))
        }
    }
}

module.exports = new DeviceController();