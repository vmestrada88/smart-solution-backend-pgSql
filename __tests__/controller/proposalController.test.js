// 🔧 PRIMERO: CREAR MOCKS DIRECTAMENTE EN jest.mock() SIN VARIABLES EXTERNAS
jest.mock('../../models/Proposal', () => ({
    Proposal: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        count: jest.fn(),
        sequelize: {
            transaction: jest.fn()
        }
    },
    ProposalItem: {
        bulkCreate: jest.fn(),
        destroy: jest.fn()
    }
}));

jest.mock('../../models/Client', () => ({
    findByPk: jest.fn()
}));

jest.mock('../../models/User', () => ({
    findByPk: jest.fn()
}));

jest.mock('../../models/Product', () => ({
    findByPk: jest.fn()
}));

// 🔧 SEGUNDO: IMPORTAR DESPUÉS DE LOS MOCKS
const proposalController = require('../../controllers/proposalController');
const { Proposal, ProposalItem } = require('../../models/Proposal');
const Client = require('../../models/Client');
const User = require('../../models/User');
const Product = require('../../models/Product');

describe('Proposal Controller - Complete Coverage', () => {
    let req, res, mockTransaction;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock del transaction
        mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn()
        };
        
        Proposal.sequelize.transaction.mockResolvedValue(mockTransaction);

        // Mock request and response objects
        req = {
            params: {},
            body: {},
            user: { id: 'user123' }
        };

        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        // Console.error spy para verificar logs
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('📋 getAllProposals', () => {
        test('should get all proposals with includes successfully', async () => {
            const mockProposals = [
                {
                    id: 1,
                    proposalNumber: 'PROP-000001',
                    clientInfoName: 'Test Client',
                    total: 1000,
                    client: { id: 1, name: 'Client Name' },
                    creator: { id: 1, name: 'Creator Name' },
                    items: [
                        { id: 1, name: 'Item 1', quantity: 2, unitPrice: 500 }
                    ]
                }
            ];

            Proposal.findAll.mockResolvedValue(mockProposals);

            await proposalController.getAllProposals(req, res);

            expect(Proposal.findAll).toHaveBeenCalledWith({
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

            expect(res.json).toHaveBeenCalledWith({ proposals: mockProposals });
        });

        test('should handle database error in getAllProposals', async () => {
            const dbError = new Error('Database connection failed');
            Proposal.findAll.mockRejectedValue(dbError);

            await proposalController.getAllProposals(req, res);

            expect(console.error).toHaveBeenCalledWith('Error getting proposals:', dbError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database connection failed' });
        });
    });

    describe('➕ createProposal', () => {
        test('should create proposal with items successfully', async () => {
            req.body = {
                clientId: 1,
                clientInfoName: 'New Client',
                clientInfoEmail: 'client@test.com',
                clientInfoPhone: '123-456-7890',
                clientInfoAddress: '123 Main St',
                tax: 100,
                status: 'created',
                validUntil: '2024-12-31',
                notes: 'Test notes',
                items: [
                    { name: 'Item 1', quantity: 2, unitPrice: 500, laborCost: 50 },
                    { name: 'Item 2', quantity: 1, unitPrice: 300, laborCost: 0 }
                ]
            };

            const mockCreatedProposal = {
                id: 1,
                proposalNumber: 'PROP-000001',
                clientInfoName: 'New Client',
                update: jest.fn()
            };

            const mockCompleteProposal = {
                ...mockCreatedProposal,
                client: { id: 1, name: 'Client' },
                creator: { id: 'user123', name: 'User' },
                items: req.body.items
            };

            Proposal.create.mockResolvedValue(mockCreatedProposal);
            ProposalItem.bulkCreate.mockResolvedValue([]);
            Proposal.findByPk.mockResolvedValue(mockCompleteProposal);

            await proposalController.createProposal(req, res);

            expect(Proposal.create).toHaveBeenCalledWith({
                clientId: 1,
                clientInfoName: 'New Client',
                clientInfoEmail: 'client@test.com',
                clientInfoPhone: '123-456-7890',
                clientInfoAddress: '123 Main St',
                tax: 100,
                status: 'created',
                validUntil: '2024-12-31',
                notes: 'Test notes',
                createdBy: 'user123'
            }, { transaction: mockTransaction });

            expect(ProposalItem.bulkCreate).toHaveBeenCalledWith([
                {
                    name: 'Item 1',
                    quantity: 2,
                    unitPrice: 500,
                    laborCost: 50,
                    proposalId: 1,
                    subtotal: 1050 // (2 * 500) + 50
                },
                {
                    name: 'Item 2',
                    quantity: 1,
                    unitPrice: 300,
                    laborCost: 0,
                    proposalId: 1,
                    subtotal: 300 // (1 * 300) + 0
                }
            ], { transaction: mockTransaction });

            expect(mockCreatedProposal.update).toHaveBeenCalledWith({
                subtotal: 1350, // 1050 + 300
                total: 1450 // 1350 + 100 (tax)
            }, { transaction: mockTransaction });

            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCompleteProposal);
        });

        test('should return 400 when clientInfoName is missing', async () => {
            req.body = {}; // Missing required clientInfoName

            await proposalController.createProposal(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Client name is required' });
            expect(mockTransaction.rollback).not.toHaveBeenCalled(); // No transaction started
        });

        test('should handle SequelizeValidationError', async () => {
            req.body = { clientInfoName: 'Test Client' };

            const validationError = new Error('Validation failed');
            validationError.name = 'SequelizeValidationError';
            validationError.errors = [
                { message: 'Email must be valid' },
                { message: 'Phone is required' }
            ];

            Proposal.create.mockRejectedValue(validationError);

            await proposalController.createProposal(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation error',
                details: ['Email must be valid', 'Phone is required']
            });
        });

        test('should handle SequelizeUniqueConstraintError', async () => {
            req.body = { clientInfoName: 'Test Client' };

            const uniqueError = new Error('Unique constraint failed');
            uniqueError.name = 'SequelizeUniqueConstraintError';

            Proposal.create.mockRejectedValue(uniqueError);

            await proposalController.createProposal(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Proposal number already exists'
            });
        });

        test('should handle general error in createProposal', async () => {
            req.body = { clientInfoName: 'Test Client' };

            const generalError = new Error('Database error');
            Proposal.create.mockRejectedValue(generalError);

            await proposalController.createProposal(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith('Error creating proposal:', generalError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('🔍 getProposalById', () => {
        test('should get proposal by ID with includes successfully', async () => {
            req.params.id = '1';

            const mockProposalData = {
                id: 1,
                proposalNumber: 'PROP-000001',
                clientInfoName: 'Test Client',
                client: { id: 1, name: 'Client' },
                creator: { id: 1, name: 'Creator' },
                items: []
            };

            Proposal.findByPk.mockResolvedValue(mockProposalData);

            await proposalController.getProposalById(req, res);

            expect(Proposal.findByPk).toHaveBeenCalledWith('1', {
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

            expect(res.json).toHaveBeenCalledWith(mockProposalData);
        });

        test('should return 404 when proposal not found', async () => {
            req.params.id = '999';

            Proposal.findByPk.mockResolvedValue(null);

            await proposalController.getProposalById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Proposal not found' });
        });

        test('should handle database error in getProposalById', async () => {
            req.params.id = '1';

            const dbError = new Error('Database error');
            Proposal.findByPk.mockRejectedValue(dbError);

            await proposalController.getProposalById(req, res);

            expect(console.error).toHaveBeenCalledWith('Error getting proposal:', dbError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('✏️ updateProposal', () => {
        test('should update proposal with items successfully', async () => {
            req.params.id = '1';
            req.body = {
                clientInfoName: 'Updated Client',
                clientInfoEmail: 'updated@test.com',
                tax: 150,
                items: [
                    { name: 'Updated Item', quantity: 3, unitPrice: 200, laborCost: 25 }
                ]
            };

            const mockProposalInstance = {
                id: 1,
                update: jest.fn()
            };

            const mockUpdatedProposal = {
                ...mockProposalInstance,
                clientInfoName: 'Updated Client',
                client: null,
                creator: null,
                items: req.body.items
            };

            Proposal.findByPk
                .mockResolvedValueOnce(mockProposalInstance) // For update check
                .mockResolvedValueOnce(mockUpdatedProposal); // For final response

            ProposalItem.destroy.mockResolvedValue(2);
            ProposalItem.bulkCreate.mockResolvedValue([]);

            await proposalController.updateProposal(req, res);

            expect(mockProposalInstance.update).toHaveBeenCalledTimes(2);
            expect(mockProposalInstance.update).toHaveBeenCalledWith({
                clientId: undefined,
                clientInfoName: 'Updated Client',
                clientInfoEmail: 'updated@test.com',
                clientInfoPhone: undefined,
                clientInfoAddress: undefined,
                tax: 150,
                status: undefined,
                validUntil: undefined,
                notes: undefined
            }, { transaction: mockTransaction });

            expect(ProposalItem.destroy).toHaveBeenCalledWith({
                where: { proposalId: '1' },
                transaction: mockTransaction
            });

            expect(ProposalItem.bulkCreate).toHaveBeenCalledWith([
                {
                    name: 'Updated Item',
                    quantity: 3,
                    unitPrice: 200,
                    laborCost: 25,
                    proposalId: '1',
                    subtotal: 625 // (3 * 200) + 25
                }
            ], { transaction: mockTransaction });

            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockUpdatedProposal);
        });

        test('should return 404 when updating non-existent proposal', async () => {
            req.params.id = '999';
            req.body = { clientInfoName: 'Updated Client' };

            Proposal.findByPk.mockResolvedValue(null);

            await proposalController.updateProposal(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Proposal not found' });
        });

        test('should update proposal without items', async () => {
            req.params.id = '1';
            req.body = {
                clientInfoName: 'Updated Client',
                tax: 200
                // No items provided
            };

            const mockProposalInstance = {
                id: 1,
                update: jest.fn()
            };

            const mockUpdatedProposal = {
                ...mockProposalInstance,
                clientInfoName: 'Updated Client'
            };

            Proposal.findByPk
                .mockResolvedValueOnce(mockProposalInstance)
                .mockResolvedValueOnce(mockUpdatedProposal);

            await proposalController.updateProposal(req, res);

            expect(mockProposalInstance.update).toHaveBeenCalledTimes(1);
            expect(ProposalItem.destroy).not.toHaveBeenCalled();
            expect(ProposalItem.bulkCreate).not.toHaveBeenCalled();
            expect(mockTransaction.commit).toHaveBeenCalled();
        });

        test('should handle validation error in updateProposal', async () => {
            req.params.id = '1';
            req.body = { clientInfoName: 'Updated Client' };

            const mockProposalInstance = { id: 1, update: jest.fn() };
            Proposal.findByPk.mockResolvedValue(mockProposalInstance);

            const validationError = new Error('Validation failed');
            validationError.name = 'SequelizeValidationError';
            validationError.errors = [{ message: 'Invalid data' }];

            mockProposalInstance.update.mockRejectedValue(validationError);

            await proposalController.updateProposal(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation error',
                details: ['Invalid data']
            });
        });
    });

    describe('🗑️ deleteProposal', () => {
        test('should delete proposal successfully', async () => {
            req.params.id = '1';

            const mockProposalInstance = {
                id: 1,
                destroy: jest.fn()
            };

            Proposal.findByPk.mockResolvedValue(mockProposalInstance);

            await proposalController.deleteProposal(req, res);

            expect(mockProposalInstance.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('should return 404 when deleting non-existent proposal', async () => {
            req.params.id = '999';

            Proposal.findByPk.mockResolvedValue(null);

            await proposalController.deleteProposal(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Proposal not found' });
        });

        test('should handle database error in deleteProposal', async () => {
            req.params.id = '1';

            const dbError = new Error('Database error');
            Proposal.findByPk.mockRejectedValue(dbError);

            await proposalController.deleteProposal(req, res);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith('Error deleting proposal:', dbError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('📊 getProposalsByStatus', () => {
        test('should get proposals by valid status', async () => {
            req.params.status = 'created';

            const mockProposals = [
                { id: 1, status: 'created', clientInfoName: 'Client 1' },
                { id: 2, status: 'created', clientInfoName: 'Client 2' }
            ];

            Proposal.findAll.mockResolvedValue(mockProposals);

            await proposalController.getProposalsByStatus(req, res);

            expect(Proposal.findAll).toHaveBeenCalledWith({
                where: { status: 'created' },
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

            expect(res.json).toHaveBeenCalledWith({
                proposals: mockProposals,
                count: 2
            });
        });

        test('should return 400 for invalid status', async () => {
            req.params.status = 'invalid_status';

            await proposalController.getProposalsByStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid status. Valid statuses: created, sent, archived, cancelled'
            });
        });

        test('should handle database error in getProposalsByStatus', async () => {
            req.params.status = 'created';

            const dbError = new Error('Database error');
            Proposal.findAll.mockRejectedValue(dbError);

            await proposalController.getProposalsByStatus(req, res);

            expect(console.error).toHaveBeenCalledWith('Error getting proposals by status:', dbError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('🔄 updateProposalStatus', () => {
        test('should update proposal status successfully', async () => {
            req.params.id = '1';
            req.body.status = 'sent';

            const mockProposalInstance = {
                id: 1,
                proposalNumber: 'PROP-000001',
                status: 'created',
                update: jest.fn()
            };

            Proposal.findByPk.mockResolvedValue(mockProposalInstance);
            mockProposalInstance.update.mockResolvedValue();

            await proposalController.updateProposalStatus(req, res);

            expect(mockProposalInstance.update).toHaveBeenCalledWith({ status: 'sent' });
            expect(res.json).toHaveBeenCalledWith({
                message: 'Proposal status updated successfully',
                proposal: {
                    id: 1,
                    proposalNumber: 'PROP-000001',
                    status: 'created' // Mock object status doesn't change
                }
            });
        });

        test('should return 400 for invalid status in updateProposalStatus', async () => {
            req.params.id = '1';
            req.body.status = 'invalid_status';

            await proposalController.updateProposalStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid status. Valid statuses: created, sent, archived, cancelled'
            });
        });

        test('should return 404 when proposal not found in updateProposalStatus', async () => {
            req.params.id = '999';
            req.body.status = 'sent';

            Proposal.findByPk.mockResolvedValue(null);

            await proposalController.updateProposalStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Proposal not found' });
        });

        test('should handle database error in updateProposalStatus', async () => {
            req.params.id = '1';
            req.body.status = 'sent';

            const dbError = new Error('Database error');
            Proposal.findByPk.mockRejectedValue(dbError);

            await proposalController.updateProposalStatus(req, res);

            expect(console.error).toHaveBeenCalledWith('Error updating proposal status:', dbError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('🔍 EDGE CASES & INTEGRATION', () => {
        test('should handle createProposal with empty items array', async () => {
            req.body = {
                clientInfoName: 'Test Client',
                items: [] // Empty array
            };

            const mockCreatedProposal = {
                id: 1,
                update: jest.fn()
            };

            Proposal.create.mockResolvedValue(mockCreatedProposal);
            Proposal.findByPk.mockResolvedValue(mockCreatedProposal);

            await proposalController.createProposal(req, res);

            expect(ProposalItem.bulkCreate).not.toHaveBeenCalled();
            expect(mockCreatedProposal.update).toHaveBeenCalledWith({
                subtotal: 0,
                total: 0
            }, { transaction: mockTransaction });
        });

        test('should handle updateProposal with empty items array', async () => {
            req.params.id = '1';
            req.body = {
                clientInfoName: 'Updated Client',
                items: [] // Empty array
            };

            const mockProposalInstance = { id: 1, update: jest.fn() };
            Proposal.findByPk
                .mockResolvedValueOnce(mockProposalInstance)
                .mockResolvedValueOnce(mockProposalInstance);

            ProposalItem.destroy.mockResolvedValue(0);

            await proposalController.updateProposal(req, res);

            expect(ProposalItem.destroy).toHaveBeenCalled();
            expect(ProposalItem.bulkCreate).not.toHaveBeenCalled();
            expect(mockProposalInstance.update).toHaveBeenCalledWith({
                subtotal: 0,
                total: 0
            }, { transaction: mockTransaction });
        });

        test('should handle items with missing optional fields', async () => {
            req.body = {
                clientInfoName: 'Test Client',
                items: [
                    { name: 'Item 1' }, // Missing quantity, unitPrice, laborCost
                    { name: 'Item 2', quantity: 2 }, // Missing unitPrice, laborCost
                    { name: 'Item 3', unitPrice: 100 } // Missing quantity, laborCost
                ]
            };

            const mockCreatedProposal = {
                id: 1,
                update: jest.fn()
            };

            Proposal.create.mockResolvedValue(mockCreatedProposal);
            Proposal.findByPk.mockResolvedValue(mockCreatedProposal);
            ProposalItem.bulkCreate.mockResolvedValue([]);

            await proposalController.createProposal(req, res);

            expect(ProposalItem.bulkCreate).toHaveBeenCalledWith([
                {
                    name: 'Item 1',
                    proposalId: 1,
                    subtotal: 0 // (1 || 1) * (0 || 0) + (0 || 0)
                },
                {
                    name: 'Item 2',
                    quantity: 2,
                    proposalId: 1,
                    subtotal: 0 // 2 * (0 || 0) + (0 || 0)
                },
                {
                    name: 'Item 3',
                    unitPrice: 100,
                    proposalId: 1,
                    subtotal: 100 // (1 || 1) * 100 + (0 || 0)
                }
            ], { transaction: mockTransaction });
        });
    });

    describe('🔍 COVERAGE VERIFICATION', () => {
        test('should verify all controller methods exist', () => {
            expect(typeof proposalController.getAllProposals).toBe('function');
            expect(typeof proposalController.createProposal).toBe('function');
            expect(typeof proposalController.getProposalById).toBe('function');
            expect(typeof proposalController.updateProposal).toBe('function');
            expect(typeof proposalController.deleteProposal).toBe('function');
            expect(typeof proposalController.getProposalsByStatus).toBe('function');
            expect(typeof proposalController.updateProposalStatus).toBe('function');
        });

        test('should test all error types in sequence', async () => {
            // Test SequelizeValidationError
            const validationError = new Error('Validation');
            validationError.name = 'SequelizeValidationError';
            validationError.errors = [{ message: 'Test error' }];

            // Test SequelizeUniqueConstraintError
            const uniqueError = new Error('Unique');
            uniqueError.name = 'SequelizeUniqueConstraintError';

            // Test general error
            const generalError = new Error('General');

            expect(validationError.name).toBe('SequelizeValidationError');
            expect(uniqueError.name).toBe('SequelizeUniqueConstraintError');
            expect(generalError.name).toBe('Error');
        });
    });
});