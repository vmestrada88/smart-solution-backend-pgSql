const { DataTypes, Model } = require('sequelize');
const sequelize = require('./db');

class Cart extends Model {}

Cart.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
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
}, {
  sequelize,
  modelName: 'Cart',
  tableName: 'Carts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'productId'],
    },
  ],
});

module.exports = Cart;
