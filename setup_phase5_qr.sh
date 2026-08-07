#!/bin/bash
# SierraPay Phase 5 - QR Payments Setup Script
# Run this in Git Bash from D:\SierraPay\backend

echo "============================================"
echo "  SierraPay Phase 5 - QR Payments Setup"
echo "============================================"
echo ""

cd /d/SierraPay/backend || cd D:/SierraPay/backend

# ============================================
# 1. CREATE QR PAYMENT MODEL
# ============================================
echo "📁 Creating models/QRPayment.js..."

cat > models/QRPayment.js << 'EOF'
/**
 * QR Payment Model - Firestore Schema
 * Collection: qr_payments
 */
class QRPayment {
  constructor(data) {
    this.qrId = data.qrId || null;
    this.userId = data.userId || null;
    this.walletId = data.walletId || null;
    this.qrCode = data.qrCode || null;
    this.amount = data.amount || 0;
    this.currency = data.currency || 'SLL';
    this.type = data.type || 'generate'; // generate | scan
    this.status = data.status || 'pending'; // pending | paid | cancelled | expired
    this.description = data.description || '';
    this.scannerId = data.scannerId || null;
    this.scannerWalletId = data.scannerWalletId || null;
    this.transactionId = data.transactionId || null;
    this.expiresAt = data.expiresAt || null;
    this.scannedAt = data.scannedAt || null;
    this.completedAt = data.completedAt || null;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  isPending() {
    return this.status === 'pending';
  }

  isPaid() {
    return this.status === 'paid';
  }

  toFirestore() {
    return {
      userId: this.userId,
      walletId: this.walletId,
      qrCode: this.qrCode,
      amount: this.amount,
      currency: this.currency,
      type: this.type,
      status: this.status,
      description: this.description,
      scannerId: this.scannerId,
      scannerWalletId: this.scannerWalletId,
      transactionId: this.transactionId,
      expiresAt: this.expiresAt,
      scannedAt: this.scannedAt,
      completedAt: this.completedAt,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new QRPayment({ ...data, qrId: doc.id });
  }
}

module.exports = QRPayment;
EOF

echo "✅ models/QRPayment.js created"

# ============================================
# 2. CREATE QR REPOSITORY
# ============================================
echo ""
echo "📁 Creating repositories/qrRepository.js..."

cat > repositories/qrRepository.js << 'EOF'
let db = null;

const setDb = (database) => {
  db = database;
};

class QRRepository {
  constructor() {}

  async create(qrData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const docRef = db.collection('qr_payments').doc();
      const data = {
        ...qrData,
        qrId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Failed to create QR payment: ${error.message}`);
    }
  }

  async findById(qrId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('qr_payments').doc(qrId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find QR payment: ${error.message}`);
    }
  }

  async findByUserId(userId, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('qr_payments')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      // Fallback without orderBy
      try {
        const snapshot = await db.collection('qr_payments')
          .where('userId', '==', userId)
          .get();
        
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return results.slice(0, limit);
      } catch (fallbackError) {
        throw new Error(`Failed to find QR payments: ${fallbackError.message}`);
      }
    }
  }

  async findByQrCode(qrCode) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('qr_payments')
        .where('qrCode', '==', qrCode)
        .where('status', '==', 'pending')
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      throw new Error(`Failed to find QR by code: ${error.message}`);
    }
  }

  async updateStatus(qrId, status, data = {}) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('qr_payments').doc(qrId).update({
        status: status,
        ...data,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(qrId);
    } catch (error) {
      throw new Error(`Failed to update QR status: ${error.message}`);
    }
  }

  async markAsPaid(qrId, transactionId, scannerId, scannerWalletId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('qr_payments').doc(qrId).update({
        status: 'paid',
        transactionId: transactionId,
        scannerId: scannerId,
        scannerWalletId: scannerWalletId,
        scannedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return await this.findById(qrId);
    } catch (error) {
      throw new Error(`Failed to mark QR as paid: ${error.message}`);
    }
  }

  async markAsExpired(qrId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('qr_payments').doc(qrId).update({
        status: 'expired',
        updatedAt: new Date().toISOString()
      });
      return await this.findById(qrId);
    } catch (error) {
      throw new Error(`Failed to mark QR as expired: ${error.message}`);
    }
  }

  async deleteExpired() {
    try {
      if (!db) throw new Error('Database not initialized');
      const now = new Date().toISOString();
      const snapshot = await db.collection('qr_payments')
        .where('expiresAt', '<', now)
        .where('status', '==', 'pending')
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { status: 'expired', updatedAt: new Date().toISOString() });
      });
      await batch.commit();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to delete expired QR codes: ${error.message}`);
    }
  }
}

module.exports = new QRRepository();
module.exports.setDb = setDb;
EOF

echo "✅ repositories/qrRepository.js created"

# ============================================
# 3. CREATE QR SERVICE
# ============================================
echo ""
echo "📁 Creating services/qr/qrService.js..."

mkdir -p services/qr

cat > services/qr/qrService.js << 'EOF'
const crypto = require('crypto');
const qrRepository = require('../../repositories/qrRepository');
const walletRepository = require('../../repositories/walletRepository');
const userRepository = require('../../repositories/userRepository');
const paymentService = require('../payment/paymentService');

// Get Firestore instance
const { getFirestore } = require('../../config/firebase');

class QRService {
  // Generate QR code for payment
  async generateQR(userId, amount, description = '') {
    try {
      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Get user's wallet
      const wallet = await walletRepository.findByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check if user has sufficient balance
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Generate unique QR code
      const qrCode = this.generateQrCode();
      
      // Set expiry to 5 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      // Create QR payment record
      const qrData = {
        userId: userId,
        walletId: wallet.id,
        qrCode: qrCode,
        amount: amount,
        currency: 'SLL',
        type: 'generate',
        status: 'pending',
        description: description || `QR Payment of ${amount} SLL`,
        expiresAt: expiresAt.toISOString(),
        metadata: {
          generatedAt: new Date().toISOString()
        }
      };

      const qrPayment = await qrRepository.create(qrData);

      return {
        qrId: qrPayment.id,
        qrCode: qrPayment.qrCode,
        amount: qrPayment.amount,
        currency: qrPayment.currency,
        description: qrPayment.description,
        expiresAt: qrPayment.expiresAt,
        status: qrPayment.status,
        expiresIn: Math.floor((new Date(qrPayment.expiresAt) - new Date()) / 1000)
      };
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  // Scan QR code and process payment
  async scanQR(scannerId, qrCode, amount) {
    try {
      // Get QR payment
      const qrPayment = await qrRepository.findByQrCode(qrCode);
      
      if (!qrPayment) {
        throw new Error('Invalid QR code');
      }

      // Check if QR is expired
      if (new Date() > new Date(qrPayment.expiresAt)) {
        await qrRepository.markAsExpired(qrPayment.id);
        throw new Error('QR code has expired');
      }

      // Check if QR is already paid
      if (qrPayment.status === 'paid') {
        throw new Error('QR code has already been used');
      }

      // Check if QR is pending
      if (qrPayment.status !== 'pending') {
        throw new Error('QR code is not available');
      }

      // Get scanner's wallet
      const scannerWallet = await walletRepository.findByUserId(scannerId);
      if (!scannerWallet) {
        throw new Error('Scanner wallet not found');
      }

      // Get QR owner's info
      const qrOwner = await userRepository.findById(qrPayment.userId);
      if (!qrOwner) {
        throw new Error('QR owner not found');
      }

      // Use the amount from QR or specified amount
      const paymentAmount = amount || qrPayment.amount;

      // Process payment using payment service
      const result = await paymentService.sendMoney(
        scannerId,
        qrOwner.phoneNumber,
        paymentAmount,
        qrPayment.description || 'QR Code Payment'
      );

      // Mark QR as paid
      await qrRepository.markAsPaid(
        qrPayment.id,
        result.transactionId,
        scannerId,
        scannerWallet.id
      );

      return {
        success: true,
        qrId: qrPayment.id,
        transactionId: result.transactionId,
        amount: paymentAmount,
        currency: qrPayment.currency,
        merchantName: qrOwner.fullName || qrOwner.phoneNumber,
        merchantId: qrPayment.userId,
        description: qrPayment.description,
        reference: result.reference,
        senderBalance: result.senderBalance,
        receiverBalance: result.receiverBalance,
        completedAt: result.completedAt
      };
    } catch (error) {
      throw new Error(`Failed to scan QR code: ${error.message}`);
    }
  }

  // Get QR payment details
  async getQRPayment(qrId, userId) {
    try {
      const qrPayment = await qrRepository.findById(qrId);
      
      if (!qrPayment) {
        throw new Error('QR payment not found');
      }

      // Check if user is authorized (owner or scanner)
      if (qrPayment.userId !== userId && qrPayment.scannerId !== userId) {
        throw new Error('Unauthorized to view this QR payment');
      }

      return qrPayment;
    } catch (error) {
      throw new Error(`Failed to get QR payment: ${error.message}`);
    }
  }

  // Get user's QR payment history
  async getQRHistory(userId, limit = 20) {
    try {
      return await qrRepository.findByUserId(userId, limit);
    } catch (error) {
      throw new Error(`Failed to get QR history: ${error.message}`);
    }
  }

  // Cancel QR payment
  async cancelQR(qrId, userId) {
    try {
      const qrPayment = await qrRepository.findById(qrId);
      
      if (!qrPayment) {
        throw new Error('QR payment not found');
      }

      // Check if user is owner
      if (qrPayment.userId !== userId) {
        throw new Error('Unauthorized to cancel this QR payment');
      }

      // Check if QR is still pending
      if (qrPayment.status !== 'pending') {
        throw new Error(`Cannot cancel QR payment with status: ${qrPayment.status}`);
      }

      await qrRepository.updateStatus(qrId, 'cancelled');
      return { success: true, message: 'QR payment cancelled successfully' };
    } catch (error) {
      throw new Error(`Failed to cancel QR payment: ${error.message}`);
    }
  }

  // Generate unique QR code
  generateQrCode() {
    const prefix = 'QR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    const checksum = crypto.createHash('md5').update(prefix + timestamp + random).digest('hex').substring(0, 4).toUpperCase();
    return `${prefix}${timestamp}${random}${checksum}`;
  }
}

module.exports = new QRService();
EOF

echo "✅ services/qr/qrService.js created"

# ============================================
# 4. CREATE QR CONTROLLER
# ============================================
echo ""
echo "📁 Creating controllers/qrController.js..."

cat > controllers/qrController.js << 'EOF'
const qrService = require('../services/qr/qrService');

class QRController {
  // Generate QR code
  async generateQR(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Amount must be greater than 0'
        });
      }

      const result = await qrService.generateQR(userId, amount, description);

      res.status(200).json({
        success: true,
        message: 'QR code generated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Scan QR code
  async scanQR(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { qrCode, amount } = req.body;

      if (!qrCode) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'QR code is required'
        });
      }

      const result = await qrService.scanQR(userId, qrCode, amount);

      res.status(200).json({
        success: true,
        message: 'QR payment successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get QR payment by ID
  async getQRPayment(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { qrId } = req.params;

      const qrPayment = await qrService.getQRPayment(qrId, userId);

      res.status(200).json({
        success: true,
        data: qrPayment
      });
    } catch (error) {
      next(error);
    }
  }

  // Get QR payment history
  async getQRHistory(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const limit = parseInt(req.query.limit) || 20;

      const history = await qrService.getQRHistory(userId, limit);

      res.status(200).json({
        success: true,
        data: {
          history,
          count: history.length,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancel QR payment
  async cancelQR(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { qrId } = req.params;

      const result = await qrService.cancelQR(qrId, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QRController();
EOF

echo "✅ controllers/qrController.js created"

# ============================================
# 5. CREATE QR ROUTES
# ============================================
echo ""
echo "📁 Creating routes/qrRoutes.js..."

cat > routes/qrRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All QR routes require authentication
router.use(authMiddleware);

// Generate QR code
router.post('/generate', qrController.generateQR.bind(qrController));

// Scan QR code
router.post('/scan', qrController.scanQR.bind(qrController));

// Get QR payment by ID
router.get('/:qrId', qrController.getQRPayment.bind(qrController));

// Get QR payment history
router.get('/history', qrController.getQRHistory.bind(qrController));

// Cancel QR payment
router.delete('/:qrId', qrController.cancelQR.bind(qrController));

module.exports = router;
EOF

echo "✅ routes/qrRoutes.js created"

# ============================================
# 6. UPDATE APP.JS TO INCLUDE QR ROUTES
# ============================================
echo ""
echo "📁 Updating app.js with QR routes..."

if grep -q "qrRoutes" app.js; then
  echo "✅ QR routes already in app.js"
else
  # Insert QR routes before 404 handler
  sed -i '/\/ Transaction routes/a\
\
// QR routes\
app.use('\''/api/v1/qr'\'', require('\''./routes/qrRoutes'\''));' app.js
  
  echo "✅ QR routes added to app.js"
fi

# ============================================
# 7. UPDATE SERVER_SIMPLE.JS
# ============================================
echo ""
echo "📁 Updating server_simple.js with QR repository..."

if grep -q "qrRepository" server_simple.js; then
  echo "✅ QR repository already in server_simple.js"
else
  # Add QR repository
  sed -i '/const transactionRepo = require/,+2 a\
const qrRepo = require('\''./repositories/qrRepository'\'');\
qrRepo.setDb(db);' server_simple.js
  
  echo "✅ QR repository added to server_simple.js"
fi

# ============================================
# 8. CREATE TEST SCRIPT
# ============================================
echo ""
echo "📁 Creating test_qr.sh..."

cat > test_qr.sh << 'EOF'
#!/bin/bash
# Test script for Phase 5 - QR Payments

echo "============================================"
echo "  SierraPay Phase 5 - QR Payments Test"
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
echo "  Testing QR Payment Endpoints"
echo "============================================"

# 1. Generate QR Code
echo ""
echo "📱 Generating QR Code..."
QR_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/qr/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "description": "Payment for services"
  }')

echo $QR_RESPONSE
QR_CODE=$(echo $QR_RESPONSE | grep -o '"qrCode":"[^"]*"' | cut -d'"' -f4)
QR_ID=$(echo $QR_RESPONSE | grep -o '"qrId":"[^"]*"' | cut -d'"' -f4)

echo "QR Code: $QR_CODE"
echo "QR ID: $QR_ID"

# 2. Check wallet balance
echo ""
echo "💰 Wallet Balance:"
curl -s -X GET http://localhost:5000/api/v1/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# 3. Get QR history
echo ""
echo "📊 QR History:"
curl -s -X GET "http://localhost:5000/api/v1/qr/history?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 4. Get specific QR
if [ -n "$QR_ID" ]; then
  echo ""
  echo "📋 QR Details:"
  curl -s -X GET "http://localhost:5000/api/v1/qr/$QR_ID" \
    -H "Authorization: Bearer $TOKEN"
fi

echo ""
echo "============================================"
echo "  ✅ PHASE 5 - QR PAYMENTS READY!"
echo "============================================"
EOF

chmod +x test_qr.sh
echo "✅ test_qr.sh created"

# ============================================
# 9. CREATE SECOND USER FOR SCANNING TEST
# ============================================
echo ""
echo "📁 Creating test_qr_scan.sh..."

cat > test_qr_scan.sh << 'EOF'
#!/bin/bash
# Test script for QR scanning (requires second user)

echo "============================================"
echo "  SierraPay Phase 5 - QR Scan Test"
echo "============================================"
echo ""

echo "⚠️  This test requires a second user to scan the QR code."
echo "1. First user generates QR code"
echo "2. Second user scans and pays"
echo ""

# First user (Moi Hai) - Generate QR
echo "📱 Generating QR Code as Moi Hai..."
OTP1=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+23275335034", "purpose": "login"}' | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

RESPONSE1=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+23275335034\", \"code\": \"$OTP1\"}")

TOKEN1=$(echo $RESPONSE1 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "Generating QR..."
QR_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/qr/generate \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "description": "Test QR payment"
  }')

QR_CODE=$(echo $QR_RESPONSE | grep -o '"qrCode":"[^"]*"' | cut -d'"' -f4)
echo "QR Code: $QR_CODE"

# Second user - Scan QR
echo ""
echo "📱 Scanning QR Code as Second User..."
echo "Please register a second user first (e.g., +23276123456)"
echo "Enter the second user's phone number:"
read PHONE2

if [ -z "$PHONE2" ]; then
  echo "❌ No phone number entered. Using default: +23276123456"
  PHONE2="+23276123456"
fi

echo "Getting OTP for second user..."
OTP2=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE2\", \"purpose\": \"login\"}" | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

RESPONSE2=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"$PHONE2\", \"code\": \"$OTP2\"}")

TOKEN2=$(echo $RESPONSE2 | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "Scanning and paying..."
curl -X POST http://localhost:5000/api/v1/qr/scan \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d "{
    \"qrCode\": \"$QR_CODE\"
  }"

echo ""
echo "============================================"
echo "  ✅ QR SCAN TEST COMPLETE!"
echo "============================================"
EOF

chmod +x test_qr_scan.sh
echo "✅ test_qr_scan.sh created"

# ============================================
# 10. COMPLETION MESSAGE
# ============================================
echo ""
echo "============================================"
echo "  ✅ PHASE 5 - QR PAYMENTS COMPLETE!"
echo "============================================"
echo ""
echo "📁 Files Created:"
echo "  Models: QRPayment.js"
echo "  Repository: qrRepository.js"
echo "  Service: qrService.js"
echo "  Controller: qrController.js"
echo "  Routes: qrRoutes.js"
echo "  Tests: test_qr.sh, test_qr_scan.sh"
echo ""
echo "🔑 API Endpoints Added:"
echo "  POST   /api/v1/qr/generate    - Generate QR code"
echo "  POST   /api/v1/qr/scan        - Scan QR code"
echo "  GET    /api/v1/qr/:qrId       - Get QR payment"
echo "  GET    /api/v1/qr/history     - Get QR history"
echo "  DELETE /api/v1/qr/:qrId       - Cancel QR payment"
echo ""
echo "📋 Next Steps:"
echo "  1. Restart the server: npm run dev"
echo "  2. Run test: bash test_qr.sh"
echo "  3. For full flow: bash test_qr_scan.sh"
echo ""
echo "============================================"