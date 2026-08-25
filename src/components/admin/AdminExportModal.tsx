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
  History,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ExportFilterOptions } from '../../types';
import { AdminExportService } from '../../services/adminExportService';

export const AdminExportModal: React.FC = () => {
  const { currentUser, isAdmin, isOwner } = useAuth();
  const { isExportModalOpen, setIsExportModalOpen, showToast } = useApp();

  const [filterOptions, setFilterOptions] = useState<ExportFilterOptions>({
    userRole: 'ALL',
    dateRange: 'all',
    customStartDate: '',
    customEndDate: '',
    activityStatus: 'ALL',
    includeSheets: {
      allUsers: true,
      loginHistory: true,
      students: true,
      teachers: true,
      admins: true
    }
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessInfo, setExportSuccessInfo] = useState<{ fileName: string; recordCount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute live real-time preview counts matching selected filters
  const previewStats = useMemo(() => {
    try {
      return AdminExportService.getFilteredCounts(filterOptions, currentUser);
    } catch {
      return {
        totalUsers: 0,
        studentsCount: 0,
        teachersCount: 0,
        adminsCount: 0,
        loginHistoryCount: 0
      };
    }
  }, [filterOptions, currentUser]);

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
    if (!currentUser) return;
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

  const hasAdminAccess = Boolean(currentUser && (currentUser.role === 'ADMIN' || isAdmin || isOwner));

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
            className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {!hasAdminAccess ? (
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 mx-auto text-amber-400" />
              <h3 className="text-base font-bold text-white">Administrator Access Required</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Exporting platform user data is restricted to authorized Administrators only.
              </p>
            </div>
          ) : (
            <>
              {/* FILTER CONTROLS */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Export Scope &amp; Filters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Filter 1: Role */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" /> Target Role
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
                      <option value="ALL">All Statuses (Active &amp; Inactive)</option>
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

              {/* SHEET SELECTION CHECKBOXES (5 SHEETS) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Excel Sheets Included in Export
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Sheet 1: All Users */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition select-none ${
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

                  {/* Sheet 2: Login History */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition select-none ${
                      filterOptions.includeSheets.loginHistory
                        ? 'bg-sky-50/70 border-sky-300 dark:bg-sky-950/40 dark:border-sky-800 text-sky-900 dark:text-sky-200'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filterOptions.includeSheets.loginHistory}
                      onChange={() => handleSheetToggle('loginHistory')}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <div className="flex items-center gap-1.5 font-semibold">
                      <History className="w-3.5 h-3.5 text-sky-600" />
                      2. Login History
                    </div>
                  </label>

                  {/* Sheet 3: Students */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition select-none ${
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
                      3. Students
                    </div>
                  </label>

                  {/* Sheet 4: Teachers */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition select-none ${
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
                      4. Teachers
                    </div>
                  </label>

                  {/* Sheet 5: Admins */}
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition select-none ${
                      filterOptions.includeSheets.admins
                        ? 'bg-fuchsia-50/70 border-fuchsia-300 dark:bg-fuchsia-950/40 dark:border-fuchsia-800 text-fuchsia-900 dark:text-fuchsia-200'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filterOptions.includeSheets.admins}
                      onChange={() => handleSheetToggle('admins')}
                      className="rounded text-fuchsia-600 focus:ring-fuchsia-500"
                    />
                    <div className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-600" />
                      5. Admins
                    </div>
                  </label>
                </div>
              </div>

              {/* LIVE DATASET RECORD COUNTER */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Live Real-Time Database Counts:
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {previewStats.totalUsers} Total Users | {previewStats.loginHistoryCount} Login Records
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      {previewStats.totalUsers}
                    </div>
                    <div className="text-[11px] text-slate-500">All Users</div>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      {previewStats.loginHistoryCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Login Records</div>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      {previewStats.studentsCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Students</div>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      {previewStats.teachersCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Teachers</div>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white text-base">
                      {previewStats.adminsCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Admins</div>
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
                  ✓ <strong>Strict Zero-Secret Policy:</strong> Passwords, password hashes, tokens, auth secrets, and session data are strictly excluded.
                  <br />✓ <strong>Real Data Only:</strong> No fake rows or sample data. Empty roles remain formatted with clean headers.
                  <br />✓ <strong>Generated File:</strong>{' '}
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
            {hasAdminAccess ? 'Excel (.xlsx) generated directly from live database' : 'Admin authorization required'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="cancel-export-btn"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>

            {hasAdminAccess && (
              <button
                id="execute-export-user-data-btn"
                onClick={handleExport}
                disabled={isExporting}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
