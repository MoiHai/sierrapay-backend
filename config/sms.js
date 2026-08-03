// SMS Configuration
const environment = require('./environment');

module.exports = {
  provider: environment.SMS_PROVIDER,
  twilio: {
    accountSid: environment.TWILIO_ACCOUNT_SID,
    authToken: environment.TWILIO_AUTH_TOKEN,
    phoneNumber: environment.TWILIO_PHONE_NUMBER
  },
  // Add other SMS providers here
};
