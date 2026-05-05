const express = require('express');
const cors = require('cors');
const sdk = require('node-appwrite');
const axios = require('axios');
require('dotenv').config(); 
require('dotenv').config({ path: '../.env' }); 
require('dotenv').config({ path: './.env' }); 
require('dotenv').config({ path: '../../.env' }); 
const { judgeSubmission } = require('./judge');

const app = express();
app.use(cors());
app.use(express.json());

// ── Serve Frontend ───────────────────────────────────────────
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));

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
    const { user_email } = req.query;
    const queries = [
      sdk.Query.orderDesc('$createdAt'),
      sdk.Query.limit(100),
    ];
    if (user_email) {
      queries.push(sdk.Query.equal('user_email', user_email));
    }
    const response = await databases.listDocuments(DATABASE_ID, 'submissions', queries);
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

// ── GET /api/proctor/stats ─────────────────────────────────────────
app.get('/api/proctor/stats', async (req, res) => {
  try {
    const { user_email, contest_id } = req.query;
    const queries = [];
    if (user_email) queries.push(sdk.Query.equal('user_email', user_email));
    if (contest_id) queries.push(sdk.Query.equal('contest_id', contest_id));
    
    const docs = await listAll('violation_stats', queries);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/proctor/logs ───────────────────────────────────
app.post('/api/proctor/logs', async (req, res) => {
  try {
    const logData = {
      ...req.body,
      timestamp: req.body.timestamp || new Date().toISOString()
    };
    
    const { user_email, contest_id } = logData;
    
    if (user_email) {
      // 1. Maintain persistent violation stats
      const statsQueries = [sdk.Query.equal('user_email', user_email)];
      if (contest_id) {
        statsQueries.push(sdk.Query.equal('contest_id', contest_id));
      } else {
        // Since we didn't make contest_id required in Appwrite, fallback to global
        // We'll just search for docs that have no contest_id or global
      }
      
      try {
        const statsDocs = await listAll('violation_stats', statsQueries);
        
        // Exact match for contest
        const exactStat = statsDocs.find(d => (d.contest_id || '') === (contest_id || ''));
        
        if (exactStat) {
          await databases.updateDocument(DATABASE_ID, 'violation_stats', exactStat.$id, {
            total_violations: (exactStat.total_violations || 0) + 1
          });
        } else {
          await databases.createDocument(DATABASE_ID, 'violation_stats', sdk.ID.unique(), {
            user_email,
            contest_id: contest_id || '',
            total_violations: 1
          });
        }
      } catch (statsErr) {
        console.error('Failed to update violation_stats:', statsErr.message);
      }
      
      // 2. Perform Log Rotation (Max 5 logs per user per contest)
      try {
        const logQueries = [
          sdk.Query.equal('user_email', user_email),
          sdk.Query.orderAsc('$createdAt')
        ];
        if (contest_id) {
          logQueries.push(sdk.Query.equal('contest_id', contest_id));
        }
        
        const existingLogs = await listAll('proctor_logs', logQueries);
        
        // If 5 or more existing logs, delete the oldest to make room for this new 1
        if (existingLogs.length >= 5) {
          const toDelete = existingLogs.length - 4; // Keeps 4, plus new 1 = 5
          for (let i = 0; i < toDelete; i++) {
            await databases.deleteDocument(DATABASE_ID, 'proctor_logs', existingLogs[i].$id);
          }
        }
      } catch (rotErr) {
        console.error('Failed log rotation:', rotErr.message);
      }
    }

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

    // Look for stealth test cases in the question document first
    let testCases = [];
    try {
      if (qDoc.explanation && qDoc.explanation.includes("[TC]")) {
        testCases = JSON.parse(qDoc.explanation.split("[TC]")[1]);
      } else if (qDoc.boilerplates) {
        const bp = JSON.parse(qDoc.boilerplates);
        if (bp.__test_cases__) {
          testCases = JSON.parse(bp.__test_cases__);
        }
      }
    } catch (e) {
      console.warn("Stealth TC extraction failed, falling back to collection...");
    }

    // Fallback to separate collection if stealth cases aren't found
    if (!testCases.length) {
      const tcDocs = await listAll('test_cases', [
        sdk.Query.equal('question_id', question_id),
      ]);

      testCases = tcDocs.map(d => ({
        id: d.$id,
        input: d.input,
        expected_output: d.expected_output,
        is_hidden: d.is_hidden,
      }));
    }

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
      score: passed_all ? 100 : 0,
      passed_all,
      points: passed_all ? (qDoc.points || 100) : 0,
      results
    });
  } catch (err) {
    if (err.code === 404) return res.status(404).json({ error: 'Question not found' });
    res.status(500).json({ error: err.message });
  }
});

// AI Test Case Generation
app.post('/api/ai/generate', async (req, res) => {
  const { title, statement, inputFormat, outputFormat, prompt } = req.body;
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    console.error("❌ XAI_API_KEY is missing in .env");
    return res.status(500).json({ error: "XAI_API_KEY not configured on server" });
  }

  console.log(`🤖 AI Generation requested for: "${title}"`);

  const systemPrompt = `You are an expert Competitive Programming test case generator.
  Your task is to generate high-quality test cases based on the provided problem title and statement.
  
  PROBLEM TITLE: ${title}
  PROBLEM STATEMENT: ${statement}
  INPUT FORMAT: ${inputFormat || "Not specified"}
  OUTPUT FORMAT: ${outputFormat || "Not specified"}
  
  You must follow the INPUT FORMAT and OUTPUT FORMAT strictly.
  You must provide a JSON array of objects, where each object has "input" and "output" fields.
  Include edge cases (empty/minimum values, maximum constraints) and random distributions.
  
  When generating the "input" and "output", you MUST calculate them step-by-step internally to ensure 100% mathematical accuracy. 
  
  CRITICAL: 
  1. Both "input" and "output" must be RAW space-separated values only. 
  2. DO NOT use commas, brackets, or any formatting. 
  3. DO NOT include "Input:" or "Output:" labels inside the strings.
  Example Input: "3\n1 2 3\n4 5 6\n7 8 9" is CORRECT.
  Example Output: "15" is CORRECT. 
  "1, 2, 3" is WRONG. "[1, 2, 3]" is WRONG.

  RESPONSE FORMAT (STRICT JSON ONLY):
  {
    "testCases": [
      { "input": "raw_input_string", "expected_output": "expected_output_string" }
    ],
    "suggestedTimeComplexity": "O(...)",
    "suggestedSpaceComplexity": "O(...)"
  }`;

  try {
    console.log("📤 Sending request to Groq...");
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile", // Powerful and fast Groq model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content.trim();
    console.log("✅ Groq Response received successfully");

    // Extract JSON if model included markdown blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const finalJson = jsonMatch ? jsonMatch[0] : content;
    
    res.json(JSON.parse(finalJson));
  } catch (err) {
    if (err.response) {
      console.error("❌ Groq API Error Details:");
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
      
      const detailedMsg = err.response.data?.error?.message || JSON.stringify(err.response.data);
      res.status(err.response.status).json({ error: `Groq API Error: ${detailedMsg}` });
    } else {
      console.error("❌ Network/Unknown Error:", err.message);
      res.status(500).json({ error: `Connection Error: ${err.message}` });
    }
  }
});

// AI Code Analysis (Complexity & Feedback)
app.post('/api/ai/analyze-code', async (req, res) => {
  const { code, language } = req.body;
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "XAI_API_KEY missing" });

  const systemPrompt = `You are a senior software engineer. Analyze the provided ${language} code and determine its Big O Time and Space Complexity.
  Be precise and concise. Return ONLY a JSON object.
  
  FORMAT:
  {
    "timeComplexity": "O(...)",
    "spaceComplexity": "O(...)",
    "explanation": "One short sentence explaining why."
  }`;

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: code }],
      temperature: 0.1
    }, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const content = response.data.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    res.json(JSON.parse(jsonMatch ? jsonMatch[0] : content));
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze code" });
  }
});

// ── Wildcard Route (For React Router) ──────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT} (Appwrite)`));
