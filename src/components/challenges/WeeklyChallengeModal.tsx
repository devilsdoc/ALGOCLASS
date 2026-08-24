import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Problem } from '../../types';
import {
  X,
  Flame,
  Calendar,
  Code2,
  Check,
  Search,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const WeeklyChallengeModal: React.FC = () => {
  const { currentUser, isTeacher } = useAuth();
  const {
    isChallengeModalOpen,
    setIsChallengeModalOpen,
    editingChallenge,
    challengeTargetClassId,
    classes,
    problems,
    createNewWeeklyChallenge,
    updateWeeklyChallengeRecord,
    showToast
  } = useApp();

  // Filter teacher's own classes
  const teacherClasses = classes.filter((c) => c.teacherId === currentUser.id);

  const [classId, setClassId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [problemSearch, setProblemSearch] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingChallenge) {
      setClassId(editingChallenge.classId);
      setTitle(editingChallenge.title);
      setDescription(editingChallenge.description);
      setSelectedProblemIds(editingChallenge.problemIds);
      setStartDate(editingChallenge.startDate.slice(0, 16));
      setEndDate(editingChallenge.endDate.slice(0, 16));
    } else {
      const target = challengeTargetClassId || teacherClasses[0]?.id || '';
      setClassId(target);
      setTitle('');
      setDescription('');
      setSelectedProblemIds([]);

      // Default start: now, default end: 7 days from now
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setStartDate(now.toISOString().slice(0, 16));
      setEndDate(nextWeek.toISOString().slice(0, 16));
    }
    setError('');
  }, [editingChallenge, challengeTargetClassId, isChallengeModalOpen, classes]);

  if (!isChallengeModalOpen || !isTeacher) return null;

  const toggleProblem = (id: string) => {
    if (selectedProblemIds.includes(id)) {
      setSelectedProblemIds(selectedProblemIds.filter((pId) => pId !== id));
    } else {
      setSelectedProblemIds([...selectedProblemIds, id]);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(problemSearch.toLowerCase()));
    const matchesDiff = difficultyFilter === 'ALL' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!classId) {
      setError('Please select a target class.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a challenge title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a challenge description.');
      return;
    }
    if (selectedProblemIds.length === 0) {
      setError('Please select at least 1 coding problem for this challenge.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please provide both start and end dates.');
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (end <= start) {
      setError('End date must be strictly after the start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingChallenge) {
        updateWeeklyChallengeRecord(editingChallenge.id, {
          title: title.trim(),
          description: description.trim(),
          problemIds: selectedProblemIds,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        });
      } else {
        createNewWeeklyChallenge({
          classId,
          title: title.trim(),
          description: description.trim(),
          problemIds: selectedProblemIds,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        });
      }
      setIsChallengeModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save weekly challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {editingChallenge ? 'Edit Weekly Challenge' : 'Create Weekly Challenge'}
              </h2>
              <p className="text-xs text-zinc-400">
                Launch a time-limited competitive coding sprint for your class
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsChallengeModalOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Class */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Target Class <span className="text-rose-400">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={Boolean(editingChallenge)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white focus:border-indigo-500 outline-none disabled:opacity-50"
            >
              {teacherClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bannerEmoji} {c.name} ({c.subject})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-zinc-500 mt-1">
              Only students enrolled in this class can participate and appear on the challenge leaderboard.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Challenge Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Week 4: Dynamic Programming Mastery Sprint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Description & Rules <span className="text-rose-400">*</span>
            </label>
            <textarea
              placeholder="Describe the challenge goals, prizes, or topics covered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 outline-none resize-none"
              required
            />
          </div>

          {/* Dates (Start & End) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Start Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>End Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Select Challenge Problems */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Select Challenge Problems ({selectedProblemIds.length} chosen)</span>
              </label>
              <span className="text-[11px] text-zinc-500">Pick 1 to 5 problems</span>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search problem title or tag..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:border-indigo-500 outline-none"
              >
                <option value="ALL">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Problem list selector */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-zinc-800/80 rounded-2xl p-2 bg-zinc-950/40">
              {filteredProblems.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">
                  No matching problems found
                </div>
              ) : (
                filteredProblems.map((p) => {
                  const isSelected = selectedProblemIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleProblem(p.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-zinc-700 bg-zinc-950 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-semibold">{p.title}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                p.difficulty === 'Easy'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : p.difficulty === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {p.difficulty}
                            </span>
                            <span className="text-[10px] text-zinc-500">{p.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsChallengeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>{editingChallenge ? 'Save Changes' : 'Publish Weekly Challenge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
