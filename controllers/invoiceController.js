const { Invoice, InvoiceItem, Client } = require('../models');

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        { model: Client, as: 'client', attributes: ['id', 'companyName', 'address', 'city', 'state', 'zip'] },
        { model: InvoiceItem, as: 'items' }
      ],
      order: [['id', 'DESC']]
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  const transaction = await Invoice.sequelize.transaction();

  try {
    const {
      clientId,
      date,
      laborHours = 0,
      laborRate = 0,
      taxRate = 0.07,
      taxExempt = false,
      totalAmount = 0,
      items = []
    } = req.body;

    if (!clientId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'clientId is required' });
    }

    const newInvoice = await Invoice.create(
      {
        clientId,
        date: date || new Date(),
        laborHours,
        laborRate,
        taxRate,
        taxExempt,
        totalAmount
      },
      { transaction }
    );

    if (Array.isArray(items) && items.length > 0) {
      const invoiceItems = items.map((item) => ({
        invoiceId: newInvoice.id,
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        total: Number(item.total || 0)
      }));

      await InvoiceItem.bulkCreate(invoiceItems, { transaction });
    }

    await transaction.commit();

    const createdInvoice = await Invoice.findByPk(newInvoice.id, {
      include: [
        { model: Client, as: 'client', attributes: ['id', 'companyName', 'address', 'city', 'state', 'zip'] },
        { model: InvoiceItem, as: 'items' }
      ]
    });

    res.status(201).json(createdInvoice);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client', attributes: ['id', 'companyName', 'address', 'city', 'state', 'zip'] },
        { model: InvoiceItem, as: 'items' }
      ]
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  const transaction = await Invoice.sequelize.transaction();

  try {
    const {
      clientId,
      date,
      laborHours,
      laborRate,
      taxRate,
      taxExempt,
      totalAmount,
      items
    } = req.body;

    const [updated] = await Invoice.update(
      { clientId, date, laborHours, laborRate, taxRate, taxExempt, totalAmount },
      { where: { id: req.params.id }, transaction }
    );

    if (!updated) return res.status(404).json({ error: 'Invoice not found' });

    if (Array.isArray(items)) {
      await InvoiceItem.destroy({ where: { invoiceId: req.params.id }, transaction });
      if (items.length > 0) {
        await InvoiceItem.bulkCreate(
          items.map((item) => ({
            invoiceId: Number(req.params.id),
            name: item.name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            total: Number(item.total || 0)
          })),
          { transaction }
        );
      }
    }

    await transaction.commit();

    const updatedInvoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client', attributes: ['id', 'companyName', 'address', 'city', 'state', 'zip'] },
        { model: InvoiceItem, as: 'items' }
      ]
    });
    res.json(updatedInvoice);
  } catch (error) {
    await transaction.rollback();
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