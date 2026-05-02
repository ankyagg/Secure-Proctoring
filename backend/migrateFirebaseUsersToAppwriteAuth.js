const admin = require('firebase-admin');
const sdk = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

// 1. Initialize Firebase
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const auth = admin.auth();

// 2. Initialize Appwrite
const client = new sdk.Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.VITE_APPWRITE_API_KEY);

const users = new sdk.Users(client);

async function migrateAuth() {
  console.log('🚀 Starting Firebase Auth -> Appwrite Auth migration...');
  
  try {
    const listUsersResult = await auth.listUsers(1000);
    console.log(`Found ${listUsersResult.users.length} users in Firebase Auth.`);

    for (const firebaseUser of listUsersResult.users) {
      const email = firebaseUser.email;
      if (!email) continue;

      try {
        // Appwrite user IDs must be between 1 and 36 characters
        // Sanitizing Firebase UID to be safe
        const userId = firebaseUser.uid.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 36);
        
        await users.create(
          userId,
          email,
          undefined, // Phone number
          'MigratedUser123!', // TEMPORARY PASSWORD
          firebaseUser.displayName || email.split('@')[0]
        );
        console.log(`✅ Created Auth Account for: ${email}`);
      } catch (err) {
        if (err.code === 409) {
          console.log(`ℹ️  User already exists in Appwrite Auth: ${email}`);
        } else {
          console.error(`❌ Error creating user ${email}:`, err.message);
        }
      }
    }

    console.log('\n✨ Auth migration finished.');
    console.log('⚠️  NOTE: Users will need to reset their passwords as Firebase passwords cannot be exported.');
    console.log('Temporary password set to: MigratedUser123!');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateAuth().then(() => process.exit(0));
