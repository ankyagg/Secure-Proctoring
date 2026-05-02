const sdk = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new sdk.Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.VITE_APPWRITE_API_KEY);

const dbs = new sdk.Databases(client);
const DB = process.env.VITE_APPWRITE_DB_ID;

async function clearCollection(col) {
  console.log(`Clearing ${col}...`);
  try {
    while (true) {
      const r = await dbs.listDocuments(DB, col, [sdk.Query.limit(100)]);
      if (r.documents.length === 0) break;
      
      for (const doc of r.documents) {
        await dbs.deleteDocument(DB, col, doc.$id);
      }
      console.log(`  Deleted ${r.documents.length} docs...`);
    }
    console.log(`✓ ${col} cleared.`);
  } catch (e) {
    console.error(`✗ Error clearing ${col}:`, e.message);
  }
}

async function main() {
  const cols = ['questions', 'test_cases', 'contests', 'submissions', 'proctor_logs', 'users'];
  for (const col of cols) {
    await clearCollection(col);
  }
}

main().then(() => process.exit(0));
