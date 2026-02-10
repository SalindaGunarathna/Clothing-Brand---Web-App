const { body, query } = require('express-validator');
const { PRODUCT_CATEGORIES, PRODUCT_SIZES } = require('../config/constants');

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

const listProductsValidation = [
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
  query('sort')
    .optional()
    .isIn(['price', '-price', 'createdAt', '-createdAt', 'name', '-name'])
];

module.exports = { createProductValidation, listProductsValidation };
