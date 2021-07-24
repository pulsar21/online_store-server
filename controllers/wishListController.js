const ApiError = require("../error/ApiError");
const { WishList, WishListDevice } = require("../models/models");

class WishListController {
    async create(req, res, next) {
        try {
            const { cartItem, userId } = req.body;
            const wishlist = await WishList.findOne({ where: { userId } });
            const wishlist_device = await WishListDevice.create({ ...cartItem, wishlistId: wishlist.id, deviceId: cartItem.id });
            return res.status(200).json(wishlist_device)
        } catch (error) {
            next(ApiError.badRequest('Ошибка при добавление товара в корзину'))
        }
    }
    async getAll(req, res, next) {
        try {
            const { id: userId } = req.params;
            // const { id: wishListId } = await WishList.findOne({ where: { userId } });
            // const wishlist_device = await WishListDevice.findAll({ where: { wishListId } });
            return res.status(200).json(userId);
        } catch (error) {
            next(ApiError.badRequest('Ошибка при получение товаров в корзине'))
        }
    }
    async remove(req, res, next) {
        try {
            const { id } = req.params;
            await WishListDevice.destroy({
                where: { id }
            });
            return res.status(200).json({ id: id });   
        } catch (error) {
            next(ApiError.badRequest('Ошибка при удаление товара с корзины'))
        };
    }
}

module.exports = new WishListController();