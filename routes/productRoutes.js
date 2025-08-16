const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Crear producto solo con JSON (sin imágenes nuevas)
router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Create product with images
router.post('/create', upload.array('images', 5), async (req, res) => {
  try {
    const {
      name, brand, model, description,
      quantity, priceSell, priceBuy, category
    } = req.body;

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    const newProduct = await Product.create({
      name,
      brand,
      model,
      description,
      quantity,
      priceSell,
      priceBuy,
      category,
      imageUrls,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/', async (req, res) => {
  console.log('Products endpoint called');
  try {
    // Agregar timeout a la consulta
    const products = await Promise.race([
      Product.findAll(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000)
      )
    ]);
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products', details: error.message });
  }
});

module.exports = router;
