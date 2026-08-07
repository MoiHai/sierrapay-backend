let db = null;

const setDb = (database) => {
  db = database;
};

class BillRepository {
  constructor() {}

  async create(billData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const docRef = db.collection('bill_payments').doc();
      const data = {
        ...billData,
        billId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Failed to create bill payment: ${error.message}`);
    }
  }

  async findById(billId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('bill_payments').doc(billId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find bill payment: ${error.message}`);
    }
  }

  async findByUserId(userId, limit = 20, offset = 0) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('bill_payments')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      // Fallback without orderBy
      try {
        const snapshot = await db.collection('bill_payments')
          .where('userId', '==', userId)
          .get();
        
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return results.slice(offset, offset + limit);
      } catch (fallbackError) {
        throw new Error(`Failed to find bill payments: ${fallbackError.message}`);
      }
    }
  }

  async findByCategory(userId, category, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('bill_payments')
        .where('userId', '==', userId)
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to find bill payments: ${error.message}`);
    }
  }

  async updateStatus(billId, status, data = {}) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('bill_payments').doc(billId).update({
        status: status,
        ...data,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(billId);
    } catch (error) {
      throw new Error(`Failed to update bill status: ${error.message}`);
    }
  }

  async updatePaymentDate(billId, paymentDate) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('bill_payments').doc(billId).update({
        paymentDate: paymentDate,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(billId);
    } catch (error) {
      throw new Error(`Failed to update payment date: ${error.message}`);
    }
  }

  async getStats(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('bill_payments')
        .where('userId', '==', userId)
        .where('status', '==', 'completed')
        .get();
      
      let totalAmount = 0;
      let totalFee = 0;
      const byCategory = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalAmount += data.amount || 0;
        totalFee += data.fee || 0;
        const category = data.category || 'other';
        if (!byCategory[category]) {
          byCategory[category] = 0;
        }
        byCategory[category] += data.amount || 0;
      });
      
      return {
        totalAmount,
        totalFee,
        totalBills: snapshot.size,
        byCategory
      };
    } catch (error) {
      throw new Error(`Failed to get bill stats: ${error.message}`);
    }
  }
}

module.exports = new BillRepository();
module.exports.setDb = setDb;
