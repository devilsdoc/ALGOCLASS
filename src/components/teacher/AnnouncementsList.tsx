import React, { useState } from 'react';
import { Announcement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Megaphone,
  Pin,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface AnnouncementsListProps {
  classId?: string;
  className?: string;
  showClassBadge?: boolean;
}

export const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  classId,
  className,
  showClassBadge = false
}) => {
  const { currentUser, isTeacher } = useAuth();
  const {
    announcements,
    openCreateAnnouncement,
    openEditAnnouncement,
    deleteAnnouncementRecord
  } = useApp();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter announcements
  const filteredAnnouncements = classId
    ? announcements.filter((a) => a.classId === classId)
    : isTeacher
    ? announcements.filter((a) => a.teacherId === currentUser.id)
    : announcements;

  // Sort: pinned first, then newest
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleDelete = (id: string) => {
    deleteAnnouncementRecord(id);
    setDeleteConfirmId(null);
    setActiveMenuId(null);
  };

  const formatAnnouncementDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-400" />
            <span>Class Announcements ({sortedAnnouncements.length})</span>
          </h3>
          <p className="text-xs text-zinc-400">
            {isTeacher
              ? 'Keep your students informed about homework, problem topics, and announcements'
              : 'Important updates and deadlines posted by your instructor'}
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => openCreateAnnouncement(classId)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            id="create-announcement-header-btn"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      {sortedAnnouncements.length === 0 ? (
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No announcements published yet</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              {isTeacher
                ? 'Broadcast problem sets, roadmap updates, and homework notices to all students in this class.'
                : 'Your instructor has not posted any announcements for this class yet.'}
            </p>
          </div>
          {isTeacher && (
            <button
              onClick={() => openCreateAnnouncement(classId)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              id="empty-state-create-announcement-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Announcement</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAnnouncements.map((ann) => {
            const canManage = isTeacher && ann.teacherId === currentUser.id;
            const isDeleting = deleteConfirmId === ann.id;

            return (
              <div
                key={ann.id}
                className={`p-5 rounded-3xl transition-all border ${
                  ann.pinned
                    ? 'bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
                id={`announcement-card-${ann.id}`}
              >
                {/* Top Row: Author, Class, Pin & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={ann.teacherAvatar}
                      alt={ann.teacherName}
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{ann.teacherName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
                          Instructor
                        </span>
                        {showClassBadge && ann.className && (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700">
                            {ann.className}
                          </span>
                        )}
                        {ann.pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            <Pin className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>{formatAnnouncementDate(ann.createdAt)}</span>
                        {ann.updatedAt && (
                          <span className="text-zinc-500 italic">(edited)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Teacher actions menu */}
                  {canManage && (
                    <div className="relative">
                      {isDeleting ? (
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-rose-500/30">
                          <span className="text-[10px] text-rose-300 px-2 font-medium">Delete?</span>
                          <button
                            onClick={() => handleDelete(ann.id)}
                            className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition-colors"
                            id={`confirm-delete-ann-${ann.id}`}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition-colors"
                            id={`cancel-delete-ann-${ann.id}`}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditAnnouncement(ann)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Edit announcement"
                            id={`edit-ann-${ann.id}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(ann.id)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete announcement"
                            id={`delete-ann-${ann.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Announcement Title & Message */}
                <div className="mt-3.5 space-y-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    {ann.title}
                  </h4>
                  <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/60 font-normal">
                    {ann.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
