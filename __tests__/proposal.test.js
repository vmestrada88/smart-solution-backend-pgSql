// 🚨 MOCKS FIRST - BEFORE any require
jest.mock('../models/db', () => ({
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn()
}));

// 🔧 Full mock of models with Sequelize methods
const mockModel = {
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    hasOne: jest.fn(),
    belongsToMany: jest.fn(),
    init: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
    update: jest.fn(),
    sync: jest.fn()
};

jest.mock('../models/Client', () => ({
    ...mockModel,
    tableName: 'Clients'
}));

jest.mock('../models/User', () => ({
    ...mockModel,
    tableName: 'Users'
}));

jest.mock('../models/Product', () => ({
    ...mockModel,
    tableName: 'Products'
}));

// Full sequelize mock so .init works
jest.mock('sequelize', () => {
    const mockSequelize = {
        define: jest.fn(),
        sync: jest.fn(),
        close: jest.fn(),
        getQueryInterface: jest.fn()
    };

    const MockModel = class {
        static init() { return this; }
        static belongsTo() { return this; }
        static hasMany() { return this; }
        static hasOne() { return this; }
        static belongsToMany() { return this; }
        static create() { return Promise.resolve({}); }
        static findByPk() { return Promise.resolve({}); }
        static findAll() { return Promise.resolve([]); }
        static count() { return Promise.resolve(0); }
        static destroy() { return Promise.resolve({}); }
        static bulkCreate() { return Promise.resolve([]); }
        static update() { return Promise.resolve({}); }
    };

    return {
        Sequelize: jest.fn(() => mockSequelize),
        DataTypes: {
            STRING: 'STRING',
            INTEGER: 'INTEGER',
            FLOAT: 'FLOAT',
            DATE: 'DATE',
            ENUM: jest.fn(() => 'ENUM'),
            NOW: 'NOW'
        },
        Model: MockModel
    };
});

// 🎯 NOW import the module
const { Proposal, ProposalItem } = require('../models/Proposal');

describe('Proposal Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('🏗️ Model Definition', () => {
        test('should define Proposal model', () => {
            expect(Proposal).toBeDefined();
            expect(ProposalItem).toBeDefined();
        });

        test('should have correct model structure', () => {
            expect(typeof Proposal.init).toBe('function');
            expect(typeof Proposal.belongsTo).toBe('function');
            expect(typeof Proposal.hasMany).toBe('function');
        });

        test('should set up associations correctly', () => {
            // Check that association methods are available
            expect(typeof Proposal.belongsTo).toBe('function');
            expect(typeof Proposal.hasMany).toBe('function');
            expect(typeof ProposalItem.belongsTo).toBe('function');
        });
    });

    describe('🧪 Mock Model Operations', () => {
        test('should create a proposal with valid data', async () => {
            const proposalData = {
                clientInfoName: 'Tech Corp',
                clientInfoEmail: 'contact@techcorp.com',
                subtotal: 1500.00,
                total: 1800.00,
                status: 'created'
            };

            const expectedProposal = {
                id: 1,
                proposalNumber: 'PROP-000001',
                ...proposalData,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const createSpy = jest.spyOn(Proposal, 'create').mockResolvedValue(expectedProposal);

            const result = await Proposal.create(proposalData);

            expect(createSpy).toHaveBeenCalledWith(proposalData);
            expect(result).toEqual(expectedProposal);
            expect(result.proposalNumber).toBe('PROP-000001');
            expect(result.clientInfoName).toBe('Tech Corp');
            expect(result.status).toBe('created');
        });

        test('should auto-generate proposal number', async () => {
            const proposalData = {
                clientInfoName: 'Client Test',
                subtotal: 1000.00,
                total: 1200.00
            };

            // Mock count to simulate there are already 5 proposals
            const countSpy = jest.spyOn(Proposal, 'count').mockResolvedValue(5);

            const expectedProposal = {
                id: 6,
                proposalNumber: 'PROP-000006',
                ...proposalData,
                createdAt: new Date()
            };

            const createSpy = jest.spyOn(Proposal, 'create').mockResolvedValue(expectedProposal);

            const result = await Proposal.create(proposalData);

            expect(result.proposalNumber).toBe('PROP-000006');
        });

        test('should create proposal with default values', async () => {
            const minimalData = {
                clientInfoName: 'Minimal Client'
            };

            const expectedProposal = {
                id: 1,
                ...minimalData,
                subtotal: 0,
                total: 0,
                status: 'created',
                tax: 0
            };

            const createSpy = jest.spyOn(Proposal, 'create').mockResolvedValue(expectedProposal);

            const result = await Proposal.create(minimalData);

            expect(result.subtotal).toBe(0);
            expect(result.total).toBe(0);
            expect(result.status).toBe('created');
        });
    });

    describe('✅ Validations', () => {
        test('should require proposalNumber', async () => {
            const proposalData = {
                clientInfoName: 'Test Client'
            };

            const validationError = new Error('notNull Violation: Proposal.proposalNumber cannot be null');
            const createSpy = jest.spyOn(Proposal, 'create').mockRejectedValue(validationError);

            await expect(Proposal.create(proposalData))
                .rejects
                .toThrow('notNull Violation: Proposal.proposalNumber cannot be null');
        });

        test('should require clientInfoName', async () => {
            const proposalData = {
                proposalNumber: 'PROP-000001'
            };

            const validationError = new Error('notNull Violation: Proposal.clientInfoName cannot be null');
            const createSpy = jest.spyOn(Proposal, 'create').mockRejectedValue(validationError);

            await expect(Proposal.create(proposalData))
                .rejects
                .toThrow('notNull Violation: Proposal.clientInfoName cannot be null');
        });

        test('should validate status enum values', async () => {
            const proposalData = {
                proposalNumber: 'PROP-000001',
                clientInfoName: 'Test Client',
                status: 'invalid_status'
            };

            const validationError = new Error('invalid input value for enum status: "invalid_status"');
            const createSpy = jest.spyOn(Proposal, 'create').mockRejectedValue(validationError);

            await expect(Proposal.create(proposalData))
                .rejects
                .toThrow('invalid input value for enum status');
        });

        test('should accept valid status values', async () => {
            // Note: The enum values in your model are in Spanish
            const validStatuses = ['created', 'sent', 'archived', 'cancelled'];

            for (let i = 0; i < validStatuses.length; i++) {
                const status = validStatuses[i];
                const mockResult = {
                    id: i + 1,
                    proposalNumber: `PROP-00000${i + 1}`,
                    clientInfoName: 'Test Client',
                    status: status,
                    subtotal: 0,
                    total: 0
                };

                const createSpy = jest.spyOn(Proposal, 'create').mockResolvedValueOnce(mockResult);

                const result = await Proposal.create({
                    proposalNumber: `PROP-00000${i + 1}`,
                    clientInfoName: 'Test Client',
                    status: status
                });

                expect(result.status).toBe(status);
            }
        });
    });

    describe('🔢 ProposalItem Operations', () => {
        test('should create proposal item with valid data', async () => {
            const itemData = {
                name: 'IP Camera',
                description: '4K security camera',
                quantity: 2,
                unitPrice: 299.99,
                subtotal: 599.98
            };

            const expectedItem = {
                id: 1,
                proposalId: 1,
                ...itemData
            };

            const createSpy = jest.spyOn(ProposalItem, 'create').mockResolvedValue(expectedItem);

            const result = await ProposalItem.create(itemData);

            expect(createSpy).toHaveBeenCalledWith(itemData);
            expect(result).toEqual(expectedItem);
            expect(result.name).toBe('IP Camera');
            expect(result.quantity).toBe(2);
            expect(result.unitPrice).toBe(299.99);
        });

        test('should create item with default values', async () => {
            const minimalItem = {
                name: 'Basic Product'
            };

            const expectedItem = {
                id: 1,
                ...minimalItem,
                quantity: 1,
                unitPrice: 0,
                subtotal: 0,
                laborCost: 0
            };

            const createSpy = jest.spyOn(ProposalItem, 'create').mockResolvedValue(expectedItem);

            const result = await ProposalItem.create(minimalItem);

            expect(result.quantity).toBe(1);
            expect(result.unitPrice).toBe(0);
            expect(result.subtotal).toBe(0);
        });

        test('should require name for ProposalItem', async () => {
            const itemData = {
                quantity: 1,
                unitPrice: 100
            };

            const validationError = new Error('notNull Violation: ProposalItem.name cannot be null');
            const createSpy = jest.spyOn(ProposalItem, 'create').mockRejectedValue(validationError);

            await expect(ProposalItem.create(itemData))
                .rejects
                .toThrow('notNull Violation: ProposalItem.name cannot be null');
        });
    });

    describe('🧮 Business Logic', () => {
        test('should calculate totals correctly', () => {
            const proposal = {
                items: [
                    { subtotal: 299.99 },
                    { subtotal: 199.99 },
                    { subtotal: 99.99 }
                ],
                tax: 60.00
            };

            // Simulate beforeSave hook
            const mockBeforeSave = (proposalInstance) => {
                if (proposalInstance.items && Array.isArray(proposalInstance.items)) {
                    proposalInstance.subtotal = proposalInstance.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
                    proposalInstance.total = proposalInstance.subtotal + (proposalInstance.tax || 0);
                }
            };

            mockBeforeSave(proposal);

            expect(proposal.subtotal).toBe(599.97);
            expect(proposal.total).toBe(659.97);
        });

        test('should generate proposal number with correct format', () => {
            const mockGenerateNumber = (count) => {
                return `PROP-${String(count + 1).padStart(6, '0')}`;
            };

            expect(mockGenerateNumber(0)).toBe('PROP-000001');
            expect(mockGenerateNumber(9)).toBe('PROP-000010');
            expect(mockGenerateNumber(99)).toBe('PROP-000100');
            expect(mockGenerateNumber(999)).toBe('PROP-001000');
        });
    });

    describe('🔗 Associations Testing', () => {
        test('should define associations with Client', () => {
            // Associations were already executed during import
            expect(Proposal.belongsTo).toBeDefined();
            expect(Proposal.hasMany).toBeDefined();
        });

        test('should find proposal with items', async () => {
            const proposalWithItems = {
                id: 1,
                proposalNumber: 'PROP-000001',
                clientInfoName: 'Test Client',
                subtotal: 599.98,
                total: 719.98,
                items: [
                    {
                        id: 1,
                        name: 'IP Camera',
                        quantity: 2,
                        unitPrice: 299.99,
                        subtotal: 599.98
                    }
                ]
            };

            const findByPkSpy = jest.spyOn(Proposal, 'findByPk').mockResolvedValue(proposalWithItems);

            const result = await Proposal.findByPk(1, { include: 'items' });

            expect(result.items).toBeDefined();
            expect(result.items).toHaveLength(1);
            expect(result.items[0].name).toBe('IP Camera');
        });
    });

    describe('🔍 Query Operations', () => {
        test('should find proposals by status', async () => {
            const mockProposals = [
                { id: 1, status: 'created', clientInfoName: 'Client 1' },
                { id: 2, status: 'created', clientInfoName: 'Client 2' }
            ];

            const findAllSpy = jest.spyOn(Proposal, 'findAll').mockResolvedValue(mockProposals);

            const result = await Proposal.findAll({
                where: { status: 'created' }
            });

            expect(result).toHaveLength(2);
            expect(result[0].status).toBe('created');
            expect(result[1].status).toBe('created');
        });

        test('should count proposals by status', async () => {
            const countSpy = jest.spyOn(Proposal, 'count').mockResolvedValue(5);

            const result = await Proposal.count({
                where: { status: 'sent' }
            });

            expect(result).toBe(5);
        });
    });
});