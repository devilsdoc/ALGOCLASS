import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { StudentGoalsTracker } from '../goals/StudentGoalsTracker';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Code2,
  Trophy,
  Zap,
  Clock,
  PieChart as PieChartIcon,
  Award,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  CheckCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

export const StudentProgress: React.FC = () => {
  const { currentUser } = useAuth();
  const { problems, submissions, navigateToSolve } = useApp();

  const heatmap = storage.getActivityHeatmap(currentUser.id);
  const insights = storage.getStudentProgressInsights(currentUser.id);

  // Submissions by this student
  const mySubmissions = useMemo(() => {
    return submissions.filter((s) => s.studentId === currentUser.id);
  }, [submissions, currentUser.id]);

  const accepted = mySubmissions.filter((s) => s.status === 'Accepted');
  const solvedProblemIds = new Set(accepted.map((s) => s.problemId));

  const easySolved = problems.filter((p) => p.difficulty === 'Easy' && solvedProblemIds.has(p.id)).length;
  const medSolved = problems.filter((p) => p.difficulty === 'Medium' && solvedProblemIds.has(p.id)).length;
  const hardSolved = problems.filter((p) => p.difficulty === 'Hard' && solvedProblemIds.has(p.id)).length;

  const totalEasy = problems.filter((p) => p.difficulty === 'Easy').length;
  const totalMed = problems.filter((p) => p.difficulty === 'Medium').length;
  const totalHard = problems.filter((p) => p.difficulty === 'Hard').length;

  const acceptanceRate =
    mySubmissions.length > 0
      ? Math.round((accepted.length / mySubmissions.length) * 100)
      : 80;

  const difficultyData = [
    { name: 'Easy', value: easySolved || 1, color: '#10b981' },
    { name: 'Medium', value: medSolved || 1, color: '#f59e0b' },
    { name: 'Hard', value: hardSolved || 1, color: '#ef4444' }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'dropped':
        return <TrendingDown className="w-5 h-5 text-amber-400" />;
      case 'consistency':
        return <Flame className="w-5 h-5 text-amber-400 fill-amber-500/20" />;
      case 'topic_mastery':
        return <Award className="w-5 h-5 text-purple-400" />;
      case 'accuracy':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'milestone':
        return <Trophy className="w-5 h-5 text-indigo-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Summary */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{currentUser.name}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentUser.title || 'Student Coder'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{currentUser.email} • {currentUser.schoolOrOrg || 'Computer Science'}</p>
            <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
              <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <Flame className="w-4 h-4 fill-amber-500" />
                {currentUser.streak} Day Streak
              </span>
              <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                {solvedProblemIds.size} Solved
              </span>
              <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                {acceptanceRate}% Acceptance
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-2xl shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Class Leaderboard</div>
            <div className="text-sm font-extrabold text-white">Top 5% in Class</div>
          </div>
        </div>
      </div>

      {/* FEATURE 1: AUTOMATIC STUDENT PROGRESS INSIGHTS */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/30 border border-zinc-800 shadow-xl" id="student-insights-section">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Real-Time Progress Insights
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Calculated from real code submissions
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Continuous comparisons against previous coding periods</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Updated live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between ${
                insight.level === 'positive'
                  ? 'bg-emerald-950/20 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                  : insight.level === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/30 shadow-md shadow-amber-500/5'
                  : 'bg-zinc-900/80 border-indigo-500/30'
              }`}
              id={`insight-card-${insight.id}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{insight.title}</h3>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{insight.tag}</span>
                    </div>
                  </div>

                  {insight.metricDelta && (
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl shadow-sm ${
                        insight.level === 'positive'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : insight.level === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {insight.metricDelta}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mt-2">{insight.message}</p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500">
                <span>Calculated for this week</span>
                <span className="font-semibold text-indigo-400 flex items-center gap-0.5">
                  Live Metric <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Coding Goals Section */}
      <StudentGoalsTracker />

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Difficulty Pie Chart (1 col) */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5 text-indigo-400" />
                Difficulty Distribution
              </h3>
              <span className="text-xs font-bold text-white">{solvedProblemIds.size} Solved</span>
            </div>

            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800 text-center">
            <div>
              <div className="text-[10px] text-emerald-400 font-semibold">Easy</div>
              <div className="text-sm font-bold text-white">{easySolved}/{totalEasy || 2}</div>
            </div>
            <div>
              <div className="text-[10px] text-amber-400 font-semibold">Medium</div>
              <div className="text-sm font-bold text-white">{medSolved}/{totalMed || 3}</div>
            </div>
            <div>
              <div className="text-[10px] text-rose-400 font-semibold">Hard</div>
              <div className="text-sm font-bold text-white">{hardSolved}/{totalHard || 1}</div>
            </div>
          </div>
        </div>

        {/* LeetCode Consistency Heatmap (2 cols) */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Submission Activity Heatmap
                </h3>
                <p className="text-xs text-zinc-400">Your coding rhythm across the last 16 weeks</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800" />
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950" />
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700" />
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                <span>More</span>
              </div>
            </div>

            <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-2">
              {heatmap.map((day) => {
                const colors = [
                  'bg-zinc-800/70',
                  'bg-emerald-900/90',
                  'bg-emerald-700',
                  'bg-emerald-500',
                  'bg-emerald-400'
                ];
                return (
                  <div
                    key={day.date}
                    className={`w-3 h-3 rounded-sm ${colors[day.level]} transition-transform hover:scale-125 cursor-pointer`}
                    title={`${day.date}: ${day.count} submissions`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs text-zinc-400">
            <span>Total Submissions: {mySubmissions.length}</span>
            <span>Accepted Solutions: {accepted.length}</span>
          </div>
        </div>
      </div>

      {/* Submissions History Log */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          Submission History
        </h3>

        {mySubmissions.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No submissions recorded yet. Try solving your first problem!
          </div>
        ) : (
          <div className="space-y-2">
            {mySubmissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => navigateToSolve(sub.problemId)}
                className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                      sub.status === 'Accepted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {sub.status}
                  </span>
                  <div>
                    <div className="font-semibold text-white hover:text-indigo-400 transition-colors">
                      {sub.problemTitle}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {sub.language.toUpperCase()} • {sub.executionTime}ms • {sub.memory}MB
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                  <span>{new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-indigo-400 font-semibold">Open Problem →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
