const express = require('express');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const validate = require('../middleware/validate');
const {
  addItemValidation,
  updateItemValidation,
  removeItemValidation
} = require('../validators/cart.validation');
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  getCartTotal
} = require('../controllers/cart.controller');

const router = express.Router();

router.get('/', optionalAuth, getCart);
router.get('/total', optionalAuth, getCartTotal);
router.post('/items', optionalAuth, addItemValidation, validate, addItem);
router.patch(
  '/items/:itemId',
  optionalAuth,
  updateItemValidation,
  validate,
  updateItem
);
router.delete(
  '/items/:itemId',
  optionalAuth,
  removeItemValidation,
  validate,
  removeItem
);
router.delete('/', optionalAuth, clearCart);

// Optional: authenticated endpoint for user carts
router.get('/me', auth, getCart);

module.exports = router;
