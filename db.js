require('dotenv').config();
const { Sequelize } = require('sequelize');

const proConfig = process.env.DATABASE_URL;
const devConfig = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
module.exports = new Sequelize(process.env.NODE_ENV === 'production' ? proConfig : devConfig, {
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});