const request = require('supertest');
// Make sure your app is exported from server.js
const app = require('../server');
const { Client, Contact, Job } = require('../models'); // Mock the models

// Mock the models
jest.mock('../models', () => ({
    Client: {
        create: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
    },
    Contact: {
        destroy: jest.fn(),
        bulkCreate: jest.fn(),
    },
    Job: {
        create: jest.fn(),
    },
}));

// Mock authentication middlewares
jest.mock('../middleware/auth', () => (req, res, next) => next()); // Simulate successful authentication
jest.mock('../middleware/adminAuth', () => (req, res, next) => next()); // Simulate successful admin authentication
// const app = require('../server'); // Make sure your app is exported from server.js
// const { Client, Contact, Job } = require('../models'); // Mock the models

// Mockear los modelos
jest.mock('../models', () => ({
  Client: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
  Contact: {
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  },
  Job: {
    create: jest.fn(),
  },
}));

// Mock authentication middlewares
jest.mock('../middleware/auth', () => (req, res, next) => next()); // Simulate successful authentication
jest.mock('../middleware/adminAuth', () => (req, res, next) => next()); // Simulate successful admin authentication

describe('Client Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

  it('should create a client with contacts', async () => {
    const mockClient = { id: 1, companyName: 'Test Company', contacts: [] };
    Client.create.mockResolvedValue(mockClient);

    const res = await request(app)
      .post('/api/clients')
      .send({ companyName: 'Test Company', address: '123 Main St', contacts: [] });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockClient);
    expect(Client.create).toHaveBeenCalledWith(
      { companyName: 'Test Company', address: '123 Main St', contacts: [] },
      { include: [{ model: Contact, as: 'contacts' }] }
    );
  });

  it('should get all clients', async () => {
    const mockClients = [
      { id: 1, companyName: 'Client 1', contacts: [], jobs: [] },
      { id: 2, companyName: 'Client 2', contacts: [], jobs: [] },
    ];
    Client.findAll.mockResolvedValue(mockClients);

    const res = await request(app).get('/api/clients');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockClients);
    expect(Client.findAll).toHaveBeenCalledWith({
      include: [
        { model: Contact, as: 'contacts' },
        { model: Job, as: 'jobs' },
      ],
    });
  });

  it('should get a client by ID', async () => {
    const mockClient = { id: 1, companyName: 'Test Client', contacts: [], jobs: [] };
    Client.findByPk.mockResolvedValue(mockClient);

    const res = await request(app).get('/api/clients/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockClient);
    expect(Client.findByPk).toHaveBeenCalledWith('1', {
      include: [
        { model: Contact, as: 'contacts' },
        { model: Job, as: 'jobs' },
      ],
    });
  });

  it('should return 404 if client not found by ID', async () => {
    Client.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/clients/999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Client no found' });
    expect(Client.findByPk).toHaveBeenCalledWith('999', {
      include: [
        { model: Contact, as: 'contacts' },
        { model: Job, as: 'jobs' },
      ],
    });
  });

  it('should update a client', async () => {
    const mockClient = { id: 1, companyName: 'Old Name', update: jest.fn() };
    const mockUpdatedClient = { id: 1, companyName: 'New Name', contacts: [] };
    Client.findByPk.mockResolvedValueOnce(mockClient).mockResolvedValueOnce(mockUpdatedClient);

    const res = await request(app)
      .put('/api/clients/1')
      .send({ companyName: 'New Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockUpdatedClient);
    expect(mockClient.update).toHaveBeenCalledWith({
      companyName: 'New Name',
      address: undefined,
      city: undefined,
      state: undefined,
      zip: undefined,
    });
  });

  it('should return 404 if client to update is not found', async () => {
    Client.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/clients/999')
      .send({ companyName: 'New Name' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Client no found' });
  });

  it('should add a job to a client', async () => {
    const mockClient = { id: 1, companyName: 'Test Client' };
    const mockJob = { id: 1, description: 'Test Job', clientId: 1 };
    Client.findByPk.mockResolvedValue(mockClient);
    Job.create.mockResolvedValue(mockJob);

    const res = await request(app)
      .post('/api/clients/1/jobs')
      .send({ description: 'Test Job' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockJob);
    expect(Client.findByPk).toHaveBeenCalledWith('1');
    expect(Job.create).toHaveBeenCalledWith({
      date: expect.any(Date),
      description: 'Test Job',
      equipmentInstalled: [],
      images: [],
      notes: '',
      invoiceId: null,
      clientId: 1,
    });
  });

  it('should return 404 if client not found for adding job', async () => {
    Client.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/clients/999/jobs')
      .send({ description: 'Test Job' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Client no found' });
  });
});