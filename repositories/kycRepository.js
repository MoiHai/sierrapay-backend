let db = null;

const setDb = (database) => {
  db = database;
};

class KYCRepository {
  constructor() {}

  async create(kycData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const docRef = db.collection('kyc').doc();
      const data = {
        ...kycData,
        kycId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Failed to create KYC record: ${error.message}`);
    }
  }

  async findById(kycId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('kyc').doc(kycId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find KYC record: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('kyc')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      // Fallback without orderBy
      try {
        const snapshot = await db.collection('kyc')
          .where('userId', '==', userId)
          .get();
        
        if (snapshot.empty) return null;
        
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return results[0];
      } catch (fallbackError) {
        throw new Error(`Failed to find KYC record: ${fallbackError.message}`);
      }
    }
  }

  async updateStatus(kycId, status, data = {}) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('kyc').doc(kycId).update({
        status: status,
        ...data,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(kycId);
    } catch (error) {
      throw new Error(`Failed to update KYC status: ${error.message}`);
    }
  }

  async verify(kycId, verifiedBy, notes = '') {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('kyc').doc(kycId).update({
        status: 'verified',
        verifiedBy: verifiedBy,
        verifiedAt: new Date().toISOString(),
        verificationNotes: notes || 'Verification approved',
        updatedAt: new Date().toISOString()
      });
      return await this.findById(kycId);
    } catch (error) {
      throw new Error(`Failed to verify KYC: ${error.message}`);
    }
  }

  async reject(kycId, reason) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('kyc').doc(kycId).update({
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(kycId);
    } catch (error) {
      throw new Error(`Failed to reject KYC: ${error.message}`);
    }
  }

  async getPendingCount() {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('kyc')
        .where('status', '==', 'pending')
        .get();
      
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to get pending count: ${error.message}`);
    }
  }

  async getStats() {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('kyc').get();
      const stats = {
        total: 0,
        pending: 0,
        verified: 0,
        rejected: 0,
        requiresReview: 0
      };
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        stats.total++;
        if (data.status === 'pending') stats.pending++;
        else if (data.status === 'verified') stats.verified++;
        else if (data.status === 'rejected') stats.rejected++;
        else if (data.status === 'requires_review') stats.requiresReview++;
      });
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to get KYC stats: ${error.message}`);
    }
  }
}

module.exports = new KYCRepository();
module.exports.setDb = setDb;
