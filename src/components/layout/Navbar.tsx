import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Code2,
  Bell,
  Sparkles,
  Plus,
  ChevronDown,
  BookOpen,
  Search,
  Zap,
  Flame,
  User,
  LogOut,
  CheckCircle2,
  Settings,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import { NotificationCenterModal } from '../common/NotificationCenterModal';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isTeacher,
    isAdmin,
    isOwner,
    logout
  } = useAuth();

  const {
    unreadNotifsCount,
    setIsJoinClassOpen,
    setIsCreateClassOpen,
    setIsAiAssistantOpen,
    setIsExportModalOpen,
    setActiveTab,
    problems,
    classes,
    navigateToSolve,
    setSelectedClassId
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const filteredProblems = searchQuery.trim()
    ? problems.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const filteredClasses = searchQuery.trim()
    ? classes.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.joinCode.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo & Brand */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveTab(isTeacher ? 'dashboard' : 'problems')}
            className="flex items-center gap-2.5 cursor-pointer group"
            id="brand-logo"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">Mash<span className="text-indigo-400">Code</span></span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  isAdmin || isOwner
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : isTeacher
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isAdmin || isOwner ? '👑 Platform Admin' : isTeacher ? '👨‍🏫 Teacher Space' : '🎓 Student Hub'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search problems, algorithms, or classrooms..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-white placeholder-zinc-500 outline-none transition-all"
              id="global-search-input"
            />
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto space-y-2">
              {filteredProblems.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 py-1">Problems</div>
                  {filteredProblems.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        navigateToSolve(p.id);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-xs text-zinc-200"
                    >
                      <span className="font-medium">{p.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          p.difficulty === 'Easy'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : p.difficulty === 'Medium'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {filteredClasses.length > 0 && (
                <div className="pt-2 border-t border-zinc-800">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 py-1">Classrooms</div>
                  {filteredClasses.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedClassId(c.id);
                        setActiveTab(isTeacher ? 'class-detail' : 'classes');
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-xs text-zinc-200"
                    >
                      <div className="flex items-center gap-2">
                        <span>{c.bannerEmoji}</span>
                        <span className="font-medium">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{c.joinCode}</span>
                    </div>
                  ))}
                </div>
              )}

              {filteredProblems.length === 0 && filteredClasses.length === 0 && (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No matching problems or classes found for &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          {/* Quick CTA button */}
          {isTeacher ? (
            <button
              onClick={() => setIsCreateClassOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
              id="btn-create-class-nav"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Class
            </button>
          ) : (
            <button
              onClick={() => setIsJoinClassOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer"
              id="btn-join-class-nav"
            >
              <Zap className="w-3.5 h-3.5" />
              Join Class
            </button>
          )}

          {/* AI Helper CTA */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="AI Code Assistant & Hints"
            id="btn-ai-assistant-nav"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">AI Tutor</span>
          </button>

          {/* Notification Center Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Notifications"
            id="btn-notifications-toggle"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-zinc-950 animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 transition-all cursor-pointer"
              id="user-profile-menu-toggle"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-zinc-700"
              />
              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white leading-tight">{currentUser.name}</span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                      isTeacher
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>{currentUser.streak}d streak</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {/* Profile Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50" id="user-profile-dropdown">
                <div className="pb-3 border-b border-zinc-800/80">
                  <div className="flex items-start gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-zinc-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-white truncate">{currentUser.name}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isTeacher
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {currentUser.role}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 truncate mt-0.5">{currentUser.email}</div>
                      {currentUser.schoolOrOrg && (
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5">{currentUser.schoolOrOrg}</div>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-zinc-800/60">
                    <div className="bg-zinc-950/60 rounded-lg p-2 text-center border border-zinc-800/50">
                      <div className="text-[10px] text-zinc-400 font-medium">Problems Solved</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">{currentUser.solvedCount?.total || 0}</div>
                    </div>
                    <div className="bg-zinc-950/60 rounded-lg p-2 text-center border border-zinc-800/50">
                      <div className="text-[10px] text-zinc-400 font-medium">Daily Streak</div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>{currentUser.streak} days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsExportModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    id="btn-nav-export-user-data"
                    className="w-full text-left px-3 py-2 text-xs text-indigo-300 hover:text-white hover:bg-indigo-900/30 rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Export User Data (.xlsx)</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsUserMenuOpen(false);
                    }}
                    id="btn-nav-settings"
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Settings & Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    id="btn-logout-nav"
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Modal */}
      <NotificationCenterModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
