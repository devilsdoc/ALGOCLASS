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
 * Calculates student assignment completion rate across enrolled classrooms
 */
function calculateStudentAssignmentCompletion(
  studentId: string,
  classes: ReturnType<typeof storage.getClasses>,
  members: ReturnType<typeof storage.getMembers>,
  assignments: ReturnType<typeof storage.getAssignments>,
  submissions: ReturnType<typeof storage.getSubmissions>
): { totalAssigned: number; completedCount: number; completionRate: number; enrolledClassNames: string[] } {
  const studentMemberships = members.filter((m) => m.studentId === studentId);
  const enrolledClassIds = new Set(studentMemberships.map((m) => m.classId));
  const enrolledClasses = classes.filter((c) => enrolledClassIds.has(c.id));
  const enrolledClassNames = enrolledClasses.map((c) => c.name);

  const studentAssignments = assignments.filter((a) => enrolledClassIds.has(a.classId));
  const acceptedSubmissions = submissions.filter((s) => s.studentId === studentId && s.status === 'Accepted');
  const acceptedProblemIds = new Set(acceptedSubmissions.map((s) => s.problemId));

  let totalProblemsAssigned = 0;
  let completedProblemsCount = 0;

  for (const asgn of studentAssignments) {
    totalProblemsAssigned += asgn.problemIds.length;
    const solvedInAsgn = asgn.problemIds.filter((pId) => acceptedProblemIds.has(pId));
    completedProblemsCount += solvedInAsgn.length;
  }

  const completionRate =
    totalProblemsAssigned > 0 ? Math.round((completedProblemsCount / totalProblemsAssigned) * 100) : 100;

  return {
    totalAssigned: totalProblemsAssigned,
    completedCount: completedProblemsCount,
    completionRate,
    enrolledClassNames
  };
}

/**
 * Calculates teacher metrics across created classrooms
 */
function calculateTeacherMetrics(
  teacherId: string,
  classes: ReturnType<typeof storage.getClasses>,
  members: ReturnType<typeof storage.getMembers>,
  assignments: ReturnType<typeof storage.getAssignments>,
  announcements: ReturnType<typeof storage.getAnnouncements>
): {
  classesCreatedCount: number;
  classNames: string[];
  totalUniqueStudents: number;
  assignmentsCreatedCount: number;
  announcementsCreatedCount: number;
  totalAssignedProblems: number;
} {
  const teacherClasses = classes.filter((c) => c.teacherId === teacherId);
  const classIds = new Set(teacherClasses.map((c) => c.id));
  const classNames = teacherClasses.map((c) => c.name);

  const classMembers = members.filter((m) => classIds.has(m.classId));
  const uniqueStudents = new Set(classMembers.map((m) => m.studentId));

  const teacherAssignments = assignments.filter((a) => a.teacherId === teacherId || classIds.has(a.classId));
  const teacherAnnouncements = announcements.filter((a) => a.teacherId === teacherId || classIds.has(a.classId));

  let totalAssignedProblems = 0;
  for (const a of teacherAssignments) {
    totalAssignedProblems += a.problemIds.length;
  }

  return {
    classesCreatedCount: teacherClasses.length,
    classNames,
    totalUniqueStudents: uniqueStudents.size,
    assignmentsCreatedCount: teacherAssignments.length,
    announcementsCreatedCount: teacherAnnouncements.length,
    totalAssignedProblems
  };
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

  headerRow.eachCell({ includeEmpty: false }, (cell) => {
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
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
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
      Boolean(requesterUser.isOwner) ||
      requesterUser.id === 'admin-1';

    if (!isAdminOrOwner) {
      throw new Error(
        'Access Denied: Platform Administrator or System Owner privileges are required to export database records.'
      );
    }
  }

  /**
   * Preview real record counts matching the provided export filters
   */
  static getFilteredCounts(options: ExportFilterOptions): ExportPreviewStats {
    const rawUsers = storage.getUsers();
    const rawClasses = storage.getClasses();
    const rawAssignments = storage.getAssignments();
    const rawSubmissions = storage.getSubmissions();

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

    // Filtered classes & assignments & submissions by date if applicable
    const filteredClasses = rawClasses.filter((c) =>
      isDateInRange(c.createdAt, options.dateRange, options.customStartDate, options.customEndDate)
    );
    const filteredAssignments = rawAssignments.filter((a) =>
      isDateInRange(a.createdAt, options.dateRange, options.customStartDate, options.customEndDate)
    );
    const filteredSubmissions = rawSubmissions.filter((s) =>
      isDateInRange(s.submittedAt, options.dateRange, options.customStartDate, options.customEndDate)
    );

    return {
      totalUsers: filteredUsers.length,
      studentsCount,
      teachersCount,
      adminsCount,
      classesCount: filteredClasses.length,
      assignmentsCount: filteredAssignments.length,
      submissionsCount: filteredSubmissions.length
    };
  }

  /**
   * Generates a multi-sheet Excel (.xlsx) file with all database records, formatted fields,
   * bold headers, filters, frozen top rows, and auto column widths.
   *
   * STRICT SECURITY MANDATE: Passwords, tokens, and sensitive auth data are NEVER exported.
   */
  static async exportUserDataToExcel(
    requesterUser: User,
    options: ExportFilterOptions
  ): Promise<{ blob: Blob; fileName: string; recordCount: number }> {
    // 1. Strict Backend Authorization Check
    this.verifyAdminAuthorization(requesterUser);

    // 2. Fetch live database records from storage engine
    const rawUsers = storage.getUsers();
    const rawClasses = storage.getClasses();
    const rawMembers = storage.getMembers();
    const rawAssignments = storage.getAssignments();
    const rawSubmissions = storage.getSubmissions();
    const rawAnnouncements = storage.getAnnouncements();

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

    // Filter classes, assignments and submissions by date range
    const filteredClasses = rawClasses.filter((c) =>
      isDateInRange(c.createdAt, options.dateRange, options.customStartDate, options.customEndDate)
    );
    const filteredAssignments = rawAssignments.filter((a) =>
      isDateInRange(a.createdAt, options.dateRange, options.customStartDate, options.customEndDate)
    );
    const filteredSubmissions = rawSubmissions.filter((s) =>
      isDateInRange(s.submittedAt, options.dateRange, options.customStartDate, options.customEndDate)
    );

    // 4. Initialize ExcelJS Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = `AlgoClass Platform Admin (${requesterUser.name})`;
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

      styleWorksheet(sheet, '312E81');
    }

    // -------------------------------------------------------------
    // SHEET 2: STUDENTS
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
        { header: 'Joined Classes (Count)', key: 'joinedClassesCount' },
        { header: 'Joined Class Names', key: 'joinedClassesList' },
        { header: 'Total Assigned Problems', key: 'totalAssigned' },
        { header: 'Completed Assigned Problems', key: 'completedAssigned' },
        { header: 'Assignment Completion Rate (%)', key: 'assignmentCompletionRate' },
        { header: 'Organization', key: 'schoolOrOrg' }
      ];

      filteredStudents.forEach((student) => {
        const active = isUserActive(student);
        const stats = calculateStudentAssignmentCompletion(
          student.id,
          rawClasses,
          rawMembers,
          rawAssignments,
          rawSubmissions
        );

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
          joinedClassesCount: stats.enrolledClassNames.length,
          joinedClassesList: stats.enrolledClassNames.join(', ') || 'None',
          totalAssigned: stats.totalAssigned,
          completedAssigned: stats.completedCount,
          assignmentCompletionRate: `${stats.completionRate}%`,
          schoolOrOrg: student.schoolOrOrg || 'N/A'
        });
      });

      styleWorksheet(sheet, '047857'); // Emerald green
    }

    // -------------------------------------------------------------
    // SHEET 3: TEACHERS
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
        { header: 'Classes Created (Count)', key: 'classesCreated' },
        { header: 'Classes Created Names', key: 'classesList' },
        { header: 'Total Students Enrolled', key: 'totalStudents' },
        { header: 'Assignments Created', key: 'assignmentsCreated' },
        { header: 'Announcements Created', key: 'announcementsCreated' },
        { header: 'Total Problems in Assignments', key: 'totalProblemsAssigned' },
        { header: 'Department / Organization', key: 'schoolOrOrg' },
        { header: 'Professional Title', key: 'title' }
      ];

      filteredTeachers.forEach((teacher) => {
        const active = isUserActive(teacher);
        const metrics = calculateTeacherMetrics(
          teacher.id,
          rawClasses,
          rawMembers,
          rawAssignments,
          rawAnnouncements
        );

        sheet.addRow({
          userId: teacher.id,
          name: teacher.name,
          email: teacher.email,
          status: active ? 'Active' : 'Inactive',
          createdAt: formatDate(teacher.createdAt),
          lastLogin: formatDate(teacher.lastLogin || teacher.lastActive),
          lastActive: formatDate(teacher.lastActive),
          classesCreated: metrics.classesCreatedCount,
          classesList: metrics.classNames.join(', ') || 'None',
          totalStudents: metrics.totalUniqueStudents,
          assignmentsCreated: metrics.assignmentsCreatedCount,
          announcementsCreated: metrics.announcementsCreatedCount,
          totalProblemsAssigned: metrics.totalAssignedProblems,
          schoolOrOrg: teacher.schoolOrOrg || 'N/A',
          title: teacher.title || 'N/A'
        });
      });

      styleWorksheet(sheet, '6D28D9'); // Violet / Purple
    }

    // -------------------------------------------------------------
    // SHEET 4: CLASSES
    // -------------------------------------------------------------
    if (options.includeSheets.classes) {
      const sheet = workbook.addWorksheet('Classes');
      sheet.columns = [
        { header: 'Class ID', key: 'classId' },
        { header: 'Class Name', key: 'className' },
        { header: 'Join Code', key: 'joinCode' },
        { header: 'Teacher ID', key: 'teacherId' },
        { header: 'Teacher Name', key: 'teacherName' },
        { header: 'Teacher Email', key: 'teacherEmail' },
        { header: 'Subject / Domain', key: 'subject' },
        { header: 'Academic Year', key: 'academicYear' },
        { header: 'Total Enrolled Students', key: 'enrolledStudents' },
        { header: 'Total Assignments', key: 'assignmentsCount' },
        { header: 'Total Announcements', key: 'announcementsCount' },
        { header: 'Created Date', key: 'createdAt' }
      ];

      filteredClasses.forEach((cls) => {
        const enrolled = rawMembers.filter((m) => m.classId === cls.id).length;
        const asgns = rawAssignments.filter((a) => a.classId === cls.id).length;
        const anncs = rawAnnouncements.filter((a) => a.classId === cls.id).length;

        sheet.addRow({
          classId: cls.id,
          className: cls.name,
          joinCode: cls.joinCode,
          teacherId: cls.teacherId,
          teacherName: cls.teacherName,
          teacherEmail: cls.teacherEmail,
          subject: cls.subject || 'Computer Science',
          academicYear: cls.academicYear || '2026',
          enrolledStudents: enrolled,
          assignmentsCount: asgns,
          announcementsCount: anncs,
          createdAt: formatDate(cls.createdAt)
        });
      });

      styleWorksheet(sheet, '1E40AF'); // Navy Blue
    }

    // -------------------------------------------------------------
    // SHEET 5: ASSIGNMENTS
    // -------------------------------------------------------------
    if (options.includeSheets.assignments) {
      const sheet = workbook.addWorksheet('Assignments');
      sheet.columns = [
        { header: 'Assignment ID', key: 'assignmentId' },
        { header: 'Assignment Title', key: 'title' },
        { header: 'Class ID', key: 'classId' },
        { header: 'Class Name', key: 'className' },
        { header: 'Teacher ID', key: 'teacherId' },
        { header: 'Teacher Name', key: 'teacherName' },
        { header: 'Total Problems', key: 'totalProblems' },
        { header: 'Due Date / Deadline', key: 'deadline' },
        { header: 'Created Date', key: 'createdAt' },
        { header: 'Status', key: 'status' },
        { header: 'Enrolled Class Students', key: 'enrolledStudents' },
        { header: 'Students Completed Count', key: 'completedStudents' },
        { header: 'Class Completion Rate (%)', key: 'completionRate' }
      ];

      filteredAssignments.forEach((asgn) => {
        const classRoom = rawClasses.find((c) => c.id === asgn.classId);
        const classMembers = rawMembers.filter((m) => m.classId === asgn.classId);
        const enrolledCount = classMembers.length;

        // Calculate students who solved all problems in this assignment
        let completedStudentsCount = 0;
        const now = Date.now();
        const isPastDue = new Date(asgn.deadline).getTime() < now;

        classMembers.forEach((member) => {
          const studentAccepted = new Set(
            rawSubmissions
              .filter((s) => s.studentId === member.studentId && s.status === 'Accepted')
              .map((s) => s.problemId)
          );
          const allSolved = asgn.problemIds.every((pId) => studentAccepted.has(pId));
          if (allSolved && asgn.problemIds.length > 0) {
            completedStudentsCount += 1;
          }
        });

        const completionPercent =
          enrolledCount > 0 ? Math.round((completedStudentsCount / enrolledCount) * 100) : 0;

        sheet.addRow({
          assignmentId: asgn.id,
          title: asgn.title,
          classId: asgn.classId,
          className: asgn.className || classRoom?.name || 'N/A',
          teacherId: asgn.teacherId,
          teacherName: asgn.teacherName,
          totalProblems: asgn.problemIds.length,
          deadline: formatDate(asgn.deadline),
          createdAt: formatDate(asgn.createdAt),
          status: isPastDue ? 'Past Due' : 'Active',
          enrolledStudents: enrolledCount,
          completedStudents: completedStudentsCount,
          completionRate: `${completionPercent}%`
        });
      });

      styleWorksheet(sheet, 'C2410C'); // Burnt Orange
    }

    // -------------------------------------------------------------
    // SHEET 6: SUBMISSIONS
    // -------------------------------------------------------------
    if (options.includeSheets.submissions) {
      const sheet = workbook.addWorksheet('Submissions');
      sheet.columns = [
        { header: 'Submission ID', key: 'submissionId' },
        { header: 'Student ID', key: 'studentId' },
        { header: 'Student Name', key: 'studentName' },
        { header: 'Problem ID', key: 'problemId' },
        { header: 'Problem Title', key: 'problemTitle' },
        { header: 'Difficulty', key: 'difficulty' },
        { header: 'Language', key: 'language' },
        { header: 'Status', key: 'status' },
        { header: 'Execution Time (ms)', key: 'executionTime' },
        { header: 'Memory Used (MB)', key: 'memory' },
        { header: 'Passed Tests', key: 'passedTests' },
        { header: 'Total Tests', key: 'totalTests' },
        { header: 'Solving Time (Sec)', key: 'solvingTimeSec' },
        { header: 'Solving Time (Formatted)', key: 'solvingTimeFormatted' },
        { header: 'Submitted At', key: 'submittedAt' },
        { header: 'Assignment ID', key: 'assignmentId' }
      ];

      filteredSubmissions.forEach((sub) => {
        sheet.addRow({
          submissionId: sub.id,
          studentId: sub.studentId,
          studentName: sub.studentName,
          problemId: sub.problemId,
          problemTitle: sub.problemTitle,
          difficulty: sub.problemDifficulty,
          language: sub.language.toUpperCase(),
          status: sub.status,
          executionTime: sub.executionTime,
          memory: sub.memory,
          passedTests: sub.passedCount,
          totalTests: sub.totalCount,
          solvingTimeSec: sub.solvingTimeSeconds || 'N/A',
          solvingTimeFormatted: sub.solvingTimeFormatted || 'N/A',
          submittedAt: formatDate(sub.submittedAt),
          assignmentId: sub.assignmentId || 'Practice'
        });
      });

      styleWorksheet(sheet, '0F766E'); // Teal
    }

    // 5. Generate Buffer and Blob
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // 6. Generate filename strictly matching AlgoClass_User_Data_YYYY-MM-DD.xlsx
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const fileName = `AlgoClass_User_Data_${dateFormatted}.xlsx`;

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
