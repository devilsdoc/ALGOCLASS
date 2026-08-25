import ExcelJS from 'exceljs';
import { User, ExportFilterOptions, ExportPreviewStats } from '../types';
import { storage } from './storage';

/**
 * Format ISO date string into readable Excel date format: YYYY-MM-DD HH:mm:ss
 */
function formatDate(isoString?: string | null): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Check if a date falls within the selected date range
 */
function isDateInRange(
  dateStr: string | undefined,
  range: 'all' | '7d' | '30d' | '90d' | 'custom',
  customStart?: string,
  customEnd?: string
): boolean {
  if (!dateStr || range === 'all') return true;
  const time = new Date(dateStr).getTime();
  if (isNaN(time)) return false;

  const now = Date.now();
  if (range === '7d') {
    return time >= now - 7 * 86400000;
  }
  if (range === '30d') {
    return time >= now - 30 * 86400000;
  }
  if (range === '90d') {
    return time >= now - 90 * 86400000;
  }
  if (range === 'custom') {
    const start = customStart ? new Date(customStart).getTime() : -Infinity;
    const end = customEnd ? new Date(customEnd + 'T23:59:59.999Z').getTime() : Infinity;
    return time >= start && time <= end;
  }
  return true;
}

/**
 * Determines whether a user is classified as Active (active in last 7 days)
 */
function isUserActive(user: User): boolean {
  if (!user.lastActive) return false;
  const lastActiveTime = new Date(user.lastActive).getTime();
  const diffDays = (Date.now() - lastActiveTime) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

/**
 * Styles a worksheet with professional header row, bold font, colored background,
 * frozen top row, autoFilter, and auto-sized column widths.
 */
function styleWorksheet(
  worksheet: ExcelJS.Worksheet,
  headerBgColor = '312E81', // Deep indigo
  headerTextColor = 'FFFFFF'
) {
  // 1. Frozen Header Row
  worksheet.views = [{ state: 'frozen', ySplit: 1, xSplit: 0, activeCell: 'A2' }];

  // 2. Format Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.font = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: headerTextColor }
  };
  headerRow.alignment = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: false
  };

  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: headerBgColor }
    };
    cell.border = {
      top: { style: 'thin', color: { argb: '4338CA' } },
      left: { style: 'thin', color: { argb: '4338CA' } },
      bottom: { style: 'medium', color: { argb: '1E1B4B' } },
      right: { style: 'thin', color: { argb: '4338CA' } }
    };
  });

  // 3. Auto-filter on all columns
  const columnCount = worksheet.columns?.length || 0;
  if (columnCount > 0) {
    const lastColLetter = getColumnLetter(columnCount);
    worksheet.autoFilter = `A1:${lastColLetter}1`;
  }

  // 4. Style data rows & Auto-fit columns
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 20;
      row.font = { name: 'Calibri', size: 10 };
      row.alignment = { vertical: 'middle' };

      // Subtle alternating stripe
      if (rowNumber % 2 === 0) {
        row.eachCell({ includeEmpty: false }, (cell) => {
          if (!cell.fill || cell.fill.type !== 'pattern') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F8FAFC' }
            };
          }
        });
      }

      // Add light borders to all data cells
      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'F1F5F9' } },
          right: { style: 'thin', color: { argb: 'F1F5F9' } }
        };
      });
    }
  });

  // 5. Auto-size columns with padding
  if (worksheet.columns) {
    worksheet.columns.forEach((column) => {
      let maxLength = 12;
      if (column.header) {
        maxLength = Math.max(maxLength, String(column.header).length);
      }
      if (column.values && Array.isArray(column.values)) {
        column.values.forEach((val) => {
          if (val !== undefined && val !== null) {
            const strVal = typeof val === 'object' && 'text' in val ? String(val.text) : String(val);
            if (strVal.length > maxLength) {
              maxLength = strVal.length;
            }
          }
        });
      }
      column.width = Math.min(Math.max(maxLength + 4, 14), 45);
    });
  }
}

function getColumnLetter(colIndex: number): string {
  let letter = '';
  while (colIndex > 0) {
    const remainder = (colIndex - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    colIndex = Math.floor((colIndex - remainder) / 26);
  }
  return letter || 'A';
}

export class AdminExportService {
  /**
   * Backend authorization guard - Verifies that the requester has administrative privileges.
   */
  static verifyAdminAuthorization(requesterUser: User): void {
    if (!requesterUser) {
      throw new Error('Unauthorized: Authentication required to access data export.');
    }
    const isAdminOrOwner =
      requesterUser.role === 'ADMIN' ||
      Boolean(requesterUser.isAdmin) ||
      Boolean(requesterUser.isOwner);

    if (!isAdminOrOwner) {
      throw new Error(
        'Access Denied: Platform Administrator privileges are required to view or export database records.'
      );
    }
  }

  /**
   * Preview real record counts matching the provided export filters
   */
  static getFilteredCounts(options: ExportFilterOptions, requesterUser?: User | null): ExportPreviewStats {
    const rawUsers = storage.getUsers();
    let loginHistoryCount = 0;
    try {
      if (requesterUser && (requesterUser.role === 'ADMIN' || requesterUser.isAdmin || requesterUser.isOwner)) {
        loginHistoryCount = storage.getLoginHistory(requesterUser).length;
      }
    } catch {
      loginHistoryCount = 0;
    }

    // Filter users
    const filteredUsers = rawUsers.filter((user) => {
      // Role filter
      if (options.userRole !== 'ALL') {
        if (options.userRole === 'STUDENT' && user.role !== 'STUDENT') return false;
        if (options.userRole === 'TEACHER' && user.role !== 'TEACHER') return false;
        if (options.userRole === 'ADMIN' && user.role !== 'ADMIN' && !user.isAdmin) return false;
      }
      // Date filter
      if (!isDateInRange(user.createdAt, options.dateRange, options.customStartDate, options.customEndDate)) {
        return false;
      }
      // Activity filter
      if (options.activityStatus !== 'ALL') {
        const active = isUserActive(user);
        if (options.activityStatus === 'ACTIVE' && !active) return false;
        if (options.activityStatus === 'INACTIVE' && active) return false;
      }
      return true;
    });

    const studentsCount = filteredUsers.filter((u) => u.role === 'STUDENT').length;
    const teachersCount = filteredUsers.filter((u) => u.role === 'TEACHER').length;
    const adminsCount = filteredUsers.filter((u) => u.role === 'ADMIN' || u.isAdmin).length;

    return {
      totalUsers: filteredUsers.length,
      studentsCount,
      teachersCount,
      adminsCount,
      loginHistoryCount
    };
  }

  /**
   * Generates a real multi-sheet Excel (.xlsx) file using only real database data.
   *
   * Sheets:
   * 1. All Users
   * 2. Login History
   * 3. Students
   * 4. Teachers
   * 5. Admins
   *
   * STRICT SECURITY: Passwords, password hashes, tokens, auth secrets, and session data are NEVER exported.
   */
  static async exportUserDataToExcel(
    requesterUser: User,
    options: ExportFilterOptions
  ): Promise<{ blob: Blob; fileName: string; recordCount: number }> {
    // 1. Strict Backend Authorization Check
    this.verifyAdminAuthorization(requesterUser);

    // 2. Fetch live real database records from storage engine
    const rawUsers = storage.getUsers();
    const rawLoginHistory = storage.getLoginHistory(requesterUser);

    // 3. Apply Filters to Users
    const filteredUsers = rawUsers.filter((user) => {
      // Role filter
      if (options.userRole !== 'ALL') {
        if (options.userRole === 'STUDENT' && user.role !== 'STUDENT') return false;
        if (options.userRole === 'TEACHER' && user.role !== 'TEACHER') return false;
        if (options.userRole === 'ADMIN' && user.role !== 'ADMIN' && !user.isAdmin) return false;
      }
      // Date filter
      if (!isDateInRange(user.createdAt, options.dateRange, options.customStartDate, options.customEndDate)) {
        return false;
      }
      // Activity filter
      if (options.activityStatus !== 'ALL') {
        const active = isUserActive(user);
        if (options.activityStatus === 'ACTIVE' && !active) return false;
        if (options.activityStatus === 'INACTIVE' && active) return false;
      }
      return true;
    });

    const filteredStudents = filteredUsers.filter((u) => u.role === 'STUDENT');
    const filteredTeachers = filteredUsers.filter((u) => u.role === 'TEACHER');
    const filteredAdmins = filteredUsers.filter((u) => u.role === 'ADMIN' || Boolean(u.isAdmin));

    // 4. Filter login history
    const filteredLoginHistory = rawLoginHistory.filter((rec) => {
      if (options.userRole !== 'ALL') {
        if (options.userRole === 'STUDENT' && rec.role !== 'STUDENT') return false;
        if (options.userRole === 'TEACHER' && rec.role !== 'TEACHER') return false;
        if (options.userRole === 'ADMIN' && rec.role !== 'ADMIN') return false;
      }
      if (!isDateInRange(rec.lastLogin, options.dateRange, options.customStartDate, options.customEndDate)) {
        return false;
      }
      return true;
    });

    // 5. Initialize ExcelJS Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = `MashCode Admin (${requesterUser.name})`;
    workbook.lastModifiedBy = requesterUser.name;
    workbook.created = new Date();
    workbook.modified = new Date();

    // -------------------------------------------------------------
    // SHEET 1: ALL USERS
    // -------------------------------------------------------------
    if (options.includeSheets.allUsers) {
      const sheet = workbook.addWorksheet('All Users');
      sheet.columns = [
        { header: 'User ID', key: 'userId' },
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Role', key: 'role' },
        { header: 'Status', key: 'status' },
        { header: 'Account Created Date', key: 'createdAt' },
        { header: 'Last Login', key: 'lastLogin' },
        { header: 'Last Active', key: 'lastActive' },
        { header: 'Organization / Department', key: 'schoolOrOrg' },
        { header: 'Current Streak (Days)', key: 'streak' },
        { header: 'Longest Streak (Days)', key: 'longestStreak' },
        { header: 'Total Problems Solved', key: 'totalSolved' },
        { header: 'Total Submissions', key: 'totalSubmissions' },
        { header: 'Accepted Submissions', key: 'acceptedSubmissions' },
        { header: 'Acceptance Rate (%)', key: 'acceptanceRate' }
      ];

      filteredUsers.forEach((u) => {
        const active = isUserActive(u);
        const totalSubs = u.totalSubmissions || 0;
        const acceptedSubs = u.acceptedSubmissions || 0;
        const acceptanceRate = totalSubs > 0 ? ((acceptedSubs / totalSubs) * 100).toFixed(1) + '%' : '0.0%';

        sheet.addRow({
          userId: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: active ? 'Active' : 'Inactive',
          createdAt: formatDate(u.createdAt),
          lastLogin: formatDate(u.lastLogin || u.lastActive),
          lastActive: formatDate(u.lastActive),
          schoolOrOrg: u.schoolOrOrg || 'N/A',
          streak: u.streak || 0,
          longestStreak: u.longestStreak || Math.max(u.streak || 0, 1),
          totalSolved: u.solvedCount?.total || 0,
          totalSubmissions: totalSubs,
          acceptedSubmissions: acceptedSubs,
          acceptanceRate
        });
      });

      styleWorksheet(sheet, '312E81'); // Deep Indigo
    }

    // -------------------------------------------------------------
    // SHEET 2: LOGIN HISTORY
    // -------------------------------------------------------------
    if (options.includeSheets.loginHistory) {
      const sheet = workbook.addWorksheet('Login History');
      sheet.columns = [
        { header: 'Record ID', key: 'recordId' },
        { header: 'User ID', key: 'userId' },
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Role', key: 'role' },
        { header: 'Login Date', key: 'loginDate' },
        { header: 'Login Time', key: 'loginTime' },
        { header: 'Last Login', key: 'lastLogin' },
        { header: 'Last Active', key: 'lastActive' }
      ];

      filteredLoginHistory.forEach((rec) => {
        sheet.addRow({
          recordId: rec.id,
          userId: rec.userId,
          name: rec.name,
          email: rec.email,
          role: rec.role,
          loginDate: rec.loginDate,
          loginTime: rec.loginTime,
          lastLogin: formatDate(rec.lastLogin),
          lastActive: formatDate(rec.lastActive)
        });
      });

      styleWorksheet(sheet, '0284C7'); // Cyan / Sky Blue
    }

    // -------------------------------------------------------------
    // SHEET 3: STUDENTS
    // -------------------------------------------------------------
    if (options.includeSheets.students) {
      const sheet = workbook.addWorksheet('Students');
      sheet.columns = [
        { header: 'User ID', key: 'userId' },
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Status', key: 'status' },
        { header: 'Account Created Date', key: 'createdAt' },
        { header: 'Last Login', key: 'lastLogin' },
        { header: 'Last Active', key: 'lastActive' },
        { header: 'Total Problems Solved', key: 'totalSolved' },
        { header: 'Easy Solved', key: 'easySolved' },
        { header: 'Medium Solved', key: 'mediumSolved' },
        { header: 'Hard Solved', key: 'hardSolved' },
        { header: 'Total Submissions', key: 'totalSubmissions' },
        { header: 'Accepted Submissions', key: 'acceptedSubmissions' },
        { header: 'Acceptance Rate (%)', key: 'acceptanceRate' },
        { header: 'Current Streak (Days)', key: 'streak' },
        { header: 'Longest Streak (Days)', key: 'longestStreak' },
        { header: 'Organization / School', key: 'schoolOrOrg' }
      ];

      filteredStudents.forEach((student) => {
        const active = isUserActive(student);
        const totalSubs = student.totalSubmissions || 0;
        const acceptedSubs = student.acceptedSubmissions || 0;
        const acceptanceRate = totalSubs > 0 ? ((acceptedSubs / totalSubs) * 100).toFixed(1) + '%' : '0.0%';

        sheet.addRow({
          userId: student.id,
          name: student.name,
          email: student.email,
          status: active ? 'Active' : 'Inactive',
          createdAt: formatDate(student.createdAt),
          lastLogin: formatDate(student.lastLogin || student.lastActive),
          lastActive: formatDate(student.lastActive),
          totalSolved: student.solvedCount?.total || 0,
          easySolved: student.solvedCount?.easy || 0,
          mediumSolved: student.solvedCount?.medium || 0,
          hardSolved: student.solvedCount?.hard || 0,
          totalSubmissions: totalSubs,
          acceptedSubmissions: acceptedSubs,
          acceptanceRate,
          streak: student.streak || 0,
          longestStreak: student.longestStreak || Math.max(student.streak || 0, 1),
          schoolOrOrg: student.schoolOrOrg || 'N/A'
        });
      });

      styleWorksheet(sheet, '047857'); // Emerald green
    }

    // -------------------------------------------------------------
    // SHEET 4: TEACHERS
    // -------------------------------------------------------------
    if (options.includeSheets.teachers) {
      const sheet = workbook.addWorksheet('Teachers');
      sheet.columns = [
        { header: 'User ID', key: 'userId' },
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Status', key: 'status' },
        { header: 'Account Created Date', key: 'createdAt' },
        { header: 'Last Login', key: 'lastLogin' },
        { header: 'Last Active', key: 'lastActive' },
        { header: 'Classes Created', key: 'classesCreated' },
        { header: 'Total Students Enrolled', key: 'totalStudents' },
        { header: 'Assignments Created', key: 'assignmentsCreated' },
        { header: 'Department / Organization', key: 'schoolOrOrg' },
        { header: 'Professional Title', key: 'title' }
      ];

      const rawClasses = storage.getClasses();
      const rawMembers = storage.getMembers();
      const rawAssignments = storage.getAssignments();

      filteredTeachers.forEach((teacher) => {
        const active = isUserActive(teacher);
        const teacherClasses = rawClasses.filter((c) => c.teacherId === teacher.id);
        const classIds = new Set(teacherClasses.map((c) => c.id));
        const classMembers = rawMembers.filter((m) => classIds.has(m.classId));
        const uniqueStudents = new Set(classMembers.map((m) => m.studentId));
        const teacherAssignments = rawAssignments.filter((a) => a.teacherId === teacher.id || classIds.has(a.classId));

        sheet.addRow({
          userId: teacher.id,
          name: teacher.name,
          email: teacher.email,
          status: active ? 'Active' : 'Inactive',
          createdAt: formatDate(teacher.createdAt),
          lastLogin: formatDate(teacher.lastLogin || teacher.lastActive),
          lastActive: formatDate(teacher.lastActive),
          classesCreated: teacherClasses.length,
          totalStudents: uniqueStudents.size,
          assignmentsCreated: teacherAssignments.length,
          schoolOrOrg: teacher.schoolOrOrg || 'N/A',
          title: teacher.title || 'N/A'
        });
      });

      styleWorksheet(sheet, '6D28D9'); // Violet / Purple
    }

    // -------------------------------------------------------------
    // SHEET 5: ADMINS
    // -------------------------------------------------------------
    if (options.includeSheets.admins) {
      const sheet = workbook.addWorksheet('Admins');
      sheet.columns = [
        { header: 'User ID', key: 'userId' },
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Role / Privileges', key: 'role' },
        { header: 'Status', key: 'status' },
        { header: 'Account Created Date', key: 'createdAt' },
        { header: 'Last Login', key: 'lastLogin' },
        { header: 'Last Active', key: 'lastActive' },
        { header: 'Organization / Department', key: 'schoolOrOrg' },
        { header: 'System Title', key: 'title' }
      ];

      filteredAdmins.forEach((admin) => {
        const active = isUserActive(admin);

        sheet.addRow({
          userId: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.isOwner ? 'Platform Administrator (Owner)' : 'Platform Administrator',
          status: active ? 'Active' : 'Inactive',
          createdAt: formatDate(admin.createdAt),
          lastLogin: formatDate(admin.lastLogin || admin.lastActive),
          lastActive: formatDate(admin.lastActive),
          schoolOrOrg: admin.schoolOrOrg || 'Platform Administration',
          title: admin.title || 'Administrator'
        });
      });

      styleWorksheet(sheet, '9333EA'); // Deep Purple
    }

    // 6. Generate Buffer and Blob
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // 7. Generate filename strictly matching MashCode_User_Data_YYYY-MM-DD.xlsx
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const fileName = `MashCode_User_Data_${dateFormatted}.xlsx`;

    return {
      blob,
      fileName,
      recordCount: filteredUsers.length
    };
  }

  /**
   * Helper to trigger download in user's browser
   */
  static triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
