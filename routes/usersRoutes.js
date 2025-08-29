/**
 * @file Defines routes for user-related operations.
 * @module routes/usersRoutes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

/**
 * Route to get all users.
 * Requires admin authentication.
 */
router.get('/', adminAuth, userController.getAllUsers); // Get all users

/**
 * Route to create a new user.
 * Requires admin authentication.
 */
router.post('/', adminAuth, userController.createUser); // Create a new user

/**
 * Route to get a user by ID.
 * Requires authentication.
 */
router.get('/:id', auth, userController.getUserById); // Get user by ID

/**
 * Route to update a user by ID.
 * Requires admin authentication.
 */
router.put('/:id', adminAuth, userController.updateUser); // Update user by ID

/**
 * Route to delete a user by ID.
 * Requires admin authentication.
 */
router.delete('/:id', adminAuth, userController.deleteUser); // Delete user by ID

module.exports = router; // Export the router