const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkDB() {
  try {
    const questionsSnap = await db.collection('questions').get();
    console.log(`Questions count: ${questionsSnap.size}`);
    
    const contestsSnap = await db.collection('contests').get();
    console.log(`Contests count: ${contestsSnap.size}`);

    const testCasesSnap = await db.collection('test_cases').get();
    console.log(`Test cases count: ${testCasesSnap.size}`);
  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    process.exit(0);
  }
}

checkDB();
