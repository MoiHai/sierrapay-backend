#!/bin/bash
# SierraPay Phase 4 - Transactions Setup Script
# Run this in Git Bash from D:\SierraPay\backend

echo "============================================"
echo "  SierraPay Phase 4 - Transactions Setup"
echo "============================================"
echo ""

cd /d/SierraPay/backend || cd D:/SierraPay/backend

# ============================================
# 1. CREATE TRANSACTION MODEL
# ============================================
echo "📁 Creating models/Transaction.js..."

cat > models/Transaction.js << 'EOF'
/**
 * Transaction Model - Firestore Schema
 * Collection: transactions
 */
class Transaction {
  constructor(data) {
    this.transactionId = data.transactionId || null;
    this.senderId = data.senderId || null;
    this.receiverId = data.receiverId || null;
    this.senderWalletId = data.senderWalletId || null;
    this.receiverWalletId = data.receiverWalletId || null;
    this.amount = data.amount || 0;
    this.currency = data.currency || 'SLL';
    this.type = data.type || 'send'; // send | receive | qr_payment | bill_payment | deposit | withdraw
    this.status = data.status || 'pending'; // pending | processing | completed | failed | refunded
    this.description = data.description || '';
    this.reference = data.reference || null;
    this.metadata = data.metadata || {};
    this.receiptUrl = data.receiptUrl || null;
    this.senderBalanceBefore = data.senderBalanceBefore || null;
    this.senderBalanceAfter = data.senderBalanceAfter || null;
    this.receiverBalanceBefore = data.receiverBalanceBefore || null;
    this.receiverBalanceAfter = data.receiverBalanceAfter || null;
    this.completedAt = data.completedAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toFirestore() {
    return {
      senderId: this.senderId,
      receiverId: this.receiverId,
      senderWalletId: this.senderWalletId,
      receiverWalletId: this.receiverWalletId,
      amount: this.amount,
      currency: this.currency,
      type: this.type,
      status: this.status,
      description: this.description,
      reference: this.reference,
      metadata: this.metadata,
      receiptUrl: this.receiptUrl,
      senderBalanceBefore: this.senderBalanceBefore,
      senderBalanceAfter: this.senderBalanceAfter,
      receiverBalanceBefore: this.receiverBalanceBefore,
      receiverBalanceAfter: this.receiverBalanceAfter,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Transaction({ ...data, transactionId: doc.id });
  }

  // Helper methods
  isCompleted() {
    return this.status === 'completed';
  }

  isPending() {
    return this.status === 'pending';
  }

  isFailed() {
    return this.status === 'failed';
  }

  generateReceipt() {
    return {
      transactionId: this.transactionId,
      amount: this.amount,
      currency: this.currency,
      type: this.type,
      status: this.status,
      description: this.description,
      reference: this.reference,
      senderId: this.senderId,
      receiverId: this.receiverId,
      completedAt: this.completedAt || this.createdAt,
      createdAt: this.createdAt
    };
  }
}

module.exports = Transaction;
EOF

echo "✅ models/Transaction.js created"

# ============================================
# 2. CREATE TRANSACTION REPOSITORY
# ============================================
echo ""
echo "📁 Creating repositories/transactionRepository.js..."

cat > repositories/transactionRepository.js << 'EOF'
let db = null;

const setDb = (database) => {
  db = database;
};

class TransactionRepository {
  constructor() {}

  async create(transactionData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const docRef = db.collection('transactions').doc();
      const transaction = {
        ...transactionData,
        transactionId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(transaction);
      return { id: docRef.id, ...transaction };
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  async findById(transactionId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('transactions').doc(transactionId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find transaction: ${error.message}`);
    }
  }

  async findByUserId(userId, limit = 20, offset = 0) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      // Get transactions where user is sender or receiver
      const senderQuery = db.collection('transactions')
        .where('senderId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      const receiverQuery = db.collection('transactions')
        .where('receiverId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      const [senderSnapshot, receiverSnapshot] = await Promise.all([
        senderQuery.get(),
        receiverQuery.get()
      ]);
      
      // Combine and deduplicate
      const transactions = [];
      const seen = new Set();
      
      senderSnapshot.docs.forEach(doc => {
        const id = doc.id;
        if (!seen.has(id)) {
          seen.add(id);
          transactions.push({ id, ...doc.data() });
        }
      });
      
      receiverSnapshot.docs.forEach(doc => {
        const id = doc.id;
        if (!seen.has(id)) {
          seen.add(id);
          transactions.push({ id, ...doc.data() });
        }
      });
      
      // Sort by createdAt desc
      transactions.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // Apply offset
      return transactions.slice(offset, offset + limit);
    } catch (error) {
      // Fallback: query without orderBy if index not ready
      try {
        const allSender = await db.collection('transactions')
          .where('senderId', '==', userId)
          .get();
        const allReceiver = await db.collection('transactions')
          .where('receiverId', '==', userId)
          .get();
        
        const transactions = [];
        const seen = new Set();
        
        allSender.docs.forEach(doc => {
          const id = doc.id;
          if (!seen.has(id)) {
            seen.add(id);
            transactions.push({ id, ...doc.data() });
          }
        });
        
        allReceiver.docs.forEach(doc => {
          const id = doc.id;
          if (!seen.has(id)) {
            seen.add(id);
            transactions.push({ id, ...doc.data() });
          }
        });
        
        transactions.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        return transactions.slice(offset, offset + limit);
      } catch (fallbackError) {
        throw new Error(`Failed to find transactions: ${fallbackError.message}`);
      }
    }
  }

  async findByWalletId(walletId, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('transactions')
        .where('senderWalletId', '==', walletId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to find transactions: ${error.message}`);
    }
  }

  async updateStatus(transactionId, status) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('transactions').doc(transactionId).update({
        status: status,
        updatedAt: new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : null
      });
      return await this.findById(transactionId);
    } catch (error) {
      throw new Error(`Failed to update transaction status: ${error.message}`);
    }
  }

  async updateReceipt(transactionId, receiptUrl) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('transactions').doc(transactionId).update({
        receiptUrl: receiptUrl,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(transactionId);
    } catch (error) {
      throw new Error(`Failed to update receipt: ${error.message}`);
    }
  }

  async updateBalances(transactionId, senderBefore, senderAfter, receiverBefore, receiverAfter) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('transactions').doc(transactionId).update({
        senderBalanceBefore: senderBefore,
        senderBalanceAfter: senderAfter,
        receiverBalanceBefore: receiverBefore,
        receiverBalanceAfter: receiverAfter,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(transactionId);
    } catch (error) {
      throw new Error(`Failed to update balances: ${error.message}`);
    }
  }

  async getStats(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const sentSnapshot = await db.collection('transactions')
        .where('senderId', '==', userId)
        .where('status', '==', 'completed')
        .get();
      
      const receivedSnapshot = await db.collection('transactions')
        .where('receiverId', '==', userId)
        .where('status', '==', 'completed')
        .get();
      
      let totalSent = 0;
      let totalReceived = 0;
      let transactionCount = 0;
      
      sentSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalSent += data.amount || 0;
        transactionCount++;
      });
      
      receivedSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalReceived += data.amount || 0;
        transactionCount++;
      });
      
      return {
        totalSent,
        totalReceived,
        transactionCount,
        netBalance: totalReceived - totalSent
      };
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

module.exports = new TransactionRepository();
module.exports.setDb = setDb;
EOF

echo "✅ repositories/transactionRepository.js created"

# ============================================
# 3. CREATE PAYMENT SERVICE
# ============================================
echo ""
echo "📁 Creating services/payment/paymentService.js..."

mkdir -p services/payment

cat > services/payment/paymentService.js << 'EOF'
const transactionRepository = require('../../repositories/transactionRepository');
const walletRepository = require('../../repositories/walletRepository');
const userRepository = require('../../repositories/userRepository');

class PaymentService {
  // Send money from one user to another
  async sendMoney(senderId, receiverPhone, amount, description = '') {
    try {
      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Get sender wallet
      const senderWallet = await walletRepository.findByUserId(senderId);
      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }

      // Check sufficient balance
      if (senderWallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Get receiver user
      const receiver = await userRepository.findByPhone(receiverPhone);
      if (!receiver) {
        throw new Error('Receiver not found');
      }

      // Prevent sending to self
      if (receiver.id === senderId) {
        throw new Error('Cannot send money to yourself');
      }

      // Get receiver wallet
      const receiverWallet = await walletRepository.findByUserId(receiver.id);
      if (!receiverWallet) {
        throw new Error('Receiver wallet not found');
      }

      // Start Firestore transaction
      const db = require('../../repositories/walletRepository').db || require('../../config/firebase').db;
      
      // Use runTransaction for atomic operation
      return await db.runTransaction(async (transaction) => {
        // Get fresh wallet data
        const senderRef = db.collection('wallets').doc(senderWallet.id);
        const receiverRef = db.collection('wallets').doc(receiverWallet.id);
        
        const senderDoc = await transaction.get(senderRef);
        const receiverDoc = await transaction.get(receiverRef);
        
        const senderData = senderDoc.data();
        const receiverData = receiverDoc.data();
        
        // Double-check balance
        if (senderData.balance < amount) {
          throw new Error('Insufficient balance');
        }

        // Calculate new balances
        const senderNewBalance = senderData.balance - amount;
        const receiverNewBalance = (receiverData.balance || 0) + amount;

        // Update wallets
        transaction.update(senderRef, {
          balance: senderNewBalance,
          lastTransactionAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        transaction.update(receiverRef, {
          balance: receiverNewBalance,
          lastTransactionAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Generate reference
        const reference = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        // Create transaction record
        const transactionRef = db.collection('transactions').doc();
        const transactionData = {
          senderId: senderId,
          receiverId: receiver.id,
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet.id,
          amount: amount,
          currency: 'SLL',
          type: 'send',
          status: 'completed',
          description: description || `Transfer to ${receiver.phoneNumber}`,
          reference: reference,
          senderBalanceBefore: senderData.balance,
          senderBalanceAfter: senderNewBalance,
          receiverBalanceBefore: receiverData.balance || 0,
          receiverBalanceAfter: receiverNewBalance,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            senderPhone: senderWallet.phoneNumber || null,
            receiverPhone: receiver.phoneNumber
          }
        };

        transaction.set(transactionRef, transactionData);

        // Add transaction to wallet transactions arrays
        const senderWalletRef = db.collection('wallets').doc(senderWallet.id);
        const receiverWalletRef = db.collection('wallets').doc(receiverWallet.id);

        const senderWalletDoc = await transaction.get(senderWalletRef);
        const receiverWalletDoc = await transaction.get(receiverWalletRef);

        const senderTransactions = senderWalletDoc.data().transactions || [];
        const receiverTransactions = receiverWalletDoc.data().transactions || [];

        senderTransactions.push(transactionRef.id);
        receiverTransactions.push(transactionRef.id);

        transaction.update(senderWalletRef, { transactions: senderTransactions });
        transaction.update(receiverWalletRef, { transactions: receiverTransactions });

        return {
          success: true,
          transactionId: transactionRef.id,
          reference: reference,
          amount: amount,
          senderBalance: senderNewBalance,
          receiverBalance: receiverNewBalance,
          receiverName: receiver.fullName || receiver.phoneNumber,
          completedAt: new Date().toISOString()
        };
      });
    } catch (error) {
      throw new Error(`Send money failed: ${error.message}`);
    }
  }

  // Get transaction by ID
  async getTransaction(transactionId, userId) {
    try {
      const transaction = await transactionRepository.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify user is involved in transaction
      if (transaction.senderId !== userId && transaction.receiverId !== userId) {
        throw new Error('Unauthorized to view this transaction');
      }

      return transaction;
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  // Get user's transaction history
  async getTransactionHistory(userId, limit = 20, offset = 0) {
    try {
      return await transactionRepository.findByUserId(userId, limit, offset);
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  // Get transaction receipt
  async getReceipt(transactionId, userId) {
    try {
      const transaction = await this.getTransaction(transactionId, userId);
      
      // Generate receipt
      const receipt = {
        transactionId: transaction.id,
        transactionId: transaction.transactionId || transaction.id,
        amount: transaction.amount,
        currency: transaction.currency || 'SLL',
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        reference: transaction.reference,
        senderId: transaction.senderId,
        receiverId: transaction.receiverId,
        senderBalanceBefore: transaction.senderBalanceBefore,
        senderBalanceAfter: transaction.senderBalanceAfter,
        receiverBalanceBefore: transaction.receiverBalanceBefore,
        receiverBalanceAfter: transaction.receiverBalanceAfter,
        completedAt: transaction.completedAt || transaction.createdAt,
        createdAt: transaction.createdAt
      };

      return receipt;
    } catch (error) {
      throw new Error(`Failed to get receipt: ${error.message}`);
    }
  }

  // Get transaction stats for user
  async getStats(userId) {
    try {
      return await transactionRepository.getStats(userId);
    } catch (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
EOF

echo "✅ services/payment/paymentService.js created"

# ============================================
# 4. CREATE TRANSACTION CONTROLLER
# ============================================
echo ""
echo "📁 Creating controllers/transactionController.js..."

cat > controllers/transactionController.js << 'EOF'
const paymentService = require('../services/payment/paymentService');

class TransactionController {
  // Send money
  async sendMoney(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { receiverPhone, amount, description } = req.body;

      // Validate input
      if (!receiverPhone) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Receiver phone number is required'
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Amount must be greater than 0'
        });
      }

      const result = await paymentService.sendMoney(
        userId,
        receiverPhone,
        amount,
        description
      );

      res.status(200).json({
        success: true,
        message: 'Money sent successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction by ID
  async getTransaction(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { transactionId } = req.params;

      const transaction = await paymentService.getTransaction(transactionId, userId);

      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction history
  async getTransactionHistory(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const transactions = await paymentService.getTransactionHistory(
        userId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: {
          transactions,
          count: transactions.length,
          limit,
          offset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction receipt
  async getReceipt(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { transactionId } = req.params;

      const receipt = await paymentService.getReceipt(transactionId, userId);

      res.status(200).json({
        success: true,
        data: receipt
      });
    } catch (error) {
      next(error);
    }
  }

  // Get transaction stats
  async getStats(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;

      const stats = await paymentService.getStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
EOF

echo "✅ controllers/transactionController.js created"

# ============================================
# 5. CREATE TRANSACTION ROUTES
# ============================================
echo ""
echo "📁 Creating routes/transactionRoutes.js..."

cat > routes/transactionRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All transaction routes require authentication
router.use(authMiddleware);

// Send money
router.post('/send', transactionController.sendMoney.bind(transactionController));

// Get transaction by ID
router.get('/:transactionId', transactionController.getTransaction.bind(transactionController));

// Get transaction history
router.get('/history', transactionController.getTransactionHistory.bind(transactionController));

// Get transaction receipt
router.get('/:transactionId/receipt', transactionController.getReceipt.bind(transactionController));

// Get transaction stats
router.get('/stats/summary', transactionController.getStats.bind(transactionController));

module.exports = router;
EOF

echo "✅ routes/transactionRoutes.js created"

# ============================================
# 6. UPDATE APP.JS TO INCLUDE TRANSACTION ROUTES
# ============================================
echo ""
echo "📁 Updating app.js with transaction routes..."

# Check if transaction routes are already in app.js
if grep -q "transactionRoutes" app.js; then
  echo "✅ Transaction routes already in app.js"
else
  # Insert transaction routes before 404 handler
  sed -i '/\/ Wallet routes/a\
\
// Transaction routes\
app.use('\''/api/v1/transactions'\'', require('\''./routes/transactionRoutes'\''));' app.js
  
  echo "✅ Transaction routes added to app.js"
fi

# ============================================
# 7. UPDATE SERVER_SIMPLE.JS
# ============================================
echo ""
echo "📁 Updating server_simple.js with transaction repository..."

# Check if transaction repository is already in server_simple.js
if grep -q "transactionRepository" server_simple.js; then
  echo "✅ Transaction repository already in server_simple.js"
else
  # Add transaction repository
  sed -i '/const walletRepo = require/,+2 a\
const transactionRepo = require('\''./repositories/transactionRepository'\'');\
transactionRepo.setDb(db);' server_simple.js
  
  echo "✅ Transaction repository added to server_simple.js"
fi

# ============================================
# 8. CREATE TEST SCRIPT
# ============================================
echo ""
echo "📁 Creating test_transaction.sh..."

cat > test_transaction.sh << 'EOF'
#!/bin/bash
# Test script for Phase 4 - Transactions

echo "============================================"
echo "  SierraPay Phase 4 - Transactions Test"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get OTP
echo "📱 Getting OTP..."
OTP=$(curl -s -X POST http://localhost:5000/api/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+23276123456", "purpose": "login"}' | grep -o '"testCode":"[0-9]*"' | cut -d'"' -f4)

echo -e "${GREEN}OTP: $OTP${NC}"

# Login
echo ""
echo "🔐 Logging in..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+23276123456\", \"code\": \"$OTP\"}")

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}Token: $TOKEN${NC}"

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi

# Test endpoints
echo ""
echo "============================================"
echo "  Testing Transaction Endpoints"
echo "============================================"

# 1. Send Money
echo ""
echo -e "${BLUE}💰 Sending Money...${NC}"
SEND_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/transactions/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverPhone": "+23276123456",
    "amount": 1000,
    "description": "Test payment"
  }')
echo $SEND_RESPONSE | jq '.'

# Extract transaction ID
TX_ID=$(echo $SEND_RESPONSE | grep -o '"transactionId":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TX_ID" ]; then
  echo -e "${GREEN}✅ Transaction ID: $TX_ID${NC}"
fi

# 2. Get Transaction History
echo ""
echo -e "${BLUE}📊 Getting Transaction History...${NC}"
curl -s -X GET "http://localhost:5000/api/v1/transactions/history?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 3. Get Stats
echo ""
echo -e "${BLUE}📈 Getting Stats...${NC}"
curl -s -X GET http://localhost:5000/api/transactions/stats/summary \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo -e "${GREEN}============================================"
echo -e "  ✅ PHASE 4 - TRANSACTIONS READY!"
echo -e "============================================${NC}"
EOF

chmod +x test_transaction.sh
echo "✅ test_transaction.sh created"

# ============================================
# 9. COMPLETION MESSAGE
# ============================================
echo ""
echo "============================================"
echo "  ✅ PHASE 4 - TRANSACTIONS COMPLETE!"
echo "============================================"
echo ""
echo "📁 Files Created:"
echo "  Models: Transaction.js"
echo "  Repository: transactionRepository.js"
echo "  Service: paymentService.js"
echo "  Controller: transactionController.js"
echo "  Routes: transactionRoutes.js"
echo "  Test: test_transaction.sh"
echo ""
echo "🔑 API Endpoints Added:"
echo "  POST   /api/v1/transactions/send          - Send money"
echo "  GET    /api/v1/transactions/history       - Get transaction history"
echo "  GET    /api/v1/transactions/:id           - Get transaction details"
echo "  GET    /api/v1/transactions/:id/receipt   - Get receipt"
echo "  GET    /api/v1/transactions/stats/summary - Get transaction stats"
echo ""
echo "📋 Next Steps:"
echo "  1. Restart the server: npm run dev"
echo "  2. Run test: bash test_transaction.sh"
echo "  3. Test sending money between users"
echo ""
echo "============================================"