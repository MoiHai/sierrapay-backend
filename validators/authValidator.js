// Auth Validator
const Joi = require('joi');

const phoneRegex = /^\+232[0-9]{8,9}$/;

const authValidation = {
  // Send OTP validation
  sendOTP: Joi.object({
    phone: Joi.string()
      .pattern(phoneRegex)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid Sierra Leone number (+232XXXXXXXX)',
        'any.required': 'Phone number is required'
      })
  }),
  
  // Verify OTP validation
  verifyOTP: Joi.object({
    phone: Joi.string()
      .pattern(phoneRegex)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid Sierra Leone number (+232XXXXXXXX)',
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
      })
  }),
  
  // Register validation
  register: Joi.object({
    phone: Joi.string()
      .pattern(phoneRegex)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid Sierra Leone number (+232XXXXXXXX)',
        'any.required': 'Phone number is required'
      }),
    fullName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name must be less than 100 characters',
        'any.required': 'Full name is required'
      }),
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Invalid email format'
      })
  }),
  
  // Login validation
  login: Joi.object({
    phone: Joi.string()
      .pattern(phoneRegex)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid Sierra Leone number (+232XXXXXXXX)',
        'any.required': 'Phone number is required'
      }),
    deviceId: Joi.string()
      .optional(),
    fingerprint: Joi.boolean()
      .optional()
  })
};

module.exports = authValidation;
