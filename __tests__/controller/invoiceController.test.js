const request = require('supertest');
const app = require('../../server'); // Ajusta la ruta si es diferente
const { Invoice } = require('../../models');

// Mock middleware to bypass authentication
jest.mock('../../middleware/auth', () => jest.fn((req, res, next) => next()));
jest.mock('../../middleware/adminAuth', () => jest.fn((req, res, next) => next()));

jest.mock('../../models', () => ({
  Invoice: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('Invoice Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an invoice', async () => {
    const mockInvoice = { id: 1, clientId: 1, date: '2025-09-15', total: 100, status: 'pending', createdAt: '2025-09-13T10:28:19.874Z' };
    Invoice.create.mockResolvedValue(mockInvoice);

    const res = await request(app)
      .post('/api/invoices')
      .send({ clientId: 1, date: '2025-09-15', total: 100, status: 'pending' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockInvoice);
    expect(Invoice.create).toHaveBeenCalledWith({ clientId: 1, date: '2025-09-15', total: 100, status: 'pending' });
  });

  it('should get all invoices', async () => {
    const mockInvoices = [
      { id: 1, clientId: 1, date: '2025-09-15', total: 100, status: 'pending', createdAt: '2025-09-13T10:28:19.874Z' },
      { id: 2, clientId: 2, date: '2025-09-16', total: 200, status: 'paid', createdAt: '2025-09-13T10:28:19.874Z' },
    ];
    Invoice.findAll.mockResolvedValue(mockInvoices);

    const res = await request(app).get('/api/invoices');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockInvoices);
    expect(Invoice.findAll).toHaveBeenCalled();
  });

  it('should get an invoice by ID', async () => {
    const mockInvoice = { id: 1, clientId: 1, date: '2025-09-15', total: 100, status: 'pending', createdAt: '2025-09-13T10:28:19.874Z' };
    Invoice.findByPk.mockResolvedValue(mockInvoice);

    const res = await request(app).get('/api/invoices/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockInvoice);
    expect(Invoice.findByPk).toHaveBeenCalledWith('1');
  });

  it('should return 404 if invoice not found by ID', async () => {
    Invoice.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/invoices/999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Invoice not found' });
  });

  it('should update an invoice', async () => {
    const mockInvoice = { id: 1, clientId: 1, date: '2025-09-15', total: 150, status: 'paid', createdAt: '2025-09-13T10:28:19.874Z' };
    Invoice.update.mockResolvedValue([1]);
    Invoice.findByPk.mockResolvedValue(mockInvoice);

    const res = await request(app)
      .put('/api/invoices/1')
      .send({ clientId: 1, date: '2025-09-15', total: 150, status: 'paid' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockInvoice);
    expect(Invoice.update).toHaveBeenCalledWith({ clientId: 1, date: '2025-09-15', total: 150, status: 'paid' }, { where: { id: '1' } });
  });

  it('should return 404 if invoice to update is not found', async () => {
    Invoice.update.mockResolvedValue([0]);

    const res = await request(app)
      .put('/api/invoices/999')
      .send({ clientId: 1, date: '2025-09-15', total: 150, status: 'paid' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Invoice not found' });
    expect(Invoice.update).toHaveBeenCalledWith({ clientId: 1, date: '2025-09-15', total: 150, status: 'paid' }, { where: { id: '999' } });
  });

  it('should delete an invoice', async () => {
    Invoice.destroy.mockResolvedValue(1);

    const res = await request(app).delete('/api/invoices/1');

    expect(res.statusCode).toBe(204);
    expect(Invoice.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should return 404 if invoice to delete is not found', async () => {
    Invoice.destroy.mockResolvedValue(0);

    const res = await request(app).delete('/api/invoices/999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Invoice not found' });
    expect(Invoice.destroy).toHaveBeenCalledWith({ where: { id: '999' } });
  });
});