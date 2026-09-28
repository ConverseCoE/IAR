// ==============================================================================
// Assessments, Engagements, Assignments, Roles & Users Table Data Layer
// Johnson & Johnson Internal Audit Reporting (IAR)
// Data is stored directly as pure JSON tables mirroring the project database.
// ==============================================================================

import assessmentsData from './assessments.json' with { type: 'json' };
import usersData from './users.json' with { type: 'json' };
import rolesData from './roles.json' with { type: 'json' };
import engagementsData from './engagements.json' with { type: 'json' };
import assignmentsData from './assignments.json' with { type: 'json' };
import testProceduresData from './testProcedures.json' with { type: 'json' };
import issuesData from './issues.json' with { type: 'json' };

// Pure table datasets loaded directly from JSON
export const assessments = assessmentsData;
export const users = usersData;
export const roles = rolesData;
export const engagements = engagementsData;
export const assignments = assignmentsData;
export const testProcedures = testProceduresData;
export const issues = issuesData;

// Lookup maps for fast indexing
export const userMap = Object.fromEntries(users.map(u => [u.id, u]));
export const roleMap = Object.fromEntries(roles.map(r => [r.id, r]));
export const assessmentMap = Object.fromEntries(assessments.map(a => [a.id, a]));

// Group assignments by engagementId and jobId
export const engagementAssignments = {};
assignments.forEach(asg => {
  if (asg.engagementId) {
    if (!engagementAssignments[asg.engagementId]) {
      engagementAssignments[asg.engagementId] = [];
    }
    engagementAssignments[asg.engagementId].push(asg);
  }
  if (asg.jobId && asg.jobId !== asg.engagementId) {
    if (!engagementAssignments[asg.jobId]) {
      engagementAssignments[asg.jobId] = [];
    }
    engagementAssignments[asg.jobId].push(asg);
  }
});

// ==============================================================================
// Query & Helper Utilities
// ==============================================================================

/**
 * Retrieve all assessments (2024 Re-Opened, 2025 Closed, 2026 Open, 2027 Open).
 */
export const getAssessments = () => assessments;

/**
 * Retrieve an assessment by ID (e.g. 'ASM-2025', 'ASM-2026', 'ASM-2027').
 */
export const getAssessmentById = (assessmentId) => assessmentMap[assessmentId] || null;

/**
 * Retrieve all engagements created under a specific assessment.
 */
export const getEngagementsByAssessment = (assessmentId) => {
  if (!assessmentId) return engagements;
  return engagements.filter(e => e.assessmentId === assessmentId);
};

/**
 * Retrieve all assignments created under a specific assessment.
 */
export const getAssignmentsByAssessment = (assessmentId) => {
  if (!assessmentId) return assignments;
  return assignments.filter(a => a.assessmentId === assessmentId);
};

/**
 * Retrieve all assignments for a given engagement ID or Job ID.
 */
export const getAssignmentsByEngagement = (engagementIdOrJobId) => {
  if (!engagementIdOrJobId) return engagementAssignments["REP-2026-001"] || [];
  return engagementAssignments[engagementIdOrJobId] || engagementAssignments["REP-2026-001"] || [];
};

/**
 * Retrieve users assigned to a specific role in an engagement.
 */
export const getUsersByEngagementAndRole = (engagementIdOrJobId, roleId) => {
  const asgs = getAssignmentsByEngagement(engagementIdOrJobId);
  const matched = asgs.find(a => a.roleId === roleId);
  return matched ? matched.users : [];
};

/**
 * Retrieve a user by unique ID.
 */
export const getUserById = (userId) => userMap[userId] || null;

/**
 * Retrieve assessment metadata for a given engagement ID or Job ID.
 */
export const getAssessmentForEngagement = (engagementIdOrJobId) => {
  const asgs = getAssignmentsByEngagement(engagementIdOrJobId);
  if (asgs && asgs.length > 0) {
    const asg = asgs[0];
    return {
      id: asg.assessmentId,
      name: asg.assessmentName,
      status: asg.assessmentStatus
    };
  }
  return { id: "ASM-2026", name: "2026 Internal Audit Assessments", status: "Open" };
};

/**
 * Retrieve all engagements and roles played by a specific user across assessments.
 */
export const getUserEngagements = (userId) => {
  const user = userMap[userId];
  if (!user) return [];

  const results = [];
  assignments.forEach(asg => {
    if (asg.userIds && asg.userIds.includes(userId)) {
      results.push({
        assessmentId: asg.assessmentId,
        assessmentName: asg.assessmentName,
        engagementId: asg.engagementId,
        jobId: asg.jobId,
        engagementName: asg.engagementName,
        plant: asg.plant,
        roleId: asg.roleId,
        roleName: asg.roleName,
        function: asg.function,
        isAlternateRole: asg.roleId !== user.baselineRole,
        baselineRoleId: user.baselineRole
      });
    }
  });

  return results;
};

/**
 * Returns a role comparison report showing which users play different roles
 * in the designated rotation engagement (REP-2026-004 / 20260884).
 */
export const getRoleComparisonMatrix = () => {
  const specialEngId = "REP-2026-004";
  const specialAsgs = engagementAssignments[specialEngId] || [];
  const baselineAsgs = engagementAssignments["REP-2026-001"] || [];

  return users.map(user => {
    const stdAsg = baselineAsgs.find(a => a.userIds && a.userIds.includes(user.id));
    const rotAsg = specialAsgs.find(a => a.userIds && a.userIds.includes(user.id));

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      standardRole: stdAsg ? stdAsg.roleName : "None",
      rotatedRole: rotAsg ? rotAsg.roleName : "None",
      isDifferentInSpecialEngagement: (stdAsg?.roleId !== rotAsg?.roleId) && !!rotAsg
    };
  }).filter(item => item.standardRole !== "None" || item.rotatedRole !== "None");
};

/**
 * Retrieve all test procedures applicable to a specific engagement ID or Job ID.
 */
export const getTestProceduresByEngagement = (engagementIdOrJobId) => {
  if (!engagementIdOrJobId) return testProcedures;
  return testProcedures.filter(
    tp => tp.engagementId === engagementIdOrJobId || tp.jobId === engagementIdOrJobId
  );
};

/**
 * Retrieve all issues created under a specific engagement ID or Job ID.
 */
export const getIssuesByEngagement = (engagementIdOrJobId) => {
  if (!engagementIdOrJobId) return issues;
  return issues.filter(
    iss => iss.engagementId === engagementIdOrJobId || iss.jobId === engagementIdOrJobId
  );
};

/**
 * Retrieve all issues created under a specific test procedure.
 */
export const getIssuesByTestProcedure = (testProcedureIdOrCode) => {
  if (!testProcedureIdOrCode) return [];
  return issues.filter(
    iss => iss.testProcedureId === testProcedureIdOrCode || iss.testProcedureCode === testProcedureIdOrCode
  );
};

export { getInitialReportingJobs } from '../utils/auditWorkflowEngine.js';

export default assignments;
