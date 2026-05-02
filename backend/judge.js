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
  // Wandbox combines stdout and stderr sometimes, but usually it's in program_output
  return {
    stdout: data.program_output || data.stdout || "",
    stderr: data.program_error || data.stderr || "",
    status: { id: (data.status === "0" || data.status === 0) ? 3 : 4 } // 3 = Accepted (for the runner)
  };
}

async function judgeSubmission(sourceCode, languageId, testCases) {
  const results = [];

  for (const tc of testCases) {
    try {
      const output = await runCode(sourceCode, languageId, tc.input);
      const actual = (output.stdout || '').trim();
      const expected = tc.expected_output.trim();
      
      console.log(`[JUDGE] TC ${tc.id}:`);
      console.log(`  Actual: "${actual}"`);
      console.log(`  Expected: "${expected}"`);

      // SUPER-TOKEN SPLIT: Handles \r, \n, and multiple spaces
      const actualTokens = actual.split(/[\s\r\n]+/).filter(Boolean).sort();
      const expectedTokens = expected.split(/[\s\r\n]+/).filter(Boolean).sort();
      
      const passed = actualTokens.length === expectedTokens.length && 
                     actualTokens.every((val, index) => val === expectedTokens[index]);
      
      console.log(`  Passed: ${passed}`);

      results.push({
        test_case_id: tc.id,
        passed,
        stdout: output.stdout,
        stderr: output.stderr,
        time: "0.1s", // Wandbox doesn't give precise per-case time easily
        memory: "128KB"
      });
    } catch (err) {
      console.error("[JUDGE ERROR]", err);
      results.push({
        test_case_id: tc.id,
        passed: false,
        error: err.message,
        status: 'Error',
      });
    }
  }

  return results;
}

module.exports = { judgeSubmission };
