import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  FileSpreadsheet,
  Download,
  Database,
  Search,
  CheckCircle2,
  Code2,
  Activity,
  History,
  Clock,
  Sparkles,
  Flame,
  Calendar,
  Briefcase,
  Layers,
  ArrowUpDown,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { LoginHistoryRecord, UserRole } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { currentUser, users, isOwner, refreshUserData, deleteUser, purgeDummyUsers, isSyncing, lastSyncedAt } = useAuth();
  const {
    classes,
    members,
    assignments,
    submissions,
    problems,
    setIsExportModalOpen,
    refreshAllData,
    showToast
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'directory' | 'login-history'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('ALL');
  const [isPurging, setIsPurging] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Automatically refresh latest database records whenever Admin Dashboard mounts
  React.useEffect(() => {
    refreshUserData();
    refreshAllData();
  }, [refreshUserData, refreshAllData]);

  const handlePurgeDummyUsers = async () => {
    if (!window.confirm('Are you sure you want to remove all dummy users? Only the primary administrator will be retained.')) {
      return;
    }
    setIsPurging(true);
    try {
      await purgeDummyUsers();
      await refreshAllData();
      showToast('Dummy Users Purged', 'All test and dummy user accounts have been successfully removed.', 'success');
    } catch (err: any) {
      showToast('Purge Failed', err?.message || 'Failed to purge dummy users.', 'error');
    } finally {
      setIsPurging(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingUserId(userId);
    try {
      await deleteUser(userId);
      await refreshAllData();
      showToast('User Removed', `Account for "${userName}" has been deleted.`, 'success');
    } catch (err: any) {
      showToast('Deletion Failed', err?.message || 'Failed to delete user.', 'error');
    } finally {
      setDeletingUserId(null);
    }
  };

  // Load real login history from storage
  const loginHistory: LoginHistoryRecord[] = useMemo(() => {
    try {
      if (currentUser && (currentUser.role === 'ADMIN' || currentUser.isAdmin || currentUser.isOwner)) {
        return storage.getLoginHistory(currentUser);
      }
      return [];
    } catch {
      return [];
    }
  }, [currentUser, users]);

  // KPI Calculations
  const totalUsersCount = users.length;
  const studentsCount = users.filter((u) => u.role === 'STUDENT').length;
  const teachersCount = users.filter((u) => u.role === 'TEACHER').length;
  const adminsCount = users.filter((u) => u.role === 'ADMIN' || u.isAdmin).length;

  const totalClassesCount = classes.length;
  const totalAssignmentsCount = assignments.length;
  const totalSubmissionsCount = submissions.length;
  const acceptedSubmissionsCount = submissions.filter((s) => s.status === 'Accepted').length;
  const platformAcceptanceRate =
    totalSubmissionsCount > 0
      ? Math.round((acceptedSubmissionsCount / totalSubmissionsCount) * 100)
      : 0;

  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const medCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

  // Filtered users roster
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesSchool = (u.schoolOrOrg || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesSchool) return false;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Filtered login history
  const filteredLoginHistory = useMemo(() => {
    return loginHistory.filter((rec) => {
      if (roleFilter !== 'ALL' && rec.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.name.toLowerCase().includes(q);
        const matchesEmail = rec.email.toLowerCase().includes(q);
        const matchesUserId = rec.userId.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesUserId) return false;
      }
      return true;
    });
  }, [loginHistory, roleFilter, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-indigo-950/40 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Root System Governance
              </span>
              <span className="text-xs text-zinc-400">• Logged in as {currentUser?.name}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Dashboard &amp; Governance
            </h1>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Real-time user directory, live login history tracking, classroom management, and admin-only multi-sheet Excel data exports.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Live Database Sync Indicator */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-300 shadow-inner">
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-spin' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="font-medium text-zinc-200">{isSyncing ? 'Syncing with Server...' : 'Live Auto-Sync'}</span>
              {lastSyncedAt && !isSyncing && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  ({lastSyncedAt.toLocaleTimeString()})
                </span>
              )}
            </div>

            {users.length > 1 && (
              <button
                id="admin-purge-dummy-users-btn"
                onClick={handlePurgeDummyUsers}
                disabled={isPurging}
                className="px-4 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="Remove all dummy and test users, keeping only the primary administrator"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>{isPurging ? 'Purging...' : 'Purge Dummy Users'}</span>
              </button>
            )}

            <button
              id="admin-export-data-btn"
              onClick={() => setIsExportModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Export User Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Users */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{totalUsersCount}</div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
              <span className="text-emerald-400 font-semibold">{studentsCount} Students</span>
              <span>•</span>
              <span className="text-indigo-400 font-semibold">{teachersCount} Teachers</span>
              <span>•</span>
              <span className="text-purple-400 font-semibold">{adminsCount} Admins</span>
            </div>
          </div>
        </div>

        {/* 2. Login Events */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Login Records</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{loginHistory.length}</div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Real-time audit log of authenticated logins
            </div>
          </div>
        </div>

        {/* 3. Classrooms */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Active Classrooms</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{totalClassesCount}</div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {members.length} enrollments across batches
            </div>
          </div>
        </div>

        {/* 4. Problem Bank */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Problem Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">{problems.length}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="text-emerald-400">{easyCount} Easy</span>
              <span className="text-zinc-600">/</span>
              <span className="text-amber-400">{medCount} Med</span>
              <span className="text-zinc-600">/</span>
              <span className="text-rose-400">{hardCount} Hard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Governance View with Navigation Tabs */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-5">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
            <button
              id="admin-tab-directory"
              onClick={() => setActiveAdminTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'directory'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Directory ({users.length})</span>
            </button>
            <button
              id="admin-tab-login-history"
              onClick={() => setActiveAdminTab('login-history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeAdminTab === 'login-history'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Login History ({loginHistory.length})</span>
            </button>
          </div>

          {/* Search & Role Filter */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800 text-xs">
              {(['ALL', 'STUDENT', 'TEACHER', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    roleFilter === r
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r === 'ALL' ? 'All' : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TAB 1: USER DIRECTORY */}
        {activeAdminTab === 'directory' && (
          <div>
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">User Profile</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">School / Organization</th>
                    <th className="px-4 py-3">Account Created</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                        <Users className="w-8 h-8 mx-auto text-zinc-600 mb-2 opacity-60" />
                        <div className="font-semibold text-zinc-400">No users found</div>
                        <div className="text-[11px] text-zinc-600 mt-0.5">
                          {searchQuery || roleFilter !== 'ALL'
                            ? 'No users match your search and filter criteria.'
                            : 'No users registered yet. New user registrations will appear here automatically.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrent = currentUser?.id === u.id;
                      const isPrimaryAdmin = u.role === 'ADMIN' || u.id === 'admin-1';
                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-zinc-900/40 transition-colors ${
                            isCurrent ? 'bg-purple-950/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                            {u.id}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-8 h-8 rounded-xl object-cover ring-1 ring-zinc-700"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/30 text-purple-300 border border-purple-500/40">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : u.role === 'TEACHER'
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {u.role === 'ADMIN' && <ShieldCheck className="w-3 h-3" />}
                              {u.role === 'TEACHER' && <Briefcase className="w-3 h-3" />}
                              {u.role === 'STUDENT' && <GraduationCap className="w-3 h-3" />}
                              <span>{u.role}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3 text-zinc-300">
                            {u.schoolOrOrg || 'N/A'}
                          </td>

                          <td className="px-4 py-3 text-zinc-400 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>

                          <td className="px-4 py-3 text-zinc-400 text-[11px]">
                            {u.lastLogin
                              ? new Date(u.lastLogin).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'}
                          </td>

                          <td className="px-4 py-3 text-zinc-400 text-[11px]">
                            {new Date(u.lastActive).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {!isPrimaryAdmin ? (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                disabled={deletingUserId === u.id}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                title={`Delete user ${u.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-600 font-medium px-2 py-1">
                                System Protected
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: LOGIN HISTORY (ADMIN-ONLY AUDIT LOG) */}
        {activeAdminTab === 'login-history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">
                Audit trail of successful authentications recorded by the platform authentication system.
              </p>
              <span className="text-xs font-mono text-sky-400 font-semibold">
                {filteredLoginHistory.length} login events recorded
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Record ID</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Login Date</th>
                    <th className="px-4 py-3">Login Time</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredLoginHistory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-zinc-500">
                        <History className="w-8 h-8 mx-auto text-zinc-600 mb-2 opacity-60" />
                        <div className="font-semibold text-zinc-400">No login records found</div>
                        <div className="text-[11px] text-zinc-600 mt-0.5">
                          {searchQuery || roleFilter !== 'ALL'
                            ? 'No login events match your filters.'
                            : 'As users authenticate, their real login sessions will be recorded here in real-time.'}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLoginHistory.map((rec) => (
                      <tr key={rec.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                          {rec.id}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                          {rec.userId}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">
                          {rec.name}
                        </td>
                        <td className="px-4 py-3 text-zinc-300">
                          {rec.email}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                              rec.role === 'ADMIN'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : rec.role === 'TEACHER'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {rec.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-300">
                          {rec.loginDate}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-300">
                          {rec.loginTime}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-[11px]">
                          {new Date(rec.lastLogin).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-[11px]">
                          {new Date(rec.lastActive).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
