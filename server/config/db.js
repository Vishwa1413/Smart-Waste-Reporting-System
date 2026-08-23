const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../smart_waste.db'),
  logging: false,
  dialectOptions: {
    // Wait up to 10 seconds if database is busy with concurrent writes
    timeout: 10000,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 3
  }
});

module.exports = sequelize;

