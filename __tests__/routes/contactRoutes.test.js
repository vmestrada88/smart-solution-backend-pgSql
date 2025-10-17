const request = require('supertest');
const express = require('express');

// 🔧 CREAR MOCK DIRECTAMENTE en jest.mock()
jest.mock('../../models/Contact', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
}));

// Ahora importar las rutas DESPUÉS del mock
const contactRoutes = require('../../routes/contactRoutes');
const Contact = require('../../models/Contact'); // Importar el mock para usar en tests

// Crear app de test
const app = express();
app.use(express.json());
app.use('/api/contacts', contactRoutes);

describe('Contact Routes - Complete CRUD Coverage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('📋 GET /api/contacts - Get all contacts', () => {
        test('should return all contacts successfully (lines 12-17)', async () => {
            // Mock data
            const mockContacts = [
                { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321' }
            ];

            Contact.findAll.mockResolvedValue(mockContacts);

            const response = await request(app)
                .get('/api/contacts')
                .expect(200);

            expect(response.body).toEqual(mockContacts);
            expect(Contact.findAll).toHaveBeenCalledWith();
        });

        test('should handle database error when getting all contacts (lines 18-20)', async () => {
            const dbError = new Error('Database connection failed');
            Contact.findAll.mockRejectedValue(dbError);

            const response = await request(app)
                .get('/api/contacts')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Database connection failed'
            });
            expect(Contact.findAll).toHaveBeenCalledWith();
        });
    });

    describe('🔍 GET /api/contacts/:id - Get contact by ID', () => {
        test('should return a specific contact successfully (lines 23-28)', async () => {
            const mockContactData = { 
                id: 1, 
                name: 'John Doe',
                email: 'john@example.com',
                phone: '123-456-7890',
                address: '123 Main St'
            };

            Contact.findByPk.mockResolvedValue(mockContactData);

            const response = await request(app)
                .get('/api/contacts/1')
                .expect(200);

            expect(response.body).toEqual(mockContactData);
            expect(Contact.findByPk).toHaveBeenCalledWith('1');
        });

        test('should return 404 when contact not found (lines 26-27)', async () => {
            Contact.findByPk.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/contacts/999')
                .expect(404);

            expect(response.body).toEqual({
                error: 'Contact not found'
            });
            expect(Contact.findByPk).toHaveBeenCalledWith('999');
        });

        test('should handle database error when getting contact by ID (lines 29-31)', async () => {
            const dbError = new Error('Database query failed');
            Contact.findByPk.mockRejectedValue(dbError);

            const response = await request(app)
                .get('/api/contacts/1')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Database query failed'
            });
            expect(Contact.findByPk).toHaveBeenCalledWith('1');
        });
    });

    describe('➕ POST /api/contacts - Create new contact', () => {
        test('should create a new contact successfully (lines 34-39)', async () => {
            const newContactData = {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                phone: '555-123-4567',
                address: '456 Oak Ave'
            };

            const createdContact = { id: 1, ...newContactData };
            Contact.create.mockResolvedValue(createdContact);

            const response = await request(app)
                .post('/api/contacts')
                .send(newContactData)
                .expect(201);

            expect(response.body).toEqual(createdContact);
            expect(Contact.create).toHaveBeenCalledWith(newContactData);
        });

        test('should handle validation error when creating contact (lines 40-42)', async () => {
            const invalidContactData = {
                // Missing required fields
                name: '',
                email: 'invalid-email'
            };

            const validationError = new Error('Validation error: email must be valid');
            Contact.create.mockRejectedValue(validationError);

            const response = await request(app)
                .post('/api/contacts')
                .send(invalidContactData)
                .expect(400);

            expect(response.body).toEqual({
                error: 'Validation error: email must be valid'
            });
            expect(Contact.create).toHaveBeenCalledWith(invalidContactData);
        });
    });

    describe('✏️ PUT /api/contacts/:id - Update contact', () => {
        test('should update a contact successfully (lines 45-51)', async () => {
            const updateData = {
                name: 'John Updated',
                email: 'john.updated@example.com',
                phone: '999-888-7777'
            };

            const updatedContact = { id: 1, ...updateData };

            // Mock update returns [1] meaning 1 row was updated
            Contact.update.mockResolvedValue([1]);
            Contact.findByPk.mockResolvedValue(updatedContact);

            const response = await request(app)
                .put('/api/contacts/1')
                .send(updateData)
                .expect(200);

            expect(response.body).toEqual(updatedContact);
            expect(Contact.update).toHaveBeenCalledWith(updateData, { where: { id: '1' } });
            expect(Contact.findByPk).toHaveBeenCalledWith('1');
        });

        test('should return 404 when updating non-existent contact (lines 47-48)', async () => {
            const updateData = {
                name: 'Updated Name'
            };

            // Mock update returns [0] meaning no rows were updated
            Contact.update.mockResolvedValue([0]);

            const response = await request(app)
                .put('/api/contacts/999')
                .send(updateData)
                .expect(404);

            expect(response.body).toEqual({
                error: 'Contact not found'
            });
            expect(Contact.update).toHaveBeenCalledWith(updateData, { where: { id: '999' } });
            // findByPk should NOT be called when update fails
            expect(Contact.findByPk).not.toHaveBeenCalled();
        });

        test('should handle validation error when updating contact (lines 52-54)', async () => {
            const invalidUpdateData = {
                name: '', // Invalid data
                email: 'not-an-email'
            };

            const validationError = new Error('Validation error: invalid email format');
            Contact.update.mockRejectedValue(validationError);

            const response = await request(app)
                .put('/api/contacts/1')
                .send(invalidUpdateData)
                .expect(400);

            expect(response.body).toEqual({
                error: 'Validation error: invalid email format'
            });
            expect(Contact.update).toHaveBeenCalledWith(invalidUpdateData, { where: { id: '1' } });
        });
    });

    describe('🗑️ DELETE /api/contacts/:id - Delete contact', () => {
        test('should delete a contact successfully (lines 57-62)', async () => {
            // Mock destroy returns 1 meaning 1 row was deleted
            Contact.destroy.mockResolvedValue(1);

            const response = await request(app)
                .delete('/api/contacts/1')
                .expect(204);

            expect(response.body).toEqual({});
            expect(Contact.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
        });

        test('should return 404 when deleting non-existent contact (lines 59-60)', async () => {
            // Mock destroy returns 0 meaning no rows were deleted
            Contact.destroy.mockResolvedValue(0);

            const response = await request(app)
                .delete('/api/contacts/999')
                .expect(404);

            expect(response.body).toEqual({
                error: 'Contact not found'
            });
            expect(Contact.destroy).toHaveBeenCalledWith({ where: { id: '999' } });
        });

        test('should handle database error when deleting contact (lines 63-65)', async () => {
            const dbError = new Error('Database deletion failed');
            Contact.destroy.mockRejectedValue(dbError);

            const response = await request(app)
                .delete('/api/contacts/1')
                .expect(500);

            expect(response.body).toEqual({
                error: 'Database deletion failed'
            });
            expect(Contact.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
        });
    });

    describe('🎯 EDGE CASES & INTEGRATION', () => {
        test('should handle very large ID in requests', async () => {
            Contact.findByPk.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/contacts/99999999999999999999')
                .expect(404);

            expect(response.body).toEqual({
                error: 'Contact not found'
            });
        });

        test('should handle special characters in ID', async () => {
            Contact.findByPk.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/contacts/abc123')
                .expect(404);

            expect(response.body).toEqual({
                error: 'Contact not found'
            });
            expect(Contact.findByPk).toHaveBeenCalledWith('abc123');
        });

        test('should handle empty request body in POST', async () => {
            const validationError = new Error('Validation error: missing required fields');
            Contact.create.mockRejectedValue(validationError);

            const response = await request(app)
                .post('/api/contacts')
                .send({})
                .expect(400);

            expect(response.body).toEqual({
                error: 'Validation error: missing required fields'
            });
        });

        test('should handle empty request body in PUT', async () => {
            const validationError = new Error('Validation error: no fields to update');
            Contact.update.mockRejectedValue(validationError);

            const response = await request(app)
                .put('/api/contacts/1')
                .send({})
                .expect(400);

            expect(response.body).toEqual({
                error: 'Validation error: no fields to update'
            });
        });
    });

    describe('🔍 COVERAGE VERIFICATION', () => {
        test('should execute all route handlers at least once', async () => {
            // GET all contacts
            Contact.findAll.mockResolvedValue([]);
            await request(app).get('/api/contacts').expect(200);

            // GET contact by ID
            Contact.findByPk.mockResolvedValue({ id: 1, name: 'Test Contact' });
            await request(app).get('/api/contacts/1').expect(200);

            // POST create contact
            Contact.create.mockResolvedValue({ id: 1, name: 'New Contact' });
            await request(app).post('/api/contacts').send({ name: 'New Contact' }).expect(201);

            // PUT update contact
            Contact.update.mockResolvedValue([1]);
            Contact.findByPk.mockResolvedValue({ id: 1, name: 'Updated Contact' });
            await request(app).put('/api/contacts/1').send({ name: 'Updated Contact' }).expect(200);

            // DELETE contact
            Contact.destroy.mockResolvedValue(1);
            await request(app).delete('/api/contacts/1').expect(204);

            // Verify all methods were called
            expect(Contact.findAll).toHaveBeenCalled();
            expect(Contact.findByPk).toHaveBeenCalled();
            expect(Contact.create).toHaveBeenCalled();
            expect(Contact.update).toHaveBeenCalled();
            expect(Contact.destroy).toHaveBeenCalled();
        });

        test('should test all error paths', async () => {
            // Test all catch blocks
            const testError = new Error('Test error');

            // GET all contacts error
            Contact.findAll.mockRejectedValue(testError);
            await request(app).get('/api/contacts').expect(500);

            // GET contact by ID error
            Contact.findByPk.mockRejectedValue(testError);
            await request(app).get('/api/contacts/1').expect(500);

            // POST create contact error
            Contact.create.mockRejectedValue(testError);
            await request(app).post('/api/contacts').send({ name: 'Test' }).expect(400);

            // PUT update contact error
            Contact.update.mockRejectedValue(testError);
            await request(app).put('/api/contacts/1').send({ name: 'Test' }).expect(400);

            // DELETE contact error
            Contact.destroy.mockRejectedValue(testError);
            await request(app).delete('/api/contacts/1').expect(500);

            // All error paths tested
            expect(true).toBe(true);
        });
    });

    describe('🌟 CONTACT-SPECIFIC TESTS', () => {
        test('should handle duplicate email validation error', async () => {
            const duplicateEmailData = {
                name: 'John Doe',
                email: 'existing@example.com',
                phone: '123-456-7890'
            };

            const duplicateError = new Error('Validation error: email already exists');
            Contact.create.mockRejectedValue(duplicateError);

            const response = await request(app)
                .post('/api/contacts')
                .send(duplicateEmailData)
                .expect(400);

            expect(response.body).toEqual({
                error: 'Validation error: email already exists'
            });
        });

        test('should handle phone number validation error', async () => {
            const invalidPhoneData = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: 'invalid-phone'
            };

            const phoneError = new Error('Validation error: invalid phone number format');
            Contact.create.mockRejectedValue(phoneError);

            const response = await request(app)
                .post('/api/contacts')
                .send(invalidPhoneData)
                .expect(400);

            expect(response.body).toEqual({
                error: 'Validation error: invalid phone number format'
            });
        });

        test('should handle long text fields', async () => {
            const longTextData = {
                name: 'A'.repeat(1000), // Very long name
                email: 'test@example.com',
                phone: '123-456-7890'
            };

            const lengthError = new Error('Validation error: name too long');
            Contact.create.mockRejectedValue(lengthError);

            const response = await request(app)
                .post('/api/contacts')
                .send(longTextData)
                .expect(400);

            expect(response.body).toEqual({
                error: 'Validation error: name too long'
            });
        });
    });
});