const express = require('express');
const cors = require('cors');

const dotenv = require('dotenv');
const path = require('path');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());



app.use('/api/products', productRoutes);
app.use('/api', require('./routes/auth'));
app.use('/api/clients', require('./routes/clientsRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
