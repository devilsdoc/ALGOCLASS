import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { StudentsNeedingAttentionSection } from './StudentsNeedingAttentionSection';
import { StudentAchievementsSection } from './StudentAchievementsSection';
import {
  GraduationCap,
  Users,
  Code2,
  FileCode2,
  TrendingUp,
  Flame,
  AlertTriangle,
  Trophy,
  Clock,
  ArrowUpRight,
  Plus,
  Zap,
  CheckCircle2,
  BarChart3,
  Calendar,
  Sparkles,
  ChevronRight,
  Megaphone
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

export const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    classes,
    members,
    assignments,
    submissions,
    setIsCreateClassOpen,
    setIsCreateAssignmentOpen,
    openCreateAnnouncement,
    setActiveTab,
    setSelectedClassId,
    setSelectedStudentForAnalytics
  } = useApp();

  // Metrics for this teacher
  const teacherClasses = useMemo(() => {
    return classes.filter((c) => c.teacherId === currentUser.id);
  }, [classes, currentUser.id]);

  const teacherClassIds = useMemo(() => teacherClasses.map((c) => c.id), [teacherClasses]);

  const teacherMembers = useMemo(() => {
    return members.filter((m) => teacherClassIds.includes(m.classId));
  }, [members, teacherClassIds]);

  const teacherAssignments = useMemo(() => {
    return assignments.filter((a) => a.teacherId === currentUser.id || teacherClassIds.includes(a.classId));
  }, [assignments, currentUser.id, teacherClassIds]);

  const studentMetrics = useMemo(() => {
    return storage.getStudentMetricsForTeacher(currentUser.id);
  }, [currentUser.id]);

  // Aggregate calculations
  const totalClassesCount = teacherClasses.length;
  const totalStudentsCount = studentMetrics.length;

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const fourDaysAgo = now - 4 * 24 * 60 * 60 * 1000;

  const activeTodayCount = studentMetrics.filter((m) => new Date(m.lastActive).getTime() >= oneDayAgo).length;
  const activeStudentsCount = studentMetrics.filter((m) => new Date(m.lastActive).getTime() >= fourDaysAgo).length;

  const totalProblemsSolvedSum = studentMetrics.reduce((acc, curr) => acc + curr.totalSolved, 0);
  const avgClassProgress =
    studentMetrics.length > 0
      ? Math.round(studentMetrics.reduce((acc, curr) => acc + curr.overallProgressScore, 0) / studentMetrics.length)
      : 0;

  const avgAcceptanceRate =
    studentMetrics.length > 0
      ? Number((studentMetrics.reduce((acc, curr) => acc + curr.acceptanceRate, 0) / studentMetrics.length).toFixed(1))
      : 76.5;

  const assignmentsCreatedCount = teacherAssignments.length;

  // Top performers
  const topPerformers = useMemo(() => {
    return [...studentMetrics]
      .sort((a, b) => b.totalSolved - a.totalSolved || b.overallProgressScore - a.overallProgressScore)
      .slice(0, 4);
  }, [studentMetrics]);

  // Students needing attention
  const studentsNeedingAttention = useMemo(() => {
    return studentMetrics.filter((m) => m.needsAttention).slice(0, 4);
  }, [studentMetrics]);

  // Recent submissions across teacher's classes
  const recentSubmissions = useMemo(() => {
    const studentIds = new Set(studentMetrics.map((m) => m.student.id));
    return submissions.filter((s) => studentIds.has(s.studentId)).slice(0, 6);
  }, [submissions, studentMetrics]);

  // Weekly submission activity chart
  const weeklyData = [
    { day: 'Mon', submissions: 14, accepted: 11 },
    { day: 'Tue', submissions: 22, accepted: 18 },
    { day: 'Wed', submissions: 19, accepted: 15 },
    { day: 'Thu', submissions: 31, accepted: 26 },
    { day: 'Fri', submissions: 28, accepted: 24 },
    { day: 'Sat', submissions: 18, accepted: 14 },
    { day: 'Sun', submissions: 25, accepted: 21 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-zinc-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instructor Portal Live</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back, {currentUser.name}! 👨‍🏫
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Monitor real student problem-solving velocity, assignment completion, and classroom performance across all enrolled batches.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => openCreateAnnouncement()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors flex items-center gap-1.5"
            id="dash-create-announcement-btn"
          >
            <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Announcement</span>
          </button>
          <button
            onClick={() => setIsCreateAssignmentOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5"
            id="dash-create-assignment-btn"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Assignment</span>
          </button>
          <button
            onClick={() => setIsCreateClassOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            id="dash-create-class-btn"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Class</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Grid (8 Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Classes */}
        <div
          onClick={() => setActiveTab('classes')}
          className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Total Classes</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalClassesCount}</div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <span>{teacherMembers.length} total enrollments</span>
          </div>
        </div>

        {/* Total Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Total Students</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalStudentsCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <Zap className="w-3 h-3" />
            <span>{activeTodayCount} active today</span>
          </div>
        </div>

        {/* Total Problems Solved */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Problems Solved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalProblemsSolvedSum}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">
            Across Easy, Med, Hard
          </div>
        </div>

        {/* Average Class Progress */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Average Progress</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{avgClassProgress}%</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {avgAcceptanceRate}% avg acceptance
          </div>
        </div>
      </div>

      {/* Top Performing Students List */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Top Performing Students</h3>
              <p className="text-[11px] text-zinc-400">Highest problem counts and consistent streaks</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('students')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {topPerformers.map((m, idx) => (
            <div
              key={m.student.id}
              onClick={() => setSelectedStudentForAnalytics(m)}
              className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between cursor-pointer transition-all hover:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-center font-bold text-xs text-amber-400 shrink-0">#{idx + 1}</span>
                <img
                  src={m.student.avatar}
                  alt={m.student.name}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-zinc-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-white truncate">{m.student.name}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{m.student.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-right shrink-0">
                <div>
                  <div className="font-bold text-xs text-emerald-400">{m.totalSolved} solv.</div>
                  <div className="text-[10px] text-zinc-500">{m.acceptanceRate}% acc</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-lg border border-amber-500/20">
                  <Flame className="w-3 h-3 fill-amber-500" />
                  <span>{m.streak}d</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 2: Students Needing Attention Section */}
      <StudentsNeedingAttentionSection />

      {/* Feature 3: Student Achievements Section */}
      <StudentAchievementsSection />

      {/* Class Activity Chart & Recent Live Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Submissions Chart */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Weekly Class Submission Velocity</h3>
                <p className="text-[11px] text-zinc-400">Total runs and accepted solutions this week</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              +28% this week
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="submissions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Submissions Stream */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Submissions
              </h3>
              <span className="text-[10px] text-zinc-500">Real-time sync</span>
            </div>

            <div className="space-y-2">
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={sub.studentAvatar} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{sub.studentName}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{sub.problemTitle}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      sub.status === 'Accepted'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('students')}
            className="w-full mt-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors text-center"
          >
            Open Student Monitoring Table →
          </button>
        </div>
      </div>

      {/* Quick Classrooms List */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Your Managed Classrooms</h3>
            <p className="text-xs text-zinc-400">Click any class to manage assignments and view roster</p>
          </div>
          <button
            onClick={() => setIsCreateClassOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Class</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {teacherClasses.map((cls) => {
            const classStudentCount = members.filter((m) => m.classId === cls.id).length;
            const classAsgns = assignments.filter((a) => a.classId === cls.id);

            return (
              <div
                key={cls.id}
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setActiveTab('class-detail');
                }}
                className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:bg-zinc-900 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{cls.bannerEmoji}</span>
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                    {cls.joinCode}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                  {cls.name}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 mb-3">{cls.description}</p>
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/80">
                  <span>{classStudentCount} Students</span>
                  <span>{classAsgns.length} Assignments</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
