/**
 * @file Defines routes for client-related operations.
 * @module routes/clientsRoutes
 */

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

/**
 * Route to get all clients.
 * Requires authentication.
 */
router.get('/', auth, clientController.getAllClients); // Get all clients

/**
 * Route to create a new client.
 * Requires admin authentication.
 */
router.post('/', adminAuth, clientController.createClient); // Create a new client

/**
 * Route to get a client by ID.
 * Requires authentication.
 */
router.get('/:id', auth, clientController.getClientById); // Get client by ID

/**
 * Route to update a client by ID.
 * Requires admin authentication.
 */
router.put('/:id', adminAuth, clientController.updateClient); // Update client by ID

/**
 * Route to delete a client by ID.
 * Requires admin authentication.
 */
router.delete('/:id', adminAuth, clientController.deleteClient); // Delete client by ID

module.exports = router; // Export the router
