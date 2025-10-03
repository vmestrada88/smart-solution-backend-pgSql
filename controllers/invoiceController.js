const { Invoice } = require('../models');

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { clientId, date, total, status } = req.body;
    const newInvoice = await Invoice.create({ clientId, date, total, status });
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { clientId, date, total, status } = req.body;
    const [updated] = await Invoice.update({ clientId, date, total, status }, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Invoice not found' });
    const updatedInvoice = await Invoice.findByPk(req.params.id);
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const deleted = await Invoice.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Invoice not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};