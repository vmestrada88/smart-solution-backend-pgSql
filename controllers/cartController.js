const { Cart, Product } = require('../models');

const cartController = {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const items = await Cart.findAll({
        where: { userId },
        include: [{ model: Product, as: 'product' }],
        order: [['createdAt', 'DESC']],
      });
      return res.json(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }
  },

  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'productId is required' });
      }

      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const safeQuantity = Math.max(1, Number(quantity) || 1);
      const available = Number(product.quantity || 0);

      if (available <= 0) {
        return res.status(400).json({ error: 'Product is out of stock' });
      }

      let cartItem = await Cart.findOne({ where: { userId, productId } });

      if (cartItem) {
        cartItem.quantity = Math.min(cartItem.quantity + safeQuantity, available);
        await cartItem.save();
      } else {
        cartItem = await Cart.create({
          userId,
          productId,
          quantity: Math.min(safeQuantity, available),
        });
      }

      const result = await Cart.findByPk(cartItem.id, {
        include: [{ model: Product, as: 'product' }],
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error adding to cart:', error);
      return res.status(500).json({ error: 'Failed to add to cart' });
    }
  },

  async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { quantity } = req.body;

      const cartItem = await Cart.findOne({ where: { id, userId } });
      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      const nextQuantity = Math.max(1, Number(quantity) || 1);
      cartItem.quantity = nextQuantity;
      await cartItem.save();

      const result = await Cart.findByPk(cartItem.id, {
        include: [{ model: Product, as: 'product' }],
      });

      return res.json(result);
    } catch (error) {
      console.error('Error updating cart item:', error);
      return res.status(500).json({ error: 'Failed to update cart item' });
    }
  },

  async removeCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const deleted = await Cart.destroy({ where: { id, userId } });
      if (!deleted) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      return res.json({ success: true, id: Number(id) });
    } catch (error) {
      console.error('Error removing cart item:', error);
      return res.status(500).json({ error: 'Failed to remove cart item' });
    }
  },
};

module.exports = cartController;
