/**
 * ═══════════════════════════════════════════════════════════════════
 *  FIREBASE → APPWRITE DATA MIGRATION
 *  Run: node migrateFirebaseToAppwrite.js
 * ═══════════════════════════════════════════════════════════════════
 */
const admin = require('firebase-admin');
const appwriteSdk = require('node-appwrite');
const serviceAccount = require('./serviceAccountKey.json');
require('dotenv').config({ path: '../.env' });

// ── Firebase ────────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const firestore = admin.firestore();

// ── Appwrite ────────────────────────────────────────────────
const client = new appwriteSdk.Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.VITE_APPWRITE_API_KEY);

const databases = new appwriteSdk.Databases(client);
const DB = process.env.VITE_APPWRITE_DB_ID;

// ── Helpers ─────────────────────────────────────────────────
function trunc(str, max) {
  if (!str) return '';
  if (typeof str !== 'string') str = JSON.stringify(str);
  return str.length > max ? str.substring(0, max) : str;
}

function tr(s, max) {
  if (!s) return '';
  if (typeof s !== 'string') {
    if (s && s._seconds) return new Date(s._seconds * 1000).toISOString();
    s = JSON.stringify(s);
  }
  return s.length > max ? s.substring(0, max) : s;
}

function sanitizeId(id) {
  return id.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 36);
}

async function upsertDoc(col, docId, data) {
  try {
    await databases.createDocument(DB, col, docId, data);
    return 'created';
  } catch (e) {
    if (e.code === 409) {
      try {
        await databases.updateDocument(DB, col, docId, data);
        return 'updated';
      } catch (ue) {
        console.error(`    ✗ Update ${docId}: ${ue.message}`);
        return 'failed';
      }
    }
    console.error(`    ✗ Create ${docId}: ${e.message}`);
    return 'failed';
  }
}

// ══════════════════════════════════════════════════════════════
//  MIGRATE QUESTIONS
//  Required attrs: title, difficulty, points, statement,
//                  inputFormat, outputFormat, timeLimit, memoryLimit
// ══════════════════════════════════════════════════════════════
async function migrateQuestions() {
  console.log('\n📋 Migrating QUESTIONS...');
  const snap = await firestore.collection('questions').get();
  console.log(`  Found ${snap.size} in Firebase`);

  let ok = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const id = sanitizeId(doc.id);

    // Normalize constraints
    let constraintsStr = '';
    if (Array.isArray(d.constraints)) constraintsStr = d.constraints.join('\n');
    else if (typeof d.constraints === 'string') constraintsStr = d.constraints;

    // Build payload matching exact Appwrite schema
    // Required fields get defaults if missing
    const payload = {
      title:        trunc(d.title || 'Untitled', 255),
      difficulty:   trunc(d.difficulty || 'Medium', 50),
      points:       d.points || 100,
      statement:    trunc(d.description || d.statement || 'No statement', 5000),
      inputFormat:  trunc(d.input_format || d.inputFormat || 'Standard input', 1000),
      outputFormat: trunc(d.output_format || d.outputFormat || 'Standard output', 1000),
      timeLimit:    trunc(d.time_limit || d.timeLimit || '2 seconds', 50),
      memoryLimit:  trunc(d.memory_limit || d.memoryLimit || '256 MB', 50),
      // Optional fields
      sampleInput:  trunc(d.sample_input || d.sampleInput || '', 1000),
      sampleOutput: trunc(d.sample_output || d.sampleOutput || '', 1000),
      constraints:  trunc(constraintsStr, 2000),
      explanation:  trunc(d.explanation || '', 2000),
      category:     trunc(d.category || '', 255),
      input_format: trunc(d.input_format || '', 2000),
      time_limit:   trunc(d.time_limit || d.timeLimit || '', 50),
      memory_limit: trunc(d.memory_limit || d.memoryLimit || '', 50),
      created_at:   tr(d.created_at || d.createdAt || new Date(), 100),
      createdAt:    tr(d.createdAt || d.created_at || new Date(), 100),
    };

    const status = await upsertDoc('questions', id, payload);
    if (status !== 'failed') {
      ok++;
      console.log(`  ✓ [${status}] ${d.title} → ${id}`);
    }
  }
  console.log(`  📊 Questions: ${ok}/${snap.size}`);
}

// ══════════════════════════════════════════════════════════════
//  MIGRATE TEST_CASES
//  All attrs optional: question_id, input, expected_output, is_hidden
// ══════════════════════════════════════════════════════════════
async function migrateTestCases() {
  console.log('\n🧪 Migrating TEST_CASES...');
  const snap = await firestore.collection('test_cases').get();
  console.log(`  Found ${snap.size} in Firebase`);

  let ok = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const id = sanitizeId(doc.id);

    const payload = {
      question_id:     sanitizeId(d.question_id || ''),
      input:           trunc(d.input || '', 2000),
      expected_output: trunc(d.expected_output || '', 2000),
      is_hidden:       !!d.is_hidden,
    };

    const status = await upsertDoc('test_cases', id, payload);
    if (status !== 'failed') ok++;
  }
  console.log(`  📊 Test cases: ${ok}/${snap.size}`);
}

// ══════════════════════════════════════════════════════════════
//  MIGRATE CONTESTS
//  Required: startTime, endTime
// ══════════════════════════════════════════════════════════════
async function migrateContests() {
  console.log('\n🏆 Migrating CONTESTS...');
  const snap = await firestore.collection('contests').get();
  console.log(`  Found ${snap.size} in Firebase`);

  let ok = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const id = sanitizeId(doc.id);

    let qIds = d.question_ids || d.questionIds || [];
    if (Array.isArray(qIds)) qIds = JSON.stringify(qIds);

    const payload = {
      name:         trunc(d.name || 'Contest', 255),
      description:  trunc(d.description || '', 1000),
      startTime:    tr(d.start_time || d.startTime || new Date(), 255),
      endTime:      tr(d.end_time || d.endTime || new Date(), 255),
      start_time:   tr(d.start_time || d.startTime || '', 255),
      end_time:     tr(d.end_time || d.endTime || '', 255),
      question_ids: trunc(qIds, 5000),
      status:       trunc(d.status || 'active', 50),
      created_at:   tr(d.created_at || d.createdAt || new Date(), 100),
      createdAt:    tr(d.createdAt || d.created_at || new Date(), 100),
      updatedAt:    tr(d.updatedAt || new Date(), 100),
    };

    const status = await upsertDoc('contests', id, payload);
    if (status !== 'failed') {
      ok++;
      console.log(`  ✓ [${status}] ${d.name} → ${id}`);
    }
  }
  console.log(`  📊 Contests: ${ok}/${snap.size}`);
}

// ══════════════════════════════════════════════════════════════
//  MIGRATE SUBMISSIONS
//  Required: question_id, user_id, status, language, code, timestamp
// ══════════════════════════════════════════════════════════════
async function migrateSubmissions() {
  console.log('\n📤 Migrating SUBMISSIONS...');
  const snap = await firestore.collection('submissions').get();
  console.log(`  Found ${snap.size} in Firebase`);

  let ok = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const id = sanitizeId(doc.id);

    let resultsStr = '';
    if (d.results) resultsStr = typeof d.results === 'string' ? d.results : JSON.stringify(d.results);

    const payload = {
      question_id:    d.question_id || 'unknown',
      user_id:        d.user_id || d.user_email || 'unknown',
      status:         trunc(d.status || (d.passed_all ? 'Accepted' : 'Wrong Answer'), 50),
      language:       trunc(d.language || String(d.language_id || 'cpp'), 50),
      code:           trunc(d.code || d.source_code || '', 5000),
      timestamp:      d.timestamp || new Date().toISOString(),
      // Optional
      question_title: trunc(d.question_title || '', 255),
      contest_id:     d.contest_id || null,
      user_email:     trunc(d.user_email || '', 255),
      user_name:      trunc(d.user_name || '', 255),
      source_code:    trunc(d.source_code || d.code || '', 50000),
      language_id:    trunc(String(d.language_id || ''), 50),
      passed_count:   d.passed_count || 0,
      total_count:    d.total_count || 0,
      passed_all:     !!d.passed_all,
      points:         d.points || 0,
      results:        trunc(resultsStr, 50000),
    };

    const status = await upsertDoc('submissions', id, payload);
    if (status !== 'failed') ok++;
  }
  console.log(`  📊 Submissions: ${ok}/${snap.size}`);
}

// ══════════════════════════════════════════════════════════════
//  MIGRATE PROCTORING LOGS
//  Required: user_id, event_type, timestamp
// ══════════════════════════════════════════════════════════════
function tr(s, max) {
  if (!s) return '';
  if (typeof s !== 'string') {
    if (s && s._seconds) return new Date(s._seconds * 1000).toISOString();
    s = JSON.stringify(s);
  }
  return s.length > max ? s.substring(0, max) : s;
}

async function migrateProctoringLogs() {
  console.log('\n🔒 Migrating PROCTORING_LOGS...');
  
  const collections = ['proctoring_logs', 'proctor_logs'];
  let totalMigrated = 0;

  for (const fCol of collections) {
    let snap;
    try {
      snap = await firestore.collection(fCol).get();
      console.log(`  Found ${snap.size} in Firebase [${fCol}]`);
    } catch (e) {
      console.log(`  ⊘ Could not read ${fCol}: ${e.message}`);
      continue;
    }

    for (const doc of snap.docs) {
      const d = doc.data();
      const id = sanitizeId(doc.id);

      const payload = {
        user_id:       trunc(d.user_id || d.userId || 'unknown', 255),
        event_type:    trunc(d.event_type || d.event || 'unknown', 255),
        timestamp:     tr(d.timestamp || new Date(), 255),
        user_email:    trunc(d.user_email || '', 255),
        event:         trunc(d.event || d.event_type || '', 255),
        details:       trunc(d.details || '', 1000),
        screenshotUrl: trunc(d.screenshotUrl || '', 2000),
        contest_id:    trunc(d.contest_id || '', 255),
        severity:      trunc(d.severity || '', 50),
      };

      const status = await upsertDoc('proctor_logs', id, payload);
      if (status !== 'failed') totalMigrated++;
    }
  }
  console.log(`  📊 Total Proctoring logs: ${totalMigrated}`);
}

// ══════════════════════════════════════════════════════════════
//  MIGRATE USERS
//  Required: username, email
// ══════════════════════════════════════════════════════════════
async function migrateUsers() {
  console.log('\n👤 Migrating USERS...');
  const snap = await firestore.collection('users').get();
  console.log(`  Found ${snap.size} in Firebase`);

  let ok = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const id = sanitizeId(doc.id);

    const payload = {
      username: trunc(d.username || d.name || d.email?.split('@')[0] || 'user', 255),
      email:    trunc(d.email || `${id}@proctor.local`, 255),
      score:    d.score || 0,
    };

    const status = await upsertDoc('users', id, payload);
    if (status !== 'failed') {
      ok++;
      console.log(`  ✓ [${status}] ${payload.username}`);
    }
  }
  console.log(`  📊 Users: ${ok}/${snap.size}`);
}

// ══════════════════════════════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' 🔥→☁️  FIREBASE → APPWRITE MIGRATION');
  console.log(`  Firebase: ${serviceAccount.project_id}`);
  console.log(`  Appwrite: ${DB}`);
  console.log('═══════════════════════════════════════════════════════');

  await migrateQuestions();
  await migrateTestCases();
  await migrateContests();
  await migrateSubmissions();
  await migrateProctoringLogs();
  await migrateUsers();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(' ✅ MIGRATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
