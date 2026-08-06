let db = null;

const setDb = (database) => {
  db = database;
};

// Retry helper function
const retry = async (fn, retries = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Retry ${i + 1}/${retries} failed: ${error.message}`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  throw lastError;
};

class OTPRepository {
  constructor() {}

  async create(otpData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      return await retry(async () => {
        const docRef = db.collection('otp').doc();
        const data = {
          ...otpData,
          otpId: docRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isUsed: false,
          attempts: 0,
          maxAttempts: 5
        };
        await docRef.set(data);
        return this._enhanceOtp(data);
      });
    } catch (error) {
      throw new Error(`Failed to create OTP: ${error.message}`);
    }
  }

  _enhanceOtp(data) {
    return {
      ...data,
      isExpired: function() {
        return new Date() > new Date(this.expiresAt);
      },
      isValid: function() {
        return !this.isUsed && !this.isExpired();
      }
    };
  }

  async findByPhoneAndCode(phoneNumber, code) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      return await retry(async () => {
        // Get all recent OTPs for this phone number
        const snapshot = await db.collection('otp')
          .where('phoneNumber', '==', phoneNumber)
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get();
        
        if (snapshot.empty) return null;
        
        // Find the matching code that is not used and not expired
        const now = new Date();
        for (const doc of snapshot.docs) {
          const data = doc.data();
          if (data.code === code && 
              !data.isUsed && 
              new Date(data.expiresAt) > now) {
            return this._enhanceOtp({ id: doc.id, ...data });
          }
        }
        
        return null;
      });
    } catch (error) {
      // Fallback: try without orderBy if index not ready
      try {
        const snapshot = await db.collection('otp')
          .where('phoneNumber', '==', phoneNumber)
          .get();
        
        if (snapshot.empty) return null;
        
        const now = new Date();
        const docs = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        
        for (const data of docs) {
          if (data.code === code && 
              !data.isUsed && 
              new Date(data.expiresAt) > now) {
            return this._enhanceOtp(data);
          }
        }
        return null;
      } catch (fallbackError) {
        throw new Error(`Failed to find OTP: ${fallbackError.message}`);
      }
    }
  }

  async markAsUsed(otpId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await retry(async () => {
        await db.collection('otp').doc(otpId).update({
          isUsed: true,
          updatedAt: new Date().toISOString()
        });
      });
    } catch (error) {
      throw new Error(`Failed to mark OTP as used: ${error.message}`);
    }
  }

  async incrementAttempts(otpId) {
    try {
      if (!db) throw new Error('Database not initialized');
      return await retry(async () => {
        const doc = await db.collection('otp').doc(otpId).get();
        if (!doc.exists) throw new Error('OTP not found');
        
        const data = doc.data();
        const attempts = (data.attempts || 0) + 1;
        await db.collection('otp').doc(otpId).update({
          attempts: attempts,
          updatedAt: new Date().toISOString()
        });
        return attempts;
      });
    } catch (error) {
      throw new Error(`Failed to increment attempts: ${error.message}`);
    }
  }

  async deleteExpired() {
    try {
      if (!db) throw new Error('Database not initialized');
      return await retry(async () => {
        const now = new Date().toISOString();
        const snapshot = await db.collection('otp')
          .where('expiresAt', '<', now)
          .get();
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return snapshot.size;
      });
    } catch (error) {
      throw new Error(`Failed to delete expired OTPs: ${error.message}`);
    }
  }
}

module.exports = new OTPRepository();
module.exports.setDb = setDb;
