// models/Client.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String,
  phone: String,
  email: String,
});

const jobSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  equipmentInstalled: [String],
  images: [String],
  notes: String,
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
});

const clientSchema = new mongoose.Schema({
  companyName: String,
  address: { type: String, required: true },
  city: String,
  state: String,
  zip: String,
  contacts: [contactSchema],
  jobs: [jobSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Client', clientSchema);