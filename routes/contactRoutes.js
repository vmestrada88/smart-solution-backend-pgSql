/**
 * Express router for Contact-related endpoints.
 * Handles CRUD operations for contacts.
 * @module routes/Contact
 */

const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Import Contact model

// GET all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.findAll();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new contact
router.post('/', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a contact
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Contact.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Contact not found' });
    const contact = await Contact.findByPk(req.params.id);
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a contact
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Contact.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Contact not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export the router for use in the main app
module.exports = router;
