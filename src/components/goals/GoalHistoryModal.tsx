import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { StudentGoalWithProgress } from '../../types';
import {
  X,
  Target,
  CheckCircle2,
  Calendar,
  Zap,
  Star,
  Award,
  History,
  Sparkles
} from 'lucide-react';

interface GoalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalHistoryModal: React.FC<GoalHistoryModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const allGoals: StudentGoalWithProgress[] = storage.getStudentGoals(currentUser.id);
  const completedGoals = allGoals.filter((g) => g.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <History className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Personal Goals History
              </h2>
              <p className="text-xs text-zinc-400">
                Log of all past daily, weekly, and monthly coding milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Goals */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {allGoals.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No past goals recorded yet.
            </div>
          ) : (
            allGoals.map((goal) => {
              const isDone = goal.isCompleted || goal.status === 'completed';
              const percent = goal.progressPercent;

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : goal.status === 'active'
                      ? 'bg-indigo-950/20 border-indigo-500/30'
                      : 'bg-zinc-950/40 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                          goal.type === 'daily'
                            ? 'bg-amber-500/20 text-amber-300'
                            : goal.type === 'weekly'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {goal.type}
                      </span>
                      <h4 className="font-bold text-xs text-white">
                        {goal.title || `${goal.type.toUpperCase()} Challenge`}
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : goal.status === 'active'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">
                        {goal.currentProgress} of {goal.targetCount} problems solved
                      </span>
                      <span className="font-extrabold text-white">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full ${
                          isDone ? 'bg-emerald-400' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    <span>
                      {new Date(goal.periodStart).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                      {new Date(goal.periodEnd).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    {isDone && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Target Reached!
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            Total completed milestones: <span className="font-bold text-emerald-400">{completedGoals.length}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

