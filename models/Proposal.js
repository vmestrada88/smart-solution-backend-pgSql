const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  proposalNumber: {
    type: String,
    required: true,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientInfo: {
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: { type: String, required: true },
    description: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    laborCost: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['creado', 'enviado', 'archivado', 'cancelado'],
    default: 'creado'
  },
  validUntil: Date,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Auto-generar número de propuesta
ProposalSchema.pre('save', async function(next) {
  if (!this.proposalNumber) {
    const count = await mongoose.model('Proposal').countDocuments();
    this.proposalNumber = `PROP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calcular totales automáticamente
ProposalSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal + this.tax;
  next();
});

module.exports = mongoose.model('Proposal', ProposalSchema);