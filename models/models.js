const sequelize = require('../db');
const { DataTypes, UUIDV4 } = require('sequelize');

const User = sequelize.define('user', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    full_name: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"}
});

const UserFollowNotification = sequelize.define('user_follow_notification', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull:false, defaultValue: UUIDV4},
    email: {type: DataTypes.STRING, unique: true}
});

const Notification = sequelize.define('notification', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    title : {type: DataTypes.STRING},
    full_name: {type: DataTypes.STRING, allowNull: false}
})

const WishList = sequelize.define('wishlist', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
})

const WishListDevice = sequelize.define('wishlist_device', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false},
    rating: {type: DataTypes.FLOAT, defaultValue: 0},
    img: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false}
})

const Basket = sequelize.define('basket', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
})

const BasketDevice = sequelize.define('basket_device', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    rating: {type: DataTypes.FLOAT, defaultValue: 0},
    count: {type: DataTypes.INTEGER, defaultValue: 0},
    img: {type: DataTypes.STRING, allowNull: false},
    quantity: {type: DataTypes.INTEGER, defaultValue: 0},
    totalPrice: {type: DataTypes.INTEGER, allowNull: false},
})

const Delivery = sequelize.define('delivery', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    full_name: {type: DataTypes.STRING, allowNull: false},
    phone: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    city: {type: DataTypes.STRING, allowNull: false},
    street: {type: DataTypes.STRING, allowNull: false},
    house: {type: DataTypes.STRING, allowNull: false},
    apartment: {type: DataTypes.STRING, allowNull: false},
    cart_number: {type: DataTypes.STRING, allowNull: false},
    cart_full_name: {type: DataTypes.STRING, allowNull: false},
    cart_date: {type: DataTypes.STRING, allowNull: false},
    cart_code: {type: DataTypes.INTEGER, allowNull: false},
})

const Pickup = sequelize.define('pickup', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    full_name: {type: DataTypes.STRING, allowNull: false},
    phone: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    totalPrice: {type: DataTypes.INTEGER, allowNull: false},
})

const Device = sequelize.define('device', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    rating: {type: DataTypes.FLOAT, defaultValue: 0},
    count: {type: DataTypes.INTEGER, defaultValue: 0},
    description: {type: DataTypes.STRING, allowNull: false},
    selected: {type: DataTypes.BOOLEAN, defaultValue: false},
    img: {type: DataTypes.STRING, allowNull: false},
});

const Type = sequelize.define('type', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
});

const Brand = sequelize.define('brand', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
});

const Rating = sequelize.define('rating', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    name: {type: DataTypes.STRING, allowNull: false},
});

const DeviceInfo = sequelize.define('device_info', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
});

const TypeBrand = sequelize.define('type_brand', {
    id: {type: DataTypes.UUID, primaryKey: true, allowNull: false, defaultValue: UUIDV4},
});

User.hasOne(Basket);
Basket.belongsTo(User);

User.hasOne(WishList);
WishList.belongsTo(User);

Basket.hasOne(Delivery);
Delivery.belongsTo(Basket);

Basket.hasOne(Pickup);
Pickup.belongsTo(Basket);

User.hasMany(Rating);
Rating.belongsTo(User);

User.hasMany(Notification);
Notification.belongsTo(User);

WishList.hasMany(WishListDevice);
WishListDevice.belongsTo(WishList);

Basket.hasMany(BasketDevice);
BasketDevice.belongsTo(Basket);

Type.hasMany(Device);
Device.belongsTo(Type);

Brand.hasMany(Device);
Device.belongsTo(Brand);

Device.hasMany(Rating);
Rating.belongsTo(Device);

Device.hasMany(BasketDevice);
BasketDevice.belongsTo(Device);

Device.hasMany(WishListDevice);
WishListDevice.belongsTo(Device);

Device.hasMany(DeviceInfo, { as: 'info' });
DeviceInfo.belongsTo(Device);

Type.belongsToMany(Brand, { through: TypeBrand});
Brand.belongsToMany(Type, { through: TypeBrand});

module.exports = {
    User,
    UserFollowNotification,
    Notification,
    Basket,
    BasketDevice,
    WishList,
    WishListDevice,
    Delivery,
    Device,
    Type,
    Brand,
    Rating,
    TypeBrand,
    DeviceInfo
};