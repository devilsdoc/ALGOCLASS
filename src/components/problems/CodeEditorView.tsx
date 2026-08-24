import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { executeCode, ExecutionResult } from '../../utils/codeRunner';
import {
  ArrowLeft,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Code2,
  FileCode2,
  Pause,
  RotateCcw,
  ShieldAlert,
  Award,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CodeEditorView: React.FC = () => {
  const {
    activeProblemId,
    selectedProblemId,
    activeAssignmentId,
    activeAssignmentContext,
    setActiveTab,
    problems,
    assignments,
    classes,
    showToast,
    refreshSubmissions
  } = useApp();

  const { currentUser } = useAuth();

  const currentProbId = activeProblemId || selectedProblemId || (problems.length > 0 ? problems[0].id : '');
  const problem = problems.find((p) => p.id === currentProbId) || problems[0];
  const currentAsgnId = activeAssignmentId || activeAssignmentContext;
  const assignment = currentAsgnId ? assignments.find((a) => a.id === currentAsgnId) : undefined;
  const classInfo = assignment ? classes.find((c) => c.id === assignment.classId) : null;

  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'typescript' | 'python' | 'java' | 'cpp'>('javascript');
  const [code, setCode] = useState(() => problem?.starterCode?.[selectedLanguage] || problem?.starterCode?.javascript || '');
  const [activeTabLeft, setActiveTabLeft] = useState<'description' | 'submissions' | 'hints'>('description');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<ExecutionResult | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<'testcase' | 'result'>('testcase');

  // Clipboard restriction warning toast banner
  const [clipboardBlockedMessage, setClipboardBlockedMessage] = useState<string | null>(null);

  // Problem Solving Timer State (Persisted per problem and user)
  const timerStorageKey = `algoclass_timer_${currentUser.id}_${problem?.id || 'default'}`;
  
  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(timerStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.totalSeconds === 'number' ? parsed.totalSeconds : 0;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isSolvedInSession, setIsSolvedInSession] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize timer persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem(timerStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTimerSeconds(typeof parsed.totalSeconds === 'number' ? parsed.totalSeconds : 0);
        setIsTimerRunning(!parsed.completed);
        setIsSolvedInSession(!!parsed.completed);
      } else {
        setTimerSeconds(0);
        setIsTimerRunning(true);
        setIsSolvedInSession(false);
      }
    } catch {
      setTimerSeconds(0);
      setIsTimerRunning(true);
      setIsSolvedInSession(false);
    }
  }, [problem?.id, timerStorageKey]);

  // Active Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !isSolvedInSession) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          try {
            localStorage.setItem(
              timerStorageKey,
              JSON.stringify({
                totalSeconds: next,
                lastTickAt: Date.now(),
                completed: false
              })
            );
          } catch {
            // ignore
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isSolvedInSession, timerStorageKey]);

  // Format Helper: 00:00:00
  const formatTimerDigits = (secs: number): string => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatReadableDuration = (secs: number): string => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Update starter code when language or problem changes
  useEffect(() => {
    if (problem?.starterCode?.[selectedLanguage]) {
      setCode(problem.starterCode[selectedLanguage]);
    } else {
      setCode('');
    }
  }, [problem?.id, selectedLanguage]);

  // Previous submissions for this problem by current user
  const myProblemSubmissions = problem
    ? storage.getSubmissionsByProblem(problem.id).filter((s) => s.studentId === currentUser.id)
    : [];

  const handleResetCode = () => {
    if (confirm('Reset code to initial clean starter template? Any manually written code will be discarded.')) {
      setCode(problem.starterCode?.[selectedLanguage] || '');
    }
  };

  const handleResetTimer = () => {
    if (confirm('Reset problem solving timer back to 00:00:00?')) {
      setTimerSeconds(0);
      setIsTimerRunning(true);
      setIsSolvedInSession(false);
      try {
        localStorage.removeItem(timerStorageKey);
      } catch {
        // ignore
      }
    }
  };

  // Blocked Action Handler for Copy / Paste / Cut / Drag-and-drop
  const handleBlockedAction = (actionName: string) => {
    const msg = `${actionName} is blocked. Please type your code manually.`;
    setClipboardBlockedMessage(msg);
    showToast('Clipboard Action Blocked 🚫', msg, 'warning');

    setTimeout(() => {
      setClipboardBlockedMessage(null);
    }, 4000);
  };

  // Keyboard shortcut filtering on textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isModifier = e.ctrlKey || e.metaKey;

    // Block Ctrl+C / Cmd+C (Copy)
    if (isModifier && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      e.stopPropagation();
      handleBlockedAction('Copying (Ctrl+C)');
      return;
    }

    // Block Ctrl+V / Cmd+V (Paste)
    if (isModifier && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      e.stopPropagation();
      handleBlockedAction('Pasting (Ctrl+V)');
      return;
    }

    // Block Ctrl+X / Cmd+X (Cut)
    if (isModifier && (e.key === 'x' || e.key === 'X')) {
      e.preventDefault();
      e.stopPropagation();
      handleBlockedAction('Cutting (Ctrl+X)');
      return;
    }

    // Block Shift+Insert (Paste shortcut)
    if (e.shiftKey && e.key === 'Insert') {
      e.preventDefault();
      e.stopPropagation();
      handleBlockedAction('Paste shortcut (Shift+Insert)');
      return;
    }

    // Handle standard code editor Tab key indentation (2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      // Restore cursor after react state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Run on sample testcase
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveBottomTab('result');

    const result = await executeCode(problem, selectedLanguage, code, [problem.testCases[selectedTestCaseIdx]]);
    setIsRunning(false);
    setRunResult(result);
  };

  // Full submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveBottomTab('result');

    const result = await executeCode(problem, selectedLanguage, code);
    setIsSubmitting(false);
    setRunResult(result);

    const solvingTimeFormatted = formatReadableDuration(timerSeconds);

    // Record submission with real solving time
    storage.addSubmission({
      problemId: problem.id,
      problemTitle: problem.title,
      problemDifficulty: problem.difficulty,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      code,
      language: selectedLanguage,
      status: result.status,
      executionTime: result.executionTime,
      memory: result.memory,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      assignmentId: activeAssignmentId || undefined,
      solvingTimeSeconds: timerSeconds,
      solvingTimeFormatted
    });

    refreshSubmissions();

    if (result.status === 'Accepted') {
      // Stop timer and mark completed
      setIsTimerRunning(false);
      setIsSolvedInSession(true);
      try {
        localStorage.setItem(
          timerStorageKey,
          JSON.stringify({
            totalSeconds: timerSeconds,
            completed: true,
            completedAt: Date.now(),
            solvingTimeFormatted
          })
        );
      } catch {
        // ignore
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast('Accepted! 🎉', `Problem solved in ${solvingTimeFormatted} (Runtime: ${result.executionTime}ms)!`, 'success');

      // If part of an assignment, check if teacher needs alert
      if (assignment) {
        storage.addNotification({
          userId: assignment.teacherId,
          title: `Assignment Progress: ${currentUser.name}`,
          message: `${currentUser.name} solved "${problem.title}" in ${solvingTimeFormatted} for assignment "${assignment.title}".`,
          type: 'assignment'
        });
      }
    } else {
      showToast(`${result.status}`, result.errorMessage || 'Test cases failed. Check output console.', 'error');
    }
  };

  return (
    <div className="space-y-4 pb-12" id="code-editor-workspace">
      {/* Top Header Bar with Breadcrumb, Live Solving Timer, & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800/80 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeAssignmentId) {
                setActiveTab('assignments');
              } else {
                setActiveTab('problems');
              }
            }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
            title="Back to Problem List"
            id="btn-back-problems"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{problem.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    problem.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : problem.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {problem.difficulty}
                </span>
              </h2>
            </div>
            {assignment && classInfo && (
              <div className="text-[11px] text-purple-400 font-semibold flex items-center gap-1 mt-0.5">
                <FileCode2 className="w-3 h-3" />
                <span>Assignment: {assignment.title} ({classInfo.name})</span>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Problem Solving Timer & Language Tools */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* PROBLEM SOLVING TIMER BADGE */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              isSolvedInSession
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : isTimerRunning
                ? 'bg-zinc-900/90 border-indigo-500/40 text-white shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
            id="problem-solving-timer-widget"
          >
            <div className="flex items-center gap-1.5">
              <Timer
                className={`w-4 h-4 ${
                  isSolvedInSession
                    ? 'text-emerald-400'
                    : isTimerRunning
                    ? 'text-indigo-400 animate-pulse'
                    : 'text-zinc-500'
                }`}
              />
              <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">Timer:</span>
              <span className="font-mono text-xs font-bold tracking-wider text-emerald-400" id="timer-display-value">
                ⏱️ {formatTimerDigits(timerSeconds)}
              </span>
            </div>

            {/* Timer Controls */}
            {!isSolvedInSession && (
              <div className="flex items-center gap-1 border-l border-zinc-800 pl-2 ml-1">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
                  id="btn-toggle-timer"
                >
                  {isTimerRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                </button>
                <button
                  onClick={handleResetTimer}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset timer"
                  id="btn-reset-timer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}

            {isSolvedInSession && (
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded ml-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Solved
              </span>
            )}
          </div>

          {/* Language selector & reset template */}
          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono font-semibold text-indigo-300 focus:border-indigo-500 outline-none cursor-pointer"
              id="language-select-dropdown"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python 3</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++ 20</option>
            </select>

            <button
              onClick={handleResetCode}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Reset code template to clean function signature"
              id="btn-reset-code-template"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Clipboard Blocking Toast Banner */}
      {clipboardBlockedMessage && (
        <div
          className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg"
          id="clipboard-blocked-banner"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-amber-200">Integrity Protection: </span>
            <span>{clipboardBlockedMessage}</span>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-semibold">
            Manual Typing Required
          </span>
        </div>
      )}

      {/* Main Split-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
        {/* Left Pane: Problem Description, Constraints, Hints, Submissions (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
          {/* Tab Header */}
          <div className="flex items-center gap-1 p-2 bg-zinc-950/60 border-b border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTabLeft('description')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTabLeft === 'description'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              id="tab-problem-description"
            >
              Description
            </button>
            <button
              onClick={() => setActiveTabLeft('submissions')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                activeTabLeft === 'submissions'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              id="tab-problem-submissions"
            >
              <span>Submissions</span>
              <span className="text-[10px] bg-zinc-700 px-1.5 py-0.2 rounded-full font-mono">
                {myProblemSubmissions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTabLeft('hints')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTabLeft === 'hints'
                  ? 'bg-zinc-800 text-white font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              id="tab-problem-hints"
            >
              Hints
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-zinc-300 leading-relaxed">
            {activeTabLeft === 'description' && (
              <>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">{problem.title}</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{problem.description}</p>
                </div>

                {/* Examples */}
                <div className="space-y-3">
                  <div className="font-bold text-white uppercase tracking-wider text-[11px]">Examples</div>
                  {problem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5 font-mono text-xs"
                    >
                      <div className="font-semibold text-zinc-400 font-sans">Example {idx + 1}:</div>
                      <div>
                        <span className="text-zinc-500 font-sans font-semibold">Input: </span>
                        <span className="text-indigo-300">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 font-sans font-semibold">Output: </span>
                        <span className="text-emerald-300">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div>
                          <span className="text-zinc-500 font-sans font-semibold">Explanation: </span>
                          <span className="text-zinc-400 font-sans text-[11px]">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <div className="font-bold text-white uppercase tracking-wider text-[11px]">Constraints</div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 font-mono text-[11px]">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="text-[11px] text-zinc-500 mb-1.5 font-medium">Related Topics & Algorithms</div>
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-[11px] text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTabLeft === 'submissions' && (
              <div className="space-y-3">
                <div className="font-bold text-white text-sm">Your Problem History</div>
                {myProblemSubmissions.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500">
                    No submissions recorded yet for this problem.
                  </div>
                ) : (
                  myProblemSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.status === 'Accepted'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {sub.status}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-900">
                        <div>
                          Runtime: <span className="text-white font-mono">{sub.executionTime}ms</span>
                        </div>
                        <div>
                          Memory: <span className="text-white font-mono">{sub.memory}MB</span>
                        </div>
                        {sub.solvingTimeFormatted && (
                          <div className="col-span-2 text-indigo-300 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>Solving Time: {sub.solvingTimeFormatted}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTabLeft === 'hints' && (
              <div className="space-y-3">
                <div className="font-bold text-white text-sm">Algorithmic Hints</div>
                {problem.solutionHints && problem.solutionHints.length > 0 ? (
                  problem.solutionHints.map((hint, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-200 text-xs">
                      <div className="font-bold text-indigo-400 mb-1">Hint {i + 1}:</div>
                      {hint}
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 rounded-2xl bg-zinc-950/60 text-zinc-400 text-xs">
                    Think about the optimal data structure (e.g. HashMap, Two Pointers, or Frequency Array) to reduce time complexity to O(N).
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor + Testcase Runner / Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Code Editor Container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col flex-1 shadow-xl min-h-[400px]">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-zinc-200 font-semibold">
                  solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'typescript' ? 'ts' : 'js'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                  🚫 Copy/Paste Locked
                </span>
                <span>Auto-save active</span>
              </div>
            </div>

            {/* Code Textarea / Editor with Event-Level Protection */}
            <div
              className="relative flex-1 p-4 bg-zinc-950 font-mono text-xs select-none"
              onCopy={(e) => {
                e.preventDefault();
                handleBlockedAction('Copying');
              }}
              onPaste={(e) => {
                e.preventDefault();
                handleBlockedAction('Pasting');
              }}
              onCut={(e) => {
                e.preventDefault();
                handleBlockedAction('Cutting');
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                handleBlockedAction('Right-click context menu');
              }}
              onDragStart={(e) => e.preventDefault()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleBlockedAction('Drag-and-drop insertion');
              }}
            >
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onCopy={(e) => {
                  e.preventDefault();
                  handleBlockedAction('Copying');
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  handleBlockedAction('Pasting');
                }}
                onCut={(e) => {
                  e.preventDefault();
                  handleBlockedAction('Cutting');
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleBlockedAction('Right-click context menu');
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleBlockedAction('Drag-and-drop insertion');
                }}
                placeholder="// Write your solution here... (Copy/Paste disabled)"
                spellCheck={false}
                className="w-full h-full min-h-[320px] bg-transparent text-emerald-300 font-mono text-xs outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
                id="code-editor-textarea"
              />
            </div>

            {/* Action Bar (Run & Submit) */}
            <div className="p-3 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between gap-3">
              <div className="text-[11px] text-zinc-500 font-mono">
                Line {code.split('\n').length}, Col {code.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  id="btn-run-code"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  id="btn-submit-code"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Console / Testcase Output Pane */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden p-4 shadow-xl">
            {/* Header Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveBottomTab('testcase')}
                  className={`font-bold transition-colors cursor-pointer ${
                    activeBottomTab === 'testcase' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="tab-bottom-testcase"
                >
                  Testcases
                </button>
                <span className="text-zinc-700">•</span>
                <button
                  onClick={() => setActiveBottomTab('result')}
                  className={`font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    activeBottomTab === 'result' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="tab-bottom-result"
                >
                  <span>Result / Output</span>
                  {runResult && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        runResult.status === 'Accepted' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  )}
                </button>
              </div>

              {runResult && (
                <div className="text-[11px] font-mono font-semibold">
                  <span
                    className={
                      runResult.status === 'Accepted'
                        ? 'text-emerald-400 font-bold'
                        : 'text-rose-400 font-bold'
                    }
                  >
                    {runResult.status}
                  </span>
                  <span className="text-zinc-500 ml-2">
                    ({runResult.executionTime}ms, {runResult.memory}MB)
                  </span>
                </div>
              )}
            </div>

            {/* Testcases Tab */}
            {activeBottomTab === 'testcase' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {problem.testCases.map((tc, idx) => (
                    <button
                      key={tc.id}
                      onClick={() => setSelectedTestCaseIdx(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedTestCaseIdx === idx
                          ? 'bg-zinc-800 text-white font-bold shadow-sm'
                          : 'bg-zinc-950/60 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 font-mono text-xs space-y-2">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Input</span>
                    <div className="text-indigo-300 bg-zinc-900/60 p-2 rounded-lg mt-1">
                      {problem.testCases[selectedTestCaseIdx]?.input}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-bold">Expected Output</span>
                    <div className="text-emerald-300 bg-zinc-900/60 p-2 rounded-lg mt-1">
                      {problem.testCases[selectedTestCaseIdx]?.expectedOutput}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Result Tab */}
            {activeBottomTab === 'result' && (
              <div>
                {!runResult ? (
                  <div className="text-center py-6 text-xs text-zinc-500 font-mono">
                    Click "Run Code" or "Submit Solution" to inspect compiler evaluation and test outputs.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`p-3.5 rounded-2xl flex items-center justify-between ${
                        runResult.status === 'Accepted'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {runResult.status === 'Accepted' ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-sm flex items-center gap-2">
                            <span>{runResult.status}</span>
                            {runResult.status === 'Accepted' && (
                              <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Award className="w-3 h-3 text-emerald-400" />
                                Solved in {formatReadableDuration(timerSeconds)}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] opacity-80 mt-0.5">
                            Passed {runResult.passedCount} of {runResult.totalCount} test cases
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <div>{runResult.executionTime} ms</div>
                        <div className="text-[10px] opacity-75">{runResult.memory} MB</div>
                      </div>
                    </div>

                    {/* Output details */}
                    {runResult.testResults && runResult.testResults.length > 0 && (
                      <div className="space-y-2">
                        {runResult.testResults.map((tr, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-zinc-950 font-mono text-xs border border-zinc-800/80 space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-zinc-400">Testcase {i + 1}</span>
                              <span
                                className={
                                  tr.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                                }
                              >
                                {tr.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                            <div className="text-zinc-500 text-[10px]">Input: {tr.input}</div>
                            <div className="text-zinc-400 text-[10px]">Output: {tr.actualOutput}</div>
                            {!tr.passed && (
                              <div className="text-emerald-400 text-[10px]">Expected: {tr.expectedOutput}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {runResult.errorMessage && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-xs">
                        {runResult.errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
