import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  users: User[];
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  switchUser: (userId: string) => void;
  loginAsRole: (role: UserRole) => void;
  loginUser: (email: string, password?: string) => { success: boolean; message?: string; user?: User };
  updateCurrentUser: (updates: Partial<User>) => void;
  registerUser: (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    schoolOrOrg?: string;
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
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());

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

  const loginAsRole = (role: UserRole) => {
    const matching = users.find((u) => u.role === role);
    if (matching) {
      switchUser(matching.id);
    }
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
    // Default to guest / open auth selection modal
    setAuthModalMode('role-select');
    setIsAuthModalOpen(true);
  };

  const updateCurrentUser = (updates: Partial<User>) => {
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
  }): { success: boolean; message?: string; user?: User } => {
    const existing = storage.getUsers().find((u) => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email address already exists. Please log in.' };
    }

    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    try {
      const created = storage.createUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password || 'password123',
        role: data.role,
        avatar: randomAvatar,
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

  const isTeacher = currentUser.role === 'TEACHER';
  const isStudent = currentUser.role === 'STUDENT';
  const isAdmin = currentUser.role === 'ADMIN' || Boolean(currentUser.isAdmin) || Boolean(currentUser.isOwner);
  const isOwner = Boolean(currentUser.isOwner) || (currentUser.role === 'ADMIN' && currentUser.id === 'admin-1');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
