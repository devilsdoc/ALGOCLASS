import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FileCode2, X, Plus, Check, Search, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const AssignmentCreatorModal: React.FC = () => {
  const { isCreateAssignmentOpen, setIsCreateAssignmentOpen, createNewAssignment, classes, problems, selectedClassId } = useApp();
  const { currentUser } = useAuth();

  const teacherClasses = classes.filter((c) => c.teacherId === currentUser.id);

  const [classId, setClassId] = useState(selectedClassId || teacherClasses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [problemSearch, setProblemSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  if (!isCreateAssignmentOpen) return null;

  const toggleProblemSelection = (probId: string) => {
    setSelectedProblemIds((prev) =>
      prev.includes(probId) ? prev.filter((id) => id !== probId) : [...prev, probId]
    );
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(problemSearch.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classId || selectedProblemIds.length === 0) return;

    createNewAssignment({
      classId,
      title: title.trim(),
      description: description.trim() || 'Complete all selected coding problems before the deadline.',
      problemIds: selectedProblemIds,
      startDate: new Date(startDate).toISOString(),
      deadline: new Date(`${deadline}T23:59:59.000Z`).toISOString()
    });

    setIsCreateAssignmentOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative max-h-[90vh] flex flex-col"
        id="assignment-creator-modal"
      >
        <button
          onClick={() => setIsCreateAssignmentOpen(false)}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create Coding Assignment</h3>
            <p className="text-xs text-zinc-400">Select problems from the bank and set a completion deadline</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Assign to Class <span className="text-rose-400">*</span>
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                required
                id="select-assignment-class"
              >
                {teacherClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.bannerEmoji} {c.name} ({c.joinCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Assignment Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Array Fundamentals & Two Pointers"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                id="input-assignment-title"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Description & Instructions</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, required time complexities, or tips..."
              className="w-full px-3.5 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Problem Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>Select Coding Problems ({selectedProblemIds.length} chosen)</span>
                <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-1">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      difficultyFilter === diff
                        ? 'bg-zinc-700 text-white'
                        : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search problem title or category..."
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-zinc-800/80 rounded-xl p-2 bg-zinc-950/40">
              {filteredProblems.map((prob) => {
                const isSelected = selectedProblemIds.includes(prob.id);
                return (
                  <div
                    key={prob.id}
                    onClick={() => toggleProblemSelection(prob.id)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-300 hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 bg-zinc-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{prob.title}</div>
                        <div className="text-[10px] text-zinc-400">{prob.category}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        prob.difficulty === 'Easy'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : prob.difficulty === 'Medium'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateAssignmentOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || selectedProblemIds.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
              id="submit-create-assignment-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Assignment ({selectedProblemIds.length})</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
