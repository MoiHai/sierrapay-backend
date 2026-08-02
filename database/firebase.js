const admin = require('firebase-admin');

// IMPORTANT: This path points to your JSON file in the main SierraPay folder
// If you get an error saying the file is not found, verify the exact location.
const serviceAccount = require('../sierrapay-firebase-adminsdk.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Export Firestore (or Realtime DB) for use in your controllers
const db = admin.firestore(); // <-- Change this to admin.database() if you use Realtime DB

module.exports = db;
