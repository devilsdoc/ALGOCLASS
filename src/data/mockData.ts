import {
  Problem,
  User,
  ClassRoom,
  ClassMember,
  Assignment,
  Submission,
  Notification,
  Announcement,
  WeeklyChallenge,
  StudentGoal,
  LoginHistoryRecord
} from '../types';
import { MASTER_PROBLEM_BANK } from './problemBank';
import { getDefaultAvatar } from '../utils/avatar';

// The single exclusive Platform Administrator account
export const PRIMARY_ADMIN_USER: User = {
  id: 'admin-1',
  name: 'Nagare Manish',
  email: 'manishnagare258@gmail.com',
  password: 'M@nii2101',
  role: 'ADMIN',
  isAdmin: true,
  isOwner: true,
  avatar: getDefaultAvatar('Nagare Manish'),
  title: 'Platform Administrator',
  schoolOrOrg: 'Platform Administration',
  bio: 'Platform Owner & Primary System Administrator.',
  streak: 1,
  longestStreak: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  lastActive: new Date().toISOString(),
  solvedCount: { total: 0, easy: 0, medium: 0, hard: 0 },
  totalSubmissions: 0,
  acceptedSubmissions: 0
};

// Initial users list containing ONLY the one designated administrator
export const INITIAL_USERS: User[] = [PRIMARY_ADMIN_USER];

// Complete problem bank catalog with rich LeetCode-style algorithmic challenges
export const INITIAL_PROBLEMS: Problem[] = MASTER_PROBLEM_BANK;

// Completely clean relational tables - no dummy/sample records
export const INITIAL_CLASSES: ClassRoom[] = [];
export const INITIAL_MEMBERS: ClassMember[] = [];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_SUBMISSIONS: Submission[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_WEEKLY_CHALLENGES: WeeklyChallenge[] = [];
export const INITIAL_STUDENT_GOALS: StudentGoal[] = [];
export const INITIAL_LOGIN_HISTORY: LoginHistoryRecord[] = [];
