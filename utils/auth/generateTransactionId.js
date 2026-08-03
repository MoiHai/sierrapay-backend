// Generate Transaction ID
const generateTransactionId = {
  // Generate transaction ID
  generate: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  },
  
  // Generate unique transaction ID
  unique: () => {
    const timestamp = new Date().getTime().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `TXN${timestamp}${random}`.toUpperCase();
  },
  
  // Generate short transaction ID
  short: () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${random}`;
  }
};

module.exports = generateTransactionId;
