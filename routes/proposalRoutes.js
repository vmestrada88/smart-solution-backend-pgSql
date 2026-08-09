/**
 * @file Defines routes for proposal-related operations.
 * @module routes/proposalRoutes
 */

const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const adminAuth = require('../middleware/adminAuth');
const { auth } = require('../middleware/auth');

/**
 * Public route to create proposal requests from products page.
 */
router.post('/public-request', proposalController.createPublicProposalRequest);

/**
 * Route to get all proposals.
 * Requires authentication.
 */
router.get('/', auth, proposalController.getAllProposals); // Get all proposals

/**
 * Route to create a new proposal.
 * Requires admin authentication.
 */
router.post('/', auth, adminAuth, proposalController.createProposal); // Create a new proposal

/**
 * Route to get a proposal by ID.
 * Requires authentication.
 */
router.get('/:id', auth, proposalController.getProposalById); // Get proposal by ID

/**
 * Route to update proposal status by ID.
 * Requires admin authentication.
 */
router.patch('/:id/status', auth, adminAuth, proposalController.updateProposalStatus); // Update proposal status by ID

/**
 * Route to update a proposal by ID.
 * Requires admin authentication.
 */
router.put('/:id', auth, adminAuth, proposalController.updateProposal); // Update proposal by ID

/**
 * Route to delete a proposal by ID.
 * Requires admin authentication.
 */
router.delete('/:id', auth, adminAuth, proposalController.deleteProposal); // Delete proposal by ID

module.exports = router; // Export the router