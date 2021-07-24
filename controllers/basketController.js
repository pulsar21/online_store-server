const ApiError = require("../error/ApiError");
const { Basket, BasketDevice } = require("../models/models");

class BasketController {
    async create(req, res, next) {
        try {
            const { cartItem, userId } = req.body;
            const basket = await Basket.findOne({ where: { userId } });
            const basket_device = await BasketDevice.create({ ...cartItem, basketId: basket.id, deviceId: cartItem.id });
            return res.status(200).json(basket_device)
        } catch (error) {
            next(ApiError.badRequest('Ошибка при добавление товара в корзину'))
        }
    }
    async getAll(req, res, next) {
        try {
            const { id: userId } = req.params;
            const { id: basketId } = await Basket.findOne({ where: { userId } });
            const basket_device = await BasketDevice.findAll({ where: { basketId } });
            const total_price = basket_device.reduce((accum, item) => accum + item.price, 0);
            return res.status(200).json({basket_device, total_price});
        } catch (error) {
            next(ApiError.badRequest('Ошибка при получение товаров в корзине'))
        }
    }
    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await BasketDevice.destroy({
                where: { id }
            });
            return res.status(200).json({ id: id });   
        } catch (error) {
            next(ApiError.badRequest('Ошибка при удаление товара с корзины'))
        };
    }

    async reset(req, res, next) {
        try {
            const cartItems =  await BasketDevice.destroy({where: {}, truncate: true});
            return res.status(200).json({cartItems, message: 'Покупка завершена'});   
        } catch (error) {
            next(ApiError.badRequest('Ошибка при удаление товара с корзины'))
        };
    }
}

module.exports = new BasketController();