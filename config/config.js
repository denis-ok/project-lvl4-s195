// const dotenv = require('dotenv').config();

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
    use_env_variable: 'DATABASE_URL',
    dialectOptions: {
      // native: true,
      ssl: true,
    },
  },
};

module.exports = config;
