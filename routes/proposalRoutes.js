/**
 * @file Defines routes for proposal-related operations.
 * @module routes/proposalRoutes
 */

const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

/**
 * Route to get all proposals.
 * Requires authentication.
 */
router.get('/', auth, proposalController.getAllProposals); // Get all proposals

/**
 * Route to create a new proposal.
 * Requires admin authentication.
 */
router.post('/', adminAuth, proposalController.createProposal); // Create a new proposal

/**
 * Route to get a proposal by ID.
 * Requires authentication.
 */
router.get('/:id', auth, proposalController.getProposalById); // Get proposal by ID

/**
 * Route to update a proposal by ID.
 * Requires admin authentication.
 */
router.put('/:id', adminAuth, proposalController.updateProposal); // Update proposal by ID

/**
 * Route to delete a proposal by ID.
 * Requires admin authentication.
 */
router.delete('/:id', adminAuth, proposalController.deleteProposal); // Delete proposal by ID

module.exports = router; // Export the router