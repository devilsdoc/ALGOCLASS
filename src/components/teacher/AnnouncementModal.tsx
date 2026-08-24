import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  X,
  Pin,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  FileText
} from 'lucide-react';

export const AnnouncementModal: React.FC = () => {
  const { currentUser, isTeacher } = useAuth();
  const {
    isAnnouncementModalOpen,
    setIsAnnouncementModalOpen,
    editingAnnouncement,
    setEditingAnnouncement,
    announcementTargetClassId,
    classes,
    createNewAnnouncement,
    updateAnnouncementRecord
  } = useApp();

  // Filter only teacher's own classes
  const teacherClasses = classes.filter((c) => c.teacherId === currentUser.id);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [pinned, setPinned] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editingAnnouncement) {
      setSelectedClassId(editingAnnouncement.classId);
      setTitle(editingAnnouncement.title);
      setMessage(editingAnnouncement.message);
      setPinned(Boolean(editingAnnouncement.pinned));
    } else {
      setSelectedClassId(
        announcementTargetClassId || (teacherClasses.length > 0 ? teacherClasses[0].id : '')
      );
      setTitle('');
      setMessage('');
      setPinned(false);
    }
    setError(null);
  }, [editingAnnouncement, announcementTargetClassId, isAnnouncementModalOpen, teacherClasses]);

  if (!isAnnouncementModalOpen || !isTeacher) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedClassId) {
      setError('Please select a target classroom.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide an announcement title.');
      return;
    }

    if (!message.trim()) {
      setError('Please provide the announcement message.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAnnouncement) {
        updateAnnouncementRecord(editingAnnouncement.id, {
          title: title.trim(),
          message: message.trim(),
          pinned
        });
      } else {
        createNewAnnouncement({
          classId: selectedClassId,
          title: title.trim(),
          message: message.trim(),
          pinned
        });
      }
      setIsAnnouncementModalOpen(false);
      setEditingAnnouncement(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsAnnouncementModalOpen(false);
    setEditingAnnouncement(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      id="announcement-modal"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {editingAnnouncement ? 'Edit Announcement' : 'New Class Announcement'}
              </h2>
              <p className="text-xs text-zinc-400">
                {editingAnnouncement
                  ? 'Update and sync announcement details'
                  : 'Broadcast updates & deadlines to all enrolled students'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            id="close-announcement-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Class Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Classroom</span>
            </label>
            {teacherClasses.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                You do not have any active classrooms yet. Please create a classroom first.
              </div>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={Boolean(editingAnnouncement)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-60 transition-colors"
                id="announcement-target-class-select"
              >
                {teacherClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.joinCode})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Announcement Title</span>
            </label>
            <input
              type="text"
              placeholder="e.g., 🚀 Week 2 Roadmap: Sliding Window & Hash Sets"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 transition-colors"
              id="announcement-title-input"
              maxLength={100}
            />
          </div>

          {/* Message Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span>Announcement Message</span>
              <span className="text-[10px] text-zinc-500">{message.length}/1000 chars</span>
            </label>
            <textarea
              rows={5}
              placeholder="Write the detailed update, instructions, upcoming problem deadlines, or meeting notes for your class..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600 resize-none transition-colors"
              id="announcement-message-textarea"
              maxLength={1000}
            />
          </div>

          {/* Pin option */}
          <label className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700 focus:ring-0 focus:ring-offset-0"
              id="announcement-pin-checkbox"
            />
            <div className="flex items-center gap-2 text-xs">
              <Pin className={`w-4 h-4 ${pinned ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
              <span className="font-semibold text-white">Pin this announcement to top of class feed</span>
            </div>
          </label>

          {/* Info pill */}
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Posting this announcement will instantly send a notification to all enrolled students.</span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              id="cancel-announcement-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || teacherClasses.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center gap-1.5"
              id="publish-announcement-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingAnnouncement ? 'Save Changes' : 'Publish Announcement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
