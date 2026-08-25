import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Code2,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    selectedRoleForAuth,
    setSelectedRoleForAuth,
    loginUser,
    registerUser,
    users,
    switchUser
  } = useAuth();

  const { setActiveTab } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [schoolOrOrg, setSchoolOrOrg] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleRoleSelect = (role: UserRole, targetMode: 'login' | 'signup') => {
    setSelectedRoleForAuth(role);
    setAuthModalMode(targetMode);
    setErrorMsg(null);
    setSuccessMsg(null);

    const defaultUser = users.find((u) => u.role === role);
    if (defaultUser && targetMode === 'login') {
      setEmail(defaultUser.email);
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    if (authModalMode === 'login') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address');
        setIsLoading(false);
        return;
      }

      const result = await loginUser(email.trim(), password);
      if (!result.success || !result.user) {
        setErrorMsg(result.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(`Welcome back, ${result.user.name}!`);
      setTimeout(() => {
        setIsLoading(false);
        handleClose();
        if (result.user?.role === 'TEACHER') {
          setActiveTab('classes');
        } else {
          setActiveTab('student-dashboard');
        }
      }, 500);
    } else if (authModalMode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name');
        setIsLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please provide a valid email address');
        setIsLoading(false);
        return;
      }
      if (!selectedRoleForAuth) {
        setErrorMsg('Please select whether you are joining as a Student or Teacher');
        setIsLoading(false);
        return;
      }

      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password: password || 'password123',
        role: selectedRoleForAuth,
        schoolOrOrg: schoolOrOrg.trim() || undefined
      });

      if (!result.success || !result.user) {
        setErrorMsg(result.message || 'Failed to create account.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(`Account created! Welcome to MashCode, ${result.user.name}.`);
      setTimeout(() => {
        setIsLoading(false);
        handleClose();
        if (result.user?.role === 'TEACHER') {
          setActiveTab('classes');
        } else {
          setActiveTab('student-dashboard');
        }
      }, 500);
    }
  };

  const handleQuickLogin = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      switchUser(userId);
      setSuccessMsg(`Logged in as ${user.name} (${user.role})`);
      setTimeout(() => {
        handleClose();
        if (user.role === 'TEACHER') {
          setActiveTab('classes');
        } else {
          setActiveTab('student-dashboard');
        }
      }, 300);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Top Header bar with glow accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />

        <button
          id="auth-modal-close-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">MashCode</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Role Auth
                </span>
              </div>
              <p className="text-xs text-zinc-400">Collaborative Coding & Classroom Analytics</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 1. ROLE SELECTION SCREEN */}
            {authModalMode === 'role-select' && (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">How do you want to continue?</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Select your designated role to personalize your dashboard and authorization permissions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student Card */}
                  <button
                    id="role-select-student-btn"
                    onClick={() => handleRoleSelect('STUDENT', 'login')}
                    className="group relative p-5 text-left rounded-xl bg-gradient-to-b from-zinc-800/80 to-zinc-900 border border-zinc-700/80 hover:border-emerald-500/60 hover:bg-emerald-950/10 transition-all duration-200 shadow-lg hover:shadow-emerald-500/5 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 mb-2">
                      🎓 Student
                    </span>
                    <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      Join as Student
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Practice DSA, solve problems, submit code, and join class cohorts with join codes.
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Practice. Learn. Level Up.</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Teacher Card */}
                  <button
                    id="role-select-teacher-btn"
                    onClick={() => handleRoleSelect('TEACHER', 'login')}
                    className="group relative p-5 text-left rounded-xl bg-gradient-to-b from-zinc-800/80 to-zinc-900 border border-zinc-700/80 hover:border-indigo-500/60 hover:bg-indigo-950/10 transition-all duration-200 shadow-lg hover:shadow-indigo-500/5 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 mb-2">
                      👨‍🏫 Teacher
                    </span>
                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      Join as Teacher
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Create classrooms, publish assignments, monitor code submissions, and view live analytics.
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>Create. Guide. Track.</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>

                {/* Quick 1-Click Demo Profiles */}
                <div className="pt-4 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Instant 1-Click Test Accounts
                    </span>
                    <span className="text-[11px] text-zinc-400">Pre-seeded with real stats</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {users.slice(0, 6).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleQuickLogin(u.id)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 text-left transition-all group"
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-zinc-600"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-white">
                            {u.name.split(' ')[0]} {u.name.split(' ')[1]?.[0] || ''}.
                          </p>
                          <span
                            className={`text-[10px] font-semibold ${
                              u.role === 'ADMIN'
                                ? 'text-purple-400'
                                : u.role === 'TEACHER'
                                ? 'text-indigo-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {u.role === 'ADMIN' ? '👑 Admin' : u.role}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. LOGIN / SIGNUP FORM */}
            {(authModalMode === 'login' || authModalMode === 'signup') && (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* Role Switcher Pill */}
                <div className="flex items-center justify-between bg-zinc-800/70 p-1.5 rounded-xl border border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoleForAuth('STUDENT');
                      const s = users.find((u) => u.role === 'STUDENT');
                      if (s && authModalMode === 'login') setEmail(s.email);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedRoleForAuth === 'STUDENT'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>🎓 Student Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoleForAuth('TEACHER');
                      const t = users.find((u) => u.role === 'TEACHER');
                      if (t && authModalMode === 'login') setEmail(t.email);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedRoleForAuth === 'TEACHER'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>👨‍🏫 Teacher Mode</span>
                  </button>
                </div>

                {/* Form Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {authModalMode === 'login' ? 'Welcome Back' : 'Create an Account'}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {authModalMode === 'login'
                        ? `Logging in as ${selectedRoleForAuth || 'user'}`
                        : `Signing up as ${selectedRoleForAuth || 'user'}`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAuthModalMode('role-select')}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Change role
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {authModalMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={selectedRoleForAuth === 'TEACHER' ? 'Prof. David Johnson' : 'Samantha Reed'}
                            className="w-full pl-9 pr-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          {selectedRoleForAuth === 'TEACHER' ? 'School / University Department' : 'University / College'}
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            value={schoolOrOrg}
                            onChange={(e) => setSchoolOrOrg(e.target.value)}
                            placeholder="e.g. Stanford University / Tech Institute"
                            className="w-full pl-9 pr-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@institution.edu"
                        className="w-full pl-9 pr-3 py-2 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-zinc-300">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-700/40 text-[11px] text-zinc-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Strict Role-Based Access Control active. Your role governs classroom and assignment permissions.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    id="auth-submit-btn"
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 text-white transition-all shadow-lg cursor-pointer ${
                      selectedRoleForAuth === 'TEACHER'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-900/40'
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-900/40'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {authModalMode === 'login'
                            ? `Log In as ${selectedRoleForAuth === 'TEACHER' ? 'Teacher' : 'Student'}`
                            : `Join as ${selectedRoleForAuth === 'TEACHER' ? 'Teacher' : 'Student'}`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Switch Mode Footer */}
                <div className="pt-3 border-t border-zinc-800 text-center">
                  {authModalMode === 'login' ? (
                    <p className="text-xs text-zinc-400">
                      Don&apos;t have an account yet?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('signup');
                          setErrorMsg(null);
                        }}
                        className="text-amber-400 font-medium hover:underline ml-1"
                      >
                        Sign up now
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('login');
                          setErrorMsg(null);
                        }}
                        className="text-amber-400 font-medium hover:underline ml-1"
                      >
                        Log in here
                      </button>
                    </p>
                  )}
                </div>

                {/* Quick Accounts selector */}
                <div className="pt-2">
                  <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Or select pre-configured {selectedRoleForAuth?.toLowerCase()} profile:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {users
                      .filter((u) => u.role === selectedRoleForAuth)
                      .slice(0, 2)
                      .map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setEmail(u.email);
                            setPassword('password123');
                          }}
                          className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 text-left text-xs text-zinc-300 transition-colors"
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="truncate">{u.name}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
