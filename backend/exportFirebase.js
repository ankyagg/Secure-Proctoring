const fs = require('fs');
const db = require('./firebase');

async function exportCollection(collectionName) {
  try {
    console.log(`Fetching ${collectionName}...`);
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    fs.writeFileSync(`./${collectionName}_backup.json`, JSON.stringify(data, null, 2));
    console.log(`Successfully exported ${data.length} documents from ${collectionName} to ${collectionName}_backup.json`);
  } catch (error) {
    console.error(`Failed to export ${collectionName}:`, error.message);
  }
}

async function run() {
  await exportCollection('questions');
  await exportCollection('test_cases');
  await exportCollection('contests');
  await exportCollection('submissions');
  await exportCollection('users');
  await exportCollection('proctoring_logs');
  process.exit(0);
}

run();
