import { Problem, User, ClassRoom, ClassMember, Assignment, Submission, Notification, Announcement, WeeklyChallenge, StudentGoal } from '../types';
import { MASTER_PROBLEM_BANK } from './problemBank';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Platform Administrator',
    email: 'admin@algoclass.io',
    password: 'adminpassword123',
    role: 'ADMIN',
    isAdmin: true,
    isOwner: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Platform Administrator & System Owner',
    bio: 'Root platform administrator with system management and data governance authorizations.',
    streak: 64,
    longestStreak: 82,
    lastLogin: new Date(Date.now() - 600000).toISOString(),
    lastActive: new Date().toISOString(),
    createdAt: '2025-01-01T00:00:00.000Z',
    schoolOrOrg: 'AlgoClass HQ',
    solvedCount: { total: 540, easy: 220, medium: 240, hard: 80 },
    totalSubmissions: 780,
    acceptedSubmissions: 730,
  },
  {
    id: 'teacher-1',
    name: 'Prof. Sarah Mitchell',
    email: 'sarah.mitchell@stanford.edu',
    password: 'password123',
    role: 'TEACHER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Associate Professor of Computer Science',
    bio: 'Instructor for CS106B & Advanced Data Structures. Passionate about algorithmic problem solving and competitive programming.',
    streak: 42,
    longestStreak: 56,
    lastLogin: new Date(Date.now() - 1200000).toISOString(),
    lastActive: new Date().toISOString(),
    createdAt: '2025-08-15T00:00:00.000Z',
    schoolOrOrg: 'Stanford University',
    solvedCount: { total: 420, easy: 180, medium: 190, hard: 50 },
    totalSubmissions: 680,
    acceptedSubmissions: 610,
  },
  {
    id: 'teacher-2',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@techinst.edu',
    password: 'password123',
    role: 'TEACHER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Lead DSA Instructor & Ex-FAANG SWE',
    bio: 'Teaching DSA Batch A, Java Full-stack and Placement Preparation bootcamps for 2026 batches.',
    streak: 28,
    longestStreak: 35,
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    createdAt: '2025-09-01T00:00:00.000Z',
    schoolOrOrg: 'Tech Institute of Technology',
    solvedCount: { total: 350, easy: 140, medium: 160, hard: 50 },
    totalSubmissions: 510,
    acceptedSubmissions: 480,
  },
  {
    id: 'student-1',
    name: 'Alex Chen',
    email: 'alex.chen@student.edu',
    password: 'password123',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    title: 'Sophomore CS Major',
    bio: 'Grinding LeetCode daily for summer 2026 tech internships! Target: 300 problems solved.',
    streak: 15,
    longestStreak: 24,
    lastLogin: new Date(Date.now() - 180000).toISOString(),
    lastActive: new Date().toISOString(),
    createdAt: '2025-10-01T00:00:00.000Z',
    schoolOrOrg: 'Tech Institute of Technology',
    rank: 1,
    solvedCount: { total: 48, easy: 24, medium: 20, hard: 4 },
    totalSubmissions: 86,
    acceptedSubmissions: 64,
  },
  {
    id: 'student-2',
    name: 'Maya Patel',
    email: 'maya.patel@student.edu',
    password: 'password123',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    title: 'Junior SWE Enthusiast',
    bio: 'Algorithms nerd. Two Pointers & Graph theory lover. Always ready for a virtual contest!',
    streak: 9,
    longestStreak: 18,
    lastLogin: new Date(Date.now() - 1800000).toISOString(),
    lastActive: new Date(Date.now() - 1800000).toISOString(),
    createdAt: '2025-10-05T00:00:00.000Z',
    schoolOrOrg: 'Tech Institute of Technology',
    rank: 2,
    solvedCount: { total: 39, easy: 20, medium: 16, hard: 3 },
    totalSubmissions: 68,
    acceptedSubmissions: 52,
  },
  {
    id: 'student-3',
    name: 'Liam Smith',
    email: 'liam.smith@student.edu',
    password: 'password123',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Freshman CS Student',
    bio: 'Learning Data Structures step by step. Focused on Arrays, Strings, and recursion.',
    streak: 5,
    longestStreak: 12,
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    lastActive: new Date(Date.now() - 7200000).toISOString(),
    createdAt: '2025-11-01T00:00:00.000Z',
    schoolOrOrg: 'Tech Institute of Technology',
    rank: 3,
    solvedCount: { total: 22, easy: 16, medium: 6, hard: 0 },
    totalSubmissions: 45,
    acceptedSubmissions: 28,
  },
  {
    id: 'student-4',
    name: 'Emily Wang',
    email: 'emily.wang@student.edu',
    password: 'password123',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Senior CS & Math',
    bio: 'Competitive programmer, preparing for technical interviews and ICPC regionals.',
    streak: 21,
    longestStreak: 30,
    lastLogin: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastActive: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: '2025-09-15T00:00:00.000Z',
    schoolOrOrg: 'Tech Institute of Technology',
    rank: 4,
    solvedCount: { total: 54, easy: 26, medium: 22, hard: 6 },
    totalSubmissions: 92,
    acceptedSubmissions: 74,
  },
  {
    id: 'student-5',
    name: 'Jordan Miller',
    email: 'jordan.m@student.edu',
    password: 'password123',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Sophomore CS',
    bio: 'Catching up on coursework. Need to stay consistent with DSA assignments.',
    streak: 0,
    longestStreak: 6,
    lastLogin: new Date(Date.now() - 86400000 * 8).toISOString(),
    lastActive: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago (Trigger Inactive alert)
    createdAt: '2025-11-10T00:00:00.000Z',
    schoolOrOrg: 'Tech Institute of Technology',
    rank: 5,
    solvedCount: { total: 4, easy: 4, medium: 0, hard: 0 },
    totalSubmissions: 18,
    acceptedSubmissions: 5,
  },
  {
    id: 'student-6',
    name: 'Devon Vance',
    email: 'devon.vance@student.edu',
    password: 'password123',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    title: 'Junior CSE',
    bio: 'Behind on recent assignment submissions. Working on catching up this weekend.',
    streak: 1,
    longestStreak: 8,
    lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastActive: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: '2025-11-12T00:00:00.000Z',
    schoolOrOrg: 'Tech Institute of Technology',
    rank: 6,
    solvedCount: { total: 7, easy: 6, medium: 1, hard: 0 },
    totalSubmissions: 25,
    acceptedSubmissions: 9,
  }
];

export const INITIAL_PROBLEMS: Problem[] = MASTER_PROBLEM_BANK;

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'class-1',
    name: 'DSA Batch A',
    description: 'Comprehensive Data Structures & Algorithms training focusing on LeetCode patterns, interview readiness, and optimal complexity.',
    teacherId: 'teacher-2',
    teacherName: 'Rahul Sharma',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teacherEmail: 'rahul.sharma@techinst.edu',
    joinCode: 'DSA-2026-X7',
    createdAt: '2026-01-10T09:00:00.000Z',
    iconColor: 'from-blue-600 to-indigo-600',
    bannerEmoji: '⚡',
    subject: 'Data Structures & Algorithms',
    academicYear: 'Spring 2026'
  },
  {
    id: 'class-2',
    name: 'CSE 2026 Placement Prep',
    description: 'Intensive coding bootcamp targeting tier-1 tech company online assessments and technical interviews.',
    teacherId: 'teacher-2',
    teacherName: 'Rahul Sharma',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teacherEmail: 'rahul.sharma@techinst.edu',
    joinCode: 'CSE-2026-PL',
    createdAt: '2026-01-15T11:30:00.000Z',
    iconColor: 'from-purple-600 to-pink-600',
    bannerEmoji: '🎯',
    subject: 'Competitive Programming & Placement Prep',
    academicYear: '2025-2026'
  },
  {
    id: 'class-3',
    name: 'CS106B Advanced DSA',
    description: 'Stanford CS curriculum coverage: Dynamic Programming, Graph Algorithms, and Advanced Trees.',
    teacherId: 'teacher-1',
    teacherName: 'Prof. Sarah Mitchell',
    teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    teacherEmail: 'sarah.mitchell@stanford.edu',
    joinCode: 'STAN-106B-9K',
    createdAt: '2026-01-05T08:00:00.000Z',
    iconColor: 'from-emerald-600 to-teal-600',
    bannerEmoji: '🌲',
    subject: 'Computer Science',
    academicYear: 'Winter 2026'
  }
];

export const INITIAL_MEMBERS: ClassMember[] = [
  {
    id: 'mem-1',
    classId: 'class-1',
    studentId: 'student-1',
    studentName: 'Alex Chen',
    studentEmail: 'alex.chen@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-01-11T10:00:00.000Z'
  },
  {
    id: 'mem-2',
    classId: 'class-1',
    studentId: 'student-2',
    studentName: 'Maya Patel',
    studentEmail: 'maya.patel@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-01-11T11:20:00.000Z'
  },
  {
    id: 'mem-3',
    classId: 'class-1',
    studentId: 'student-3',
    studentName: 'Liam Smith',
    studentEmail: 'liam.smith@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-01-12T14:00:00.000Z'
  },
  {
    id: 'mem-4',
    classId: 'class-1',
    studentId: 'student-4',
    studentName: 'Emily Wang',
    studentEmail: 'emily.wang@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-01-11T09:30:00.000Z'
  },
  {
    id: 'mem-5',
    classId: 'class-1',
    studentId: 'student-5',
    studentName: 'Jordan Miller',
    studentEmail: 'jordan.m@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-01-14T16:00:00.000Z'
  },
  {
    id: 'mem-6',
    classId: 'class-1',
    studentId: 'student-6',
    studentName: 'Devon Vance',
    studentEmail: 'devon.vance@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'mem-7',
    classId: 'class-2',
    studentId: 'student-1',
    studentName: 'Alex Chen',
    studentEmail: 'alex.chen@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-01-16T12:00:00.000Z'
  },
  {
    id: 'mem-8',
    classId: 'class-2',
    studentId: 'student-4',
    studentName: 'Emily Wang',
    studentEmail: 'emily.wang@student.edu',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-01-16T13:00:00.000Z'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asgn-1',
    classId: 'class-1',
    className: 'DSA Batch A',
    teacherId: 'teacher-2',
    teacherName: 'Rahul Sharma',
    title: 'Array & Hash Map Fundamentals',
    description: 'Master foundational array manipulation, hash map lookups, and frequency counter patterns with optimal time complexities.',
    problemIds: ['prob-1', 'prob-3', 'prob-4'],
    startDate: '2026-08-18T00:00:00.000Z',
    deadline: '2026-08-28T23:59:59.000Z',
    createdAt: '2026-08-18T08:00:00.000Z',
    weightage: 100
  },
  {
    id: 'asgn-2',
    classId: 'class-1',
    className: 'DSA Batch A',
    teacherId: 'teacher-2',
    teacherName: 'Rahul Sharma',
    title: 'Two Pointers & Sliding Window Blitz',
    description: 'Solve core algorithmic questions using two-pointer paradigms and expanding/contracting sliding windows.',
    problemIds: ['prob-5', 'prob-6'],
    startDate: '2026-08-20T00:00:00.000Z',
    deadline: '2026-08-30T23:59:59.000Z',
    createdAt: '2026-08-20T10:00:00.000Z',
    weightage: 100
  },
  {
    id: 'asgn-3',
    classId: 'class-1',
    className: 'DSA Batch A',
    teacherId: 'teacher-2',
    teacherName: 'Rahul Sharma',
    title: 'Dynamic Programming Introduction',
    description: 'Identify overlapping subproblems and optimal substructures. Implement state transitions for 1D DP.',
    problemIds: ['prob-7', 'prob-8'],
    startDate: '2026-08-22T00:00:00.000Z',
    deadline: '2026-09-05T23:59:59.000Z',
    createdAt: '2026-08-22T09:00:00.000Z',
    weightage: 100
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    studentId: 'student-1',
    studentName: 'Alex Chen',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    problemId: 'prob-1',
    problemTitle: 'Two Sum',
    problemDifficulty: 'Easy',
    language: 'javascript',
    code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) return [map.get(comp), i];
    map.set(nums[i], i);
  }
  return [];
}`,
    status: 'Accepted',
    executionTime: 52,
    memory: 42.1,
    passedCount: 4,
    totalCount: 4,
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'sub-2',
    studentId: 'student-1',
    studentName: 'Alex Chen',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    problemId: 'prob-3',
    problemTitle: 'Contains Duplicate',
    problemDifficulty: 'Easy',
    language: 'javascript',
    code: `function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}`,
    status: 'Accepted',
    executionTime: 48,
    memory: 44.5,
    passedCount: 3,
    totalCount: 3,
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'sub-3',
    studentId: 'student-2',
    studentName: 'Maya Patel',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    problemId: 'prob-1',
    problemTitle: 'Two Sum',
    problemDifficulty: 'Easy',
    language: 'python',
    code: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in seen: return [seen[diff], i]
            seen[n] = i
        return []`,
    status: 'Accepted',
    executionTime: 38,
    memory: 17.2,
    passedCount: 4,
    totalCount: 4,
    submittedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'sub-4',
    studentId: 'student-2',
    studentName: 'Maya Patel',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    problemId: 'prob-5',
    problemTitle: '3Sum',
    problemDifficulty: 'Medium',
    language: 'python',
    code: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res = []
        for i in range(len(nums)-2):
            if i > 0 and nums[i] == nums[i-1]: continue
            l, r = i+1, len(nums)-1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s == 0:
                    res.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l+1]: l += 1
                    while l < r and nums[r] == nums[r-1]: r -= 1
                    l += 1; r -= 1
                elif s < 0: l += 1
                else: r -= 1
        return res`,
    status: 'Accepted',
    executionTime: 120,
    memory: 19.4,
    passedCount: 3,
    totalCount: 3,
    submittedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'sub-5',
    studentId: 'student-4',
    studentName: 'Emily Wang',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    problemId: 'prob-9',
    problemTitle: 'Trapping Rain Water',
    problemDifficulty: 'Hard',
    language: 'javascript',
    code: `function trap(height) {
  let l = 0, r = height.length - 1, lMax = 0, rMax = 0, total = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      if (height[l] >= lMax) lMax = height[l];
      else total += lMax - height[l];
      l++;
    } else {
      if (height[r] >= rMax) rMax = height[r];
      else total += rMax - height[r];
      r--;
    }
  }
  return total;
}`,
    status: 'Accepted',
    executionTime: 58,
    memory: 43.8,
    passedCount: 2,
    totalCount: 2,
    submittedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'sub-6',
    studentId: 'student-3',
    studentName: 'Liam Smith',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    problemId: 'prob-2',
    problemTitle: 'Valid Parentheses',
    problemDifficulty: 'Easy',
    language: 'javascript',
    code: `function isValid(s) {
  return s.length % 2 === 0;
}`,
    status: 'Wrong Answer',
    executionTime: 45,
    memory: 41.2,
    passedCount: 2,
    totalCount: 4,
    submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    inputReceived: '"(]"',
    outputReceived: 'true',
    expectedOutput: 'false'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'teacher-2',
    title: 'Student Joined DSA Batch A',
    message: 'Emily Wang joined your class with code DSA-2026-X7.',
    type: 'class',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'teacher-2',
    title: 'Assignment Progress Update',
    message: 'Alex Chen completed all 3 problems for "Array & Hash Map Fundamentals".',
    type: 'assignment',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'notif-3',
    userId: 'teacher-2',
    title: 'Student Inactivity Alert',
    message: 'Jordan Miller has had no submissions or logins in the last 8 days.',
    type: 'alert',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'notif-4',
    userId: 'student-1',
    title: 'New Assignment Assigned',
    message: 'Rahul Sharma assigned "Dynamic Programming Introduction" in DSA Batch A (Due Sep 5).',
    type: 'assignment',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'notif-5',
    userId: 'student-1',
    title: 'Streak Milestone! 🔥',
    message: 'You reached a 15-day coding streak. Keep grinding!',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    classId: 'class-1',
    className: 'DSA Batch A',
    teacherId: 'teacher-2',
    teacherName: 'Rahul Sharma',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teacherEmail: 'rahul.sharma@techinst.edu',
    title: '🚀 Welcome to DSA Batch A - Week 1 Plan & Roadmap',
    message: 'Welcome everyone to our Data Structures & Algorithms cohort! Please review the starter problem set under Assignments. We will focus on Two-Pointer patterns and Hash Maps during this week.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    pinned: true
  },
  {
    id: 'ann-2',
    classId: 'class-1',
    className: 'DSA Batch A',
    teacherId: 'teacher-2',
    teacherName: 'Rahul Sharma',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    teacherEmail: 'rahul.sharma@techinst.edu',
    title: '⏰ Reminder: Array & Hash Map Assignment Deadline in 3 Days',
    message: 'Friendly reminder that the Array & Hash Map Fundamentals assignment submission window closes on August 28th. Aim to get all 3 test cases passing with O(n) runtime complexity.',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    pinned: false
  },
  {
    id: 'ann-3',
    classId: 'class-2',
    className: 'Competitive Programming League',
    teacherId: 'teacher-1',
    teacherName: 'Prof. Sarah Mitchell',
    teacherAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    teacherEmail: 'sarah.mitchell@stanford.edu',
    title: '🏆 Weekly Contest #4 Results & Solution Editorial',
    message: 'Great job to everyone who participated in this weekend contest! The editorial for the Hard problem "Trapping Rain Water" is now published. Check the problem hints if you were stuck.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    pinned: true
  }
];

export const INITIAL_WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'wc-1',
    classId: 'class-1',
    className: 'DSA Batch A',
    teacherId: 'teacher-2',
    teacherName: 'Rahul Sharma',
    title: 'Array Speed Run',
    description: 'Master fast array manipulation, two-pointer lookups, and frequency caching in this 5-problem sprint.',
    problemIds: ['problem-1', 'problem-3', 'problem-4', 'problem-2', 'problem-5'],
    startDate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    endDate: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days remaining
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'wc-2',
    classId: 'class-2',
    className: 'Competitive Programming League',
    teacherId: 'teacher-1',
    teacherName: 'Prof. Sarah Mitchell',
    title: 'Dynamic & Binary Search Sprint',
    description: 'Solve optimal interval and subarray problems with strict logarithmic and memoized time limits.',
    problemIds: ['problem-6', 'problem-8', 'problem-9'],
    startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'wc-3',
    classId: 'class-1',
    className: 'DSA Batch A',
    teacherId: 'teacher-2',
    teacherName: 'Rahul Sharma',
    title: 'Warm-up Recursion Rush (Week 1)',
    description: 'Foundational challenge testing recursion tree thinking and basic data structures.',
    problemIds: ['problem-1', 'problem-2', 'problem-3'],
    startDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    endDate: new Date(Date.now() - 86400000 * 3).toISOString(), // ended
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

export const INITIAL_STUDENT_GOALS: StudentGoal[] = [
  {
    id: 'goal-1',
    studentId: 'student-1',
    type: 'daily',
    title: 'Daily Algorithm Practice',
    targetCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    periodStart: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    periodEnd: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
  },
  {
    id: 'goal-2',
    studentId: 'student-1',
    type: 'weekly',
    title: 'Weekly Grind Master',
    targetCount: 10,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    periodStart: new Date(Date.now() - 86400000 * 3).toISOString(),
    periodEnd: new Date(Date.now() + 86400000 * 4).toISOString()
  },
  {
    id: 'goal-3',
    studentId: 'student-1',
    type: 'monthly',
    title: 'Monthly DSA Sprint',
    targetCount: 30,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString()
  },
  {
    id: 'goal-4',
    studentId: 'student-2',
    type: 'weekly',
    title: 'Two Pointers & Graphs',
    targetCount: 8,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    periodStart: new Date(Date.now() - 86400000 * 2).toISOString(),
    periodEnd: new Date(Date.now() + 86400000 * 5).toISOString()
  },
  {
    id: 'goal-5',
    studentId: 'student-3',
    type: 'daily',
    title: 'Consistency Routine',
    targetCount: 1,
    createdAt: new Date().toISOString(),
    periodStart: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    periodEnd: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
  }
];
