const ApiError = require("../error/ApiError");
const { Type } = require("../models/models");
const { validationResult } = require('express-validator');

class TypeController {
    async create(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при добавление типа', errors })
            }
            const {name} = req.body;
            const candidateType = await Type.findOne({where: {name}});
            if (candidateType) {
                return res.status(400).json({ message: `Такой тип "${name}" уже существует` })
            }
            const type = await Type.create({name});
            if (name !== type.name) {
                res.status(500).json({ message: 'Имя типов не савподают' })
            }
            return res.status(200).json({type, message: `Тип "${name}" добавлен!`});   
        } catch (error) {
            next(ApiError.badRequest('Ошибка при добавление типа'))
        }
    }
    async getTypes(req, res, next) {
        try {
            let { limit, page, sort } = req.query;
            page = page || 1;
            limit = limit || 9;
            const offset = page * limit - limit;
            let types;
            switch(sort) {
                case 'asc_name':
                    types = await Type.findAndCountAll({ limit, offset, order: [['name', 'ASC']] });
                    break;
                case 'desc_name':
                    types = await Type.findAndCountAll({ limit, offset, order: [['name', 'DESC']] });
                    break;
                case 'asc_createdAt':
                    types = await Type.findAndCountAll({ limit, offset, order:  [['createdAt', 'ASC']] });  
                    break;
                case 'desc_createdAt':
                    types = await Type.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']] });  
                    break;
                case 'asc_updatedAt':
                    types = await Type.findAndCountAll({ limit, offset, order:  [['updatedAt', 'ASC']] });  
                    break;
                case 'desc_updatedAt':
                    types = await Type.findAndCountAll({ limit, offset, order:  [['updatedAt', 'DESC']] });  
                    break;
                default:
                    types = await Type.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']] });
                    break;
            }
            return res.status(200).json({types});     
        } catch (error) {
            next(ApiError.badRequest('Ошибки при получение типов'))
        }
    }

    async searchTypes(req, res, next) {
        try {
            let { page, limit } = req.query;
            page = page || 1;
            limit = limit || 8;
            const offset = page * limit - limit;
            const searchName = req.query.search;
            if (searchName === '') {
                next(ApiError.internal('Ошибка при поиске устройтсв'))
            }
            let types = await Type.findAll()
            types = types.filter(type => type.name.toLowerCase().includes(searchName.toLowerCase())); 
            res.status(200).json({types});
        } catch (error) {
            console.log(error)   
            next(ApiError.internal('Ошибка при поиске устройтсв'))
        }
    }


    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await Type.destroy({
                where: {id}
            })
            return res.status(200).json({id: id});   
        } catch (error) {
            next(ApiError.badRequest('Ошибка при удаление типа!'))
        }
    }

    async update(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при изменение типа', errors })
            }
            const { id } = req.params;
            const { name } = req.body;
            const candidateType = await Type.findOne({where: {name}});
            if (candidateType) {
                return res.status(400).json({ message: `Такой ${name} тип уже существует` })
            }
            let updateType = await Type.update({
                name: name
            }, { returning: true, where: { id }})
            updateType = updateType[1].map(type => type);
            const type = {
                id: updateType[0].id,
                name: updateType[0].name,
                createdAt: updateType[0].createdAt,
                updatedAt: updateType[0].updatedAt,
            }
            return res.status(200).json({type, message: `Тип ${req.body.name} изменен!`});     
        } catch (error) {
            next(ApiError.badRequest('Ошибка при изменение типа'))
        }
    }
}

module.exports = new TypeController();