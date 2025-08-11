const { DataTypes, Model } = require('sequelize');
const sequelize = require('./db');
const Client = require('./Client');
const User = require('./User');
const Product = require('./Product');

class Proposal extends Model {}

Proposal.init({
  proposalNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  clientInfoName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  clientInfoEmail: DataTypes.STRING,
  clientInfoPhone: DataTypes.STRING,
  clientInfoAddress: DataTypes.STRING,
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  tax: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('creado', 'enviado', 'archivado', 'cancelado'),
    defaultValue: 'creado',
  },
  validUntil: DataTypes.DATE,
  notes: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'Proposal',
  timestamps: true,
});

class ProposalItem extends Model {}

ProposalItem.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.STRING,
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  unitPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  laborCost: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'ProposalItem',
  timestamps: false,
});

Proposal.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Proposal, { foreignKey: 'clientId', as: 'proposals' });
Proposal.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Proposal, { foreignKey: 'createdBy', as: 'proposals' });
Proposal.hasMany(ProposalItem, { foreignKey: 'proposalId', as: 'items', onDelete: 'CASCADE' });
ProposalItem.belongsTo(Proposal, { foreignKey: 'proposalId', as: 'proposal' });
ProposalItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ProposalItem, { foreignKey: 'productId', as: 'proposalItems' });

// Hook para autogenerar número de propuesta y calcular totales
Proposal.beforeCreate = async (proposal, options) => {
  if (!proposal.proposalNumber) {
    const count = await Proposal.count();
    proposal.proposalNumber = `PROP-${String(count + 1).padStart(6, '0')}`;
  }
};
Proposal.beforeSave = (proposal, options) => {
  if (proposal.items && Array.isArray(proposal.items)) {
    proposal.subtotal = proposal.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    proposal.total = proposal.subtotal + (proposal.tax || 0);
  }
};

module.exports = { Proposal, ProposalItem };