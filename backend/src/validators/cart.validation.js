const { body, param } = require('express-validator');
const { PRODUCT_SIZES } = require('../config/constants');

const addItemValidation = [
  body('productId').notEmpty().isMongoId(),
  body('size')
    .notEmpty()
    .custom((value) =>
      Object.values(PRODUCT_SIZES).includes(String(value).toUpperCase())
    ),
  body('quantity').optional().isInt({ min: 1, max: 99 })
];

const updateItemValidation = [
  param('itemId').isMongoId(),
  body('quantity').notEmpty().isInt({ min: 1, max: 99 })
];

const removeItemValidation = [param('itemId').isMongoId()];

module.exports = {
  addItemValidation,
  updateItemValidation,
  removeItemValidation
};
