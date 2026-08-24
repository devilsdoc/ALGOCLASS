import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { LeaderboardTimeframe, ClassLeaderboardEntry } from '../../types';
import {
  Trophy,
  Flame,
  Medal,
  Crown,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

interface ClassLeaderboardSectionProps {
  classId?: string;
  showClassDropdown?: boolean;
}

export const ClassLeaderboardSection: React.FC<ClassLeaderboardSectionProps> = ({
  classId: initialClassId,
  showClassDropdown = true
}) => {
  const { currentUser, isTeacher } = useAuth();
  const { classes, members } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('all-time');
  const [searchQuery, setSearchQuery] = useState('');

  // Keep selected class in sync if prop changes
  React.useEffect(() => {
    if (initialClassId) {
      setSelectedClassId(initialClassId);
    }
  }, [initialClassId]);

  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Compute live ranking data automatically from real activity
  const leaderboardEntries = useMemo(() => {
    if (!selectedClassId) return [];
    const entries = storage.getClassLeaderboard(selectedClassId, timeframe);
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.student.name.toLowerCase().includes(q) ||
        e.student.email.toLowerCase().includes(q)
    );
  }, [selectedClassId, timeframe, searchQuery]);

  const top3 = leaderboardEntries.slice(0, 3);

  // Time format helper
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return 'Inactive';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl" title="1st Place Champion">🥇</span>;
    if (rank === 2) return <span className="text-xl" title="2nd Place">🥈</span>;
    if (rank === 3) return <span className="text-xl" title="3rd Place">🥉</span>;
    return (
      <span className="inline-block font-mono font-bold text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900 border border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Class Coding Leaderboard</span>
                {activeClass && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                    {activeClass.bannerEmoji} {activeClass.name}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-400">
                Automated rankings derived from verified test passes, coding streak, and assignment completion
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {showClassDropdown && classes.length > 1 && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-semibold text-white focus:border-indigo-500 outline-none"
              id="class-leaderboard-selector"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bannerEmoji} {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Timeframe Filter Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800">
            <button
              onClick={() => setTimeframe('all-time')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'all-time'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              id="filter-timeframe-all-time"
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'month'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              id="filter-timeframe-month"
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframe === 'week'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              id="filter-timeframe-week"
            >
              This Week
            </button>
          </div>
        </div>
      </div>

      {/* Podium for Top 3 Performers */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="order-2 md:order-1 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center text-center relative overflow-hidden shadow-lg md:translate-y-3">
              <div className="text-2xl mb-1">🥈</div>
              <div className="relative mb-2">
                <img
                  src={top3[1].student.avatar}
                  alt={top3[1].student.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-zinc-400 shadow-md"
                />
              </div>
              <h3 className="font-bold text-sm text-white">{top3[1].student.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="font-extrabold text-indigo-400">{top3[1].problemsSolved} Solved</span>
                <span className="text-zinc-600">•</span>
                <span className="inline-flex items-center gap-0.5 text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {top3[1].streak}d
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1.5">
                {top3[1].assignmentCompletion}% Assignments • {formatTimeAgo(top3[1].recentActivity)}
              </div>
            </div>
          )}

          {/* 1st Place Champion */}
          {top3[0] && (
            <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 flex flex-col items-center text-center relative overflow-hidden shadow-2xl scale-102 z-10">
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5" />
                <span>Class Champion</span>
              </div>
              <div className="text-3xl mb-1">🥇</div>
              <div className="relative mb-2">
                <img
                  src={top3[0].student.avatar}
                  alt={top3[0].student.name}
                  className="w-18 h-18 rounded-2xl object-cover ring-4 ring-amber-400 shadow-xl"
                />
              </div>
              <h3 className="font-black text-base text-white">{top3[0].student.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="font-black text-amber-400 text-sm">{top3[0].problemsSolved} Problems Solved</span>
                <span className="text-zinc-600">•</span>
                <span className="inline-flex items-center gap-0.5 text-amber-400 font-extrabold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {top3[0].streak} Day Streak
                </span>
              </div>
              <div className="text-xs text-zinc-400 mt-2 font-medium">
                {top3[0].assignmentCompletion}% Assignment Completion ({top3[0].completedAssignmentsCount}/{top3[0].totalAssignmentsCount})
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Recent Activity: {formatTimeAgo(top3[0].recentActivity)}
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="order-3 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col items-center text-center relative overflow-hidden shadow-lg md:translate-y-5">
              <div className="text-2xl mb-1">🥉</div>
              <div className="relative mb-2">
                <img
                  src={top3[2].student.avatar}
                  alt={top3[2].student.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-700 shadow-md"
                />
              </div>
              <h3 className="font-bold text-sm text-white">{top3[2].student.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="font-extrabold text-indigo-400">{top3[2].problemsSolved} Solved</span>
                <span className="text-zinc-600">•</span>
                <span className="inline-flex items-center gap-0.5 text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {top3[2].streak}d
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1.5">
                {top3[2].assignmentCompletion}% Assignments • {formatTimeAgo(top3[2].recentActivity)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-xl">
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search student or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 outline-none"
              id="input-leaderboard-search"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Filter:</span>
            <span className="font-semibold text-indigo-400 capitalize">{timeframe.replace('-', ' ')}</span>
            <span className="text-zinc-600">•</span>
            <span>{leaderboardEntries.length} Enrolled Students</span>
          </div>
        </div>

        {leaderboardEntries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Activity Found</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Students will automatically appear on the leaderboard as they solve problems.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/40 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4 text-center">Problems Solved</th>
                  <th className="py-3.5 px-4 text-center">Coding Streak</th>
                  <th className="py-3.5 px-4 text-center">Assignment Completion</th>
                  <th className="py-3.5 px-4 text-center">Recent Activity</th>
                  <th className="py-3.5 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {leaderboardEntries.map((entry) => {
                  const isCurrent = entry.student.id === currentUser.id;

                  return (
                    <tr
                      key={entry.student.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        isCurrent ? 'bg-indigo-950/30 font-semibold' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        {getRankBadge(entry.rank)}
                      </td>

                      {/* Student Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.student.avatar}
                            alt={entry.student.name}
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-zinc-700"
                          />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{entry.student.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-500">{entry.student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Problems Solved */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-black text-white text-sm">{entry.problemsSolved}</span>
                      </td>

                      {/* Coding Streak */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 text-xs">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {entry.streak} Days
                        </span>
                      </td>

                      {/* Assignment Completion */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-emerald-400 text-xs">
                            {entry.assignmentCompletion}%
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {entry.completedAssignmentsCount}/{entry.totalAssignmentsCount} done
                          </span>
                        </div>
                      </td>

                      {/* Recent Activity */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 text-zinc-400 text-xs">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{formatTimeAgo(entry.recentActivity)}</span>
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-extrabold text-indigo-400 text-sm">
                          {entry.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
