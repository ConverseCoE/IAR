// Central AI Version Management & Comparison Engine for J&J IAR Platform
// Manages AI Generation History, Candidate Versions, Field-Level Hybrid Merging, and Audit Logging

import initialAiVersions from '../data/issueAiVersions.json';
import { logIssueEvent } from './auditLogEngine';

// In-Memory Reactive Store
let aiVersionsStore = [...initialAiVersions];

// Listeners for real-time subscribers
const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach(fn => {
    try { fn(); } catch (err) { console.error('AiVersionEngine subscriber error:', err); }
  });
};

export const subscribeToAiVersionUpdates = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

// Formats display timestamp
export const formatVersionTime = (date = new Date()) => {
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

export const getAllAiVersions = () => [...aiVersionsStore];

export const getVersionsForIssue = (issueId) => {
  if (!issueId) return [];
  const normalizedId = String(issueId).toUpperCase();
  return aiVersionsStore
    .filter(v => v.issueId && String(v.issueId).toUpperCase() === normalizedId)
    .sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));
};

export const getActiveVersion = (issueId) => {
  const versions = getVersionsForIssue(issueId);
  return versions.find(v => v.status === 'ACTIVE' || v.status === 'HYBRID_MERGED') || versions[0] || null;
};

export const getVersionById = (versionId) => {
  if (!versionId) return null;
  return aiVersionsStore.find(v => v.id === versionId) || null;
};

// ==========================================
// MUTATION METHODS
// ==========================================

/**
 * Creates and registers a new AI Version or Candidate
 */
export const createAiVersion = ({
  issueId,
  engagementId,
  triggerStage = 'INITIAL_CREATION',
  model = 'medtech-gx-compliance-v2.5',
  fields = {},
  createdBy = {},
  status = 'ACTIVE',
  fieldSelectionMap = null
}) => {
  if (!issueId) return null;

  const existingVersions = getVersionsForIssue(issueId);
  const nextVersionNumber = existingVersions.length > 0 
    ? Math.max(...existingVersions.map(v => v.versionNumber || 1)) + 1 
    : 1;

  const now = new Date();
  const idSuffix = String(issueId).replace(/[^0-9]/g, '') || Date.now().toString().slice(-4);
  const versionId = `AIVER-${idSuffix}-${String(nextVersionNumber).padStart(2, '0')}`;

  const newVersion = {
    id: versionId,
    issueId,
    engagementId: engagementId || 'REP-2026-008',
    versionNumber: nextVersionNumber,
    triggerStage,
    model,
    status,
    fields: {
      title: fields.title || fields.updatedIssueHeader || '',
      rootCause: fields.rootCause || '',
      impact: fields.impact || '',
      recommendation: fields.recommendation || '',
      description: fields.description || ''
    },
    fieldSelectionMap: fieldSelectionMap || null,
    createdBy: {
      userId: createdBy.userId || createdBy.id || 'USR-CURRENT',
      name: createdBy.name || 'Auditor',
      role: createdBy.role || createdBy.title || 'Contributor',
      avatar: createdBy.avatar || createdBy.initials || 'CU',
      avatarBg: createdBy.avatarBg || '#2563EB'
    },
    createdAt: now.toISOString(),
    displayTime: formatVersionTime(now)
  };

  // If this version is explicitly ACTIVE, mark other existing active versions as SUPERSEDED
  if (status === 'ACTIVE' || status === 'HYBRID_MERGED') {
    existingVersions.forEach(v => {
      if (v.status === 'ACTIVE' || v.status === 'HYBRID_MERGED') {
        v.status = 'SUPERSEDED';
      }
    });
  }

  aiVersionsStore.push(newVersion);

  // Synchronize to audit log trail
  try {
    const isRegen = triggerStage === 'PRE_SAVE_REGENERATION' || triggerStage === 'WORKFLOW_REVIEW';
    logIssueEvent({
      issueId,
      engagementId: newVersion.engagementId,
      actor: newVersion.createdBy,
      category: isRegen ? 'AI_REGENERATION' : 'AI_GENERATION',
      badgeType: 'ai',
      action: isRegen 
        ? `AI Prompt Regeneration & Candidate v${nextVersionNumber} Synthesized`
        : `AI Generation Synthesized Issue Finding v${nextVersionNumber}`,
      fieldChanged: 'AI Fields (Title, Root Cause, Impact, Recommendation)',
      newValue: newVersion.fields.title || 'AI Synthesized Finding',
      details: {
        versionId: newVersion.id,
        versionNumber: nextVersionNumber,
        triggerStage,
        model
      }
    });
  } catch (err) {
    console.error('Failed to log AI version event:', err);
  }

  notifyListeners();
  return newVersion;
};

/**
 * Adopts a Candidate or Historical Version (Supports Hybrid Field Merging)
 */
export const adoptVersion = ({
  issueId,
  versionId,
  fieldSelectionMap = null,
  adoptedBy = {},
  customFields = null
}) => {
  const versions = getVersionsForIssue(issueId);
  const target = versions.find(v => v.id === versionId);
  if (!target) return null;

  const now = new Date();
  const isHybrid = fieldSelectionMap && Object.values(fieldSelectionMap).some(v => v !== 'current' && v !== `v${target.versionNumber}`);

  versions.forEach(v => {
    if (v.id === target.id) {
      v.status = isHybrid ? 'HYBRID_MERGED' : 'ACTIVE';
      v.fieldSelectionMap = fieldSelectionMap || v.fieldSelectionMap;
    } else if (v.status === 'ACTIVE' || v.status === 'HYBRID_MERGED') {
      v.status = 'SUPERSEDED';
    } else if (v.status === 'CANDIDATE') {
      v.status = 'DISCARDED';
    }
  });

  const finalFields = customFields || { ...target.fields };

  // Dispatch adoption audit log
  try {
    logIssueEvent({
      issueId,
      engagementId: target.engagementId,
      actor: {
        userId: adoptedBy.userId || adoptedBy.id || 'USR-CURRENT',
        name: adoptedBy.name || 'Reviewer',
        role: adoptedBy.role || adoptedBy.title || 'Reviewer'
      },
      category: 'AI_REGENERATION',
      badgeType: 'ai',
      action: isHybrid 
        ? `Adopted Hybrid AI Version Selection (Based on v${target.versionNumber})`
        : `Adopted AI Generated Version v${target.versionNumber}`,
      fieldChanged: 'AI Generated Fields',
      newValue: `Active Version v${target.versionNumber}`,
      details: {
        adoptedVersionId: target.id,
        versionNumber: target.versionNumber,
        isHybrid,
        fieldSelectionMap
      }
    });
  } catch (err) {
    console.error('Failed to log version adoption:', err);
  }

  notifyListeners();
  return {
    adoptedVersion: target,
    fields: finalFields
  };
};

/**
 * Reverts to an earlier Historical AI Version
 */
export const revertToVersion = ({
  issueId,
  versionId,
  revertedBy = {}
}) => {
  const versions = getVersionsForIssue(issueId);
  const target = versions.find(v => v.id === versionId);
  if (!target) return null;

  versions.forEach(v => {
    if (v.id === target.id) {
      v.status = 'ACTIVE';
    } else if (v.status === 'ACTIVE' || v.status === 'HYBRID_MERGED') {
      v.status = 'SUPERSEDED';
    }
  });

  // Dispatch rollback audit log
  try {
    logIssueEvent({
      issueId,
      engagementId: target.engagementId,
      actor: {
        userId: revertedBy.userId || revertedBy.id || 'USR-CURRENT',
        name: revertedBy.name || 'Reviewer',
        role: revertedBy.role || revertedBy.title || 'Reviewer'
      },
      category: 'AI_REGENERATION',
      badgeType: 'rollback',
      action: `Rolled back to Historical AI Version v${target.versionNumber}`,
      fieldChanged: 'Issue AI Fields',
      oldValue: 'Superseded Version',
      newValue: `Restored Version v${target.versionNumber}`,
      details: {
        restoredVersionId: target.id,
        versionNumber: target.versionNumber
      }
    });
  } catch (err) {
    console.error('Failed to log version rollback:', err);
  }

  notifyListeners();
  return {
    revertedVersion: target,
    fields: { ...target.fields }
  };
};

/**
 * Discards a Candidate AI Version
 */
export const discardVersion = ({ versionId, user = {} }) => {
  const version = aiVersionsStore.find(v => v.id === versionId);
  if (!version) return null;

  version.status = 'DISCARDED';

  try {
    logIssueEvent({
      issueId: version.issueId,
      engagementId: version.engagementId,
      actor: {
        userId: user.userId || user.id || 'USR-CURRENT',
        name: user.name || 'Reviewer',
        role: user.role || user.title || 'Reviewer'
      },
      category: 'AI_REGENERATION',
      badgeType: 'ai',
      action: `Discarded Candidate AI Version v${version.versionNumber}`,
      fieldChanged: 'Candidate AI Version',
      newValue: 'Discarded',
      details: { versionId: version.id }
    });
  } catch (err) {
    console.error('Failed to log version discard:', err);
  }

  notifyListeners();
  return version;
};

// ==========================================
// TEXT DIFF UTILITY
// ==========================================

/**
 * Simple word-level diff utility that tags words as added, removed, or unchanged
 */
export const computeWordDiff = (textA = '', textB = '') => {
  if (textA === textB) {
    return [{ type: 'equal', text: textA }];
  }

  const wordsA = String(textA).split(/\s+/).filter(Boolean);
  const wordsB = String(textB).split(/\s+/).filter(Boolean);

  // If one is empty
  if (wordsA.length === 0) {
    return [{ type: 'added', text: textB }];
  }
  if (wordsB.length === 0) {
    return [{ type: 'removed', text: textA }];
  }

  // Token-based diffing
  const diffs = [];
  let i = 0;
  let j = 0;

  while (i < wordsA.length && j < wordsB.length) {
    if (wordsA[i] === wordsB[j]) {
      diffs.push({ type: 'equal', text: wordsA[i] + ' ' });
      i++;
      j++;
    } else {
      // Lookahead in B for wordsA[i]
      const nextInB = wordsB.indexOf(wordsA[i], j);
      if (nextInB !== -1 && nextInB - j < 4) {
        // Words were added in B
        while (j < nextInB) {
          diffs.push({ type: 'added', text: wordsB[j] + ' ' });
          j++;
        }
      } else {
        diffs.push({ type: 'removed', text: wordsA[i] + ' ' });
        i++;
      }
    }
  }

  while (i < wordsA.length) {
    diffs.push({ type: 'removed', text: wordsA[i] + ' ' });
    i++;
  }
  while (j < wordsB.length) {
    diffs.push({ type: 'added', text: wordsB[j] + ' ' });
    j++;
  }

  return diffs;
};
