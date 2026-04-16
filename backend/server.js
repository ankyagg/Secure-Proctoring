const express = require('express');
const cors = require('cors');
const db = require('./firebase');
const { judgeSubmission } = require('./judge');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ── GET /api/questions ─────────────────────────────────────
app.get('/api/questions', async (req, res) => {
  try {
    const { difficulty } = req.query;
    let ref = db.collection('questions');
    if (difficulty) ref = ref.where('difficulty', '==', difficulty);

    const snap = await ref.get();
    const questions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/questions/:id ─────────────────────────────────
app.get('/api/questions/:id', async (req, res) => {
  try {
    const doc = await db.collection('questions').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });

    const tcSnap = await db.collection('test_cases')
      .where('question_id', '==', req.params.id)
      .where('is_hidden', '==', false)
      .get();

    const testCases = tcSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ id: doc.id, ...doc.data(), test_cases: testCases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/contests ──────────────────────────────────────
app.get('/api/contests', async (req, res) => {
  try {
    const snap = await db.collection('contests').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/contests/:id ──────────────────────────────────
app.get('/api/contests/:id', async (req, res) => {
  try {
    const doc = await db.collection('contests').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });

    const contest = { id: doc.id, ...doc.data() };

    let qIds = contest.question_ids || contest.questionIds || [];
    if (!Array.isArray(qIds)) {
      if (typeof qIds === 'string') {
        try { qIds = JSON.parse(qIds); } catch (e) { qIds = []; }
      } else {
        qIds = [];
      }
    }
    const questions = await Promise.all(
      (Array.isArray(qIds) ? qIds : []).map(async (qid) => {
        const id = typeof qid === 'string' ? qid : qid?.id;
        if (!id) return null;
        try {
          const q = await db.collection('questions').doc(id).get();
          return q.exists ? { id: q.id, ...q.data() } : null;
        } catch (e) {
          console.error(`Failed to fetch question ${id}:`, e);
          return null;
        }
      })
    );

    res.json({ ...contest, questions: questions.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/contests ─────────────────────────────────────
app.post('/api/contests', async (req, res) => {
  const { name, start_time, end_time, question_ids } = req.body;
  if (!name || !start_time || !end_time || !question_ids?.length)
    return res.status(400).json({ error: 'All fields required' });

  try {
    const ref = await db.collection('contests').add({
      name,
      start_time,
      end_time,
      question_ids,
      created_at: new Date().toISOString()
    });
    res.status(201).json({ id: ref.id, message: 'Contest created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── GET /api/submissions ───────────────────────────────────
app.get('/api/submissions', async (req, res) => {
  try {
    const snap = await db.collection('submissions')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/leaderboard ───────────────────────────────────
app.get('/api/leaderboard', async (req, res) => {
  try {
    const snap = await db.collection('submissions')
      .where('passed_all', '==', true)
      .get();

    const scores = {};
    snap.docs.forEach(doc => {
      const data = doc.data();
      const email = data.user_email;
      if (!scores[email]) {
        scores[email] = {
          email,
          user: data.user_name || email.split('@')[0],
          solved: new Set(),
          total_points: 0,
          last_submission: data.timestamp
        };
      }
      if (!scores[email].solved.has(data.question_id)) {
        scores[email].solved.add(data.question_id);
        scores[email].total_points += (data.points || 100);
      }
      if (data.timestamp > scores[email].last_submission) {
        scores[email].last_submission = data.timestamp;
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

// ── PROCTORING LOGS ────────────────────────────────────────
app.get('/api/proctor/logs', async (req, res) => {
  try {
    const snap = await db.collection('proctor_logs')
      .orderBy('timestamp', 'desc')
      .get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/proctor/logs', async (req, res) => {
  const { user_email, user_name, type, message, screenshot_url } = req.body;
  try {
    const ref = await db.collection('proctor_logs').add({
      user_email,
      user_name,
      type,
      message,
      screenshot_url: screenshot_url || null,
      timestamp: new Date().toISOString()
    });
    res.status(201).json({ id: ref.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/submit ───────────────────────────────────────
app.post('/api/submit', async (req, res) => {
  const { question_id, source_code, language_id, user_email, user_name, contest_id } = req.body;
  if (!question_id || !source_code || !language_id || !user_email)
    return res.status(400).json({ error: 'Required fields: question_id, source_code, language_id, user_email' });

  try {
    const qDoc = await db.collection('questions').doc(question_id).get();
    if (!qDoc.exists) return res.status(404).json({ error: 'Question not found' });
    const qData = qDoc.data();

    const snap = await db.collection('test_cases')
      .where('question_id', '==', question_id)
      .get();

    const testCases = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!testCases.length)
      return res.status(404).json({ error: 'No test cases found' });

    const results = await judgeSubmission(source_code, language_id, testCases);
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const passed_all = passed === total;

    // Save submission to Firestore
    const submissionRef = await db.collection('submissions').add({
      question_id,
      question_title: qData.title,
      contest_id: contest_id || null,
      user_email,
      user_name: user_name || user_email.split('@')[0],
      source_code,
      language_id,
      passed_count: passed,
      total_count: total,
      passed_all,
      points: passed_all ? (qData.points || 100) : 0,
      results,
      timestamp: new Date().toISOString()
    });

    res.json({
      id: submissionRef.id,
      passed,
      total,
      score: Math.round((passed / total) * 100),
      passed_all,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));