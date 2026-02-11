const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  checkoutValidation,
  listAllOrdersValidation,
  updateOrderStatusValidation,
  orderIdValidation
} = require('../validators/order.validation');
const {
  checkout,
  listMyOrders,
  listAllOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');

const router = express.Router();

router.post(
  '/checkout',
  auth,
  checkoutValidation,
  validate,
  checkout
);
router.get('/checkout', auth, (req, res) => {
  res.status(405).json({ message: 'Use POST /api/orders/checkout' });
});
router.get(
  '/admin/all',
  auth,
  authorize('ADMIN'),
  listAllOrdersValidation,
  validate,
  listAllOrders
);
router.patch(
  '/admin/:id/status',
  auth,
  authorize('ADMIN'),
  updateOrderStatusValidation,
  validate,
  updateOrderStatus
);

router.get('/', auth, listMyOrders);
router.get('/:id', auth, orderIdValidation, validate, getOrderById);

module.exports = router;
