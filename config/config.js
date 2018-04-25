const dotenv = require('dotenv').config();

const config = {
  development: {
    storage: './db.development.sqlite',
    dialect: 'sqlite',
    operatorsAliases: 'Sequelize.Op',
  },
  test: {
    storage: ':memory:',
    dialect: 'sqlite',
  },
  production: {
    username: process.env.HEROKU_DB_USERNAME,
    password: process.env.HEROKU_DB_PASSWORD,
    database: process.env.HEROKU_DB_DBNAME,
    host: process.env.HEROKU_DB_HOST,
    dialect: 'postgres',
  },
};

module.exports = config;

