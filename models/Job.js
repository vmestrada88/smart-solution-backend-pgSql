const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Job = sequelize.define('Job', {
  // Task scheduling window
  date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // Task details
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
  // Links
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  assignedTo: {
    // Support multiple assigned technicians
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled','in_progress','done','cancelled'),
    allowNull: false,
    defaultValue: 'scheduled',
  },
}, {
  timestamps: false,
});

module.exports = Job;
