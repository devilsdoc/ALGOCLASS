import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import {
  FileCode2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Code2,
  ArrowRight,
  Filter,
  Sparkles,
  Calendar,
  GraduationCap
} from 'lucide-react';

export const StudentAssignments: React.FC = () => {
  const { currentUser } = useAuth();
  const { members, assignments, classes, problems, submissions, navigateToSolve, setIsJoinClassOpen } = useApp();

  const [filterState, setFilterState] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'OVERDUE'>('ALL');

  // Classes joined by this student
  const joinedClassIds = useMemo(() => {
    return members.filter((m) => m.studentId === currentUser.id).map((m) => m.classId);
  }, [members, currentUser.id]);

  // Submissions by this student that are Accepted
  const solvedProblemIds = useMemo(() => {
    const accepted = submissions.filter((s) => s.studentId === currentUser.id && s.status === 'Accepted');
    return new Set(accepted.map((s) => s.problemId));
  }, [submissions, currentUser.id]);

  // Assignments for this student
  const studentAssignments = useMemo(() => {
    return assignments.filter((a) => joinedClassIds.includes(a.classId));
  }, [assignments, joinedClassIds]);

  // Processed assignments with status
  const processedAssignments = useMemo(() => {
    const now = Date.now();

    return studentAssignments
      .map((asgn) => {
        const asgnProblems = problems.filter((p) => asgn.problemIds.includes(p.id));
        const solvedCount = asgnProblems.filter((p) => solvedProblemIds.has(p.id)).length;
        const isCompleted = asgnProblems.length > 0 && solvedCount === asgnProblems.length;
        const isOverdue = new Date(asgn.deadline).getTime() < now && !isCompleted;
        const classInfo = classes.find((c) => c.id === asgn.classId);

        return {
          ...asgn,
          problemsList: asgnProblems,
          solvedCount,
          isCompleted,
          isOverdue,
          classInfo
        };
      })
      .filter((item) => {
        if (filterState === 'PENDING') return !item.isCompleted && !item.isOverdue;
        if (filterState === 'COMPLETED') return item.isCompleted;
        if (filterState === 'OVERDUE') return item.isOverdue;
        return true;
      });
  }, [studentAssignments, problems, solvedProblemIds, classes, filterState]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileCode2 className="w-7 h-7 text-indigo-400" />
            Classroom Assignments
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Solve problems assigned by your instructors and track your deadlines in real time
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          {(['ALL', 'PENDING', 'COMPLETED', 'OVERDUE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterState(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterState === filter
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {filter === 'ALL'
                ? 'All'
                : filter === 'PENDING'
                ? '⚡ In Progress'
                : filter === 'COMPLETED'
                ? '✅ Done'
                : '⏰ Overdue'}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {processedAssignments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No assignments found</h3>
          <p className="text-xs text-zinc-400 mt-1 mb-4 max-w-sm mx-auto">
            {joinedClassIds.length === 0
              ? 'You have not joined any classes yet. Use a join code to enroll.'
              : 'You have no matching assignments in this view.'}
          </p>
          {joinedClassIds.length === 0 && (
            <button
              onClick={() => setIsJoinClassOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Join Classroom
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {processedAssignments.map((asgn) => {
            const percent = Math.round((asgn.solvedCount / asgn.problemsList.length) * 100) || 0;

            return (
              <div
                key={asgn.id}
                className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {asgn.classInfo && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                          {asgn.classInfo.bannerEmoji} {asgn.classInfo.name}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          asgn.isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : asgn.isOverdue
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {asgn.isCompleted ? 'Completed' : asgn.isOverdue ? 'Overdue' : 'Due Soon'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{asgn.title}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{asgn.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500 uppercase font-semibold">Deadline</div>
                      <div className="text-xs font-bold text-zinc-200">
                        {new Date(asgn.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-400">Assignment Completion</span>
                    <span className="font-bold text-white">
                      {asgn.solvedCount} / {asgn.problemsList.length} Problems ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        asgn.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Problems List */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Assigned Coding Problems
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {asgn.problemsList.map((prob) => {
                      const isProbSolved = solvedProblemIds.has(prob.id);

                      return (
                        <div
                          key={prob.id}
                          onClick={() => navigateToSolve(prob.id, asgn.id)}
                          className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all group ${
                            isProbSolved
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-indigo-500 hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                                isProbSolved ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {isProbSolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-white truncate group-hover:text-indigo-400 transition-colors">
                                {prob.title}
                              </div>
                              <div className="text-[10px] text-zinc-500">{prob.difficulty}</div>
                            </div>
                          </div>

                          <span className="text-xs text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                            →
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
