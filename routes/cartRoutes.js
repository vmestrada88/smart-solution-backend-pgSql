const express = require('express');
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);

module.exports = router;
