import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileCode2,
  LineChart,
  Trophy,
  Flame,
  PlusCircle,
  Zap,
  Sparkles,
  Settings,
  BookOpen,
  Code
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, isTeacher } = useAuth();
  const {
    activeTab,
    setActiveTab,
    setIsJoinClassOpen,
    setIsCreateClassOpen,
    unreadNotifsCount,
    classes,
    members,
    assignments
  } = useApp();

  // Compute badges
  const myClassesCount = isTeacher
    ? classes.filter((c) => c.teacherId === currentUser.id).length
    : members.filter((m) => m.studentId === currentUser.id).length;

  const myAssignmentsCount = isTeacher
    ? assignments.filter((a) => a.teacherId === currentUser.id).length
    : assignments.length;

  // Teacher navigation items
  const teacherNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'Classes', icon: GraduationCap, badge: myClassesCount },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileCode2, badge: myAssignmentsCount },
    { id: 'problems', label: 'Problem Bank', icon: Code },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Student navigation items
  const studentNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }[] = [
    { id: 'problems', label: 'Problems', icon: Code },
    { id: 'classes', label: 'My Classes', icon: GraduationCap, badge: myClassesCount },
    { id: 'assignments', label: 'Assignments', icon: FileCode2, badge: myAssignmentsCount },
    { id: 'progress', label: 'My Progress', icon: LineChart },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'settings', label: 'Profile & Stats', icon: Settings }
  ];

  const items = isTeacher ? teacherNavItems : studentNavItems;

  return (
    <aside className="w-64 shrink-0 bg-zinc-950/60 border-r border-zinc-800/80 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* User Mini Profile Card */}
        <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-zinc-400 truncate">{currentUser.title || currentUser.role}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                {currentUser.streak}d streak
              </span>
              <span className="text-[10px] text-zinc-600">•</span>
              <span className="text-[10px] text-indigo-400 font-medium">{currentUser.solvedCount?.total || 0} solved</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            {isTeacher ? 'Teacher Portal' : 'Student Hub'}
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'classes' && activeTab === 'class-detail') ||
              (item.id === 'problems' && activeTab === 'problem-solve');

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
                id={`nav-item-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && Number(item.badge) > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action CTA Card */}
      <div className="pt-4 space-y-3">
        {isTeacher ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-500/20 text-center">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold text-white">Create New Batch</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 mb-2.5">Generate join codes and track submissions</p>
            <button
              onClick={() => setIsCreateClassOpen(true)}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-colors"
              id="sidebar-create-class-btn"
            >
              + New Classroom
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-blue-900/20 border border-indigo-500/20 text-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-semibold text-white">Join Teacher's Class</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 mb-2.5">Got a code from your professor?</p>
            <button
              onClick={() => setIsJoinClassOpen(true)}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              id="sidebar-join-class-btn"
            >
              Enter Join Code
            </button>
          </div>
        )}

        <div className="text-[10px] text-zinc-600 text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>CodeClass Real-Time Sync v2.4</span>
        </div>
      </div>
    </aside>
  );
};
