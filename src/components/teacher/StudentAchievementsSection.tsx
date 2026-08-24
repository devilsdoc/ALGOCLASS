import React, { useState, useMemo } from 'react';
import { StudentAchievement, AchievementCategory } from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Rocket,
  Star,
  Award,
  Sparkles,
  ChevronRight,
  Heart,
  Smile
} from 'lucide-react';

interface StudentAchievementsSectionProps {
  selectedClassId?: string | null;
}

export const StudentAchievementsSection: React.FC<StudentAchievementsSectionProps> = ({
  selectedClassId
}) => {
  const { currentUser } = useAuth();
  const { setSelectedStudentForAnalytics, showToast, refreshAllData, triggerCelebration } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | AchievementCategory>('all');
  const [praisedAchievements, setPraisedAchievements] = useState<Set<string>>(new Set());

  // Compute real achievements from storage
  const achievements = useMemo(() => {
    return storage.getStudentAchievementsForTeacher(currentUser.id, selectedClassId || undefined);
  }, [currentUser.id, selectedClassId]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: achievements.length,
      streak: achievements.filter((a) => a.category === 'streak').length,
      solved_count: achievements.filter((a) => a.category === 'solved_count').length,
      assignment: achievements.filter((a) => a.category === 'assignment').length,
      accuracy: achievements.filter((a) => a.category === 'accuracy').length
    };
  }, [achievements]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'all') return achievements;
    return achievements.filter((a) => a.category === activeCategory);
  }, [achievements, activeCategory]);

  const handleSendPraise = (ach: StudentAchievement) => {
    if (praisedAchievements.has(ach.id)) return;

    triggerCelebration();

    storage.addNotification({
      userId: ach.studentId,
      title: `🎉 Great Job! Praise from ${currentUser.name}`,
      message: `Your instructor ${currentUser.name} gave you a high five for your achievement: "${ach.title}"! Keep up the brilliant work! 🚀`,
      type: 'success',
      meta: {
        classId: ach.classId,
        achievementId: ach.id
      }
    });

    setPraisedAchievements((prev) => new Set(prev).add(ach.id));
    showToast('Kudos Sent! 👏', `Sent recognition & praise to ${ach.studentName}`, 'success');
    refreshAllData();
  };

  const handleOpenStudent = (ach: StudentAchievement) => {
    if (!ach.classId) return;
    const metrics = storage.getStudentMetricsForTeacher(currentUser.id, ach.classId);
    const target = metrics.find((m) => m.student.id === ach.studentId);
    if (target) {
      setSelectedStudentForAnalytics(target);
    }
  };

  const categories: { id: 'all' | AchievementCategory; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Achievements', count: counts.all, icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'streak', label: '🔥 Coding Streaks', count: counts.streak, icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'solved_count', label: '🏆 Problem Milestones', count: counts.solved_count, icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'assignment', label: '🚀 Coursework Progress', count: counts.assignment, icon: <Rocket className="w-3.5 h-3.5" /> },
    { id: 'accuracy', label: '⭐ Accuracy Masters', count: counts.accuracy, icon: <Star className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="space-y-4" id="student-achievements-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-white">Student Achievements</h3>
            {achievements.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                {achievements.length} Unlocked
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Celebrating student milestones: daily coding streaks, high problem counts, fast coursework progress, and accuracy
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950/40'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
              id={`filter-ach-${cat.id}-btn`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-amber-500/30 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {filteredAchievements.length === 0 ? (
        <div className="p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">No achievements in this category yet</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            As students solve problems and maintain streaks, milestones will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAchievements.map((ach) => {
            const hasPraised = praisedAchievements.has(ach.id);

            return (
              <div
                key={ach.id}
                className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm space-y-3 flex flex-col justify-between"
                id={`achievement-card-${ach.id}`}
              >
                <div>
                  {/* Top: Student details & badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={ach.studentAvatar}
                        alt={ach.studentName}
                        className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                      />
                      <div>
                        <div className="text-xs font-bold text-white hover:text-indigo-400 transition-colors">
                          {ach.studentName}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {ach.className || 'Classroom'} • {ach.studentEmail}
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${ach.badgeColor}`}>
                      {ach.badgeLabel}
                    </span>
                  </div>

                  {/* Achievement message body */}
                  <div className="mt-3 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed flex items-center gap-2.5">
                    <span className="text-lg">{ach.badgeIcon}</span>
                    <div className="font-semibold text-white">
                      {ach.message}
                    </div>
                  </div>
                </div>

                {/* Footer: Metric & Action */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-zinc-400">
                    <span className="text-zinc-500">Record: </span>
                    <span className="text-amber-400 font-bold">{ach.metricValue || 'Earned'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendPraise(ach)}
                      disabled={hasPraised}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                        hasPraised
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border-amber-500/30'
                      }`}
                      id={`praise-student-${ach.id}-btn`}
                      title="Send recognition & celebration to student"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{hasPraised ? 'Praised! 👏' : 'Send Praise 👏'}</span>
                    </button>

                    {ach.classId && (
                      <button
                        onClick={() => handleOpenStudent(ach)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 border border-zinc-700"
                        id={`view-student-profile-${ach.id}-btn`}
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                    )}
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
