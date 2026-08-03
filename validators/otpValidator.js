// OTP Validator
const Joi = require('joi');

const otpValidation = {
  // Generate OTP validation
  generate: Joi.object({
    phone: Joi.string()
      .required()
      .messages({
        'any.required': 'Phone number is required'
      }),
    type: Joi.string()
      .valid('login', 'register', 'transaction', 'reset_password')
      .default('login')
  }),
  
  // Verify OTP validation
  verify: Joi.object({
    phone: Joi.string()
      .required()
      .messages({
        'any.required': 'Phone number is required'
      }),
    code: Joi.string()
      .length(6)
      .pattern(/^[0-9]{6}$/)
      .required()
      .messages({
        'string.length': 'OTP must be 6 digits',
        'string.pattern.base': 'OTP must be 6 digits',
        'any.required': 'OTP is required'
      }),
    type: Joi.string()
      .valid('login', 'register', 'transaction', 'reset_password')
      .default('login')
  }),
  
  // Resend OTP validation
  resend: Joi.object({
    phone: Joi.string()
      .required()
      .messages({
        'any.required': 'Phone number is required'
      }),
    type: Joi.string()
      .valid('login', 'register', 'transaction', 'reset_password')
      .default('login')
  })
};

module.exports = otpValidation;
