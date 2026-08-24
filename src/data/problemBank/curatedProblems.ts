import { Problem } from '../../types';

export const CURATED_FOUNDATION_PROBLEMS: Problem[] = [
  {
    id: 'prob-1',
    problemNumber: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    category: 'Arrays',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'nums[1] + nums[2] == 6, so return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    inputFormat: 'nums: number[], target: number',
    outputFormat: 'number[]',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  
}`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`
    },
    testCases: [
      {
        id: 'tc-1-1',
        input: '[2,7,11,15], 9',
        expectedOutput: '[0,1]',
        explanation: '2 + 7 = 9'
      },
      {
        id: 'tc-1-2',
        input: '[3,2,4], 6',
        expectedOutput: '[1,2]',
        explanation: '2 + 4 = 6'
      },
      {
        id: 'tc-1-3',
        input: '[3,3], 6',
        expectedOutput: '[0,1]'
      },
      {
        id: 'tc-1-4',
        input: '[1,5,8,3,9,14], 17',
        expectedOutput: '[3,5]',
        isHidden: true
      }
    ],
    solutionHints: [
      'A brute force approach checks all pairs in O(n²) time.',
      'Can you use a Hash Table to look up the required complement (target - num) in O(1) time?'
    ],
    acceptanceRate: 52.8,
    tags: ['Arrays', 'Hashing', 'Hash Table', 'Two Pointers'],
    totalAttempts: 14200,
    totalAccepted: 7500,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    functionSignature: 'twoSum(nums, target)',
    timeLimit: 2000,
    memoryLimit: 128
  },
  {
    id: 'prob-2',
    problemNumber: 2,
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      },
      {
        input: 's = "([])"',
        output: 'true'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    inputFormat: 's: string',
    outputFormat: 'boolean',
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  
}`,
      typescript: `function isValid(s: string): boolean {
  
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        
    }
};`
    },
    testCases: [
      { id: 'tc-2-1', input: '"()"', expectedOutput: 'true' },
      { id: 'tc-2-2', input: '"()[]{}"', expectedOutput: 'true' },
      { id: 'tc-2-3', input: '"(]"', expectedOutput: 'false' },
      { id: 'tc-2-4', input: '"([{}])"', expectedOutput: 'true', isHidden: true }
    ],
    solutionHints: [
      'Use a stack data structure to keep track of open brackets.',
      'When an opening bracket appears, push it onto the stack. When closing, pop and verify type match.'
    ],
    acceptanceRate: 41.2,
    tags: ['Strings', 'Stack'],
    totalAttempts: 18500,
    totalAccepted: 7620,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    functionSignature: 'isValid(s)',
    timeLimit: 2000,
    memoryLimit: 128
  },
  {
    id: 'prob-3',
    problemNumber: 3,
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    difficulty: 'Easy',
    category: 'Hashing',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
      { input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    inputFormat: 'nums: number[]',
    outputFormat: 'boolean',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
  
}`,
      typescript: `function containsDuplicate(nums: number[]): boolean {
  
}`,
      python: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        pass`,
      java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        
    }
};`
    },
    testCases: [
      { id: 'tc-3-1', input: '[1,2,3,1]', expectedOutput: 'true' },
      { id: 'tc-3-2', input: '[1,2,3,4]', expectedOutput: 'false' },
      { id: 'tc-3-3', input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true' }
    ],
    solutionHints: ['Use a HashSet to store seen elements.'],
    acceptanceRate: 62.1,
    tags: ['Arrays', 'Hashing', 'Hash Table', 'Sorting'],
    totalAttempts: 12000,
    totalAccepted: 7450,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    functionSignature: 'containsDuplicate(nums)',
    timeLimit: 2000,
    memoryLimit: 128
  },
  {
    id: 'prob-4',
    problemNumber: 4,
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    category: 'Sliding Window',
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5. Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.'
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.'
      }
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    inputFormat: 'prices: number[]',
    outputFormat: 'number',
    starterCode: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  
}`,
      typescript: `function maxProfit(prices: number[]): number {
  
}`,
      python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        pass`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        
    }
}`,
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        
    }
};`
    },
    testCases: [
      { id: 'tc-4-1', input: '[7,1,5,3,6,4]', expectedOutput: '5' },
      { id: 'tc-4-2', input: '[7,6,4,3,1]', expectedOutput: '0' },
      { id: 'tc-4-3', input: '[2,4,1]', expectedOutput: '2' }
    ],
    solutionHints: ['Track the lowest price seen so far as you iterate through the list.'],
    acceptanceRate: 54.3,
    tags: ['Arrays', 'Sliding Window', 'Dynamic Programming'],
    totalAttempts: 21000,
    totalAccepted: 11400,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    functionSignature: 'maxProfit(prices)',
    timeLimit: 2000,
    memoryLimit: 128
  },
  {
    id: 'prob-5',
    problemNumber: 5,
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    category: 'Two Pointers',
    description: `Given an integer array nums, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      {
        input: 'nums = [-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation: 'nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0. Distinct triplets are [-1,0,1] and [-1,-1,2].'
      },
      {
        input: 'nums = [0,1,1]',
        output: '[]'
      },
      {
        input: 'nums = [0,0,0]',
        output: '[[0,0,0]]'
      }
    ],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    inputFormat: 'nums: number[]',
    outputFormat: 'number[][]',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  
}`,
      typescript: `function threeSum(nums: number[]): number[][] {
  
}`,
      python: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        pass`,
      java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        
    }
};`
    },
    testCases: [
      { id: 'tc-5-1', input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]' },
      { id: 'tc-5-2', input: '[0,1,1]', expectedOutput: '[]' },
      { id: 'tc-5-3', input: '[0,0,0]', expectedOutput: '[[0,0,0]]' }
    ],
    solutionHints: [
      'Sort the array first to make duplicate elimination and two-pointer search easy.',
      'Fix one element and use standard two pointers for the remaining sum = -nums[i].'
    ],
    acceptanceRate: 33.4,
    tags: ['Arrays', 'Two Pointers', 'Sorting'],
    totalAttempts: 15400,
    totalAccepted: 5140,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    functionSignature: 'threeSum(nums)',
    timeLimit: 2000,
    memoryLimit: 128
  },
  {
    id: 'prob-6',
    problemNumber: 6,
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.'
      }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    inputFormat: 's: string',
    outputFormat: 'number',
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  
}`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  
}`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        pass`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        
    }
}`,
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        
    }
};`
    },
    testCases: [
      { id: 'tc-6-1', input: '"abcabcbb"', expectedOutput: '3' },
      { id: 'tc-6-2', input: '"bbbbb"', expectedOutput: '1' },
      { id: 'tc-6-3', input: '"pwwkew"', expectedOutput: '3' },
      { id: 'tc-6-4', input: '" "', expectedOutput: '1', isHidden: true }
    ],
    solutionHints: ['Use a sliding window with two pointers and a map/set to track unique characters.'],
    acceptanceRate: 34.5,
    tags: ['Hashing', 'Strings', 'Sliding Window'],
    totalAttempts: 25000,
    totalAccepted: 8625,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    functionSignature: 'lengthOfLongestSubstring(s)',
    timeLimit: 2000,
    memoryLimit: 128
  },
  {
    id: 'prob-7',
    problemNumber: 7,
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps.'
      },
      {
        input: 'n = 3',
        output: '3',
        explanation: 'There are three ways to climb to the top: 1. 1 step + 1 step + 1 step, 2. 1 step + 2 steps, 3. 2 steps + 1 step.'
      }
    ],
    constraints: ['1 <= n <= 45'],
    inputFormat: 'n: number',
    outputFormat: 'number',
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  
}`,
      typescript: `function climbStairs(n: number): number {
  
}`,
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        pass`,
      java: `class Solution {
    public int climbStairs(int n) {
        
    }
}`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        
    }
};`
    },
    testCases: [
      { id: 'tc-7-1', input: '2', expectedOutput: '2' },
      { id: 'tc-7-2', input: '3', expectedOutput: '3' },
      { id: 'tc-7-3', input: '5', expectedOutput: '8' }
    ],
    solutionHints: ['Notice the Fibonacci pattern: ways(n) = ways(n-1) + ways(n-2).'],
    acceptanceRate: 52.4,
    tags: ['Math', 'Dynamic Programming', 'Recursion'],
    totalAttempts: 19800,
    totalAccepted: 10375,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    functionSignature: 'climbStairs(n)',
    timeLimit: 2000,
    memoryLimit: 128
  },
  {
    id: 'prob-8',
    problemNumber: 8,
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      {
        input: 'coins = [1,2,5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1'
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1'
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0'
      }
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    inputFormat: 'coins: number[], amount: number',
    outputFormat: 'number',
    starterCode: {
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  
}`,
      typescript: `function coinChange(coins: number[], amount: number): number {
  
}`,
      python: `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        pass`,
      java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        
    }
}`,
      cpp: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        
    }
};`
    },
    testCases: [
      { id: 'tc-8-1', input: '[1,2,5], 11', expectedOutput: '3' },
      { id: 'tc-8-2', input: '[2], 3', expectedOutput: '-1' },
      { id: 'tc-8-3', input: '[1], 0', expectedOutput: '0' }
    ],
    solutionHints: ['Use bottom-up dynamic programming. dp[i] represents min coins for amount i.'],
    acceptanceRate: 43.1,
    tags: ['Arrays', 'Dynamic Programming', 'Greedy'],
    totalAttempts: 16500,
    totalAccepted: 7111,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    functionSignature: 'coinChange(coins, amount)',
    timeLimit: 2000,
    memoryLimit: 128
  },
  {
    id: 'prob-9',
    problemNumber: 9,
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.'
      },
      {
        input: 'height = [4,2,0,3,2,5]',
        output: '9'
      }
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    inputFormat: 'height: number[]',
    outputFormat: 'number',
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  
}`,
      typescript: `function trap(height: number[]): number {
  
}`,
      python: `class Solution:
    def trap(self, height: List[int]) -> int:
        pass`,
      java: `class Solution {
    public int trap(int[] height) {
        
    }
}`,
      cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        
    }
};`
    },
    testCases: [
      { id: 'tc-9-1', input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { id: 'tc-9-2', input: '[4,2,0,3,2,5]', expectedOutput: '9' }
    ],
    solutionHints: ['Two pointer approach maintains left_max and right_max to find trapped water at each bar in O(1) space.'],
    acceptanceRate: 60.1,
    tags: ['Arrays', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    totalAttempts: 11200,
    totalAccepted: 6730,
    supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'cpp'],
    functionSignature: 'trap(height)',
    timeLimit: 2000,
    memoryLimit: 128
  }
];
