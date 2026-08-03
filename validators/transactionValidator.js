// Transaction Validator
const Joi = require('joi');

const transactionValidation = {
  // Get transactions validation
  getTransactions: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),
    type: Joi.string()
      .valid('send', 'receive', 'qr_payment', 'bill_payment', 'withdrawal', 'deposit')
      .optional(),
    status: Joi.string()
      .valid('pending', 'processing', 'completed', 'failed', 'reversed', 'cancelled')
      .optional(),
    startDate: Joi.date()
      .optional(),
    endDate: Joi.date()
      .optional()
  }),
  
  // Get transaction details validation
  getTransaction: Joi.object({
    transactionId: Joi.string()
      .required()
      .messages({
        'any.required': 'Transaction ID is required'
      })
  }),
  
  // Reverse transaction validation (admin only)
  reverseTransaction: Joi.object({
    transactionId: Joi.string()
      .required()
      .messages({
        'any.required': 'Transaction ID is required'
      }),
    reason: Joi.string()
      .required()
      .messages({
        'any.required': 'Reason is required'
      })
  })
};

module.exports = transactionValidation;
