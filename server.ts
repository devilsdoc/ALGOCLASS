import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  User,
  LoginHistoryRecord,
  ClassRoom,
  ClassMember,
  Assignment,
  Submission,
  Notification,
  Announcement,
  WeeklyChallenge,
  StudentGoal,
  Problem
} from './src/types';
import { MASTER_PROBLEM_BANK } from './src/data/problemBank';
import { PRIMARY_ADMIN_USER } from './src/data/mockData';
import { createUnifiedUserRegistration } from './src/services/databaseUtils';

// Production Database Schema
interface DatabaseSchema {
  users: User[];
  loginHistory: LoginHistoryRecord[];
  classes: ClassRoom[];
  members: ClassMember[];
  assignments: Assignment[];
  submissions: Submission[];
  problems: Problem[];
  notifications: Notification[];
  announcements: Announcement[];
  weeklyChallenges: WeeklyChallenge[];
  studentGoals: StudentGoal[];
  lastUpdated: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'production_db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial DB state
function getInitialDbState(): DatabaseSchema {
  return {
    users: [PRIMARY_ADMIN_USER],
    loginHistory: [],
    classes: [],
    members: [],
    assignments: [],
    submissions: [],
    problems: MASTER_PROBLEM_BANK,
    notifications: [],
    announcements: [],
    weeklyChallenges: [],
    studentGoals: [],
    lastUpdated: new Date().toISOString()
  };
}

// Load DB from disk with validation
function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;

      // Ensure designated admin is ALWAYS present and up to date
      let users = Array.isArray(parsed.users) ? parsed.users : [];
      let hasAdmin = false;
      users = users.map((u) => {
        if (u.email.toLowerCase() === PRIMARY_ADMIN_USER.email.toLowerCase() || u.id === PRIMARY_ADMIN_USER.id) {
          hasAdmin = true;
          return {
            ...u,
            id: PRIMARY_ADMIN_USER.id,
            name: PRIMARY_ADMIN_USER.name,
            email: PRIMARY_ADMIN_USER.email,
            password: PRIMARY_ADMIN_USER.password,
            role: 'ADMIN' as const,
            isAdmin: true,
            isOwner: true
          };
        }
        return u;
      });

      if (!hasAdmin) {
        users = [PRIMARY_ADMIN_USER, ...users];
      }

      return {
        users,
        loginHistory: Array.isArray(parsed.loginHistory) ? parsed.loginHistory : [],
        classes: Array.isArray(parsed.classes) ? parsed.classes : [],
        members: Array.isArray(parsed.members) ? parsed.members : [],
        assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
        submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
        problems: Array.isArray(parsed.problems) && parsed.problems.length > 0 ? parsed.problems : MASTER_PROBLEM_BANK,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
        weeklyChallenges: Array.isArray(parsed.weeklyChallenges) ? parsed.weeklyChallenges : [],
        studentGoals: Array.isArray(parsed.studentGoals) ? parsed.studentGoals : [],
        lastUpdated: parsed.lastUpdated || new Date().toISOString()
      };
    }
  } catch (err) {
    console.error('Error reading production database file:', err);
  }

  const fresh = getInitialDbState();
  saveDb(fresh);
  return fresh;
}

// In-memory cache
let inMemoryDb: DatabaseSchema = loadDb();

// Atomic persistent save to disk
function saveDb(data: DatabaseSchema): void {
  try {
    data.lastUpdated = new Date().toISOString();
    inMemoryDb = data;
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving production database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json({ limit: '10mb' }));

  // CORS Headers for multi-origin safety
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ==========================================
  // CENTRAL PRODUCTION REST API ENDPOINTS
  // ==========================================

  // Cache-control middleware for all API routes
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    inMemoryDb = loadDb();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      userCount: inMemoryDb.users.length,
      classCount: inMemoryDb.classes.length,
      lastUpdated: inMemoryDb.lastUpdated
    });
  });

  // 1. FULL SYNC ENDPOINT (GET)
  app.get('/api/sync', (req, res) => {
    inMemoryDb = loadDb();
    res.json(inMemoryDb);
  });

  // 1b. BIDIRECTIONAL SYNC MERGE ENDPOINT (POST)
  app.post('/api/sync', (req, res) => {
    inMemoryDb = loadDb();
    const clientData = req.body as Partial<DatabaseSchema>;
    let hasChanges = false;

    // Merge incoming users
    if (Array.isArray(clientData.users)) {
      clientData.users.forEach((clientUser) => {
        if (!clientUser || !clientUser.email) return;
        const emailTrim = clientUser.email.trim().toLowerCase();
        const existingIdx = inMemoryDb.users.findIndex((u) => u.email.toLowerCase() === emailTrim || u.id === clientUser.id);
        if (existingIdx === -1) {
          // New user to add to server DB
          if (clientUser.role !== 'ADMIN') {
            inMemoryDb.users.push(clientUser);
            hasChanges = true;
          }
        } else {
          // Update existing non-admin user stats
          const existing = inMemoryDb.users[existingIdx];
          if (existing.email.toLowerCase() !== PRIMARY_ADMIN_USER.email.toLowerCase()) {
            inMemoryDb.users[existingIdx] = {
              ...existing,
              ...clientUser,
              id: existing.id,
              role: existing.role
            };
            hasChanges = true;
          }
        }
      });
    }

    // Merge login records
    if (Array.isArray(clientData.loginHistory)) {
      clientData.loginHistory.forEach((rec) => {
        if (!rec || !rec.id) return;
        const exists = inMemoryDb.loginHistory.some((l) => l.id === rec.id);
        if (!exists) {
          inMemoryDb.loginHistory.unshift(rec);
          hasChanges = true;
        }
      });
    }

    // Merge classes
    if (Array.isArray(clientData.classes)) {
      clientData.classes.forEach((cls) => {
        if (!cls || !cls.id) return;
        const exists = inMemoryDb.classes.some((c) => c.id === cls.id);
        if (!exists) {
          inMemoryDb.classes.push(cls);
          hasChanges = true;
        }
      });
    }

    // Merge members
    if (Array.isArray(clientData.members)) {
      clientData.members.forEach((mem) => {
        if (!mem || !mem.id) return;
        const exists = inMemoryDb.members.some((m) => m.id === mem.id);
        if (!exists) {
          inMemoryDb.members.push(mem);
          hasChanges = true;
        }
      });
    }

    if (hasChanges) {
      saveDb(inMemoryDb);
    }

    res.json(inMemoryDb);
  });

  // 2. USERS MANAGEMENT
  app.get('/api/users', (req, res) => {
    inMemoryDb = loadDb();
    res.json(inMemoryDb.users);
  });

  app.get('/api/users/:id', (req, res) => {
    const user = inMemoryDb.users.find((u) => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  });

  // User Registration (Unified Atomic Operation)
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, role, password, schoolOrOrg, avatar, title, bio } = req.body;

      if (!name || !email || !role) {
        res.status(400).json({ success: false, message: 'Name, email, and role are required.' });
        return;
      }

      if (role === 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Administrator registration is restricted. Only the single designated platform administrator (Nagare Manish) is permitted.'
        });
        return;
      }

      const emailTrim = String(email).trim().toLowerCase();
      const existing = inMemoryDb.users.find((u) => u.email.toLowerCase() === emailTrim);
      if (existing) {
        res.status(409).json({ success: false, message: 'An account with this email address already exists. Please log in.' });
        return;
      }

      // Execute unified atomic registration: creates both Auth and User Profile records
      const { user: newUser, loginRecord, authRecord } = createUnifiedUserRegistration({
        name,
        email: emailTrim,
        role,
        password,
        schoolOrOrg,
        avatar,
        title,
        bio
      });

      inMemoryDb.users.push(newUser);
      inMemoryDb.loginHistory.unshift(loginRecord);

      saveDb(inMemoryDb);
      res.status(201).json({
        success: true,
        user: newUser,
        authRecord,
        loginRecord,
        message: 'Account and user profile registered atomically.'
      });
    } catch (err: any) {
      console.error('Registration error in /api/auth/register:', err);
      res.status(400).json({
        success: false,
        message: err?.message || 'Failed to complete user registration.'
      });
    }
  });

  // User Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    const emailTrim = email.trim().toLowerCase();
    const user = inMemoryDb.users.find((u) => u.email.toLowerCase() === emailTrim);

    if (!user) {
      res.status(404).json({ success: false, message: 'Account not found. Please verify your email or sign up.' });
      return;
    }

    if (user.password && password && user.password !== password) {
      res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
      return;
    }

    const now = new Date().toISOString();
    user.lastLogin = now;
    user.lastActive = now;

    // Record login history
    const loginRecord: LoginHistoryRecord = {
      id: `login-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginDate: now.split('T')[0],
      loginTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
      lastLogin: now,
      lastActive: now
    };
    inMemoryDb.loginHistory.unshift(loginRecord);

    // Keep login history bounded to 2000 records
    if (inMemoryDb.loginHistory.length > 2000) {
      inMemoryDb.loginHistory = inMemoryDb.loginHistory.slice(0, 2000);
    }

    saveDb(inMemoryDb);
    res.json({ success: true, user });
  });

  // Update user profile
  app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const index = inMemoryDb.users.findIndex((u) => u.id === userId);

    if (index === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const current = inMemoryDb.users[index];
    const updates = req.body;

    // Disallow altering primary admin identity via public API
    if (current.id === PRIMARY_ADMIN_USER.id) {
      updates.role = 'ADMIN';
      updates.isAdmin = true;
      updates.isOwner = true;
    }

    inMemoryDb.users[index] = {
      ...current,
      ...updates,
      lastActive: new Date().toISOString()
    };

    saveDb(inMemoryDb);
    res.json(inMemoryDb.users[index]);
  });

  // Delete user (Admin only, cannot delete Primary Admin)
  app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    if (userId === PRIMARY_ADMIN_USER.id) {
      res.status(403).json({ success: false, message: 'Cannot delete the platform primary administrator account.' });
      return;
    }

    const initialCount = inMemoryDb.users.length;
    inMemoryDb.users = inMemoryDb.users.filter((u) => u.id !== userId && u.email.toLowerCase() !== PRIMARY_ADMIN_USER.email.toLowerCase());
    inMemoryDb.members = inMemoryDb.members.filter((m) => m.studentId !== userId);
    inMemoryDb.submissions = inMemoryDb.submissions.filter((s) => s.studentId !== userId);
    inMemoryDb.loginHistory = inMemoryDb.loginHistory.filter((l) => l.userId !== userId);

    // Guarantee admin remains
    if (!inMemoryDb.users.some((u) => u.id === PRIMARY_ADMIN_USER.id)) {
      inMemoryDb.users.unshift(PRIMARY_ADMIN_USER);
    }

    saveDb(inMemoryDb);
    res.json({ success: true, deleted: initialCount > inMemoryDb.users.length });
  });

  // Purge all dummy/non-admin users
  app.post('/api/users/purge-dummy', (req, res) => {
    inMemoryDb.users = [PRIMARY_ADMIN_USER];
    inMemoryDb.loginHistory = inMemoryDb.loginHistory.filter((l) => l.userId === PRIMARY_ADMIN_USER.id);
    inMemoryDb.members = [];
    inMemoryDb.submissions = [];
    saveDb(inMemoryDb);
    res.json({ success: true, message: 'All dummy users removed. Only primary administrator retained.', users: inMemoryDb.users });
  });

  // 3. LOGIN HISTORY
  app.get('/api/login-history', (req, res) => {
    res.json(inMemoryDb.loginHistory);
  });

  // 4. CLASSROOMS
  app.get('/api/classes', (req, res) => {
    res.json(inMemoryDb.classes);
  });

  app.post('/api/classes', (req, res) => {
    const classData = req.body;
    if (!classData.id) {
      classData.id = `class-${Date.now()}`;
    }
    inMemoryDb.classes.unshift(classData);
    saveDb(inMemoryDb);
    res.status(201).json(classData);
  });

  app.delete('/api/classes/:id', (req, res) => {
    const classId = req.params.id;
    inMemoryDb.classes = inMemoryDb.classes.filter((c) => c.id !== classId);
    inMemoryDb.members = inMemoryDb.members.filter((m) => m.classId !== classId);
    inMemoryDb.assignments = inMemoryDb.assignments.filter((a) => a.classId !== classId);
    saveDb(inMemoryDb);
    res.json({ success: true });
  });

  // Join class
  app.post('/api/classes/join', (req, res) => {
    const { code, studentId, studentName, studentEmail, studentAvatar } = req.body;
    const cleanCode = (code || '').trim().toUpperCase();
    const classRoom = inMemoryDb.classes.find((c) => c.joinCode.toUpperCase() === cleanCode);

    if (!classRoom) {
      res.status(404).json({ success: false, message: 'Invalid class code. Please check with your instructor.' });
      return;
    }

    const existingMember = inMemoryDb.members.find(
      (m) => m.classId === classRoom.id && m.studentId === studentId
    );

    if (existingMember) {
      res.status(400).json({ success: false, message: 'You are already enrolled in this class.' });
      return;
    }

    const newMember: ClassMember = {
      id: `member-${Date.now()}`,
      classId: classRoom.id,
      studentId,
      studentName,
      studentEmail,
      studentAvatar: studentAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}`,
      joinedAt: new Date().toISOString(),
      solvedInClassCount: 0,
      completedAssignmentsCount: 0,
      totalClassAssignmentsCount: inMemoryDb.assignments.filter(a => a.classId === classRoom.id).length
    };

    inMemoryDb.members.push(newMember);

    saveDb(inMemoryDb);
    res.json({ success: true, classRoom, member: newMember });
  });

  // 5. CLASS MEMBERS
  app.get('/api/members', (req, res) => {
    res.json(inMemoryDb.members);
  });

  // 6. ASSIGNMENTS
  app.get('/api/assignments', (req, res) => {
    res.json(inMemoryDb.assignments);
  });

  app.post('/api/assignments', (req, res) => {
    const assignment = req.body;
    if (!assignment.id) {
      assignment.id = `assignment-${Date.now()}`;
    }
    inMemoryDb.assignments.unshift(assignment);
    saveDb(inMemoryDb);
    res.status(201).json(assignment);
  });

  // 7. SUBMISSIONS
  app.get('/api/submissions', (req, res) => {
    res.json(inMemoryDb.submissions);
  });

  app.post('/api/submissions', (req, res) => {
    const submission = req.body;
    if (!submission.id) {
      submission.id = `sub-${Date.now()}`;
    }
    inMemoryDb.submissions.unshift(submission);

    // Update student solve stats
    const student = inMemoryDb.users.find((u) => u.id === submission.studentId);
    if (student) {
      student.totalSubmissions = (student.totalSubmissions || 0) + 1;
      if (submission.status === 'Accepted') {
        student.acceptedSubmissions = (student.acceptedSubmissions || 0) + 1;
      }
      student.lastActive = new Date().toISOString();
    }

    saveDb(inMemoryDb);
    res.status(201).json(submission);
  });

  // 8. ANNOUNCEMENTS
  app.get('/api/announcements', (req, res) => {
    res.json(inMemoryDb.announcements);
  });

  app.post('/api/announcements', (req, res) => {
    const announcement = req.body;
    if (!announcement.id) {
      announcement.id = `announcement-${Date.now()}`;
    }
    inMemoryDb.announcements.unshift(announcement);
    saveDb(inMemoryDb);
    res.status(201).json(announcement);
  });

  // 9. WEEKLY CHALLENGES
  app.get('/api/challenges', (req, res) => {
    res.json(inMemoryDb.weeklyChallenges);
  });

  app.post('/api/challenges', (req, res) => {
    const challenge = req.body;
    if (!challenge.id) {
      challenge.id = `challenge-${Date.now()}`;
    }
    inMemoryDb.weeklyChallenges.unshift(challenge);
    saveDb(inMemoryDb);
    res.status(201).json(challenge);
  });

  // 10. STUDENT GOALS
  app.get('/api/goals', (req, res) => {
    res.json(inMemoryDb.studentGoals);
  });

  app.post('/api/goals', (req, res) => {
    const goal = req.body;
    if (!goal.id) {
      goal.id = `goal-${Date.now()}`;
    }
    inMemoryDb.studentGoals.unshift(goal);
    saveDb(inMemoryDb);
    res.status(201).json(goal);
  });

  // 11. BULK SYNC (Client pushed state)
  app.post('/api/sync', (req, res) => {
    const payload = req.body as Partial<DatabaseSchema>;
    if (payload.users && Array.isArray(payload.users)) {
      // Merge users by ID or email
      for (const incoming of payload.users) {
        const idx = inMemoryDb.users.findIndex(
          (u) => u.id === incoming.id || u.email.toLowerCase() === incoming.email.toLowerCase()
        );
        if (idx >= 0) {
          inMemoryDb.users[idx] = { ...inMemoryDb.users[idx], ...incoming };
        } else {
          inMemoryDb.users.push(incoming);
        }
      }
    }
    saveDb(inMemoryDb);
    res.json({ success: true, database: inMemoryDb });
  });

  // ==========================================
  // VITE MIDDLEWARE / PRODUCTION STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MashCode Production Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
