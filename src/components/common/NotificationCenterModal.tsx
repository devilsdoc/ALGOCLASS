import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  CheckCheck,
  BookOpen,
  Trophy,
  Sparkles,
  X,
  Clock,
  AlertTriangle,
  Flame,
  Target,
  Megaphone,
  UserCheck,
  Trash2,
  ExternalLink,
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification, NotificationType } from '../../types';

export const NotificationCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const {
    notifications,
    markNotifAsRead,
    markAllNotifsAsRead,
    deleteNotif,
    clearAllReadNotifs,
    openNotificationLink
  } = useApp();
  const { currentUser, isTeacher } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'assignment' | 'announcement' | 'goals'>('all');

  if (!isOpen) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'assignment':
      case 'assignment_complete':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-sky-400" />;
      case 'challenge':
      case 'student_achievement':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'goal':
        return <Target className="w-4 h-4 text-emerald-400" />;
      case 'badge':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'student_joined':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'inactivity':
        return <Clock className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'assignment':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Assignment</span>;
      case 'deadline':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Due Soon</span>;
      case 'overdue':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Overdue</span>;
      case 'announcement':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">Announcement</span>;
      case 'challenge':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Weekly Challenge</span>;
      case 'goal':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Goal</span>;
      case 'badge':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Badge</span>;
      case 'student_joined':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">New Student</span>;
      case 'inactivity':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Inactivity Alert</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">Notification</span>;
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'assignment') return notif.type === 'assignment' || notif.type === 'deadline' || notif.type === 'overdue' || notif.type === 'assignment_complete';
    if (filter === 'announcement') return notif.type === 'announcement';
    if (filter === 'goals') return notif.type === 'goal' || notif.type === 'badge' || notif.type === 'challenge' || notif.type === 'student_achievement';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        id="notification-modal"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Notification Center</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                {isTeacher
                  ? 'Real-time student progress, class updates & inactivity warnings'
                  : 'Live classroom assignments, deadlines, announcements & personal milestones'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800/80 transition-colors"
              aria-label="Close"
              id="btn-close-notif-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Actions */}
        <div className="px-6 py-3 border-b border-zinc-800/60 bg-zinc-900/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              id="filter-notif-all"
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              id="filter-notif-unread"
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('assignment')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === 'assignment'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              id="filter-notif-asgn"
            >
              Assignments
            </button>
            <button
              onClick={() => setFilter('announcement')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === 'announcement'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              id="filter-notif-ann"
            >
              Announcements
            </button>
            <button
              onClick={() => setFilter('goals')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filter === 'goals'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
              id="filter-notif-goals"
            >
              Achievements
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotifsAsRead}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-indigo-500/10 transition-colors"
                id="btn-mark-all-read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            {notifications.some((n) => n.isRead) && (
              <button
                onClick={clearAllReadNotifs}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-800 transition-colors"
                id="btn-clear-read"
              >
                <Trash2 className="w-3 h-3" />
                Clear read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto p-5 space-y-3 flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-500 shadow-inner">
                <Bell className="w-8 h-8 opacity-60" />
              </div>
              <p className="text-base font-bold text-zinc-200">No notifications found</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                {filter === 'unread'
                  ? "You're completely caught up! No unread notifications right now."
                  : 'New assignment releases, challenge announcements, and milestones will automatically appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => openNotificationLink(notif)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  notif.isRead
                    ? 'bg-zinc-900/40 border-zinc-800/60 opacity-80 hover:opacity-100 hover:bg-zinc-900 hover:border-zinc-700'
                    : 'bg-gradient-to-r from-indigo-950/30 via-zinc-900/80 to-zinc-900 border-indigo-500/40 hover:border-indigo-500/70 shadow-lg shadow-indigo-500/5'
                }`}
                id={`notif-item-${notif.id}`}
              >
                <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-bold tracking-tight ${
                          notif.isRead ? 'text-zinc-300' : 'text-white'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {getTypeBadge(notif.type)}
                    </div>

                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 shadow-md shadow-indigo-500/50" />
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{notif.message}</p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/40">
                    <span className="text-[11px] font-medium text-zinc-500">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>

                    <div className="flex items-center gap-2">
                      {notif.link && (
                        <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1 group-hover:underline">
                          View details
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotif(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                        title="Delete notification"
                        id={`btn-delete-notif-${notif.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
            <span>Live notification stream active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
            id="btn-close-notif-footer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
