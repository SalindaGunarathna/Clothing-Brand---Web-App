const express = require('express');
const {
  listProducts,
  getProductById,
  createProduct
} = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createProductValidation,
  listProductsValidation
} = require('../validators/product.validation');

const router = express.Router();

router.get('/', listProductsValidation, validate, listProducts);
router.get('/:id', getProductById);
router.post(
  '/',
  auth,
  authorize('ADMIN'),
  createProductValidation,
  validate,
  createProduct
);

module.exports = router;
