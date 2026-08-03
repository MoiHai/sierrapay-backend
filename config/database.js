const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

// 1. Check if we are running on Render (defined by the presence of the ENV var)
let base64String = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

// 2. If NOT on Render (meaning the ENV var is missing), read the local file
if (!base64String || base64String === "") {
    console.log("Running locally: reading firebase-base64.txt");
    const filePath = path.join(__dirname, "..", "firebase-base64.txt");
    base64String = fs.readFileSync(filePath, "utf8").trim();
} else {
    console.log("Running on Render: using Environment Variable successfully!");
}

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