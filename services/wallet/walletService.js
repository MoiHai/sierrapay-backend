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
