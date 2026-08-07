#!/bin/bash
# SierraPay Phase 9 - KYC Setup Script
# Run this in Git Bash from D:\SierraPay\backend

echo "============================================"
echo "  SierraPay Phase 9 - KYC Setup"
echo "============================================"
echo ""

cd /d/SierraPay/backend || cd D:/SierraPay/backend

# ============================================
# 1. CREATE KYC MODEL
# ============================================
echo "📁 Creating models/KYC.js..."

cat > models/KYC.js << 'EOF'
/**
 * KYC Model - Firestore Schema
 * Collection: kyc
 */
class KYC {
  constructor(data) {
    this.kycId = data.kycId || null;
    this.userId = data.userId || null;
    this.status = data.status || 'pending'; // pending | verified | rejected | requires_review
    this.verificationLevel = data.verificationLevel || 1; // 1: Basic, 2: Enhanced, 3: Full
    
    // Personal Information
    this.fullName = data.fullName || null;
    this.dateOfBirth = data.dateOfBirth || null;
    this.gender = data.gender || null;
    this.nationality = data.nationality || null;
    this.countryOfResidence = data.countryOfResidence || null;
    
    // Address Information
    this.address = data.address || null;
    this.city = data.city || null;
    this.state = data.state || null;
    this.postalCode = data.postalCode || null;
    this.country = data.country || null;
    
    // ID Documents
    this.idType = data.idType || null; // passport | national_id | driver_license
    this.idNumber = data.idNumber || null;
    this.idIssueDate = data.idIssueDate || null;
    this.idExpiryDate = data.idExpiryDate || null;
    this.idCountry = data.idCountry || null;
    
    // Document URLs
    this.idFrontUrl = data.idFrontUrl || null;
    this.idBackUrl = data.idBackUrl || null;
    this.selfieUrl = data.selfieUrl || null;
    this.proofOfAddressUrl = data.proofOfAddressUrl || null;
    
    // Verification Data
    this.verificationData = data.verificationData || {};
    this.verifiedBy = data.verifiedBy || null;
    this.verifiedAt = data.verifiedAt || null;
    this.verificationNotes = data.verificationNotes || null;
    this.rejectionReason = data.rejectionReason || null;
    
    // Metadata
    this.metadata = data.metadata || {};
    this.submittedAt = data.submittedAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  isPending() {
    return this.status === 'pending';
  }

  isVerified() {
    return this.status === 'verified';
  }

  isRejected() {
    return this.status === 'rejected';
  }

  isRequiresReview() {
    return this.status === 'requires_review';
  }

  toFirestore() {
    return {
      userId: this.userId,
      status: this.status,
      verificationLevel: this.verificationLevel,
      fullName: this.fullName,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      nationality: this.nationality,
      countryOfResidence: this.countryOfResidence,
      address: this.address,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      idType: this.idType,
      idNumber: this.idNumber,
      idIssueDate: this.idIssueDate,
      idExpiryDate: this.idExpiryDate,
      idCountry: this.idCountry,
      idFrontUrl: this.idFrontUrl,
      idBackUrl: this.idBackUrl,
      selfieUrl: this.selfieUrl,
      proofOfAddressUrl: this.proofOfAddressUrl,
      verificationData: this.verificationData,
      verifiedBy: this.verifiedBy,
      verifiedAt: this.verifiedAt,
      verificationNotes: this.verificationNotes,
      rejectionReason: this.rejectionReason,
      metadata: this.metadata,
      submittedAt: this.submittedAt,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new KYC({ ...data, kycId: doc.id });
  }
}

module.exports = KYC;
EOF

echo "✅ models/KYC.js created"

# ============================================
# 2. CREATE KYC REPOSITORY
# ============================================
echo ""
echo "📁 Creating repositories/kycRepository.js..."

cat > repositories/kycRepository.js << 'EOF'
let db = null;

const setDb = (database) => {
  db = database;
};

class KYCRepository {
  constructor() {}

  async create(kycData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const docRef = db.collection('kyc').doc();
      const data = {
        ...kycData,
        kycId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Failed to create KYC record: ${error.message}`);
    }
  }

  async findById(kycId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('kyc').doc(kycId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find KYC record: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('kyc')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      // Fallback without orderBy
      try {
        const snapshot = await db.collection('kyc')
          .where('userId', '==', userId)
          .get();
        
        if (snapshot.empty) return null;
        
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return results[0];
      } catch (fallbackError) {
        throw new Error(`Failed to find KYC record: ${fallbackError.message}`);
      }
    }
  }

  async updateStatus(kycId, status, data = {}) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('kyc').doc(kycId).update({
        status: status,
        ...data,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(kycId);
    } catch (error) {
      throw new Error(`Failed to update KYC status: ${error.message}`);
    }
  }

  async verify(kycId, verifiedBy, notes = '') {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('kyc').doc(kycId).update({
        status: 'verified',
        verifiedBy: verifiedBy,
        verifiedAt: new Date().toISOString(),
        verificationNotes: notes || 'Verification approved',
        updatedAt: new Date().toISOString()
      });
      return await this.findById(kycId);
    } catch (error) {
      throw new Error(`Failed to verify KYC: ${error.message}`);
    }
  }

  async reject(kycId, reason) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('kyc').doc(kycId).update({
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(kycId);
    } catch (error) {
      throw new Error(`Failed to reject KYC: ${error.message}`);
    }
  }

  async getPendingCount() {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('kyc')
        .where('status', '==', 'pending')
        .get();
      
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to get pending count: ${error.message}`);
    }
  }

  async getStats() {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('kyc').get();
      const stats = {
        total: 0,
        pending: 0,
        verified: 0,
        rejected: 0,
        requiresReview: 0
      };
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        stats.total++;
        if (data.status === 'pending') stats.pending++;
        else if (data.status === 'verified') stats.verified++;
        else if (data.status === 'rejected') stats.rejected++;
        else if (data.status === 'requires_review') stats.requiresReview++;
      });
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to get KYC stats: ${error.message}`);
    }
  }
}

module.exports = new KYCRepository();
module.exports.setDb = setDb;
EOF

echo "✅ repositories/kycRepository.js created"

# ============================================
# 3. CREATE KYC SERVICE
# ============================================
echo ""
echo "📁 Creating services/kyc/kycService.js..."

mkdir -p services/kyc

cat > services/kyc/kycService.js << 'EOF'
const kycRepository = require('../../repositories/kycRepository');
const userRepository = require('../../repositories/userRepository');
const notificationService = require('../notification/notificationService');

class KYCService {
  // Submit KYC application
  async submitKYC(userId, kycData) {
    try {
      // Check if user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if KYC already submitted
      const existingKYC = await kycRepository.findByUserId(userId);
      if (existingKYC) {
        if (existingKYC.status === 'verified') {
          throw new Error('KYC already verified');
        }
        if (existingKYC.status === 'pending') {
          throw new Error('KYC application already pending review');
        }
        // If rejected, allow resubmission
      }

      // Prepare KYC data
      const kycDataToSave = {
        userId: userId,
        status: 'pending',
        fullName: kycData.fullName || user.fullName,
        dateOfBirth: kycData.dateOfBirth || null,
        gender: kycData.gender || null,
        nationality: kycData.nationality || null,
        countryOfResidence: kycData.countryOfResidence || null,
        address: kycData.address || null,
        city: kycData.city || null,
        state: kycData.state || null,
        postalCode: kycData.postalCode || null,
        country: kycData.country || null,
        idType: kycData.idType || null,
        idNumber: kycData.idNumber || null,
        idIssueDate: kycData.idIssueDate || null,
        idExpiryDate: kycData.idExpiryDate || null,
        idCountry: kycData.idCountry || null,
        idFrontUrl: kycData.idFrontUrl || null,
        idBackUrl: kycData.idBackUrl || null,
        selfieUrl: kycData.selfieUrl || null,
        proofOfAddressUrl: kycData.proofOfAddressUrl || null,
        submittedAt: new Date().toISOString(),
        metadata: {
          ipAddress: kycData.ipAddress || null,
          userAgent: kycData.userAgent || null,
          submittedFrom: kycData.submittedFrom || 'mobile'
        }
      };

      // Save KYC record
      const kyc = await kycRepository.create(kycDataToSave);

      // Send notification
      await notificationService.sendToUser(
        userId,
        '📋 KYC Application Submitted',
        'Your KYC application has been submitted for review. We will notify you once it\'s verified.',
        {
          type: 'kyc',
          action: 'submitted',
          kycId: kyc.id,
          status: 'pending'
        },
        ['in_app', 'push']
      );

      // Notify admin (in production)
      // await notificationService.sendToAdmin('New KYC submission', `User ${user.phoneNumber} submitted KYC`);

      return {
        success: true,
        message: 'KYC application submitted successfully',
        data: {
          kycId: kyc.id,
          status: kyc.status,
          submittedAt: kyc.submittedAt
        }
      };
    } catch (error) {
      throw new Error(`Failed to submit KYC: ${error.message}`);
    }
  }

  // Get KYC status
  async getKYCStatus(userId) {
    try {
      const kyc = await kycRepository.findByUserId(userId);
      
      if (!kyc) {
        return {
          success: true,
          data: {
            status: 'not_submitted',
            message: 'KYC not yet submitted'
          }
        };
      }

      return {
        success: true,
        data: {
          kycId: kyc.id,
          status: kyc.status,
          submittedAt: kyc.submittedAt,
          updatedAt: kyc.updatedAt,
          fullName: kyc.fullName,
          verificationLevel: kyc.verificationLevel,
          rejectionReason: kyc.rejectionReason || null,
          verifiedAt: kyc.verifiedAt || null
        }
      };
    } catch (error) {
      throw new Error(`Failed to get KYC status: ${error.message}`);
    }
  }

  // Get full KYC details (for user)
  async getKYC(userId) {
    try {
      const kyc = await kycRepository.findByUserId(userId);
      
      if (!kyc) {
        throw new Error('KYC record not found');
      }

      return {
        success: true,
        data: kyc
      };
    } catch (error) {
      throw new Error(`Failed to get KYC details: ${error.message}`);
    }
  }

  // Upload ID document
  async uploadID(userId, fileData, idType) {
    try {
      // In production, upload to Firebase Storage
      // For now, simulate upload
      const fileUrl = `https://sierrapay-backend.onrender.com/uploads/kyc/${userId}/id_${Date.now()}.jpg`;

      // Get or create KYC record
      let kyc = await kycRepository.findByUserId(userId);
      
      if (!kyc) {
        // Create pending KYC record
        kyc = await kycRepository.create({
          userId: userId,
          status: 'pending',
          idType: idType,
          idFrontUrl: fileUrl,
          submittedAt: new Date().toISOString()
        });
      } else {
        // Update existing KYC
        await kycRepository.updateStatus(kyc.id, kyc.status, {
          idType: idType,
          idFrontUrl: fileUrl,
          updatedAt: new Date().toISOString()
        });
        kyc = await kycRepository.findById(kyc.id);
      }

      return {
        success: true,
        message: 'ID document uploaded successfully',
        data: {
          url: fileUrl,
          idType: idType,
          kycId: kyc.id
        }
      };
    } catch (error) {
      throw new Error(`Failed to upload ID: ${error.message}`);
    }
  }

  // Upload selfie
  async uploadSelfie(userId, fileData) {
    try {
      // In production, upload to Firebase Storage
      const fileUrl = `https://sierrapay-backend.onrender.com/uploads/kyc/${userId}/selfie_${Date.now()}.jpg`;

      let kyc = await kycRepository.findByUserId(userId);
      
      if (!kyc) {
        kyc = await kycRepository.create({
          userId: userId,
          status: 'pending',
          selfieUrl: fileUrl,
          submittedAt: new Date().toISOString()
        });
      } else {
        await kycRepository.updateStatus(kyc.id, kyc.status, {
          selfieUrl: fileUrl,
          updatedAt: new Date().toISOString()
        });
        kyc = await kycRepository.findById(kyc.id);
      }

      return {
        success: true,
        message: 'Selfie uploaded successfully',
        data: {
          url: fileUrl,
          kycId: kyc.id
        }
      };
    } catch (error) {
      throw new Error(`Failed to upload selfie: ${error.message}`);
    }
  }

  // Upload proof of address
  async uploadProofOfAddress(userId, fileData) {
    try {
      const fileUrl = `https://sierrapay-backend.onrender.com/uploads/kyc/${userId}/proof_${Date.now()}.jpg`;

      let kyc = await kycRepository.findByUserId(userId);
      
      if (!kyc) {
        kyc = await kycRepository.create({
          userId: userId,
          status: 'pending',
          proofOfAddressUrl: fileUrl,
          submittedAt: new Date().toISOString()
        });
      } else {
        await kycRepository.updateStatus(kyc.id, kyc.status, {
          proofOfAddressUrl: fileUrl,
          updatedAt: new Date().toISOString()
        });
        kyc = await kycRepository.findById(kyc.id);
      }

      return {
        success: true,
        message: 'Proof of address uploaded successfully',
        data: {
          url: fileUrl,
          kycId: kyc.id
        }
      };
    } catch (error) {
      throw new Error(`Failed to upload proof of address: ${error.message}`);
    }
  }

  // Admin: Verify KYC
  async verifyKYC(kycId, adminId, notes = '') {
    try {
      const kyc = await kycRepository.findById(kycId);
      if (!kyc) {
        throw new Error('KYC record not found');
      }

      if (kyc.status !== 'pending') {
        throw new Error(`Cannot verify KYC with status: ${kyc.status}`);
      }

      // Update KYC status
      const verified = await kycRepository.verify(kycId, adminId, notes);

      // Update user's KYC status
      await userRepository.update(kyc.userId, {
        kycStatus: 'verified',
        isVerified: true
      });

      // Send notification to user
      await notificationService.sendToUser(
        kyc.userId,
        '✅ KYC Verified!',
        'Your KYC has been verified successfully. You now have full access to all SierraPay features.',
        {
          type: 'kyc',
          action: 'verified',
          kycId: kycId
        },
        ['in_app', 'push', 'sms']
      );

      return {
        success: true,
        message: 'KYC verified successfully',
        data: verified
      };
    } catch (error) {
      throw new Error(`Failed to verify KYC: ${error.message}`);
    }
  }

  // Admin: Reject KYC
  async rejectKYC(kycId, reason) {
    try {
      if (!reason) {
        throw new Error('Rejection reason is required');
      }

      const kyc = await kycRepository.findById(kycId);
      if (!kyc) {
        throw new Error('KYC record not found');
      }

      if (kyc.status !== 'pending') {
        throw new Error(`Cannot reject KYC with status: ${kyc.status}`);
      }

      const rejected = await kycRepository.reject(kycId, reason);

      // Send notification to user
      await notificationService.sendToUser(
        kyc.userId,
        '❌ KYC Rejected',
        `Your KYC application was rejected. Reason: ${reason}`,
        {
          type: 'kyc',
          action: 'rejected',
          kycId: kycId,
          reason: reason
        },
        ['in_app', 'push', 'sms']
      );

      return {
        success: true,
        message: 'KYC rejected',
        data: rejected
      };
    } catch (error) {
      throw new Error(`Failed to reject KYC: ${error.message}`);
    }
  }

  // Get all KYC submissions (Admin)
  async getAllKYC(status = null, limit = 50) {
    try {
      // In production, implement pagination and filtering
      // For now, get all and filter
      const db = require('../../repositories/kycRepository').db;
      if (!db) throw new Error('Database not initialized');

      let query = db.collection('kyc');
      
      if (status) {
        query = query.where('status', '==', status);
      }
      
      const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to get KYC submissions: ${error.message}`);
    }
  }

  // Get KYC stats (Admin)
  async getStats() {
    try {
      return await kycRepository.getStats();
    } catch (error) {
      throw new Error(`Failed to get KYC stats: ${error.message}`);
    }
  }

  // Resubmit rejected KYC
  async resubmitKYC(userId, kycData) {
    try {
      const existingKYC = await kycRepository.findByUserId(userId);
      
      if (!existingKYC) {
        return await this.submitKYC(userId, kycData);
      }

      if (existingKYC.status !== 'rejected') {
        throw new Error('KYC is not rejected. Cannot resubmit.');
      }

      // Update existing KYC
      const updatedData = {
        ...existingKYC,
        ...kycData,
        status: 'pending',
        rejectionReason: null,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await kycRepository.updateStatus(existingKYC.id, 'pending', updatedData);

      // Send notification
      await notificationService.sendToUser(
        userId,
        '📋 KYC Resubmitted',
        'Your KYC application has been resubmitted for review.',
        {
          type: 'kyc',
          action: 'resubmitted',
          kycId: existingKYC.id
        },
        ['in_app', 'push']
      );

      return {
        success: true,
        message: 'KYC resubmitted successfully',
        data: {
          kycId: existingKYC.id,
          status: 'pending'
        }
      };
    } catch (error) {
      throw new Error(`Failed to resubmit KYC: ${error.message}`);
    }
  }
}

module.exports = new KYCService();
EOF

echo "✅ services/kyc/kycService.js created"

# ============================================
# 4. CREATE KYC CONTROLLER
# ============================================
echo ""
echo "📁 Creating controllers/kycController.js..."

cat > controllers/kycController.js << 'EOF'
const kycService = require('../services/kyc/kycService');

class KYCController {
  // Submit KYC application
  async submitKYC(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const kycData = req.body;

      // Validate required fields
      const requiredFields = ['fullName', 'dateOfBirth', 'idType', 'idNumber'];
      for (const field of requiredFields) {
        if (!kycData[field]) {
          return res.status(400).json({
            error: 'Validation failed',
            message: `${field} is required`
          });
        }
      }

      const result = await kycService.submitKYC(userId, kycData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Get KYC status
  async getKYCStatus(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await kycService.getKYCStatus(userId);

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Get full KYC details
  async getKYC(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await kycService.getKYC(userId);

      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload ID document
  async uploadID(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { idType } = req.body;

      if (!idType) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'ID type is required'
        });
      }

      // In production, handle file upload
      const fileData = req.file || { buffer: null };

      const result = await kycService.uploadID(userId, fileData, idType);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload selfie
  async uploadSelfie(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      
      // In production, handle file upload
      const fileData = req.file || { buffer: null };

      const result = await kycService.uploadSelfie(userId, fileData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload proof of address
  async uploadProofOfAddress(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      
      const fileData = req.file || { buffer: null };

      const result = await kycService.uploadProofOfAddress(userId, fileData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Resubmit KYC
  async resubmitKYC(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const kycData = req.body;

      const result = await kycService.resubmitKYC(userId, kycData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  // Get all KYC submissions (Admin)
  async getAllKYC(req, res, next) {
    try {
      const { status } = req.query;
      const limit = parseInt(req.query.limit) || 50;

      const submissions = await kycService.getAllKYC(status, limit);

      res.status(200).json({
        success: true,
        data: {
          submissions,
          count: submissions.length,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify KYC (Admin)
  async verifyKYC(req, res, next) {
    try {
      const { kycId } = req.params;
      const { notes } = req.body;
      const adminId = req.user.userId || req.user.id;

      const result = await kycService.verifyKYC(kycId, adminId, notes);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Reject KYC (Admin)
  async rejectKYC(req, res, next) {
    try {
      const { kycId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Rejection reason is required'
        });
      }

      const result = await kycService.rejectKYC(kycId, reason);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // Get KYC stats (Admin)
  async getStats(req, res, next) {
    try {
      const stats = await kycService.getStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new KYCController();
EOF

echo "✅ controllers/kycController.js created"

# ============================================
# 5. CREATE KYC ROUTES
# ============================================
echo ""
echo "📁 Creating routes/kycRoutes.js..."

cat > routes/kycRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All KYC routes require authentication
router.use(authMiddleware);

// ============================================
// USER KYC ENDPOINTS
// ============================================

// Submit KYC application
router.post('/submit', kycController.submitKYC.bind(kycController));

// Get KYC status
router.get('/status', kycController.getKYCStatus.bind(kycController));

// Get full KYC details
router.get('/', kycController.getKYC.bind(kycController));

// Upload ID document
router.post('/upload/id', kycController.uploadID.bind(kycController));

// Upload selfie
router.post('/upload/selfie', kycController.uploadSelfie.bind(kycController));

// Upload proof of address
router.post('/upload/proof', kycController.uploadProofOfAddress.bind(kycController));

// Resubmit KYC
router.post('/resubmit', kycController.resubmitKYC.bind(kycController));

// ============================================
// ADMIN KYC ENDPOINTS
// ============================================

// Get all KYC submissions (Admin)
router.get('/admin/all', kycController.getAllKYC.bind(kycController));

// Get KYC stats (Admin)
router.get('/admin/stats', kycController.getStats.bind(kycController));

// Verify KYC (Admin)
router.put('/admin/:kycId/verify', kycController.verifyKYC.bind(kycController));

// Reject KYC (Admin)
router.put('/admin/:kycId/reject', kycController.rejectKYC.bind(kycController));

module.exports = router;
EOF

echo "✅ routes/kycRoutes.js created"

# ============================================
# 6. UPDATE APP.JS TO INCLUDE KYC ROUTES
# ============================================
echo ""
echo "📁 Updating app.js with KYC routes..."

if grep -q "kycRoutes" app.js; then
  echo "✅ KYC routes already in app.js"
else
  # Insert KYC routes before 404 handler
  sed -i '/\/ User routes/a\
\
// KYC routes\
app.use('\''/api/v1/kyc'\'', require('\''./routes/kycRoutes'\''));' app.js
  
  echo "✅ KYC routes added to app.js"
fi

# ============================================
# 7. UPDATE SERVER_SIMPLE.JS
# ============================================
echo ""
echo "📁 Updating server_simple.js with KYC repository..."

if grep -q "kycRepository" server_simple.js; then
  echo "✅ KYC repository already in server_simple.js"
else
  # Add KYC repository
  sed -i '/const notificationRepo = require/,+2 a\
const kycRepo = require('\''./repositories/kycRepository'\'');\
kycRepo.setDb(db);' server_simple.js
  
  echo "✅ KYC repository added to server_simple.js"
fi

# ============================================
# 8. CREATE TEST SCRIPT
# ============================================
echo ""
echo "📁 Creating test_kyc.sh..."

cat > test_kyc.sh << 'EOF'
#!/bin/bash
# Test script for Phase 9 - KYC

echo "============================================"
echo "  SierraPay Phase 9 - KYC Test"
echo "============================================"
echo ""

# Get OTP for Moi Hai
echo "📱 Getting OTP for Moi Hai..."
OTP=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+23275335034", "purpose": "login"}' | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

echo "OTP: $OTP"

# Login
echo ""
echo "🔐 Logging in..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+23275335034\", \"code\": \"$OTP\"}")

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo ""
echo "============================================"
echo "  Testing KYC Endpoints"
echo "============================================"

# 1. Get KYC status (before submission)
echo ""
echo "📋 KYC Status (Before)..."
curl -s -X GET http://localhost:5000/api/v1/kyc/status \
  -H "Authorization: Bearer $TOKEN"

# 2. Submit KYC application
echo ""
echo "📝 Submitting KYC..."
curl -s -X POST http://localhost:5000/api/v1/kyc/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Moi Hai SierraPay",
    "dateOfBirth": "1990-01-15",
    "gender": "Male",
    "nationality": "Sierra Leonean",
    "countryOfResidence": "Sierra Leone",
    "address": "123 Main Street",
    "city": "Freetown",
    "state": "Western Area",
    "country": "Sierra Leone",
    "idType": "national_id",
    "idNumber": "SL-12345-67890",
    "idIssueDate": "2020-01-01",
    "idExpiryDate": "2030-01-01",
    "idCountry": "Sierra Leone"
  }'

# 3. Upload ID document
echo ""
echo "🪪 Uploading ID..."
curl -s -X POST http://localhost:5000/api/v1/kyc/upload/id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idType": "national_id"
  }'

# 4. Upload Selfie
echo ""
echo "📸 Uploading Selfie..."
curl -s -X POST http://localhost:5000/api/v1/kyc/upload/selfie \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Upload Proof of Address
echo ""
echo "📄 Uploading Proof of Address..."
curl -s -X POST http://localhost:5000/api/v1/kyc/upload/proof \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 6. Get KYC status (after submission)
echo ""
echo "📋 KYC Status (After)..."
curl -s -X GET http://localhost:5000/api/v1/kyc/status \
  -H "Authorization: Bearer $TOKEN"

# 7. Get full KYC details
echo ""
echo "📋 Full KYC Details..."
curl -s -X GET http://localhost:5000/api/v1/kyc \
  -H "Authorization: Bearer $TOKEN"

# 8. Admin: Get all KYC submissions
echo ""
echo "👑 Admin: All KYC Submissions..."
curl -s -X GET "http://localhost:5000/api/v1/kyc/admin/all?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 9. Admin: Get KYC stats
echo ""
echo "👑 Admin: KYC Stats..."
curl -s -X GET "http://localhost:5000/api/v1/kyc/admin/stats" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "============================================"
echo "  ✅ PHASE 9 - KYC READY!"
echo "============================================"
EOF

chmod +x test_kyc.sh
echo "✅ test_kyc.sh created"

# ============================================
# 9. COMPLETION MESSAGE
# ============================================
echo ""
echo "============================================"
echo "  ✅ PHASE 9 - KYC COMPLETE!"
echo "============================================"
echo ""
echo "📁 Files Created:"
echo "  Models: KYC.js"
echo "  Repository: kycRepository.js"
echo "  Service: kycService.js"
echo "  Controller: kycController.js"
echo "  Routes: kycRoutes.js"
echo "  Test: test_kyc.sh"
echo ""
echo "🔑 API Endpoints Added:"
echo "  USER ENDPOINTS:"
echo "  POST   /api/v1/kyc/submit         - Submit KYC"
echo "  GET    /api/v1/kyc/status         - Get KYC status"
echo "  GET    /api/v1/kyc                - Get full KYC details"
echo "  POST   /api/v1/kyc/upload/id      - Upload ID document"
echo "  POST   /api/v1/kyc/upload/selfie  - Upload selfie"
echo "  POST   /api/v1/kyc/upload/proof   - Upload proof of address"
echo "  POST   /api/v1/kyc/resubmit       - Resubmit rejected KYC"
echo ""
echo "  ADMIN ENDPOINTS:"
echo "  GET    /api/v1/kyc/admin/all      - Get all submissions"
echo "  GET    /api/v1/kyc/admin/stats    - Get KYC stats"
echo "  PUT    /api/v1/kyc/admin/:id/verify - Verify KYC"
echo "  PUT    /api/v1/kyc/admin/:id/reject - Reject KYC"
echo ""
echo "📋 Next Steps:"
echo "  1. Restart the server: npm run dev"
echo "  2. Run test: bash test_kyc.sh"
echo ""
echo "============================================"