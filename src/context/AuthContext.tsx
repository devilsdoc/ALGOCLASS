import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { getDefaultAvatar } from '../utils/avatar';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  switchUser: (userId: string) => void;
  loginAsRole: (role: UserRole) => User | null;
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
  registerUser: (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    schoolOrOrg?: string;
    avatar?: string;
  }) => Promise<{ success: boolean; message?: string; user?: User }>;
  refreshUserData: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup' | 'role-select';
  setAuthModalMode: (mode: 'login' | 'signup' | 'role-select') => void;
  selectedRoleForAuth: UserRole | null;
  setSelectedRoleForAuth: (role: UserRole | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());

  // Modal Auth flow states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'role-select'>('role-select');
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<UserRole | null>(null);

  // Sync with production server database
  const syncWithDatabase = useCallback(async () => {
    try {
      setIsSyncing(true);
      const res = await storage.syncWithServer();
      setUsers(res.users);
      const currentId = storage.getCurrentUserId();
      if (currentId) {
        const found = res.users.find((u) => u.id === currentId);
        if (found) {
          setCurrentUser(found);
        }
      }
      setLastSyncedAt(new Date());
    } catch (err) {
      console.warn('[AuthContext] sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Initial server hydration
    syncWithDatabase();

    // Real-time synchronization polling (every 3.5 seconds across all browsers)
    const interval = setInterval(() => {
      syncWithDatabase();
    }, 3500);

    // Sync immediately on window focus / tab switch
    const onFocus = () => {
      syncWithDatabase();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onFocus);
    };
  }, [syncWithDatabase]);

  const refreshUserData = async () => {
    await syncWithDatabase();
  };

  const switchUser = (userId: string) => {
    storage.setCurrentUserId(userId);
    const user = storage.getUserById(userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const loginAsRole = (role: UserRole): User | null => {
    const matching = users.find((u) => u.role === role);
    if (matching) {
      switchUser(matching.id);
      return matching;
    }
    return null;
  };

  const loginUser = async (email: string, password?: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      // First try real server authentication
      const apiRes = await api.loginUser(email, password);
      if (apiRes.success && apiRes.user) {
        storage.setCurrentUserId(apiRes.user.id);
        setCurrentUser(apiRes.user);
        await syncWithDatabase();
        return { success: true, user: apiRes.user };
      }
    } catch (e) {
      console.warn('[AuthContext] API login failed, checking cached data:', e);
    }

    // Fallback to local authentication if offline
    const res = storage.authenticateUser(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setUsers(storage.getUsers());
      return { success: true, user: res.user };
    }
    return { success: false, message: res.message || 'Authentication failed' };
  };

  const logout = () => {
    storage.clearCurrentUserId();
    setCurrentUser(null);
    setIsAuthModalOpen(false);
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    storage.updateUser(updated);
    setCurrentUser(updated);
    setUsers(storage.getUsers());
    try {
      await api.updateUser(currentUser.id, updates);
    } catch (e) {
      console.warn('[AuthContext] updateUser API push failed:', e);
    }
  };

  const registerUser = async (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    schoolOrOrg?: string;
    avatar?: string;
  }): Promise<{ success: boolean; message?: string; user?: User }> => {
    if (data.role === 'ADMIN') {
      return {
        success: false,
        message: 'Administrator registration is disabled. Only the designated Platform Administrator (Nagare Manish) can access the admin dashboard.'
      };
    }

    const emailTrim = data.email.trim().toLowerCase();
    const finalAvatar = data.avatar?.trim() || getDefaultAvatar(data.name);

    try {
      // 1. Direct registration to production central database
      const apiRes = await api.registerUser({
        name: data.name.trim(),
        email: emailTrim,
        role: data.role,
        password: data.password || 'password123',
        schoolOrOrg: data.schoolOrOrg || 'Computer Science & Engineering',
        avatar: finalAvatar,
        title: data.role === 'TEACHER' ? 'Instructor & Algorithm Specialist' : 'Computer Science Student',
        bio: data.role === 'TEACHER' ? 'Managing classrooms & coaching students for DSA mastery.' : 'Preparing for coding interviews.'
      });

      if (apiRes.success && apiRes.user) {
        // Sync local storage
        storage.setCurrentUserId(apiRes.user.id);
        setCurrentUser(apiRes.user);
        await syncWithDatabase();
        return { success: true, user: apiRes.user };
      }
    } catch (apiErr: unknown) {
      const errMsg = apiErr instanceof Error ? apiErr.message : 'Server registration error';
      if (errMsg.includes('already exists') || errMsg.includes('restricted')) {
        return { success: false, message: errMsg };
      }
      console.warn('[AuthContext] Direct API registration error, creating locally and queuing sync:', apiErr);
    }

    // 2. Fallback local creation
    try {
      const created = storage.createUser({
        name: data.name.trim(),
        email: emailTrim,
        password: data.password || 'password123',
        role: data.role,
        avatar: finalAvatar,
        schoolOrOrg: data.schoolOrOrg || 'Computer Science & Engineering',
        title: data.role === 'TEACHER' ? 'Instructor & Algorithm Specialist' : 'Computer Science Student',
        bio: data.role === 'TEACHER' ? 'Managing classrooms & coaching students for DSA mastery.' : 'Preparing for coding interviews.'
      });

      setUsers(storage.getUsers());
      switchUser(created.id);
      return { success: true, user: created };
    } catch (e: unknown) {
      return { success: false, message: e instanceof Error ? e.message : 'Failed to register account' };
    }
  };

  const isTeacher = currentUser?.role === 'TEACHER';
  const isStudent = currentUser?.role === 'STUDENT';
  const isAdmin = currentUser?.role === 'ADMIN' || Boolean(currentUser?.isAdmin) || Boolean(currentUser?.isOwner);
  const isOwner = Boolean(currentUser?.isOwner) || (currentUser?.role === 'ADMIN' && currentUser?.id === 'admin-1');
  const isAuthenticated = Boolean(currentUser);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        users,
        isTeacher,
        isStudent,
        isAdmin,
        isOwner,
        isSyncing,
        lastSyncedAt,
        switchUser,
        loginAsRole,
        loginUser,
        updateCurrentUser,
        registerUser,
        refreshUserData,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        selectedRoleForAuth,
        setSelectedRoleForAuth,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
