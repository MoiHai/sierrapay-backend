const { db } = require('./firebase');

class Database {
  constructor() {
    this.db = db;
  }

  getConnection() {
    return this.db;
  }

  async checkConnection() {
    try {
      await this.db.collection('_test').limit(1).get();
      return { connected: true, message: 'Firestore connected successfully' };
    } catch (error) {
      return { connected: false, message: error.message };
    }
  }

  async runTransaction(callback) {
    try {
      return await this.db.runTransaction(callback);
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  collection(name) {
    return this.db.collection(name);
  }

  doc(collectionName, docId) {
    return this.db.collection(collectionName).doc(docId);
  }
}

module.exports = new Database();
