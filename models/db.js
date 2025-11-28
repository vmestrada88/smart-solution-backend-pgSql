const { Sequelize } = require('sequelize');

const {
  DATABASE_URL,
  DB_NAME = 'smartsolution',
  DB_USER = 'postgres', 
  DB_PASSWORD = 'admin123',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_SSL = 'false', // Add DB_SSL with default 'false'
  NODE_ENV = 'development', // Cambiar default a development
} = process.env;

console.log('🔍 DB Config:', {
  DB_HOST,
  DB_NAME,
  DB_USER,
  NODE_ENV,
  DB_SSL
});

// Nuevo log para verificar si DATABASE_URL está definido
console.log('🔍 DATABASE_URL:', DATABASE_URL);

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
