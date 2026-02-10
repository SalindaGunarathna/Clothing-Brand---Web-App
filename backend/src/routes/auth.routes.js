const express = require('express');
const {
  register,
  login,
  me,
  refresh,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  refreshValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../validators/auth.validation');

const router = express.Router();

router.post('/register',registerValidation,validate,register);

router.post('/login',loginValidation,validate,login);

router.post( '/refresh',refreshValidation,validate,refresh);

router.post('/logout',refreshValidation,validate,logout);

router.post( '/forgot-password',forgotPasswordValidation,
  validate,forgotPassword);

router.post('/reset-password',resetPasswordValidation,validate,
  resetPassword
);

router.get('/me', auth, me);

module.exports = router;
