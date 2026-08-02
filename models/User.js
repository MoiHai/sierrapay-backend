const db = require('../config/database'); // This imports your new firebase setup

// Instead of a Mongoose Schema, we define a helper class to interact with Firestore
class User {
  constructor() {
    this.collection = db.collection('users');
  }

  // Example: Create a new user
  async create(userData) {
    const docRef = this.collection.doc(); // Auto-generate ID
    await docRef.set({
      ...userData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...userData };
  }

  // Example: Find a user by email (used in login/auth)
  async findByEmail(email) {
    const snapshot = await this.collection.where('email', '==', email).get();
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  // Example: Find a user by ID
  async findById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = new User();