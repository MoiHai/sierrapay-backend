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
