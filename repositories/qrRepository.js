let db = null;

const setDb = (database) => {
  db = database;
};

class QRRepository {
  constructor() {}

  async create(qrData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const docRef = db.collection('qr_payments').doc();
      const data = {
        ...qrData,
        qrId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Failed to create QR payment: ${error.message}`);
    }
  }

  async findById(qrId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('qr_payments').doc(qrId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find QR payment: ${error.message}`);
    }
  }

  async findByUserId(userId, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('qr_payments')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      // Fallback without orderBy
      try {
        const snapshot = await db.collection('qr_payments')
          .where('userId', '==', userId)
          .get();
        
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return results.slice(0, limit);
      } catch (fallbackError) {
        throw new Error(`Failed to find QR payments: ${fallbackError.message}`);
      }
    }
  }

  async findByQrCode(qrCode) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('qr_payments')
        .where('qrCode', '==', qrCode)
        .where('status', '==', 'pending')
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      throw new Error(`Failed to find QR by code: ${error.message}`);
    }
  }

  async updateStatus(qrId, status, data = {}) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('qr_payments').doc(qrId).update({
        status: status,
        ...data,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(qrId);
    } catch (error) {
      throw new Error(`Failed to update QR status: ${error.message}`);
    }
  }

  async markAsPaid(qrId, transactionId, scannerId, scannerWalletId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('qr_payments').doc(qrId).update({
        status: 'paid',
        transactionId: transactionId,
        scannerId: scannerId,
        scannerWalletId: scannerWalletId,
        scannedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return await this.findById(qrId);
    } catch (error) {
      throw new Error(`Failed to mark QR as paid: ${error.message}`);
    }
  }

  async markAsExpired(qrId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('qr_payments').doc(qrId).update({
        status: 'expired',
        updatedAt: new Date().toISOString()
      });
      return await this.findById(qrId);
    } catch (error) {
      throw new Error(`Failed to mark QR as expired: ${error.message}`);
    }
  }

  async deleteExpired() {
    try {
      if (!db) throw new Error('Database not initialized');
      const now = new Date().toISOString();
      const snapshot = await db.collection('qr_payments')
        .where('expiresAt', '<', now)
        .where('status', '==', 'pending')
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { status: 'expired', updatedAt: new Date().toISOString() });
      });
      await batch.commit();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to delete expired QR codes: ${error.message}`);
    }
  }
}

module.exports = new QRRepository();
module.exports.setDb = setDb;
