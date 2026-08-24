import React, { useState, useMemo } from 'react';
import { storage } from '../../services/storage';
import { AnalyticsTimeframe, ClassAnalyticsSummary } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trophy,
  Flame,
  Award,
  Calendar,
  PieChart as PieChartIcon,
  Sparkles,
  Zap,
  BookOpen,
  ArrowUpRight,
  Filter,
  BarChart3,
  Activity,
  Layers,
  Search
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';

interface ClassAnalyticsTabProps {
  teacherId: string;
  classId?: string;
  className?: string;
  showClassSelector?: boolean;
}

export const ClassAnalyticsTab: React.FC<ClassAnalyticsTabProps> = ({
  teacherId,
  classId: propClassId,
  className: propClassName,
  showClassSelector = false
}) => {
  const { setSelectedStudentForAnalytics, setActiveTab, classes } = useApp();
  const [selectedClassId, setSelectedClassId] = useState<string>(propClassId || 'ALL');
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('7d');
  const [activeMetricTab, setActiveMetricTab] = useState<'submissions' | 'activeStudents'>('submissions');
  const [insightFilter, setInsightFilter] = useState<'all' | 'warning' | 'positive' | 'high'>('all');

  const teacherClasses = useMemo(() => {
    return classes.filter((c) => c.teacherId === teacherId);
  }, [classes, teacherId]);

  const activeClassId = propClassId || (selectedClassId === 'ALL' ? undefined : selectedClassId);

  const activeClassName = useMemo(() => {
    if (propClassName) return propClassName;
    if (selectedClassId === 'ALL') return 'All Classes';
    const found = teacherClasses.find((c) => c.id === selectedClassId);
    return found ? found.name : 'Class';
  }, [propClassName, selectedClassId, teacherClasses]);

  const analytics: ClassAnalyticsSummary = useMemo(() => {
    return storage.getClassAnalytics(teacherId, activeClassId, timeframe);
  }, [teacherId, activeClassId, timeframe]);

  const filteredInsights = useMemo(() => {
    if (insightFilter === 'all') return analytics.insights;
    return analytics.insights.filter((ins) => ins.severity === insightFilter);
  }, [analytics.insights, insightFilter]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'activity_surge':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'activity_drop':
        return <TrendingDown className="w-4 h-4 text-amber-400" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-rose-400" />;
      case 'weak_topic_improved':
        return <Award className="w-4 h-4 text-purple-400" />;
      case 'milestone_reached':
        return <Trophy className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Top Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <LineChart className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{activeClassName} Analytics</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Real-time Data
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Detailed trends, activity distributions, coursework completion, and automated student insights
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {showClassSelector && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-indigo-500"
              id="select-analytics-class"
            >
              <option value="ALL">All My Classes</option>
              {teacherClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.subject})
                </option>
              ))}
            </select>
          )}

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 shrink-0">
            {(['7d', '30d', 'all'] as AnalyticsTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
                id={`btn-analytics-timeframe-${tf}`}
              >
                {tf === '7d' ? 'Last 7 Days' : tf === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Problems Solved
          </span>
          <div className="text-2xl font-black text-white mt-1.5">{analytics.totalProblemsSolved}</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">In selected period</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Active Students
          </span>
          <div className="text-2xl font-black text-indigo-400 mt-1.5">
            {analytics.activeStudents}
            <span className="text-xs font-normal text-zinc-500 ml-1">/ {analytics.totalStudents}</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 block">
            {analytics.totalStudents > 0
              ? Math.round((analytics.activeStudents / analytics.totalStudents) * 100)
              : 0}
            % participation
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Inactive Students
          </span>
          <div className="text-2xl font-black text-rose-400 mt-1.5">{analytics.inactiveStudents}</div>
          <span className="text-[10px] text-rose-400/80 mt-0.5 block">&gt;4 days inactive</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            Avg Solved / Student
          </span>
          <div className="text-2xl font-black text-purple-400 mt-1.5">{analytics.averageProblemsSolved}</div>
          <span className="text-[10px] text-zinc-500 mt-0.5 block">Per enrolled coder</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Acceptance Rate
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1.5">{analytics.averageAcceptanceRate}%</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Solution accuracy</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            Coursework Rate
          </span>
          <div className="text-2xl font-black text-teal-400 mt-1.5">
            {analytics.averageAssignmentCompletion}%
          </div>
          <span className="text-[10px] text-zinc-500 mt-0.5 block">Assignment completion</span>
        </div>
      </div>

      {/* Top Student Highlights Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Active Student */}
        {analytics.mostActiveStudent ? (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/20 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={analytics.mostActiveStudent.student.avatar}
                  alt={analytics.mostActiveStudent.student.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10"
                />
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 p-1 rounded-lg text-xs font-black">
                  👑
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  Most Active Coder in Period
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{analytics.mostActiveStudent.student.name}</h3>
                <p className="text-xs text-zinc-400">
                  {analytics.mostActiveStudent.student.email} • {analytics.mostActiveStudent.streak} Day Streak
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-amber-400">{analytics.mostActiveStudent.solvedCount}</div>
              <div className="text-[10px] text-zinc-400 font-semibold">Accepted Solutions</div>
              <button
                onClick={() => setSelectedStudentForAnalytics(analytics.mostActiveStudent?.student.id || null)}
                className="mt-2 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-auto"
              >
                <span>View Profile</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-500">
            No active student records found for this period.
          </div>
        )}

        {/* Most Improved Student */}
        {analytics.mostImprovedStudent ? (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={analytics.mostImprovedStudent.student.avatar}
                  alt={analytics.mostImprovedStudent.student.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-zinc-950 p-1 rounded-lg text-xs font-black">
                  🚀
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Most Improved Coder
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{analytics.mostImprovedStudent.student.name}</h3>
                <p className="text-xs text-zinc-400">
                  {analytics.mostImprovedStudent.currentSolved} solved vs {analytics.mostImprovedStudent.previousSolved} previously
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400">
                +{analytics.mostImprovedStudent.deltaPercentage}%
              </div>
              <div className="text-[10px] text-zinc-400 font-semibold">Activity Surge</div>
              <button
                onClick={() => setSelectedStudentForAnalytics(analytics.mostImprovedStudent?.student.id || null)}
                className="mt-2 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-auto"
              >
                <span>View Profile</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-500">
            No comparative records yet.
          </div>
        )}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity & Submissions Over Time Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Class Activity & Submissions Trend
                </h3>
                <p className="text-xs text-zinc-400">Daily student submissions and unique active coders</p>
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setActiveMetricTab('submissions')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeMetricTab === 'submissions'
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Submissions
                </button>
                <button
                  onClick={() => setActiveMetricTab('activeStudents')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeMetricTab === 'activeStudents'
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Active Students
                </button>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {activeMetricTab === 'submissions' ? (
                  <AreaChart data={analytics.activityOverTime}>
                    <defs>
                      <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="label" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="submissions"
                      name="Total Submissions"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorSubs)"
                    />
                    <Area
                      type="monotone"
                      dataKey="accepted"
                      name="Accepted Solutions"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorAcc)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={analytics.activityOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="label" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="activeStudents" name="Active Students" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Submissions
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Accepted Solutions
            </span>
            <span>Total Evaluated: {analytics.totalProblemsSolved}</span>
          </div>
        </div>

        {/* Assignment Completion Breakdown (1 col) */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Coursework Completion
            </h3>
            <p className="text-xs text-zinc-400 mb-3">Overall student progress on assigned tasks</p>

            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.assignmentCompletionStats}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {analytics.assignmentCompletionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-zinc-800">
            {analytics.assignmentCompletionStats.map((st) => (
              <div key={st.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                  <span className="text-zinc-300">{st.name}</span>
                </div>
                <div className="font-bold text-white">
                  {st.count} <span className="text-zinc-500 text-[10px]">({st.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Difficulty & Category Mastery Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Difficulty Distribution */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-400" />
            Solved Difficulty Distribution
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Breakdown of problems solved by difficulty level</p>

          <div className="space-y-3">
            {analytics.difficultyDistribution.map((d) => (
              <div key={d.name} className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold" style={{ color: d.color }}>
                    {d.name} Problems
                  </span>
                  <span className="font-bold text-white">{d.solved} solved</span>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(10, d.accuracy))}%`,
                      backgroundColor: d.color
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Accuracy: {d.accuracy}%</span>
                  <span>Benchmark: Pass</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Performance Grid (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-900 border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Topic & DSA Category Mastery
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Class accuracy and solved volume across data structures & algorithms</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-none">
            {analytics.topicPerformance.map((tp) => (
              <div
                key={tp.category}
                className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-xs hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">{tp.category}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {tp.solvedCount} solved • {tp.studentsCount} students active
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      tp.accuracyRate >= 75
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : tp.accuracyRate >= 50
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {tp.accuracyRate}% Acc
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Teacher Insights Grid */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl" id="teacher-insights-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Automated Student Action Insights
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {analytics.insights.length} Detected
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Surges, inactivity warnings, topic breakthroughs, and assignment milestones
              </p>
            </div>
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0 text-xs">
            <button
              onClick={() => setInsightFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                insightFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({analytics.insights.length})
            </button>
            <button
              onClick={() => setInsightFilter('positive')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                insightFilter === 'positive' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setInsightFilter('warning')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                insightFilter === 'warning' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Warnings
            </button>
            <button
              onClick={() => setInsightFilter('high')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                insightFilter === 'high' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {filteredInsights.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No student action insights matching the current filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredInsights.map((insight) => (
              <div
                key={insight.id}
                onClick={() => setSelectedStudentForAnalytics(insight.studentId)}
                className={`p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] cursor-pointer flex flex-col justify-between ${
                  insight.severity === 'positive'
                    ? 'bg-emerald-950/20 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                    : insight.severity === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/30 shadow-md shadow-amber-500/5'
                    : 'bg-rose-950/20 border-rose-500/30 shadow-md shadow-rose-500/5'
                }`}
                id={`teacher-insight-${insight.id}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={insight.studentAvatar}
                        alt={insight.studentName}
                        className="w-8 h-8 rounded-xl object-cover ring-1 ring-zinc-700"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{insight.studentName}</h4>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          {insight.tag}
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      {getInsightIcon(insight.type)}
                    </div>
                  </div>

                  <h5 className="text-xs font-bold text-zinc-200 mt-2">{insight.title}</h5>
                  <p className="text-xs text-zinc-300 leading-relaxed mt-1">{insight.message}</p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/60 text-[11px]">
                  {insight.metricDelta ? (
                    <span className="font-bold text-zinc-300">{insight.metricDelta}</span>
                  ) : (
                    <span className="text-zinc-500">{insight.className}</span>
                  )}

                  <span className="font-semibold text-indigo-400 flex items-center gap-0.5">
                    View Student <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
