const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('smartsolution', 'postgres', 'admin123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
