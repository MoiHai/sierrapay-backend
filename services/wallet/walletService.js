const Wallet = require("../../models/Wallet");

const walletService = {

    async createWallet(userId) {

        const existingWallet = await Wallet.findByUserId(userId);

        if (existingWallet) {
            return existingWallet;
        }

        return await Wallet.create(userId);

    }

};

module.exports = walletService;