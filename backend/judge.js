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
  const results = [];
  
  for (const tc of testCases) {
    let attempts = 0;
    const maxAttempts = 3;
    let tcResult = null;

    while (attempts < maxAttempts) {
      try {
        const output = await runCode(sourceCode, languageId, tc.input);
        const actual = (output.stdout || '').trim();
        const expected = (tc.expected_output || '').trim();
        
        console.log(`[JUDGE] TC ${tc.id} Debug:`);
        console.log(`  Input:    [${tc.input.replace(/\n/g, '\\n')}]`);
        if (output.stderr) console.error(`  Stderr:   ${output.stderr}`);
        
        // If we got an empty response from Wandbox but expected output, retry
        if (actual === "" && expected !== "" && attempts < maxAttempts - 1) {
          console.warn(`[JUDGE] TC ${tc.id} returned empty, retrying (${attempts + 1}/${maxAttempts})...`);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          continue;
        }

        const actualTokens = actual.split(/[\s\r\n,\[\]]+/).filter(Boolean);
        const expectedTokens = expected.split(/[\s\r\n,\[\]]+/).filter(Boolean);
        
        const passed = actualTokens.length === expectedTokens.length && 
                       actualTokens.every((val, i) => val === expectedTokens[i]);
        
        console.log(`[JUDGE] TC ${tc.id} Tokens: Actual:[${actualTokens}] Expected:[${expectedTokens}]`);
        console.log(`[JUDGE] Verdict: ${passed ? '✅ PASSED' : '❌ FAILED'}`);

        tcResult = {
          test_case_id: tc.id,
          passed,
          stdout: output.stdout,
          stderr: output.stderr,
          time: "0.1s", 
          memory: "128KB"
        };
        break; // Success or WA, move to next TC
      } catch (err) {
        attempts++;
        console.error(`[JUDGE ERROR] TC ${tc.id} Attempt ${attempts}:`, err.message);
        if (attempts >= maxAttempts) {
          tcResult = {
            test_case_id: tc.id,
            passed: false,
            error: err.message,
            status: 'Error'
          };
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    results.push(tcResult);
    // Add a small pause between different test cases to be safe
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

module.exports = { judgeSubmission };
