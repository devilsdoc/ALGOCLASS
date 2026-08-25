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
  Problem,
  UserRole
} from '../types';

export interface DatabaseState {
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

class ApiService {
  private baseUrl = '';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        }
      });

      if (!res.ok) {
        let errorMsg = `Server error (${res.status})`;
        try {
          const errorData = await res.json();
          if (errorData.message || errorData.error) {
            errorMsg = errorData.message || errorData.error;
          }
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }

      return (await res.json()) as T;
    } catch (err: unknown) {
      console.warn(`[ApiService] Request to ${endpoint} failed:`, err);
      throw err;
    }
  }

  // 1. SYNC
  async syncDatabase(): Promise<DatabaseState> {
    return this.request<DatabaseState>('/api/sync');
  }

  // 2. USERS & AUTH
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/users');
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/api/users/${id}`);
  }

  async registerUser(data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    schoolOrOrg?: string;
    avatar?: string;
    title?: string;
    bio?: string;
  }): Promise<{ success: boolean; user: User; message?: string }> {
    return this.request<{ success: boolean; user: User; message?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async loginUser(
    email: string,
    password?: string
  ): Promise<{ success: boolean; user: User; message?: string }> {
    return this.request<{ success: boolean; user: User; message?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    return this.request<User>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // 3. LOGIN HISTORY
  async getLoginHistory(): Promise<LoginHistoryRecord[]> {
    return this.request<LoginHistoryRecord[]>('/api/login-history');
  }

  // 4. CLASSES
  async getClasses(): Promise<ClassRoom[]> {
    return this.request<ClassRoom[]>('/api/classes');
  }

  async createClass(classData: Partial<ClassRoom>): Promise<ClassRoom> {
    return this.request<ClassRoom>('/api/classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  }

  async deleteClass(classId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/classes/${classId}`, {
      method: 'DELETE'
    });
  }

  async joinClass(data: {
    code: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentAvatar?: string;
  }): Promise<{ success: boolean; classRoom: ClassRoom; member: ClassMember; message?: string }> {
    return this.request<{ success: boolean; classRoom: ClassRoom; member: ClassMember; message?: string }>(
      '/api/classes/join',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  }

  // 5. MEMBERS
  async getMembers(): Promise<ClassMember[]> {
    return this.request<ClassMember[]>('/api/members');
  }

  // 6. ASSIGNMENTS
  async getAssignments(): Promise<Assignment[]> {
    return this.request<Assignment[]>('/api/assignments');
  }

  async createAssignment(assignment: Partial<Assignment>): Promise<Assignment> {
    return this.request<Assignment>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment)
    });
  }

  // 7. SUBMISSIONS
  async getSubmissions(): Promise<Submission[]> {
    return this.request<Submission[]>('/api/submissions');
  }

  async createSubmission(submission: Partial<Submission>): Promise<Submission> {
    return this.request<Submission>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(submission)
    });
  }

  // 8. ANNOUNCEMENTS
  async getAnnouncements(): Promise<Announcement[]> {
    return this.request<Announcement[]>('/api/announcements');
  }

  async createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement> {
    return this.request<Announcement>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement)
    });
  }

  // 9. WEEKLY CHALLENGES
  async getChallenges(): Promise<WeeklyChallenge[]> {
    return this.request<WeeklyChallenge[]>('/api/challenges');
  }

  async createChallenge(challenge: Partial<WeeklyChallenge>): Promise<WeeklyChallenge> {
    return this.request<WeeklyChallenge>('/api/challenges', {
      method: 'POST',
      body: JSON.stringify(challenge)
    });
  }

  // 10. GOALS
  async getGoals(): Promise<StudentGoal[]> {
    return this.request<StudentGoal[]>('/api/goals');
  }

  async createGoal(goal: Partial<StudentGoal>): Promise<StudentGoal> {
    return this.request<StudentGoal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goal)
    });
  }
}

export const api = new ApiService();
