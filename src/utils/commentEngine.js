// Central Field Comments & Collaboration Engine for J&J IAR Platform
// Manages Issue-Level Field Comments, Executive Report Comments, and Workflow Transition Notes

import initialComments from '../data/comments.json';
import { logIssueEvent, logExecutiveReportEvent } from './auditLogEngine';

// In-Memory Reactive Store (initialized from JSON data)
let commentsStore = [...initialComments];

// Listeners for real-time subscribers
const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach(fn => {
    try { fn(); } catch (err) { console.error('CommentEngine subscriber error:', err); }
  });
};

export const subscribeToCommentUpdates = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

// Formats display timestamp
export const formatCommentTime = (date = new Date()) => {
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
  return `${d.toLocaleDateString([], { month: '2-digit', day: '2-digit' })} at ${timeStr}`;
};

// ==========================================
// QUERY METHODS
// ==========================================

export const getAllComments = () => [...commentsStore];

/**
 * Returns comments for an issue grouped by fieldKey: { [fieldKey]: Comment[] }
 */
export const getCommentsGroupedByField = (issueId) => {
  if (!issueId) return {};
  const normalizedId = String(issueId).toUpperCase();
  const issueComments = commentsStore.filter(c => 
    c.issueId && String(c.issueId).toUpperCase() === normalizedId
  );

  const grouped = {};
  issueComments.forEach(c => {
    if (!grouped[c.fieldKey]) {
      grouped[c.fieldKey] = [];
    }
    grouped[c.fieldKey].push(c);
  });
  return grouped;
};

export const getCommentsForIssueField = (issueId, fieldKey) => {
  if (!issueId || !fieldKey) return [];
  const normalizedId = String(issueId).toUpperCase();
  return commentsStore.filter(c => 
    c.issueId && 
    String(c.issueId).toUpperCase() === normalizedId && 
    c.fieldKey === fieldKey
  );
};

/**
 * Returns comments for an executive report grouped by fieldKey: { [fieldKey]: Comment[] }
 */
export const getExecutiveCommentsGrouped = (engagementId) => {
  const normalizedEngId = engagementId ? String(engagementId).toUpperCase() : null;
  const execComments = commentsStore.filter(c => 
    c.targetType === 'EXECUTIVE_FIELD' && 
    (!normalizedEngId || String(c.engagementId).toUpperCase() === normalizedEngId)
  );

  const grouped = {};
  execComments.forEach(c => {
    if (!grouped[c.fieldKey]) {
      grouped[c.fieldKey] = [];
    }
    grouped[c.fieldKey].push(c);
  });
  return grouped;
};

export const getCommentsForExecutiveField = (engagementId, fieldKey) => {
  if (!fieldKey) return [];
  const normalizedEngId = engagementId ? String(engagementId).toUpperCase() : null;
  return commentsStore.filter(c => 
    c.targetType === 'EXECUTIVE_FIELD' && 
    (!normalizedEngId || !c.engagementId || String(c.engagementId).toUpperCase() === normalizedEngId) && 
    c.fieldKey === fieldKey
  );
};

/**
 * Returns workflow transition hand-off comments for an issue or engagement
 */
export const getTransitionComments = (engagementId, issueId = null) => {
  const normalizedEngId = engagementId ? String(engagementId).toUpperCase() : null;
  const normalizedIssueId = issueId ? String(issueId).toUpperCase() : null;
  return commentsStore.filter(c => {
    if (c.targetType !== 'WORKFLOW_TRANSITION') return false;
    if (normalizedIssueId && c.issueId && String(c.issueId).toUpperCase() !== normalizedIssueId) return false;
    if (normalizedEngId && c.engagementId && String(c.engagementId).toUpperCase() !== normalizedEngId) return false;
    return true;
  });
};

// ==========================================
// RESOLUTION GOVERNANCE
// ==========================================

/**
 * Checks whether the current user is permitted to mark a comment as done
 */
export const canUserResolveComment = (comment, currentUser = {}) => {
  if (!comment) return { canResolve: false, reason: 'Invalid comment' };
  if (comment.isResolved) return { canResolve: false, reason: 'Comment already resolved' };

  // Rule 1: Generic Comment (no tagged person)
  // Any participant in the workflow can mark as done
  if (!comment.taggedUser) {
    return { canResolve: true };
  }

  // Rule 2: Tagged Comment
  // Only the tagged person can mark as done
  const taggedUserId = comment.taggedUser.userId;
  const taggedName = (comment.taggedUser.name || '').toLowerCase();
  const currentUserId = currentUser.id || currentUser.userId;
  const currentName = (currentUser.name || currentUser.label || '').toLowerCase();

  const isMatch = (
    (currentUserId && taggedUserId && currentUserId === taggedUserId) ||
    (currentName && taggedName && (currentName === taggedName || currentName.includes(taggedName) || taggedName.includes(currentName)))
  );

  // Allow Lead / Director override if applicable
  const isLeadOverride = (currentUser.role || currentUser.baselineRole || '').toLowerCase().includes('director');

  if (isMatch || isLeadOverride) {
    return { canResolve: true };
  }

  return {
    canResolve: false,
    reason: `Assigned to @${comment.taggedUser.name} — only the tagged recipient can resolve.`
  };
};

// ==========================================
// MUTATION METHODS
// ==========================================

export const addComment = ({
  targetType = 'ISSUE_FIELD',
  engagementId,
  issueId = null,
  fieldKey,
  fieldName = null,
  text,
  author,
  taggedUser = null
}) => {
  if (!text || !text.trim()) return null;

  const now = new Date();
  const newComment = {
    id: `COMM-${Date.now().toString().slice(-6)}`,
    targetType,
    engagementId: engagementId || 'REP-2026-001',
    issueId: issueId || null,
    fieldKey,
    fieldName: fieldName || fieldKey,
    author: {
      userId: author?.userId || author?.id || 'USR-CURRENT',
      name: author?.name || 'Current User',
      role: author?.role || author?.title || 'Auditor',
      avatar: author?.avatar || author?.initials || (author?.name ? author.name.split(' ').map(n=>n[0]).join('') : 'CU'),
      avatarBg: author?.avatarBg || '#2563EB'
    },
    taggedUser: taggedUser ? {
      userId: taggedUser.userId || taggedUser.id,
      name: taggedUser.name,
      role: taggedUser.role || taggedUser.title
    } : null,
    text: text.trim(),
    timestamp: now.toISOString(),
    displayTime: formatCommentTime(now),
    isResolved: false,
    resolvedBy: null,
    resolvedAt: null
  };

  commentsStore.push(newComment);

  // Synchronize to audit log trail
  try {
    const logAction = taggedUser 
      ? `Comment added for @${taggedUser.name} on ${fieldName || fieldKey}`
      : `Comment added on ${fieldName || fieldKey}`;

    if (targetType === 'WORKFLOW_TRANSITION') {
      const transitionAction = taggedUser 
        ? `Workflow transition remark tagged for @${taggedUser.name}` 
        : `Workflow transition hand-off remark: ${text.slice(0, 45)}...`;

      if (issueId) {
        logIssueEvent({
          issueId,
          engagementId,
          actor: newComment.author,
          category: 'WORKFLOW_TRANSITION',
          badgeType: 'workflow',
          action: transitionAction,
          fieldChanged: 'Workflow Hand-off',
          newValue: text.trim(),
          details: { commentId: newComment.id, taggedUser: taggedUser?.name || null }
        });
      }
    } else if (targetType === 'ISSUE_FIELD' && issueId) {
      logIssueEvent({
        issueId,
        engagementId,
        actor: newComment.author,
        category: 'COMMENT_COLLABORATION',
        badgeType: 'comment',
        action: logAction,
        fieldChanged: fieldName || fieldKey,
        newValue: text.trim(),
        details: { commentId: newComment.id, taggedUser: taggedUser?.name || null }
      });
    } else {
      logExecutiveReportEvent({
        engagementId,
        actor: newComment.author,
        category: 'COMMENT_COLLABORATION',
        badgeType: 'comment',
        action: logAction,
        fieldChanged: fieldName || fieldKey,
        newValue: text.trim(),
        details: { commentId: newComment.id, taggedUser: taggedUser?.name || null }
      });
    }
  } catch (err) {
    console.error('Failed to dispatch comment audit log:', err);
  }

  notifyListeners();
  return newComment;
};

export const resolveComment = (commentId, currentUser = {}) => {
  const comment = commentsStore.find(c => c.id === commentId);
  if (!comment) return null;

  const check = canUserResolveComment(comment, currentUser);
  if (!check.canResolve) {
    alert(check.reason);
    return null;
  }

  const now = new Date();
  comment.isResolved = true;
  comment.resolvedBy = {
    userId: currentUser.id || currentUser.userId || 'USR-CURRENT',
    name: currentUser.name || currentUser.label || 'Current User',
    role: currentUser.role || currentUser.title || 'Reviewer'
  };
  comment.resolvedAt = now.toISOString();

  // Log resolution event to audit trail
  try {
    const logAction = `Resolved comment on ${comment.fieldName || comment.fieldKey}`;
    if (comment.targetType === 'ISSUE_FIELD' && comment.issueId) {
      logIssueEvent({
        issueId: comment.issueId,
        engagementId: comment.engagementId,
        actor: comment.resolvedBy,
        category: 'COMMENT_COLLABORATION',
        badgeType: 'workflow',
        action: logAction,
        fieldChanged: comment.fieldName || comment.fieldKey,
        newValue: `Resolved by ${comment.resolvedBy.name}`,
        details: { commentId: comment.id, resolutionTimestamp: comment.resolvedAt }
      });
    } else {
      logExecutiveReportEvent({
        engagementId: comment.engagementId,
        actor: comment.resolvedBy,
        category: 'COMMENT_COLLABORATION',
        badgeType: 'workflow',
        action: logAction,
        fieldChanged: comment.fieldName || comment.fieldKey,
        newValue: `Resolved by ${comment.resolvedBy.name}`,
        details: { commentId: comment.id, resolutionTimestamp: comment.resolvedAt }
      });
    }
  } catch (err) {
    console.error('Failed to log comment resolution:', err);
  }

  notifyListeners();
  return comment;
};
