import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { GoalType, StudentGoal } from '../../types';
import {
  X,
  Target,
  Flame,
  Calendar,
  Sparkles,
  Zap,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const StudentGoalModal: React.FC = () => {
  const { currentUser, isTeacher } = useAuth();
  const {
    isGoalModalOpen,
    setIsGoalModalOpen,
    editingGoal,
    createNewStudentGoal,
    updateStudentGoalRecord,
    showToast
  } = useApp();

  const [type, setType] = useState<GoalType>('weekly');
  const [targetCount, setTargetCount] = useState<number>(5);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingGoal) {
      setType(editingGoal.type);
      setTargetCount(editingGoal.targetCount);
      setCustomTitle(editingGoal.title || '');
    } else {
      setType('weekly');
      setTargetCount(5);
      setCustomTitle('');
    }
    setError('');
  }, [editingGoal, isGoalModalOpen]);

  if (!isGoalModalOpen || isTeacher) return null;

  const handleTypeChange = (newType: GoalType) => {
    setType(newType);
    if (!editingGoal) {
      if (newType === 'daily') setTargetCount(2);
      if (newType === 'weekly') setTargetCount(5);
      if (newType === 'monthly') setTargetCount(20);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (targetCount < 1) {
      setError('Target count must be at least 1 problem.');
      return;
    }

    try {
      if (editingGoal) {
        updateStudentGoalRecord(editingGoal.id, {
          type,
          targetCount,
          title: customTitle.trim() || undefined
        });
      } else {
        createNewStudentGoal({
          studentId: currentUser.id,
          type,
          targetCount,
          title: customTitle.trim() || undefined
        });
      }
      setIsGoalModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save coding goal');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {editingGoal ? 'Edit Personal Coding Goal' : 'Set Personal Coding Goal'}
              </h2>
              <p className="text-xs text-zinc-400">
                Track personal targets with auto-calculated progress and motivation
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGoalModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Goal Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Goal Cadence / Type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleTypeChange('daily')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  type === 'daily'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 ring-2 ring-amber-500/20 shadow-lg'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold">Daily Goal</span>
                <span className="text-[10px] text-zinc-500">Resets every 24h</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('weekly')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  type === 'weekly'
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 ring-2 ring-indigo-500/20 shadow-lg'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold">Weekly Goal</span>
                <span className="text-[10px] text-zinc-500">Mon - Sun sprint</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('monthly')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  type === 'monthly'
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 ring-2 ring-purple-500/20 shadow-lg'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Star className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold">Monthly Goal</span>
                <span className="text-[10px] text-zinc-500">30-day mastery</span>
              </button>
            </div>
          </div>

          {/* Target Problems Count */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Problems Target Count
              </label>
              <span className="font-extrabold text-sm text-indigo-400">
                {targetCount} Problems
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[1, 3, 5, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTargetCount(count)}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    targetCount === count
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {count} Problems
                </button>
              ))}
            </div>

            <input
              type="range"
              min="1"
              max="50"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Custom Title (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Custom Goal Title <span className="text-zinc-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder={
                type === 'daily'
                  ? 'e.g. Daily LeetCode Warmup'
                  : type === 'weekly'
                  ? 'e.g. Weekly Algorithm Grind'
                  : 'e.g. Monthly Coding Marathon'
              }
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Motivational Preview */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              All accepted submissions will automatically register towards this goal!
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              id="btn-save-student-goal"
            >
              <Target className="w-4 h-4" />
              <span>{editingGoal ? 'Update Goal' : 'Set Active Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
