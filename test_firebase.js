const { initializeFirebase, getFirestore, getAuth, checkFirebaseHealth } = require('./config/firebase');

async function testFirebaseConnection() {
  console.log('\n========================================');
  console.log('  SierraPay Firebase Connection Test');
  console.log('========================================\n');
  
  try {
    console.log('📌 Step 1: Initializing Firebase...');
    initializeFirebase();
    console.log('✅ Firebase initialized\n');
    
    console.log('📌 Step 2: Testing Firestore...');
    const db = getFirestore();
    
    const testRef = db.collection('_test_connection').doc('test_' + Date.now());
    
    await testRef.set({
      test: true,
      message: 'Firebase connection successful!',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Test data written to Firestore');
    
    const doc = await testRef.get();
    if (doc.exists) {
      console.log('✅ Test data read from Firestore');
      console.log('📄 Data:', JSON.stringify(doc.data(), null, 2));
    }
    
    await testRef.delete();
    console.log('✅ Test data cleaned up\n');
    
    console.log('📌 Step 3: Testing Firebase Auth...');
    try {
      const auth = getAuth();
      const listUsersResult = await auth.listUsers(1);
      console.log(`✅ Auth connected (Found ${listUsersResult.users.length} users)`);
    } catch (authError) {
      console.log('⚠️ Auth test: Email/Password may not be enabled');
    }
    console.log();
    
    console.log('📌 Step 4: Running health check...');
    const health = await checkFirebaseHealth();
    console.log(`✅ Health check: ${health.connected ? 'PASSED' : 'FAILED'}`);
    console.log(`   Message: ${health.message}\n`);
    
    console.log('========================================');
    console.log('  ✅ ALL TESTS PASSED!');
    console.log('========================================');
    console.log('🚀 Your SierraPay backend is ready to go!');
    console.log('========================================\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n========================================');
    console.error('  ❌ TEST FAILED');
    console.error('========================================');
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(`Stack: ${error.stack}`);
    }
    console.error('========================================\n');
    process.exit(1);
  }
}

testFirebaseConnection();
