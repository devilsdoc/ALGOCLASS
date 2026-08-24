import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ClassManagement } from './components/teacher/ClassManagement';
import { ClassDetailView } from './components/teacher/ClassDetailView';
import { StudentMonitoringTable } from './components/teacher/StudentMonitoringTable';
import { ClassAnalyticsTab } from './components/teacher/ClassAnalyticsTab';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentProgress } from './components/student/StudentProgress';
import { ProblemList } from './components/problems/ProblemList';
import { CodeEditorView } from './components/problems/CodeEditorView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ProfileSettingsView } from './components/profile/ProfileSettingsView';

import { JoinClassModal } from './components/student/JoinClassModal';
import { CreateClassModal } from './components/teacher/CreateClassModal';
import { AssignmentCreatorModal } from './components/teacher/AssignmentCreatorModal';
import { StudentAnalyticsModal } from './components/teacher/StudentAnalyticsModal';
import { AnnouncementModal } from './components/teacher/AnnouncementModal';
import { WeeklyChallengeModal } from './components/challenges/WeeklyChallengeModal';
import { StudentGoalModal } from './components/goals/StudentGoalModal';
import { AdminExportModal } from './components/admin/AdminExportModal';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { Users, FileCode2, LineChart, Plus } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, setIsCreateAssignmentOpen } = useApp();
  const { currentUser, isTeacher } = useAuth();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return isTeacher ? <TeacherDashboard /> : <StudentDashboard />;

      case 'classes':
        return <ClassManagement />;

      case 'class-detail':
        return <ClassDetailView />;

      case 'students':
        return (
          <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <Users className="w-7 h-7 text-indigo-400" />
                  Student Performance & Progress Monitoring
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Search, filter, and drill into individual student coding submissions, accuracy, and streaks
                </p>
              </div>
            </div>
            <StudentMonitoringTable showClassSelector={true} />
          </div>
        );

      case 'assignments':
        return isTeacher ? (
          <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <FileCode2 className="w-7 h-7 text-indigo-400" />
                  Coursework & Assignment Manager
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Select a class or publish a new multi-problem assignment with automated test verification
                </p>
              </div>
              <button
                onClick={() => setIsCreateAssignmentOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>
            </div>
            <ClassManagement />
          </div>
        ) : (
          <StudentAssignments />
        );

      case 'problems':
        return <ProblemList />;

      case 'problem-solve':
        return <CodeEditorView />;

      case 'progress':
        return <StudentProgress />;

      case 'analytics':
        return isTeacher ? (
          <div className="space-y-6 pb-12">
            <ClassAnalyticsTab teacherId={currentUser.id} showClassSelector={true} />
            <div className="pt-4 border-t border-zinc-800">
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Student Performance & Intervention Roster
              </h2>
              <StudentMonitoringTable showClassSelector={true} />
            </div>
          </div>
        ) : (
          <StudentProgress />
        );

      case 'leaderboard':
        return <LeaderboardView />;

      case 'settings':
        return <ProfileSettingsView />;

      default:
        return isTeacher ? <TeacherDashboard /> : <StudentDashboard />;
    }
  };

  return (
    <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {renderTabContent()}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-600 selection:text-white font-sans antialiased">
          {/* Top Navbar with live role switcher */}
          <Navbar />

          {/* Main Layout Body */}
          <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-y-auto">
              <MainContent />
            </main>
          </div>

          {/* Global Application Modals */}
          <JoinClassModal />
          <CreateClassModal />
          <AssignmentCreatorModal />
          <StudentAnalyticsModal />
          <AnnouncementModal />
          <WeeklyChallengeModal />
          <StudentGoalModal />
          <AdminExportModal />
          <AuthModal />

          {/* Real-time Toast Alerts */}
          <ToastContainer />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}
