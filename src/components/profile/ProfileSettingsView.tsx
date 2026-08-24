import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  User,
  Settings,
  Shield,
  RefreshCw,
  Sparkles,
  Check,
  Flame,
  Award,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  ShieldAlert,
  Users,
  Database,
  Lock
} from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const { currentUser, updateCurrentUser, isTeacher, isAdmin, isOwner, switchUser, users } = useAuth();
  const { showToast, refreshAllData, setIsExportModalOpen } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [school, setSchool] = useState(currentUser.schoolOrOrg || 'Stanford CS Department');

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  ];

  const adminAccount = users.find((u) => u.role === 'ADMIN' || u.id === 'admin-1');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      email,
      schoolOrOrg: school
    });
    showToast('Profile Updated! 👤', 'Your profile details were saved successfully.', 'success');
  };

  const handleSelectAvatar = (url: string) => {
    updateCurrentUser({ avatar: url });
    showToast('Avatar Updated! 📸', 'New profile picture applied.', 'success');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to the clean demo state?')) {
      storage.resetToDefaults();
      refreshAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-400" />
          User Profile & Application Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your account credentials, avatar, role configurations, and persistent workspace storage
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-zinc-800">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-indigo-500/40 shadow-2xl"
            />
            <span className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 text-white rounded-xl shadow">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{currentUser.email}</p>
            <div className="flex items-center gap-3 pt-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                {currentUser.streak} Day Streak
              </span>
              <span>•</span>
              <span>{currentUser.schoolOrOrg || 'Computer Science'}</span>
            </div>
          </div>
        </div>

        {/* Change Avatar Grid */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Select Profile Avatar
          </label>
          <div className="flex flex-wrap gap-3">
            {avatarOptions.map((avatar, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAvatar(avatar)}
                className={`relative rounded-2xl overflow-hidden ring-2 transition-all ${
                  currentUser.avatar === avatar
                    ? 'ring-indigo-500 scale-105 shadow-lg shadow-indigo-500/30'
                    : 'ring-transparent hover:ring-zinc-600 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={avatar} alt="" className="w-12 h-12 object-cover" />
                {currentUser.avatar === avatar && (
                  <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center text-white">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              School, University or Department
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Admin-Only User Data Export Section */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                Administrative User Data Export (.xlsx)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Admin Protected
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Export real database records into a multi-sheet formatted Excel file including All Users, Students, Teachers, Classes, Assignments, and Submissions with auto-filters, bold headers, and column auto-sizing.
            </p>
          </div>

          <button
            id="export-user-data-btn"
            onClick={() => setIsExportModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export User Data</span>
          </button>
        </div>

        {/* Security & Access Notice */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Zero-Secret Compliance: Passwords, password hashes, and sensitive authentication tokens are strictly stripped.
            </span>
          </div>

          {!isAdmin && !isOwner && adminAccount && (
            <button
              onClick={() => {
                switchUser(adminAccount.id);
                showToast('Admin Switched', `Now logged in as ${adminAccount.name}.`, 'info');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <Lock className="w-3.5 h-3.5" />
              Switch to Platform Admin
            </button>
          )}

          {(isAdmin || isOwner) && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Admin Authorized ({currentUser.name})
            </span>
          )}
        </div>
      </div>

      {/* Storage & Demo Reset Card */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Persistent Client-Side Storage & Data Reset
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          All classes, join codes, problem submissions, student metrics, and teacher notifications are continuously persisted to local browser storage. You can restore the pristine seed dataset at any time.
        </p>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-zinc-500">Storage Engine: LocalStorage Active</span>
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
