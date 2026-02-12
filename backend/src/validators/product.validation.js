const { body, param, query } = require('express-validator');
const { PRODUCT_CATEGORIES, PRODUCT_SIZES } = require('../config/constants');

const productSortValidation = query('sort')
  .optional()
  .isIn(['price', '-price', 'createdAt', '-createdAt', 'name', '-name']);

const commonListValidation = [
  query('search').optional().isString().trim().isLength({ max: 100 }),
  query('category')
    .optional()
    .custom((value) =>
      Object.values(PRODUCT_CATEGORIES).includes(String(value).toUpperCase())
    ),
  query('size')
    .optional()
    .custom((value) =>
      Object.values(PRODUCT_SIZES).includes(String(value).toUpperCase())
    ),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .custom((value, { req }) => {
      if (req.query.minPrice === undefined) return true;
      return Number(value) >= Number(req.query.minPrice);
    }),
  query('page').optional().isInt({ min: 1, max: 100000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  productSortValidation
];

const createProductValidation = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 200 }),
  body('description').trim().notEmpty().isLength({ max: 2000 }),
  body('price').isFloat({ min: 0 }),
  body('imageUrl').trim().notEmpty().isURL().isLength({ max: 2048 }),
  body('category')
    .notEmpty()
    .custom((value) =>
      Object.values(PRODUCT_CATEGORIES).includes(String(value).toUpperCase())
    ),
  body('sizes')
    .isArray({ min: 1 })
    .custom((sizes) =>
      sizes.every((size) =>
        Object.values(PRODUCT_SIZES).includes(String(size).toUpperCase())
      )
    )
];

const listProductsValidation = commonListValidation;

const listAdminProductsValidation = [
  ...commonListValidation,
  query('status').optional().isIn(['all', 'active', 'inactive'])
];

const productIdValidation = [param('id').isMongoId()];

const updateProductValidation = [
  param('id').isMongoId(),
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('imageUrl').optional().trim().isURL().isLength({ max: 2048 }),
  body('category')
    .optional()
    .custom((value) =>
      Object.values(PRODUCT_CATEGORIES).includes(String(value).toUpperCase())
    ),
  body('sizes')
    .optional()
    .isArray({ min: 1 })
    .custom((sizes) =>
      sizes.every((size) =>
        Object.values(PRODUCT_SIZES).includes(String(size).toUpperCase())
      )
    ),
  body('stockBySize')
    .optional()
    .custom((value) => {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('stockBySize must be an object');
      }
      return true;
    }),
  body('isActive').optional().isBoolean().toBoolean()
];

module.exports = {
  createProductValidation,
  listProductsValidation,
  listAdminProductsValidation,
  productIdValidation,
  updateProductValidation
};
