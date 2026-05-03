const axios = require('axios');
require('dotenv').config();

const WANDBOX_URL = "https://wandbox.org/api/compile.json";
const WANDBOX_COMPILERS = {
  "54": "gcc-head",       // C++
  "62": "openjdk-jdk-22+36", // Java
  "71": "cpython-3.14.0",    // Python
};

async function runCode(sourceCode, languageId, stdin) {
  const compiler = WANDBOX_COMPILERS[String(languageId)] || "gcc-head";
  
  const res = await axios.post(WANDBOX_URL, {
    compiler: compiler,
    code: sourceCode,
    stdin: stdin,
  });

  const data = res.data;
  return {
    stdout: data.program_output || "",
    stderr: data.program_error || "",
    status: { id: (data.status === "0" || data.status === 0) ? 3 : 4 }
  };
}

async function judgeSubmission(sourceCode, languageId, testCases) {
  // Promise.all launches everything simultaneously for true parallel speed
  const results = await Promise.all(testCases.map(async (tc, index) => {
    let attempts = 0;
    const maxAttempts = 3;

    // Small staggered start (10ms per TC) to prevent Wandbox from instantly dropping connections
    await new Promise(resolve => setTimeout(resolve, index * 20));

    while (attempts < maxAttempts) {
      try {
        const output = await runCode(sourceCode, languageId, tc.input);
        const actual = (output.stdout || '').trim();
        const expected = (tc.expected_output || '').trim();
        
        // If we got an empty response from Wandbox but expected output, retry silently
        if (actual === "" && expected !== "" && attempts < maxAttempts - 1) {
          attempts++;
          continue;
        }

        const actualTokens = actual.split(/[\s\r\n]+/).filter(Boolean);
        const expectedTokens = expected.split(/[\s\r\n]+/).filter(Boolean);
        const passed = actualTokens.length === expectedTokens.length && 
                       actualTokens.every((val, i) => val === expectedTokens[i]);
        
        console.log(`[JUDGE] TC ${tc.id}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
        return {
          test_case_id: tc.id,
          passed,
          stdout: output.stdout,
          stderr: output.stderr,
          time: "0.1s", 
          memory: "128KB"
        };
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error(`[JUDGE FATAL] TC ${tc.id}:`, err.message);
          return {
            test_case_id: tc.id,
            passed: false,
            error: err.message,
            status: 'Error'
          };
        }
      }
    }
  }));

  return results;
}

module.exports = { judgeSubmission };
