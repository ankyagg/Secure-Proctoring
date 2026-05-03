const express = require('express');
const cors = require('cors');
const sdk = require('node-appwrite');
const { judgeSubmission } = require('./judge');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

// ── Appwrite Client ────────────────────────────────────────
const API_KEY = process.env.VITE_APPWRITE_API_KEY;
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '69ec85ee00105396979f';
const DATABASE_ID = process.env.VITE_APPWRITE_DB_ID || '69ec8871002bec20d3fc';
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';

if (!API_KEY) {
  console.error('⚠️  WARNING: VITE_APPWRITE_API_KEY not set. Backend will fail on DB calls.');
}

const client = new sdk.Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new sdk.Databases(client);

// ── Helper: list ALL documents (handles Appwrite's 25-doc default limit) ──
async function listAll(collectionId, queries = []) {
  const allDocs = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [
      ...queries,
      sdk.Query.limit(limit),
      sdk.Query.offset(offset),
    ]);
    allDocs.push(...response.documents);
    if (response.documents.length < limit) break;
    offset += limit;
  }

  return allDocs;
}

// ── GET /api/questions ─────────────────────────────────────
app.get('/api/questions', async (req, res) => {
  try {
    const { difficulty } = req.query;
    const queries = [];
    if (difficulty) queries.push(sdk.Query.equal('difficulty', difficulty));

    const docs = await listAll('questions', queries);
    const questions = docs.map(d => ({ id: d.$id, ...d }));
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/questions/:id ─────────────────────────────────
app.get('/api/questions/:id', async (req, res) => {
  try {
    const doc = await databases.getDocument(DATABASE_ID, 'questions', req.params.id);

    // Fetch visible test cases for this question
    const tcDocs = await listAll('test_cases', [
      sdk.Query.equal('question_id', req.params.id),
      sdk.Query.equal('is_hidden', false),
    ]);

    const testCases = tcDocs.map(d => ({ id: d.$id, ...d }));
    res.json({ id: doc.$id, ...doc, test_cases: testCases });
  } catch (err) {
    if (err.code === 404) return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/contests ──────────────────────────────────────
app.get('/api/contests', async (req, res) => {
  try {
    const docs = await listAll('contests');
    res.json(docs.map(d => ({ id: d.$id, ...d })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/contests/:id ──────────────────────────────────
app.get('/api/contests/:id', async (req, res) => {
  try {
    const doc = await databases.getDocument(DATABASE_ID, 'contests', req.params.id);
    const contest = { id: doc.$id, ...doc };

    let qIds = contest.question_ids || [];
    if (typeof qIds === 'string') {
      try { qIds = JSON.parse(qIds); } catch (e) { qIds = []; }
    }
    if (!Array.isArray(qIds)) qIds = [];

    const questions = await Promise.all(
      qIds.map(async (qid) => {
        const id = typeof qid === 'string' ? qid : qid?.id;
        if (!id) return null;
        try {
          const q = await databases.getDocument(DATABASE_ID, 'questions', id);
          return { id: q.$id, ...q };
        } catch (e) {
          console.error(`Failed to fetch question ${id}:`, e.message);
          return null;
        }
      })
    );

    res.json({ ...contest, questions: questions.filter(Boolean) });
  } catch (err) {
    if (err.code === 404) return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/contests ─────────────────────────────────────
app.post('/api/contests', async (req, res) => {
  const { name, start_time, end_time, question_ids } = req.body;
  if (!name || !start_time || !end_time || !question_ids?.length)
    return res.status(400).json({ error: 'All fields required' });

  try {
    const doc = await databases.createDocument(DATABASE_ID, 'contests', sdk.ID.unique(), {
      name,
      start_time,
      end_time,
      question_ids: JSON.stringify(question_ids),
      created_at: new Date().toISOString()
    });
    res.status(201).json({ id: doc.$id, message: 'Contest created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── GET /api/submissions ───────────────────────────────────
app.get('/api/submissions', async (req, res) => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'submissions', [
      sdk.Query.orderDesc('$createdAt'),
      sdk.Query.limit(100),
    ]);
    res.json(response.documents.map(d => ({ id: d.$id, ...d })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/leaderboard ───────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
  try {
    const docs = await listAll('submissions', [
      sdk.Query.equal('passed_all', true),
    ]);

    const scores = {};
    docs.forEach(data => {
      const email = data.user_email;
      if (!email) return;
      if (!scores[email]) {
        scores[email] = {
          email,
          user: data.user_name || email.split('@')[0],
          solved: new Set(),
          total_points: 0,
          last_submission: data.timestamp || data.$createdAt
        };
      }
      if (!scores[email].solved.has(data.question_id)) {
        scores[email].solved.add(data.question_id);
        scores[email].total_points += (data.points || 100);
      }
      const ts = data.timestamp || data.$createdAt;
      if (ts > scores[email].last_submission) {
        scores[email].last_submission = ts;
      }
    });

    const leaderboard = Object.values(scores).map(s => ({
      ...s,
      solved: s.solved.size
    })).sort((a, b) => b.total_points - a.total_points || a.last_submission.localeCompare(b.last_submission));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/stats ─────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const [qDocs, cDocs, sDocs] = await Promise.all([
      databases.listDocuments(DATABASE_ID, 'questions', [sdk.Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, 'contests', [sdk.Query.limit(1)]),
      databases.listDocuments(DATABASE_ID, 'submissions', [sdk.Query.limit(1)]),
    ]);

    // Get unique users from submissions
    const allSubs = await listAll('submissions');
    const uniqueUsers = new Set(allSubs.map(d => d.user_email).filter(Boolean)).size;

    res.json({
      questions: qDocs.total,
      contests: cDocs.total,
      submissions: sDocs.total,
      users: uniqueUsers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PROCTORING LOGS ────────────────────────────────────────
app.get('/api/proctor/logs', async (req, res) => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, 'proctor_logs', [
      sdk.Query.orderDesc('$createdAt'),
      sdk.Query.limit(100),
    ]);
    res.json(response.documents.map(d => ({ id: d.$id, ...d })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/proctor/logs ──────────────────────────────────
app.delete('/api/proctor/logs', async (req, res) => {
  try {
    const docs = await listAll('proctor_logs');
    if (!docs.length) {
      return res.status(200).json({ message: 'No logs to delete.' });
    }

    for (const doc of docs) {
      await databases.deleteDocument(DATABASE_ID, 'proctor_logs', doc.$id);
    }

    res.status(200).json({ message: 'All logs deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: `Failed to delete logs: ${err.message}` });
  }
});

// ── POST /api/proctor/logs ───────────────────────────────────
app.post('/api/proctor/logs', async (req, res) => {
  try {
    const logData = {
      ...req.body,
      timestamp: req.body.timestamp || new Date().toISOString()
    };
    const doc = await databases.createDocument(DATABASE_ID, 'proctor_logs', sdk.ID.unique(), logData);
    res.status(201).json({ id: doc.$id, message: 'Log recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── POST /api/submit ───────────────────────────────────────
app.post('/api/submit', async (req, res) => {
  const { question_id, code, source_code, language, language_id, user_id, user_email, user_name, contest_id } = req.body;
  const actualCode = source_code || code;
  const actualLang = language_id || language;
  const actualEmail = user_email || user_id;

  if (!question_id || !actualCode || !actualLang || !actualEmail)
    return res.status(400).json({ error: 'Required fields: question_id, code/source_code, language/language_id, user_email/user_id' });

  try {
    const qDoc = await databases.getDocument(DATABASE_ID, 'questions', question_id);

    const tcDocs = await listAll('test_cases', [
      sdk.Query.equal('question_id', question_id),
    ]);

    const testCases = tcDocs.map(d => ({
      id: d.$id,
      input: d.input,
      expected_output: d.expected_output,
      is_hidden: d.is_hidden,
    }));

    if (!testCases.length)
      return res.status(404).json({ error: 'No test cases found' });

    const results = await judgeSubmission(actualCode, actualLang, testCases);
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const passed_all = passed === total;

    // Save submission to Appwrite
    const submissionDoc = await databases.createDocument(DATABASE_ID, 'submissions', sdk.ID.unique(), {
      question_id,
      user_id: user_id || actualEmail || 'ANONYMOUS',
      status: passed_all ? 'passed' : 'failed',
      language: String(language || 'C++'),
      code: actualCode,
      timestamp: new Date().toISOString(),
      
      // Optional/Additional fields
      question_title: qDoc.title || '',
      contest_id: contest_id || null,
      user_email: actualEmail || 'anonymous@node',
      user_name: user_name || (actualEmail ? actualEmail.split('@')[0] : 'ANON'),
      source_code: actualCode,
      language_id: String(actualLang),
      passed_count: passed,
      total_count: total,
      passed_all,
      points: passed_all ? (qDoc.points || 100) : 0,
      results: JSON.stringify(results)
    });

    res.json({
      id: submissionDoc.$id,
      passed,
      total,
      score: Math.round((passed / total) * 100),
      passed_all,
      points: passed_all ? (qDoc.points || 100) : 0,
      results
    });
  } catch (err) {
    if (err.code === 404) return res.status(404).json({ error: 'Question not found' });
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT} (Appwrite)`));
