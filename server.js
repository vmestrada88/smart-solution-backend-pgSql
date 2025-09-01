/**
 * Main Express server file.
 * Sets up middlewares, routes, and database connection.
 * Starts the server on the specified port.
 */

 /**
  * Determines the environment file to use based on the current Node.js environment.
  * If the environment is 'production', uses '.env.production'; otherwise, uses '.env'.
  *
  * @type {string}
  */
/**
 * Maps environment names to their corresponding .env file paths.
 *
 * @type {Object.<string, string>}
 * @property {string} development - Path to the development environment file.
 * @property {string} production - Path to the production environment file.
 * @property {string} test - Path to the test environment file.
 * @property {string} staging - Path to the staging environment file.
 */
const envMap = {
  development: '.env.development',
  production: '.env.production',
  test: '.env.test',
  staging: '.env.staging'
};
const envFile = envMap[process.env.NODE_ENV] || '.env.development';
require('dotenv').config({ path: envFile });

console.log(`🔧 Mode: ${process.env.NODE_ENV === 'production' ? 'REMOTE (RDS)' : 'LOCAL'}`);
console.log(`🔧 Using config: ${envFile}`);
console.log(`🏠 DB Host: ${process.env.DB_HOST}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const sequelize = require('./models/db');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Configures allowed origins for CORS based on environment variables.
 * Supports both single and multiple frontend URLs.
 */
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const FRONTEND_URLS = process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',').map(s => s.trim()) : [];
const allowedOrigins = new Set([FRONTEND_URL, ...FRONTEND_URLS, 'http://localhost:5174', 'http://localhost:5173'].filter(Boolean));

/**
 * Sets up CORS middleware to restrict access to allowed origins.
 */
app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (no origin) and any whitelisted origin
    if (!origin || allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error('CORS: Origin not allowed: ' + origin));
  },
  credentials: true,
}));
app.use(express.json());

/**
 * Registers API routes for products, authentication, clients, invoices, and users.
 */
app.use('/api/products', productRoutes);
app.use('/api', require('./routes/auth'));
app.use('/api/clients', require('./routes/clientsRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));

/**
 * Health check endpoint (simple version - no DB dependency).
 * @route GET /api/health
 * @returns {Object} JSON with server status and uptime.
 */
app.get('/api/health', (req, res) => {
  return res.json({ 
    ok: true, 
    status: 'running',
    uptime: process.uptime(), 
    time: new Date().toISOString(),
    port: PORT 
  });
});

/**
 * Health check endpoint with DB connection.
 * Useful for debugging database connectivity.
 * @route GET /api/health/db
 * @returns {Object} JSON with DB status, uptime, latency, and timestamp.
 */
app.get('/api/health/db', async (req, res) => {
  const start = Date.now();
  try {
    await sequelize.authenticate();
    return res.json({ ok: true, db: true, uptime: process.uptime(), latencyMs: Date.now() - start, time: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ ok: false, db: false, error: err.message, latencyMs: Date.now() - start });
  }
});

/**
 * Serves static files from the 'uploads' directory.
 * Accessible via /uploads route.
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Starts the Express server and logs allowed origins.
 */
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  console.log('Allowed origins:', Array.from(allowedOrigins).join(', '));
});

