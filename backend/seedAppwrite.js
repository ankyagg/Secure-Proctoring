/**
 * ═══════════════════════════════════════════════════════════════════
 *  SEED APPWRITE WITH DEMO DATA
 *  Run: node seedAppwrite.js
 *  
 *  Prerequisites: Run setupAppwriteSchema.js first!
 * ═══════════════════════════════════════════════════════════════════
 */
const sdk = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const API_KEY = process.env.VITE_APPWRITE_API_KEY;
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || '69ec85ee00105396979f';
const DATABASE_ID = process.env.VITE_APPWRITE_DB_ID || '69ec8871002bec20d3fc';
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';

if (!API_KEY) {
  console.error('❌ Set VITE_APPWRITE_API_KEY in .env');
  process.exit(1);
}

const client = new sdk.Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new sdk.Databases(client);

// ── Problem Data (matches Firebase seed.js exactly) ────────
const problems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    points: 100,
    category: "Hash Map",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    statement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    input_format: "First line contains two integers n (size of array) and target.\nSecond line contains n space-separated integers.",
    output_format: "Print two space-separated integers representing the 0-indexed positions.",
    constraints: "2 ≤ nums.length ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹\n-10⁹ ≤ target ≤ 10⁹\nOnly one valid answer exists",
    sample_input: "4 9\n2 7 11 15",
    sample_output: "0 1",
    explanation: "nums[0] + nums[1] = 2 + 7 = 9 = target, so return [0, 1].",
    time_limit: "1 second",
    memory_limit: "256 MB",
    test_cases: [
      { input: "4 9\n2 7 11 15", expected_output: "0 1", is_hidden: false },
      { input: "3 6\n3 2 4",     expected_output: "1 2", is_hidden: false },
      { input: "2 6\n3 3",       expected_output: "0 1", is_hidden: true  },
    ]
  },
  {
    id: "longest-palindrome",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    points: 200,
    category: "Dynamic Programming",
    description: "Given a string `s`, return the longest palindromic substring in `s`. A palindromic string is one that reads the same forward and backward.",
    statement: "Given a string `s`, return the longest palindromic substring in `s`. A palindromic string is one that reads the same forward and backward.",
    input_format: "A single string s.",
    output_format: "Print the longest palindromic substring.",
    constraints: "1 ≤ s.length ≤ 1000\ns consists of only digits and English letters",
    sample_input: "babad",
    sample_output: "bab",
    explanation: '"aba" is also a valid answer.',
    time_limit: "2 seconds",
    memory_limit: "256 MB",
    test_cases: [
      { input: "babad",  expected_output: "bab",    is_hidden: false },
      { input: "cbbd",   expected_output: "bb",     is_hidden: false },
      { input: "racecar",expected_output: "racecar",is_hidden: true  },
    ]
  },
  {
    id: "bt-max-path-sum",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    points: 300,
    category: "Trees",
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge. A node can only appear once. The path does not need to pass through the root. Given the root of a binary tree, return the maximum path sum of any non-empty path.",
    statement: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge. A node can only appear once. The path does not need to pass through the root. Given the root of a binary tree, return the maximum path sum of any non-empty path.",
    input_format: "Tree given in level-order, -1 represents null nodes.",
    output_format: "A single integer representing the maximum path sum.",
    constraints: "The number of nodes is in range [1, 3×10⁴]\n-1000 ≤ Node.val ≤ 1000",
    sample_input: "1 2 3",
    sample_output: "6",
    explanation: "The optimal path is 2 → 1 → 3 with a path sum of 2 + 1 + 3 = 6.",
    time_limit: "2 seconds",
    memory_limit: "256 MB",
    test_cases: [
      { input: "1 2 3",          expected_output: "6",  is_hidden: false },
      { input: "-10 9 20 -1 -1 15 7", expected_output: "42", is_hidden: false },
      { input: "-3",             expected_output: "-3", is_hidden: true  },
    ]
  },
  {
    id: "merge-k-sorted",
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    points: 300,
    category: "Heap",
    description: "You are given an array of k linked lists, each linked list is sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.",
    statement: "You are given an array of k linked lists, each linked list is sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.",
    input_format: "First line: integer k (number of lists). Next k lines: space-separated integers (each list).",
    output_format: "Space-separated integers of the merged sorted list.",
    constraints: "k == lists.length\n0 ≤ k ≤ 10⁴\n0 ≤ lists[i].length ≤ 500",
    sample_input: "3\n1 4 5\n1 3 4\n2 6",
    sample_output: "1 1 2 3 4 4 5 6",
    explanation: "Merging all three sorted lists gives one sorted list.",
    time_limit: "2 seconds",
    memory_limit: "256 MB",
    test_cases: [
      { input: "3\n1 4 5\n1 3 4\n2 6", expected_output: "1 1 2 3 4 4 5 6", is_hidden: false },
      { input: "1\n1",                  expected_output: "1",               is_hidden: false },
      { input: "2\n1 3 5\n2 4 6",       expected_output: "1 2 3 4 5 6",    is_hidden: true  },
    ]
  },
  {
    id: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    points: 200,
    category: "Dynamic Programming",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins needed to make up that amount. If it cannot be made up, return -1. You may assume infinite coins of each kind.",
    statement: "You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins needed to make up that amount. If it cannot be made up, return -1. You may assume infinite coins of each kind.",
    input_format: "First line: n and amount. Second line: n coin denominations.",
    output_format: "Single integer: minimum number of coins or -1.",
    constraints: "1 ≤ coins.length ≤ 12\n1 ≤ coins[i] ≤ 2^31 - 1\n0 ≤ amount ≤ 10⁴",
    sample_input: "3 11\n1 5 6",
    sample_output: "2",
    explanation: "11 = 5 + 6, using 2 coins.",
    time_limit: "1 second",
    memory_limit: "256 MB",
    test_cases: [
      { input: "3 11\n1 5 6", expected_output: "2",  is_hidden: false },
      { input: "3 11\n1 5 6", expected_output: "2",  is_hidden: false },
      { input: "2 3\n2 4",    expected_output: "-1", is_hidden: true  },
    ]
  },
];

// Contest data
const contests = [
  { 
    id: "weekly-dsa-42",
    name: "Weekly DSA Championship #42", 
    description: "Test your data structures and algorithms skills", 
    start_time: "2026-05-02T10:00:00",
    end_time: "2026-05-02T13:00:00", 
    question_ids: '["two-sum","longest-palindrome","bt-max-path-sum","merge-k-sorted","coin-change"]',
    status: "Upcoming"
  },
  { 
    id: "beginner-bootcamp-8",
    name: "Beginner Bootcamp #8", 
    description: "Get started with competitive programming fundamentals", 
    start_time: "2026-05-05T14:00:00",
    end_time: "2026-05-05T16:00:00", 
    question_ids: '["two-sum","coin-change"]',
    status: "Upcoming" 
  }
];

// ── Seeder ──────────────────────────────────────────────────
async function safeCreate(collectionId, docId, data) {
  try {
    await databases.createDocument(DATABASE_ID, collectionId, docId, data);
    return 'created';
  } catch (e) {
    if (e.code === 409) {
      await databases.updateDocument(DATABASE_ID, collectionId, docId, data);
      return 'updated';
    }
    throw e;
  }
}

async function seed() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(' 🌱 SEEDING APPWRITE — SecureProctor Demo Data');
  console.log('═══════════════════════════════════════════════════════\n');

  // Seed Questions + Test Cases
  for (const problem of problems) {
    const { test_cases, id: qId, ...questionData } = problem;
    
    // Add camelCase aliases
    const payload = {
      ...questionData,
      inputFormat: questionData.input_format,
      outputFormat: questionData.output_format,
      sampleInput: questionData.sample_input,
      sampleOutput: questionData.sample_output,
      timeLimit: questionData.time_limit,
      memoryLimit: questionData.memory_limit,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const status = await safeCreate('questions', qId, payload);
    console.log(`  ✓ Question ${status}: ${questionData.title} → ${qId}`);

    // Add test cases
    for (let i = 0; i < test_cases.length; i++) {
      const tcId = `${qId}-tc-${i}`;
      const tcStatus = await safeCreate('test_cases', tcId, {
        question_id: qId,
        ...test_cases[i],
      });
      console.log(`    └─ Test case ${tcStatus}: ${tcId} (hidden: ${test_cases[i].is_hidden})`);
    }
  }

  // Seed Contests
  console.log('');
  for (const contest of contests) {
    const { id: cId, ...contestData } = contest;
    const status = await safeCreate('contests', cId, {
      ...contestData,
      created_at: new Date().toISOString(),
    });
    console.log(`  ✓ Contest ${status}: ${contestData.name} → ${cId}`);
  }

  // Seed Demo Users
  console.log('');
  const users = [
    { id: "u1", username: "AlgoMaster_X", email: "algo@example.com", score: 1100 },
    { id: "u2", username: "CodeNinja_99", email: "ninja@example.com", score: 1100 },
    { id: "u3", username: "devstar_priya", email: "priya@example.com", score: 900 },
  ];

  for (const user of users) {
    const { id: uId, ...userData } = user;
    try {
      const status = await safeCreate('users', uId, userData);
      console.log(`  ✓ User ${status}: ${userData.username}`);
    } catch (e) {
      console.log(`  ⊘ User ${userData.username}: ${e.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(' ✅ SEEDING COMPLETE');
  console.log(`  ${problems.length} questions + ${problems.reduce((a, p) => a + p.test_cases.length, 0)} test cases`);
  console.log(`  ${contests.length} contests`);
  console.log(`  ${users.length} demo users`);
  console.log('═══════════════════════════════════════════════════════\n');
}

seed().then(() => process.exit(0)).catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
