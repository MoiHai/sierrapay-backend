// User Validator
const Joi = require('joi');

const userValidation = {
  // Update profile validation
  updateProfile: Joi.object({
    fullName: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name must be less than 100 characters'
      }),
    email: Joi.string()
      .email()
      .messages({
        'string.email': 'Invalid email format'
      }),
    profilePicture: Joi.string()
      .uri()
      .messages({
        'string.uri': 'Invalid profile picture URL'
      }),
    bio: Joi.string()
      .max(500)
      .messages({
        'string.max': 'Bio must be less than 500 characters'
      }),
    address: Joi.string()
      .max(200)
      .messages({
        'string.max': 'Address must be less than 200 characters'
      })
  }),
  
  // Change password validation
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'New password must be at least 6 characters',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
      })
  }),
  
  // Set PIN validation
  setPin: Joi.object({
    pin: Joi.string()
      .pattern(/^[0-9]{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'PIN must be 4 digits',
        'any.required': 'PIN is required'
      }),
    confirmPin: Joi.string()
      .valid(Joi.ref('pin'))
      .required()
      .messages({
        'any.only': 'PINs do not match',
        'any.required': 'Please confirm your PIN'
      })
  }),
  
  // Verify PIN validation
  verifyPin: Joi.object({
    pin: Joi.string()
      .pattern(/^[0-9]{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'PIN must be 4 digits',
        'any.required': 'PIN is required'
      })
  })
};

module.exports = userValidation;
