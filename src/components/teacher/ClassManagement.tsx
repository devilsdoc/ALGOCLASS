import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Plus,
  Copy,
  RefreshCw,
  Trash2,
  Users,
  FileCode2,
  Calendar,
  ExternalLink,
  Check,
  Sparkles,
  Megaphone
} from 'lucide-react';

export const ClassManagement: React.FC = () => {
  const { currentUser, isTeacher } = useAuth();
  const {
    classes,
    members,
    assignments,
    announcements,
    setIsCreateClassOpen,
    setSelectedClassId,
    setActiveTab,
    regenerateCode,
    deleteClassRoom,
    showToast
  } = useApp();

  const myClasses = classes.filter((c) => c.teacherId === currentUser.id);

  const copyToClipboard = (code: string, className: string) => {
    navigator.clipboard.writeText(code);
    showToast('Code Copied! 📋', `Join code for "${className}" copied to clipboard: ${code}`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-indigo-400" />
            Classroom Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Create classes, share join codes with students, and track real-time coding progress
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setIsCreateClassOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            id="btn-create-new-class"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
        )}
      </div>

      {/* Classroom Cards Grid */}
      {myClasses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No classrooms yet</h3>
          <p className="text-xs text-zinc-400 mt-1 mb-4 max-w-sm mx-auto">
            Create your first batch to start assigning coding problems and monitoring student submissions.
          </p>
          <button
            onClick={() => setIsCreateClassOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Create Classroom
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myClasses.map((cls) => {
            const classMembers = members.filter((m) => m.classId === cls.id);
            const classAssignments = assignments.filter((a) => a.classId === cls.id);

            return (
              <div
                key={cls.id}
                className="rounded-3xl bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 overflow-hidden shadow-xl flex flex-col justify-between transition-all hover:scale-[1.01] group"
                id={`class-card-${cls.id}`}
              >
                {/* Header Banner */}
                <div className={`p-5 bg-gradient-to-r ${cls.iconColor} text-white flex items-start justify-between relative`}>
                  <div>
                    <span className="text-3xl mb-1 block">{cls.bannerEmoji}</span>
                    <h3 className="text-lg font-black tracking-tight leading-snug">{cls.name}</h3>
                    <p className="text-xs text-white/80 font-medium">{cls.subject}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                    {cls.academicYear || '2026'}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 flex-1">
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {cls.description}
                  </p>

                  {/* Join Code Box */}
                  <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Class Join Code</span>
                      <span className="font-mono text-sm font-extrabold text-indigo-300 tracking-wider">
                        {cls.joinCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(cls.joinCode, cls.name)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                        title="Copy Join Code"
                        id={`btn-copy-code-${cls.id}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => regenerateCode(cls.id)}
                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                        title="Regenerate Code"
                        id={`btn-regen-code-${cls.id}`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Counts */}
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-800/80 text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{classMembers.length} Students</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <FileCode2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">{classAssignments.length} Asgns</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{announcements.filter((a) => a.classId === cls.id).length} Posts</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-zinc-950/60 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${cls.name}"? All student memberships will be deleted.`)) {
                        deleteClassRoom(cls.id);
                      }
                    }}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Class"
                    id={`btn-delete-class-${cls.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setActiveTab('class-detail');
                    }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5"
                    id={`btn-open-class-${cls.id}`}
                  >
                    <span>View Class Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
