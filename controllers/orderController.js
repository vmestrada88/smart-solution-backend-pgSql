const { Order, OrderItem, Cart, Product, sequelize } = require('../models');

// Lazy load Stripe to avoid blocking server startup if key is missing
let stripe = null;
const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

const orderController = {
  // Create order
  async createOrder(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const userId = req.user.id;
      const { shippingAddress, items } = req.body;

      // Get cart items
      const cartItems = await Cart.findAll({
        where: { userId },
        include: [{
          model: Product,
          as: 'product'
        }],
        transaction
      });

      if (cartItems.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Calculate total
      let totalAmount = 0;
      const orderItems = [];

      for (const cartItem of cartItems) {
        const product = cartItem.product;
        if (product.quantity < cartItem.quantity) {
          await transaction.rollback();
          return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }

        totalAmount += parseFloat(product.priceSell) * cartItem.quantity;
        orderItems.push({
          productId: product.id,
          quantity: cartItem.quantity,
          price: product.priceSell
        });
      }

      // Create Stripe PaymentIntent
      const stripeInstance = getStripe();
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: userId.toString()
        }
      });

      // Create order
      const order = await Order.create({
        userId,
        totalAmount,
        shippingAddress,
        paymentIntentId: paymentIntent.id
      }, { transaction });

      // Create order items
      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          ...item
        }, { transaction });

        // Update product stock
        const product = await Product.findByPk(item.productId, { transaction });
        product.quantity -= item.quantity;
        await product.save({ transaction });
      }

      // Clear cart
      await Cart.destroy({
        where: { userId },
        transaction
      });

      await transaction.commit();

      res.json({
        order,
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  // Get user's orders
  async getOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await Order.findAll({
        where: { userId },
        include: [{
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Product,
            as: 'product'
          }]
        }],
        order: [['createdAt', 'DESC']]
      });
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  // Get single order
  async getOrder(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const order = await Order.findOne({
        where: { id, userId },
        include: [{
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Product,
            as: 'product'
          }]
        }]
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }
};

module.exports = orderController;