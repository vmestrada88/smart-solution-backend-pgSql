const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      total: Number,
    }
  ],
  laborHours: Number,
  laborRate: Number,
  taxRate: Number,
  totalAmount: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
