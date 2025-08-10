const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.STRING,
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  priceSell: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  priceBuy: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  category: DataTypes.STRING,
  imageUrls: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

module.exports = Product;
