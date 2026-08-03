// Response Utility
const response = {
  // Success response
  success: (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },
  
  // Error response
  error: (res, message, statusCode = 400, details = null) => {
    const response = {
      success: false,
      message
    };
    if (details && process.env.NODE_ENV === 'development') {
      response.details = details;
    }
    return res.status(statusCode).json(response);
  },
  
  // Created response
  created: (res, data, message = 'Resource created successfully') => {
    return response.success(res, data, message, 201);
  },
  
  // No content response
  noContent: (res) => {
    return res.status(204).send();
  },
  
  // Not found response
  notFound: (res, message = 'Resource not found') => {
    return response.error(res, message, 404);
  },
  
  // Unauthorized response
  unauthorized: (res, message = 'Unauthorized') => {
    return response.error(res, message, 401);
  },
  
  // Forbidden response
  forbidden: (res, message = 'Forbidden') => {
    return response.error(res, message, 403);
  },
  
  // Validation error response
  validationError: (res, errors, message = 'Validation error') => {
    return res.status(400).json({
      success: false,
      message,
      errors
    });
  },
  
  // Paginated response
  paginated: (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination
    });
  }
};

module.exports = response;
