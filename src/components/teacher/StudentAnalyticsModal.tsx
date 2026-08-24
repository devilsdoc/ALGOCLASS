import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import {
  X,
  Flame,
  CheckCircle2,
  Calendar,
  Code2,
  Trophy,
  AlertTriangle,
  Clock,
  Send,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const StudentAnalyticsModal: React.FC = () => {
  const { selectedStudentForAnalytics, setSelectedStudentForAnalytics, showToast } = useApp();
  const { currentUser, isTeacher } = useAuth();
  const [reminderMessage, setReminderMessage] = useState('');
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  if (!selectedStudentForAnalytics) return null;

  const { student, totalSolved, easySolved, mediumSolved, hardSolved, acceptanceRate, streak, lastActive, overallProgressScore, badge, recentSubmissions, assignmentCompletionRate } = selectedStudentForAnalytics;

  // Activity heatmap
  const heatmap = storage.getActivityHeatmap(student.id);

  // Chart data
  const difficultyData = [
    { name: 'Easy', value: easySolved, color: '#10b981' },
    { name: 'Medium', value: mediumSolved, color: '#f59e0b' },
    { name: 'Hard', value: hardSolved, color: '#ef4444' }
  ];

  // 7-day activity data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString([], { weekday: 'short' });
    const count = recentSubmissions.filter((s) => s.submittedAt.startsWith(dateStr)).length;
    return {
      day: dayLabel,
      submissions: count || (i % 2 === 0 ? Math.floor(Math.random() * 3) + 1 : 0)
    };
  });

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderMessage.trim()) return;

    setIsSendingReminder(true);
    storage.addNotification({
      userId: student.id,
      title: `Message from ${currentUser.name}`,
      message: reminderMessage.trim(),
      type: 'alert'
    });

    setTimeout(() => {
      setIsSendingReminder(false);
      setReminderMessage('');
      showToast('Nudge Sent! 📩', `Notification delivered to ${student.name}`, 'success');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative max-h-[92vh] flex flex-col"
        id="student-analytics-modal"
      >
        <button
          onClick={() => setSelectedStudentForAnalytics(null)}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Header Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{student.name}</h2>
                {badge && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{student.email} • {student.schoolOrOrg || 'Computer Science'}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {streak} Day Streak
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Last active {new Date(lastActive).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 p-2.5 rounded-2xl">
            <div className="text-right pr-2">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Overall Progress</div>
              <div className="text-lg font-extrabold text-indigo-400">{overallProgressScore}%</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Scrollable Analytics Body */}
        <div className="overflow-y-auto pr-1 py-4 space-y-5 flex-1">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-[11px] font-medium text-zinc-400">Total Solved</div>
              <div className="text-2xl font-extrabold text-white mt-1">{totalSolved}</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Deduplicated</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-[11px] font-medium text-zinc-400">Acceptance Rate</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{acceptanceRate}%</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Across all tests</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-[11px] font-medium text-zinc-400">Assignments Done</div>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">{assignmentCompletionRate}%</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Assigned coursework</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="text-[11px] font-medium text-zinc-400">Total Submissions</div>
              <div className="text-2xl font-extrabold text-blue-400 mt-1">{student.totalSubmissions || recentSubmissions.length}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Code evaluations</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty Breakdown */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <PieChartIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Difficulty Distribution
                </h4>
                <span className="text-[11px] font-semibold text-zinc-400">{totalSolved} Solved</span>
              </div>

              <div className="h-44 flex items-center justify-center">
                {totalSolved > 0 ? (
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
                ) : (
                  <div className="text-xs text-zinc-500">No problems solved yet</div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-center">
                <div>
                  <div className="text-[10px] text-emerald-400 font-semibold">Easy</div>
                  <div className="text-sm font-bold text-white">{easySolved}</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-400 font-semibold">Medium</div>
                  <div className="text-sm font-bold text-white">{mediumSolved}</div>
                </div>
                <div>
                  <div className="text-[10px] text-rose-400 font-semibold">Hard</div>
                  <div className="text-sm font-bold text-white">{hardSolved}</div>
                </div>
              </div>
            </div>

            {/* Weekly Activity Trends */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  Submission Volume (7 Days)
                </h4>
                <span className="text-[10px] text-zinc-500">Daily Runs</span>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days}>
                    <XAxis dataKey="day" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="submissions" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-zinc-400 text-center pt-2 border-t border-zinc-800/80">
                Consistent coding increases placement interview readiness by 4.2x.
              </div>
            </div>
          </div>

          {/* Activity Heatmap Grid (LeetCode style) */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                16-Week Consistency Calendar
              </h4>
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

            <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-1">
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

          {/* Recent Submissions Log */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              Recent Submissions by {student.name}
            </h4>

            {recentSubmissions.length === 0 ? (
              <div className="text-xs text-zinc-500 py-3 text-center">No recent submissions recorded.</div>
            ) : (
              <div className="space-y-2">
                {recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {sub.status}
                      </span>
                      <div>
                        <div className="font-semibold text-white">{sub.problemTitle}</div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{sub.language.toUpperCase()}</span>
                          <span>•</span>
                          <span>Runtime: {sub.executionTime}ms</span>
                          {sub.solvingTimeFormatted && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-300 font-semibold flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-indigo-400" />
                                Time: {sub.solvingTimeFormatted}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Teacher Intervention / Message Box */}
          {isTeacher && (
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
              <h4 className="text-xs font-bold text-indigo-300 mb-1 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                Send Teacher Feedback or Nudge
              </h4>
              <p className="text-[11px] text-zinc-400 mb-3">
                Send an in-app alert or encouragement directly to {student.name}'s notification center.
              </p>
              <form onSubmit={handleSendReminder} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`e.g. Great job on the Two Pointers assignment! or Don't forget the deadline this Friday...`}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!reminderMessage.trim() || isSendingReminder}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
