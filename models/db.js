const { Sequelize } = require('sequelize');

// Prefer DATABASE_URL; fallback to discrete environment variables.
const {
  DATABASE_URL,
  DB_NAME = 'smartsolution',
  DB_USER = 'postgres',
  DB_PASSWORD = 'admin123',
  DB_HOST = 'localhost',
  DB_PORT = '5432'
} = process.env;

let sequelize;

if (DATABASE_URL) {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
  });
} else {
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
  });
}

module.exports = sequelize;
