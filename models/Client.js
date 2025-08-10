const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Client = sequelize.define('Client', {
  companyName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zip: DataTypes.STRING,
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

module.exports = Client;