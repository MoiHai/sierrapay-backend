// Admin Middleware
const { ROLES } = require('../config/constants');

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Please authenticate'
    });
  }
  
  const { role } = req.user;
  
  if (role !== ROLES.ADMIN && role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden - Admin access required'
    });
  }
  
  next();
};

const superAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Please authenticate'
    });
  }
  
  const { role } = req.user;
  
  if (role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden - Super admin access required'
    });
  }
  
  next();
};

module.exports = {
  adminMiddleware,
  superAdminMiddleware
};
