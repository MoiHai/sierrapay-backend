const transactionRepository = require('../../repositories/transactionRepository');
const walletRepository = require('../../repositories/walletRepository');
const userRepository = require('../../repositories/userRepository');

// Get Firestore instance
const { getFirestore } = require('../../config/firebase');

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

      // Get Firestore instance
      const db = getFirestore();
      
      // Use runTransaction for atomic operation
      return await db.runTransaction(async (transaction) => {
        // STEP 1: ALL READS FIRST
        const senderRef = db.collection('wallets').doc(senderWallet.id);
        const receiverRef = db.collection('wallets').doc(receiverWallet.id);
        
        // Read both wallets
        const senderDoc = await transaction.get(senderRef);
        const receiverDoc = await transaction.get(receiverRef);
        
        const senderData = senderDoc.data();
        const receiverData = receiverDoc.data();
        
        // Double-check balance
        if (!senderData || senderData.balance < amount) {
          throw new Error('Insufficient balance');
        }

        // Calculate new balances
        const senderNewBalance = senderData.balance - amount;
        const receiverNewBalance = (receiverData ? receiverData.balance : 0) + amount;

        // Generate reference
        const reference = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        // STEP 2: ALL WRITES AFTER ALL READS
        // Create transaction record first
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
          receiverBalanceBefore: receiverData ? receiverData.balance : 0,
          receiverBalanceAfter: receiverNewBalance,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            senderPhone: senderWallet.phoneNumber || null,
            receiverPhone: receiver.phoneNumber
          }
        };

        // All writes happen here
        transaction.set(transactionRef, transactionData);

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

        // Add transaction to wallet transaction arrays
        const senderTransactions = senderData.transactions || [];
        const receiverTransactions = receiverData ? receiverData.transactions : [];
        
        senderTransactions.push(transactionRef.id);
        receiverTransactions.push(transactionRef.id);

        transaction.update(senderRef, { transactions: senderTransactions });
        transaction.update(receiverRef, { transactions: receiverTransactions });

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
      
      const receipt = {
        transactionId: transaction.id || transaction.transactionId,
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
