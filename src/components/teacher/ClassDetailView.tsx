import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { StudentMonitoringTable } from './StudentMonitoringTable';
import { AnnouncementsList } from './AnnouncementsList';
import { ClassLeaderboardSection } from '../leaderboard/ClassLeaderboardSection';
import { WeeklyChallengesView } from '../challenges/WeeklyChallengesView';
import { ClassAnalyticsTab } from './ClassAnalyticsTab';
import {
  GraduationCap,
  Users,
  FileCode2,
  LineChart,
  Copy,
  RefreshCw,
  Plus,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Trophy,
  PieChart as PieChartIcon,
  BarChart3,
  Megaphone
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ClassDetailView: React.FC = () => {
  const { selectedClassId, setSelectedClassId, setActiveTab, classes, members, assignments, announcements, weeklyChallenges, regenerateCode, setIsCreateAssignmentOpen, openCreateAnnouncement, showToast, navigateToSolve } = useApp();
  const { currentUser, isTeacher } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'announcements' | 'challenges' | 'leaderboard' | 'students' | 'assignments' | 'analytics'>('overview');

  const classRoom = classes.find((c) => c.id === selectedClassId) || classes[0];

  const classAnnouncements = useMemo(() => {
    return announcements.filter((a) => a.classId === classRoom?.id);
  }, [announcements, classRoom?.id]);

  const classMembers = useMemo(() => {
    return members.filter((m) => m.classId === classRoom?.id);
  }, [members, classRoom?.id]);

  const classAssignments = useMemo(() => {
    return assignments.filter((a) => a.classId === classRoom?.id);
  }, [assignments, classRoom?.id]);

  const studentMetrics = useMemo(() => {
    if (!classRoom) return [];
    return storage.getStudentMetricsForTeacher(classRoom.teacherId, classRoom.id);
  }, [classRoom]);

  if (!classRoom) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-zinc-400">Classroom not found.</p>
        <button
          onClick={() => setActiveTab('classes')}
          className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(classRoom.joinCode);
    showToast('Code Copied! 📋', `Join code: ${classRoom.joinCode}`, 'success');
  };

  // Class analytics calculations
  const totalSolvedSum = studentMetrics.reduce((acc, curr) => acc + curr.totalSolved, 0);
  const avgProgress =
    studentMetrics.length > 0
      ? Math.round(studentMetrics.reduce((acc, curr) => acc + curr.overallProgressScore, 0) / studentMetrics.length)
      : 0;

  const difficultyData = [
    { name: 'Easy', value: studentMetrics.reduce((acc, curr) => acc + curr.easySolved, 0), color: '#10b981' },
    { name: 'Medium', value: studentMetrics.reduce((acc, curr) => acc + curr.mediumSolved, 0), color: '#f59e0b' },
    { name: 'Hard', value: studentMetrics.reduce((acc, curr) => acc + curr.hardSolved, 0), color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setSelectedClassId(null);
            setActiveTab('classes');
          }}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Classes</span>
        </button>
      </div>

      {/* Class Banner & Header */}
      <div className={`p-6 rounded-3xl bg-gradient-to-r ${classRoom.iconColor} text-white shadow-2xl relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{classRoom.bannerEmoji}</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                {classRoom.subject}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{classRoom.name}</h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-2xl leading-relaxed">
              {classRoom.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-white/90">
              <div className="flex items-center gap-2">
                <img
                  src={classRoom.teacherAvatar}
                  alt={classRoom.teacherName}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-white/50"
                />
                <span className="font-semibold">Instructor: {classRoom.teacherName}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{classMembers.length} Enrolled Students</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created {new Date(classRoom.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Join Code Display Widget */}
          <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-center shrink-0 w-full md:w-auto">
            <span className="text-[10px] uppercase font-bold text-white/70 block">Student Join Code</span>
            <div className="font-mono text-xl font-black tracking-widest text-white mt-0.5 mb-2">
              {classRoom.joinCode}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={copyCode}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                id="btn-class-detail-copy-code"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </button>
              {isTeacher && (
                <button
                  onClick={() => regenerateCode(classRoom.id)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Regenerate Join Code"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          id="tab-class-overview"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          id="tab-class-announcements"
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcements ({classAnnouncements.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('challenges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'challenges'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          id="tab-class-challenges"
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Weekly Challenges</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'leaderboard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          id="tab-class-leaderboard"
        >
          <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Class Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'students'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          id="tab-class-students"
        >
          <Users className="w-4 h-4" />
          <span>Students ({classMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('assignments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'assignments'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          id="tab-class-assignments"
        >
          <FileCode2 className="w-4 h-4" />
          <span>Assignments ({classAssignments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          id="tab-class-analytics"
        >
          <LineChart className="w-4 h-4" />
          <span>Class Analytics</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Students Enrolled</span>
              <div className="text-2xl font-black text-white mt-1">{classMembers.length}</div>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">Joined via code</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Class Progress</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">{avgProgress}%</div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">Average completion</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Assignments Active</span>
              <div className="text-2xl font-black text-purple-400 mt-1">{classAssignments.length}</div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">Coursework units</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Announcements</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{classAnnouncements.length}</div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">Broadcast updates</span>
            </div>
          </div>

          {/* Announcements Card in Overview */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Class Announcements</h3>
                  <p className="text-[11px] text-zinc-400">Recent posts and notes for students</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isTeacher && (
                  <button
                    onClick={() => openCreateAnnouncement(classRoom.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                    id="overview-new-announcement-btn"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveSubTab('announcements')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
                >
                  <span>View All ({classAnnouncements.length})</span>
                </button>
              </div>
            </div>

            {classAnnouncements.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500 bg-zinc-950/40 rounded-2xl border border-zinc-800/60">
                No announcements published yet for this class.
              </div>
            ) : (
              <div className="space-y-2.5">
                {classAnnouncements.slice(0, 2).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white truncate">{ann.title}</span>
                        {ann.pinned && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1">{ann.message}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap shrink-0">
                      {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignments in this class */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-400" />
                Active Class Assignments
              </h3>
              {isTeacher && (
                <button
                  onClick={() => setIsCreateAssignmentOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Assignment</span>
                </button>
              )}
            </div>

            {classAssignments.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                No assignments published yet for this class.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {classAssignments.map((asgn) => (
                  <div
                    key={asgn.id}
                    className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white">{asgn.title}</h4>
                      <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                        {asgn.problemIds.length} Problems
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{asgn.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                      <span>Due: {new Date(asgn.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <button
                        onClick={() => setActiveSubTab('assignments')}
                        className="text-indigo-400 hover:underline font-semibold"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Announcements */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4">
          <AnnouncementsList classId={classRoom.id} className={classRoom.name} />
        </div>
      )}

      {/* Tab: Weekly Challenges */}
      {activeSubTab === 'challenges' && (
        <div className="space-y-4">
          <WeeklyChallengesView
            classId={classRoom.id}
            showClassSelector={false}
          />
        </div>
      )}

      {/* Tab: Class Leaderboard */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-4">
          <ClassLeaderboardSection
            classId={classRoom.id}
            showClassDropdown={false}
          />
        </div>
      )}

      {/* Tab 3: Students */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          <StudentMonitoringTable classIdFilter={classRoom.id} />
        </div>
      )}

      {/* Tab 3: Assignments */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Classroom Assignments</h3>
              <p className="text-xs text-zinc-400">Track student completion for each problem set</p>
            </div>
            {isTeacher && (
              <button
                onClick={() => setIsCreateAssignmentOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Assignment</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {classAssignments.map((asgn) => {
              const problems = storage.getProblems();
              const asgnProblems = problems.filter((p) => asgn.problemIds.includes(p.id));

              return (
                <div
                  key={asgn.id}
                  className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div>
                      <h4 className="text-base font-bold text-white">{asgn.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{asgn.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Deadline: {new Date(asgn.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Problems list */}
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Assigned Coding Problems ({asgnProblems.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {asgnProblems.map((prob) => (
                        <div
                          key={prob.id}
                          onClick={() => navigateToSolve(prob.id, asgn.id)}
                          className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between transition-colors group"
                        >
                          <div>
                            <div className="font-semibold text-xs text-white group-hover:text-indigo-400 transition-colors">
                              {prob.title}
                            </div>
                            <div className="text-[10px] text-zinc-500">{prob.category}</div>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              prob.difficulty === 'Easy'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : prob.difficulty === 'Medium'
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-rose-400 bg-rose-500/10'
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Analytics */}
      {activeSubTab === 'analytics' && (
        <ClassAnalyticsTab
          teacherId={classRoom.teacherId}
          classId={classRoom.id}
          className={classRoom.name}
        />
      )}
    </div>
  );
};
