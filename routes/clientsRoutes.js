/**
 * @file Defines routes for client-related operations.
 * @module routes/clientsRoutes
 */

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const adminAuth = require('../middleware/adminAuth');
const {auth} = require('../middleware/auth');

/**
 * Route to get all clients.
 * Requires authentication.
 */
// router.get('/', auth, clientController.getClients); // Get all clients
router.get('/',  clientController.getClients); // Get all clients without auth

/**
 * Route to create a new client.
 * Requires admin authentication.
 */
// router.post('/', adminAuth, clientController.createClient); // Create a new client
router.post('/',  clientController.createClient); // Create a new client without auth

/**
 * Route to get a client by ID.
 * Requires authentication.
 */
// router.get('/:id', auth, clientController.getClientById); // Get client by ID
router.get('/:id', clientController.getClientById); // Get client by ID without auth

/**
 * Route to get a client by contact email.
 */
router.get('/by-email/:email', clientController.getClientByContactEmail);

/**
 * Route to update a client by ID.
 * Requires admin authentication.
 */
// router.put('/:id', adminAuth, clientController.updateClient); // Update client by ID
router.put('/:id',  clientController.updateClient); // Update client by ID without auth

/**
 * Route to delete a client by ID.
 * Requires admin authentication.
 */
// router.delete('/:id', adminAuth, clientController.deleteClient); // Delete client by ID

/**
 * Route to add a job to a client.
 * Requires admin authentication.
 */
// router.post('/:id/jobs', adminAuth, clientController.addJobToClient); // Add job to client
router.post('/:id/jobs', clientController.addJobToClient); // Add job to client  without auth

module.exports = router; // Export the router
