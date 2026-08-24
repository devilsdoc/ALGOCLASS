import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { StudentMetrics } from '../../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Flame,
  Clock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Trophy,
  CheckCircle2,
  Users
} from 'lucide-react';

interface Props {
  classIdFilter?: string;
  showClassSelector?: boolean;
}

export const StudentMonitoringTable: React.FC<Props> = ({ classIdFilter, showClassSelector = false }) => {
  const { currentUser } = useAuth();
  const { classes, setSelectedStudentForAnalytics } = useApp();

  const [selectedClass, setSelectedClass] = useState<string>(classIdFilter || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<
    | 'SOLVED_DESC'
    | 'SOLVED_ASC'
    | 'ACTIVE_DESC'
    | 'ACTIVE_ASC'
    | 'ACC_DESC'
    | 'ACC_ASC'
    | 'PROG_DESC'
    | 'PROG_ASC'
  >('SOLVED_DESC');
  const [filterProgress, setFilterProgress] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const teacherClasses = classes.filter((c) => c.teacherId === currentUser.id);

  // Compute live student metrics
  const allMetrics = useMemo(() => {
    const filterId = selectedClass === 'ALL' ? undefined : selectedClass;
    return storage.getStudentMetricsForTeacher(currentUser.id, filterId);
  }, [currentUser.id, selectedClass]);

  // Filter & Sort
  const processedMetrics = useMemo(() => {
    return allMetrics
      .filter((m) => {
        const matchesSearch =
          m.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.student.email.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesProg = true;
        if (filterProgress === 'NEEDS_ATTENTION') {
          matchesProg = m.needsAttention;
        } else if (filterProgress === 'UNDER_25') {
          matchesProg = m.overallProgressScore < 25;
        } else if (filterProgress === '25_50') {
          matchesProg = m.overallProgressScore >= 25 && m.overallProgressScore < 50;
        } else if (filterProgress === '50_75') {
          matchesProg = m.overallProgressScore >= 50 && m.overallProgressScore < 75;
        } else if (filterProgress === '75_100') {
          matchesProg = m.overallProgressScore >= 75;
        }

        let matchesStatus = true;
        const lastActiveTime = new Date(m.lastActive).getTime();
        const isInactive = Date.now() - lastActiveTime > 4 * 24 * 60 * 60 * 1000;
        if (filterStatus === 'ACTIVE') {
          matchesStatus = !isInactive;
        } else if (filterStatus === 'INACTIVE') {
          matchesStatus = isInactive;
        }

        return matchesSearch && matchesProg && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'SOLVED_DESC':
            return b.totalSolved - a.totalSolved;
          case 'SOLVED_ASC':
            return a.totalSolved - b.totalSolved;
          case 'ACTIVE_DESC':
            return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
          case 'ACTIVE_ASC':
            return new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          case 'ACC_DESC':
            return b.acceptanceRate - a.acceptanceRate;
          case 'ACC_ASC':
            return a.acceptanceRate - b.acceptanceRate;
          case 'PROG_DESC':
            return b.overallProgressScore - a.overallProgressScore;
          case 'PROG_ASC':
            return a.overallProgressScore - b.overallProgressScore;
          default:
            return 0;
        }
      });
  }, [allMetrics, searchQuery, sortBy, filterProgress, filterStatus]);

  return (
    <div className="space-y-4">
      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800/80">
        <div className="flex-1 flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 outline-none"
              id="student-search-input"
            />
          </div>

          {/* Class Filter (if permitted) */}
          {showClassSelector && (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
            >
              <option value="ALL">All My Classes ({teacherClasses.length})</option>
              {teacherClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bannerEmoji} {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Progress Filter */}
          <select
            value={filterProgress}
            onChange={(e) => setFilterProgress(e.target.value)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
          >
            <option value="ALL">All Progress Levels</option>
            <option value="NEEDS_ATTENTION">💀 Needs Attention</option>
            <option value="75_100">75% - 100% (High)</option>
            <option value="50_75">50% - 75% (Medium)</option>
            <option value="25_50">25% - 50% (Fair)</option>
            <option value="UNDER_25">&lt; 25% (Low)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
          >
            <option value="ALL">All Activity States</option>
            <option value="ACTIVE">⚡ Active Recently</option>
            <option value="INACTIVE">💤 Inactive (&gt;4 days)</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-indigo-300 font-medium focus:border-indigo-500 outline-none"
          >
            <option value="SOLVED_DESC">Most Problems Solved</option>
            <option value="SOLVED_ASC">Least Problems Solved</option>
            <option value="PROG_DESC">Highest Overall Progress</option>
            <option value="PROG_ASC">Lowest Overall Progress</option>
            <option value="ACC_DESC">Highest Acceptance Rate</option>
            <option value="ACC_ASC">Lowest Acceptance Rate</option>
            <option value="ACTIVE_DESC">Most Recently Active</option>
            <option value="ACTIVE_ASC">Least Recently Active</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4 text-center">Status / Badge</th>
                <th className="py-3 px-4 text-center">Solved (E/M/H)</th>
                <th className="py-3 px-4 text-center">Acceptance</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-center">Assignments</th>
                <th className="py-3 px-4 text-center">Overall Progress</th>
                <th className="py-3 px-4 text-right">Last Active</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {processedMetrics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500 text-xs">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-2 text-zinc-600">
                      <Users className="w-5 h-5" />
                    </div>
                    No students match your filter criteria.
                  </td>
                </tr>
              ) : (
                processedMetrics.map((item) => {
                  const { student, totalSolved, easySolved, mediumSolved, hardSolved, acceptanceRate, streak, lastActive, overallProgressScore, assignmentCompletionRate, badge, needsAttention, needsAttentionReason } = item;

                  return (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedStudentForAnalytics(item)}
                      className={`hover:bg-zinc-900/80 cursor-pointer transition-colors group ${
                        needsAttention ? 'bg-rose-950/10' : ''
                      }`}
                      id={`student-row-${student.id}`}
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-zinc-700"
                          />
                          <div>
                            <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                              <span>{student.name}</span>
                              {needsAttention && (
                                <span title={needsAttentionReason}>
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate max-w-[150px]">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Badge / Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            badge === '🏆 Top Performer'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              : badge === '🔥 On Fire'
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              : badge === '💀 Needs Attention'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 animate-pulse'
                              : badge === '⚡ Active Now'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {badge || 'Active'}
                        </span>
                      </td>

                      {/* Problems Solved (Total & E/M/H) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-white text-sm">{totalSolved}</div>
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-mono mt-0.5">
                          <span className="text-emerald-400">{easySolved}E</span>
                          <span>•</span>
                          <span className="text-amber-400">{mediumSolved}M</span>
                          <span>•</span>
                          <span className="text-rose-400">{hardSolved}H</span>
                        </div>
                      </td>

                      {/* Acceptance Rate */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-emerald-400">{acceptanceRate}%</span>
                      </td>

                      {/* Streak */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-amber-400 text-xs">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{streak}d</span>
                        </div>
                      </td>

                      {/* Assignments */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-purple-500 h-full rounded-full"
                              style={{ width: `${assignmentCompletionRate}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-300">
                            {assignmentCompletionRate}%
                          </span>
                        </div>
                      </td>

                      {/* Overall Progress */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                overallProgressScore >= 75
                                  ? 'bg-emerald-500'
                                  : overallProgressScore >= 40
                                  ? 'bg-indigo-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${overallProgressScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-white text-xs">{overallProgressScore}%</span>
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-right text-zinc-400 text-[11px]">
                        {new Date(lastActive).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentForAnalytics(item);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white transition-colors text-[11px] font-semibold flex items-center gap-1 ml-auto"
                        >
                          <span>Analytics</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
