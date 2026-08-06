const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg
  }));
  
  return res.status(400).json({
    error: 'Validation failed',
    errors: extractedErrors
  });
};

const registerValidation = [
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  body('fullName')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email address'),
  validate
];

const loginValidation = [
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  body('code')
    .notEmpty().withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP code must be 6 digits')
    .isNumeric().withMessage('OTP code must be numeric'),
  validate
];

const otpRequestValidation = [
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  body('purpose')
    .optional()
    .isIn(['login', 'registration', 'password_reset', 'verification']).withMessage('Invalid purpose'),
  validate
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
  body('deviceId')
    .notEmpty().withMessage('Device ID is required'),
  validate
];

const logoutValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required'),
  validate
];

const deviceValidation = [
  body('deviceId')
    .notEmpty().withMessage('Device ID is required'),
  body('deviceName')
    .optional()
    .isString().withMessage('Device name must be a string'),
  body('deviceType')
    .optional()
    .isIn(['android', 'ios', 'web']).withMessage('Invalid device type'),
  validate
];

const trustDeviceValidation = [
  body('deviceId')
    .notEmpty().withMessage('Device ID is required'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  otpRequestValidation,
  refreshTokenValidation,
  logoutValidation,
  deviceValidation,
  trustDeviceValidation
};
