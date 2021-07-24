const ApiError = require("../error/ApiError");
const { Delivery, Basket, User, BasketDevice } = require("../models/models");

class DeliveryController {
    async create(req, res, next) {
        try {
            const { 
                full_name, email,
                phone, city, street, house, 
                apartment, cart_number, cart_full_name, 
                cart_date, cart_code, cartItems 
            } = req.body;
            const { id: userId } = req.params;
            const basket = await Basket.findOne({ where: { userId } });
            const delivery = await Delivery.create({ 
                full_name, email, phone, city, street, 
                house, apartment, cart_number, cart_full_name, 
                cart_date, cart_code, basketId: basket.id 
            });
            return res.status(200).json(delivery);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
    async getAll(req, res, next) {
        try {
            const { id: userId } = req.params;
            const { id: basketId } = await Basket.findOne({ where: { userId } });
            const basket_device = await BasketDevice.findAll({ where: { basketId } })
            const delivery = await Delivery.findOne({ where: { basketId } });
            const total_price = basket_device.reduce((accum, item) => accum + item.price, 0);
            return res.status(200).json({delivery, total_price});
        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }
    // async remove(req, res, next) {
    //     try {
    //         const { id } = req.params;
    //         await BasketDevice.destroy({
    //             where: { id }
    //         });
    //         return res.status(200).json({ id: id });   
    //     } catch (error) {
    //         next(ApiError.badRequest('Ошибка при удаление товара с корзины'))
    //     };
    // }
}

module.exports = new DeliveryController();