import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { getDefaultAvatar } from '../../utils/avatar';
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
  Lock,
  LogOut,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Trash2
} from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const { currentUser, updateCurrentUser, isTeacher, isAdmin, isOwner, switchUser, users, logout } = useAuth();
  const { showToast, refreshAllData, setIsExportModalOpen } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [school, setSchool] = useState(currentUser.schoolOrOrg || 'Stanford CS Department');
  const [isUploading, setIsUploading] = useState(false);

  const adminAccount = users.find((u) => u.role === 'ADMIN' || u.id === 'admin-1');

  const defaultAvatarUri = getDefaultAvatar(currentUser.name);
  const isUsingDefaultAvatar = currentUser.avatar.startsWith('data:image/svg+xml') || currentUser.avatar === defaultAvatarUri;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      email,
      schoolOrOrg: school
    });
    showToast('Profile Updated! 👤', 'Your profile details were saved successfully.', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Please select an image smaller than 5MB.', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateCurrentUser({ avatar: result });
        showToast('Photo Updated! 📸', 'Your custom profile photo has been applied.', 'success');
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      showToast('Upload Failed', 'Could not process the selected image.', 'error');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = () => {
    const defaultAvatar = getDefaultAvatar(name || currentUser.name);
    updateCurrentUser({ avatar: defaultAvatar });
    showToast('Default Avatar Restored 🔄', 'Your profile photo was reset to the default avatar.', 'info');
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
          Manage your account credentials, profile photo, role configurations, and persistent workspace storage
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-zinc-800">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-indigo-500/40 shadow-2xl bg-zinc-950"
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
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                {isUsingDefaultAvatar ? 'Default Avatar' : 'Custom Photo'}
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

        {/* Profile Photo Section (Custom Upload or Keep Default) */}
        <div className="space-y-3 p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Profile Photo
              </label>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload your own custom photo from your device, or keep the default initials avatar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="profile-photo-file-input"
              />

              <button
                type="button"
                id="btn-upload-profile-photo"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload Your Photo'}</span>
              </button>

              {!isUsingDefaultAvatar && (
                <button
                  type="button"
                  id="btn-reset-default-avatar"
                  onClick={handleResetToDefault}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Reset to default initials avatar"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
              )}
            </div>
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

          {(isAdmin || isOwner) ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Platform Administrator ({currentUser.name})
            </span>
          ) : (
            <span className="text-zinc-500 text-[11px]">
              Platform Admin: Nagare Manish
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
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Account Session & Logout Card */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <LogOut className="w-4 h-4 text-rose-400" />
            Account Session & Sign Out
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            End your current active session and return to the login portal.
          </p>
        </div>

        <button
          onClick={logout}
          id="btn-profile-logout"
          className="px-5 py-2.5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/20 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Session</span>
        </button>
      </div>
    </div>
  );
};
