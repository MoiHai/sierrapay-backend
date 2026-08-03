// Generate QR Code
// Note: This is a placeholder. In production, you'd use a QR generation library

const generateQRCode = {
  // Generate QR data for payment
  payment: (data) => {
    const qrData = {
      type: 'payment',
      merchantId: data.merchantId || data.userId,
      amount: data.amount || 0,
      currency: data.currency || 'SLE',
      reference: data.reference || generateReference.payment(),
      timestamp: new Date().toISOString()
    };
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  },
  
  // Generate QR data for user
  user: (userData) => {
    const qrData = {
      type: 'user',
      userId: userData.userId,
      phone: userData.phone,
      name: userData.name || '',
      timestamp: new Date().toISOString()
    };
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  },
  
  // Generate QR data for merchant
  merchant: (merchantData) => {
    const qrData = {
      type: 'merchant',
      merchantId: merchantData.merchantId,
      businessName: merchantData.businessName,
      category: merchantData.category || '',
      timestamp: new Date().toISOString()
    };
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
  },
  
  // Decode QR data
  decode: (qrString) => {
    try {
      const decoded = Buffer.from(qrString, 'base64').toString();
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }
};

module.exports = generateQRCode;
