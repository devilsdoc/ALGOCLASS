import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Difficulty } from '../../types';
import { PROBLEM_CATEGORIES } from '../../data/problemBank/categories';
import {
  Code,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  BarChart3,
  Check,
  Clock,
  Flame,
  ArrowUpDown,
  BookOpen,
  FolderOpen
} from 'lucide-react';

export const ProblemList: React.FC = () => {
  const { problems, submissions, navigateToSolve, searchQuery, setSearchQuery } = useApp();
  const { currentUser } = useAuth();

  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | Difficulty>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Attempted' | 'Unsolved'>('All');
  const [sortBy, setSortBy] = useState<'number' | 'title' | 'difficulty' | 'acceptance'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageInput, setPageInput] = useState<string>('1');
  const [showCategoryGrid, setShowCategoryGrid] = useState<boolean>(false);

  // Solved and attempted problem IDs for current user
  const { solvedProblemIds, attemptedProblemIds } = useMemo(() => {
    const userSubs = submissions.filter((s) => s.studentId === currentUser.id);
    const solved = new Set<string>();
    const attempted = new Set<string>();

    for (const sub of userSubs) {
      if (sub.status === 'Accepted') {
        solved.add(sub.problemId);
      } else {
        attempted.add(sub.problemId);
      }
    }
    return { solvedProblemIds: solved, attemptedProblemIds: attempted };
  }, [submissions, currentUser.id]);

  // Overall Statistics across all 1000+ problems
  const stats = useMemo(() => {
    const total = problems.length;
    let easyTotal = 0;
    let mediumTotal = 0;
    let hardTotal = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    for (const p of problems) {
      if (p.difficulty === 'Easy') {
        easyTotal++;
        if (solvedProblemIds.has(p.id)) easySolved++;
      } else if (p.difficulty === 'Medium') {
        mediumTotal++;
        if (solvedProblemIds.has(p.id)) mediumSolved++;
      } else if (p.difficulty === 'Hard') {
        hardTotal++;
        if (solvedProblemIds.has(p.id)) hardSolved++;
      }
    }

    const solvedTotal = solvedProblemIds.size;
    const progressPercent = total > 0 ? Math.round((solvedTotal / total) * 1000) / 10 : 0;

    return {
      total,
      easyTotal,
      mediumTotal,
      hardTotal,
      solvedTotal,
      easySolved,
      mediumSolved,
      hardSolved,
      progressPercent
    };
  }, [problems, solvedProblemIds]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of problems) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [problems]);

  // Filtering
  const filteredProblems = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    const isNumSearch = !isNaN(Number(q)) && Number(q) > 0;

    return problems.filter((p) => {
      // 1. Search Query
      if (q) {
        if (isNumSearch && p.problemNumber === Number(q)) {
          // Exact number match
        } else {
          const matchNum = String(p.problemNumber || '').includes(q) || p.id.toLowerCase().includes(q);
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchTags = p.tags && p.tags.some((t) => t.toLowerCase().includes(q));

          if (!matchNum && !matchTitle && !matchCat && !matchTags) {
            return false;
          }
        }
      }

      // 2. Difficulty
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) {
        return false;
      }

      // 3. Category
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // 4. Status
      const isSolved = solvedProblemIds.has(p.id);
      const isAttempted = attemptedProblemIds.has(p.id) && !isSolved;

      if (statusFilter === 'Solved' && !isSolved) return false;
      if (statusFilter === 'Attempted' && !isAttempted) return false;
      if (statusFilter === 'Unsolved' && (isSolved || isAttempted)) return false;

      return true;
    });
  }, [problems, searchQuery, selectedDifficulty, selectedCategory, statusFilter, solvedProblemIds, attemptedProblemIds]);

  // Sorting
  const sortedProblems = useMemo(() => {
    const list = [...filteredProblems];
    const diffWeights = { Easy: 1, Medium: 2, Hard: 3 };

    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'number') {
        comp = (a.problemNumber || 0) - (b.problemNumber || 0);
      } else if (sortBy === 'title') {
        comp = a.title.localeCompare(b.title);
      } else if (sortBy === 'difficulty') {
        comp = diffWeights[a.difficulty] - diffWeights[b.difficulty];
      } else if (sortBy === 'acceptance') {
        comp = (a.acceptanceRate || 50) - (b.acceptanceRate || 50);
      }
      return sortOrder === 'desc' ? -comp : comp;
    });

    return list;
  }, [filteredProblems, sortBy, sortOrder]);

  // Pagination
  const totalItems = sortedProblems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Sync page if filter changes
  useEffect(() => {
    setCurrentPage(1);
    setPageInput('1');
  }, [searchQuery, selectedDifficulty, selectedCategory, statusFilter, pageSize]);

  const paginatedProblems = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedProblems.slice(start, start + pageSize);
  }, [sortedProblems, validCurrentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    const target = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(target);
    setPageInput(String(target));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(pageInput, 10);
    if (!isNaN(val)) {
      handlePageChange(val);
    }
  };

  const handleRandomPick = () => {
    if (problems.length === 0) return;
    const pool = filteredProblems.length > 0 ? filteredProblems : problems;
    const unsolved = pool.filter((p) => !solvedProblemIds.has(p.id));
    const targetPool = unsolved.length > 0 ? unsolved : pool;
    const randomProb = targetPool[Math.floor(Math.random() * targetPool.length)];
    if (randomProb) {
      navigateToSolve(randomProb.id);
    }
  };

  const toggleSort = (field: 'number' | 'title' | 'difficulty' | 'acceptance') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-indigo-950/20 to-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              1,000+ Algorithmic Problems
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">27 Curated DSA Domains</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Code className="w-8 h-8 text-indigo-400" />
            LeetCode Problem Bank
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Interactive multi-language algorithmic bank with unit test execution, automatic hints, syntax highlighting, and progress tracking.
          </p>
        </div>

        {/* Quick Actions & Random Pick */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRandomPick}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            id="random-problem-pick-btn"
          >
            <Shuffle className="w-4 h-4" />
            <span>Pick Random Problem</span>
          </button>

          <button
            onClick={() => setShowCategoryGrid((prev) => !prev)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showCategoryGrid
                ? 'bg-zinc-800 border-indigo-500 text-white'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-indigo-400" />
            <span>{showCategoryGrid ? 'Hide Topics' : 'Explore Topics'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Difficulty Overview Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Solved */}
        <div className="bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Overall Progress</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-white font-mono">{stats.solvedTotal}</span>
            <span className="text-xs text-zinc-500">/ {stats.total} solved</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Easy */}
        <div className="bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span>Easy</span>
            <span className="text-[11px] font-mono">{stats.easySolved} / {stats.easyTotal}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-emerald-400 font-mono">{stats.easyTotal}</span>
            <span className="text-xs text-zinc-500">problems</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.easyTotal > 0 ? (stats.easySolved / stats.easyTotal) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Medium */}
        <div className="bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Medium</span>
            <span className="text-[11px] font-mono">{stats.mediumSolved} / {stats.mediumTotal}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-amber-400 font-mono">{stats.mediumTotal}</span>
            <span className="text-xs text-zinc-500">problems</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.mediumTotal > 0 ? (stats.mediumSolved / stats.mediumTotal) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Hard */}
        <div className="bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
            <span>Hard</span>
            <span className="text-[11px] font-mono">{stats.hardSolved} / {stats.hardTotal}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-rose-400 font-mono">{stats.hardTotal}</span>
            <span className="text-xs text-zinc-500">problems</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.hardTotal > 0 ? (stats.hardSolved / stats.hardTotal) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expandable 27-Category Domain Explorer */}
      {showCategoryGrid && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Browse by Algorithmic Category</h3>
            </div>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Reset to All ({stats.total})
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {PROBLEM_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.name] || 0;
              const isSelected = selectedCategory === cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? 'All' : cat.name);
                    setCurrentPage(1);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {count}
                    </span>
                  </div>
                  <div className="text-xs font-bold truncate">{cat.name}</div>
                  <div className="text-[10px] text-zinc-500 truncate mt-0.5">{cat.popularTags[0]}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Filter & Query Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-zinc-900/90 p-4 rounded-3xl border border-zinc-800 shadow-md">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search 1000+ problems by title, # number, topic, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              id="problem-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
            id="filter-category-select"
          >
            <option value="All">All 27 Topics ({stats.total})</option>
            {PROBLEM_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.icon} {cat.name} ({categoryCounts[cat.name] || 0})
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
            id="filter-status-select"
          >
            <option value="All">All Statuses</option>
            <option value="Solved">✅ Solved ({solvedProblemIds.size})</option>
            <option value="Attempted">⏳ Attempted ({attemptedProblemIds.size})</option>
            <option value="Unsolved">⭕ Unsolved ({stats.total - solvedProblemIds.size})</option>
          </select>
        </div>

        {/* Difficulty Selector Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-2xl border border-zinc-800 shrink-0">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDifficulty === diff
                  ? diff === 'Easy'
                    ? 'bg-emerald-500 text-black shadow'
                    : diff === 'Medium'
                    ? 'bg-amber-500 text-black shadow'
                    : diff === 'Hard'
                    ? 'bg-rose-500 text-white shadow'
                    : 'bg-indigo-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1 text-xs text-zinc-400">
        <div>
          Showing <span className="text-white font-bold">{totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="text-white font-bold">{Math.min(validCurrentPage * pageSize, totalItems)}</span> of{' '}
          <span className="text-indigo-400 font-bold font-mono">{totalItems}</span> matching problems
          {selectedCategory !== 'All' && (
            <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10px]">
              Topic: {selectedCategory}
            </span>
          )}
        </div>

        {/* Page Size & Quick Jump */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-500">Per page:</span>
            {[20, 50, 100].map((size) => (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors ${
                  pageSize === size
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/90 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th
                  onClick={() => toggleSort('number')}
                  className="py-3.5 px-4 w-20 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('title')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Title & Overview</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Category</th>
                <th
                  onClick={() => toggleSort('difficulty')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Difficulty</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('acceptance')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Acceptance</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-500">
                    <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-60" />
                    <div className="font-semibold text-zinc-400">No problems match your filter criteria.</div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDifficulty('All');
                        setSelectedCategory('All');
                        setStatusFilter('All');
                      }}
                      className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((prob) => {
                  const isSolved = solvedProblemIds.has(prob.id);
                  const isAttempted = attemptedProblemIds.has(prob.id) && !isSolved;

                  return (
                    <tr
                      key={prob.id}
                      onClick={() => navigateToSolve(prob.id)}
                      className="hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                      id={`prob-row-${prob.id}`}
                    >
                      {/* Status Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        {isSolved ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-sm" title="Solved">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : isAttempted ? (
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30" title="Attempted">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 mx-auto group-hover:border-zinc-500 transition-colors" />
                        )}
                      </td>

                      {/* Problem Number */}
                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs font-semibold">
                        #{prob.problemNumber ? String(prob.problemNumber).padStart(4, '0') : prob.id.replace('prob-', '').padStart(4, '0')}
                      </td>

                      {/* Title & Preview */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-indigo-400 transition-colors text-sm">
                          {prob.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 line-clamp-1 max-w-md mt-0.5">
                          {prob.description.replace(/###/g, '').replace(/\n/g, ' ')}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 text-[11px] font-medium inline-block">
                          {prob.category}
                        </span>
                      </td>

                      {/* Difficulty Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            prob.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>

                      {/* Acceptance */}
                      <td className="py-3.5 px-4 text-center font-mono text-zinc-300 text-xs">
                        {prob.acceptanceRate || 50}%
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(prob.tags || []).slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-zinc-800/60 text-[10px] text-zinc-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToSolve(prob.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all inline-flex items-center gap-1 group-hover:scale-105"
                        >
                          <span>Solve</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400">
              Page <span className="text-white font-bold font-mono">{validCurrentPage}</span> of{' '}
              <span className="text-white font-bold font-mono">{totalPages}</span> ({totalItems} total items)
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={validCurrentPage === 1}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => handlePageChange(validCurrentPage - 1)}
                disabled={validCurrentPage === 1}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = validCurrentPage - 2 + i;
                if (validCurrentPage <= 3) pageNum = i + 1;
                else if (validCurrentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;

                const isCurrent = pageNum === validCurrentPage;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-750 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(validCurrentPage + 1)}
                disabled={validCurrentPage === totalPages}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Jump to Page Form */}
            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="w-14 px-2 py-1 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white font-mono text-center outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
