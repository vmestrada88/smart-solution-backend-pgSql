const request = require('supertest');
const app = require('../server'); // Asegúrate de que tu app esté exportada desde server.js
const Product = require('../models/Product'); // Mockear el modelo Product

// Mockear el modelo Product
jest.mock('../models/Product');

// Mockear los middlewares de autenticación
jest.mock('../middleware/auth', () => (req, res, next) => next()); // Simula autenticación exitosa
jest.mock('../middleware/adminAuth', () => (req, res, next) => next()); // Simula autenticación de admin exitosa

describe('Product Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpia los mocks antes de cada prueba
  });

  it('should create a product', async () => {
    const mockProduct = { id: 1, name: 'Test Product', price: 100 };
    Product.create.mockResolvedValue(mockProduct);

    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test Product', price: 100 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(mockProduct);
    expect(Product.create).toHaveBeenCalledWith({ name: 'Test Product', price: 100 });
  });

  it('should get all products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 },
    ];
    Product.findAndCountAll.mockResolvedValue({ rows: mockProducts, count: 2 });

    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockProducts);
    expect(Product.findAndCountAll).toHaveBeenCalledWith({
      limit: 100,
      offset: 0,
      order: [['id', 'ASC']],
    });
  });

  it('should get a product by ID', async () => {
    const mockProduct = { id: 1, name: 'Test Product', price: 100 };
    Product.findByPk.mockResolvedValue(mockProduct);

    const res = await request(app).get('/api/products/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockProduct);
    expect(Product.findByPk).toHaveBeenCalledWith('1');
  });

  it('should return 404 if product not found by ID', async () => {
    Product.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/products/999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Product not found' });
    expect(Product.findByPk).toHaveBeenCalledWith('999');
  });

  it('should update a product', async () => {
    const mockUpdatedProduct = { id: 1, name: 'Updated Product', price: 150 };
    Product.update.mockResolvedValue([1]);
    Product.findByPk.mockResolvedValue(mockUpdatedProduct);

    const res = await request(app)
      .put('/api/products/1')
      .send({ name: 'Updated Product', price: 150 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockUpdatedProduct);
    expect(Product.update).toHaveBeenCalledWith(
      { name: 'Updated Product', price: 150 },
      { where: { id: '1' } }
    );
    expect(Product.findByPk).toHaveBeenCalledWith('1');
  });

  it('should return 404 if product to update is not found', async () => {
    Product.update.mockResolvedValue([0]);

    const res = await request(app)
      .put('/api/products/999')
      .send({ name: 'Nonexistent Product', price: 150 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Product not found' });
    expect(Product.update).toHaveBeenCalledWith(
      { name: 'Nonexistent Product', price: 150 },
      { where: { id: '999' } }
    );
  });

  it('should delete a product', async () => {
    Product.destroy.mockResolvedValue(1);

    const res = await request(app).delete('/api/products/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Product deleted' });
    expect(Product.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should return 404 if product to delete is not found', async () => {
    Product.destroy.mockResolvedValue(0);

    const res = await request(app).delete('/api/products/999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Product not found' });
    expect(Product.destroy).toHaveBeenCalledWith({ where: { id: '999' } });
  });
});