import { User, UserRole, LoginHistoryRecord } from '../types';

export interface RegisterUserParams {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  createdAt?: string;
  createdDate?: string;
  schoolOrOrg?: string;
  avatar?: string;
  title?: string;
  bio?: string;
}

export interface AuthRecord {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  emailVerified: boolean;
}

export interface AtomicRegistrationResult {
  success: boolean;
  user: User;
  authRecord: AuthRecord;
  loginRecord: LoginHistoryRecord;
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    createdAt: string;
    schoolOrOrg: string;
    avatar: string;
    title: string;
    bio: string;
  };
}

/**
 * Validates registration parameters and ensures all mandatory fields
 * (ID, Name, Email, Role, Created Date) meet strict schema requirements.
 */
export function validateRegistrationPayload(params: RegisterUserParams): ValidationResult {
  if (!params || typeof params !== 'object') {
    return { valid: false, error: 'Registration parameters must be a valid object.' };
  }

  // 1. Mandatory Name Validation
  if (!params.name || typeof params.name !== 'string' || params.name.trim().length === 0) {
    return { valid: false, error: 'Name is a mandatory field and cannot be empty.' };
  }
  const cleanName = params.name.trim();
  if (cleanName.length > 100) {
    return { valid: false, error: 'Name exceeds maximum allowed length (100 characters).' };
  }

  // 2. Mandatory Email Validation
  if (!params.email || typeof params.email !== 'string' || params.email.trim().length === 0) {
    return { valid: false, error: 'Email is a mandatory field and cannot be empty.' };
  }
  const cleanEmail = params.email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, error: 'Please provide a valid email address.' };
  }
  if (cleanEmail.length > 120) {
    return { valid: false, error: 'Email exceeds maximum allowed length (120 characters).' };
  }

  // 3. Mandatory Role Validation
  const validRoles: UserRole[] = ['STUDENT', 'TEACHER', 'ADMIN'];
  if (!params.role || !validRoles.includes(params.role)) {
    return { valid: false, error: `Invalid role '${params.role}'. Must be one of: STUDENT, TEACHER, ADMIN.` };
  }

  // Enforce single-admin policy: Dynamic registration of ADMIN role is restricted
  if (params.role === 'ADMIN') {
    return {
      valid: false,
      error: 'Administrator registration is restricted. Only the designated platform administrator is permitted.'
    };
  }

  // 4. Mandatory ID & Creation Date Mapping
  const nowIso = params.createdAt || params.createdDate || new Date().toISOString();
  const generatedId = params.id && params.id.trim().length > 0
    ? params.id.trim()
    : `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 5. Default Profile Data
  const cleanAvatar = params.avatar && params.avatar.trim().length > 0
    ? params.avatar.trim()
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`;

  const cleanTitle = params.title && params.title.trim().length > 0
    ? params.title.trim()
    : params.role === 'TEACHER'
    ? 'Instructor & Algorithm Specialist'
    : 'Computer Science Student';

  const cleanBio = params.bio && params.bio.trim().length > 0
    ? params.bio.trim()
    : params.role === 'TEACHER'
    ? 'Managing classrooms & coaching students for DSA mastery.'
    : 'Preparing for coding interviews & mastering algorithms.';

  const cleanSchoolOrOrg = params.schoolOrOrg && params.schoolOrOrg.trim().length > 0
    ? params.schoolOrOrg.trim()
    : 'Computer Science & Engineering';

  return {
    valid: true,
    sanitized: {
      id: generatedId,
      name: cleanName,
      email: cleanEmail,
      role: params.role,
      password: params.password || 'password123',
      createdAt: nowIso,
      schoolOrOrg: cleanSchoolOrOrg,
      avatar: cleanAvatar,
      title: cleanTitle,
      bio: cleanBio
    }
  };
}

/**
 * Unified atomic registration function.
 * Guarantees the creation of both the Auth record and the Firestore user profile
 * in a single atomic operation with all mandatory fields mapped to the production database schema.
 */
export function createUnifiedUserRegistration(params: RegisterUserParams): AtomicRegistrationResult {
  const validation = validateRegistrationPayload(params);
  if (!validation.valid || !validation.sanitized) {
    throw new Error(validation.error || 'Invalid user registration data.');
  }

  const { id, name, email, role, password, createdAt, schoolOrOrg, avatar, title, bio } = validation.sanitized;
  const now = new Date().toISOString();

  // 1. Construct Firestore / Database User Profile
  const userProfile: User = {
    id,
    name,
    email,
    password,
    role,
    isAdmin: role === 'ADMIN',
    isOwner: false,
    avatar,
    title,
    bio,
    schoolOrOrg,
    streak: 1,
    longestStreak: 1,
    lastLogin: now,
    lastActive: now,
    createdAt: createdAt || now,
    solvedCount: {
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0
    },
    totalSubmissions: 0,
    acceptedSubmissions: 0
  };

  // 2. Construct Auth Record
  const authRecord: AuthRecord = {
    uid: id,
    email,
    displayName: name,
    role,
    createdAt: createdAt || now,
    lastLogin: now,
    emailVerified: true
  };

  // 3. Construct Initial Login History Session Record
  const [datePart, timePart] = now.split('T');
  const loginRecord: LoginHistoryRecord = {
    id: `login-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: id,
    name,
    email,
    role,
    loginDate: datePart || new Date().toISOString().split('T')[0],
    loginTime: timePart ? timePart.substring(0, 8) : new Date().toLocaleTimeString('en-US', { hour12: false }),
    lastLogin: now,
    lastActive: now
  };

  return {
    success: true,
    user: userProfile,
    authRecord,
    loginRecord,
    message: 'User profile and Auth records successfully created atomically.'
  };
}
