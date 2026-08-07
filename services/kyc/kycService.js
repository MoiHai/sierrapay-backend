const kycRepository = require('../../repositories/kycRepository');
const userRepository = require('../../repositories/userRepository');
const notificationService = require('../notification/notificationService');

// Get the db instance directly
const { getFirestore } = require('../../config/firebase');

class KYCService {
  // ... (keep all existing methods)

  // Get all KYC submissions (Admin) - FIXED
  async getAllKYC(status = null, limit = 50) {
    try {
      const db = getFirestore();
      if (!db) throw new Error('Database not initialized');

      let query = db.collection('kyc');
      
      if (status) {
        query = query.where('status', '==', status);
      }
      
      const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to get KYC submissions: ${error.message}`);
    }
  }

  // ... (rest of methods)
}

module.exports = new KYCService();
