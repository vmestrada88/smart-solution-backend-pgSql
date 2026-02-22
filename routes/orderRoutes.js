const express = require('express');
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);

module.exports = router;
