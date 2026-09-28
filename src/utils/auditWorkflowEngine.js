// ==============================================================================
// Audit Workflow Engine: Engagement Status, Current Queue & Current Owner Resolver
// Johnson & Johnson Internal Audit Reporting (IAR)
// ==============================================================================

import { 
  engagements,
  getIssuesByEngagement, 
  getTestProceduresByEngagement,
  getAssignmentsByEngagement,
  getUsersByEngagementAndRole 
} from '../data/assignmentsData.js';

/**
 * Standard Status Tokens
 */
export const ENGAGEMENT_STATUS = {
  NOT_STARTED: 'Not Started',
  AUDIT_IN_PROGRESS: 'Audit Report Inprogress',
  EXEC_IN_PROGRESS: 'Executive Report Inprogress',
  COMPLETED: 'Completed'
};

/**
 * Resolves the role-level queue and user-level owners dynamically based on:
 * 1. Engagement state (Not Started, In Progress, Completed)
 * 2. Issue-level distribution (Staff, TC, Manager, Director, VP, Business)
 * 3. Team assignments mapped to this specific engagement
 */
export const getEngagementWorkflowState = (job) => {
  if (!job) {
    return {
      status: ENGAGEMENT_STATUS.NOT_STARTED,
      queue: 'Staff',
      queueBadge: 'Staff',
      owners: ['Unassigned'],
      ownerText: 'Unassigned',
      isPendingBusiness: false
    };
  }

  const jobId = job.jobId || job.id;
  const issues = (job.issuesList && job.issuesList.length > 0)
    ? job.issuesList
    : getIssuesByEngagement(jobId);

  // 1. Resolve Engagement Status
  let status = ENGAGEMENT_STATUS.NOT_STARTED;
  const rawStatus = (job.status || '').toLowerCase();
  const rawSubStatus = (job.subStatus || '').toLowerCase();

  if (
    rawStatus === 'completed' || 
    rawSubStatus.includes('executive report completed') || 
    job.assessmentStatus === 'Closed'
  ) {
    status = ENGAGEMENT_STATUS.COMPLETED;
  } else if (
    rawStatus.includes('executive report') || 
    rawSubStatus.includes('executive report')
  ) {
    status = ENGAGEMENT_STATUS.EXEC_IN_PROGRESS;
  } else if (issues.length > 0 || rawStatus === 'in progress' || rawStatus.includes('audit report')) {
    status = ENGAGEMENT_STATUS.AUDIT_IN_PROGRESS;
  } else {
    status = ENGAGEMENT_STATUS.NOT_STARTED;
  }

  // 2. Resolve Role Assignments for this Engagement
  const staffUsers = getUsersByEngagementAndRole(jobId, 'it-auditor')
    .concat(getUsersByEngagementAndRole(jobId, 'finops-auditor'));
  const tcUsers = getUsersByEngagementAndRole(jobId, 'it-team-coordinator')
    .concat(getUsersByEngagementAndRole(jobId, 'finops-team-coordinator'));
  const mgrUsers = getUsersByEngagementAndRole(jobId, 'it-manager')
    .concat(getUsersByEngagementAndRole(jobId, 'finops-manager'));
  const dirUsers = getUsersByEngagementAndRole(jobId, 'it-director')
    .concat(getUsersByEngagementAndRole(jobId, 'finops-director'));
  const vpUsers = getUsersByEngagementAndRole(jobId, 'it-vp')
    .concat(getUsersByEngagementAndRole(jobId, 'finops-vp'));
  const bizUsers = getUsersByEngagementAndRole(jobId, 'business-contact');

  // Fallbacks if assignments empty
  const defaultStaff = staffUsers.length > 0 ? staffUsers.map(u => u.name) : ['Marcus Vance'];
  const defaultTC = tcUsers.length > 0 ? tcUsers.map(u => u.name) : ['Kevin Zhang'];
  const defaultMgr = mgrUsers.length > 0 ? mgrUsers.map(u => u.name) : ['Amanda Palmer'];
  const defaultDir = dirUsers.length > 0 ? dirUsers.map(u => u.name) : ['Brian Cox'];
  const defaultVP = vpUsers.length > 0 ? vpUsers.map(u => u.name) : ['Robert Chen'];
  const defaultBiz = bizUsers.length > 0 ? bizUsers.map(u => u.name) : [job.leadOwner || 'Thomas Wright'];

  // 3. Resolve Current Queue & Current Owner based on Business Rules:
  // Rule A: Completed -> Closed / Finalized
  if (status === ENGAGEMENT_STATUS.COMPLETED) {
    return {
      status,
      queue: 'Closed',
      queueList: ['Closed'],
      queueVariant: 'completed',
      owners: ['QA Archive'],
      ownerText: 'QA Archive',
      ownersByRole: { 'Closed': ['QA Archive'] },
      isPendingBusiness: false,
      issuesCount: issues.length
    };
  }

  // Rule B: Not Started -> Staff
  if (status === ENGAGEMENT_STATUS.NOT_STARTED || issues.length === 0) {
    return {
      status: ENGAGEMENT_STATUS.NOT_STARTED,
      queue: 'Staff',
      queueList: ['Staff'],
      queueVariant: 'staff',
      owners: defaultStaff,
      ownerText: defaultStaff.join(', '),
      ownersByRole: { 'Staff': defaultStaff },
      isPendingBusiness: false,
      issuesCount: 0
    };
  }

  // Rule C: Report-Level Executive Review Gates (VP & Director)
  // Director and VP review the compiled report as a synchronized batch gate.
  // Only when ALL issues under an audit reach this milestone does the queue transition to Director or VP.
  const isAllVP = issues.length > 0 && issues.every(iss => (iss.status || '').toLowerCase().includes('vp'));
  if (isAllVP) {
    return {
      status,
      queue: 'Vice President',
      queueList: ['Vice President'],
      queueVariant: 'vp',
      owners: defaultVP,
      ownerText: defaultVP.join(', '),
      ownersByRole: { 'Vice President': defaultVP },
      isPendingBusiness: false,
      issuesCount: issues.length
    };
  }

  const isAllDirector = issues.length > 0 && issues.every(iss => {
    const s = (iss.status || '').toLowerCase();
    return s.includes('pending director') || s.includes('ready for director') || (s.includes('director') && !s.includes('ready'));
  });
  if (isAllDirector) {
    return {
      status,
      queue: 'Director',
      queueList: ['Director'],
      queueVariant: 'director',
      owners: defaultDir,
      ownerText: defaultDir.join(', '),
      ownersByRole: { 'Director': defaultDir },
      isPendingBusiness: false,
      issuesCount: issues.length
    };
  }

  // Rule E: Pre-Director Distributed Issue Workflow
  // Multiple issues are actively distributed across Staff, TC, Manager, or Business Contact.
  const ROLE_ORDER = [
    'Staff',
    'Team Coordinator',
    'Manager',
    'Business Contact'
  ];

  const activeRolesSet = new Set();
  const bizContactNames = [];

  issues.forEach(iss => {
    const s = ((iss.status || '') + ' ' + (iss.currentLevel || '')).toLowerCase();

    // Completed issues or issues waiting for other issues don't generate active reviewer queues
    if (s === 'completed' || s.includes('waiting other') || s.includes('waiting on other')) {
      return;
    }

    if (s.includes('business') || s.includes('auditee')) {
      activeRolesSet.add('Business Contact');
      const contact = iss.accountableContact || iss.primaryContact;
      if (contact) bizContactNames.push(contact);
    } else if (s.includes('manager') || s.includes('mgr')) {
      activeRolesSet.add('Manager');
    } else if (s.includes('tc') || s.includes('team coordinator') || s.includes('coordinator')) {
      activeRolesSet.add('Team Coordinator');
    } else {
      activeRolesSet.add('Staff');
    }
  });

  // Fallback if all remaining issues were waiting/completed
  if (activeRolesSet.size === 0) {
    activeRolesSet.add('Manager');
  }

  const queueList = ROLE_ORDER.filter(role => activeRolesSet.has(role));
  const queueText = queueList.join(', ');

  const resolvedOwners = [];
  const ownersByRole = {};

  queueList.forEach(role => {
    let roleOwners = [];
    if (role === 'Staff') roleOwners = defaultStaff;
    else if (role === 'Team Coordinator') roleOwners = defaultTC;
    else if (role === 'Manager') roleOwners = defaultMgr;
    else if (role === 'Business Contact') {
      roleOwners = bizContactNames.length > 0 ? Array.from(new Set(bizContactNames)) : defaultBiz;
    }

    ownersByRole[role] = roleOwners;
    roleOwners.forEach(name => {
      if (!resolvedOwners.includes(name)) {
        resolvedOwners.push(name);
      }
    });
  });

  let queueVariant = queueList.length === 1 ? queueList[0].toLowerCase().replace(' ', '-') : 'multi-role';

  return {
    status,
    queue: queueText,
    queueList,
    queueVariant,
    owners: resolvedOwners,
    ownerText: resolvedOwners.join(', '),
    ownersByRole,
    isPendingBusiness: activeRolesSet.has('Business Contact'),
    issuesCount: issues.length
  };
};

/**
 * Initializes the default audit list state directly from engagements.json,
 * enriching each engagement with its dynamic issues from issues.json, test procedures
 * from testProcedures.json, assignments from assignments.json, and workflow status.
 */
export const getInitialReportingJobs = () => {
  return engagements.map(eng => {
    const jobId = eng.jobId || eng.id;
    const engId = eng.id || eng.jobId;
    const issuesList = getIssuesByEngagement(engId);
    const testProceduresList = getTestProceduresByEngagement(engId);
    const asgs = getAssignmentsByEngagement(engId);
    const wf = getEngagementWorkflowState({ ...eng, issuesList });

    let status = eng.status || 'Not Started';
    let subStatus = eng.subStatus || (status === 'Not Started' ? 'Not Started' : 'Audit Report In Progress');
    if (wf.status === ENGAGEMENT_STATUS.NOT_STARTED) {
      status = 'Not Started';
      subStatus = 'Not Started';
    } else if (wf.status === ENGAGEMENT_STATUS.COMPLETED) {
      status = 'Completed';
      subStatus = 'Executive Report Completed';
    } else if (wf.status === ENGAGEMENT_STATUS.EXEC_IN_PROGRESS) {
      status = 'In Progress';
      subStatus = 'Executive Report In Progress';
    } else if (wf.status === ENGAGEMENT_STATUS.AUDIT_IN_PROGRESS) {
      status = 'In Progress';
      subStatus = 'Audit Report In Progress';
    }

    return {
      id: eng.id,
      jobId: eng.jobId,
      reportId: eng.id,
      fileName: eng.fileName,
      engagement: eng.engagementName,
      engagementName: eng.engagementName,
      plant: eng.plant,
      year: eng.year,
      assessmentId: eng.assessmentId,
      assessmentName: eng.assessmentName,
      assessmentStatus: eng.assessmentStatus,
      leadOwner: eng.leadOwner,
      businessContactId: eng.businessContactId,
      status: status,
      subStatus: subStatus,
      workflowStatus: wf.status,
      executionStatus: eng.executionStatus || (status === 'Completed' ? 'Completed' : (status === 'Not Started' ? 'Pending' : 'Running')),
      currentQueue: wf.queue,
      currentQueueList: wf.queueList,
      currentOwner: wf.ownerText,
      currentOwners: wf.owners,
      ownersByRole: wf.ownersByRole,
      queueVariant: wf.queueVariant,
      aging: status === 'Not Started' ? '1 day 2.15 Hours' : (status === 'Completed' ? '11 days 4.00 Hours' : '3 days 5.20 Hours'),
      lastUpdated: status === 'Completed' ? '2026-07-31 16:20:00' : '2026-08-04 14:30:00',
      discussionPoints: {
        count: issuesList.length,
        status: status === 'Completed' ? 'Completed' : (issuesList.length > 0 ? 'Active' : 'Active'),
        startDateTime: '2026-08-01 08:30:00',
        endDateTime: '2026-08-04 14:30:00'
      },
      auditReport: {
        executionStatus: status === 'Completed' ? 'Completed' : (status === 'Not Started' ? 'Pending' : 'Running'),
        validationStatus: status === 'Completed' ? 'Approved' : (status === 'Not Started' ? 'Not Started' : 'In Progress'),
        genAiExtractionDateTime: '2026-08-01 09:00:00',
        validationStartDateTime: '2026-08-01 10:00:00',
        validationEndDateTime: '2026-08-04 14:00:00'
      },
      executiveSummaryReport: {
        executionStatus: status === 'Completed' ? 'Completed' : 'Pending',
        validationStatus: status === 'Completed' ? 'Approved' : 'Not Started',
        genAiExtractionDateTime: '2026-08-01 09:30:00',
        validationStartDateTime: '2026-08-01 10:30:00',
        validationEndDateTime: '2026-08-04 14:15:00'
      },
      issuesList: issuesList,
      testProcedures: testProceduresList,
      itDiscussion: {
        status: issuesList.filter(i => (i.tech === 'IT' || i.functionType === 'IT')).length > 0 ? "In Progress" : "Not started",
        lastUpdated: "2026-08-04",
        items: issuesList.filter(i => (i.tech === 'IT' || i.functionType === 'IT'))
      },
      finOpsDiscussion: {
        status: issuesList.filter(i => (i.tech === 'FinOps' || i.functionType === 'FinOps')).length > 0 ? "In Progress" : "Not started",
        lastUpdated: "2026-08-04",
        items: issuesList.filter(i => (i.tech === 'FinOps' || i.functionType === 'FinOps'))
      },
      issueIndicator: {
        count: issuesList.length,
        critical: issuesList.filter(i => i.severity === 'Critical' || i.criticality === 'Critical').length,
        minor: issuesList.filter(i => i.severity === 'Minor' || i.criticality === 'Minor').length,
        issues: issuesList
      },
      roster: asgs.map(a => ({
        role: a.roleName,
        name: a.users && a.users.length > 0 ? a.users.map(u => u.name).join(', ') : 'Unassigned',
        avatar: a.users && a.users.length > 0 ? a.users[0].name.split(' ').map(n => n[0]).join('') : 'U',
        status: a.roleName.includes('Auditor') ? 'Assigned' : 'Reviewer'
      }))
    };
  });
};

export default {
  ENGAGEMENT_STATUS,
  getEngagementWorkflowState,
  getInitialReportingJobs
};
