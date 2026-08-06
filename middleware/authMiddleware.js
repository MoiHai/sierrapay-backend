const tokenService = require('../services/token/tokenService');
const userRepository = require('../repositories/userRepository');

// Simple auth middleware - just verify token and get user
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = tokenService.verifyAccessToken(token);
    
    // Check if user exists
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User account is deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    req.deviceId = decoded.deviceId;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.message === 'Access token expired') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Invalid access token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
};

// Simplified session auth - just check if user is authenticated
const sessionAuthMiddleware = async (req, res, next) => {
  try {
    await authMiddleware(req, res, () => {
      // Skip session validation for now - just pass through
      next();
    });
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }
};

// Optional auth - doesn't require authentication
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = tokenService.verifyAccessToken(token);
      const user = await userRepository.findById(decoded.userId);
      if (user && user.isActive !== false) {
        req.user = user;
        req.deviceId = decoded.deviceId;
      }
    }
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

// Trusted device middleware - skip for now
const trustedDeviceMiddleware = async (req, res, next) => {
  // Skip device check for now
  await authMiddleware(req, res, () => {
    next();
  });
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  sessionAuthMiddleware,
  trustedDeviceMiddleware
};
