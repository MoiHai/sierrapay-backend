#!/bin/bash
# SierraPay Phase 6 - Bill Payments Setup Script
# Run this in Git Bash from D:\SierraPay\backend

echo "============================================"
echo "  SierraPay Phase 6 - Bill Payments Setup"
echo "============================================"
echo ""

cd /d/SierraPay/backend || cd D:/SierraPay/backend

# ============================================
# 1. CREATE BILL PAYMENT MODEL
# ============================================
echo "📁 Creating models/BillPayment.js..."

cat > models/BillPayment.js << 'EOF'
/**
 * Bill Payment Model - Firestore Schema
 * Collection: bill_payments
 */
class BillPayment {
  constructor(data) {
    this.billId = data.billId || null;
    this.userId = data.userId || null;
    this.walletId = data.walletId || null;
    this.transactionId = data.transactionId || null;
    this.category = data.category || 'other'; // electricity | water | internet | tv | phone | other
    this.provider = data.provider || null;
    this.customerId = data.customerId || null;
    this.customerName = data.customerName || null;
    this.amount = data.amount || 0;
    this.currency = data.currency || 'SLL';
    this.fee = data.fee || 0;
    this.totalAmount = data.totalAmount || 0;
    this.status = data.status || 'pending'; // pending | processing | completed | failed
    this.reference = data.reference || null;
    this.paymentDate = data.paymentDate || null;
    this.metadata = data.metadata || {};
    this.billerResponse = data.billerResponse || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isCompleted() {
    return this.status === 'completed';
  }

  isPending() {
    return this.status === 'pending';
  }

  isFailed() {
    return this.status === 'failed';
  }

  toFirestore() {
    return {
      userId: this.userId,
      walletId: this.walletId,
      transactionId: this.transactionId,
      category: this.category,
      provider: this.provider,
      customerId: this.customerId,
      customerName: this.customerName,
      amount: this.amount,
      currency: this.currency,
      fee: this.fee,
      totalAmount: this.totalAmount,
      status: this.status,
      reference: this.reference,
      paymentDate: this.paymentDate,
      metadata: this.metadata,
      billerResponse: this.billerResponse,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new BillPayment({ ...data, billId: doc.id });
  }
}

module.exports = BillPayment;
EOF

echo "✅ models/BillPayment.js created"

# ============================================
# 2. CREATE BILL REPOSITORY
# ============================================
echo ""
echo "📁 Creating repositories/billRepository.js..."

cat > repositories/billRepository.js << 'EOF'
let db = null;

const setDb = (database) => {
  db = database;
};

class BillRepository {
  constructor() {}

  async create(billData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const docRef = db.collection('bill_payments').doc();
      const data = {
        ...billData,
        billId: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Failed to create bill payment: ${error.message}`);
    }
  }

  async findById(billId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('bill_payments').doc(billId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find bill payment: ${error.message}`);
    }
  }

  async findByUserId(userId, limit = 20, offset = 0) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('bill_payments')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      // Fallback without orderBy
      try {
        const snapshot = await db.collection('bill_payments')
          .where('userId', '==', userId)
          .get();
        
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return results.slice(offset, offset + limit);
      } catch (fallbackError) {
        throw new Error(`Failed to find bill payments: ${fallbackError.message}`);
      }
    }
  }

  async findByCategory(userId, category, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('bill_payments')
        .where('userId', '==', userId)
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to find bill payments: ${error.message}`);
    }
  }

  async updateStatus(billId, status, data = {}) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('bill_payments').doc(billId).update({
        status: status,
        ...data,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(billId);
    } catch (error) {
      throw new Error(`Failed to update bill status: ${error.message}`);
    }
  }

  async updatePaymentDate(billId, paymentDate) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('bill_payments').doc(billId).update({
        paymentDate: paymentDate,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(billId);
    } catch (error) {
      throw new Error(`Failed to update payment date: ${error.message}`);
    }
  }

  async getStats(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      const snapshot = await db.collection('bill_payments')
        .where('userId', '==', userId)
        .where('status', '==', 'completed')
        .get();
      
      let totalAmount = 0;
      let totalFee = 0;
      const byCategory = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalAmount += data.amount || 0;
        totalFee += data.fee || 0;
        const category = data.category || 'other';
        if (!byCategory[category]) {
          byCategory[category] = 0;
        }
        byCategory[category] += data.amount || 0;
      });
      
      return {
        totalAmount,
        totalFee,
        totalBills: snapshot.size,
        byCategory
      };
    } catch (error) {
      throw new Error(`Failed to get bill stats: ${error.message}`);
    }
  }
}

module.exports = new BillRepository();
module.exports.setDb = setDb;
EOF

echo "✅ repositories/billRepository.js created"

# ============================================
# 3. CREATE BILL SERVICE
# ============================================
echo ""
echo "📁 Creating services/bill/billService.js..."

mkdir -p services/bill

cat > services/bill/billService.js << 'EOF'
const billRepository = require('../../repositories/billRepository');
const walletRepository = require('../../repositories/walletRepository');
const transactionRepository = require('../../repositories/transactionRepository');
const paymentService = require('../payment/paymentService');
const userRepository = require('../../repositories/userRepository');

// Get Firestore instance
const { getFirestore } = require('../../config/firebase');

class BillService {
  // Bill providers and their details
  getProviders() {
    return {
      electricity: {
        name: 'Electricity',
        providers: ['EDSA', 'KEDC', 'NEDC', 'WAPCo'],
        icon: '⚡',
        description: 'Pay your electricity bills'
      },
      water: {
        name: 'Water',
        providers: ['GUMA', 'Sierra Leone Water Company', 'Municipal Water'],
        icon: '💧',
        description: 'Pay your water bills'
      },
      internet: {
        name: 'Internet',
        providers: ['Africell', 'Orange', 'QCell', 'Sierratel', 'Splash'],
        icon: '🌐',
        description: 'Pay your internet bills'
      },
      tv: {
        name: 'TV / Cable',
        providers: ['GOTV', 'DSTV', 'Startimes', 'Local Cable'],
        icon: '📺',
        description: 'Pay your TV subscriptions'
      },
      phone: {
        name: 'Phone / Mobile',
        providers: ['Africell', 'Orange', 'QCell'],
        icon: '📱',
        description: 'Top up your phone credit'
      }
    };
  }

  // Pay electricity bill
  async payElectricity(userId, provider, customerId, amount, customerName = '') {
    return await this.payBill(userId, 'electricity', provider, customerId, amount, customerName);
  }

  // Pay water bill
  async payWater(userId, provider, customerId, amount, customerName = '') {
    return await this.payBill(userId, 'water', provider, customerId, amount, customerName);
  }

  // Pay internet bill
  async payInternet(userId, provider, customerId, amount, customerName = '') {
    return await this.payBill(userId, 'internet', provider, customerId, amount, customerName);
  }

  // Pay TV bill
  async payTV(userId, provider, customerId, amount, customerName = '') {
    return await this.payBill(userId, 'tv', provider, customerId, amount, customerName);
  }

  // Generic bill payment
  async payBill(userId, category, provider, customerId, amount, customerName = '') {
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
      const totalAmount = amount + (amount * 0.01); // 1% fee
      if (wallet.balance < totalAmount) {
        throw new Error('Insufficient balance. Please add funds to your wallet.');
      }

      // Get user details
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate reference
      const reference = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      // Create bill record first (pending)
      const billData = {
        userId: userId,
        walletId: wallet.id,
        category: category,
        provider: provider,
        customerId: customerId,
        customerName: customerName || user.fullName || user.phoneNumber,
        amount: amount,
        currency: 'SLL',
        fee: amount * 0.01, // 1% fee
        totalAmount: totalAmount,
        status: 'pending',
        reference: reference,
        metadata: {
          paymentMethod: 'wallet',
          customerName: customerName || user.fullName || user.phoneNumber
        }
      };

      const bill = await billRepository.create(billData);

      // Process payment using payment service
      // In production, this would call the actual biller API
      try {
        // Simulate biller API call
        const billerResponse = await this.callBillerAPI(category, provider, customerId, amount);
        
        // Update bill status to completed
        await billRepository.updateStatus(bill.id, 'completed', {
          billerResponse: billerResponse,
          paymentDate: new Date().toISOString()
        });

        // Create transaction record
        const db = getFirestore();
        const transactionRef = db.collection('transactions').doc();
        const transactionData = {
          senderId: userId,
          receiverId: 'biller_system',
          senderWalletId: wallet.id,
          receiverWalletId: 'biller_wallet',
          amount: amount,
          currency: 'SLL',
          type: 'bill_payment',
          status: 'completed',
          description: `${category} bill payment - ${provider} (${customerId})`,
          reference: reference,
          senderBalanceBefore: wallet.balance,
          senderBalanceAfter: wallet.balance - totalAmount,
          receiverBalanceBefore: null,
          receiverBalanceAfter: null,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            billId: bill.id,
            category: category,
            provider: provider,
            customerId: customerId,
            fee: amount * 0.01
          }
        };

        await transactionRef.set(transactionData);

        // Update wallet balance
        await walletRepository.updateBalance(wallet.id, wallet.balance - totalAmount);

        // Add transaction to wallet
        const walletRef = db.collection('wallets').doc(wallet.id);
        const walletDoc = await walletRef.get();
        const transactions = walletDoc.data().transactions || [];
        transactions.push(transactionRef.id);
        await walletRef.update({ transactions: transactions });

        // Update bill with transaction ID
        await billRepository.updateStatus(bill.id, 'completed', {
          transactionId: transactionRef.id,
          paymentDate: new Date().toISOString()
        });

        return {
          success: true,
          billId: bill.id,
          transactionId: transactionRef.id,
          reference: reference,
          category: category,
          provider: provider,
          customerId: customerId,
          amount: amount,
          fee: amount * 0.01,
          totalAmount: totalAmount,
          newBalance: wallet.balance - totalAmount,
          status: 'completed',
          completedAt: new Date().toISOString()
        };

      } catch (billerError) {
        // If biller API fails, mark as failed
        await billRepository.updateStatus(bill.id, 'failed', {
          billerResponse: { error: billerError.message },
          metadata: {
            ...bill.metadata,
            error: billerError.message
          }
        });

        throw new Error(`Biller service error: ${billerError.message}`);
      }

    } catch (error) {
      throw new Error(`Bill payment failed: ${error.message}`);
    }
  }

  // Simulate biller API call
  async callBillerAPI(category, provider, customerId, amount) {
    // In production, this would call the actual biller API
    // For now, simulate a successful response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `BILLER-${Date.now()}`,
          status: 'approved',
          message: 'Bill payment successful',
          provider: provider,
          customerId: customerId,
          amount: amount,
          reference: `REF-${Date.now()}`
        });
      }, 500);
    });
  }

  // Get bill by ID
  async getBill(billId, userId) {
    try {
      const bill = await billRepository.findById(billId);
      if (!bill) {
        throw new Error('Bill payment not found');
      }

      if (bill.userId !== userId) {
        throw new Error('Unauthorized to view this bill');
      }

      return bill;
    } catch (error) {
      throw new Error(`Failed to get bill: ${error.message}`);
    }
  }

  // Get bill history
  async getBillHistory(userId, limit = 20, offset = 0) {
    try {
      return await billRepository.findByUserId(userId, limit, offset);
    } catch (error) {
      throw new Error(`Failed to get bill history: ${error.message}`);
    }
  }

  // Get bills by category
  async getBillsByCategory(userId, category, limit = 20) {
    try {
      return await billRepository.findByCategory(userId, category, limit);
    } catch (error) {
      throw new Error(`Failed to get bills by category: ${error.message}`);
    }
  }

  // Get bill stats
  async getBillStats(userId) {
    try {
      return await billRepository.getStats(userId);
    } catch (error) {
      throw new Error(`Failed to get bill stats: ${error.message}`);
    }
  }

  // Verify customer
  async verifyCustomer(category, provider, customerId) {
    try {
      // In production, this would call the biller API to verify customer
      // For now, simulate verification
      return {
        success: true,
        customerId: customerId,
        customerName: `Customer ${customerId}`,
        provider: provider,
        category: category,
        message: 'Customer verified successfully'
      };
    } catch (error) {
      throw new Error(`Failed to verify customer: ${error.message}`);
    }
  }
}

module.exports = new BillService();
EOF

echo "✅ services/bill/billService.js created"

# ============================================
# 4. CREATE BILL CONTROLLER
# ============================================
echo ""
echo "📁 Creating controllers/billController.js..."

cat > controllers/billController.js << 'EOF'
const billService = require('../services/bill/billService');

class BillController {
  // Get bill providers
  async getProviders(req, res, next) {
    try {
      const providers = billService.getProviders();
      res.status(200).json({
        success: true,
        data: providers
      });
    } catch (error) {
      next(error);
    }
  }

  // Pay electricity bill
  async payElectricity(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { provider, customerId, amount, customerName } = req.body;

      if (!provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payElectricity(
        userId,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'Electricity bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Pay water bill
  async payWater(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { provider, customerId, amount, customerName } = req.body;

      if (!provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payWater(
        userId,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'Water bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Pay internet bill
  async payInternet(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { provider, customerId, amount, customerName } = req.body;

      if (!provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payInternet(
        userId,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'Internet bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Pay TV bill
  async payTV(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { provider, customerId, amount, customerName } = req.body;

      if (!provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payTV(
        userId,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'TV bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Generic bill payment
  async payBill(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { category, provider, customerId, amount, customerName } = req.body;

      if (!category || !provider || !customerId || !amount) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Category, provider, customer ID, and amount are required'
        });
      }

      const result = await billService.payBill(
        userId,
        category,
        provider,
        customerId,
        amount,
        customerName
      );

      res.status(200).json({
        success: true,
        message: 'Bill paid successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bill by ID
  async getBill(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { billId } = req.params;

      const bill = await billService.getBill(billId, userId);

      res.status(200).json({
        success: true,
        data: bill
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bill history
  async getBillHistory(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const history = await billService.getBillHistory(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: {
          history,
          count: history.length,
          limit,
          offset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bills by category
  async getBillsByCategory(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const { category } = req.params;
      const limit = parseInt(req.query.limit) || 20;

      const bills = await billService.getBillsByCategory(userId, category, limit);

      res.status(200).json({
        success: true,
        data: {
          bills,
          count: bills.length,
          category,
          limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bill stats
  async getBillStats(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;

      const stats = await billService.getBillStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify customer
  async verifyCustomer(req, res, next) {
    try {
      const { category, provider, customerId } = req.body;

      if (!category || !provider || !customerId) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Category, provider, and customer ID are required'
        });
      }

      const result = await billService.verifyCustomer(category, provider, customerId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BillController();
EOF

echo "✅ controllers/billController.js created"

# ============================================
# 5. CREATE BILL ROUTES
# ============================================
echo ""
echo "📁 Creating routes/billRoutes.js..."

cat > routes/billRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All bill routes require authentication
router.use(authMiddleware);

// Get bill providers
router.get('/providers', billController.getProviders.bind(billController));

// Pay electricity bill
router.post('/electricity', billController.payElectricity.bind(billController));

// Pay water bill
router.post('/water', billController.payWater.bind(billController));

// Pay internet bill
router.post('/internet', billController.payInternet.bind(billController));

// Pay TV bill
router.post('/tv', billController.payTV.bind(billController));

// Generic bill payment
router.post('/pay', billController.payBill.bind(billController));

// Verify customer
router.post('/verify', billController.verifyCustomer.bind(billController));

// Get bill history
router.get('/history', billController.getBillHistory.bind(billController));

// Get bill stats
router.get('/stats', billController.getBillStats.bind(billController));

// Get bills by category
router.get('/category/:category', billController.getBillsByCategory.bind(billController));

// Get bill by ID
router.get('/:billId', billController.getBill.bind(billController));

module.exports = router;
EOF

echo "✅ routes/billRoutes.js created"

# ============================================
# 6. UPDATE APP.JS TO INCLUDE BILL ROUTES
# ============================================
echo ""
echo "📁 Updating app.js with bill routes..."

if grep -q "billRoutes" app.js; then
  echo "✅ Bill routes already in app.js"
else
  # Insert bill routes before 404 handler
  sed -i '/\/ QR routes/a\
\
// Bill routes\
app.use('\''/api/v1/bills'\'', require('\''./routes/billRoutes'\''));' app.js
  
  echo "✅ Bill routes added to app.js"
fi

# ============================================
# 7. UPDATE SERVER_SIMPLE.JS
# ============================================
echo ""
echo "📁 Updating server_simple.js with bill repository..."

if grep -q "billRepository" server_simple.js; then
  echo "✅ Bill repository already in server_simple.js"
else
  # Add bill repository
  sed -i '/const qrRepo = require/,+2 a\
const billRepo = require('\''./repositories/billRepository'\'');\
billRepo.setDb(db);' server_simple.js
  
  echo "✅ Bill repository added to server_simple.js"
fi

# ============================================
# 8. CREATE TEST SCRIPT
# ============================================
echo ""
echo "📁 Creating test_bills.sh..."

cat > test_bills.sh << 'EOF'
#!/bin/bash
# Test script for Phase 6 - Bill Payments

echo "============================================"
echo "  SierraPay Phase 6 - Bill Payments Test"
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
echo "  Testing Bill Payment Endpoints"
echo "============================================"

# 1. Get providers
echo ""
echo "📋 Getting Bill Providers..."
curl -s -X GET http://localhost:5000/api/v1/bills/providers \
  -H "Authorization: Bearer $TOKEN"

# 2. Pay Electricity Bill
echo ""
echo "⚡ Paying Electricity Bill..."
curl -s -X POST http://localhost:5000/api/v1/bills/electricity \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "EDSA",
    "customerId": "ELEC-12345",
    "amount": 10000,
    "customerName": "John Doe"
  }'

# 3. Check wallet balance
echo ""
echo "💰 Wallet Balance:"
curl -s -X GET http://localhost:5000/api/v1/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# 4. Get bill history
echo ""
echo "📊 Bill History:"
curl -s -X GET "http://localhost:5000/api/v1/bills/history?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get bill stats
echo ""
echo "📈 Bill Stats:"
curl -s -X GET "http://localhost:5000/api/v1/bills/stats" \
  -H "Authorization: Bearer $TOKEN"

echo ""
echo "============================================"
echo "  ✅ PHASE 6 - BILL PAYMENTS READY!"
echo "============================================"
EOF

chmod +x test_bills.sh
echo "✅ test_bills.sh created"

# ============================================
# 9. COMPLETION MESSAGE
# ============================================
echo ""
echo "============================================"
echo "  ✅ PHASE 6 - BILL PAYMENTS COMPLETE!"
echo "============================================"
echo ""
echo "📁 Files Created:"
echo "  Models: BillPayment.js"
echo "  Repository: billRepository.js"
echo "  Service: billService.js"
echo "  Controller: billController.js"
echo "  Routes: billRoutes.js"
echo "  Test: test_bills.sh"
echo ""
echo "🔑 API Endpoints Added:"
echo "  GET    /api/v1/bills/providers         - Get bill providers"
echo "  POST   /api/v1/bills/electricity       - Pay electricity bill"
echo "  POST   /api/v1/bills/water             - Pay water bill"
echo "  POST   /api/v1/bills/internet          - Pay internet bill"
echo "  POST   /api/v1/bills/tv                - Pay TV bill"
echo "  POST   /api/v1/bills/pay               - Generic bill payment"
echo "  POST   /api/v1/bills/verify            - Verify customer"
echo "  GET    /api/v1/bills/history           - Get bill history"
echo "  GET    /api/v1/bills/stats             - Get bill stats"
echo "  GET    /api/v1/bills/category/:cat     - Get bills by category"
echo "  GET    /api/v1/bills/:billId           - Get bill details"
echo ""
echo "📋 Next Steps:"
echo "  1. Restart the server: npm run dev"
echo "  2. Run test: bash test_bills.sh"
echo ""
echo "============================================"