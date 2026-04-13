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
    const snap = await db.collection('contests')
      .orderBy('created_at', 'desc')
      .get();
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

    const questions = await Promise.all(
      contest.question_ids.map(async qid => {
        const q = await db.collection('questions').doc(qid).get();
        return q.exists ? { id: q.id, ...q.data() } : null;
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

// ── POST /api/submit ───────────────────────────────────────
app.post('/api/submit', async (req, res) => {
  const { question_id, source_code, language_id } = req.body;
  if (!question_id || !source_code || !language_id)
    return res.status(400).json({ error: 'question_id, source_code, language_id required' });

  try {
    const snap = await db.collection('test_cases')
      .where('question_id', '==', question_id)
      .get();

    const testCases = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!testCases.length)
      return res.status(404).json({ error: 'No test cases found' });

    const results = await judgeSubmission(source_code, language_id, testCases);
    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    res.json({
      passed,
      total,
      score: Math.round((passed / total) * 100),
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));