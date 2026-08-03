// Transaction Repository - Handles Transaction CRUD operations
const { getDb } = require('../config/database');

const COLLECTION = 'transactions';

class TransactionRepository {
  // Create transaction
  static async create(transactionData) {
    const db = getDb();
    const transactionRef = db.collection(COLLECTION).doc();
    const id = transactionRef.id;
    
    await transactionRef.set({
      id,
      status: 'pending',
      ...transactionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { id, ...transactionData };
  }
  
  // Get transaction by ID
  static async findById(id) {
    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() };
  }
  
  // Get transaction by reference
  static async findByReference(reference) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('reference', '==', reference)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  
  // Get transactions by user ID
  static async findByUserId(userId, options = {}) {
    const db = getDb();
    const {
      page = 1,
      limit = 20,
      type,
      status
    } = options;
    
    const offset = (page - 1) * limit;
    
    let query = db.collection(COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit);
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    const transactions = [];
    
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    
    // Get total count
    let countQuery = db.collection(COLLECTION)
      .where('userId', '==', userId);
    
    if (type) {
      countQuery = countQuery.where('type', '==', type);
    }
    
    if (status) {
      countQuery = countQuery.where('status', '==', status);
    }
    
    const countSnapshot = await countQuery.get();
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total: countSnapshot.size,
        pages: Math.ceil(countSnapshot.size / limit)
      }
    };
  }
  
  // Update transaction
  static async update(id, updates) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return this.findById(id);
  }
  
  // Update transaction status
  static async updateStatus(id, status) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
      completedAt: status === 'completed' || status === 'failed' ? new Date().toISOString() : null
    });
    
    return this.findById(id);
  }
  
  // Get transaction statistics for user
  static async getStats(userId) {
    const db = getDb();
    
    // Get all transactions for user
    const snapshot = await db.collection(COLLECTION)
      .where('userId', '==', userId)
      .get();
    
    let totalSent = 0;
    let totalReceived = 0;
    let totalTransactions = 0;
    let pendingTransactions = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      totalTransactions++;
      
      if (data.status === 'pending') {
        pendingTransactions++;
      }
      
      if (data.type === 'send' || data.type === 'withdrawal') {
        totalSent += data.amount || 0;
      } else if (data.type === 'receive' || data.type === 'deposit') {
        totalReceived += data.amount || 0;
      }
    });
    
    return {
      totalSent,
      totalReceived,
      totalTransactions,
      pendingTransactions
    };
  }
}

module.exports = TransactionRepository;
