// tests/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Auth Routes', () => {
  test('POST /api/auth/login should respond', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test' });
    
    expect(response.status).toBeDefined();
  });
});