import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  ClassRoom,
  ClassMember,
  Assignment,
  Submission,
  Problem,
  Notification,
  StudentMetrics,
  Announcement,
  WeeklyChallenge,
  StudentGoal,
  StudentGoalWithProgress,
  GoalType
} from '../types';
import { storage } from '../services/storage';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

export type NavigationTab =
  | 'dashboard'
  | 'classes'
  | 'class-detail'
  | 'problems'
  | 'problem-solve'
  | 'assignments'
  | 'students'
  | 'analytics'
  | 'progress'
  | 'leaderboard'
  | 'notifications'
  | 'settings';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;
  selectedProblemId: string | null;
  setSelectedProblemId: (id: string | null) => void;
  activeProblemId: string | null;
  setActiveProblemId: (id: string | null) => void;
  selectedStudentForAnalytics: StudentMetrics | null;
  setSelectedStudentForAnalytics: (student: StudentMetrics | null) => void;

  // Data
  classes: ClassRoom[];
  members: ClassMember[];
  assignments: Assignment[];
  submissions: Submission[];
  problems: Problem[];
  notifications: Notification[];
  announcements: Announcement[];
  weeklyChallenges: WeeklyChallenge[];
  studentGoals: StudentGoalWithProgress[];
  unreadNotifsCount: number;

  // Modals
  isJoinClassOpen: boolean;
  setIsJoinClassOpen: (open: boolean) => void;
  isCreateClassOpen: boolean;
  setIsCreateClassOpen: (open: boolean) => void;
  isCreateAssignmentOpen: boolean;
  setIsCreateAssignmentOpen: (open: boolean) => void;
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  isAnnouncementModalOpen: boolean;
  setIsAnnouncementModalOpen: (open: boolean) => void;
  editingAnnouncement: Announcement | null;
  setEditingAnnouncement: (a: Announcement | null) => void;
  announcementTargetClassId: string | null;
  setAnnouncementTargetClassId: (id: string | null) => void;
  isChallengeModalOpen: boolean;
  setIsChallengeModalOpen: (open: boolean) => void;
  editingChallenge: WeeklyChallenge | null;
  setEditingChallenge: (c: WeeklyChallenge | null) => void;
  challengeTargetClassId: string | null;
  setChallengeTargetClassId: (id: string | null) => void;
  isGoalModalOpen: boolean;
  setIsGoalModalOpen: (open: boolean) => void;
  editingGoal: StudentGoal | null;
  setEditingGoal: (g: StudentGoal | null) => void;
  isGoalHistoryOpen: boolean;
  setIsGoalHistoryOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;

  // Actions
  joinClass: (code: string) => Promise<{ success: boolean; message: string }>;
  createNewClass: (data: { name: string; description: string; subject?: string; academicYear?: string }) => ClassRoom;
  deleteClassRoom: (classId: string) => void;
  regenerateCode: (classId: string) => string;
  createNewAssignment: (data: {
    classId: string;
    title: string;
    description: string;
    problemIds: string[];
    startDate: string;
    deadline: string;
  }) => Assignment;
  deleteAssignmentRecord: (assignmentId: string) => void;
  leaveClassRoom: (classId: string) => void;
  createNewAnnouncement: (data: {
    classId: string;
    title: string;
    message: string;
    pinned?: boolean;
  }) => Announcement;
  updateAnnouncementRecord: (
    id: string,
    updates: Partial<Pick<Announcement, 'title' | 'message' | 'pinned'>>
  ) => Announcement;
  deleteAnnouncementRecord: (id: string) => void;
  openCreateAnnouncement: (classId?: string) => void;
  openEditAnnouncement: (announcement: Announcement) => void;

  // Weekly Challenges Actions
  createNewWeeklyChallenge: (data: {
    classId: string;
    title: string;
    description: string;
    problemIds: string[];
    startDate: string;
    endDate: string;
  }) => WeeklyChallenge;
  updateWeeklyChallengeRecord: (
    id: string,
    updates: Partial<Pick<WeeklyChallenge, 'title' | 'description' | 'problemIds' | 'startDate' | 'endDate'>>
  ) => WeeklyChallenge;
  deleteWeeklyChallengeRecord: (id: string) => void;
  openCreateChallenge: (classId?: string) => void;
  openEditChallenge: (challenge: WeeklyChallenge) => void;

  // Student Goals Actions
  createNewStudentGoal: (data: {
    type: GoalType;
    targetCount: number;
    title?: string;
  }) => StudentGoal;
  updateStudentGoalRecord: (
    id: string,
    updates: Partial<Pick<StudentGoal, 'title' | 'targetCount' | 'type'>>
  ) => StudentGoal;
  deleteStudentGoalRecord: (id: string) => void;
  openCreateGoal: () => void;
  openEditGoal: (goal: StudentGoal) => void;

  // Notification actions
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  markNotifAsRead: (id: string) => void;
  markAllNotifsAsRead: () => void;
  deleteNotif: (id: string) => void;
  clearAllReadNotifs: () => void;
  openNotificationLink: (notif: Notification) => void;

  refreshAllData: () => void;
  refreshSubmissions: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Helpers
  navigateToSolve: (problemId: string, assignmentContextId?: string) => void;
  activeAssignmentContext: string | null;
  setActiveAssignmentContext: (id: string | null) => void;
  activeAssignmentId: string | null;
  setActiveAssignmentId: (id: string | null) => void;
  triggerCelebration: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isTeacher } = useAuth();

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState<StudentMetrics | null>(null);
  const [activeAssignmentContext, setActiveAssignmentContext] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementTargetClassId, setAnnouncementTargetClassId] = useState<string | null>(null);

  // Challenge modal states
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<WeeklyChallenge | null>(null);
  const [challengeTargetClassId, setChallengeTargetClassId] = useState<string | null>(null);

  // Goal modal states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StudentGoal | null>(null);
  const [isGoalHistoryOpen, setIsGoalHistoryOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // State data
  const [classes, setClasses] = useState<ClassRoom[]>(() => storage.getClasses());
  const [members, setMembers] = useState<ClassMember[]>(() => storage.getMembers());
  const [assignments, setAssignments] = useState<Assignment[]>(() => storage.getAssignments());
  const [submissions, setSubmissions] = useState<Submission[]>(() => storage.getSubmissions());
  const [problems, setProblems] = useState<Problem[]>(() => storage.getProblems());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => storage.getAnnouncements());
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>(() =>
    storage.getWeeklyChallenges()
  );
  const [studentGoals, setStudentGoals] = useState<StudentGoalWithProgress[]>(() =>
    currentUser ? storage.getStudentGoals(currentUser.id) : []
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    currentUser ? storage.getNotificationsForUser(currentUser.id) : []
  );

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const refreshAllData = useCallback(() => {
    setClasses(storage.getClasses());
    setMembers(storage.getMembers());
    setAssignments(storage.getAssignments());
    setSubmissions(storage.getSubmissions());
    setProblems(storage.getProblems());
    setAnnouncements(storage.getAnnouncements());
    setWeeklyChallenges(storage.getWeeklyChallenges());
    if (currentUser) {
      setStudentGoals(storage.getStudentGoals(currentUser.id));
      setNotifications(storage.getNotificationsForUser(currentUser.id));
    } else {
      setStudentGoals([]);
      setNotifications([]);
    }
  }, [currentUser?.id]);

  // Sync notifications and student goals when current user changes without looping
  useEffect(() => {
    if (currentUser) {
      setNotifications(storage.getNotificationsForUser(currentUser.id));
      setStudentGoals(storage.getStudentGoals(currentUser.id));
    } else {
      setNotifications([]);
      setStudentGoals([]);
    }
  }, [currentUser?.id]);

  // Adjust active tab when switching role if incompatible
  useEffect(() => {
    if (isTeacher) {
      if (activeTab === 'progress') setActiveTab('dashboard');
    } else {
      if (activeTab === 'students') setActiveTab('classes');
    }
  }, [isTeacher, activeTab]);

  const showToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b']
      });
    } catch {
      // ignore
    }
  }, []);

  const joinClass = async (code: string): Promise<{ success: boolean; message: string }> => {
    const result = storage.joinClassByCode(currentUser, code);
    if (result.success) {
      refreshAllData();
      triggerCelebration();
      showToast('Enrolled in Class! 🎓', result.message, 'success');
      return { success: true, message: result.message };
    } else {
      showToast('Join Failed', result.message, 'error');
      return { success: false, message: result.message };
    }
  };

  const createNewClass = (data: {
    name: string;
    description: string;
    subject?: string;
    academicYear?: string;
  }): ClassRoom => {
    try {
      const newClass = storage.createClass({
        ...data,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        teacherAvatar: currentUser.avatar,
        teacherEmail: currentUser.email
      });
      refreshAllData();
      showToast('Class Created! 🚀', `Class code: ${newClass.joinCode}`, 'success');
      return newClass;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Class creation failed';
      showToast('Permission Denied', msg, 'error');
      throw err;
    }
  };

  const deleteClassRoom = (classId: string) => {
    try {
      storage.deleteClass(currentUser.id, classId);
      refreshAllData();
      showToast('Class Deleted', 'Classroom and student records removed', 'info');
      if (selectedClassId === classId) {
        setSelectedClassId(null);
        setActiveTab('classes');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete class';
      showToast('Permission Denied', msg, 'error');
    }
  };

  const regenerateCode = (classId: string): string => {
    try {
      const newCode = storage.regenerateJoinCode(currentUser.id, classId);
      refreshAllData();
      showToast('Join Code Updated 🔄', `New class code: ${newCode}`, 'success');
      return newCode;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update code';
      showToast('Permission Denied', msg, 'error');
      return '';
    }
  };

  const createNewAssignment = (data: {
    classId: string;
    title: string;
    description: string;
    problemIds: string[];
    startDate: string;
    deadline: string;
  }): Assignment => {
    try {
      const newAsgn = storage.createAssignment({
        ...data,
        teacherId: currentUser.id,
        teacherName: currentUser.name
      });
      refreshAllData();
      showToast('Assignment Published! 📝', `Assigned ${data.problemIds.length} problems to class students`, 'success');
      return newAsgn;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create assignment';
      showToast('Permission Denied', msg, 'error');
      throw err;
    }
  };

  const deleteAssignmentRecord = (assignmentId: string) => {
    try {
      storage.deleteAssignment(currentUser.id, assignmentId);
      refreshAllData();
      showToast('Assignment Removed', 'Assignment removed from classroom', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete assignment';
      showToast('Permission Denied', msg, 'error');
    }
  };

  const leaveClassRoom = (classId: string) => {
    storage.leaveClass(currentUser.id, classId);
    refreshAllData();
    showToast('Left Classroom', 'You have un-enrolled from this class.', 'info');
  };

  const createNewAnnouncement = (data: {
    classId: string;
    title: string;
    message: string;
    pinned?: boolean;
  }): Announcement => {
    try {
      const newAnn = storage.createAnnouncement({
        ...data,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        teacherAvatar: currentUser.avatar,
        teacherEmail: currentUser.email
      });
      refreshAllData();
      showToast('Announcement Published! 📢', `Notified students of ${newAnn.className}`, 'success');
      return newAnn;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish announcement';
      showToast('Permission Denied', msg, 'error');
      throw err;
    }
  };

  const updateAnnouncementRecord = (
    id: string,
    updates: Partial<Pick<Announcement, 'title' | 'message' | 'pinned'>>
  ): Announcement => {
    try {
      const updated = storage.updateAnnouncement(currentUser.id, id, updates);
      refreshAllData();
      showToast('Announcement Updated ✏️', 'Changes saved successfully', 'success');
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update announcement';
      showToast('Permission Denied', msg, 'error');
      throw err;
    }
  };

  const deleteAnnouncementRecord = (id: string) => {
    try {
      storage.deleteAnnouncement(currentUser.id, id);
      refreshAllData();
      showToast('Announcement Deleted 🗑️', 'Announcement removed from class feed', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete announcement';
      showToast('Permission Denied', msg, 'error');
    }
  };

  const openCreateAnnouncement = (classId?: string) => {
    setEditingAnnouncement(null);
    if (classId) {
      setAnnouncementTargetClassId(classId);
    }
    setIsAnnouncementModalOpen(true);
  };

  const openEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementTargetClassId(announcement.classId);
    setIsAnnouncementModalOpen(true);
  };

  // Weekly Challenge Actions
  const createNewWeeklyChallenge = (data: {
    classId: string;
    title: string;
    description: string;
    problemIds: string[];
    startDate: string;
    endDate: string;
  }): WeeklyChallenge => {
    try {
      const newChall = storage.createWeeklyChallenge(data);
      refreshAllData();
      showToast('Weekly Challenge Published! 🔥', `Challenge active for ${newChall.className}`, 'success');
      return newChall;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create challenge';
      showToast('Error', msg, 'error');
      throw err;
    }
  };

  const updateWeeklyChallengeRecord = (
    id: string,
    updates: Partial<Pick<WeeklyChallenge, 'title' | 'description' | 'problemIds' | 'startDate' | 'endDate'>>
  ): WeeklyChallenge => {
    try {
      const updated = storage.updateWeeklyChallenge(id, updates);
      refreshAllData();
      showToast('Challenge Updated ✏️', 'Weekly challenge updated successfully', 'success');
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update challenge';
      showToast('Error', msg, 'error');
      throw err;
    }
  };

  const deleteWeeklyChallengeRecord = (id: string) => {
    try {
      storage.deleteWeeklyChallenge(id);
      refreshAllData();
      showToast('Challenge Deleted 🗑️', 'Weekly challenge removed', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete challenge';
      showToast('Error', msg, 'error');
    }
  };

  const openCreateChallenge = (classId?: string) => {
    setEditingChallenge(null);
    if (classId) {
      setChallengeTargetClassId(classId);
    }
    setIsChallengeModalOpen(true);
  };

  const openEditChallenge = (challenge: WeeklyChallenge) => {
    setEditingChallenge(challenge);
    setChallengeTargetClassId(challenge.classId);
    setIsChallengeModalOpen(true);
  };

  // Student Goal Actions
  const createNewStudentGoal = (data: {
    type: GoalType;
    targetCount: number;
    title?: string;
  }): StudentGoal => {
    try {
      const newGoal = storage.createStudentGoal({
        studentId: currentUser.id,
        ...data
      });
      refreshAllData();
      showToast('Goal Created! 🎯', `Set target to solve ${newGoal.targetCount} problems`, 'success');
      return newGoal;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create goal';
      showToast('Error', msg, 'error');
      throw err;
    }
  };

  const updateStudentGoalRecord = (
    id: string,
    updates: Partial<Pick<StudentGoal, 'title' | 'targetCount' | 'type'>>
  ): StudentGoal => {
    try {
      const updated = storage.updateStudentGoal(id, updates);
      refreshAllData();
      showToast('Goal Updated ✏️', 'Personal coding goal saved', 'success');
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update goal';
      showToast('Error', msg, 'error');
      throw err;
    }
  };

  const deleteStudentGoalRecord = (id: string) => {
    try {
      storage.deleteStudentGoal(id);
      refreshAllData();
      showToast('Goal Deleted', 'Goal removed from active tracker', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete goal';
      showToast('Error', msg, 'error');
    }
  };

  const openCreateGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const openEditGoal = (goal: StudentGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  // Notification modal state & actions
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const markNotifAsRead = (id: string) => {
    if (!currentUser) return;
    storage.markNotificationAsRead(id);
    setNotifications(storage.getNotificationsForUser(currentUser.id));
  };

  const markAllNotifsAsRead = () => {
    if (!currentUser) return;
    storage.markAllNotificationsAsRead(currentUser.id);
    setNotifications(storage.getNotificationsForUser(currentUser.id));
    showToast('Notifications Marked Read', 'All alerts marked as read', 'info');
  };

  const deleteNotif = (id: string) => {
    if (!currentUser) return;
    storage.deleteNotification(id);
    setNotifications(storage.getNotificationsForUser(currentUser.id));
  };

  const clearAllReadNotifs = () => {
    if (!currentUser) return;
    storage.clearReadNotifications(currentUser.id);
    setNotifications(storage.getNotificationsForUser(currentUser.id));
    showToast('Cleared', 'Removed all read notifications', 'info');
  };

  const openNotificationLink = (notif: Notification) => {
    markNotifAsRead(notif.id);
    setIsNotificationCenterOpen(false);
    if (!notif.link) return;

    if (notif.link.problemId) {
      navigateToSolve(notif.link.problemId, notif.link.assignmentId);
      return;
    }

    if (notif.link.classId) {
      setSelectedClassId(notif.link.classId);
    }

    if (notif.link.tab) {
      setActiveTab(notif.link.tab as any);
    }
  };

  const navigateToSolve = (problemId: string, assignmentContextId?: string) => {
    setSelectedProblemId(problemId);
    if (assignmentContextId) {
      setActiveAssignmentContext(assignmentContextId);
    }
    setActiveTab('problem-solve');
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedClassId,
        setSelectedClassId,
        selectedProblemId,
        setSelectedProblemId,
        activeProblemId: selectedProblemId,
        setActiveProblemId: setSelectedProblemId,
        selectedStudentForAnalytics,
        setSelectedStudentForAnalytics,
        classes,
        members,
        assignments,
        submissions,
        problems,
        notifications,
        announcements,
        weeklyChallenges,
        studentGoals,
        unreadNotifsCount,
        isJoinClassOpen,
        setIsJoinClassOpen,
        isCreateClassOpen,
        setIsCreateClassOpen,
        isCreateAssignmentOpen,
        setIsCreateAssignmentOpen,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        isAnnouncementModalOpen,
        setIsAnnouncementModalOpen,
        editingAnnouncement,
        setEditingAnnouncement,
        announcementTargetClassId,
        setAnnouncementTargetClassId,
        isChallengeModalOpen,
        setIsChallengeModalOpen,
        editingChallenge,
        setEditingChallenge,
        challengeTargetClassId,
        setChallengeTargetClassId,
        isGoalModalOpen,
        setIsGoalModalOpen,
        editingGoal,
        setEditingGoal,
        isGoalHistoryOpen,
        setIsGoalHistoryOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        markNotifAsRead,
        markAllNotifsAsRead,
        deleteNotif,
        clearAllReadNotifs,
        openNotificationLink,
        joinClass,
        createNewClass,
        deleteClassRoom,
        regenerateCode,
        createNewAssignment,
        deleteAssignmentRecord,
        leaveClassRoom,
        createNewAnnouncement,
        updateAnnouncementRecord,
        deleteAnnouncementRecord,
        openCreateAnnouncement,
        openEditAnnouncement,
        createNewWeeklyChallenge,
        updateWeeklyChallengeRecord,
        deleteWeeklyChallengeRecord,
        openCreateChallenge,
        openEditChallenge,
        createNewStudentGoal,
        updateStudentGoalRecord,
        deleteStudentGoalRecord,
        openCreateGoal,
        openEditGoal,
        refreshAllData,
        refreshSubmissions: refreshAllData,
        toasts,
        showToast,
        dismissToast,
        navigateToSolve,
        activeAssignmentContext,
        setActiveAssignmentContext,
        activeAssignmentId: activeAssignmentContext,
        setActiveAssignmentId: setActiveAssignmentContext,
        triggerCelebration,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
