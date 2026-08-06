let db = null;

const setDb = (database) => {
  db = database;
};

class SessionRepository {
  constructor() {}

  async create(sessionData) {
    try {
      if (!db) throw new Error('Database not initialized');
      const docRef = db.collection('sessions').doc();
      const data = {
        ...sessionData,
        sessionId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(data);
      return data;
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async findByRefreshToken(refreshToken) {
    try {
      if (!db) throw new Error('Database not initialized');
      const snapshot = await db.collection('sessions')
        .where('refreshToken', '==', refreshToken)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      throw new Error(`Failed to find session: ${error.message}`);
    }
  }

  async findActiveByUserId(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const snapshot = await db.collection('sessions')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to find sessions: ${error.message}`);
    }
  }

  async invalidate(sessionId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('sessions').doc(sessionId).update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to invalidate session: ${error.message}`);
    }
  }

  async invalidateAllForUser(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const snapshot = await db.collection('sessions')
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isActive: false,
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to invalidate sessions: ${error.message}`);
    }
  }

  async updateActivity(sessionId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('sessions').doc(sessionId).update({
        lastActivityAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }
  }
}

module.exports = new SessionRepository();
module.exports.setDb = setDb;
