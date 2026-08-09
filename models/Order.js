const { DataTypes, Model } = require('sequelize');
const sequelize = require('./db');

class Order extends Model {}
class OrderItem extends Model {}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'Orders',
  timestamps: true,
});

OrderItem.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'OrderItem',
  tableName: 'OrderItems',
  timestamps: true,
});

module.exports = { Order, OrderItem };
