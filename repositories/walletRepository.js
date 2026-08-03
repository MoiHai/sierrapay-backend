// Wallet Repository - Handles Wallet CRUD operations
const { getDb } = require('../config/database');

const COLLECTION = 'wallets';

class WalletRepository {
  // Create wallet
  static async create(walletData) {
    const db = getDb();
    const walletRef = db.collection(COLLECTION).doc();
    const id = walletRef.id;
    
    await walletRef.set({
      id,
      balance: 0,
      status: 'active',
      ...walletData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { id, ...walletData };
  }
  
  // Get wallet by ID
  static async findById(id) {
    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() };
  }
  
  // Get wallet by user ID
  static async findByUserId(userId) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  
  // Get wallet by wallet number
  static async findByWalletNumber(walletNumber) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('walletNumber', '==', walletNumber)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  
  // Update wallet balance
  static async updateBalance(id, newBalance) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      balance: newBalance,
      updatedAt: new Date().toISOString()
    });
    
    return this.findById(id);
  }
  
  // Update wallet
  static async update(id, updates) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return this.findById(id);
  }
  
  // Increment balance (transaction)
  static async incrementBalance(id, amount) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      balance: admin.firestore.FieldValue.increment(amount),
      updatedAt: new Date().toISOString()
    });
    
    return this.findById(id);
  }
  
  // List wallets
  static async list(options = {}) {
    const db = getDb();
    const {
      page = 1,
      limit = 20,
      status = 'active'
    } = options;
    
    const offset = (page - 1) * limit;
    
    let query = db.collection(COLLECTION)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit);
    
    const snapshot = await query.get();
    const wallets = [];
    
    snapshot.forEach(doc => {
      wallets.push({ id: doc.id, ...doc.data() });
    });
    
    const countQuery = await db.collection(COLLECTION)
      .where('status', '==', status)
      .get();
    
    return {
      wallets,
      pagination: {
        page,
        limit,
        total: countQuery.size,
        pages: Math.ceil(countQuery.size / limit)
      }
    };
  }
}

module.exports = WalletRepository;
