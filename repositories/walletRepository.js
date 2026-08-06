let db = null;

const setDb = (database) => {
  db = database;
};

class WalletRepository {
  constructor() {}

  async create(walletData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      // Generate a unique wallet number (10 digits)
      const walletNumber = this.generateWalletNumber();
      
      const wallet = {
        userId: walletData.userId,
        balance: walletData.balance || 0,
        currency: walletData.currency || 'SLL',
        walletNumber: walletNumber,
        transactions: [],
        isActive: true,
        lastTransactionAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = db.collection('wallets').doc();
      wallet.walletId = docRef.id;
      await docRef.set(wallet);
      return wallet;
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  generateWalletNumber() {
    // Generate 10-digit wallet number
    const prefix = '80';
    let number = '';
    for (let i = 0; i < 8; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return prefix + number;
  }

  async findByUserId(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const snapshot = await db.collection('wallets')
        .where('userId', '==', userId)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      throw new Error(`Failed to find wallet: ${error.message}`);
    }
  }

  async findById(walletId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('wallets').doc(walletId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find wallet: ${error.message}`);
    }
  }

  async updateBalance(walletId, newBalance) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('wallets').doc(walletId).update({
        balance: newBalance,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(walletId);
    } catch (error) {
      throw new Error(`Failed to update balance: ${error.message}`);
    }
  }

  async addTransaction(walletId, transactionId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const wallet = await this.findById(walletId);
      if (!wallet) throw new Error('Wallet not found');
      
      const transactions = wallet.transactions || [];
      transactions.push(transactionId);
      
      await db.collection('wallets').doc(walletId).update({
        transactions: transactions,
        lastTransactionAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to add transaction: ${error.message}`);
    }
  }

  async getBalance(userId) {
    try {
      const wallet = await this.findByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');
      return {
        balance: wallet.balance,
        currency: wallet.currency,
        walletNumber: wallet.walletNumber
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getTransactionHistory(userId, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      // Get wallet first
      const wallet = await this.findByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');
      
      const transactionIds = wallet.transactions || [];
      const recentIds = transactionIds.slice(-limit);
      
      if (recentIds.length === 0) {
        return [];
      }
      
      // Get transactions from Firestore
      const transactions = [];
      for (const id of recentIds.reverse()) {
        const doc = await db.collection('transactions').doc(id).get();
        if (doc.exists) {
          transactions.push({ id: doc.id, ...doc.data() });
        }
      }
      
      return transactions;
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  async deactivateWallet(walletId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('wallets').doc(walletId).update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to deactivate wallet: ${error.message}`);
    }
  }
}

module.exports = new WalletRepository();
module.exports.setDb = setDb;
