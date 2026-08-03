// Email Configuration
const environment = require('./environment');

module.exports = {
  host: environment.EMAIL_HOST,
  port: environment.EMAIL_PORT,
  user: environment.EMAIL_USER,
  password: environment.EMAIL_PASSWORD,
  from: `SierraPay <${environment.EMAIL_USER}>`
};
