require('dotenv').config({ path: '../.env' });
const sdk = require('node-appwrite');

const key = process.env.VITE_APPWRITE_API_KEY;
console.log('Key length:', key?.length);
console.log('Key prefix:', key?.substring(0, 15));
console.log('Endpoint:', process.env.VITE_APPWRITE_ENDPOINT);
console.log('Project:', process.env.VITE_APPWRITE_PROJECT_ID);
console.log('DB:', process.env.VITE_APPWRITE_DB_ID);

const client = new sdk.Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(key);

const databases = new sdk.Databases(client);

async function test() {
  // Test 1: List databases
  try {
    const result = await databases.list();
    console.log('\n✅ List databases OK:', result.databases.map(d => d.$id));
  } catch (e) {
    console.log('\n❌ List databases FAIL:', e.code, e.type, e.message);
  }

  // Test 2: Get specific database
  try {
    const db = await databases.get(process.env.VITE_APPWRITE_DB_ID);
    console.log('✅ Get database OK:', db.name);
  } catch (e) {
    console.log('❌ Get database FAIL:', e.code, e.type, e.message);
  }

  // Test 3: List collections
  try {
    const cols = await databases.listCollections(process.env.VITE_APPWRITE_DB_ID);
    console.log('✅ List collections OK:', cols.collections.map(c => c.$id));
  } catch (e) {
    console.log('❌ List collections FAIL:', e.code, e.type, e.message);
  }

  // Test 4: Try creating a test collection
  try {
    await databases.createCollection(
      process.env.VITE_APPWRITE_DB_ID,
      '_test_migration',
      'Test Migration',
      [sdk.Permission.read(sdk.Role.any())]
    );
    console.log('✅ Create collection OK');
    // Clean up
    await databases.deleteCollection(process.env.VITE_APPWRITE_DB_ID, '_test_migration');
    console.log('✅ Delete collection OK');
  } catch (e) {
    console.log('❌ Create collection FAIL:', e.code, e.type, e.message);
    // Try delete anyway
    try { await databases.deleteCollection(process.env.VITE_APPWRITE_DB_ID, '_test_migration'); } catch(x) {}
  }
}

test().then(() => process.exit(0));
