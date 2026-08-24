import React, { useState, useMemo } from 'react';
import { PerformanceAlert, PerformanceAlertType } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Calendar,
  Zap,
  CheckCircle2,
  ChevronRight,
  Filter,
  Send,
  Sparkles,
  UserCheck,
  Flame,
  FileCode2
} from 'lucide-react';

interface StudentsNeedingAttentionSectionProps {
  selectedClassId?: string | null;
}

export const StudentsNeedingAttentionSection: React.FC<StudentsNeedingAttentionSectionProps> = ({
  selectedClassId
}) => {
  const { currentUser } = useAuth();
  const { setSelectedStudentForAnalytics, showToast, refreshAllData } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | PerformanceAlertType>('all');
  const [nudgedStudents, setNudgedStudents] = useState<Set<string>>(new Set());

  // Compute real alerts from storage
  const alerts = useMemo(() => {
    return storage.getPerformanceAlertsForTeacher(currentUser.id, selectedClassId || undefined);
  }, [currentUser.id, selectedClassId]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: alerts.length,
      inactive: alerts.filter((a) => a.type === 'inactive').length,
      'low-progress': alerts.filter((a) => a.type === 'low-progress').length,
      'missed-assignment': alerts.filter((a) => a.type === 'missed-assignment').length,
      'low-acceptance': alerts.filter((a) => a.type === 'low-acceptance').length
    };
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return alerts;
    return alerts.filter((a) => a.type === activeFilter);
  }, [alerts, activeFilter]);

  const handleSendNudge = (alert: PerformanceAlert) => {
    if (nudgedStudents.has(alert.id)) return;

    // Add notification to student
    let nudgeMsg = `Your instructor ${currentUser.name} noticed you might need support with coursework in ${alert.className}. Don't hesitate to reach out!`;
    if (alert.type === 'inactive') {
      nudgeMsg = `Hey ${alert.studentName}, your instructor ${currentUser.name} sent a friendly reminder to check into ${alert.className} and solve problems to keep your streak!`;
    } else if (alert.type === 'missed-assignment') {
      nudgeMsg = `Reminder from ${currentUser.name}: Please check your pending assignments in ${alert.className} and submit your solutions.`;
    } else if (alert.type === 'low-acceptance') {
      nudgeMsg = `Tip from ${currentUser.name}: Review test cases and problem constraints carefully before submitting solutions in ${alert.className}.`;
    }

    storage.addNotification({
      userId: alert.studentId,
      title: `⚡ Coursework Check-In from ${currentUser.name}`,
      message: nudgeMsg,
      type: 'alert',
      meta: {
        classId: alert.classId
      }
    });

    setNudgedStudents((prev) => new Set(prev).add(alert.id));
    showToast('Encouragement Sent! 📨', `Sent a study reminder notification to ${alert.studentName}`, 'success');
    refreshAllData();
  };

  const handleOpenStudent = (alert: PerformanceAlert) => {
    const metrics = storage.getStudentMetricsForTeacher(currentUser.id, alert.classId);
    const target = metrics.find((m) => m.student.id === alert.studentId);
    if (target) {
      setSelectedStudentForAnalytics(target);
    }
  };

  const filterTabs: { id: 'all' | PerformanceAlertType; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Alerts', count: counts.all, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'inactive', label: '⚠️ Inactive', count: counts.inactive, icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'low-progress', label: '📉 Low Progress', count: counts['low-progress'], icon: <TrendingDown className="w-3.5 h-3.5" /> },
    { id: 'missed-assignment', label: '⏰ Missed Work', count: counts['missed-assignment'], icon: <FileCode2 className="w-3.5 h-3.5" /> },
    { id: 'low-acceptance', label: '🎯 Low Accuracy', count: counts['low-acceptance'], icon: <TrendingDown className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="space-y-4" id="students-needing-attention-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-white">Students Needing Attention</h3>
            {alerts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black border border-rose-500/30">
                {alerts.length} Flagged
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Automated alerts detecting inactivity (7+ days), low assignment progress, missed deadlines, or low acceptance rates
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950/40'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
              id={`filter-alert-${tab.id}-btn`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-rose-500/30 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alert Cards */}
      {filteredAlerts.length === 0 ? (
        <div className="p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">All Students Are On Track! 🎉</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {activeFilter === 'all'
              ? 'No students currently meet the inactivity or low progress alert criteria.'
              : `No students flagged for ${activeFilter.replace('-', ' ')} alerts.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAlerts.map((alert) => {
            const hasNudged = nudgedStudents.has(alert.id);

            // Badge styling
            let badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            if (alert.type === 'inactive') badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            if (alert.type === 'low-progress') badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            if (alert.type === 'missed-assignment') badgeBg = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            if (alert.type === 'low-acceptance') badgeBg = 'bg-orange-500/10 text-orange-400 border-orange-500/20';

            return (
              <div
                key={alert.id}
                className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm space-y-3 flex flex-col justify-between"
                id={`alert-card-${alert.id}`}
              >
                <div>
                  {/* Top: Student details & alert badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={alert.studentAvatar}
                        alt={alert.studentName}
                        className="w-10 h-10 rounded-2xl object-cover ring-2 ring-zinc-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-white hover:text-indigo-400 transition-colors">
                          {alert.studentName}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {alert.className} • {alert.studentEmail}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                      {alert.title}
                    </span>
                  </div>

                  {/* Alert message body */}
                  <div className="mt-3 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{alert.message}</span>
                  </div>
                </div>

                {/* Footer: Metric & Actions */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-zinc-400">
                    <span className="text-zinc-500">Metric: </span>
                    <span className="text-zinc-200">{alert.metricValue || 'Flagged'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendNudge(alert)}
                      disabled={hasNudged}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                        hasNudged
                          ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                          : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30'
                      }`}
                      id={`nudge-student-${alert.studentId}-btn`}
                      title="Send motivational notification to student"
                    >
                      <Send className="w-3 h-3" />
                      <span>{hasNudged ? 'Nudge Sent ✓' : 'Send Nudge'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenStudent(alert)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 border border-zinc-700"
                      id={`view-analytics-${alert.studentId}-btn`}
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
