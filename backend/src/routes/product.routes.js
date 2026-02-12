const express = require('express');
const {
  listProducts,
  listAdminProducts,
  getProductById,
  createProduct,
  getAdminProductById,
  updateProduct
} = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createProductValidation,
  listProductsValidation,
  listAdminProductsValidation,
  productIdValidation,
  updateProductValidation
} = require('../validators/product.validation');

const router = express.Router();

router.get('/', listProductsValidation, validate, listProducts);
router.get(
  '/admin/all',
  auth,
  authorize('ADMIN'),
  listAdminProductsValidation,
  validate,
  listAdminProducts
);
router.get(
  '/admin/:id',
  auth,
  authorize('ADMIN'),
  productIdValidation,
  validate,
  getAdminProductById
);
router.get('/:id', getProductById);
router.post(
  '/',
  auth,
  authorize('ADMIN'),
  createProductValidation,
  validate,
  createProduct
);
router.patch(
  '/admin/:id',
  auth,
  authorize('ADMIN'),
  updateProductValidation,
  validate,
  updateProduct
);

module.exports = router;
