const ApiError = require("../error/ApiError");
const { Brand } = require("../models/models");
const { validationResult } = require('express-validator');

class BrandController {
    async create(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при добавление бренда', errors })
            }
            const {name} = req.body;
            const candidateBrand = await Brand.findOne({where: {name}});
            if (candidateBrand) {
                return res.status(400).json({ message: `Такой ${name} бренд уже существует` })
            }
            const brand = await Brand.create({name});
            if (name !== brand.name) {
                res.status(500).json({ message: 'Имя брендов не савподают' })
            }
            return res.status(200).json({brand, message: `Бренд ${name} добавлен!`});   
        } catch (error) {
            next(ApiError.badRequest('Ошибка при добавление бренда'))
        }
    }
    async getBrands(req, res, next) {
        try {
            let { limit, page, sort } = req.query;
            page = page || 1;
            limit = limit || 9;
            const offset = page * limit - limit;
            let brands;
            switch(sort) {
                case 'asc_name':
                    brands = await Brand.findAndCountAll({ limit, offset, order: [['name', 'ASC']] });
                    break;
                case 'desc_name':
                    brands = await Brand.findAndCountAll({ limit, offset, order: [['name', 'DESC']] });
                    break;
                case 'asc_createdAt':
                    brands = await Brand.findAndCountAll({ limit, offset, order:  [['createdAt', 'ASC']] });  
                    break;
                case 'desc_createdAt':
                    brands = await Brand.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']] });  
                    break;
                case 'asc_updatedAt':
                    brands = await Brand.findAndCountAll({ limit, offset, order:  [['updatedAt', 'ASC']] });  
                    break;
                case 'desc_updatedAt':
                    brands = await Brand.findAndCountAll({ limit, offset, order:  [['updatedAt', 'DESC']] });  
                    break;
                default:
                    brands = await Brand.findAndCountAll({ limit, offset, order:  [['createdAt', 'DESC']] });
                    break;
            }
            return res.status(200).json({brands});     
        } catch (error) {
            next(ApiError.badRequest('Ошибки при получение бренда'))
        }
    }

    async searchBrands(req, res, next) {
        try {
            let { page, limit } = req.query;
            page = page || 1;
            limit = limit || 8;
            const offset = page * limit - limit;
            const searchName = req.query.search;
            if (searchName === '') {
                next(ApiError.internal('Ошибка при поиске устройтсв'))
            }
            let brands = await Brand.findAll()
            brands = brands.filter(brand => brand.name.toLowerCase().includes(searchName.toLowerCase())); 
            res.status(200).json({brands});
        } catch (error) {
            console.log(error)   
            next(ApiError.internal('Ошибка при поиске устройтсв'))
        }
    }

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await Brand.destroy({
                where: {id}
            })
            return res.status(200).json({id: id});   
        } catch (error) {
            next(ApiError.badRequest('Ошибка при удаление бренда!'))
        }
    }

    async update(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: 'Ошибка при изменение бренда', errors })
            }
            const { id } = req.params;
            const { name } = req.body;
            const candidateBrand = await Brand.findOne({where: {name}});
            if (candidateBrand) {
                return res.status(400).json({ message: `Такой ${name} бренд уже существует` })
            }
            let updateBrand = await Brand.update({
                name: name
            }, { returning: true, where: { id }})
            updateBrand = updateBrand[1].map(brand => brand);
            const brand = {
                id: updateBrand[0].id,
                name: updateBrand[0].name,
                createdAt: updateBrand[0].createdAt,
                updatedAt: updateBrand[0].updatedAt,
            }
            return res.status(200).json({brand, message: `Бренд ${req.body.name} изменен!`});     
        } catch (error) {
            next(ApiError.badRequest('Ошибка при изменение бренда'))
        }
    }
}

module.exports = new BrandController();