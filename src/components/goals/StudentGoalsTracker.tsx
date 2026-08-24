import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { StudentGoal } from '../../types';
import { GoalHistoryModal } from './GoalHistoryModal';
import {
  Target,
  Flame,
  Plus,
  Calendar,
  Zap,
  Star,
  CheckCircle2,
  Trophy,
  Sparkles,
  History,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react';

interface StudentGoalsTrackerProps {
  compact?: boolean;
}

export const StudentGoalsTracker: React.FC<StudentGoalsTrackerProps> = ({ compact = false }) => {
  const { currentUser, isTeacher } = useAuth();
  const {
    studentGoals,
    openCreateGoal,
    openEditGoal,
    deleteStudentGoalRecord,
    submissions
  } = useApp();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Compute live goals
  const myGoals = useMemo(() => {
    return storage.getStudentGoals(currentUser.id);
  }, [studentGoals, submissions, currentUser.id]);

  const activeGoals = myGoals.filter((g) => g.status === 'active');

  // Motivational message helper
  const getMotivation = (percent: number, isDone: boolean, defaultMessage?: string) => {
    if (isDone || percent >= 100) {
      return {
        text: 'Goal completed! You crushed it! 🎉',
        icon: '🏆',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      };
    }
    if (percent >= 70) {
      return {
        text: 'Almost there! Just a few more to go! 🚀',
        icon: '⚡',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      };
    }
    if (percent > 0) {
      return {
        text: defaultMessage || 'Keep grinding! Momentum is building! 🔥',
        icon: '🔥',
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
      };
    }
    return {
      text: "Let's start! Solve a problem to begin. 💡",
      icon: '✨',
      color: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/50'
    };
  };

  if (isTeacher) return null;

  return (
    <div className="space-y-4">
      {/* Tracker Card Container */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Personal Coding Goals</span>
                {activeGoals.length > 0 && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {activeGoals.length} Active
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Track personal targets with auto-calculated progress and motivational boosts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="View Goal History"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={() => openCreateGoal()}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              id="btn-set-new-goal"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set Goal</span>
            </button>
          </div>
        </div>

        {/* Active Goals Feed */}
        {activeGoals.length === 0 ? (
          <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-zinc-200">No active coding goal set</div>
            <p className="text-[11px] text-zinc-500 mt-0.5 mb-3">
              Set a daily, weekly, or monthly problem target to build strong problem solving habits.
            </p>
            <button
              onClick={() => openCreateGoal()}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              Set My First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeGoals.map((goal) => {
              const percent = goal.progressPercent;
              const isDone = goal.isCompleted;
              const mot = getMotivation(percent, isDone, goal.motivationalMessage);

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between space-y-3 relative group"
                >
                  <div>
                    {/* Top Type & Actions */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase flex items-center gap-1 ${
                          goal.type === 'daily'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : goal.type === 'weekly'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {goal.type === 'daily' && <Zap className="w-3 h-3 text-amber-400" />}
                        {goal.type === 'weekly' && <Calendar className="w-3 h-3 text-indigo-400" />}
                        {goal.type === 'monthly' && <Star className="w-3 h-3 text-purple-400" />}
                        <span>{goal.type.toUpperCase()} Goal</span>
                      </span>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditGoal(goal)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit Goal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteStudentGoalRecord(goal.id)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Goal Title */}
                    <h4 className="font-bold text-xs text-white mt-2">
                      {goal.title || `${goal.type.toUpperCase()} Algorithm Milestone`}
                    </h4>

                    {/* Progress Bar & Numerical Target */}
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-white">
                          {goal.currentProgress} / {goal.targetCount} Solved
                        </span>
                        <span className="font-black text-indigo-400">{percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isDone
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Motivational message banner */}
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${mot.color}`}
                  >
                    <span>{mot.icon}</span>
                    <span>{mot.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Goal History Modal */}
      <GoalHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};
