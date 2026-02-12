const { body, param, query } = require('express-validator');

const ORDER_STATUSES = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const checkoutValidation = [
  body('email').optional().isEmail().normalizeEmail(),
  body('shippingAddress').notEmpty().isObject(),
  body('shippingAddress.name').notEmpty().isString().trim(),
  body('shippingAddress.phone').notEmpty().isString().trim(),
  body('shippingAddress.address').notEmpty().isString().trim(),
  body('shippingAddress.city').notEmpty().isString().trim(),
  body('shippingAddress.zip').notEmpty().isString().trim()
];

const listAllOrdersValidation = [
  query('status')
    .optional()
    .customSanitizer((value) => String(value).toUpperCase())
    .isIn(ORDER_STATUSES),
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
];

const updateOrderStatusValidation = [
  param('id').isMongoId(),
  body('status')
    .notEmpty()
    .isString()
    .trim()
    .customSanitizer((value) => String(value).toUpperCase())
    .isIn(ORDER_STATUSES)
];

const orderIdValidation = [param('id').isMongoId()];

module.exports = {
  checkoutValidation,
  listAllOrdersValidation,
  updateOrderStatusValidation,
  orderIdValidation
};
