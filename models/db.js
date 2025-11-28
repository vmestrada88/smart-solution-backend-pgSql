const { Sequelize } = require('sequelize');

const {
  DATABASE_URL,
  DB_NAME = 'smartsolution',
  DB_USER = 'postgres', 
  DB_PASSWORD = 'admin123',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_SSL = 'false',
  NODE_ENV = 'development',
} = process.env;

console.log('🔍 DB Config:', {
  DB_HOST,
  DB_NAME,
  DB_USER,
  NODE_ENV,
  DB_SSL
});

console.log('🔍 DATABASE_URL:', DATABASE_URL);

console.log('=== db.js loaded ===');

// Define the common config object, including SSL handling
const common = {
  dialect: 'postgres',
  dialectOptions: {},
  logging: false,
};

if (DB_SSL === 'true') {
  common.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
} else {
  common.dialectOptions.ssl = false;
}

let sequelize;

if (DATABASE_URL) {
  console.log('🔍 Usando DATABASE_URL para la conexión');
  sequelize = new Sequelize(DATABASE_URL, common);
} else {
  console.log('🔍 Usando parámetros individuales para la conexión');
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    ...common,
  });
}

module.exports = sequelize;
