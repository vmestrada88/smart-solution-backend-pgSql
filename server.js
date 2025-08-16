const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const sequelize = require('./models/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// Support single FRONTEND_URL or comma-separated FRONTEND_URLS
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const FRONTEND_URLS = process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',').map(s => s.trim()) : [];
const allowedOrigins = new Set([FRONTEND_URL, ...FRONTEND_URLS].filter(Boolean));

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (no origin) and any whitelisted origin
    if (!origin || allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error('CORS: Origin not allowed: ' + origin));
  },
  credentials: true,
}));
app.use(express.json());



app.use('/api/products', productRoutes);
app.use('/api', require('./routes/auth'));
app.use('/api/clients', require('./routes/clientsRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Health endpoint (simple version - no DB dependency)
app.get('/api/health', (req, res) => {
  return res.json({ 
    ok: true, 
    status: 'running',
    uptime: process.uptime(), 
    time: new Date().toISOString(),
    port: PORT 
  });
});

// Health endpoint con DB (separado para debugging)
app.get('/api/health/db', async (req, res) => {
  const start = Date.now();
  try {
    await sequelize.authenticate();
    return res.json({ ok: true, db: true, uptime: process.uptime(), latencyMs: Date.now() - start, time: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ ok: false, db: false, error: err.message, latencyMs: Date.now() - start });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  console.log('Allowed origins:', Array.from(allowedOrigins).join(', '));
});
