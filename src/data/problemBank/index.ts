import { Problem, Difficulty, ProblemCategory } from '../../types';
import { CURATED_FOUNDATION_PROBLEMS } from './curatedProblems';
import { generateFullProblemBank } from './problemGenerator';
import { PROBLEM_CATEGORIES, CategoryInfo } from './categories';

// Build the full master dataset
function buildMasterProblemBank(): Problem[] {
  const proceduralBank = generateFullProblemBank();
  
  // Replace the first N problems with our high-detail curated foundation problems
  const curatedIds = new Set(CURATED_FOUNDATION_PROBLEMS.map((p) => p.id));
  const remainingProcedural = proceduralBank.filter((p) => !curatedIds.has(p.id));

  const combined = [...CURATED_FOUNDATION_PROBLEMS, ...remainingProcedural];

  // Renumber to ensure 100% sequential IDs and problem numbers from 1 to N
  return combined.map((p, idx) => ({
    ...p,
    id: `prob-${idx + 1}`,
    problemNumber: idx + 1,
    supportedLanguages: p.supportedLanguages || ['javascript', 'typescript', 'python', 'java', 'cpp'],
    timeLimit: p.timeLimit || 2000,
    memoryLimit: p.memoryLimit || 128
  }));
}

// Master Problem Bank (1050+ problems)
export const MASTER_PROBLEM_BANK: Problem[] = buildMasterProblemBank();

// Fast O(1) in-memory indices for scalable query performance
const PROBLEM_BY_ID_MAP = new Map<string, Problem>();
const PROBLEM_BY_SLUG_MAP = new Map<string, Problem>();
const PROBLEMS_BY_CATEGORY_MAP = new Map<string, Problem[]>();
const PROBLEMS_BY_DIFFICULTY_MAP = new Map<Difficulty, Problem[]>();

// Initialize indices
for (const prob of MASTER_PROBLEM_BANK) {
  PROBLEM_BY_ID_MAP.set(prob.id, prob);
  PROBLEM_BY_SLUG_MAP.set(prob.slug, prob);

  // Category index
  const cat = prob.category;
  if (!PROBLEMS_BY_CATEGORY_MAP.has(cat)) {
    PROBLEMS_BY_CATEGORY_MAP.set(cat, []);
  }
  PROBLEMS_BY_CATEGORY_MAP.get(cat)!.push(prob);

  // Difficulty index
  if (!PROBLEMS_BY_DIFFICULTY_MAP.has(prob.difficulty)) {
    PROBLEMS_BY_DIFFICULTY_MAP.set(prob.difficulty, []);
  }
  PROBLEMS_BY_DIFFICULTY_MAP.get(prob.difficulty)!.push(prob);
}

// Scalable Search, Filter, Sort and Pagination Service
export interface ProblemQueryParams {
  search?: string;
  difficulty?: 'All' | 'Easy' | 'Medium' | 'Hard';
  category?: string; // 'All' or specific category
  status?: 'All' | 'Solved' | 'Attempted' | 'Unsolved';
  solvedIds?: Set<string>;
  attemptedIds?: Set<string>;
  sortBy?: 'number' | 'title' | 'difficulty' | 'acceptance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ProblemQueryResult {
  problems: Problem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  stats: {
    total: number;
    easyTotal: number;
    mediumTotal: number;
    hardTotal: number;
    solvedTotal: number;
    solvedEasy: number;
    solvedMedium: number;
    solvedHard: number;
    attemptedTotal: number;
    avgAcceptanceRate: number;
  };
}

export function queryProblemBank(params: ProblemQueryParams): ProblemQueryResult {
  const {
    search = '',
    difficulty = 'All',
    category = 'All',
    status = 'All',
    solvedIds = new Set<string>(),
    attemptedIds = new Set<string>(),
    sortBy = 'number',
    sortOrder = 'asc',
    page = 1,
    pageSize = 20
  } = params;

  const q = search.trim().toLowerCase();

  // 1. Initial filter
  let result = MASTER_PROBLEM_BANK.filter((p) => {
    // Search
    if (q) {
      const matchNum = String(p.problemNumber || '').includes(q) || p.id.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchNum && !matchTitle && !matchCat && !matchTag) return false;
    }

    // Difficulty
    if (difficulty !== 'All' && p.difficulty !== difficulty) return false;

    // Category
    if (category !== 'All' && p.category !== category) return false;

    // Status
    const isSolved = solvedIds.has(p.id);
    const isAttempted = attemptedIds.has(p.id) && !isSolved;

    if (status === 'Solved' && !isSolved) return false;
    if (status === 'Attempted' && !isAttempted) return false;
    if (status === 'Unsolved' && (isSolved || isAttempted)) return false;

    return true;
  });

  // 2. Sorting
  const diffWeight = { Easy: 1, Medium: 2, Hard: 3 };

  result.sort((a, b) => {
    let comp = 0;
    if (sortBy === 'number') {
      comp = (a.problemNumber || 0) - (b.problemNumber || 0);
    } else if (sortBy === 'title') {
      comp = a.title.localeCompare(b.title);
    } else if (sortBy === 'difficulty') {
      comp = diffWeight[a.difficulty] - diffWeight[b.difficulty];
    } else if (sortBy === 'acceptance') {
      comp = a.acceptanceRate - b.acceptanceRate;
    }

    return sortOrder === 'desc' ? -comp : comp;
  });

  // 3. Overall Stats calculation (across all 1000+ problems)
  const total = MASTER_PROBLEM_BANK.length;
  const easyTotal = MASTER_PROBLEM_BANK.filter((p) => p.difficulty === 'Easy').length;
  const mediumTotal = MASTER_PROBLEM_BANK.filter((p) => p.difficulty === 'Medium').length;
  const hardTotal = MASTER_PROBLEM_BANK.filter((p) => p.difficulty === 'Hard').length;

  let solvedTotal = 0;
  let solvedEasy = 0;
  let solvedMedium = 0;
  let solvedHard = 0;
  let totalAcc = 0;

  for (const p of MASTER_PROBLEM_BANK) {
    totalAcc += p.acceptanceRate;
    if (solvedIds.has(p.id)) {
      solvedTotal++;
      if (p.difficulty === 'Easy') solvedEasy++;
      else if (p.difficulty === 'Medium') solvedMedium++;
      else if (p.difficulty === 'Hard') solvedHard++;
    }
  }

  const avgAcceptanceRate = Math.round((totalAcc / total) * 10) / 10;
  const attemptedTotal = attemptedIds.size;

  // 4. Pagination slicing
  const totalCount = result.length;
  const validPageSize = Math.max(1, pageSize);
  const totalPages = Math.ceil(totalCount / validPageSize) || 1;
  const validPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (validPage - 1) * validPageSize;
  const paginatedProblems = result.slice(startIndex, startIndex + validPageSize);

  return {
    problems: paginatedProblems,
    totalCount,
    totalPages,
    currentPage: validPage,
    pageSize: validPageSize,
    stats: {
      total,
      easyTotal,
      mediumTotal,
      hardTotal,
      solvedTotal,
      solvedEasy,
      solvedMedium,
      solvedHard,
      attemptedTotal,
      avgAcceptanceRate
    }
  };
}

export function getProblemByIdFast(id: string): Problem | undefined {
  return PROBLEM_BY_ID_MAP.get(id) || PROBLEM_BY_SLUG_MAP.get(id);
}

export { PROBLEM_CATEGORIES };
export type { CategoryInfo };
