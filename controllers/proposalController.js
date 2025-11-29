/**
 * @file Proposal controller for handling proposal-related operations.
 * @module controllers/proposalController
 */

const { Proposal, ProposalItem } = require('../models/Proposal');
const Client = require('../models/Client');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Get all proposals with related data
 */
const getAllProposals = async (req, res) => {
    try {
        const proposals = await Proposal.findAll({
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: ProposalItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json({ proposals });
    } catch (error) {
        console.error('Error getting proposals:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Create a new proposal with items
 */
const createProposal = async (req, res) => {
    const transaction = await Proposal.sequelize.transaction();
    
    try {
        const {
            clientId,
            clientInfoName,
            clientInfoEmail,
            clientInfoPhone,
            clientInfoAddress,
            tax,
            status,
            validUntil,
            notes,
            items = []
        } = req.body;

        // Validate required fields
        if (!clientInfoName) {
            return res.status(400).json({ 
                error: 'Client name is required' 
            });
        }

        // Create proposal (proposalNumber will be auto-generated)
        const proposal = await Proposal.create({
            clientId,
            clientInfoName,
            clientInfoEmail,
            clientInfoPhone,
            clientInfoAddress,
            tax: tax || 0,
            status: status || 'created',
            validUntil,
            notes,
            createdBy: req.user?.id // From auth middleware
        }, { 
            transaction 
        });

        // Create proposal items if provided
        if (items.length > 0) {
            const proposalItems = items.map(item => ({
                ...item,
                proposalId: proposal.id,
                subtotal: (item.quantity || 1) * (item.unitPrice || 0) + (item.laborCost || 0)
            }));

            await ProposalItem.bulkCreate(proposalItems, { transaction });
        }

        // Calculate and update totals
        const subtotal = items.reduce((sum, item) => {
            return sum + ((item.quantity || 1) * (item.unitPrice || 0) + (item.laborCost || 0));
        }, 0);
        
        const total = subtotal + (tax || 0);

        await proposal.update({ 
            subtotal, 
            total 
        }, { transaction });

        await transaction.commit();

        // Fetch complete proposal with relations
        const completeProposal = await Proposal.findByPk(proposal.id, {
            include: [
                {
                    model: Client,
                    as: 'client'
                },
                {
                    model: User,
                    as: 'creator'
                },
                {
                    model: ProposalItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        });

        res.status(201).json(completeProposal);
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating proposal:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: error.errors.map(e => e.message) 
            });
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                error: 'Proposal number already exists' 
            });
        }
        
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get proposal by ID with all related data
 */
const getProposalById = async (req, res) => {
    try {
        const { id } = req.params;

        const proposal = await Proposal.findByPk(id, {
            include: [
                {
                    model: Client,
                    as: 'client'
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: ProposalItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        });

        if (!proposal) {
            return res.status(404).json({ 
                error: 'Proposal not found' 
            });
        }

        res.json(proposal);
    } catch (error) {
        console.error('Error getting proposal:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update proposal by ID
 */
const updateProposal = async (req, res) => {
    const transaction = await Proposal.sequelize.transaction();
    
    try {
        const { id } = req.params;
        const {
            clientId,
            clientInfoName,
            clientInfoEmail,
            clientInfoPhone,
            clientInfoAddress,
            tax,
            status,
            validUntil,
            notes,
            items
        } = req.body;

        const proposal = await Proposal.findByPk(id, { transaction });

        if (!proposal) {
            await transaction.rollback();
            return res.status(404).json({ 
                error: 'Proposal not found' 
            });
        }

        // Update proposal basic info
        await proposal.update({
            clientId,
            clientInfoName,
            clientInfoEmail,
            clientInfoPhone,
            clientInfoAddress,
            tax,
            status,
            validUntil,
            notes
        }, { transaction });

        // Update items if provided
        if (items && Array.isArray(items)) {
            // Delete existing items
            await ProposalItem.destroy({
                where: { proposalId: id },
                transaction
            });

            // Create new items
            if (items.length > 0) {
                const proposalItems = items.map(item => ({
                    ...item,
                    proposalId: id,
                    subtotal: (item.quantity || 1) * (item.unitPrice || 0) + (item.laborCost || 0)
                }));

                await ProposalItem.bulkCreate(proposalItems, { transaction });
            }

            // Recalculate totals
            const subtotal = items.reduce((sum, item) => {
                return sum + ((item.quantity || 1) * (item.unitPrice || 0) + (item.laborCost || 0));
            }, 0);
            
            const total = subtotal + (tax || 0);

            await proposal.update({ 
                subtotal, 
                total 
            }, { transaction });
        }

        await transaction.commit();

        // Fetch updated proposal with relations
        const updatedProposal = await Proposal.findByPk(id, {
            include: [
                {
                    model: Client,
                    as: 'client'
                },
                {
                    model: User,
                    as: 'creator'
                },
                {
                    model: ProposalItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        });

        res.json(updatedProposal);
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating proposal:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: error.errors.map(e => e.message) 
            });
        }
        
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete proposal by ID
 */
const deleteProposal = async (req, res) => {
    const transaction = await Proposal.sequelize.transaction();
    
    try {
        const { id } = req.params;

        const proposal = await Proposal.findByPk(id, { transaction });

        if (!proposal) {
            await transaction.rollback();
            return res.status(404).json({ 
                error: 'Proposal not found' 
            });
        }

        // Delete proposal (items will be deleted by CASCADE)
        await proposal.destroy({ transaction });

        await transaction.commit();
        
        res.status(204).send();
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting proposal:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get proposals by status
 */
const getProposalsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        const validStatuses = ['created', 'sent', 'archived', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ') 
            });
        }

        const proposals = await Proposal.findAll({
            where: { status },
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ proposals, count: proposals.length });
    } catch (error) {
        console.error('Error getting proposals by status:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update proposal status
 */
const updateProposalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['created', 'sent', 'archived', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ') 
            });
        }

        const proposal = await Proposal.findByPk(id);

        if (!proposal) {
            return res.status(404).json({ 
                error: 'Proposal not found' 
            });
        }

        await proposal.update({ status });

        res.json({ 
            message: 'Proposal status updated successfully',
            proposal: {
                id: proposal.id,
                proposalNumber: proposal.proposalNumber,
                status: proposal.status
            }
        });
    } catch (error) {
        console.error('Error updating proposal status:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllProposals,
    createProposal,
    getProposalById,
    updateProposal,
    deleteProposal,
    getProposalsByStatus,
    updateProposalStatus
};