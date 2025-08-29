/**
 * @file Defines routes for product-related operations.
 * @module routes/productRoutes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

/**
 * Route to get all products.
 * Requires authentication.
 */
router.get('/', auth, productController.getAllProducts); // Get all products

/**
 * Route to create a new product.
 * Requires admin authentication.
 */
router.post('/', adminAuth, productController.createProduct); // Create a new product

/**
 * Route to get a product by ID.
 * Requires authentication.
 */
router.get('/:id', auth, productController.getProductById); // Get product by ID

/**
 * Route to update a product by ID.
 * Requires admin authentication.
 */
router.put('/:id', adminAuth, productController.updateProduct); // Update product by ID

/**
 * Route to delete a product by ID.
 * Requires admin authentication.
 */
router.delete('/:id', adminAuth, productController.deleteProduct); // Delete product by ID

module.exports = router; // Export the router
