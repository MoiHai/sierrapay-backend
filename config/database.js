const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

// Read the Base64 string DIRECTLY from your firebase-base64.txt file
const base64String = fs.readFileSync(
    path.join(__dirname, "..", "firebase-base64.txt"), 
    "utf8"
).trim(); // .trim() removes any hidden newlines

// Decode Base64 string back into a JSON object
const serviceAccount = JSON.parse(
    Buffer.from(base64String, "base64").toString("utf8")
);

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

console.log("Firebase Firestore Connected");

module.exports = db;