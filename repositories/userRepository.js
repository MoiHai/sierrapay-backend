// User Repository - Handles User CRUD operations
const { getDb } = require('../config/database');

const COLLECTION = 'users';

class UserRepository {
  // Create user
  static async create(userData) {
    const db = getDb();
    const userRef = db.collection(COLLECTION).doc();
    const id = userRef.id;
    
    await userRef.set({
      id,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { id, ...userData };
  }
  
  // Get user by ID
  static async findById(id) {
    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() };
  }
  
  // Get user by phone number
  static async findByPhone(phone) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('phoneNumber', '==', phone)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  
  // Update user
  static async update(id, updates) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return this.findById(id);
  }
  
  // Delete user (soft delete)
  static async delete(id) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      status: 'deleted',
      deletedAt: new Date().toISOString()
    });
  }
  
  // List users with pagination
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
    const users = [];
    
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    // Get total count
    const countQuery = await db.collection(COLLECTION)
      .where('status', '==', status)
      .get();
    
    return {
      users,
      pagination: {
        page,
        limit,
        total: countQuery.size,
        pages: Math.ceil(countQuery.size / limit)
      }
    };
  }
  
  // Check if user exists
  static async exists(phone) {
    const user = await this.findByPhone(phone);
    return !!user;
  }
  
  // Update last login
  static async updateLastLogin(id) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      lastLoginAt: new Date().toISOString(),
      loginCount: admin.firestore.FieldValue.increment(1)
    });
  }
}

module.exports = UserRepository;
