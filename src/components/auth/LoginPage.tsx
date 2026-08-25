import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Building2,
  AlertCircle,
  Sparkles,
  Upload,
  Camera,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const {
    loginUser,
    registerUser,
    users
  } = useAuth();
  const { setActiveTab, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [schoolOrOrg, setSchoolOrOrg] = useState('');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('login');
    setErrorMsg(null);
    setEmail(role === 'ADMIN' ? 'manishnagare258@gmail.com' : '');
    setPassword('');
    setName('');
    setSchoolOrOrg('');
    setCustomAvatar(null);
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setErrorMsg(null);
    setEmail('');
    setPassword('');
    setName('');
    setSchoolOrOrg('');
    setCustomAvatar(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomAvatar(result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (authMode === 'login') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address');
        setIsLoading(false);
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your password');
        setIsLoading(false);
        return;
      }

      const result = await loginUser(email.trim(), password);
      if (!result.success || !result.user) {
        setErrorMsg(result.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Check role match
      if (selectedRole && result.user.role !== selectedRole && !result.user.isAdmin) {
        setErrorMsg(`This account is registered as a ${result.user.role}, not a ${selectedRole}. Please select the ${result.user.role} portal.`);
        setIsLoading(false);
        return;
      }

      showToast('Authentication Successful', `Welcome back, ${result.user.name}!`, 'success');
      setActiveTab('dashboard');
      setIsLoading(false);
    } else {
      // Sign up mode
      if (!name.trim()) {
        setErrorMsg('Please enter your full name');
        setIsLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      if (!password || password.length < 4) {
        setErrorMsg('Password must be at least 4 characters long');
        setIsLoading(false);
        return;
      }
      if (!selectedRole) {
        setErrorMsg('Please choose a role');
        setIsLoading(false);
        return;
      }

      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: selectedRole,
        schoolOrOrg: schoolOrOrg.trim() || undefined,
        avatar: customAvatar || undefined
      });

      if (!result.success || !result.user) {
        setErrorMsg(result.message || 'Failed to create account.');
        setIsLoading(false);
        return;
      }

      showToast('Account Created', `Welcome to MashCode, ${result.user.name}!`, 'success');
      setActiveTab('dashboard');
      setIsLoading(false);
    }
  };

  const usersInRole = selectedRole ? users.filter((u) => u.role === selectedRole) : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white font-sans antialiased relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header / Branding */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              <span>MashCode</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                LMS
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">LeetCode &amp; Classroom Management Platform</p>
          </div>
        </div>
      </header>

      {/* Main Authentication Flow Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              /* SCREEN 1: 3 ROLE OPTIONS (STUDENT, TEACHER, ADMIN) */
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className="space-y-8 text-center"
              >
                <div className="space-y-3 max-w-xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Select Authentication Portal</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Welcome to MashCode
                  </h1>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Please select your role to proceed to your dedicated authentication portal.
                  </p>
                </div>

                {/* 3 Role Portal Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                  {/* 1. STUDENT */}
                  <div
                    id="portal-select-student"
                    onClick={() => handleSelectRole('STUDENT')}
                    className="group relative p-6 rounded-3xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                            Student
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Learning
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                          Solve algorithmic problems, join classrooms with join codes, submit code assignments, and track mastery.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                      <span>Enter Student Portal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* 2. TEACHER */}
                  <div
                    id="portal-select-teacher"
                    onClick={() => handleSelectRole('TEACHER')}
                    className="group relative p-6 rounded-3xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                            Teacher
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Instruction
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                          Create and manage coding classrooms, curate problem sets, assign homework with deadlines, and inspect student code.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                      <span>Enter Teacher Portal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* 3. ADMIN */}
                  <div
                    id="portal-select-admin"
                    onClick={() => handleSelectRole('ADMIN')}
                    className="group relative p-6 rounded-3xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                            Admin
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Governance
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                          Monitor system operations, view real-time login history, oversee user roster, and perform multi-sheet Excel data exports.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                      <span>Enter Admin Portal</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* SCREEN 2: ROLE-SPECIFIC LOGIN & REGISTRATION FORM */
              <motion.div
                key="role-auth-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-w-md mx-auto"
              >
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
                  {/* Top Bar with Back Button */}
                  <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
                    <button
                      onClick={handleBackToRoles}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Role</span>
                    </button>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                        selectedRole === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : selectedRole === 'TEACHER'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {selectedRole === 'ADMIN' && <ShieldCheck className="w-3 h-3" />}
                      {selectedRole === 'TEACHER' && <Users className="w-3 h-3" />}
                      {selectedRole === 'STUDENT' && <GraduationCap className="w-3 h-3" />}
                      <span>{selectedRole} Portal</span>
                    </span>
                  </div>

                  {/* Auth Mode Toggle: Sign In vs Create Account (Disabled for Admin - Single Admin System) */}
                  <div className="p-6 pb-0">
                    {selectedRole === 'ADMIN' ? (
                      <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-white">Designated Platform Administrator</p>
                            <p className="text-[11px] text-purple-300">Nagare Manish &bull; Single Admin Access</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Secure Login
                        </span>
                      </div>
                    ) : (
                      <div className="flex p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setErrorMsg(null);
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            authMode === 'login'
                              ? 'bg-zinc-800 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('signup');
                            setErrorMsg(null);
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            authMode === 'signup'
                              ? 'bg-zinc-800 text-white shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Create Account
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notice if database has 0 users for this role */}
                  {selectedRole !== 'ADMIN' && authMode === 'login' && usersInRole.length === 0 && (
                    <div className="mx-6 mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                      <div>
                        <span className="font-semibold text-white">First time here?</span>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          No {selectedRole.toLowerCase()} accounts registered yet.{' '}
                          <button
                            type="button"
                            onClick={() => setAuthMode('signup')}
                            className="text-indigo-400 underline font-semibold cursor-pointer"
                          >
                            Create your account
                          </button>{' '}
                          to register your profile.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {authMode === 'signup' && (
                      <>
                        {/* Profile Photo Selection (Custom or Default) */}
                        <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                          <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-indigo-400" />
                              Profile Photo (Optional)
                            </span>
                            <span className="text-[10px] text-zinc-500 font-normal">
                              Defaults to initial avatar
                            </span>
                          </label>

                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0 relative">
                              {customAvatar ? (
                                <img
                                  src={customAvatar}
                                  alt="Custom Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                  {name.trim() ? (name.trim()[0].toUpperCase()) : '?'}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                                className="hidden"
                                id="signup-photo-input"
                              />

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Upload className="w-3 h-3 text-indigo-400" />
                                  <span>{customAvatar ? 'Change Photo' : 'Select Photo'}</span>
                                </button>

                                {customAvatar && (
                                  <button
                                    type="button"
                                    onClick={() => setCustomAvatar(null)}
                                    className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-700 transition-colors cursor-pointer"
                                    title="Remove custom photo and use default"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500">
                                {customAvatar ? 'Custom photo selected' : 'No photo chosen (default initials avatar will be used)'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Alex Mitchell"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@institution.edu"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                          School / Organization (Optional)
                        </label>
                        <input
                          type="text"
                          value={schoolOrOrg}
                          onChange={(e) => setSchoolOrOrg(e.target.value)}
                          placeholder="e.g. Stanford University / Tech Institute"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 rounded-2xl text-xs font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 ${
                        selectedRole === 'ADMIN'
                          ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                          : selectedRole === 'TEACHER'
                          ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>{authMode === 'login' ? `Sign In as ${selectedRole}` : `Create ${selectedRole} Account`}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-zinc-500 border-t border-zinc-900 z-10">
        <span>MashCode LMS &copy; {new Date().getFullYear()} • Secure Role-Based Authentication &amp; Algorithmic Learning</span>
      </footer>
    </div>
  );
};
