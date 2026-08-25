import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';
import { getDefaultAvatar } from '../utils/avatar';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  switchUser: (userId: string) => void;
  loginAsRole: (role: UserRole) => User | null;
  loginUser: (email: string, password?: string) => { success: boolean; message?: string; user?: User };
  updateCurrentUser: (updates: Partial<User>) => void;
  registerUser: (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    schoolOrOrg?: string;
    avatar?: string;
  }) => { success: boolean; message?: string; user?: User };
  refreshUserData: () => void;
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

  // Modal Auth flow states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'role-select'>('role-select');
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<UserRole | null>(null);

  useEffect(() => {
    // Sync state
    setUsers(storage.getUsers());
    setCurrentUser(storage.getCurrentUser());
  }, []);

  const refreshUserData = () => {
    const updatedUsers = storage.getUsers();
    setUsers(updatedUsers);
    const updatedCurrent = storage.getCurrentUser();
    setCurrentUser(updatedCurrent);
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

  const loginUser = (email: string, password?: string): { success: boolean; message?: string; user?: User } => {
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

  const updateCurrentUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    storage.updateUser(updated);
    setCurrentUser(updated);
    setUsers(storage.getUsers());
  };

  const registerUser = (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    schoolOrOrg?: string;
    avatar?: string;
  }): { success: boolean; message?: string; user?: User } => {
    if (data.role === 'ADMIN') {
      return { success: false, message: 'Administrator registration is disabled. Only the designated Platform Administrator (Nagare Manish) can access the admin dashboard.' };
    }

    const existing = storage.getUsers().find((u) => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists. Please log in.' };
    }

    const finalAvatar = data.avatar?.trim() || getDefaultAvatar(data.name);

    try {
      const created = storage.createUser({
        name: data.name.trim(),
        email: data.email.trim(),
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
