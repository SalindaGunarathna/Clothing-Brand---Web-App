const express = require('express');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  checkout,
  listMyOrders,
  listAllOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');

const router = express.Router();

router.post('/checkout', auth, checkout);
router.get('/checkout', auth, (req, res) => {
  res.status(405).json({ message: 'Use POST /api/orders/checkout' });
});
router.get(
  '/admin/all',
  auth,
  authorize('ADMIN'),
  [
    query('status')
      .optional()
      .customSanitizer((value) => String(value).toUpperCase())
      .isIn(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    query('startDate').optional().isISO8601(),
    query('endDate')
      .optional()
      .isISO8601()
      .custom((value, { req }) => {
        if (!req.query.startDate) return true;
        return new Date(value) >= new Date(req.query.startDate);
      }),
    query('page').optional().isInt({ min: 1, max: 100000 }),
    query('limit').optional().isInt({ min: 1, max: 200 })
  ],
  validate,
  listAllOrders
);
router.patch(
  '/admin/:id/status',
  auth,
  authorize('ADMIN'),
  [
    param('id').isMongoId(),
    body('status')
      .notEmpty()
      .isString()
      .trim()
      .customSanitizer((value) => String(value).toUpperCase())
      .isIn(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  ],
  validate,
  updateOrderStatus
);

router.get('/', auth, listMyOrders);
router.get('/:id', auth, [param('id').isMongoId()], validate, getOrderById);

module.exports = router;
