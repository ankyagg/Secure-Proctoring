const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

const problems = [
  {
    title: "Two Sum",
    difficulty: "easy",
    points: 100,
    category: "Hash Map",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    input_format: "First line contains two integers n (size of array) and target.\nSecond line contains n space-separated integers.",
    output_format: "Print two space-separated integers representing the 0-indexed positions.",
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "-10⁹ ≤ target ≤ 10⁹", "Only one valid answer exists"],
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
    title: "Longest Palindromic Substring",
    difficulty: "medium",
    points: 200,
    category: "Dynamic Programming",
    description: "Given a string `s`, return the longest palindromic substring in `s`. A palindromic string is one that reads the same forward and backward.",
    input_format: "A single string s.",
    output_format: "Print the longest palindromic substring.",
    constraints: ["1 ≤ s.length ≤ 1000", "s consists of only digits and English letters"],
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
    title: "Binary Tree Maximum Path Sum",
    difficulty: "hard",
    points: 300,
    category: "Trees",
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge. A node can only appear once. The path does not need to pass through the root. Given the root of a binary tree, return the maximum path sum of any non-empty path.",
    input_format: "Tree given in level-order, -1 represents null nodes.",
    output_format: "A single integer representing the maximum path sum.",
    constraints: ["The number of nodes is in range [1, 3×10⁴]", "-1000 ≤ Node.val ≤ 1000"],
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
    title: "Merge K Sorted Lists",
    difficulty: "hard",
    points: 300,
    category: "Heap",
    description: "You are given an array of k linked lists, each linked list is sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.",
    input_format: "First line: integer k (number of lists). Next k lines: space-separated integers (each list).",
    output_format: "Space-separated integers of the merged sorted list.",
    constraints: ["k == lists.length", "0 ≤ k ≤ 10⁴", "0 ≤ lists[i].length ≤ 500"],
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
    title: "Coin Change",
    difficulty: "medium",
    points: 200,
    category: "Dynamic Programming",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins needed to make up that amount. If it cannot be made up, return -1. You may assume infinite coins of each kind.",
    input_format: "First line: n and amount. Second line: n coin denominations.",
    output_format: "Single integer: minimum number of coins or -1.",
    constraints: ["1 ≤ coins.length ≤ 12", "1 ≤ coins[i] ≤ 2^31 - 1", "0 ≤ amount ≤ 10⁴"],
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

async function seed() {
  console.log('Seeding Firestore...');

  for (const problem of problems) {
    const { test_cases, ...questionData } = problem;

    // Add question
    const qRef = await db.collection('questions').add({
      ...questionData,
      created_at: new Date().toISOString()
    });
    console.log(`✓ Added question: ${questionData.title} → ID: ${qRef.id}`);

    // Add its test cases
    for (const tc of test_cases) {
      await db.collection('test_cases').add({
        question_id: qRef.id,
        ...tc
      });
    }
    console.log(`  └─ ${test_cases.length} test cases added`);
  }

  console.log('\n✅ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});