const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

console.log("Initializing Firebase...");

let serviceAccount;

// Check for base64 encoded service account (Render production)
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
        serviceAccount = JSON.parse(decoded);
        console.log("✅ Using base64 service account");
    } catch (error) {
        console.error("❌ Error parsing base64 service account:", error.message);
        process.exit(1);
    }
} else {
    // Local development - read from file
    try {
        const filePath = path.join(__dirname, "../firebase-base64.txt");
        if (fs.existsSync(filePath)) {
            const base64 = fs.readFileSync(filePath, "utf8").trim();
            const decoded = Buffer.from(base64, "base64").toString("utf8");
            serviceAccount = JSON.parse(decoded);
            console.log("✅ Using firebase-base64.txt");
        } else {
            // Fallback to serviceAccountKey.json
            const keyPath = path.join(__dirname, "../serviceAccountKey.json");
            if (fs.existsSync(keyPath)) {
                serviceAccount = require(keyPath);
                console.log("✅ Using serviceAccountKey.json");
            } else {
                console.error("❌ No service account found!");
                process.exit(1);
            }
        }
    } catch (error) {
        console.error("❌ Error reading service account:", error.message);
        process.exit(1);
    }
}

// Initialize Firebase with proper settings
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
    });
    console.log("✅ Firebase initialized successfully");
} catch (error) {
    console.error("❌ Failed to initialize Firebase:", error.message);
    process.exit(1);
}

const db = admin.firestore();

// Set Firestore settings for better performance
db.settings({
    ignoreUndefinedProperties: true,
    timestampsInSnapshots: true,
});

console.log("✅ Firestore database ready");

module.exports = { admin, db };
