import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { StudentGoalsTracker } from '../goals/StudentGoalsTracker';
import { WeeklyChallengesView } from '../challenges/WeeklyChallengesView';
import {
  GraduationCap,
  FileCode2,
  Code2,
  Flame,
  Zap,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Trophy,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Megaphone,
  Pin,
  Target
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    classes,
    members,
    assignments,
    announcements,
    problems,
    submissions,
    setIsJoinClassOpen,
    setSelectedClassId,
    setActiveTab,
    navigateToSolve
  } = useApp();

  // Student's joined classes
  const myMemberships = useMemo(() => {
    return members.filter((m) => m.studentId === currentUser.id);
  }, [members, currentUser.id]);

  const myClassIds = useMemo(() => myMemberships.map((m) => m.classId), [myMemberships]);

  const myClasses = useMemo(() => {
    return classes.filter((c) => myClassIds.includes(c.id));
  }, [classes, myClassIds]);

  // Announcements for my classes
  const myAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => myClassIds.includes(a.classId))
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [announcements, myClassIds]);

  // Assignments from my classes
  const myAssignments = useMemo(() => {
    return assignments.filter((a) => myClassIds.includes(a.classId));
  }, [assignments, myClassIds]);

  // Submissions by this student
  const mySubmissions = useMemo(() => {
    return submissions.filter((s) => s.studentId === currentUser.id);
  }, [submissions, currentUser.id]);

  const acceptedSubmissions = useMemo(() => {
    return mySubmissions.filter((s) => s.status === 'Accepted');
  }, [mySubmissions]);

  // Deduplicated solved problem IDs
  const solvedProblemIds = useMemo(() => {
    return new Set(acceptedSubmissions.map((s) => s.problemId));
  }, [acceptedSubmissions]);

  // Calculate difficulty counts
  const easySolved = problems.filter((p) => p.difficulty === 'Easy' && solvedProblemIds.has(p.id)).length;
  const medSolved = problems.filter((p) => p.difficulty === 'Medium' && solvedProblemIds.has(p.id)).length;
  const hardSolved = problems.filter((p) => p.difficulty === 'Hard' && solvedProblemIds.has(p.id)).length;

  const totalEasy = problems.filter((p) => p.difficulty === 'Easy').length;
  const totalMed = problems.filter((p) => p.difficulty === 'Medium').length;
  const totalHard = problems.filter((p) => p.difficulty === 'Hard').length;

  // Next recommended problems to practice
  const recommendedProblems = useMemo(() => {
    return problems.filter((p) => !solvedProblemIds.has(p.id)).slice(0, 4);
  }, [problems, solvedProblemIds]);

  return (
    <div className="space-y-6 pb-12">
      {/* Student Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-zinc-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>LeetCode & Classroom Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Ready to solve, {currentUser.name}? 🚀
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Practice algorithmic patterns, submit assignments directly to your instructor, and keep your daily streak alive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('problems')}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5"
            id="student-dash-problems-btn"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Problem Bank</span>
          </button>
          <button
            onClick={() => setIsJoinClassOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            id="student-dash-join-class-btn"
          >
            <Zap className="w-4 h-4" />
            <span>Join Class</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Streak */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Current Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{currentUser.streak} Days</div>
          <div className="text-[11px] text-zinc-500 mt-1">Keep solving daily</div>
        </div>

        {/* Total Solved */}
        <div
          onClick={() => setActiveTab('progress')}
          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Problems Solved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{solvedProblemIds.size}</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            {easySolved}E • {medSolved}M • {hardSolved}H
          </div>
        </div>

        {/* Enrolled Classes */}
        <div
          onClick={() => setActiveTab('classes')}
          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">My Classes</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{myClasses.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Active batches</div>
        </div>

        {/* Assigned Tasks */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Assignments</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCode2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{myAssignments.length}</div>
          <div className="text-[11px] text-purple-400 mt-1 font-medium">Pending & Completed</div>
        </div>
      </div>

      {/* Personal Goals Tracker Widget */}
      <StudentGoalsTracker />

      {/* Weekly Coding Challenges Section */}
      <WeeklyChallengesView showClassSelector={true} />

      {/* Middle Section: Active Coursework & Solved Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Assignments Checklist (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Coursework & Assignments</h3>
                  <p className="text-[11px] text-zinc-400">Assigned problem sets from your instructors</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('assignments')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myAssignments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-2 text-zinc-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-zinc-300">No active assignments</div>
                <p className="text-[11px] text-zinc-500 mt-0.5 mb-3">Join a teacher's class using their join code.</p>
                <button
                  onClick={() => setIsJoinClassOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Enter Join Code
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myAssignments.slice(0, 3).map((asgn) => {
                  const assignedProblems = problems.filter((p) => asgn.problemIds.includes(p.id));
                  const solvedInAsgn = assignedProblems.filter((p) => solvedProblemIds.has(p.id)).length;
                  const percent = Math.round((solvedInAsgn / assignedProblems.length) * 100) || 0;
                  const isDone = solvedInAsgn === assignedProblems.length;

                  return (
                    <div
                      key={asgn.id}
                      className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-white">{asgn.title}</div>
                          <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>Due {new Date(asgn.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isDone ? 'Completed' : `${solvedInAsgn}/${assignedProblems.length} Done`}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isDone ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Quick problem tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {assignedProblems.map((prob) => {
                          const isProbSolved = solvedProblemIds.has(prob.id);
                          return (
                            <button
                              key={prob.id}
                              onClick={() => navigateToSolve(prob.id, asgn.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                                isProbSolved
                                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-indigo-500 hover:text-white'
                              }`}
                            >
                              {isProbSolved ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              )}
                              <span>{prob.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* LeetCode Difficulty Breakdown (1 col) */}
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Problem Mastery
              </h3>
              <span className="text-xs font-semibold text-zinc-400">{solvedProblemIds.size} Solved</span>
            </div>

            <div className="space-y-4">
              {/* Easy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400">Easy</span>
                  <span className="text-zinc-400 font-mono text-[11px]">{easySolved} / {totalEasy || 2}</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (easySolved / (totalEasy || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-400">Medium</span>
                  <span className="text-zinc-400 font-mono text-[11px]">{medSolved} / {totalMed || 3}</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (medSolved / (totalMed || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-400">Hard</span>
                  <span className="text-zinc-400 font-mono text-[11px]">{hardSolved} / {totalHard || 1}</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (hardSolved / (totalHard || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('progress')}
            className="w-full mt-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors text-center"
          >
            View Full Consistency Heatmap →
          </button>
        </div>
      </div>

      {/* Class Announcements from Teachers */}
      {myAnnouncements.length > 0 && (
        <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Classroom Announcements</h3>
                <p className="text-xs text-zinc-400">Important notices and updates from your teachers</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              {myAnnouncements.length} New
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {myAnnouncements.slice(0, 4).map((ann) => {
              const targetClass = classes.find((c) => c.id === ann.classId);
              return (
                <div
                  key={ann.id}
                  className={`p-4 rounded-2xl bg-zinc-950/70 border transition-all ${
                    ann.pinned
                      ? 'border-amber-500/40 bg-amber-500/[0.03]'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {targetClass && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 truncate">
                          {targetClass.bannerEmoji} {targetClass.name}
                        </span>
                      )}
                      {ann.pinned && (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Pin className="w-2.5 h-2.5 fill-amber-400" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                      {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-white mb-1">{ann.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{ann.message}</p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2.5 mt-2.5 border-t border-zinc-800/80">
                    <span className="font-medium text-zinc-400">By {ann.teacherName}</span>
                    <span className="text-zinc-500">
                      {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Coding Challenges */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recommended Practice Problems</h3>
            <p className="text-xs text-zinc-400">Sharpen your algorithmic thinking with curated challenges</p>
          </div>
          <button
            onClick={() => setActiveTab('problems')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
          >
            <span>Explore All Problems</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {recommendedProblems.map((prob) => (
            <div
              key={prob.id}
              onClick={() => navigateToSolve(prob.id)}
              className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:bg-zinc-900 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
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
                  <span className="text-[10px] text-zinc-500 font-mono">{prob.category}</span>
                </div>
                <h4 className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">
                  {prob.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 mb-3">{prob.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold pt-2 border-t border-zinc-800/80">
                <span>Solve in Editor</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
