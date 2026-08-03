// Biometric Authentication Middleware
// This will be used for validating biometric authentication requests

const biometricMiddleware = async (req, res, next) => {
  try {
    // Check if user has biometric enabled
    if (req.user && req.user.hasBiometric) {
      // You can add additional biometric validation here
      // For now, just pass through
      next();
    } else {
      next(); // Allow fallback to PIN/password
    }
  } catch (error) {
    console.error('Biometric middleware error:', error);
    next(error);
  }
};

module.exports = biometricMiddleware;
