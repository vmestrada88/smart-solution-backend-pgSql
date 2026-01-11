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

console.log('=== db.js loaded ==********');

// Define the common config object, including SSL handling
const common = {
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,

  // Pool conservador para producción (evita saturar conexiones)
  pool: {
    max: 5,
    min: 1,
    acquire: 60000,  // tiempo máximo esperando una conexión (60s)
    idle: 30000,     // cierra conexiones ociosas (30s)
    evict: 10000,    // limpia conexiones muertas cada 10s
  },

  // Timeouts y keepalive a nivel de driver pg
  dialectOptions: {
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
    statement_timeout: 15000,                    // 15s por query
    idle_in_transaction_session_timeout: 0,      // sin timeout por transacción ociosa
    connectTimeout: 60000,                       // 60s para conectar
    // Configurar SSL dinámicamente
    ssl: (typeof process.env.DB_SSL !== 'undefined')
      ? (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ? { require: true, rejectUnauthorized: false } : false)
      : (NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false),
    options: '-c statement_timeout=15000'
  },

  // Retries ante fallos de red temporales
  retry: {
    max: 3,
    match: [
      /ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/, /ENOTFOUND/,
      /SequelizeConnectionError/, /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/, /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/, /SequelizeConnectionTimedOutError/,
    ],
  },
};

console.log('🔍 DB_SSL value:', DB_SSL, '| typeof:', typeof DB_SSL);
console.log('🔍 Sequelize ssl config:', common.dialectOptions.ssl);

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
