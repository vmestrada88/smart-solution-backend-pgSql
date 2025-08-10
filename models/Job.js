const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Job = sequelize.define('Job', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  equipmentInstalled: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  notes: DataTypes.STRING,
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: false,
});

module.exports = Job;
