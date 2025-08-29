/**
 * Order model definition using Sequelize ORM.
 * Represents an order entity with client and status information.
 * @module models/Order
 */

const { DataTypes } = require('sequelize'); // Import Sequelize data types
const sequelize = require('./db'); // Import the Sequelize instance

/**
 * Defines the Order model schema.
 * @typedef {Object} Order
 * @property {number} clientId - The ID of the client who placed the order (required).
 * @property {string} status - The current status of the order (required).
 * @property {Date} createdAt - The date when the order was created (default: now).
 */
const Order = sequelize.define('Order', {
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Client ID is required
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false, // Status is required
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Automatically set to current date/time
  },
}, {
  timestamps: false, // Disable automatic timestamp fields (createdAt, updatedAt)
});

// Export the Order model for use in other modules
module.exports = Order;
