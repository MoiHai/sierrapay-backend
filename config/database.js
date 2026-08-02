const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

require("dotenv").config();


const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
);


initializeApp({
    credential: cert(serviceAccount)
});


const db = getFirestore();


console.log("Firebase Firestore Connected");


module.exports = db;