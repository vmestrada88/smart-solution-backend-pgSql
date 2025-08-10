const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Contact = sequelize.define('Contact', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
}, {
  timestamps: false,
});

module.exports = Contact;
