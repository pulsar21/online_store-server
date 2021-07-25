require('dotenv').config();
const { Sequelize } = require('sequelize');
const pg = require('pg');
pg.defaults.ssl = process.env.DATABASE_UR ? true : false;

const proConfig = process.env.DATABASE_URL;
const devConig = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
module.exports = new Sequelize(process.env.NODE_ENV === 'production' ? proConfig : devConig, {
    ssl: process.env.DATABASE_UR ? true : false
});