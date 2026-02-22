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
 * No authentication required.
 */
router.get('/', productController.getProducts); // Get all products - SIN auth

/**
 * Route to create a new product.
 * Requires admin authentication.
 */
router.post('/', auth, adminAuth, productController.createProduct); // Create a new product

/**
 * Route to get a product by ID.
 * No authentication required.
 */
router.get('/:id', productController.getProductById); // Get product by ID - SIN auth

/**
 * Route to update a product by ID.
 * Requires admin authentication.
 */
router.put('/:id', auth, adminAuth, productController.updateProduct); // Update product by ID

/**
 * Route to delete a product by ID.
 * Requires admin authentication.
 */
router.delete('/:id', auth, adminAuth, productController.deleteProduct); // Delete product by ID

module.exports = router; // Export the router
