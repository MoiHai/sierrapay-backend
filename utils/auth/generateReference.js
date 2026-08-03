// Generate Unique Reference
const { v4: uuidv4 } = require('uuid');

const generateReference = {
  // Generate transaction reference
  transaction: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TRX-${timestamp}-${random}`;
  },
  
  // Generate wallet reference
  wallet: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `WLT-${timestamp}-${random}`;
  },
  
  // Generate payment reference
  payment: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `PAY-${timestamp}-${random}`;
  },
  
  // Generate bill reference
  bill: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `BIL-${timestamp}-${random}`;
  },
  
  // Generate QR reference
  qr: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `QR-${timestamp}-${random}`;
  },
  
  // Generate KYC reference
  kyc: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `KYC-${timestamp}-${random}`;
  },
  
  // Generate unique ID
  uniqueId: () => {
    return uuidv4();
  }
};

module.exports = generateReference;
