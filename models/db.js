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
<<<<<<< HEAD
  dialectOptions: {},
  logging: false,
=======
  logging: NODE_ENV === 'development' ? console.log : false,

  // Pool conservador para App Runner -> RDS (evita saturar conexiones)
  pool: {
    max: 5,
    min: 1,
    acquire: 60000,  // tiempo máximo esperando una conexión (60s)
    idle: 30000,     // cierra conexiones ociosas (30s)
    evict: 10000,    // limpia conexiones muertas cada 10s
  },

  // Timeouts y keepalive a nivel de driver pg (no cambia la BD)
  dialectOptions: {
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
    // Node-postgres soporta estos flags; Sequelize los pasa al driver:
    statement_timeout: 15000,                    // 15s por query
    idle_in_transaction_session_timeout: 0,      // sin timeout por transacción ociosa
    connectTimeout: 60000,                       // 60s para conectar
    // Usar DB_SSL env si está definido, si no, usar lógica previa
    ssl: (typeof process.env.DB_SSL !== 'undefined')
      ? (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ? { require: true, rejectUnauthorized: false } : false)
      : (NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false),
    // Alternativa universal para forzar el statement_timeout:
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
>>>>>>> ba175208bcb52f38e7ceeb180198743a9ca211ee
};

if (DB_SSL === 'true') {
  common.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
} else {
  common.dialectOptions.ssl = false;
}

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
