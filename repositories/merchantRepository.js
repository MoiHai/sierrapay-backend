// Merchant Repository - Handles Merchant CRUD operations
const { getDb } = require('../config/database');

const COLLECTION = 'merchants';

class MerchantRepository {
  // Create merchant
  static async create(merchantData) {
    const db = getDb();
    const merchantRef = db.collection(COLLECTION).doc();
    const id = merchantRef.id;
    
    await merchantRef.set({
      id,
      status: 'pending',
      ...merchantData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { id, ...merchantData };
  }
  
  // Get merchant by ID
  static async findById(id) {
    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() };
  }
  
  // Get merchant by user ID
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
  
  // Get merchant by business name
  static async findByBusinessName(businessName) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('businessName', '==', businessName)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  
  // Update merchant
  static async update(id, updates) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return this.findById(id);
  }
  
  // Update merchant status
  static async updateStatus(id, status) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
      verifiedAt: status === 'verified' ? new Date().toISOString() : null
    });
    
    return this.findById(id);
  }
  
  // List merchants
  static async list(options = {}) {
    const db = getDb();
    const {
      page = 1,
      limit = 20,
      status,
      category
    } = options;
    
    const offset = (page - 1) * limit;
    
    let query = db.collection(COLLECTION)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(limit);
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.get();
    const merchants = [];
    
    snapshot.forEach(doc => {
      merchants.push({ id: doc.id, ...doc.data() });
    });
    
    // Get total count
    let countQuery = db.collection(COLLECTION);
    
    if (status) {
      countQuery = countQuery.where('status', '==', status);
    }
    
    if (category) {
      countQuery = countQuery.where('category', '==', category);
    }
    
    const countSnapshot = await countQuery.get();
    
    return {
      merchants,
      pagination: {
        page,
        limit,
        total: countSnapshot.size,
        pages: Math.ceil(countSnapshot.size / limit)
      }
    };
  }
}

module.exports = MerchantRepository;
