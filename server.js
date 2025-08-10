const express = require('express');
// const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());




app.use('/api/products', productRoutes);
app.use('/api', require('./routes/auth'));
app.use('/api/clients', require('./routes/clientsRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor running port: ${PORT}`));
