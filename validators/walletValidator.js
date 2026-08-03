// Wallet Validator
const Joi = require('joi');

const walletValidation = {
  // Create wallet validation
  create: Joi.object({
    userId: Joi.string()
      .required()
      .messages({
        'any.required': 'User ID is required'
      }),
    currency: Joi.string()
      .default('SLE')
  }),
  
  // Fund wallet validation
  fund: Joi.object({
    amount: Joi.number()
      .positive()
      .min(1)
      .required()
      .messages({
        'number.min': 'Amount must be at least 1',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
    paymentMethod: Joi.string()
      .valid('mobile_money', 'bank_transfer', 'card')
      .required()
      .messages({
        'any.only': 'Invalid payment method',
        'any.required': 'Payment method is required'
      }),
    reference: Joi.string()
      .optional()
  }),
  
  // Withdraw validation
  withdraw: Joi.object({
    amount: Joi.number()
      .positive()
      .min(1)
      .required()
      .messages({
        'number.min': 'Amount must be at least 1',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
    walletNumber: Joi.string()
      .optional(),
    recipientPhone: Joi.string()
      .optional()
  }),
  
  // Transfer validation
  transfer: Joi.object({
    recipientPhone: Joi.string()
      .required()
      .messages({
        'any.required': 'Recipient phone number is required'
      }),
    amount: Joi.number()
      .positive()
      .min(1)
      .required()
      .messages({
        'number.min': 'Amount must be at least 1',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
    description: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Description must be less than 200 characters'
      })
  })
};

module.exports = walletValidation;
