export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isAdmin?: boolean;
  isOwner?: boolean;
  avatar: string;
  title?: string;
  bio?: string;
  streak: number;
  longestStreak?: number;
  lastLogin?: string; // ISO string
  lastActive: string; // ISO string
  createdAt: string;
  schoolOrOrg?: string;
  rank?: number;
  solvedCount: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  };
  totalSubmissions: number;
  acceptedSubmissions: number;
}

export interface LoginHistoryRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  loginDate: string; // YYYY-MM-DD
  loginTime: string; // HH:mm:ss
  lastLogin: string; // ISO string
  lastActive: string; // ISO string
}

export interface ExportFilterOptions {
  userRole: 'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN';
  dateRange: 'all' | '7d' | '30d' | '90d' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  activityStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
  includeSheets: {
    allUsers: boolean;
    loginHistory: boolean;
    students: boolean;
    teachers: boolean;
    admins: boolean;
  };
}

export interface ExportPreviewStats {
  totalUsers: number;
  studentsCount: number;
  teachersCount: number;
  adminsCount: number;
  loginHistoryCount: number;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemCategory =
  | 'Arrays'
  | 'Strings'
  | 'Hashing'
  | 'Arrays & Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Binary Search'
  | 'Sorting'
  | 'Linked Lists'
  | 'Linked List'
  | 'Stack'
  | 'Queue'
  | 'Recursion'
  | 'Backtracking'
  | 'Trees'
  | 'Binary Trees'
  | 'Binary Search Trees'
  | 'Heap / Priority Queue'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Greedy'
  | 'Bit Manipulation'
  | 'Math'
  | 'Math & Geometry'
  | 'Matrix'
  | 'Trie'
  | 'Tries'
  | 'Union Find'
  | 'Segment Tree'
  | 'Advanced Data Structures'
  | 'Design Problems'
  | string;

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  explanation?: string;
}

export interface CodeTemplate {
  javascript: string;
  typescript: string;
  python: string;
  java: string;
  cpp: string;
}

export interface Problem {
  id: string;
  problemNumber?: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: ProblemCategory;
  description: string;
  constraints: string[];
  inputFormat?: string;
  outputFormat?: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: CodeTemplate;
  testCases: TestCase[];
  solutionHints: string[];
  acceptanceRate: number; // e.g. 78.4
  tags: string[];
  totalAttempts: number;
  totalAccepted: number;
  supportedLanguages?: ('javascript' | 'typescript' | 'python' | 'java' | 'cpp')[];
  functionSignature?: string;
  timeLimit?: number; // ms
  memoryLimit?: number; // MB
}

export type SubmissionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Runtime Error'
  | 'Compile Error';

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: Difficulty;
  language: 'javascript' | 'typescript' | 'python' | 'java' | 'cpp';
  code: string;
  status: SubmissionStatus;
  executionTime: number; // ms
  memory: number; // MB
  passedCount: number;
  totalCount: number;
  submittedAt: string; // ISO string
  assignmentId?: string;
  errorMessage?: string;
  inputReceived?: string;
  outputReceived?: string;
  expectedOutput?: string;
  solvingTimeSeconds?: number;
  solvingTimeFormatted?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherEmail: string;
  joinCode: string;
  createdAt: string;
  iconColor: string; // Tailwind color string, e.g., 'from-blue-500 to-indigo-600'
  bannerEmoji: string;
  subject: string;
  academicYear?: string;
}

export interface ClassMember {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  joinedAt: string;
  // Dynamic or pre-computed progress for this specific class
  solvedInClassCount?: number;
  completedAssignmentsCount?: number;
  totalClassAssignmentsCount?: number;
}

export interface AssignmentProblem {
  id: string;
  assignmentId: string;
  problemId: string;
  problemTitle: string;
  difficulty: Difficulty;
  category: ProblemCategory;
}

export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';

export interface Assignment {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  problemIds: string[];
  startDate: string; // ISO date string
  deadline: string; // ISO date string
  createdAt: string;
  weightage?: number; // points/marks
}

export interface AssignmentStudentStatus {
  assignmentId: string;
  studentId: string;
  completedProblemIds: string[];
  status: AssignmentStatus;
  progressPercent: number;
  lastUpdated: string;
}

export type NotificationType =
  | 'announcement'
  | 'assignment'
  | 'deadline'
  | 'overdue'
  | 'challenge'
  | 'badge'
  | 'goal'
  | 'student_joined'
  | 'inactivity'
  | 'assignment_complete'
  | 'student_achievement'
  | 'info'
  | 'success'
  | 'warning'
  | 'alert'
  | 'class';

export interface NotificationLink {
  tab: 'dashboard' | 'classes' | 'class-detail' | 'problems' | 'problem-solve' | 'assignments' | 'students' | 'analytics' | 'progress' | 'leaderboard';
  classId?: string;
  assignmentId?: string;
  problemId?: string;
}

export interface Notification {
  id: string;
  userId: string; // recipient
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string; // ISO string
  linkAction?: string;
  link?: NotificationLink;
  dedupeKey?: string;
  meta?: Record<string, unknown>;
}

// Student & Teacher Progress Insights (Feature 1)
export type StudentInsightType =
  | 'improving'
  | 'dropped'
  | 'consistency'
  | 'topic_mastery'
  | 'milestone'
  | 'accuracy';

export interface StudentProgressInsight {
  id: string;
  studentId: string;
  type: StudentInsightType;
  title: string;
  message: string;
  metricDelta?: string;
  tag: string;
  icon: string;
  color: string;
  level: 'positive' | 'warning' | 'info';
  timestamp: string;
  metricValue?: number | string;
}

export type TeacherInsightType =
  | 'activity_surge'
  | 'activity_drop'
  | 'weak_topic_improved'
  | 'inactive'
  | 'milestone_reached';

export interface TeacherClassInsight {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  classId: string;
  className: string;
  type: TeacherInsightType;
  title: string;
  message: string;
  tag: string;
  icon: string;
  color: string;
  severity: 'positive' | 'warning' | 'high' | 'info';
  detectedAt: string;
  metricDelta?: string;
}

// Advanced Class Analytics (Feature 2)
export type AnalyticsTimeframe = '7d' | '30d' | 'all';

export interface TopicPerformanceStat {
  category: ProblemCategory;
  solvedCount: number;
  attemptedCount: number;
  totalAvailable: number;
  accuracyRate: number; // 0-100%
  studentsCount: number;
}

export interface ClassAnalyticsSummary {
  timeframe: AnalyticsTimeframe;
  classId?: string;
  className?: string;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalProblemsSolved: number;
  averageProblemsSolved: number;
  averageAcceptanceRate: number;
  averageAssignmentCompletion: number;
  mostActiveStudent?: {
    student: User;
    solvedCount: number;
    streak: number;
  };
  mostImprovedStudent?: {
    student: User;
    deltaPercentage: number;
    currentSolved: number;
    previousSolved: number;
  };
  activityOverTime: {
    date: string;
    label: string;
    activeStudents: number;
    submissions: number;
    accepted: number;
  }[];
  problemsSolvedOverTime: {
    date: string;
    label: string;
    problemsSolved: number;
    cumulativeSolved: number;
  }[];
  assignmentCompletionStats: {
    name: string;
    count: number;
    percent: number;
    color: string;
  }[];
  difficultyDistribution: {
    name: string;
    solved: number;
    accuracy: number;
    color: string;
  }[];
  topicPerformance: TopicPerformanceStat[];
  insights: TeacherClassInsight[];
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface StudentMetrics {
  student: User;
  classMemberSince: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  streak: number;
  lastActive: string;
  assignmentCompletionRate: number;
  overallProgressScore: number; // 0-100
  needsAttention: boolean;
  needsAttentionReason?: string;
  badge?: '🔥 On Fire' | '⚡ Active Now' | '🏆 Top Performer' | '💀 Needs Attention' | '🎯 Goal Reached' | '🚀 Keep Grinding';
  recentSubmissions: Submission[];
}

export interface Announcement {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherEmail: string;
  title: string;
  message: string;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  pinned?: boolean;
}

export type PerformanceAlertType = 'inactive' | 'low-progress' | 'missed-assignment' | 'low-acceptance';

export interface PerformanceAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentEmail: string;
  classId: string;
  className: string;
  type: PerformanceAlertType;
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  metricValue?: string | number;
  detectedAt: string;
}

export type AchievementCategory = 'streak' | 'solved_count' | 'assignment' | 'accuracy';

export interface StudentAchievement {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  studentEmail: string;
  classId?: string;
  className?: string;
  category: AchievementCategory;
  title: string;
  badgeLabel: string;
  message: string;
  badgeIcon: string;
  badgeColor: string;
  achievedAt: string;
  metricValue?: string | number;
}

// Feature 1: Class Leaderboard
export type LeaderboardTimeframe = 'all-time' | 'month' | 'week';

export interface ClassLeaderboardEntry {
  rank: number;
  student: User;
  problemsSolved: number;
  streak: number;
  assignmentCompletion: number; // percentage (0-100)
  completedAssignmentsCount: number;
  totalAssignmentsCount: number;
  recentActivity: string; // ISO string of latest submission or lastActive
  acceptanceRate: number;
  points: number;
}

// Feature 2: Weekly Challenge
export interface WeeklyChallenge {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  problemIds: string[];
  startDate: string; // ISO string
  endDate: string; // ISO string
  createdAt: string; // ISO string
  updatedAt?: string;
}

export interface WeeklyChallengeParticipant {
  student: User;
  completedProblemIds: string[];
  completedCount: number;
  totalCount: number;
  isCompleted: boolean;
  completionTime?: string; // ISO string when last problem completed
  lastActiveAt?: string;
  rank?: number;
}

// Feature 3: Student Goal System
export type GoalType = 'daily' | 'weekly' | 'monthly';

export interface StudentGoal {
  id: string;
  studentId: string;
  type: GoalType;
  title?: string;
  targetCount: number; // e.g. 2, 10, 30 problems
  createdAt: string; // ISO string
  updatedAt?: string;
  periodStart: string; // ISO string
  periodEnd: string; // ISO string
}

export interface StudentGoalWithProgress extends StudentGoal {
  currentProgress: number;
  isCompleted: boolean;
  progressPercent: number;
  motivationalMessage: string;
  status: 'active' | 'completed' | 'expired';
}
