import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, X, Sparkles, Check, Hash } from 'lucide-react';
import { motion } from 'motion/react';

export const CreateClassModal: React.FC = () => {
  const { isCreateClassOpen, setIsCreateClassOpen, createNewClass, setSelectedClassId, setActiveTab } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [academicYear, setAcademicYear] = useState('2026');
  const [selectedColor, setSelectedColor] = useState('from-blue-600 to-indigo-600');
  const [selectedEmoji, setSelectedEmoji] = useState('⚡');

  if (!isCreateClassOpen) return null;

  const colorOptions = [
    { label: 'Indigo / Violet', val: 'from-blue-600 to-indigo-600' },
    { label: 'Purple / Pink', val: 'from-purple-600 to-pink-600' },
    { label: 'Emerald / Teal', val: 'from-emerald-600 to-teal-600' },
    { label: 'Amber / Orange', val: 'from-amber-500 to-orange-600' },
    { label: 'Cyan / Ocean', val: 'from-cyan-600 to-blue-600' },
    { label: 'Rose / Crimson', val: 'from-rose-500 to-red-600' }
  ];

  const emojiOptions = ['⚡', '🎯', '🌲', '🚀', '💡', '🔥', '💻', '🔮', '🏆', '🧠'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClass = createNewClass({
      name: name.trim(),
      description: description.trim() || 'Classroom focused on coding practice and DSA mastery.',
      subject,
      academicYear
    });

    setIsCreateClassOpen(false);
    setSelectedClassId(newClass.id);
    setActiveTab('class-detail');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative max-h-[90vh] overflow-y-auto"
        id="create-class-modal-card"
      >
        <button
          onClick={() => setIsCreateClassOpen(false)}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create New Classroom</h3>
            <p className="text-xs text-zinc-400">Generate a unique join code and invite students to submit code</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Class Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DSA Batch A or CSE 2026 Placement Prep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none placeholder:text-zinc-600"
              id="input-class-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Subject / Track</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Algorithms, Java, LeetCode"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Academic Term / Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. Spring 2026"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Description & Syllabus Goals</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students will learn, problem solving expectations, and submission deadlines..."
              className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none placeholder:text-zinc-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Class Icon Emoji</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-purple-600/30 border-purple-500 scale-105'
                      : 'bg-zinc-800/60 border-zinc-700/60 hover:bg-zinc-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Join Code Preview Banner */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Hash className="w-4 h-4 text-purple-400" />
              <span>Unique Join Code will be auto-generated</span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
              {name ? `${name.slice(0, 3).toUpperCase()}-2026-***` : 'AUTO-CODE'}
            </span>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateClassOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all"
              id="submit-create-class-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Classroom</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
