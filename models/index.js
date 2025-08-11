
const sequelize = require('./db');
const Client = require('./Client');
const Contact = require('./Contact');
const Job = require('./Job');
const Product = require('./Product');
const User = require('./User');
const { Invoice, InvoiceItem } = require('./Invoice');

Client.hasMany(Contact, { foreignKey: 'clientId', as: 'contacts', onDelete: 'CASCADE' });
Contact.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

Client.hasMany(Job, { foreignKey: 'clientId', as: 'jobs', onDelete: 'CASCADE' });
Job.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

module.exports = {
  sequelize,
  Client,
  Contact,
  Job,
  Product,
  User,
  Invoice,
  InvoiceItem,
};
