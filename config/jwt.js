// JWT Configuration
const environment = require('./environment');

module.exports = {
  secret: environment.JWT_SECRET,
  expiresIn: environment.JWT_EXPIRE,
  algorithm: 'HS256',
  issuer: 'sierrapay-api',
  audience: 'sierrapay-users'
};
