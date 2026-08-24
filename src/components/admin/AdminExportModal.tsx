import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  X,
  Sliders,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ExportFilterOptions } from '../../types';
import { AdminExportService } from '../../services/adminExportService';

export const AdminExportModal: React.FC = () => {
  const { currentUser, isAdmin, isOwner, switchUser, users } = useAuth();
  const { isExportModalOpen, setIsExportModalOpen, showToast } = useApp();

  const [filterOptions, setFilterOptions] = useState<ExportFilterOptions>({
    userRole: 'ALL',
    dateRange: 'all',
    customStartDate: '',
    customEndDate: '',
    activityStatus: 'ALL',
    includeSheets: {
      allUsers: true,
      students: true,
      teachers: true,
      classes: true,
      assignments: true,
      submissions: true
    }
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessInfo, setExportSuccessInfo] = useState<{ fileName: string; recordCount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute live real-time preview counts matching selected filters
  const previewStats = useMemo(() => {
    try {
      return AdminExportService.getFilteredCounts(filterOptions);
    } catch {
      return {
        totalUsers: 0,
        studentsCount: 0,
        teachersCount: 0,
        adminsCount: 0,
        classesCount: 0,
        assignmentsCount: 0,
        submissionsCount: 0
      };
    }
  }, [filterOptions]);

  if (!isExportModalOpen) return null;

  const handleSheetToggle = (key: keyof ExportFilterOptions['includeSheets']) => {
    setFilterOptions((prev) => ({
      ...prev,
      includeSheets: {
        ...prev.includeSheets,
        [key]: !prev.includeSheets[key]
      }
    }));
  };

  const handleExport = async () => {
    setErrorMessage(null);
    setExportSuccessInfo(null);
    setIsExporting(true);

    try {
      // Run the export generator
      const result = await AdminExportService.exportUserDataToExcel(currentUser, filterOptions);

      // Trigger browser file download
      AdminExportService.triggerDownload(result.blob, result.fileName);

      setExportSuccessInfo({
        fileName: result.fileName,
        recordCount: result.recordCount
      });

      showToast(
        'Export Complete',
        `Successfully downloaded ${result.fileName} containing ${result.recordCount} user records.`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate Excel export.';
      setErrorMessage(msg);
      showToast('Export Failed', msg, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const adminAccount = users.find((u) => u.role === 'ADMIN' || u.id === 'admin-1');

  return (
    <div
      id="admin-export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsExportModalOpen(false);
      }}
    >
      <div
        id="admin-export-modal-card"
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-indigo-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Export User Data</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin Only
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Generate and download comprehensive Excel (.xlsx) reports with real database records.
              </p>
            </div>
          </div>

          <button
            id="close-export-modal-btn"
            onClick={() => setIsExportModalOpen(false)}
            className="p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* ACCESS CONTROL CHECK */}
          {!isAdmin && !isOwner ? (
            <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg text-rose-600 dark:text-rose-400 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                    Access Denied: Platform Administrator Privileges Required
                  </h3>
                  <p className="text-sm text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                    The User Data Export module extracts sensitive cross-classroom datasets, student performance
                    histories, and organizational records. Only verified Platform Administrators or System Owners can
                    execute this action.
                  </p>
                </div>
              </div>

              {adminAccount && (
                <div className="pt-3 border-t border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-rose-700 dark:text-rose-300">
                    Current user: <span className="font-semibold">{currentUser.name}</span> ({currentUser.role})
                  </div>
                  <button
                    id="switch-to-admin-btn"
                    onClick={() => {
                      switchUser(adminAccount.id);
                      showToast(
                        'Switched to Admin',
                        `Logged in as Platform Administrator (${adminAccount.name}).`,
                        'info'
                      );
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Switch to Platform Admin ({adminAccount.name})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Authenticated Admin Badge */}
              <div className="flex items-center justify-between bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 p-3.5 rounded-xl text-xs">
                <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Authorized as <strong className="font-semibold">{currentUser.name}</strong> ({currentUser.email})
                  </span>
                </div>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                  Role: {currentUser.role}
                </span>
              </div>

              {/* FILTERS SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Export Filter Criteria
                  </h3>
                  <button
                    id="reset-export-filters-btn"
                    onClick={() =>
                      setFilterOptions({
                        userRole: 'ALL',
                        dateRange: 'all',
                        customStartDate: '',
                        customEndDate: '',
                        activityStatus: 'ALL',
                        includeSheets: {
                          allUsers: true,
                          students: true,
                          teachers: true,
                          classes: true,
                          assignments: true,
                          submissions: true
                        }
                      })
                    }
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Reset Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Filter 1: Role */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" /> User Role
                    </label>
                    <select
                      id="export-filter-role-select"
                      value={filterOptions.userRole}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          userRole: e.target.value as ExportFilterOptions['userRole']
                        }))
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="ALL">All Roles (Students, Teachers, Admins)</option>
                      <option value="STUDENT">Students Only</option>
                      <option value="TEACHER">Teachers Only</option>
                      <option value="ADMIN">Platform Admins Only</option>
                    </select>
                  </div>

                  {/* Filter 2: Date Range */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Date Range
                    </label>
                    <select
                      id="export-filter-date-select"
                      value={filterOptions.dateRange}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          dateRange: e.target.value as ExportFilterOptions['dateRange']
                        }))
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="all">All Time (Entire Database)</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="custom">Custom Date Range...</option>
                    </select>
                  </div>

                  {/* Filter 3: Active / Inactive Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Activity Status
                    </label>
                    <select
                      id="export-filter-activity-select"
                      value={filterOptions.activityStatus}
                      onChange={(e) =>
                        setFilterOptions((prev) => ({
                          ...prev,
                          activityStatus: e.target.value as ExportFilterOptions['activityStatus']
                        }))
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="ALL">All Statuses (Active & Inactive)</option>
                      <option value="ACTIVE">Active Users Only (Active within 7 days)</option>
                      <option value="INACTIVE">Inactive Users Only (Inactive &gt; 7 days)</option>
                    </select>
                  </div>
                </div>

                {/* Custom Date Pickers */}
                {filterOptions.dateRange === 'custom' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="export-filter-start-date"
                        value={filterOptions.customStartDate || ''}
                        onChange={(e) =>
                          setFilterOptions((prev) => ({ ...prev, customStartDate: e.target.value }))
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="export-filter-end-date"
                        value={filterOptions.customEndDate || ''}
                        onChange={(e) =>
                          setFilterOptions((prev) => ({ ...prev, customEndDate: e.target.value }))
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SHEET SELECTION CHECKBOXES */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Excel Sheets Included in Export
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* Sheet 1: All Users */}
                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      filterOptions.includeSheets.allUsers
                        ? 'bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filterOptions.includeSheets.allUsers}
                      onChange={() => handleSheetToggle('allUsers')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      1. All Users
                    </div>
                  </label>

                  {/* Sheet 2: Students */}
                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      filterOptions.includeSheets.students
                        ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filterOptions.includeSheets.students}
                      onChange={() => handleSheetToggle('students')}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1.5 font-semibold">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      2. Students
                    </div>
                  </label>

                  {/* Sheet 3: Teachers */}
                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      filterOptions.includeSheets.teachers
                        ? 'bg-purple-50/70 border-purple-300 dark:bg-purple-950/40 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filterOptions.includeSheets.teachers}
                      onChange={() => handleSheetToggle('teachers')}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                      3. Teachers
                    </div>
                  </label>

                  {/* Sheet 4: Classes */}
                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      filterOptions.includeSheets.classes
                        ? 'bg-blue-50/70 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filterOptions.includeSheets.classes}
                      onChange={() => handleSheetToggle('classes')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-1.5 font-semibold">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      4. Classes
                    </div>
                  </label>

                  {/* Sheet 5: Assignments */}
                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      filterOptions.includeSheets.assignments
                        ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filterOptions.includeSheets.assignments}
                      onChange={() => handleSheetToggle('assignments')}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-1.5 font-semibold">
                      <FileCode className="w-3.5 h-3.5 text-amber-600" />
                      5. Assignments
                    </div>
                  </label>

                  {/* Sheet 6: Submissions */}
                  <label
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      filterOptions.includeSheets.submissions
                        ? 'bg-teal-50/70 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filterOptions.includeSheets.submissions}
                      onChange={() => handleSheetToggle('submissions')}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <div className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      6. Submissions
                    </div>
                  </label>
                </div>
              </div>

              {/* LIVE DATASET RECORD COUNTER */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Live Records Matching Filter:
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {previewStats.totalUsers} Users Selected
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {previewStats.studentsCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Students</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {previewStats.teachersCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Teachers</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {previewStats.adminsCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Admins</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {previewStats.classesCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Classes</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {previewStats.assignmentsCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Assignments</div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {previewStats.submissionsCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Submissions</div>
                  </div>
                </div>
              </div>

              {/* SECURITY MANDATE & FORMAT SPECIFICATIONS */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Security &amp; Privacy Compliance
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  ✓ <strong>Strict Zero-Secret Policy:</strong> Passwords, password hashes, and auth tokens are
                  completely excluded.
                  <br />✓ <strong>Excel File Features:</strong> Bold styled headers, auto-filters, frozen header row,
                  proper date formatting, and auto-sized column widths.
                  <br />✓ <strong>Generated File Format:</strong>{' '}
                  <code className="bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded font-mono text-[10px]">
                    AlgoClass_User_Data_YYYY-MM-DD.xlsx
                  </code>
                </p>
              </div>

              {/* Error or Success alerts */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {exportSuccessInfo && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Exported <strong>{exportSuccessInfo.fileName}</strong> ({exportSuccessInfo.recordCount} user records)
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            {isAdmin || isOwner ? 'Excel (.xlsx) generated directly from live state' : 'Admin authorization required'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="cancel-export-btn"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>

            {(isAdmin || isOwner) && (
              <button
                id="execute-export-user-data-btn"
                onClick={handleExport}
                disabled={isExporting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Excel File...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export User Data (.xlsx)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
