export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
  icon: string;
  color: string;
  popularTags: string[];
}

export const PROBLEM_CATEGORIES: CategoryInfo[] = [
  {
    id: 'arrays',
    name: 'Arrays',
    description: 'Array manipulations, prefix sums, Kadane algorithm, in-place rotations, and subarray analysis.',
    iconName: 'LayoutGrid',
    icon: '📊',
    color: '#6366f1',
    popularTags: ['Array', 'Prefix Sum', 'Subarray', 'Two Pointers']
  },
  {
    id: 'strings',
    name: 'Strings',
    description: 'String parsing, anagrams, palindrome verification, substring matching, and character encoding.',
    iconName: 'Type',
    icon: '🔤',
    color: '#ec4899',
    popularTags: ['String', 'Palindrome', 'Anagram', 'Substring']
  },
  {
    id: 'hashing',
    name: 'Hashing',
    description: 'Hash maps, frequency tables, hash sets, distinct counts, and O(1) key-value lookups.',
    iconName: 'Hash',
    icon: '🔑',
    color: '#f59e0b',
    popularTags: ['Hash Table', 'Counting', 'Set', 'Dictionary']
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    description: 'Opposite-end converging pointers, fast & slow pointers, and partitioned array traversal.',
    iconName: 'ArrowLeftRight',
    icon: '↔️',
    color: '#10b981',
    popularTags: ['Two Pointers', 'Sorted Array', 'Fast & Slow', 'Partition']
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    description: 'Fixed and dynamic window intervals, maximum sum subarrays, and substring constraints.',
    iconName: 'Sliders',
    icon: '🪟',
    color: '#06b6d4',
    popularTags: ['Sliding Window', 'Subarray', 'Frequency Window', 'At Most K']
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    description: 'Logarithmic search in sorted spaces, rotated arrays, lower/upper bounds, and answer-space search.',
    iconName: 'Search',
    icon: '🔍',
    color: '#3b82f6',
    popularTags: ['Binary Search', 'Sorted', 'Monotonic', 'Search on Answer']
  },
  {
    id: 'sorting',
    name: 'Sorting',
    description: 'Custom comparators, Quickselect, Merge Sort, Bucket Sort, and interval ordering.',
    iconName: 'ArrowUpDown',
    icon: '🔢',
    color: '#8b5cf6',
    popularTags: ['Sorting', 'Custom Comparator', 'Quickselect', 'Bucket Sort']
  },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    description: 'Singly & doubly linked lists, pointer rewiring, cycle detection, and merging.',
    iconName: 'GitCommit',
    icon: '🔗',
    color: '#14b8a6',
    popularTags: ['Linked List', 'Fast & Slow Pointers', 'Recursion', 'Dummy Head']
  },
  {
    id: 'stack',
    name: 'Stack',
    description: 'LIFO structures, monotonic stacks, parenthesis matching, and expression evaluation.',
    iconName: 'Layers',
    icon: '🥞',
    color: '#f43f5e',
    popularTags: ['Stack', 'Monotonic Stack', 'Parentheses', 'Evaluation']
  },
  {
    id: 'queue',
    name: 'Queue',
    description: 'FIFO structures, circular buffers, monotonic queues, and sliding window maximums.',
    iconName: 'ListOrdered',
    icon: '🚶‍♂️',
    color: '#eab308',
    popularTags: ['Queue', 'Monotonic Queue', 'BFS Buffer', 'Deque']
  },
  {
    id: 'recursion',
    name: 'Recursion',
    description: 'Divide and conquer, mathematical recursion, recursive structures, and tree reductions.',
    iconName: 'Repeat',
    icon: '🔄',
    color: '#a855f7',
    popularTags: ['Recursion', 'Divide & Conquer', 'Base Cases', 'Induction']
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    description: 'State-space tree exploration, subsets, permutations, combinations, and puzzle solvers.',
    iconName: 'Compass',
    icon: '🧩',
    color: '#d946ef',
    popularTags: ['Backtracking', 'Permutations', 'Combinations', 'DFS']
  },
  {
    id: 'trees',
    name: 'Trees',
    description: 'General tree traversals, diameter, depth, lowest common ancestors, and path sums.',
    iconName: 'Network',
    icon: '🌳',
    color: '#22c55e',
    popularTags: ['Tree', 'DFS', 'BFS', 'Traversal']
  },
  {
    id: 'binary-trees',
    name: 'Binary Trees',
    description: 'Binary tree construction, level-order traversals, symmetry checks, and serialization.',
    iconName: 'Binary',
    icon: '🌲',
    color: '#10b981',
    popularTags: ['Binary Tree', 'Level Order', 'Inorder', 'Postorder']
  },
  {
    id: 'binary-search-trees',
    name: 'Binary Search Trees',
    description: 'BST validation, inorder properties, range queries, and balanced BST operations.',
    iconName: 'GitBranch',
    icon: '🌿',
    color: '#14b8a6',
    popularTags: ['BST', 'Inorder Traversal', 'Search', 'Balanced BST']
  },
  {
    id: 'heap-priority-queue',
    name: 'Heap / Priority Queue',
    description: 'Min/Max heaps, top-K frequent elements, median maintenance, and task scheduling.',
    iconName: 'Crown',
    icon: '👑',
    color: '#f59e0b',
    popularTags: ['Heap', 'Priority Queue', 'Top K', 'Streaming Median']
  },
  {
    id: 'graphs',
    name: 'Graphs',
    description: 'Adjacency lists, BFS/DFS, topological sort, Dijkstra shortest paths, and cycle detection.',
    iconName: 'Share2',
    icon: '🌐',
    color: '#8b5cf6',
    popularTags: ['Graph', 'BFS', 'DFS', 'Topological Sort', 'Dijkstra']
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    description: 'Optimal substructure, memoization, 1D/2D DP, knapsack variations, and edit distance.',
    iconName: 'Boxes',
    icon: '⚡',
    color: '#ef4444',
    popularTags: ['Dynamic Programming', 'Memoization', 'Tabulation', 'Subsequence']
  },
  {
    id: 'greedy',
    name: 'Greedy',
    description: 'Locally optimal choices, interval scheduling, jump games, and gas station proofs.',
    iconName: 'Zap',
    icon: '🎯',
    color: '#eab308',
    popularTags: ['Greedy', 'Intervals', 'Optimization', 'Sorting']
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    description: 'Bitwise XOR, masks, shift operations, bit counts, and subset generation with bits.',
    iconName: 'Cpu',
    icon: '💻',
    color: '#06b6d4',
    popularTags: ['Bit Manipulation', 'XOR', 'Bitmask', 'Binary']
  },
  {
    id: 'math',
    name: 'Math',
    description: 'Number theory, GCD, primes, modular arithmetic, combinatorics, and geometry.',
    iconName: 'Calculator',
    icon: '📐',
    color: '#3b82f6',
    popularTags: ['Math', 'Number Theory', 'Geometry', 'Combinatorics']
  },
  {
    id: 'matrix',
    name: 'Matrix',
    description: '2D grid traversals, matrix rotations, spiral paths, and flood fill algorithms.',
    iconName: 'Grid',
    icon: '🏁',
    color: '#6366f1',
    popularTags: ['Matrix', '2D Array', 'Simulation', 'Grid DFS']
  },
  {
    id: 'trie',
    name: 'Trie',
    description: 'Prefix trees, autocomplete, dictionary searches, and bitwise XOR tries.',
    iconName: 'FolderTree',
    icon: '🌲',
    color: '#a855f7',
    popularTags: ['Trie', 'Prefix Tree', 'String Matching', 'Autocomplete']
  },
  {
    id: 'union-find',
    name: 'Union Find',
    description: 'Disjoint set union (DSU), path compression, rank heuristics, and connected components.',
    iconName: 'Unlink',
    icon: '🤝',
    color: '#ec4899',
    popularTags: ['Union Find', 'DSU', 'Graph Components', 'Kruskal']
  },
  {
    id: 'segment-tree',
    name: 'Segment Tree',
    description: 'Range sum queries, lazy propagation, Fenwick binary indexed trees, and dynamic ranges.',
    iconName: 'BarChart2',
    icon: '📈',
    color: '#10b981',
    popularTags: ['Segment Tree', 'Fenwick Tree', 'Binary Indexed Tree', 'Range Query']
  },
  {
    id: 'advanced-data-structures',
    name: 'Advanced Data Structures',
    description: 'Skip lists, treaps, suffix arrays, persistent structures, and monotonic queues.',
    iconName: 'Database',
    icon: '🗄️',
    color: '#0284c7',
    popularTags: ['Advanced DSA', 'Suffix Array', 'Treap', 'Monotonic']
  },
  {
    id: 'design-problems',
    name: 'Design Problems',
    description: 'LRU Cache, LFU Cache, Rate Limiters, Twitter feeds, and in-memory key-value systems.',
    iconName: 'Wrench',
    icon: '⚙️',
    color: '#f97316',
    popularTags: ['System Design', 'OOP', 'Data Structure Design', 'Cache']
  }
];
