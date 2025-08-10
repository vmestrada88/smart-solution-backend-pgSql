const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

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

    const newProduct = new Product({
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

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // <- this now works
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

module.exports = router;
