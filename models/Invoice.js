const { DataTypes, Model } = require('sequelize');
const sequelize = require('./db');
const Client = require('./Client');

class Invoice extends Model {}

Invoice.init({
  laborHours: DataTypes.FLOAT,
  laborRate: DataTypes.FLOAT,
  taxRate: DataTypes.FLOAT,
  totalAmount: DataTypes.FLOAT,
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Invoice',
  timestamps: false,
});

// Items como tabla aparte (relación 1 a muchos)
const InvoiceItem = sequelize.define('InvoiceItem', {
  name: DataTypes.STRING,
  price: DataTypes.FLOAT,
  quantity: DataTypes.INTEGER,
  total: DataTypes.FLOAT,
});

Invoice.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Invoice, { foreignKey: 'clientId', as: 'invoices' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

module.exports = { Invoice, InvoiceItem };
