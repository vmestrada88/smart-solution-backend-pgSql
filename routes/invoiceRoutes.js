const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error('Error saving invoice:', error);
    res.status(500).json({ message: 'Error saving invoice' });
  }
});

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error getting invoices' });
  }
});

module.exports = router;
