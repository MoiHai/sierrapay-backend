let db = null;

const setDb = (database) => {
  db = database;
};

class TransactionRepository {
  constructor() {}

  async create(transactionData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const docRef = db.collection('transactions').doc();
      const transaction = {
        ...transactionData,
        transactionId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(transaction);
      return { id: docRef.id, ...transaction };
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  async findById(transactionId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('transactions').doc(transactionId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find transaction: ${error.message}`);
    }
  }

  async findByUserId(userId, limit = 20, offset = 0) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      // Get all transactions where user is sender OR receiver
      const transactions = [];
      
      // Get sent transactions
      const sentSnapshot = await db.collection('transactions')
        .where('senderId', '==', userId)
        .get();
      
      sentSnapshot.docs.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      // Get received transactions
      const receivedSnapshot = await db.collection('transactions')
        .where('receiverId', '==', userId)
        .get();
      
      receivedSnapshot.docs.forEach(doc => {
        // Check if already added (avoid duplicates)
        const exists = transactions.some(t => t.id === doc.id);
        if (!exists) {
          transactions.push({ id: doc.id, ...doc.data() });
        }
      });
      
      // Sort by createdAt descending
      transactions.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // Apply limit and offset
      return transactions.slice(offset, offset + limit);
    } catch (error) {
      console.error('❌ Transaction history error:', error.message);
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  async findByWalletId(walletId, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('transactions')
        .where('senderWalletId', '==', walletId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to find transactions: ${error.message}`);
    }
  }

  async updateStatus(transactionId, status) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('transactions').doc(transactionId).update({
        status: status,
        updatedAt: new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : null
      });
      return await this.findById(transactionId);
    } catch (error) {
      throw new Error(`Failed to update transaction status: ${error.message}`);
    }
  }

  async updateReceipt(transactionId, receiptUrl) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('transactions').doc(transactionId).update({
        receiptUrl: receiptUrl,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(transactionId);
    } catch (error) {
      throw new Error(`Failed to update receipt: ${error.message}`);
    }
  }

  async updateBalances(transactionId, senderBefore, senderAfter, receiverBefore, receiverAfter) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('transactions').doc(transactionId).update({
        senderBalanceBefore: senderBefore,
        senderBalanceAfter: senderAfter,
        receiverBalanceBefore: receiverBefore,
        receiverBalanceAfter: receiverAfter,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(transactionId);
    } catch (error) {
      throw new Error(`Failed to update balances: ${error.message}`);
    }
  }

  async getStats(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const sentSnapshot = await db.collection('transactions')
        .where('senderId', '==', userId)
        .where('status', '==', 'completed')
        .get();
      
      const receivedSnapshot = await db.collection('transactions')
        .where('receiverId', '==', userId)
        .where('status', '==', 'completed')
        .get();
      
      let totalSent = 0;
      let totalReceived = 0;
      let transactionCount = 0;
      
      sentSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalSent += data.amount || 0;
        transactionCount++;
      });
      
      receivedSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalReceived += data.amount || 0;
        transactionCount++;
      });
      
      return {
        totalSent,
        totalReceived,
        transactionCount,
        netBalance: totalReceived - totalSent
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

module.exports = new TransactionRepository();
module.exports.setDb = setDb;
