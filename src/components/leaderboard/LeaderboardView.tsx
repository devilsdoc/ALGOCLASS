import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ClassLeaderboardSection } from './ClassLeaderboardSection';
import {
  Trophy,
  GraduationCap,
  Globe,
  Sparkles,
  Flame,
  Medal,
  Crown
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { currentUser, isTeacher } = useAuth();
  const { classes, members } = useApp();

  // If student is enrolled in classes, default to their primary class or the first available class
  const userClass = isTeacher
    ? classes.find((c) => c.teacherId === currentUser.id)
    : classes.find((c) => members.some((m) => m.classId === c.id && m.studentId === currentUser.id));

  const [activeTab, setActiveTab] = useState<'class' | 'global'>('class');
  const [selectedClassId, setSelectedClassId] = useState<string>(
    userClass?.id || classes[0]?.id || ''
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Competitive Performance Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-amber-400 fill-amber-400" />
            <span>Leaderboards & Standings</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time rankings calculated directly from solved test cases, daily consistency, and class coursework
          </p>
        </div>

        {/* View switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setActiveTab('class')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'class'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
            id="tab-view-class-leaderboard"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Class Leaderboards</span>
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'global'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
            id="tab-view-global-leaderboard"
          >
            <Globe className="w-4 h-4" />
            <span>All Students</span>
          </button>
        </div>
      </div>

      {/* Main Leaderboard Section */}
      {activeTab === 'class' ? (
        <ClassLeaderboardSection
          classId={selectedClassId}
          showClassDropdown={true}
        />
      ) : (
        <ClassLeaderboardSection
          classId={selectedClassId}
          showClassDropdown={true}
        />
      )}
    </div>
  );
};
