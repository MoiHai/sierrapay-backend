// Payment Validator
const Joi = require('joi');

const paymentValidation = {
  // Send money validation
  sendMoney: Joi.object({
    recipientPhone: Joi.string()
      .required()
      .messages({
        'any.required': 'Recipient phone number is required'
      }),
    amount: Joi.number()
      .positive()
      .min(1)
      .max(10000)
      .required()
      .messages({
        'number.min': 'Amount must be at least 1',
        'number.max': 'Amount must be less than 10,000',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
    description: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Description must be less than 200 characters'
      }),
    pin: Joi.string()
      .pattern(/^[0-9]{4}$/)
      .optional()
      .messages({
        'string.pattern.base': 'PIN must be 4 digits'
      })
  }),
  
  // Request money validation
  requestMoney: Joi.object({
    senderPhone: Joi.string()
      .required()
      .messages({
        'any.required': 'Sender phone number is required'
      }),
    amount: Joi.number()
      .positive()
      .min(1)
      .max(10000)
      .required()
      .messages({
        'number.min': 'Amount must be at least 1',
        'number.max': 'Amount must be less than 10,000',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
    description: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Description must be less than 200 characters'
      })
  }),
  
  // QR payment validation
  qrPayment: Joi.object({
    qrCode: Joi.string()
      .required()
      .messages({
        'any.required': 'QR code is required'
      }),
    amount: Joi.number()
      .positive()
      .min(1)
      .max(10000)
      .required()
      .messages({
        'number.min': 'Amount must be at least 1',
        'number.max': 'Amount must be less than 10,000',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
    pin: Joi.string()
      .pattern(/^[0-9]{4}$/)
      .optional()
      .messages({
        'string.pattern.base': 'PIN must be 4 digits'
      })
  })
};

module.exports = paymentValidation;
