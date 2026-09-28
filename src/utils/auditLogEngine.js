// Central Audit Log & Track Changes Engine for J&J IAR Platform
// Manages Issue-Level Logs, Audit Report-Level Logs, and Executive Report-Level Logs

import initialIssueLogs from '../data/issueLogs.json';
import initialAuditReportLogs from '../data/auditReportLogs.json';
import initialExecutiveReportLogs from '../data/executiveReportLogs.json';

// In-Memory Reactive Store (initialized from JSON data)
let issueLogsStore = [...initialIssueLogs];
let auditReportLogsStore = [...initialAuditReportLogs];
let executiveReportLogsStore = [...initialExecutiveReportLogs];

// Listeners for real-time subscribers
const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach(fn => {
    try { fn(); } catch (err) { console.error('AuditLogEngine subscriber error:', err); }
  });
};

export const subscribeToLogUpdates = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

// Formats display timestamp
export const formatDisplayTime = (date = new Date()) => {
  const d = new Date(date);
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Today at ${timeStr}`;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${timeStr}`;
  }
  return `${d.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })} at ${timeStr}`;
};

// ==========================================
// TIER 1: ISSUE-LEVEL LOGS
// ==========================================

export const getLogsByIssueId = (issueId) => {
  if (!issueId) return [];
  const normalizedId = String(issueId).toUpperCase();
  return issueLogsStore
    .filter(log => String(log.issueId).toUpperCase() === normalizedId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const logIssueEvent = ({
  issueId,
  engagementId,
  actor,
  category = 'FIELD_EDIT',
  badgeType = 'update',
  action,
  fieldChanged = null,
  oldValue = null,
  newValue = null,
  details = {}
}) => {
  if (!issueId) return null;

  const now = new Date();
  const entry = {
    id: `LOG-ISS-${Date.now().toString().slice(-5)}`,
    issueId,
    engagementId: engagementId || null,
    timestamp: now.toISOString(),
    displayTime: formatDisplayTime(now),
    actor: {
      userId: actor?.userId || 'USR-CURRENT',
      name: actor?.name || 'Current User',
      role: actor?.role || 'Auditor',
      domain: actor?.domain || 'IT'
    },
    category,
    badgeType,
    action: action || 'Issue Modified',
    fieldChanged: fieldChanged || null,
    oldValue: oldValue !== undefined ? oldValue : null,
    newValue: newValue !== undefined ? newValue : null,
    details: details || {}
  };

  issueLogsStore.unshift(entry);
  notifyListeners();
  return entry;
};

// ==========================================
// TIER 2: AUDIT REPORT-LEVEL LOGS
// ==========================================

export const getAuditReportLogs = (engagementId, includeIssueMilestones = false) => {
  if (!engagementId) return [];
  const normalizedEngId = String(engagementId).toUpperCase();

  let logs = auditReportLogsStore.filter(log => 
    String(log.engagementId).toUpperCase() === normalizedEngId
  );

  if (includeIssueMilestones) {
    const rolledUpIssueLogs = issueLogsStore.filter(log =>
      String(log.engagementId).toUpperCase() === normalizedEngId &&
      (log.category === 'WORKFLOW_TRANSITION' || log.category === 'CALL_BACK' || log.category === 'EXCLUSION_TOGGLE')
    );
    logs = [...logs, ...rolledUpIssueLogs];
  }

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const logAuditReportEvent = ({
  engagementId,
  issueId = null,
  actor,
  category = 'WORKFLOW_TRANSITION',
  badgeType = 'workflow',
  action,
  fieldChanged = null,
  oldValue = null,
  newValue = null,
  details = {}
}) => {
  if (!engagementId) return null;

  const now = new Date();
  const entry = {
    id: `LOG-AUD-${Date.now().toString().slice(-5)}`,
    engagementId,
    issueId: issueId || null,
    timestamp: now.toISOString(),
    displayTime: formatDisplayTime(now),
    actor: {
      userId: actor?.userId || 'USR-CURRENT',
      name: actor?.name || 'Current User',
      role: actor?.role || 'Audit Manager',
      domain: actor?.domain || 'Cross-Domain'
    },
    category,
    badgeType,
    action: action || 'Audit Report Updated',
    fieldChanged: fieldChanged || null,
    oldValue: oldValue !== undefined ? oldValue : null,
    newValue: newValue !== undefined ? newValue : null,
    details: details || {}
  };

  auditReportLogsStore.unshift(entry);
  notifyListeners();
  return entry;
};

// ==========================================
// TIER 3: EXECUTIVE REPORT-LEVEL LOGS
// ==========================================

export const getExecutiveReportLogs = (engagementId) => {
  if (!engagementId) return executiveReportLogsStore;
  const normalizedEngId = String(engagementId).toUpperCase();

  const matched = executiveReportLogsStore.filter(log => 
    String(log.engagementId).toUpperCase() === normalizedEngId
  );

  // Fallback to all logs if specific engagement has no custom seed
  return (matched.length > 0 ? matched : executiveReportLogsStore)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const logExecutiveReportEvent = ({
  engagementId,
  actor,
  category = 'FIELD_EDIT',
  badgeType = 'update',
  action,
  fieldChanged = null,
  oldValue = null,
  newValue = null,
  details = {}
}) => {
  const now = new Date();
  const entry = {
    id: `LOG-EXEC-${Date.now().toString().slice(-5)}`,
    engagementId: engagementId || 'REP-2026-001',
    timestamp: now.toISOString(),
    displayTime: formatDisplayTime(now),
    actor: {
      userId: actor?.userId || 'USR-CURRENT',
      name: actor?.name || 'Current User',
      role: actor?.role || 'Lead Auditor',
      domain: actor?.domain || 'Cross-Domain'
    },
    category,
    badgeType,
    action: action || 'Executive Summary Updated',
    fieldChanged: fieldChanged || null,
    oldValue: oldValue !== undefined ? oldValue : null,
    newValue: newValue !== undefined ? newValue : null,
    details: details || {}
  };

  executiveReportLogsStore.unshift(entry);
  notifyListeners();
  return entry;
};
