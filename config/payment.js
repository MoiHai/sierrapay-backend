// Payment Configuration
const environment = require('./environment');

module.exports = {
  orangeMoney: {
    apiKey: environment.ORANGE_MONEY_API_KEY,
    baseUrl: 'https://api.orange.com'
  },
  afrimoney: {
    apiKey: environment.AFRIMONEY_API_KEY,
    baseUrl: 'https://api.afrimoney.com'
  },
  qmoney: {
    apiKey: environment.QMONEY_API_KEY,
    baseUrl: 'https://api.qmoney.com'
  },
  transactionFee: {
    min: 0.50,
    max: 10.00,
    percentage: 0.5 // 0.5%
  }
};
