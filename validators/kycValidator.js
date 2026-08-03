// KYC Validator
const Joi = require('joi');

const kycValidation = {
  // Submit KYC validation
  submit: Joi.object({
    userId: Joi.string()
      .required()
      .messages({
        'any.required': 'User ID is required'
      }),
    fullName: Joi.string()
      .required()
      .messages({
        'any.required': 'Full name is required'
      }),
    dateOfBirth: Joi.date()
      .required()
      .messages({
        'any.required': 'Date of birth is required'
      }),
    address: Joi.string()
      .required()
      .messages({
        'any.required': 'Address is required'
      }),
    idType: Joi.string()
      .valid('national_id', 'passport', 'drivers_license', 'voter_id')
      .required()
      .messages({
        'any.only': 'Invalid ID type',
        'any.required': 'ID type is required'
      }),
    idNumber: Joi.string()
      .required()
      .messages({
        'any.required': 'ID number is required'
      }),
    idPhoto: Joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'Invalid photo URL',
        'any.required': 'ID photo is required'
      }),
    selfie: Joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'Invalid selfie URL',
        'any.required': 'Selfie is required'
      })
  }),
  
  // Verify KYC validation (admin only)
  verify: Joi.object({
    kycId: Joi.string()
      .required()
      .messages({
        'any.required': 'KYC ID is required'
      }),
    status: Joi.string()
      .valid('verified', 'rejected')
      .required()
      .messages({
        'any.only': 'Status must be verified or rejected',
        'any.required': 'Status is required'
      }),
    notes: Joi.string()
      .optional()
  })
};

module.exports = kycValidation;
