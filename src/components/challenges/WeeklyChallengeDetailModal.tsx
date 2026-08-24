import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { WeeklyChallenge } from '../../types';
import {
  X,
  Flame,
  Clock,
  Calendar,
  CheckCircle2,
  Lock,
  Trophy,
  ArrowRight,
  Code2,
  Users,
  Medal,
  Crown,
  Play,
  Share2,
  Sparkles
} from 'lucide-react';

interface WeeklyChallengeDetailModalProps {
  challenge: WeeklyChallenge | null;
  onClose: () => void;
}

export const WeeklyChallengeDetailModal: React.FC<WeeklyChallengeDetailModalProps> = ({
  challenge,
  onClose
}) => {
  const { currentUser, isTeacher } = useAuth();
  const { problems, submissions, navigateToSolve, openEditChallenge, deleteWeeklyChallengeRecord } = useApp();

  // Timer countdown state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    hasEnded: boolean;
    hasStarted: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hasEnded: false,
    hasStarted: false
  });

  useEffect(() => {
    if (!challenge) return;

    const updateTimer = () => {
      const now = Date.now();
      const start = new Date(challenge.startDate).getTime();
      const end = new Date(challenge.endDate).getTime();

      const hasStarted = now >= start;
      const hasEnded = now >= end;

      const target = hasStarted ? end : start;
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        hasEnded,
        hasStarted
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [challenge]);

  const challengeProblems = useMemo(() => {
    if (!challenge) return [];
    return problems.filter((p) => challenge.problemIds.includes(p.id));
  }, [challenge, problems]);

  // Compute participants & rankings
  const participants = useMemo(() => {
    if (!challenge) return [];
    return storage.getChallengeParticipants(challenge.id);
  }, [challenge, submissions]);

  // Current user's progress
  const myParticipantRecord = useMemo(() => {
    return participants.find((p) => p.student.id === currentUser.id);
  }, [participants, currentUser.id]);

  const myCompletedIds = useMemo(() => {
    return new Set(myParticipantRecord?.completedProblemIds || []);
  }, [myParticipantRecord]);

  if (!challenge) return null;

  const top3 = participants.slice(0, 3);
  const isOwnerTeacher = isTeacher && challenge.teacherId === currentUser.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Banner / Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-zinc-900 border-b border-zinc-800 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{challenge.className}</span>
                </span>

                {timeLeft.hasEnded ? (
                  <span className="text-xs px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Challenge Concluded • Standings Locked</span>
                  </span>
                ) : (
                  <span className="text-xs px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Challenge</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {challenge.title}
              </h2>
              <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                {challenge.description}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Countdown timer ticker */}
          <div className="mt-4 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-zinc-300 font-semibold">
                {timeLeft.hasEnded
                  ? 'Final results locked on:'
                  : timeLeft.hasStarted
                  ? 'Time Remaining:'
                  : 'Starts In:'}
              </span>
              {!timeLeft.hasEnded && (
                <div className="inline-flex items-center gap-1 font-mono font-bold text-amber-300 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
                  <span>{String(timeLeft.hours).padStart(2, '0')}h </span>
                  <span>{String(timeLeft.minutes).padStart(2, '0')}m </span>
                  <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
              )}
            </div>

            <div className="text-zinc-400 text-[11px]">
              {new Date(challenge.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
              {new Date(challenge.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Student Personal Progress Bar */}
          {!isTeacher && (
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Your Challenge Progress</span>
                </span>
                <span className="font-extrabold text-indigo-400">
                  {myCompletedIds.size} / {challengeProblems.length} Problems Solved
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 transition-all duration-500"
                  style={{
                    width: `${Math.round((myCompletedIds.size / Math.max(1, challengeProblems.length)) * 100)}%`
                  }}
                />
              </div>
              {myCompletedIds.size >= challengeProblems.length && challengeProblems.length > 0 && (
                <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sprint complete! You have solved all challenge problems.</span>
                </div>
              )}
            </div>
          )}

          {/* Problem Set */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Challenge Problems ({challengeProblems.length})</span>
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {challengeProblems.map((prob, idx) => {
                const isSolved = myCompletedIds.has(prob.id);

                return (
                  <div
                    key={prob.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSolved
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center ${
                          isSolved
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <span>{prob.title}</span>
                          {isSolved && (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full font-bold">
                              ✓ Solved
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              prob.difficulty === 'Easy'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : prob.difficulty === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                          <span className="text-[10px] text-zinc-500">{prob.category}</span>
                        </div>
                      </div>
                    </div>

                    {!isTeacher && (
                      <button
                        onClick={() => {
                          onClose();
                          navigateToSolve(prob.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isSolved
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        }`}
                      >
                        <span>{isSolved ? 'Review Code' : 'Solve Challenge'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participant Rankings & Podium */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Challenge Standings & Leaderboard ({participants.length} coders)</span>
              </h3>
              {timeLeft.hasEnded && (
                <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  Official Final Standings
                </span>
              )}
            </div>

            {/* Top 3 Performers Badge Showcase */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {top3.map((p, idx) => (
                  <div
                    key={p.student.id}
                    className={`p-3 rounded-2xl border text-center relative overflow-hidden ${
                      idx === 0
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                        : idx === 1
                        ? 'bg-zinc-900/90 border-zinc-700 text-zinc-300'
                        : 'bg-zinc-900/90 border-amber-900/50 text-amber-500'
                    }`}
                  >
                    <div className="text-lg">
                      {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : '🥉 3rd'}
                    </div>
                    <img
                      src={p.student.avatar}
                      alt={p.student.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-zinc-700 mx-auto my-1"
                    />
                    <div className="font-bold text-xs text-white truncate">{p.student.name}</div>
                    <div className="text-[10px] text-zinc-400">
                      {p.completedCount}/{p.totalCount} problems solved
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Full participant table */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold bg-zinc-900/60">
                    <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3 text-center">Solved</th>
                    <th className="py-2.5 px-3 text-right">Completion Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-500 text-xs">
                        No submissions yet. Be the first to solve!
                      </td>
                    </tr>
                  ) : (
                    participants.map((p) => {
                      const isMe = p.student.id === currentUser.id;

                      return (
                        <tr
                          key={p.student.id}
                          className={`hover:bg-zinc-800/30 ${isMe ? 'bg-indigo-950/20 font-bold' : ''}`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={p.student.avatar}
                                alt={p.student.name}
                                className="w-6 h-6 rounded-lg object-cover"
                              />
                              <span className="text-white text-xs">{p.student.name}</span>
                              {isMe && (
                                <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-white">
                            {p.completedCount} / {p.totalCount}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[11px] text-zinc-400">
                            {p.completionTime
                              ? new Date(p.completionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'In progress'}
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            Sprint created by {challenge.teacherName}
          </div>

          <div className="flex items-center gap-2">
            {isOwnerTeacher && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    openEditChallenge(challenge);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
                >
                  Edit Challenge
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this weekly challenge?')) {
                      deleteWeeklyChallengeRecord(challenge.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
