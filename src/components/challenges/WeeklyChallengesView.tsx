import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { WeeklyChallenge } from '../../types';
import { WeeklyChallengeDetailModal } from './WeeklyChallengeDetailModal';
import {
  Flame,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight,
  Code2,
  Trophy,
  Sparkles,
  Filter,
  Medal,
  Users
} from 'lucide-react';

interface WeeklyChallengesViewProps {
  classId?: string;
  showClassSelector?: boolean;
}

export const WeeklyChallengesView: React.FC<WeeklyChallengesViewProps> = ({
  classId: initialClassId,
  showClassSelector = true
}) => {
  const { currentUser, isTeacher } = useAuth();
  const {
    classes,
    members,
    weeklyChallenges,
    problems,
    submissions,
    openCreateChallenge,
    navigateToSolve
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedChallengeForDetail, setSelectedChallengeForDetail] = useState<WeeklyChallenge | null>(null);

  // Student's joined class IDs
  const myClassIds = useMemo(() => {
    if (isTeacher) {
      return new Set(classes.filter((c) => c.teacherId === currentUser.id).map((c) => c.id));
    }
    return new Set(members.filter((m) => m.studentId === currentUser.id).map((m) => m.classId));
  }, [classes, members, currentUser.id, isTeacher]);

  // Filter challenges visible to user
  const visibleChallenges = useMemo(() => {
    const now = Date.now();
    return weeklyChallenges
      .filter((c) => {
        // Must belong to user's class
        if (!myClassIds.has(c.classId)) return false;
        if (selectedClassId && selectedClassId !== 'ALL' && c.classId !== selectedClassId) return false;

        const end = new Date(c.endDate).getTime();
        const isEnded = now >= end;

        if (statusFilter === 'active') return !isEnded;
        if (statusFilter === 'completed') return isEnded;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [weeklyChallenges, myClassIds, selectedClassId, statusFilter]);

  const activeClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Weekly Coding Challenges</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Competitive Sprints
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Time-boxed competitive problem sets with live rankings, countdown timers, and locked hall-of-fame standings
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Class Filter */}
          {showClassSelector && classes.length > 1 && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-semibold text-white focus:border-indigo-500 outline-none"
            >
              <option value="ALL">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bannerEmoji} {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-zinc-950 border border-zinc-800">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'active'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Active 🔥
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Concluded 🏁
            </button>
          </div>

          {/* Teacher Create Challenge Button */}
          {isTeacher && (
            <button
              onClick={() => openCreateChallenge(selectedClassId !== 'ALL' ? selectedClassId : undefined)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
              id="btn-create-weekly-challenge"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Challenge</span>
            </button>
          )}
        </div>
      </div>

      {/* Challenges Grid */}
      {visibleChallenges.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Weekly Challenges Found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            {isTeacher
              ? 'Create a new weekly sprint challenge to boost problem-solving momentum and engagement for your class.'
              : 'Your instructors have not scheduled active weekly challenges for your classes yet.'}
          </p>
          {isTeacher && (
            <button
              onClick={() => openCreateChallenge(selectedClassId !== 'ALL' ? selectedClassId : undefined)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Launch First Challenge
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleChallenges.map((challenge) => {
            const now = Date.now();
            const start = new Date(challenge.startDate).getTime();
            const end = new Date(challenge.endDate).getTime();
            const isEnded = now >= end;
            const isUpcoming = now < start;
            const isActive = !isEnded && !isUpcoming;

            const participants = storage.getChallengeParticipants(challenge.id);
            const myRecord = participants.find((p) => p.student.id === currentUser.id);
            const solvedCount = myRecord?.completedCount || 0;
            const totalProblems = challenge.problemIds.length;
            const percent = Math.round((solvedCount / Math.max(1, totalProblems)) * 100);
            const top3 = participants.slice(0, 3);

            // Time difference string
            let timeString = '';
            if (isEnded) {
              timeString = 'Sprint Ended • Standings Locked';
            } else if (isActive) {
              const diffHours = Math.round((end - now) / (1000 * 60 * 60));
              timeString = `${diffHours} hours remaining`;
            } else {
              const diffHours = Math.round((start - now) / (1000 * 60 * 60));
              timeString = `Starts in ${diffHours} hours`;
            }

            return (
              <div
                key={challenge.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between relative overflow-hidden shadow-xl ${
                  isActive
                    ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/20 border-amber-500/30'
                    : 'bg-zinc-900/90 border-zinc-800 opacity-90'
                }`}
              >
                <div>
                  {/* Top Status & Class Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                      <span>{challenge.className}</span>
                    </span>

                    {isActive && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>Active Challenge</span>
                      </span>
                    )}
                    {isEnded && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-zinc-400" />
                        <span>Concluded</span>
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Upcoming</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {challenge.description}
                  </p>

                  {/* Meta metrics */}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{totalProblems} Problems</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{participants.length} Active Participants</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeString}</span>
                    </div>
                  </div>

                  {/* Student Personal Progress bar */}
                  {!isTeacher && (
                    <div className="mt-4 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-semibold">Your Progress</span>
                        <span className="font-extrabold text-indigo-400">
                          {solvedCount} / {totalProblems} Solved ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Top 3 Podium Preview if ended or active */}
                  {top3.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                      <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-semibold text-zinc-300">Leaders:</span>
                      <div className="flex items-center gap-2 overflow-hidden">
                        {top3.map((p, idx) => (
                          <span key={p.student.id} className="truncate">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {p.student.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    By {challenge.teacherName}
                  </span>

                  <button
                    onClick={() => setSelectedChallengeForDetail(challenge)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>{isEnded ? 'View Final Standings' : 'Open Challenge'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Challenge Drilldown / Solver Modal */}
      {selectedChallengeForDetail && (
        <WeeklyChallengeDetailModal
          challenge={selectedChallengeForDetail}
          onClose={() => setSelectedChallengeForDetail(null)}
        />
      )}
    </div>
  );
};
