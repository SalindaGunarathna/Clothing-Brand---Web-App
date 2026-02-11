const { body } = require('express-validator');

const emailNormalizeOptions = {
  gmail_remove_dots: false,
  gmail_remove_subaddress: false
};

const registerValidation = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().normalizeEmail(emailNormalizeOptions),
  body('password').isLength({ min: 8 })
];

const loginValidation = [
  body('email').trim().isEmail().normalizeEmail(emailNormalizeOptions),
  body('password').notEmpty()
];

const refreshValidation = [body('refreshToken').notEmpty()];

const forgotPasswordValidation = [
  body('email').trim().isEmail().normalizeEmail(emailNormalizeOptions)
];

const resetPasswordValidation = [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 })
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};
