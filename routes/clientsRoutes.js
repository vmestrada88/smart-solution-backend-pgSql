const express = require('express');
const router = express.Router();

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  addJobToClient,
} = require('../controllers/clientController');

router.post('/', createClient);         // Create new client
router.get('/', getClients);            // List all clients
router.get('/:id', getClientById);      // Get client by ID
router.put('/:id', updateClient);       // Update client by ID
router.post('/:id/jobs', addJobToClient); // Add job to client

module.exports = router;
