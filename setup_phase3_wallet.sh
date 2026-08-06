#!/bin/bash
# SierraPay Phase 3 - Wallet Setup Script
# Run this in Git Bash from D:\SierraPay\backend

echo "============================================"
echo "  SierraPay Phase 3 - Wallet Setup"
echo "============================================"
echo ""

cd /d/SierraPay/backend || cd D:/SierraPay/backend

# ============================================
# 1. CREATE WALLET MODEL
# ============================================
echo "📁 Creating models/Wallet.js..."

cat > models/Wallet.js << 'EOF'
/**
 * Wallet Model - Firestore Schema
 * Collection: wallets
 */
class Wallet {
  constructor(data) {
    this.walletId = data.walletId || null;
    this.userId = data.userId || null;
    this.balance = data.balance || 0;
    this.currency = data.currency || 'SLL';
    this.walletNumber = data.walletNumber || null;
    this.transactions = data.transactions || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastTransactionAt = data.lastTransactionAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toFirestore() {
    return {
      userId: this.userId,
      balance: this.balance,
      currency: this.currency,
      walletNumber: this.walletNumber,
      transactions: this.transactions,
      isActive: this.isActive,
      lastTransactionAt: this.lastTransactionAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Wallet({ ...data, walletId: doc.id });
  }
}

module.exports = Wallet;
EOF

echo "✅ models/Wallet.js created"

# ============================================
# 2. CREATE WALLET REPOSITORY
# ============================================
echo ""
echo "📁 Creating repositories/walletRepository.js..."

cat > repositories/walletRepository.js << 'EOF'
let db = null;

const setDb = (database) => {
  db = database;
};

class WalletRepository {
  constructor() {}

  async create(walletData) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      // Generate a unique wallet number (10 digits)
      const walletNumber = this.generateWalletNumber();
      
      const wallet = {
        userId: walletData.userId,
        balance: walletData.balance || 0,
        currency: walletData.currency || 'SLL',
        walletNumber: walletNumber,
        transactions: [],
        isActive: true,
        lastTransactionAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = db.collection('wallets').doc();
      wallet.walletId = docRef.id;
      await docRef.set(wallet);
      return wallet;
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  generateWalletNumber() {
    // Generate 10-digit wallet number
    const prefix = '80';
    let number = '';
    for (let i = 0; i < 8; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return prefix + number;
  }

  async findByUserId(userId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const snapshot = await db.collection('wallets')
        .where('userId', '==', userId)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      throw new Error(`Failed to find wallet: ${error.message}`);
    }
  }

  async findById(walletId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const doc = await db.collection('wallets').doc(walletId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to find wallet: ${error.message}`);
    }
  }

  async updateBalance(walletId, newBalance) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('wallets').doc(walletId).update({
        balance: newBalance,
        updatedAt: new Date().toISOString()
      });
      return await this.findById(walletId);
    } catch (error) {
      throw new Error(`Failed to update balance: ${error.message}`);
    }
  }

  async addTransaction(walletId, transactionId) {
    try {
      if (!db) throw new Error('Database not initialized');
      const wallet = await this.findById(walletId);
      if (!wallet) throw new Error('Wallet not found');
      
      const transactions = wallet.transactions || [];
      transactions.push(transactionId);
      
      await db.collection('wallets').doc(walletId).update({
        transactions: transactions,
        lastTransactionAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to add transaction: ${error.message}`);
    }
  }

  async getBalance(userId) {
    try {
      const wallet = await this.findByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');
      return {
        balance: wallet.balance,
        currency: wallet.currency,
        walletNumber: wallet.walletNumber
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getTransactionHistory(userId, limit = 20) {
    try {
      if (!db) throw new Error('Database not initialized');
      
      // Get wallet first
      const wallet = await this.findByUserId(userId);
      if (!wallet) throw new Error('Wallet not found');
      
      const transactionIds = wallet.transactions || [];
      const recentIds = transactionIds.slice(-limit);
      
      if (recentIds.length === 0) {
        return [];
      }
      
      // Get transactions from Firestore
      const transactions = [];
      for (const id of recentIds.reverse()) {
        const doc = await db.collection('transactions').doc(id).get();
        if (doc.exists) {
          transactions.push({ id: doc.id, ...doc.data() });
        }
      }
      
      return transactions;
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  async deactivateWallet(walletId) {
    try {
      if (!db) throw new Error('Database not initialized');
      await db.collection('wallets').doc(walletId).update({
        isActive: false,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to deactivate wallet: ${error.message}`);
    }
  }
}

module.exports = new WalletRepository();
module.exports.setDb = setDb;
EOF

echo "✅ repositories/walletRepository.js created"

# ============================================
# 3. CREATE WALLET SERVICE
# ============================================
echo ""
echo "📁 Creating services/wallet/walletService.js..."

mkdir -p services/wallet

cat > services/wallet/walletService.js << 'EOF'
const walletRepository = require('../../repositories/walletRepository');
const userRepository = require('../../repositories/userRepository');

class WalletService {
  async createWallet(userId) {
    try {
      // Check if user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if wallet already exists
      const existingWallet = await walletRepository.findByUserId(userId);
      if (existingWallet) {
        return existingWallet;
      }
      
      // Create new wallet
      const wallet = await walletRepository.create({ userId });
      return wallet;
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  async getBalance(userId) {
    try {
      let wallet = await walletRepository.findByUserId(userId);
      if (!wallet) {
        // Auto-create wallet if it doesn't exist
        wallet = await this.createWallet(userId);
      }
      return {
        balance: wallet.balance,
        currency: wallet.currency,
        walletNumber: wallet.walletNumber,
        walletId: wallet.id || wallet.walletId
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getTransactionHistory(userId, limit = 20) {
    try {
      const wallet = await walletRepository.findByUserId(userId);
      if (!wallet) {
        // Auto-create wallet if it doesn't exist
        await this.createWallet(userId);
        return [];
      }
      
      return await walletRepository.getTransactionHistory(userId, limit);
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  async refreshWallet(userId) {
    try {
      const wallet = await walletRepository.findByUserId(userId);
      if (!wallet) {
        return await this.createWallet(userId);
      }
      
      // Return updated wallet info
      return {
        ...wallet,
        transactions: wallet.transactions || []
      };
    } catch (error) {
      throw new Error(`Failed to refresh wallet: ${error.message}`);
    }
  }

  async getWalletByUserId(userId) {
    try {
      let wallet = await walletRepository.findByUserId(userId);
      if (!wallet) {
        wallet = await this.createWallet(userId);
      }
      return wallet;
    } catch (error) {
      throw new Error(`Failed to get wallet: ${error.message}`);
    }
  }
}

module.exports = new WalletService();
EOF

echo "✅ services/wallet/walletService.js created"

# ============================================
# 4. CREATE WALLET CONTROLLER
# ============================================
echo ""
echo "📁 Creating controllers/walletController.js..."

cat > controllers/walletController.js << 'EOF'
const walletService = require('../services/wallet/walletService');

class WalletController {
  // Get wallet balance
  async getBalance(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const balance = await walletService.getBalance(userId);
      
      res.status(200).json({
        success: true,
        data: balance
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
      
      const transactions = await walletService.getTransactionHistory(userId, limit);
      
      res.status(200).json({
        success: true,
        data: {
          transactions,
          count: transactions.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh wallet data
  async refreshWallet(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const wallet = await walletService.refreshWallet(userId);
      
      res.status(200).json({
        success: true,
        message: 'Wallet refreshed successfully',
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  // Get wallet details (for admin or user)
  async getWalletDetails(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const wallet = await walletService.getWalletByUserId(userId);
      
      res.status(200).json({
        success: true,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WalletController();
EOF

echo "✅ controllers/walletController.js created"

# ============================================
# 5. CREATE WALLET ROUTES
# ============================================
echo ""
echo "📁 Creating routes/walletRoutes.js..."

cat > routes/walletRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All wallet routes require authentication
router.use(authMiddleware);

// Get wallet balance
router.get('/balance', walletController.getBalance.bind(walletController));

// Get transaction history
router.get('/transactions', walletController.getTransactionHistory.bind(walletController));

// Refresh wallet data
router.post('/refresh', walletController.refreshWallet.bind(walletController));

// Get full wallet details
router.get('/', walletController.getWalletDetails.bind(walletController));

module.exports = router;
EOF

echo "✅ routes/walletRoutes.js created"

# ============================================
# 6. UPDATE APP.JS TO INCLUDE WALLET ROUTES
# ============================================
echo ""
echo "📁 Updating app.js with wallet routes..."

# Check if app.js exists and update it
if [ -f "app.js" ]; then
  cp app.js app.js.backup
  echo "✅ app.js backed up to app.js.backup"
fi

# Check if wallet routes are already in app.js
if grep -q "walletRoutes" app.js; then
  echo "✅ Wallet routes already in app.js"
else
  # Insert wallet routes before 404 handler
  sed -i '/\/\/ Auth routes/a\
\
// Wallet routes\
app.use('\''/api/v1/wallet'\'', require('\''./routes/walletRoutes'\''));' app.js
  
  echo "✅ Wallet routes added to app.js"
fi

echo ""
echo "============================================"
echo "  ✅ PHASE 3 - WALLET COMPLETE!"
echo "============================================"
echo ""
echo "📁 Files Created:"
echo "  Models: Wallet.js"
echo "  Repository: walletRepository.js"
echo "  Service: walletService.js"
echo "  Controller: walletController.js"
echo "  Routes: walletRoutes.js"
echo ""
echo "🔑 API Endpoints Added:"
echo "  GET    /api/v1/wallet/balance          - Get wallet balance"
echo "  GET    /api/v1/wallet/transactions     - Get transaction history"
echo "  POST   /api/v1/wallet/refresh          - Refresh wallet data"
echo "  GET    /api/v1/wallet/                 - Get wallet details"
echo ""
echo "📋 Next Steps:"
echo "  1. Restart the server: npm run dev"
echo "  2. Test wallet endpoints with Postman or curl"
echo "  3. Phase 4: Payment Service"
echo ""
echo "============================================"