// OTP Repository - Handles OTP operations
const { getDb } = require('../config/database');

const COLLECTION = 'otp_verifications';

class OTPRepository {
  // Create OTP
  static async create(otpData) {
    const db = getDb();
    const otpRef = db.collection(COLLECTION).doc();
    const id = otpRef.id;
    
    await otpRef.set({
      id,
      ...otpData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return { id, ...otpData };
  }
  
  // Get OTP by phone and code
  static async findByPhoneAndCode(phone, code) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('phone', '==', phone)
      .where('code', '==', code)
      .where('isUsed', '==', false)
      .where('expiresAt', '>', new Date().toISOString())
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  
  // Get OTP by phone
  static async findByPhone(phone) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('phone', '==', phone)
      .where('isUsed', '==', false)
      .where('expiresAt', '>', new Date().toISOString())
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  
  // Mark OTP as used
  static async markAsUsed(id) {
    const db = getDb();
    await db.collection(COLLECTION).doc(id).update({
      isUsed: true,
      usedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  // Invalidate all OTPs for a phone
  static async invalidateAll(phone) {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('phone', '==', phone)
      .where('isUsed', '==', false)
      .get();
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        isUsed: true,
        usedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
  }
  
  // Delete expired OTPs
  static async deleteExpired() {
    const db = getDb();
    const snapshot = await db.collection(COLLECTION)
      .where('expiresAt', '<', new Date().toISOString())
      .get();
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
}

module.exports = OTPRepository;
