/**
 * ═══════════════════════════════════════════════════════════════════
 *  APPWRITE SCHEMA SETUP — Adds missing attributes & collections
 *  Run: node setupAppwriteSchema.js
 * ═══════════════════════════════════════════════════════════════════
 */
const sdk = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const API_KEY = process.env.VITE_APPWRITE_API_KEY;
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '69ec85ee00105396979f';
const DATABASE_ID = process.env.VITE_APPWRITE_DB_ID || '69ec8871002bec20d3fc';
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';

if (!API_KEY || API_KEY === 'YOUR_APPWRITE_API_KEY') {
  console.error('❌ ERROR: Set VITE_APPWRITE_API_KEY in your .env file');
  process.exit(1);
}

const client = new sdk.Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new sdk.Databases(client);
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Safe create: skip on 409 (exists) or 400 (already exists with diff params)
async function safeCreate(fn, label) {
  try {
    await fn();
    console.log(`  ✓ ${label}`);
    return true;
  } catch (e) {
    if (e.code === 409 || (e.code === 400 && e.message?.includes('already'))) {
      console.log(`  ⊘ ${label} (exists)`);
    } else if (e.code === 400) {
      console.log(`  ⊘ ${label} (skipped: ${e.message})`);
    } else {
      console.error(`  ✗ ${label}: [${e.code}] ${e.message}`);
    }
    return false;
  }
}

// Get existing attribute keys for a collection
async function getExistingAttrs(collectionId) {
  try {
    const attrs = await databases.listAttributes(DATABASE_ID, collectionId);
    return new Set(attrs.attributes.map(a => a.key));
  } catch (e) {
    return new Set();
  }
}

// Only create attribute if it doesn't already exist
async function addStringAttr(cid, key, size, required, existing) {
  if (existing.has(key)) { console.log(`  ⊘ ${key} (exists)`); return; }
  await safeCreate(() => databases.createStringAttribute(DATABASE_ID, cid, key, size, required), key);
}

async function addIntAttr(cid, key, required, existing) {
  if (existing.has(key)) { console.log(`  ⊘ ${key} (exists)`); return; }
  await safeCreate(() => databases.createIntegerAttribute(DATABASE_ID, cid, key, required), key);
}

async function addBoolAttr(cid, key, required, existing) {
  if (existing.has(key)) { console.log(`  ⊘ ${key} (exists)`); return; }
  await safeCreate(() => databases.createBooleanAttribute(DATABASE_ID, cid, key, required), key);
}

// ══════════════════════════════════════════════════════════════
async function setupQuestions() {
  console.log('\n📋 QUESTIONS COLLECTION');
  const cid = 'questions';

  await safeCreate(() => databases.createCollection(
    DATABASE_ID, cid, 'Questions',
    [sdk.Permission.read(sdk.Role.any()), sdk.Permission.create(sdk.Role.any()), sdk.Permission.update(sdk.Role.any()), sdk.Permission.delete(sdk.Role.any())]
  ), 'Collection: questions');

  const existing = await getExistingAttrs(cid);
  console.log(`  Existing attributes: ${existing.size}`);

  await addStringAttr(cid, 'title', 255, false, existing);
  await addStringAttr(cid, 'difficulty', 50, false, existing);
  await addIntAttr(cid, 'points', false, existing);
  await addStringAttr(cid, 'category', 255, false, existing);
  await addStringAttr(cid, 'description', 10000, false, existing);
  await addStringAttr(cid, 'statement', 10000, false, existing);
  await addStringAttr(cid, 'input_format', 2000, false, existing);
  await addStringAttr(cid, 'output_format', 2000, false, existing);
  await addStringAttr(cid, 'constraints', 5000, false, existing);
  await addStringAttr(cid, 'sample_input', 5000, false, existing);
  await addStringAttr(cid, 'sample_output', 5000, false, existing);
  await addStringAttr(cid, 'explanation', 5000, false, existing);
  await addStringAttr(cid, 'time_limit', 50, false, existing);
  await addStringAttr(cid, 'memory_limit', 50, false, existing);
  await addStringAttr(cid, 'boilerplates', 10000, false, existing);
  await addStringAttr(cid, 'created_at', 100, false, existing);
  // camelCase aliases
  await addStringAttr(cid, 'inputFormat', 2000, false, existing);
  await addStringAttr(cid, 'outputFormat', 2000, false, existing);
  await addStringAttr(cid, 'sampleInput', 5000, false, existing);
  await addStringAttr(cid, 'sampleOutput', 5000, false, existing);
  await addStringAttr(cid, 'timeLimit', 50, false, existing);
  await addStringAttr(cid, 'memoryLimit', 50, false, existing);
  await addStringAttr(cid, 'createdAt', 100, false, existing);
  await addStringAttr(cid, 'updatedAt', 100, false, existing);
}

// ══════════════════════════════════════════════════════════════
async function setupTestCases() {
  console.log('\n🧪 TEST_CASES COLLECTION');
  const cid = 'test_cases';

  const created = await safeCreate(() => databases.createCollection(
    DATABASE_ID, cid, 'Test Cases',
    [sdk.Permission.read(sdk.Role.any()), sdk.Permission.create(sdk.Role.any()), sdk.Permission.update(sdk.Role.any()), sdk.Permission.delete(sdk.Role.any())]
  ), 'Collection: test_cases');

  if (created) {
    console.log('  ⏳ Waiting for collection to provision...');
    await wait(3000);
  }

  const existing = await getExistingAttrs(cid);
  console.log(`  Existing attributes: ${existing.size}`);

  await addStringAttr(cid, 'question_id', 255, false, existing);
  await addStringAttr(cid, 'input', 10000, false, existing);
  await addStringAttr(cid, 'expected_output', 10000, false, existing);
  await addBoolAttr(cid, 'is_hidden', false, existing);

  console.log('  ⏳ Waiting for attributes...');
  await wait(5000);

  await safeCreate(() => databases.createIndex(DATABASE_ID, cid, 'idx_qid', 'key', ['question_id']), 'Index: question_id');
}

// ══════════════════════════════════════════════════════════════
async function setupContests() {
  console.log('\n🏆 CONTESTS COLLECTION');
  const cid = 'contests';

  await safeCreate(() => databases.createCollection(
    DATABASE_ID, cid, 'Contests',
    [sdk.Permission.read(sdk.Role.any()), sdk.Permission.create(sdk.Role.any()), sdk.Permission.update(sdk.Role.any()), sdk.Permission.delete(sdk.Role.any())]
  ), 'Collection: contests');

  const existing = await getExistingAttrs(cid);
  console.log(`  Existing attributes: ${existing.size}`);

  await addStringAttr(cid, 'name', 255, false, existing);
  await addStringAttr(cid, 'description', 5000, false, existing);
  await addStringAttr(cid, 'start_time', 255, false, existing);
  await addStringAttr(cid, 'end_time', 255, false, existing);
  await addStringAttr(cid, 'question_ids', 5000, false, existing);
  await addStringAttr(cid, 'anti_cheat', 5000, false, existing);
  await addStringAttr(cid, 'created_at', 100, false, existing);
  await addStringAttr(cid, 'status', 50, false, existing);
  await addIntAttr(cid, 'problems', false, existing);
  await addIntAttr(cid, 'totalProblems', false, existing);
  await addIntAttr(cid, 'maxScore', false, existing);
  await addStringAttr(cid, 'startTime', 255, false, existing);
  await addStringAttr(cid, 'endTime', 255, false, existing);
  await addStringAttr(cid, 'createdAt', 100, false, existing);
  await addStringAttr(cid, 'updatedAt', 100, false, existing);
}

// ══════════════════════════════════════════════════════════════
async function setupSubmissions() {
  console.log('\n📤 SUBMISSIONS COLLECTION');
  const cid = 'submissions';

  await safeCreate(() => databases.createCollection(
    DATABASE_ID, cid, 'Submissions',
    [sdk.Permission.read(sdk.Role.any()), sdk.Permission.create(sdk.Role.any()), sdk.Permission.update(sdk.Role.any()), sdk.Permission.delete(sdk.Role.any())]
  ), 'Collection: submissions');

  const existing = await getExistingAttrs(cid);
  console.log(`  Existing attributes: ${existing.size}`);

  await addStringAttr(cid, 'question_id', 255, false, existing);
  await addStringAttr(cid, 'question_title', 255, false, existing);
  await addStringAttr(cid, 'contest_id', 255, false, existing);
  await addStringAttr(cid, 'user_email', 255, false, existing);
  await addStringAttr(cid, 'user_name', 255, false, existing);
  await addStringAttr(cid, 'source_code', 50000, false, existing);
  await addStringAttr(cid, 'language_id', 50, false, existing);
  await addIntAttr(cid, 'passed_count', false, existing);
  await addIntAttr(cid, 'total_count', false, existing);
  await addBoolAttr(cid, 'passed_all', false, existing);
  await addIntAttr(cid, 'points', false, existing);
  await addStringAttr(cid, 'results', 50000, false, existing);
  await addStringAttr(cid, 'timestamp', 255, false, existing);
  await addStringAttr(cid, 'user_id', 255, false, existing);
  await addStringAttr(cid, 'status', 50, false, existing);
  await addStringAttr(cid, 'language', 50, false, existing);
  await addStringAttr(cid, 'code', 50000, false, existing);
  await addIntAttr(cid, 'time_taken', false, existing);
  await addIntAttr(cid, 'runtime', false, existing);
  await addIntAttr(cid, 'memory', false, existing);
}

// ══════════════════════════════════════════════════════════════
async function setupProctorLogs() {
  console.log('\n🔒 PROCTOR_LOGS COLLECTION');
  const cid = 'proctor_logs';

  await safeCreate(() => databases.createCollection(
    DATABASE_ID, cid, 'Proctor Logs',
    [sdk.Permission.read(sdk.Role.any()), sdk.Permission.create(sdk.Role.any()), sdk.Permission.update(sdk.Role.any()), sdk.Permission.delete(sdk.Role.any())]
  ), 'Collection: proctor_logs');

  const existing = await getExistingAttrs(cid);
  console.log(`  Existing attributes: ${existing.size}`);

  // Core fields used by the frontend logging (StudentLayout.tsx addWarning)
  await addStringAttr(cid, 'user_id', 255, false, existing);
  await addStringAttr(cid, 'user_email', 255, false, existing);
  await addStringAttr(cid, 'user_name', 255, false, existing);
  await addStringAttr(cid, 'contest_id', 255, false, existing);
  await addStringAttr(cid, 'type', 255, false, existing);
  await addStringAttr(cid, 'message', 5000, false, existing);
  await addStringAttr(cid, 'timestamp', 255, false, existing);
  await addStringAttr(cid, 'code_snapshot', 50000, false, existing);
  await addStringAttr(cid, 'screenshot_url', 1000000, false, existing);

  // Legacy fields (backward compat)
  await addStringAttr(cid, 'event_type', 255, false, existing);
  await addStringAttr(cid, 'event', 255, false, existing);
  await addStringAttr(cid, 'details', 5000, false, existing);
  await addStringAttr(cid, 'screenshotUrl', 2000, false, existing);
  await addStringAttr(cid, 'severity', 50, false, existing);
}

// ══════════════════════════════════════════════════════════════
async function setupUsers() {
  console.log('\n👤 USERS COLLECTION');
  const cid = 'users';

  await safeCreate(() => databases.createCollection(
    DATABASE_ID, cid, 'Users',
    [sdk.Permission.read(sdk.Role.any()), sdk.Permission.create(sdk.Role.any()), sdk.Permission.update(sdk.Role.any()), sdk.Permission.delete(sdk.Role.any())]
  ), 'Collection: users');

  const existing = await getExistingAttrs(cid);
  console.log(`  Existing attributes: ${existing.size}`);

  await addStringAttr(cid, 'username', 255, false, existing);
  await addStringAttr(cid, 'email', 255, false, existing);
  await addIntAttr(cid, 'score', false, existing);
}

// ══════════════════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' APPWRITE SCHEMA SETUP — SecureProctor');
  console.log(`  Endpoint: ${ENDPOINT}`);
  console.log(`  Project:  ${PROJECT_ID}`);
  console.log(`  Database: ${DATABASE_ID}`);
  console.log('═══════════════════════════════════════════════════════');

  await setupQuestions();
  await setupTestCases();
  await setupContests();
  await setupSubmissions();
  await setupProctorLogs();
  await setupUsers();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(' ✅ SCHEMA SETUP COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
