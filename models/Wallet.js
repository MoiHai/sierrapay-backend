const db = require("../config/database");

const walletsCollection = db.collection("wallets");

const Wallet = {

    async create(userId) {

        const walletRef = walletsCollection.doc();

        const wallet = {

            id: walletRef.id,

            userId,

            balance: 0,

            currency: "SLE",

            status: "active",

            createdAt: new Date()

        };

        await walletRef.set(wallet);

        return wallet;

    },

    async findByUserId(userId) {

        const snapshot = await walletsCollection
            .where("userId", "==", userId)
            .limit(1)
            .get();

        if (snapshot.empty) {

            return null;

        }

        return snapshot.docs[0].data();

    }

};

module.exports = Wallet;