export const contest = {
  id: "1",
  name: "Weekly DSA Championship #42",
  shortName: "WDC #42",
  description:
    "Test your data structures and algorithms skills with 5 carefully crafted problems. Problems range from easy warm-ups to hard challenges. Only your best submission per problem counts towards the final score.",
  startTime: "2026-03-02T10:00:00",
  endTime: "2026-03-02T13:00:00",
  duration: "3 Hours",
  totalProblems: 5,
  registeredParticipants: 342,
  maxScore: 1100,
  rules: [
    "Fullscreen mode is required at all times during the contest.",
    "Tab switching is actively monitored — repeated violations may result in disqualification.",
    "Webcam must remain on and clearly visible throughout the contest.",
    "No external resources, communication, or collaboration is permitted.",
    "Only languages provided in the editor may be used for submissions.",
    "Plagiarism detection is active. All code must be original.",
    "Each problem allows unlimited submissions; only the best is counted.",
    "Contest clock is shown in the top bar — plan your time accordingly.",
  ],
};

export const problems = [
  {
    id: "A",
    title: "Two Sum",
    difficulty: "Easy" as const,
    points: 100,
    status: "Solved" as const,
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    inputFormat:
      "First line contains two integers n (size of array) and target.\nSecond line contains n space-separated integers.",
    outputFormat:
      "Print two space-separated integers representing the 0-indexed positions.",
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists",
    ],
    sampleInput: "4 9\n2 7 11 15",
    sampleOutput: "0 1",
    explanation: "nums[0] + nums[1] = 2 + 7 = 9 = target, so return [0, 1].",
    timeLimit: "1 second",
    memoryLimit: "256 MB",
  },
  {
    id: "B",
    title: "Longest Palindromic Substring",
    difficulty: "Medium" as const,
    points: 200,
    status: "Attempted" as const,
    statement: `Given a string \`s\`, return the **longest palindromic substring** in \`s\`.

A palindromic string is one that reads the same forward and backward.`,
    inputFormat: "A single string s.",
    outputFormat: "Print the longest palindromic substring.",
    constraints: ["1 ≤ s.length ≤ 1000", "s consists of only digits and English letters"],
    sampleInput: "babad",
    sampleOutput: "bab",
    explanation: '"aba" is also a valid answer.',
    timeLimit: "2 seconds",
    memoryLimit: "256 MB",
  },
  {
    id: "C",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard" as const,
    points: 300,
    status: "Unattempted" as const,
    statement: `A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. Note that the path does not need to pass through the root.

The **path sum** of a path is the sum of the node's values in the path.

Given the \`root\` of a binary tree, return the **maximum path sum** of any non-empty path.`,
    inputFormat: "Tree given in level-order, -1 represents null nodes.",
    outputFormat: "A single integer representing the maximum path sum.",
    constraints: [
      "The number of nodes in the tree is in the range [1, 3 × 10⁴]",
      "-1000 ≤ Node.val ≤ 1000",
    ],
    sampleInput: "1 2 3",
    sampleOutput: "6",
    explanation: "The optimal path is 2 → 1 → 3 with a path sum of 2 + 1 + 3 = 6.",
    timeLimit: "2 seconds",
    memoryLimit: "256 MB",
  },
  {
    id: "D",
    title: "Merge K Sorted Lists",
    difficulty: "Hard" as const,
    points: 300,
    status: "Unattempted" as const,
    statement: `You are given an array of k linked lists, each linked list is sorted in ascending order.

Merge all the linked lists into one sorted linked list and return it.`,
    inputFormat:
      "First line: integer k (number of lists). Next k lines: space-separated integers (each list).",
    outputFormat: "Space-separated integers of the merged sorted list.",
    constraints: ["k == lists.length", "0 ≤ k ≤ 10⁴", "0 ≤ lists[i].length ≤ 500"],
    sampleInput: "3\n1 4 5\n1 3 4\n2 6",
    sampleOutput: "1 1 2 3 4 4 5 6",
    explanation: "Merging all three sorted lists gives one sorted list.",
    timeLimit: "2 seconds",
    memoryLimit: "256 MB",
  },
  {
    id: "E",
    title: "Coin Change",
    difficulty: "Medium" as const,
    points: 200,
    status: "Unattempted" as const,
    statement: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the **fewest number of coins** that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an **infinite number** of each kind of coin.`,
    inputFormat: "First line: n and amount. Second line: n coin denominations.",
    outputFormat: "Single integer: minimum number of coins or -1.",
    constraints: ["1 ≤ coins.length ≤ 12", "1 ≤ coins[i] ≤ 2^31 - 1", "0 ≤ amount ≤ 10⁴"],
    sampleInput: "3 11\n1 5 6",
    sampleOutput: "2",
    explanation: "11 = 5 + 6, using 2 coins.",
    timeLimit: "1 second",
    memoryLimit: "256 MB",
  },
];

export const leaderboard = [
  { rank: 1, username: "AlgoMaster_X", avatar: "AM", solved: 5, score: 1100, penalty: 142, isCurrentUser: false },
  { rank: 2, username: "CodeNinja_99", avatar: "CN", solved: 5, score: 1100, penalty: 187, isCurrentUser: false },
  { rank: 3, username: "devstar_priya", avatar: "DP", solved: 4, score: 900, penalty: 203, isCurrentUser: false },
  { rank: 4, username: "you (alex_coder)", avatar: "AC", solved: 3, score: 600, penalty: 89, isCurrentUser: true },
  { rank: 5, username: "recursion_king", avatar: "RK", solved: 3, score: 600, penalty: 134, isCurrentUser: false },
  { rank: 6, username: "hash_table_hero", avatar: "HH", solved: 3, score: 500, penalty: 156, isCurrentUser: false },
  { rank: 7, username: "BinaryBoss", avatar: "BB", solved: 2, score: 400, penalty: 67, isCurrentUser: false },
  { rank: 8, username: "sort_queen", avatar: "SQ", solved: 2, score: 300, penalty: 210, isCurrentUser: false },
  { rank: 9, username: "dp_wizard", avatar: "DW", solved: 2, score: 300, penalty: 245, isCurrentUser: false },
  { rank: 10, username: "graph_guru", avatar: "GG", solved: 1, score: 100, penalty: 32, isCurrentUser: false },
  { rank: 11, username: "stack_overflow_fan", avatar: "SO", solved: 1, score: 100, penalty: 78, isCurrentUser: false },
  { rank: 12, username: "newbie_coder_22", avatar: "NC", solved: 0, score: 0, penalty: 0, isCurrentUser: false },
];

export const adminContests = [
  { id: "1", name: "Weekly DSA Championship #42", status: "Live", startTime: "2026-03-02 10:00", endTime: "2026-03-02 13:00", participants: 342, problems: 5, antiCheat: true },
  { id: "2", name: "Beginner Bootcamp #8", status: "Upcoming", startTime: "2026-03-05 14:00", endTime: "2026-03-05 16:00", participants: 128, problems: 3, antiCheat: false },
  { id: "3", name: "Advanced Algorithms Sprint", status: "Ended", startTime: "2026-02-25 09:00", endTime: "2026-02-25 12:00", participants: 215, problems: 6, antiCheat: true },
  { id: "4", name: "Graph Theory Special", status: "Ended", startTime: "2026-02-18 10:00", endTime: "2026-02-18 13:00", participants: 189, problems: 4, antiCheat: true },
  { id: "5", name: "DP Masterclass Contest", status: "Upcoming", startTime: "2026-03-10 11:00", endTime: "2026-03-10 14:00", participants: 74, problems: 5, antiCheat: true },
];

export const adminQuestions = [
  { id: 1, title: "Two Sum", difficulty: "Easy", category: "Hash Map", timeLimit: "1s", memoryLimit: "256MB", testCases: 12, usedIn: 3 },
  { id: 2, title: "Longest Palindromic Substring", difficulty: "Medium", category: "Dynamic Programming", timeLimit: "2s", memoryLimit: "256MB", testCases: 18, usedIn: 1 },
  { id: 3, title: "Binary Tree Maximum Path Sum", difficulty: "Hard", category: "Trees", timeLimit: "2s", memoryLimit: "256MB", testCases: 25, usedIn: 2 },
  { id: 4, title: "Merge K Sorted Lists", difficulty: "Hard", category: "Heap", timeLimit: "2s", memoryLimit: "256MB", testCases: 20, usedIn: 1 },
  { id: 5, title: "Coin Change", difficulty: "Medium", category: "Dynamic Programming", timeLimit: "1s", memoryLimit: "256MB", testCases: 15, usedIn: 2 },
  { id: 6, title: "Valid Parentheses", difficulty: "Easy", category: "Stack", timeLimit: "1s", memoryLimit: "256MB", testCases: 10, usedIn: 4 },
  { id: 7, title: "Trapping Rain Water", difficulty: "Hard", category: "Two Pointers", timeLimit: "2s", memoryLimit: "256MB", testCases: 22, usedIn: 1 },
  { id: 8, title: "Sliding Window Maximum", difficulty: "Hard", category: "Deque", timeLimit: "2s", memoryLimit: "256MB", testCases: 18, usedIn: 0 },
];

export const adminSubmissions = [
  { id: "s001", user: "AlgoMaster_X", problem: "A - Two Sum", verdict: "Accepted", time: "0.04s", memory: "12MB", language: "C++", timestamp: "10:12:34" },
  { id: "s002", user: "devstar_priya", problem: "B - Longest Palindrome", verdict: "Wrong Answer", time: "0.12s", memory: "14MB", language: "Python", timestamp: "10:14:02" },
  { id: "s003", user: "CodeNinja_99", problem: "C - Binary Tree Path", verdict: "Accepted", time: "0.08s", memory: "18MB", language: "Java", timestamp: "10:15:44" },
  { id: "s004", user: "you (alex_coder)", problem: "A - Two Sum", verdict: "Accepted", time: "0.02s", memory: "10MB", language: "C++", timestamp: "10:17:21" },
  { id: "s005", user: "recursion_king", problem: "D - Merge K Lists", verdict: "TLE", time: "2.01s", memory: "45MB", language: "Python", timestamp: "10:18:55" },
  { id: "s006", user: "hash_table_hero", problem: "E - Coin Change", verdict: "Accepted", time: "0.06s", memory: "11MB", language: "C++", timestamp: "10:21:03" },
  { id: "s007", user: "BinaryBoss", problem: "B - Longest Palindrome", verdict: "Wrong Answer", time: "0.09s", memory: "13MB", language: "Java", timestamp: "10:22:47" },
  { id: "s008", user: "AlgoMaster_X", problem: "D - Merge K Lists", verdict: "Accepted", time: "0.11s", memory: "22MB", language: "C++", timestamp: "10:24:10" },
  { id: "s009", user: "sort_queen", problem: "A - Two Sum", verdict: "MLE", time: "1.02s", memory: "512MB", language: "Java", timestamp: "10:25:38" },
  { id: "s010", user: "dp_wizard", problem: "E - Coin Change", verdict: "Accepted", time: "0.05s", memory: "12MB", language: "Python", timestamp: "10:27:14" },
  { id: "s011", user: "devstar_priya", problem: "A - Two Sum", verdict: "Accepted", time: "0.03s", memory: "11MB", language: "Python", timestamp: "10:28:59" },
  { id: "s012", user: "newbie_coder_22", problem: "A - Two Sum", verdict: "Wrong Answer", time: "0.04s", memory: "12MB", language: "C++", timestamp: "10:31:02" },
];

export const antiCheatEvents = [
  { id: 1, user: "recursion_king", event: "Tab Switch", time: "10:13:22", details: "Switched to external browser tab", severity: "High", count: 3 },
  { id: 2, user: "newbie_coder_22", event: "Fullscreen Exit", time: "10:16:45", details: "Exited fullscreen mode", severity: "Medium", count: 1 },
  { id: 3, user: "sort_queen", event: "Multiple Faces", time: "10:18:12", details: "2 faces detected in webcam feed", severity: "High", count: 2 },
  { id: 4, user: "graph_guru", event: "Camera Off", time: "10:21:03", details: "Webcam feed interrupted", severity: "High", count: 1 },
  { id: 5, user: "recursion_king", event: "Tab Switch", time: "10:24:38", details: "Switched to external browser tab", severity: "High", count: 4 },
  { id: 6, user: "BinaryBoss", event: "Fullscreen Exit", time: "10:27:54", details: "Exited fullscreen mode", severity: "Medium", count: 2 },
  { id: 7, user: "dp_wizard", event: "Tab Switch", time: "10:30:11", details: "Switched to external browser tab", severity: "High", count: 1 },
  { id: 8, user: "newbie_coder_22", event: "Multiple Faces", time: "10:33:27", details: "2 faces detected in webcam feed", severity: "High", count: 1 },
];

export const suspicionScores = [
  { user: "recursion_king", score: 82, tabSwitch: 4, fullscreenExit: 0, cameraOff: 0, multiFace: 0, status: "Warning Sent" },
  { user: "sort_queen", score: 74, tabSwitch: 0, fullscreenExit: 0, cameraOff: 0, multiFace: 2, status: "Warning Sent" },
  { user: "graph_guru", score: 65, tabSwitch: 0, fullscreenExit: 0, cameraOff: 1, multiFace: 0, status: "Under Review" },
  { user: "newbie_coder_22", score: 58, tabSwitch: 1, fullscreenExit: 1, cameraOff: 0, multiFace: 1, status: "Flagged" },
  { user: "BinaryBoss", score: 28, tabSwitch: 0, fullscreenExit: 2, cameraOff: 0, multiFace: 0, status: "Warned" },
  { user: "dp_wizard", score: 15, tabSwitch: 1, fullscreenExit: 0, cameraOff: 0, multiFace: 0, status: "Monitoring" },
];

export const submissionsChartData = [
  { time: "10:00", submissions: 0 },
  { time: "10:10", submissions: 18 },
  { time: "10:20", submissions: 47 },
  { time: "10:30", submissions: 62 },
  { time: "10:40", submissions: 55 },
  { time: "10:50", submissions: 73 },
  { time: "11:00", submissions: 84 },
  { time: "11:10", submissions: 91 },
  { time: "11:20", submissions: 68 },
  { time: "11:30", submissions: 77 },
  { time: "11:40", submissions: 95 },
  { time: "11:50", submissions: 103 },
];

export const verdictChartData = [
  { name: "Accepted", value: 187, color: "#16a34a" },
  { name: "Wrong Answer", value: 94, color: "#dc2626" },
  { name: "TLE", value: 42, color: "#ea580c" },
  { name: "MLE", value: 18, color: "#7c3aed" },
  { name: "CE", value: 11, color: "#6b7280" },
];
