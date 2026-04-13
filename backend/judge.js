const axios = require('axios');
require('dotenv').config();

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

async function runCode(sourceCode, languageId, stdin) {
  // Step 1: Submit
  const submitRes = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
    {
      source_code: sourceCode,
      language_id: languageId,
      stdin: stdin,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const token = submitRes.data.token;

  // Step 2: Poll until done
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1000));

    const result = await axios.get(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const status = result.data.status.id;
    // 1=Queued, 2=Processing, 3+=Done
    if (status > 2) return result.data;
  }

  throw new Error('Execution timed out');
}

async function judgeSubmission(sourceCode, languageId, testCases) {
  const results = [];

  for (const tc of testCases) {
    try {
      const output = await runCode(sourceCode, languageId, tc.input);
      const actual = (output.stdout || '').trim();
      const expected = tc.expected_output.trim();
      const passed = actual === expected;

      results.push({
        test_case_id: tc.id,
        is_hidden: tc.is_hidden,
        passed,
        input: tc.is_hidden ? null : tc.input,
        expected: tc.is_hidden ? null : expected,
        actual: tc.is_hidden ? null : actual,
        error: output.stderr || output.compile_output || null,
        status: output.status.description,
      });
    } catch (err) {
      results.push({
        test_case_id: tc.id,
        is_hidden: tc.is_hidden,
        passed: false,
        error: err.message,
        status: 'Error',
      });
    }
  }

  return results;
}

module.exports = { runCode, judgeSubmission };

