import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, X, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const JoinClassModal: React.FC = () => {
  const { isJoinClassOpen, setIsJoinClassOpen, joinClass, classes } = useApp();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isJoinClassOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Please enter a class join code');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await joinClass(code.trim());
    setIsSubmitting(false);

    if (res.success) {
      setCode('');
      setIsJoinClassOpen(false);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickFill = (suggestedCode: string) => {
    setCode(suggestedCode);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative"
        id="join-class-modal-card"
      >
        <button
          onClick={() => {
            setIsJoinClassOpen(false);
            setErrorMsg(null);
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Join a Classroom</h3>
            <p className="text-xs text-zinc-400">Enter the unique code provided by your instructor</p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Class Join Code
            </label>
            <input
              type="text"
              placeholder="e.g. DSA-2026-X7"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setErrorMsg(null);
              }}
              className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-center text-lg font-mono font-bold text-white tracking-widest focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none uppercase placeholder:text-zinc-600 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
              autoFocus
              id="input-class-join-code"
            />
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Demo Codes */}
          <div className="pt-1">
            <div className="text-[11px] text-zinc-500 mb-2 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Available active class codes:
            </div>
            <div className="flex flex-wrap gap-2">
              {classes.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleQuickFill(c.joinCode)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-[11px] font-mono text-zinc-300 transition-colors"
                >
                  {c.joinCode} ({c.name.slice(0, 10)}...)
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsJoinClassOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
              id="submit-join-class-btn"
            >
              {isSubmitting ? (
                'Validating...'
              ) : (
                <>
                  <span>Join Class</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
