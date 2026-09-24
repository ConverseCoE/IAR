import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, Plus, Minus, Download, Save, Send, GitBranch, History, 
  AlertOctagon, CheckCircle2, RefreshCw, FileText, ArrowUp, ArrowDown, Sparkles,
  MoreVertical, Check, Layout, Columns, PanelLeft, Layers, X,
  ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen,
  Lock, Clock, ShieldAlert, MessageSquare, GripVertical, Filter,
  Ban, RotateCcw, UploadCloud, Paperclip, Calendar, Trash2
} from 'lucide-react';
import { mockAuditReportIssues } from '../data/reportIssuesData';
import IssueLogsModal from '../components/issues/IssueLogsModal';
import WorkflowModal from '../components/reporting/WorkflowModal';
import ToastNotification from '../components/ui/ToastNotification';
import { APPLICATION_ROLES } from '../components/layout/Header';
import DescriptionWithViolations, { parseDescriptionWithViolations } from '../components/common/DescriptionWithViolations';
import ViolationPdfDrawer from '../components/common/ViolationPdfDrawer';

// Standard Process Area options for audit findings
export const PROCESS_AREA_OPTIONS = [
  "Cybersecurity",
  "Training",
  "Access Control & IAM",
  "Third Party Technology",
  "Change Management",
  "Supply Chain & Operations",
  "System Configuration"
];

export const TEST_PROCEDURE_OPTIONS = [
  'TP-101: User Access & Authentication Review',
  'TP-102: Privileged Access Management Verification',
  'TP-103: Automated Telemetry & Calibration Logging Review',
  'TP-104: Segregation of Duties & Authorization Matrix',
  'TP-105: Third-Party Vendor Network Access Deprovisioning',
  'TP-106: Inventory Scrap & Variance Reconciliation',
  'TP-107: Cleanroom Environmental HVAC Controls Verification',
  'TP-108: Change Management & Transport Release Verification',
  'TP-109: Backup Restoration & Disaster Recovery Testing',
  'TP-110: GxP Software Validation & Data Integrity Audit'
];

export const ISSUE_TYPE_OPTIONS = [
  'Operational',
  'Compliance',
  'Financial / SOX',
  'IT / Cybersecurity',
  'Regulatory / GxP',
  'Reputational / Strategic'
];

export const ISSUE_SOURCE_OPTIONS = [
  'Internal Audit',
  'External Audit (PwC)',
  'Regulatory Inspection (FDA / ISO)',
  'Management Self-Identified',
  'SOX 404 Assessment',
  'Continuous Automated Monitoring'
];

export const KEY_THEME_OPTIONS = [
  'Access Governance & Authorization Matrix',
  'Financial Close & Account Reconciliation',
  'Manufacturing Telemetry & Calibration Drift',
  'Third-Party Vendor Risk & Deprovisioning',
  'Data Integrity, Retention & GxP Archival',
  'Change Management & Transport Release'
];

export const IT_ASSET_ACCOUNTABLE_SECTOR_OPTIONS = [
  'Consumer',
  'CORP',
  'IM',
  'ISRM',
  'MT',
  'TS'
];

export const IMPACTED_REGION_OPTIONS = [
  'APAC',
  'EMEA',
  'LATAM',
  'NA'
];

export const IMPACTED_SECTOR_OPTIONS = [
  'CPC',
  'GS-NOP',
  'MED',
  'NOP',
  'PHR',
  'Ortho_Synthes'
];

export const IMPACTED_MRC_OPTIONS = [
  'MRC-01: Global Supply Chain & Manufacturing Operations',
  'MRC-02: Commercial Operations & Hospital Distribution',
  'MRC-03: Research, Clinical Trials & Biopharma Development',
  'MRC-04: Corporate Shared Services & IT Infrastructure',
  'MRC-05: Treasury, Capital Planning & Tax Strategy'
];

export const QUARTER_IMPACTED_OPTIONS = [
  'Q1 2026',
  'Q2 2026',
  'Q3 2026',
  'Q4 2026',
  'Q1 2025',
  'Q2 2025',
  'Q3 2025',
  'Q4 2025'
];

// Normalizer helper ensuring any issue from My Audits or Create Drawer works seamlessly in Audit Report Studio
function normalizeIssueForReport(item, job) {
  if (!item) return null;
  const func = item.function || item.functionType || item.tech || 'IT';
  
  // Criticality normalization
  let crit = item.criticality;
  if (!crit) {
    if (item.severity === 'Critical') crit = 'Critical';
    else if (item.severity === 'High') crit = 'Major';
    else crit = 'Minor';
  }

  // Status normalization
  let status = item.status || 'Pending TC';
  if (item.status === 'Pending with Business' || item.status?.includes('Business') || item.currentLevel?.includes('Business')) {
    status = 'Pending with Business';
  } else if (item.currentLevel === 'Completed & Signed Off' || item.status === 'Completed' || item.status === 'Signed Off') {
    status = 'Signed Off';
  } else if (item.currentLevel?.includes('Manager')) {
    status = 'Pending Manager';
  } else if (item.currentLevel?.includes('Director')) {
    status = 'Pending Director';
  } else if (item.currentLevel?.includes('VP')) {
    status = 'Pending VP';
  } else if (item.currentLevel?.includes('TC')) {
    status = 'In progress TC';
  }

  const auditableEntity = item.auditableEntity || (job?.id ? `MRC-${job.id}-${job.fileName || 'J&J Medical'}` : 'MRC-004341-GFS SSC Philippines');
  let processArea = item.processArea || (func === 'FinOps' ? 'Supply Chain & Operations' : 'Global_Access_Management');
  if (processArea === 'Third_Party_technology') processArea = 'Global_Access_Management';
  if (processArea === 'Supply_Chain_Operations') processArea = 'Supply Chain & Operations';
  const issueCauseType = item.issueCauseType || (func === 'FinOps' ? 'Financial Reconciliation Discrepancy' : 'Operating Effectiveness');
  const soxReportable = item.soxReportable || (crit === 'Critical' || crit === 'Major' ? 'Yes' : 'No');
  const repeatFinding = item.repeatFinding || 'No';

  const accountableContact = item.accountableContact || "Narasimha, Vinay";
  const agreedRemediationDate = item.agreedRemediationDate || "2026-11-30";
  const managementResponse = item.managementResponse || "";
  const reportRef = item.reportRef || (item.id ? parseInt(item.id.replace(/\D/g, ''), 10) : 5) || 5;
  const accountableFunction = item.accountableFunction || (func === 'IT' ? 'Business IT, Finance' : 'Finance, Operations');

  // Realistic fallback descriptions if missing
  let issueNarrative = item.issue || `${item.title}. Testing and telemetry verification identified operational execution and control gaps contrary to standard operating procedures.`;
  if (!issueNarrative.includes('Violation Reference')) {
    issueNarrative = `${issueNarrative}\n\nViolation Reference\nNon-Compliant with some of the sections of IAPP:\n1. S-15 Section No. [2] - Security Assessment for COTS Systems/Applications — Security assessment not completed for the environment\n2. S-15 Section No. [11] - ISRM Approval Prior to Production — ISRM approval lacking due to missing assessment\n3. S-15 Section No. [4.18] - Periodic Application Architecture/Code/Config Assessment — No periodic assessment of architecture, code, configuration`;
  }
  const rootCause = item.rootCause || `Process execution gap in automated synchronization and manual handoff between operational units and central monitoring systems.`;
  const impact = item.impact || `• Potential risk of operational delay and regulatory audit observation under GxP / SOX internal guidelines.\n• Resource variance required for secondary reconciliation and verification.`;
  const recommendation = item.recommendation || `1. Deploy automated validation checks across shopfloor telemetry pipelines.\n2. Update standard operating procedures (SOP) and conduct role-based refresher training.\n3. Establish periodic review checkpoints to ensure sustained compliance.`;

  // Additional fields normalization & fallbacks
  const originalIssue = item.originalIssue || item.issue || `${item.title}. Manual finding observation recorded during operational audit verification.`;
  const testProcedure = item.testProcedure || 'TP-101: User Access & Authentication Review';
  const summaryFinding = item.summaryFinding || '';
  const auditorResponse = item.auditorResponse || '';
  const mitigatingControl = item.mitigatingControl || '';
  const exceptionRemedComments = item.exceptionRemedComments || '';
  const issueType = item.issueType || 'Compliance';
  const issueSource = item.issueSource || 'Internal Audit';
  const keyTheme = item.keyTheme || 'Access Governance & Authorization Matrix';
  const technologyRelated = item.technologyRelated || 'No';
  const itAssetAccountableSector = item.itAssetAccountableSector || 'CORP';
  const impactedRegion = item.impactedRegion || 'NA';
  const impactedSector = item.impactedSector || 'MED';
  const impactedMrc = item.impactedMrc || 'MRC-01: Global Supply Chain & Manufacturing Operations';
  const quarterImpacted = item.quarterImpacted || 'Q1 2026';
  const salesUsd = item.salesUsd || '$0.00';
  const ibtUsd = item.ibtUsd || '$0.00';
  const netIncomeUsd = item.netIncomeUsd || '$0.00';
  const totalAssetsUsd = item.totalAssetsUsd || '$0.00';
  const hasExceptionRemedDate = typeof item.hasExceptionRemedDate === 'boolean' ? item.hasExceptionRemedDate : !!item.exceptionRemedDate;
  const exceptionRemedDate = item.exceptionRemedDate || '';

  return {
    ...item,
    id: item.id || `ISSUE-${Math.floor(100 + Math.random() * 900)}`,
    title: item.title || 'Untitled Audit Finding',
    reportRef,
    function: func,
    accountableFunction,
    accountableContact,
    agreedRemediationDate,
    managementResponse,
    tech: item.tech || func,
    functionType: item.functionType || func,
    criticality: crit,
    severity: item.severity || (crit === 'Critical' ? 'Critical' : crit === 'Major' ? 'High' : 'Medium'),
    status: status,
    currentLevel: item.currentLevel || (status === 'Signed Off' ? 'Completed & Signed Off' : 'Manager Review'),
    currentRoleTarget: item.currentRoleTarget || (status === 'Signed Off' ? 'completed' : 'manager'),
    processArea,
    issueCauseType,
    soxReportable,
    repeatFinding,
    auditableEntity,
    originalIssue,
    issue: issueNarrative,
    rootCause,
    impact,
    recommendation,
    testProcedure,
    summaryFinding,
    auditorResponse,
    mitigatingControl,
    exceptionRemedComments,
    issueType,
    issueSource,
    keyTheme,
    technologyRelated,
    itAssetAccountableSector,
    impactedRegion,
    impactedSector,
    impactedMrc,
    quarterImpacted,
    salesUsd,
    ibtUsd,
    netIncomeUsd,
    totalAssetsUsd,
    hasExceptionRemedDate,
    exceptionRemedDate,
    isLocked: !!item.isLocked,
    isExcluded: !!item.isExcluded,
    previousStatus: item.previousStatus || null,
    excludedAt: item.excludedAt || null,
    lockedBy: item.lockedBy || (item.isLocked ? {
      name: "Marcus Vance",
      email: "mvance@its.jnj.com",
      role: "Lead Compliance Auditor",
      avatar: "MV",
      avatarBg: "#7C3AED",
      timestamp: "12 mins ago",
      activity: "Drafting technical root cause analysis & recommendations"
    } : null)
  };
}

// Dynamic Role Submission Workflow Configuration
export const getRoleSubmissionConfig = (userRole) => {
  const roleStr = (userRole || '').toString().toLowerCase().trim();
  
  if (roleStr.includes('auditor')) {
    return {
      baseRole: 'auditor',
      submitLabel: 'Submit to TC',
      reportSubmitLabel: null,
      hasReportSubmission: false,
      targetRole: 'Team Co-Ordinator',
      statusOnSubmit: 'Submitted to TC',
      successMessage: 'submitted to Team Co-Ordinator'
    };
  }
  
  if (roleStr.includes('coordinator') || roleStr.includes('tc')) {
    return {
      baseRole: 'team-coordinator',
      submitLabel: 'Submit to Manager',
      reportSubmitLabel: null,
      hasReportSubmission: false,
      targetRole: 'Manager',
      statusOnSubmit: 'Submitted to Manager',
      successMessage: 'submitted to Manager'
    };
  }
  
  if (roleStr.includes('director')) {
    return {
      baseRole: 'director',
      submitLabel: 'Submit to VP',
      reportSubmitLabel: 'Submit to VP',
      hasReportSubmission: true,
      targetRole: 'VP',
      statusOnSubmit: 'Submitted to VP',
      successMessage: 'submitted to VP for final sign-off',
      canSendToManagementResponse: true
    };
  }
  
  if (roleStr.includes('vp')) {
    return {
      baseRole: 'vp',
      submitLabel: 'Sign-Off',
      reportSubmitLabel: 'Sign-Off',
      hasReportSubmission: true,
      targetRole: 'Completed & Signed Off',
      statusOnSubmit: 'Signed Off',
      successMessage: 'officially signed off'
    };
  }

  if (roleStr.includes('business') || roleStr.includes('head') || roleStr.includes('contact')) {
    return {
      baseRole: 'business',
      submitLabel: 'Submit to Director',
      reportSubmitLabel: null,
      hasReportSubmission: false,
      targetRole: 'Director',
      statusOnSubmit: 'Submitted to Director',
      successMessage: 'submitted back to Director'
    };
  }
  
  // Default to Manager (e.g. 'it-manager', 'finops-manager', 'manager')
  return {
    baseRole: 'manager',
    submitLabel: 'Submit to Director',
    reportSubmitLabel: 'Submit to Director',
    hasReportSubmission: true,
    targetRole: 'Director',
    statusOnSubmit: 'Submitted to Director',
    successMessage: 'submitted to Director'
  };
};

export default function AuditReportView({ job, onClose, onUpdateIssues, userRole = 'it-manager', onSwitchToExecutiveReport }) {
  // Resolve active role definition
  const activeRoleObj = APPLICATION_ROLES?.find(r => r.id === userRole) || {
    id: userRole,
    label: userRole?.includes('auditor') ? 'Auditor' : userRole?.includes('coordinator') ? 'Team Co-Ordinator' : userRole?.includes('director') ? 'Director' : userRole?.includes('vp') ? 'VP' : 'Manager',
    domain: userRole?.includes('it') ? 'IT' : userRole?.includes('finops') ? 'FinOps' : 'All',
    baseRole: userRole?.includes('auditor') ? 'auditor' : userRole?.includes('coordinator') ? 'team-coordinator' : userRole?.includes('director') ? 'director' : userRole?.includes('vp') ? 'vp' : 'manager'
  };

  // Default priority ordering helper: Critical (1), Major (2), Minor (3)
  const sortIssuesByDefaultPriority = (list) => {
    const priorityWeight = { 'Critical': 1, 'Major': 2, 'High': 2, 'Minor': 3, 'Low': 3, 'Medium': 3 };
    return [...list].sort((a, b) => {
      const pA = priorityWeight[a.criticality] || 99;
      const pB = priorityWeight[b.criticality] || 99;
      return pA - pB;
    }).map((item, idx) => ({
      ...item,
      reportRef: idx + 1
    }));
  };

  // Track if user has manually reordered so we preserve their custom order across parent syncs
  const isManuallyOrderedRef = useRef(false);
  const prevJobIdRef = useRef(job?.id);

  // Derive issues directly from the active engagement's issuesList
  const getJobIssues = useCallback(() => {
    let rawList = [];
    if (job && Array.isArray(job.issuesList)) {
      if (job.issuesList.length === 0) return [];
      rawList = job.issuesList.map(iss => normalizeIssueForReport(iss, job));
      // If user has already manually ordered these issues, preserve the exact array order!
      if (isManuallyOrderedRef.current) {
        return rawList.map((item, idx) => ({
          ...item,
          reportRef: idx + 1
        }));
      }
    } else {
      rawList = mockAuditReportIssues.map(iss => normalizeIssueForReport(iss, job));
    }
    // Initial default sort by priority
    return sortIssuesByDefaultPriority(rawList);
  }, [job]);

  const [issues, setIssues] = useState(getJobIssues);

  // When job ID changes to a different engagement, reset manual order flag
  useEffect(() => {
    if (job?.id !== prevJobIdRef.current) {
      prevJobIdRef.current = job?.id;
      isManuallyOrderedRef.current = false;
      setIssues(getJobIssues());
      setExpandedIssueId(null);
    }
  }, [job?.id, getJobIssues]);

  // Synchronize state locally and bubble updates to parent App / My Audits, continuously re-sequencing reportRef
  const updateIssuesAndSync = (newIssues) => {
    isManuallyOrderedRef.current = true;
    const sequencedIssues = newIssues.map((item, idx) => ({
      ...item,
      reportRef: idx + 1
    }));
    setIssues(sequencedIssues);
    if (onUpdateIssues) {
      onUpdateIssues(sequencedIssues);
    }
  };

  // Default to null so NO row is selected initially and the full report (ALL issues) is displayed in PDF preview
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [isTrackChangesActive, setIsTrackChangesActive] = useState(false);
  const [isIssueLogsModalOpen, setIsIssueLogsModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);

  // Call Back Modal State
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackIssueId, setCallbackIssueId] = useState(null);
  const [callbackReason, setCallbackReason] = useState('');
  const [callbackError, setCallbackError] = useState('');

  // Violation Reference Document Side-Drawer State
  const [selectedViolationDoc, setSelectedViolationDoc] = useState(null);
  const [isViolationDrawerOpen, setIsViolationDrawerOpen] = useState(false);

  const handleOpenViolationDoc = (violation) => {
    setSelectedViolationDoc(violation);
    setIsViolationDrawerOpen(true);
  };

  // Multi-Design Mode State ('default', '3pane', 'slideover', 'tabbed')
  const [designMode, setDesignMode] = useState('3pane');
  const [isDesignMenuOpen, setIsDesignMenuOpen] = useState(false);

  // Role permissions: Director and VP privilege for Report-Level Sign Off
  const isDirectorOrVP = (userRole || '').toLowerCase().includes('director') || (userRole || '').toLowerCase().includes('vp') || (userRole || '').toLowerCase().includes('head');
  const [isReportSignedOff, setIsReportSignedOff] = useState(job?.status === 'Signed Off' || job?.reportStatus === 'Signed Off' || false);

  // Business User Check: Primary Business Contact role
  const isBusinessUser = (userRole || '').toLowerCase().includes('business') || (userRole || '').toLowerCase().includes('contact');

  // Business Response State: file input ref, drag over, error message
  const businessFileInputRef = useRef(null);
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [businessResponseError, setBusinessResponseError] = useState('');

  // Dropdown filter for Function in Master List ('all', 'IT', 'FinOps')
  const [functionFilter, setFunctionFilter] = useState('all');

  // Helper to test if an issue is IT vs FinOps
  const isItemIT = (item) => {
    const clean = (item?.function || item?.functionType || item?.tech || '').toString().trim().toLowerCase();
    return clean === 'it' || clean.startsWith('it') || clean.includes('tech') || clean.includes('cyber') || clean.includes('system');
  };

  const itCount = issues.filter(isItemIT).length;
  const finOpsCount = issues.length - itCount;

  // Role-based Issue Editability Check:
  // - If role is IT Team Co-Ordinator or IT Manager -> can edit ONLY IT issues (not FinOps)
  // - If role is FinOps Team Co-Ordinator or FinOps Manager -> can edit ONLY FinOps issues (not IT)
  // - For Director and VP -> ALL the issue types are editable
  // - This logic is only applicable for Team co-ordinator and Manager
  const checkIssueEditability = useCallback((item) => {
    if (!item) return { canEdit: true, reason: null };

    const roleStr = (userRole || '').toString().toLowerCase().trim();
    const isIT = isItemIT(item);

    // Directors and VPs can edit ALL issue types
    const isDirectorOrVP = roleStr.includes('director') || roleStr.includes('vp') || roleStr.includes('head');
    if (isDirectorOrVP) {
      return { canEdit: true, reason: null };
    }

    // Team Co-Ordinator and Manager domain restrictions
    // This logic only applicable for Team co-ordinator and Manager
    const isTeamCoordinator = roleStr.includes('team-coordinator') || roleStr.includes('coordinator') || roleStr.includes('tc');
    const isManager = roleStr.includes('manager') && !roleStr.includes('director');

    if (isTeamCoordinator || isManager) {
      const isITRole = roleStr.includes('it');
      const isFinOpsRole = roleStr.includes('finops') || roleStr.includes('fin');

      if (isITRole && !isIT) {
        const roleLabel = isTeamCoordinator ? 'IT Team Co-Ordinator' : 'IT Manager';
        return {
          canEdit: false,
          userRoleLabel: roleLabel,
          issueDomain: 'FinOps',
          allowedDomain: 'IT',
          reason: `As an ${roleLabel}, you can edit only IT issues, not FinOps issues. For Director and VP, all issue types are editable.`
        };
      }

      if (isFinOpsRole && isIT) {
        const roleLabel = isTeamCoordinator ? 'FinOps Team Co-Ordinator' : 'FinOps Manager';
        return {
          canEdit: false,
          userRoleLabel: roleLabel,
          issueDomain: 'IT',
          allowedDomain: 'FinOps',
          reason: `As a ${roleLabel}, you can edit only FinOps issues, not IT issues. For Director and VP, all issue types are editable.`
        };
      }
    }

    return { canEdit: true, reason: null };
  }, [userRole]);

  const filteredIssues = issues.filter(item => {
    if (isBusinessUser) {
      const st = (item.status || '').toLowerCase();
      const lvl = (item.currentLevel || '').toLowerCase();
      const tgt = (item.currentRoleTarget || '').toLowerCase();
      return st.includes('business') || lvl.includes('business') || tgt.includes('business');
    }
    if (functionFilter === 'all') return true;
    const isIT = isItemIT(item);
    if (functionFilter === 'IT') return isIT;
    if (functionFilter === 'FinOps') return !isIT;
    return true;
  });

  // Auto-select the first pending issue for Primary Business Contact
  useEffect(() => {
    if (isBusinessUser && filteredIssues.length > 0) {
      if (!expandedIssueId || !filteredIssues.some(i => i.id === expandedIssueId)) {
        setExpandedIssueId(filteredIssues[0].id);
      }
    }
  }, [isBusinessUser, filteredIssues, expandedIssueId]);

  // Drag and drop reordering state by issue ID
  const [draggedIssueId, setDraggedIssueId] = useState(null);
  const [dragOverIssueId, setDragOverIssueId] = useState(null);
  const [draggableCardId, setDraggableCardId] = useState(null);

  const handleDragStart = (e, issueId) => {
    setDraggedIssueId(issueId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', issueId);
  };

  const handleDragOver = (e, issueId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIssueId !== issueId) {
      setDragOverIssueId(issueId);
    }
  };

  const handleDragLeave = (e, issueId) => {
    if (dragOverIssueId === issueId) {
      setDragOverIssueId(null);
    }
  };

  const handleDrop = (e, targetIssueId) => {
    e.preventDefault();
    if (!draggedIssueId || draggedIssueId === targetIssueId) {
      setDraggedIssueId(null);
      setDragOverIssueId(null);
      setDraggableCardId(null);
      return;
    }

    const dragIdx = issues.findIndex(i => i.id === draggedIssueId);
    const targetIdx = issues.findIndex(i => i.id === targetIssueId);

    if (dragIdx !== -1 && targetIdx !== -1 && dragIdx !== targetIdx) {
      const draggedItem = issues[dragIdx];
      const targetItem = issues[targetIdx];
      const isCrossPriority = draggedItem.criticality !== targetItem.criticality;

      const updated = [...issues];
      const [movedItem] = updated.splice(dragIdx, 1);
      updated.splice(targetIdx, 0, movedItem);
      updateIssuesAndSync(updated);

      if (isCrossPriority) {
        setToastNotification({
          type: 'warning',
          title: 'Priority Alignment Notice',
          description: `You are moving an issue across priority levels (${draggedItem.criticality} ➔ ${targetItem.criticality}). Report reference numbers have been realigned.`
        });
      }
    }

    setDraggedIssueId(null);
    setDragOverIssueId(null);
    setDraggableCardId(null);
  };

  const handleDragEnd = () => {
    setDraggedIssueId(null);
    setDragOverIssueId(null);
    setDraggableCardId(null);
  };

  // Re-order issues helper by issueId & direction
  const handleMoveIssueById = (issueId, direction) => {
    const currentFilteredIdx = filteredIssues.findIndex(i => i.id === issueId);
    if (currentFilteredIdx === -1) return;
    const targetFilteredIdx = direction === 'up' ? currentFilteredIdx - 1 : currentFilteredIdx + 1;
    if (targetFilteredIdx < 0 || targetFilteredIdx >= filteredIssues.length) return;
    
    const targetIssueId = filteredIssues[targetFilteredIdx].id;
    const dragIdx = issues.findIndex(i => i.id === issueId);
    const targetIdx = issues.findIndex(i => i.id === targetIssueId);
    if (dragIdx === -1 || targetIdx === -1) return;

    const currentItem = issues[dragIdx];
    const targetItem = issues[targetIdx];
    const isCrossPriority = currentItem.criticality !== targetItem.criticality;

    const updated = [...issues];
    const [draggedItem] = updated.splice(dragIdx, 1);
    updated.splice(targetIdx, 0, draggedItem);
    updateIssuesAndSync(updated);

    if (isCrossPriority) {
      setToastNotification({
        type: 'warning',
        title: 'Priority Alignment Notice',
        description: `You are moving an issue across priority levels (${currentItem.criticality} ➔ ${targetItem.criticality}). Report reference numbers have been realigned.`
      });
    }
  };

  // 3-Pane Resizable Widths & Collapse States
  const [pane1Width, setPane1Width] = useState(24); // percentage (12% to 45%)
  const [pane2Width, setPane2Width] = useState(36); // percentage (15% to 55%)

  const [isPane1Collapsed, setIsPane1Collapsed] = useState(false);
  const [isPane2Collapsed, setIsPane2Collapsed] = useState(false);
  const [isPane3Collapsed, setIsPane3Collapsed] = useState(false);

  const [isDraggingSplitter1, setIsDraggingSplitter1] = useState(false);
  const [isDraggingSplitter2, setIsDraggingSplitter2] = useState(false);
  const [hoveredSplitter, setHoveredSplitter] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;

      if (isDraggingSplitter1) {
        const mouseX = e.clientX - containerRect.left;
        const newPct = Math.min(Math.max((mouseX / containerWidth) * 100, 12), 45);
        setPane1Width(Math.round(newPct));
      } else if (isDraggingSplitter2) {
        const mouseX = e.clientX - containerRect.left;
        const pane1Px = isPane1Collapsed ? 36 : (containerWidth * (pane1Width / 100));
        const availablePx = mouseX - pane1Px;
        const newPct = Math.min(Math.max((availablePx / containerWidth) * 100, 15), 55);
        setPane2Width(Math.round(newPct));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSplitter1(false);
      setIsDraggingSplitter2(false);
    };

    if (isDraggingSplitter1 || isDraggingSplitter2) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplitter1, isDraggingSplitter2, pane1Width, isPane1Collapsed]);

  // Field Level Comments State & Mock Collaboration Data
  const [fieldComments, setFieldComments] = useState({
    "ISSUE-001": {
      "title": [
        {
          id: "c-101",
          user: "Marcus Vance",
          role: "Lead Compliance Auditor",
          avatar: "MV",
          avatarBg: "#7C3AED",
          timestamp: "15 mins ago",
          comment: "Ensure the 10 business days threshold aligns with IAPP S-07 deprovisioning policy."
        }
      ],
      "criticality": [
        {
          id: "c-102",
          user: "Kevin Zhang",
          role: "IT Audit Lead",
          avatar: "KZ",
          avatarBg: "#2563EB",
          timestamp: "2 hours ago",
          comment: "Categorized as Major due to potential unauthorized access window."
        }
      ],
      "testProcedure": [
        {
          id: "c-103",
          user: "Elena Rostova",
          role: "Lead Quality Auditor",
          avatar: "ER",
          avatarBg: "#059669",
          timestamp: "30 mins ago",
          comment: "Verified against TP-101 procedure criteria. Complies with Q1 cycle requirements."
        }
      ],
      "summaryFinding": [
        {
          id: "c-104",
          user: "Rachel Green",
          role: "FinOps Lead",
          avatar: "RG",
          avatarBg: "#D97706",
          timestamp: "45 mins ago",
          comment: "Ensure executive finding highlights both access security and telemetry log exposures."
        }
      ],
      "mitigatingControl": [
        {
          id: "c-105",
          user: "Kevin Zhang",
          role: "IT Audit Lead",
          avatar: "KZ",
          avatarBg: "#2563EB",
          timestamp: "1 hour ago",
          comment: "Added secondary supervisory sign-off as interim mitigating control."
        }
      ]
    },
    "ISSUE-002": {
      "title": [
        {
          id: "c-201",
          user: "Marcus Vance",
          role: "Lead Compliance Auditor",
          avatar: "MV",
          avatarBg: "#7C3AED",
          timestamp: "12 mins ago",
          comment: "Drift percentage updated to 4.2% based on latest calibration telemetry run."
        }
      ],
      "impactedRegion": [
        {
          id: "c-202",
          user: "Sarah Jenkins",
          role: "Compliance Director",
          avatar: "SJ",
          avatarBg: "#DC2626",
          timestamp: "25 mins ago",
          comment: "APAC regional lead confirmed calibration sensor replacements are scheduled."
        }
      ]
    },
    "ISSUE-401": {
      "title": [
        {
          id: "c-401",
          user: "Marcus Vance",
          role: "Lead Compliance Auditor",
          avatar: "MV",
          avatarBg: "#7C3AED",
          timestamp: "20 mins ago",
          comment: "Verified batch traveler serialization timestamps against shopfloor MES logs."
        }
      ],
      "rootCause": [
        {
          id: "c-402",
          user: "Kevin Zhang",
          role: "IT Audit Lead",
          avatar: "KZ",
          avatarBg: "#2563EB",
          timestamp: "1 hour ago",
          comment: "Network latency between sub-assembly scanners and central ERP confirmed."
        }
      ]
    },
    "ISSUE-402": {
      "title": [
        {
          id: "c-403",
          user: "Sarah Jenkins",
          role: "Quality Assurance Director",
          avatar: "SJ",
          avatarBg: "#059669",
          timestamp: "30 mins ago",
          comment: "Quarantine procedure initiated for all uncertified raw tubing lots."
        }
      ]
    },
    "ISSUE-201": {
      "title": [
        {
          id: "c-201",
          user: "Carlos Mendez",
          role: "Plant Auditor",
          avatar: "CM",
          avatarBg: "#D97706",
          timestamp: "45 mins ago",
          comment: "Temperature probe re-calibrated; drift within allowable limits now."
        }
      ]
    }
  });

  const [activeCommentField, setActiveCommentField] = useState(null); // e.g. "ISSUE-001_rootCause"
  const [newCommentInput, setNewCommentInput] = useState('');

  const handleAddFieldComment = (issueId, fieldKey) => {
    if (!newCommentInput.trim()) return;

    const newEntry = {
      id: "c-" + Date.now(),
      user: "You",
      role: "Compliance Auditor",
      avatar: "ME",
      avatarBg: "#059669",
      timestamp: "Just now",
      comment: newCommentInput.trim()
    };

    setFieldComments(prev => {
      const issueComments = prev[issueId] || {};
      const fieldList = issueComments[fieldKey] || [];
      return {
        ...prev,
        [issueId]: {
          ...issueComments,
          [fieldKey]: [...fieldList, newEntry]
        }
      };
    });

    setNewCommentInput('');
  };

  // Click outside to close menus and active comment popovers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
      if (!e.target.closest('[data-field-comment-container]')) {
        setActiveCommentField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMoreMenuOpen(false);
    setActiveCommentField(null);
  }, [expandedIssueId]);

  // Slide-over & Tabbed Modal Active Tab States
  const [slideoverTab, setSlideoverTab] = useState('metadata'); // 'metadata', 'analysis', 'actions'
  const [tabbedStep, setTabbedStep] = useState(1); // 1, 2, 3

  // Active Issue Object for PDF Filter View
  const selectedIssue = issues.find(i => i.id === expandedIssueId) || null;
  const selectedIssueEditability = selectedIssue ? checkIssueEditability(selectedIssue) : { canEdit: true };

  // Re-order issues helper
  const handleMoveIssue = (index, direction) => {
    const newIssues = [...issues];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIssues.length) return;
    const currentItem = newIssues[index];
    const targetItem = newIssues[targetIndex];
    const isCrossPriority = currentItem.criticality !== targetItem.criticality;

    const temp = newIssues[index];
    newIssues[index] = newIssues[targetIndex];
    newIssues[targetIndex] = temp;
    updateIssuesAndSync(newIssues);

    if (isCrossPriority) {
      setToastNotification({
        type: 'warning',
        title: 'Priority Alignment Notice',
        description: `You are moving an issue across priority levels (${currentItem.criticality} ➔ ${targetItem.criticality}). Report reference numbers have been realigned.`
      });
    }
  };

  // Field change handler (Instant real-time update to live HTML PDF preview)
  const handleIssueFieldChange = (issueId, field, val) => {
    // Prevent modifications if issue is locked by another user, domain-restricted by role, or excluded
    const target = issues.find(i => i.id === issueId);
    if (!target || target.isLocked || target.isExcluded) return;
    const editability = checkIssueEditability(target);
    if (!editability.canEdit) return;

    const newIssues = issues.map(item => {
      if (item.id === issueId) {
        return { ...item, [field]: val };
      }
      return item;
    });
    updateIssuesAndSync(newIssues);
  };

  // Issue Action Handlers
  const handleSaveIssue = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    if (target) {
      const editability = checkIssueEditability(target);
      if (!editability.canEdit) {
        alert(editability.reason);
        return;
      }
      if (target.isLocked) {
        alert("This issue is locked by another team member and cannot be saved.");
        return;
      }
    }
    updateIssuesAndSync(issues);
    alert(`Issue ${issueId} changes saved successfully to audit queue!`);
  };

  const handleSubmitIssue = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    if (target) {
      const editability = checkIssueEditability(target);
      if (!editability.canEdit) {
        alert(editability.reason);
        return;
      }
      if (target.isLocked) {
        alert("This issue is locked by another team member and cannot be submitted.");
        return;
      }
    }

    const targetIssue = issues.find(i => i.id === issueId);
    const issueRef = targetIssue?.referenceNumber || (issueId ? `Issue #${issueId}` : 'Issue');
    const roleConfig = getRoleSubmissionConfig(userRole);

    const updatedIssues = issues.map(item => {
      if (item.id === issueId) {
        return {
          ...item,
          status: roleConfig.statusOnSubmit,
          currentRoleTarget: roleConfig.targetRole,
          currentLevel: `${roleConfig.targetRole} Review`,
          submittedAt: new Date().toISOString()
        };
      }
      return item;
    });

    updateIssuesAndSync(updatedIssues);

    setToastNotification({
      type: 'success',
      title: roleConfig.submitLabel,
      description: `Issue ${issueRef} ${roleConfig.successMessage}.`
    });
  };

  // Director Action: Send Issue to Business for Management Response
  const handleSendToManagementResponse = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    if (target) {
      const editability = checkIssueEditability(target);
      if (!editability.canEdit) {
        alert(editability.reason);
        return;
      }
      if (target.isLocked) {
        alert("This issue is locked by another team member.");
        return;
      }
    }

    const targetIssue = issues.find(i => i.id === issueId);
    const issueRef = targetIssue?.referenceNumber || (issueId ? `Issue #${issueId}` : 'Issue');

    const updatedIssues = issues.map(item => {
      if (item.id === issueId) {
        return {
          ...item,
          status: 'Pending with Business',
          currentRoleTarget: 'primary-business-contact',
          currentLevel: 'Business Response',
          sentToManagementResponseAt: new Date().toISOString()
        };
      }
      return item;
    });

    updateIssuesAndSync(updatedIssues);

    setToastNotification({
      type: 'info',
      title: 'Management Response',
      description: `Issue ${issueRef} sent to Business for Management Response.`
    });
  };

  // Business Contact Handlers: File upload, Remove attachment, Submit response, Save draft
  const handleFileUpload = (issueId, files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const newAttachments = fileList.map(f => {
      const sizeKB = (f.size / 1024).toFixed(1);
      const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
      const formattedSize = f.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: f.name,
        size: formattedSize,
        type: f.type || 'document',
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    });

    const updatedIssues = issues.map(item => {
      if (item.id === issueId) {
        const existing = Array.isArray(item.attachments) ? item.attachments : [];
        return {
          ...item,
          attachments: [...existing, ...newAttachments]
        };
      }
      return item;
    });

    updateIssuesAndSync(updatedIssues);

    setToastNotification({
      type: 'success',
      title: 'Attachment Added',
      description: `${newAttachments.length} file(s) attached successfully.`
    });
  };

  const handleRemoveAttachment = (issueId, attachmentId) => {
    const updatedIssues = issues.map(item => {
      if (item.id === issueId) {
        const existing = Array.isArray(item.attachments) ? item.attachments : [];
        return {
          ...item,
          attachments: existing.filter(a => a.id !== attachmentId)
        };
      }
      return item;
    });

    updateIssuesAndSync(updatedIssues);
  };

  const handleSubmitBusinessResponse = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    if (!target) return;

    if (!target.managementResponse || !target.managementResponse.trim()) {
      setBusinessResponseError('Please enter a Management Response before submitting.');
      return;
    }
    if (!target.agreedRemediationDate) {
      setBusinessResponseError('Please select an Agreed Remediation Date before submitting.');
      return;
    }

    setBusinessResponseError('');

    const issueRef = target.referenceNumber || (target.id ? `Issue #${target.id}` : 'Issue');
    const updatedIssues = issues.map(item => {
      if (item.id === issueId) {
        return {
          ...item,
          status: 'Submitted to Director',
          currentRoleTarget: 'director',
          currentLevel: 'Director Review',
          managementResponseSubmittedAt: new Date().toISOString()
        };
      }
      return item;
    });

    updateIssuesAndSync(updatedIssues);

    setToastNotification({
      type: 'success',
      title: 'Response Submitted',
      description: `Management response for ${issueRef} has been successfully submitted to the Audit Director.`
    });
  };

  const handleSaveBusinessDraft = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    const issueRef = target?.referenceNumber || (target?.id ? `Issue #${target?.id}` : 'Issue');
    updateIssuesAndSync(issues);
    setToastNotification({
      type: 'info',
      title: 'Draft Saved',
      description: `Draft response for ${issueRef} saved successfully.`
    });
  };

  // Call Back Handlers
  const handleOpenCallbackModal = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    if (target) {
      const editability = checkIssueEditability(target);
      if (!editability.canEdit) {
        alert(editability.reason);
        return;
      }
      if (target.isLocked) {
        alert("This issue is locked by another team member.");
        return;
      }
    }
    setCallbackIssueId(issueId);
    setCallbackReason('');
    setCallbackError('');
    setIsCallbackModalOpen(true);
  };

  const handleConfirmCallback = () => {
    if (!callbackReason.trim()) {
      setCallbackError('Please provide a reason for calling back this issue.');
      return;
    }

    const targetIssue = issues.find(i => i.id === callbackIssueId);
    const issueRef = targetIssue?.referenceNumber || (callbackIssueId ? `Issue #${callbackIssueId}` : 'Issue');

    const updatedIssues = issues.map(item => {
      if (item.id === callbackIssueId) {
        return {
          ...item,
          status: 'Called Back',
          callbackReason: callbackReason.trim(),
          callbackTimestamp: new Date().toISOString()
        };
      }
      return item;
    });

    updateIssuesAndSync(updatedIssues);
    setIsCallbackModalOpen(false);

    // Show toaster notification on callback
    setToastNotification({
      type: 'warning',
      title: 'Call Back',
      description: `Issue ${issueRef} called back: ${callbackReason.trim()}`
    });

    setCallbackReason('');
    setCallbackError('');
    setCallbackIssueId(null);
  };

  const handleCloseCallbackModal = () => {
    setIsCallbackModalOpen(false);
    setCallbackReason('');
    setCallbackError('');
    setCallbackIssueId(null);
  };

  const handleSendToIssue = handleOpenCallbackModal;
  const handleRerouteIssue = handleOpenCallbackModal;

  // Report-Level Submission / Sign Off Handler (Applicable exclusively for Manager, Director, and VP)
  const handleReportSubmit = () => {
    const roleConfig = getRoleSubmissionConfig(userRole);
    if (!roleConfig.hasReportSubmission) {
      alert("Report-level submission is not applicable for Auditor or Team Coordinator. Only applicable for Manager, Director, and VP.");
      return;
    }
    if (roleConfig.baseRole === 'vp') {
      handleReportSignOff();
      return;
    }

    const updatedIssues = issues.map(item => ({
      ...item,
      status: roleConfig.statusOnSubmit,
      currentRoleTarget: roleConfig.targetRole,
      currentLevel: `${roleConfig.targetRole} Review`
    }));
    updateIssuesAndSync(updatedIssues);

    setToastNotification({
      type: 'success',
      title: roleConfig.reportSubmitLabel,
      description: `Audit Report for ${job?.id || 'JOB-2026-881'} ${roleConfig.successMessage.toLowerCase()}.`
    });
  };

  const handleReportSignOff = () => {
    const newStatus = !isReportSignedOff;
    setIsReportSignedOff(newStatus);
    if (newStatus) {
      const updatedIssues = issues.map(item => ({
        ...item,
        status: 'Signed Off',
        currentLevel: 'Completed & Signed Off'
      }));
      updateIssuesAndSync(updatedIssues);
      setToastNotification({
        type: 'success',
        title: 'Sign-Off',
        description: `Audit Report for ${job?.id || 'JOB-2026-881'} has been officially signed off by ${activeRoleObj?.label || 'VP'}.`
      });
    } else {
      setToastNotification({
        type: 'info',
        title: 'Sign-Off Reset',
        description: `Audit Report sign-off status has been reset.`
      });
    }
  };

  const handleMarkNotAnIssue = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    if (target) {
      const editability = checkIssueEditability(target);
      if (!editability.canEdit) {
        alert(editability.reason);
        return;
      }
      if (target.isLocked) {
        alert("This issue is locked by another team member.");
        return;
      }
    }
    const newIssues = issues.map(item => {
      if (item.id === issueId) {
        return { ...item, status: 'Not My Function Issue' };
      }
      return item;
    });
    updateIssuesAndSync(newIssues);
  };

  const handleMarkExcludeIssue = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    if (target) {
      const editability = checkIssueEditability(target);
      if (!editability.canEdit) {
        alert(editability.reason);
        return;
      }
      if (target.isLocked) {
        alert("This issue is locked by another team member.");
        return;
      }
    }
    const updatedTarget = {
      ...target,
      isExcluded: true,
      previousStatus: (target.status && target.status !== 'Excluded') ? target.status : (target.previousStatus || 'In progress TC'),
      status: 'Excluded',
      excludedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    // Soft delete: move excluded issue to the end of the list
    const remaining = issues.filter(item => item.id !== issueId);
    const newIssues = [...remaining, updatedTarget];
    setExpandedIssueId(issueId); // Keep active so user can immediately view disabled state & exclusion banner
    updateIssuesAndSync(newIssues);
  };

  const handleIncludeIssue = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    if (target) {
      const editability = checkIssueEditability(target);
      if (!editability.canEdit) {
        alert(editability.reason);
        return;
      }
      if (target.isLocked) {
        alert("This issue is locked by another team member.");
        return;
      }
    }
    const restoredTarget = {
      ...target,
      isExcluded: false,
      status: target.previousStatus || 'In progress TC',
      excludedAt: null
    };
    // Re-insert into active issues (before any other excluded issues)
    const active = issues.filter(item => item.id !== issueId && !item.isExcluded);
    const excluded = issues.filter(item => item.id !== issueId && item.isExcluded);
    const newIssues = [...active, restoredTarget, ...excluded];
    setExpandedIssueId(issueId);
    updateIssuesAndSync(newIssues);
  };

  const renderCriticalityBadge = (crit) => {
    const val = (crit || 'Major').trim();
    let bg = '#F1B500';
    let text = '#ffffff';
    let border = '#D97706';

    if (val === 'Critical') {
      bg = '#D8001D';
      text = '#ffffff';
      border = '#A00014';
    } else if (val === 'Minor' || val === 'Low') {
      bg = '#008000';
      text = '#ffffff';
      border = '#047857';
    } else { // Major
      bg = '#F1B500';
      text = '#ffffff';
      border = '#D97706';
    }

    return (
      <span style={{
        fontSize: '11px',
        fontWeight: '800',
        padding: '2.5px 9px',
        borderRadius: '4px',
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        display: 'inline-block',
        textAlign: 'center',
        letterSpacing: '0.2px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        minWidth: '50px'
      }}>
        {val}
      </span>
    );
  };

  const renderStatusBadge = (st) => {
    if (st === 'Excluded') {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: '800',
          color: '#64748B',
          backgroundColor: '#F1F5F9',
          border: '1px dashed #CBD5E1',
          padding: '1px 6px',
          borderRadius: '4px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <Ban style={{ width: '10px', height: '10px' }} />
          Excluded
        </span>
      );
    }

    let text = '#64748B';
    if (st.includes('Pending')) text = '#991B1B';
    else if (st.includes('progress')) text = '#2563EB';
    else if (st === 'Not an Issue' || st.includes('Not My Function') || st.includes('Not my Function')) text = '#059669';

    return (
      <span style={{ fontSize: '11.5px', fontWeight: '600', color: text }}>
        {st}
      </span>
    );
  };

  // Helper to render distinct Function Pill (IT vs FinOps)
  const renderFunctionPill = (func) => {
    const val = (func || '').toString().trim().toLowerCase();
    const isIT = val.includes('it') || val.includes('tech') || val.includes('cyber') || val.includes('system');
    const bg = isIT ? '#EFF6FF' : '#ECFDF5';
    const text = isIT ? '#1D4ED8' : '#047857';
    const border = isIT ? '#BFDBFE' : '#A7F3D0';
    const dotColor = isIT ? '#3B82F6' : '#10B981';
    const label = isIT ? 'IT' : 'FinOps';

    return (
      <span style={{
        fontSize: '10px',
        fontWeight: '800',
        padding: '2px 8px',
        borderRadius: '9999px',
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ width: '5.5px', height: '5.5px', borderRadius: '50%', backgroundColor: dotColor, display: 'inline-block' }} />
        {label}
      </span>
    );
  };

  // Helper to render PDF HTML card for an issue matching Image 1
  const renderPdfIssueCard = (item, idx = 0) => {
    const reportRefNum = item.reportRef || (idx + 1);
    const critBg = item.criticality === 'Critical' ? '#D8001D' : item.criticality === 'Minor' ? '#008000' : '#F1B500';
    const critTextColor = '#ffffff';

    return (
      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '22px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11px',
          border: '1px solid #000000',
          color: '#000000',
          fontFamily: 'Arial, Helvetica, sans-serif',
          tableLayout: 'fixed'
        }}>
          <tbody>
            {/* ROW 1 (3 Columns) */}
            <tr>
              {/* Col 1: Report Ref & Boxed Criticality Badge */}
              <td style={{
                width: '33.33%',
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '6px' }}>
                  Report Ref: {reportRefNum}
                </div>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: critBg,
                  color: critTextColor,
                  fontWeight: '700',
                  fontSize: '11px',
                  padding: '4px 20px',
                  border: '1px solid #000000',
                  textAlign: 'center'
                }}>
                  {item.criticality || 'Major'}
                </div>
              </td>

              {/* Col 2: Accountable Function(s) */}
              <td style={{
                width: '33.33%',
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  Accountable Function(s):
                </div>
                <div style={{ color: '#000000' }}>
                  {item.accountableFunction || (item.function === 'IT' ? 'Business IT, Finance' : item.function || 'Business IT, Finance')}
                </div>
              </td>

              {/* Col 3: Process Area */}
              <td style={{
                width: '33.34%',
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  Process Area:
                </div>
                <div style={{ color: '#000000' }}>
                  {item.processArea || 'Global_Access_Management'}
                </div>
              </td>
            </tr>

            {/* ROW 2 (3 Columns) */}
            <tr>
              {/* Col 1: Report Finding */}
              <td style={{
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  Report Finding:
                </div>
                <div style={{ color: '#000000' }}>
                  {item.repeatFinding || 'No'}
                </div>
              </td>

              {/* Col 2: Issue Cause Type */}
              <td style={{
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  Issue Cause Type:
                </div>
                <div style={{ color: '#000000' }}>
                  {item.issueCauseType || 'Operating Effectiveness'}
                </div>
              </td>

              {/* Col 3: SOX Reportable */}
              <td style={{
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  SOX Reportable:
                </div>
                <div style={{ color: '#000000' }}>
                  {item.soxReportable || 'No'}
                </div>
              </td>
            </tr>

            {/* ROW 3 (3 Columns: Issue, Root Cause, Impact) */}
            <tr>
              {/* Col 1: Issue */}
              <td style={{
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  Issue:
                </div>
                <div style={{ fontWeight: '700', color: '#000000', marginBottom: '5px', lineHeight: '1.3' }}>
                  {item.title}
                </div>
                {(() => {
                  const p = parseDescriptionWithViolations(item.issue);
                  if (!p.hasViolations) {
                    return (
                      <div style={{ color: '#000000', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                        {item.issue}
                      </div>
                    );
                  }
                  return (
                    <div style={{ color: '#000000', lineHeight: '1.4' }}>
                      <div style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                        {p.mainText}
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '10.5px', marginBottom: '2px' }}>
                        Violation Reference
                      </div>
                      {p.subTitle && (
                        <div style={{ fontSize: '10px', color: '#333333', marginBottom: '4px' }}>
                          {p.subTitle}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                        {p.items.map((vItem, vIdx) => (
                          <div key={vIdx}>
                            <span>{vItem.number}. </span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenViolationDoc(vItem);
                              }}
                              style={{ color: '#1D4ED8', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}
                            >
                              {vItem.linkText}
                            </span>
                            {vItem.title && <span> - {vItem.title}</span>}
                            {vItem.detail && <span> — {vItem.detail}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </td>

              {/* Col 2: Root Cause */}
              <td style={{
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  Root Cause:
                </div>
                <div style={{ color: '#000000', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                  {item.rootCause}
                </div>
              </td>

              {/* Col 3: Impact */}
              <td style={{
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  Impact:
                </div>
                <div style={{ color: '#000000', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                  {item.impact}
                </div>
              </td>
            </tr>

            {/* ROW 4 (2 Columns: Recommendation & Management Response) */}
            <tr>
              {/* Col 1: Recommendation (50%) */}
              <td colSpan={1} style={{
                width: '50%',
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  Recommendation:
                </div>
                <div style={{ color: '#000000', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                  {item.recommendation}
                </div>
              </td>

              {/* Col 2: Management Response (50%) */}
              <td colSpan={2} style={{
                width: '50%',
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '3px' }}>
                  Management Response:
                </div>
                <div style={{ color: '#000000', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                  {item.managementResponse || ''}
                </div>
              </td>
            </tr>

            {/* ROW 5 (2 Columns: Accountable Contact & Agreed Remediation Date) */}
            <tr>
              {/* Col 1: Accountable Contact (50%) */}
              <td colSpan={1} style={{
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '2px' }}>
                  Accountable Contact:
                </div>
                <div style={{ color: '#000000' }}>
                  {item.accountableContact || 'Narasimha, Vinay'}
                </div>
              </td>

              {/* Col 2: Agreed Remediation Date (50%) */}
              <td colSpan={2} style={{
                padding: '6px 8px',
                border: '1px solid #000000',
                verticalAlign: 'top'
              }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#000000', marginBottom: '2px' }}>
                  Agreed Remediation Date:
                </div>
                <div style={{ color: '#000000' }}>
                  {item.agreedRemediationDate || ''}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Helper to render Locked / Blocked Warning Banner when other user is working (No unlock option)
  const renderLockedBanner = (item) => {
    if (!item?.isLocked) return null;
    const lockedBy = item.lockedBy || {
      name: 'Marcus Vance',
      role: 'Lead Compliance Auditor',
      timestamp: '12 mins ago',
      activity: 'Drafting technical root cause analysis & recommendations'
    };

    return (
      <div style={{
        padding: '14px 16px',
        borderRadius: '8px',
        backgroundColor: '#FFFBEB',
        border: '1.5px solid #F59E0B',
        borderLeft: '5px solid #D97706',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#FEF3C7',
          color: '#D97706',
          border: '1px solid #FDE68A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px'
        }}>
          <Lock style={{ width: '18px', height: '18px' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#92400E', margin: 0 }}>
                Issue Locked — {lockedBy.name} is Currently Working
              </h4>
              <span style={{
                fontSize: '9.5px',
                fontWeight: '800',
                color: '#854D0E',
                backgroundColor: '#FEF08A',
                border: '1px solid #FACC15',
                padding: '2px 7px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}>
                LOCKED • READ-ONLY
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#B45309', fontWeight: '600' }}>
              <Clock style={{ width: '12px', height: '12px' }} />
              <span>Locked {lockedBy.timestamp || 'recently'}</span>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#78350F', margin: '0 0 6px 0', lineHeight: '1.45' }}>
            <strong>{lockedBy.name}</strong> ({lockedBy.role || 'Auditor'}) is currently working on this issue, so it is locked. All fields are view-only to prevent concurrent overwriting.
          </p>
          {lockedBy.activity && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#92400E',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: '600'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706', display: 'inline-block' }} />
              <span>Active Work: {lockedBy.activity}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper to render Soft Excluded Banner with option to re-include
  const renderExcludedBanner = (item) => {
    if (!item?.isExcluded) return null;
    const editability = checkIssueEditability(item);
    const canInclude = editability.canEdit && !item.isLocked;

    return (
      <div style={{
        padding: '14px 18px',
        borderRadius: '8px',
        backgroundColor: '#F8FAFC',
        border: '1.5px dashed #94A3B8',
        borderLeft: '5px solid #64748B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: '0 2px 8px rgba(100, 116, 139, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#E2E8F0',
            color: '#475569',
            border: '1px solid #CBD5E1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Ban style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                This issue has been excluded
              </h4>
              <span style={{
                fontSize: '9.5px',
                fontWeight: '800',
                color: '#475569',
                backgroundColor: '#E2E8F0',
                border: '1px solid #CBD5E1',
                padding: '2px 7px',
                borderRadius: '4px',
                letterSpacing: '0.4px'
              }}>
                EXCLUDED • DISABLED
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
              This finding has been softly excluded from the audit report. All issue details are in disabled state. <strong>Do you want to include?</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => handleIncludeIssue(item.id)}
          disabled={!canInclude}
          title={!canInclude ? (item.isLocked ? "Issue is locked" : editability.reason) : "Restore this finding into the active report"}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: '800',
            color: '#ffffff',
            backgroundColor: !canInclude ? '#94A3B8' : '#059669',
            border: 'none',
            borderRadius: '6px',
            cursor: !canInclude ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            boxShadow: !canInclude ? 'none' : '0 2px 6px rgba(5, 150, 105, 0.25)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { if (canInclude) e.currentTarget.style.backgroundColor = '#047857'; }}
          onMouseLeave={(e) => { if (canInclude) e.currentTarget.style.backgroundColor = '#059669'; }}
        >
          <RotateCcw style={{ width: '13px', height: '13px' }} />
          Include Issue
        </button>
      </div>
    );
  };

  // Helper to render Field-Level Comments in Top-Right Space of Input Boxes
  const renderFieldCommentTrigger = (issueId, fieldKey, fieldLabel, isReadOnly) => {
    const comments = (fieldComments[issueId] && fieldComments[issueId][fieldKey]) || [];
    const fieldIdentifier = `${issueId}_${fieldKey}`;
    const isOpen = activeCommentField === fieldIdentifier;
    const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;

    return (
      <div data-field-comment-container="true" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        {comments.length > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommentField(isOpen ? null : fieldIdentifier);
              setNewCommentInput('');
            }}
            title={`Comments on ${fieldLabel}\n${comments.length} comment(s). Click to view thread & reply.`}
            style={{
              padding: '2px 7px',
              fontSize: '10px',
              fontWeight: '700',
              borderRadius: '12px',
              border: isOpen ? '1.5px solid #2563EB' : '1px solid #BFDBFE',
              backgroundColor: isOpen ? '#DBEAFE' : '#EFF6FF',
              color: '#1E40AF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 1px 2px rgba(37,99,235,0.08)',
              transition: 'all 0.15s ease',
              maxWidth: '220px'
            }}
          >
            {/* Avatar of Latest Commenter */}
            <span style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: latestComment.avatarBg || '#2563EB',
              color: '#ffffff',
              fontSize: '8px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {latestComment.avatar || 'U'}
            </span>

            {/* Commenter Name & Comment Snippet */}
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '120px',
              fontSize: '9.5px',
              color: '#1E3A8A'
            }}>
              <strong>{latestComment.user.split(' ')[0]}:</strong> "{latestComment.comment}"
            </span>

            {/* Total Count Badge */}
            <span style={{
              backgroundColor: '#2563EB',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '0 4px',
              fontSize: '9px',
              fontWeight: '800',
              lineHeight: '12px'
            }}>
              {comments.length}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommentField(isOpen ? null : fieldIdentifier);
              setNewCommentInput('');
            }}
            title={`Add a comment on ${fieldLabel}`}
            style={{
              padding: '1px 6px',
              fontSize: '9.5px',
              fontWeight: '600',
              borderRadius: '10px',
              border: isOpen ? '1px solid #2563EB' : '1px dashed #CBD5E1',
              backgroundColor: isOpen ? '#EFF6FF' : '#F8FAFC',
              color: isOpen ? '#2563EB' : '#64748B',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageSquare style={{ width: '9px', height: '9px', color: isOpen ? '#2563EB' : '#94A3B8' }} />
            <span>+ Comment</span>
          </button>
        )}

        {/* FIELD COMMENTS POPOVER */}
        {isOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              width: '320px',
              maxWidth: '90vw',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 12px 28px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              textAlign: 'left'
            }}
          >
            {/* Popover Header */}
            <div style={{
              padding: '9px 12px',
              backgroundColor: '#0F172A',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare style={{ width: '13px', height: '13px', color: '#60A5FA' }} />
                <span style={{ fontSize: '11.5px', fontWeight: '800', letterSpacing: '0.2px' }}>
                  {fieldLabel} Comments
                </span>
                <span style={{
                  backgroundColor: '#1E293B',
                  color: '#94A3B8',
                  fontSize: '9.5px',
                  fontWeight: '700',
                  padding: '1px 5px',
                  borderRadius: '10px'
                }}>
                  {comments.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveCommentField(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {/* Comments List */}
            <div style={{
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backgroundColor: '#F8FAFC'
            }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 8px', color: '#94A3B8', fontSize: '11px' }}>
                  No comments yet on this field.<br />
                  Be the first to leave a review note below!
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: c.avatarBg || '#2563EB',
                          color: '#ffffff',
                          fontSize: '9px',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {c.avatar || 'U'}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F172A' }}>
                            {c.user}
                          </span>
                          {c.role && (
                            <span style={{ fontSize: '9px', color: '#64748B' }}>
                              {c.role}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {c.timestamp}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#334155', margin: '2px 0 0 0', lineHeight: '1.4', wordBreak: 'break-word' }}>
                      {c.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add New Comment Box */}
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <textarea
                rows={2}
                placeholder={`Type a comment on ${fieldLabel}...`}
                value={newCommentInput}
                onChange={(e) => setNewCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleAddFieldComment(issueId, fieldKey);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '11.5px',
                  borderRadius: '5px',
                  border: '1px solid #CBD5E1',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '9.5px', color: '#94A3B8' }}>
                  Press Ctrl+Enter to post
                </span>
                <button
                  type="button"
                  disabled={!newCommentInput.trim()}
                  onClick={() => handleAddFieldComment(issueId, fieldKey)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#ffffff',
                    backgroundColor: newCommentInput.trim() ? '#2563EB' : '#94A3B8',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: newCommentInput.trim() ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Send style={{ width: '10.5px', height: '10.5px' }} />
                  <span>Post Comment</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper to render Domain Restriction Banner (e.g. IT Team Co-Ordinator / IT Manager opening FinOps issue)
  const renderDomainRestrictedBanner = (item, editability) => (
    <div style={{
      padding: '12px 16px',
      backgroundColor: '#F8FAFC',
      border: '1.5px solid #CBD5E1',
      borderLeft: '5px solid #6366F1',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        backgroundColor: '#EEF2FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#4F46E5',
        flexShrink: 0
      }}>
        <ShieldAlert style={{ width: '18px', height: '18px' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1E1B4B', margin: 0 }}>
            Read-Only: {item.id} is a {editability.issueDomain} Issue
          </h4>
          <span style={{
            fontSize: '10px',
            fontWeight: '800',
            padding: '1px 7px',
            borderRadius: '4px',
            backgroundColor: '#E0E7FF',
            color: '#3730A3',
            border: '1px solid #C7D2FE'
          }}>
            Domain Restricted
          </span>
        </div>
        <p style={{ fontSize: '11.5px', color: '#475569', margin: '4px 0 0 0', lineHeight: '1.45' }}>
          {editability.reason}
        </p>
      </div>
    </div>
  );

  // Helper to render Dedicated Business Response Section for Primary Business Contact
  const renderBusinessResponseSection = (item) => {
    const attachments = Array.isArray(item.attachments) ? item.attachments : [];
    const isSubmitted = item.status === 'Submitted to Director' || item.currentLevel === 'Director Review';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Business Response Status Banner */}
        <div style={{
          padding: '12px 14px',
          borderRadius: '8px',
          backgroundColor: isSubmitted ? '#ECFDF5' : '#EFF6FF',
          border: isSubmitted ? '1px solid #A7F3D0' : '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: isSubmitted ? '#10B981' : '#2563EB',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {isSubmitted ? (
              <CheckCircle2 style={{ width: '18px', height: '18px' }} />
            ) : (
              <MessageSquare style={{ width: '18px', height: '18px' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '3px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: isSubmitted ? '#065F46' : '#1E40AF' }}>
                {isSubmitted ? 'Response Submitted to Audit Director' : 'Business Management Response Required'}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                color: isSubmitted ? '#047857' : '#B45309',
                backgroundColor: isSubmitted ? '#D1FAE5' : '#FEF3C7',
                border: isSubmitted ? '1px solid #6EE7B7' : '1px solid #FDE68A',
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Clock style={{ width: '11px', height: '11px' }} />
                {item.status || 'Pending with Business'}
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: isSubmitted ? '#047857' : '#3B82F6', margin: 0, lineHeight: '1.45' }}>
              {isSubmitted 
                ? 'Your response and supporting evidence have been submitted to the Audit Director for review.'
                : 'As the Primary Business Contact, review the audit observation and root cause below, then provide your agreed corrective action plan, remediation timeline, and supporting documentation.'}
            </p>
          </div>
        </div>

        {/* Audit Finding & Observation Reference Card (Read-Only) */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                Auditor Finding
              </div>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {item.title || item.header}
              </h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {renderCriticalityBadge(item.criticality)}
              {renderFunctionPill(item.function || item.tech)}
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.5', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px 12px' }}>
            <div style={{ fontWeight: '700', fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
              Observation &amp; Non-Compliance Details:
            </div>
            <DescriptionWithViolations
              text={item.issue || item.originalIssue || item.summaryFinding || ''}
              onOpenViolationDoc={handleOpenViolationDoc}
              isReadOnly={true}
            />
          </div>

          {item.rootCause && (
            <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.45', backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
              <span style={{ fontWeight: '700', color: '#1E293B' }}>Root Cause: </span>
              {item.rootCause}
            </div>
          )}

          {item.recommendation && (
            <div style={{ fontSize: '11.5px', color: '#1E40AF', lineHeight: '1.45', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '6px', padding: '8px 10px' }}>
              <span style={{ fontWeight: '700', color: '#1E3A8A' }}>Audit Recommendation: </span>
              <span style={{ whiteSpace: 'pre-line' }}>{item.recommendation}</span>
            </div>
          )}
        </div>

        {/* Section 1: Management Response */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare style={{ width: '13px', height: '13px', color: '#2563EB' }} />
              Management Response &amp; Corrective Action Plan <span style={{ color: '#DC2626' }}>*</span>
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#64748B' }}>
              {(item.managementResponse || '').length} characters
            </span>
          </label>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
            Specify the corrective actions agreed upon by management, systemic fixes, ownership, and milestones.
          </p>
          <textarea
            rows={5}
            value={item.managementResponse || ''}
            onChange={(e) => {
              if (businessResponseError) setBusinessResponseError('');
              handleIssueFieldChange(item.id, 'managementResponse', e.target.value);
            }}
            placeholder="Enter detailed management response, corrective action plan, and accountability details..."
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: '1.5px solid #CBD5E1',
              backgroundColor: '#ffffff',
              color: '#0F172A',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Section 2: Agreed Remediation Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar style={{ width: '13px', height: '13px', color: '#2563EB' }} />
            Agreed Remediation Date <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
            Target completion date agreed upon with Internal Audit for full closure of corrective actions.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={item.agreedRemediationDate || ''}
              onChange={(e) => {
                if (businessResponseError) setBusinessResponseError('');
                handleIssueFieldChange(item.id, 'agreedRemediationDate', e.target.value);
              }}
              style={{
                height: '36px',
                padding: '0 10px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#ffffff',
                color: '#0F172A',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            {/* Quick Presets */}
            {['2026-10-31', '2026-11-30', '2026-12-31', '2027-01-31'].map(presetDate => (
              <button
                key={presetDate}
                type="button"
                onClick={() => {
                  if (businessResponseError) setBusinessResponseError('');
                  handleIssueFieldChange(item.id, 'agreedRemediationDate', presetDate);
                }}
                style={{
                  height: '32px',
                  padding: '0 9px',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '5px',
                  border: item.agreedRemediationDate === presetDate ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                  backgroundColor: item.agreedRemediationDate === presetDate ? '#EFF6FF' : '#F8FAFC',
                  color: item.agreedRemediationDate === presetDate ? '#1D4ED8' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {presetDate}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Upload Attachments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Paperclip style={{ width: '13px', height: '13px', color: '#2563EB' }} />
              Upload Attachments &amp; Evidence Files
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#64748B' }}>
              {attachments.length} {attachments.length === 1 ? 'file' : 'files'} attached
            </span>
          </label>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
            Upload supporting artifacts such as ticket extracts, vendor agreements, architecture diagrams, or sign-off emails.
          </p>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={businessFileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(item.id, e.target.files);
                e.target.value = '';
              }
            }}
            multiple
            style={{ display: 'none' }}
          />

          {/* Drag & Drop Zone */}
          <div
            onClick={() => businessFileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setUploadDragOver(true);
            }}
            onDragLeave={() => setUploadDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setUploadDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileUpload(item.id, e.dataTransfer.files);
              }
            }}
            style={{
              padding: '20px',
              border: uploadDragOver ? '2px dashed #2563EB' : '2px dashed #CBD5E1',
              backgroundColor: uploadDragOver ? '#EFF6FF' : '#F8FAFC',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: uploadDragOver ? '#DBEAFE' : '#E2E8F0',
              color: uploadDragOver ? '#1D4ED8' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UploadCloud style={{ width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
              Click to upload or drag and drop files here
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B' }}>
              Supports PDF, DOCX, XLSX, PNG, JPG (up to 25 MB per file)
            </div>
          </div>

          {/* Attachment Cards List */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {attachments.map(att => (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #CBD5E1',
                    fontSize: '11.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '4px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Paperclip style={{ width: '13px', height: '13px' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px' }}>
                        {att.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', display: 'flex', gap: '8px' }}>
                        <span>{att.size}</span>
                        <span>•</span>
                        <span>{att.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(item.id, att.id)}
                    title="Remove attachment"
                    style={{
                      padding: '4px 6px',
                      borderRadius: '4px',
                      border: '1px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10.5px',
                      fontWeight: '700'
                    }}
                  >
                    <Trash2 style={{ width: '11px', height: '11px' }} />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Validation Error Message */}
        {businessResponseError && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertOctagon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{businessResponseError}</span>
          </div>
        )}

        {/* Submit & Save Draft Action Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #E2E8F0',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => handleSaveBusinessDraft(item.id)}
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Save style={{ width: '13.5px', height: '13.5px', color: '#64748B' }} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmitBusinessResponse(item.id)}
            style={{
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: '800',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0284C7',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Send style={{ width: '14px', height: '14px' }} />
            <span>Submit Response to Director</span>
          </button>
        </div>
      </div>
    );
  };

  // Helper to render Form Fields for an issue
  const renderFormFields = (item) => {
    const editability = checkIssueEditability(item);
    const isRoleRestricted = !editability.canEdit;
    const isReadOnly = !!item.isLocked || isRoleRestricted || !!item.isExcluded;

    const inputBaseStyle = {
      width: '100%',
      height: '34px',
      padding: '0 10px',
      fontSize: '12px',
      borderRadius: '6px',
      border: isReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
      backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff',
      color: isReadOnly ? '#64748B' : '#0F172A',
      cursor: isReadOnly ? 'not-allowed' : 'text',
      outline: 'none',
      boxSizing: 'border-box'
    };

    const selectBaseStyle = {
      width: '100%',
      height: '34px',
      padding: '0 8px',
      fontSize: '12px',
      borderRadius: '6px',
      border: isReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
      backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff',
      color: isReadOnly ? '#64748B' : '#0F172A',
      cursor: isReadOnly ? 'not-allowed' : 'pointer',
      outline: 'none',
      boxSizing: 'border-box'
    };

    const textareaBaseStyle = {
      width: '100%',
      padding: '8px 10px',
      fontSize: '12px',
      borderRadius: '6px',
      border: isReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
      backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff',
      color: isReadOnly ? '#64748B' : '#0F172A',
      cursor: isReadOnly ? 'not-allowed' : 'text',
      fontFamily: 'inherit',
      resize: isReadOnly ? 'none' : 'vertical',
      outline: 'none',
      lineHeight: '1.5',
      boxSizing: 'border-box'
    };

    const labelStyle = {
      fontSize: '11px',
      fontWeight: '700',
      color: isReadOnly ? '#64748B' : '#334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '4px'
    };

    return (
      <>
        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* 1. TOP SECTION: MANUAL IMPORTANT FIELDS                         */}
        {/* ============================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Field 1: Test Procedure */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Test Procedure</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'testProcedure', 'Test Procedure', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.testProcedure || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'testProcedure', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="" disabled>Select Test Procedure...</option>
              {item.testProcedure && !TEST_PROCEDURE_OPTIONS.includes(item.testProcedure) && (
                <option value={item.testProcedure}>{item.testProcedure}</option>
              )}
              {TEST_PROCEDURE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Field 2: Original Issue (Textarea) */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Original Issue</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'originalIssue', 'Original Issue', isReadOnly)}
              </div>
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.originalIssue || item.issue || ''}
              placeholder="Enter original finding text..."
              onChange={(e) => handleIssueFieldChange(item.id, 'originalIssue', e.target.value)}
              style={textareaBaseStyle}
            />
          </div>

          {/* Field 3: Criticality (Function dropdown removed per user request) */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Criticality</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'criticality', 'Criticality', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.criticality}
              onChange={(e) => handleIssueFieldChange(item.id, 'criticality', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. MIDDLE SECTION: AI GENERATED FIELDS (IN ONE CONTAINER)       */}
        {/* ============================================================== */}
        <div style={{
          marginTop: '6px',
          backgroundColor: '#F8FAFC',
          border: '1.5px solid #E2E8F0',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
        }}>
          {/* Container Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles style={{ width: '14px', height: '14px', color: '#2563EB' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>AI Generated Fields</span>
                </h4>
                <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                  AI Synthesized title, observation, root cause, impact &amp; recommendation
                </span>
              </div>
            </div>

            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#1D4ED8',
              backgroundColor: '#DBEAFE',
              border: '1px solid #BFDBFE',
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles style={{ width: '10px', height: '10px', color: '#2563EB' }} />
              AI Synthesized
            </span>
          </div>

          {/* AI Field 1: Issue Title */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Issue Title</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.isExcluded ? (
                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Ban style={{ width: '10px', height: '10px' }} />
                    Excluded Finding (Disabled)
                  </span>
                ) : item.isLocked ? (
                  <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>🔒 Locked</span>
                ) : isRoleRestricted ? (
                  <span style={{ fontSize: '10px', color: '#4338CA', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldAlert style={{ width: '10px', height: '10px' }} />
                    Read-Only ({editability.userRoleLabel})
                  </span>
                ) : null}
                {renderFieldCommentTrigger(item.id, 'title', 'Issue Title', isReadOnly)}
              </div>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.title}
              onChange={(e) => handleIssueFieldChange(item.id, 'title', e.target.value)}
              style={inputBaseStyle}
            />
          </div>

          {/* AI Field 2: Description (with clickable Violation References & PDF Viewer Drawer) */}
          <DescriptionWithViolations
            label="Description"
            value={item.issue || ''}
            onChange={(val) => handleIssueFieldChange(item.id, 'issue', val)}
            isReadOnly={isReadOnly}
            onOpenViolationDoc={handleOpenViolationDoc}
            commentTrigger={renderFieldCommentTrigger(item.id, 'issue', 'Description', isReadOnly)}
          />

          {/* AI Field 3: Root Cause */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Root Cause</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isReadOnly && <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>🔒 Read Only</span>}
                {renderFieldCommentTrigger(item.id, 'rootCause', 'Root Cause', isReadOnly)}
              </div>
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.rootCause}
              onChange={(e) => handleIssueFieldChange(item.id, 'rootCause', e.target.value)}
              style={{ ...textareaBaseStyle, backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff' }}
            />
          </div>

          {/* AI Field 4: Impact */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Impact</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isReadOnly && <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>🔒 Read Only</span>}
                {renderFieldCommentTrigger(item.id, 'impact', 'Impact', isReadOnly)}
              </div>
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.impact}
              onChange={(e) => handleIssueFieldChange(item.id, 'impact', e.target.value)}
              style={{ ...textareaBaseStyle, backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff' }}
            />
          </div>

          {/* AI Field 5: Recommendation */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Recommendation</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isReadOnly && <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>🔒 Read Only</span>}
                {renderFieldCommentTrigger(item.id, 'recommendation', 'Recommendation', isReadOnly)}
              </div>
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.recommendation}
              onChange={(e) => handleIssueFieldChange(item.id, 'recommendation', e.target.value)}
              style={{ ...textareaBaseStyle, backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff' }}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. BOTTOM SECTION: ALL OTHER AUDIT & GOVERNANCE FIELDS          */}
        {/* ============================================================== */}
        <div style={{
          marginTop: '8px',
          paddingTop: '14px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
              Other Audit &amp; Governance Fields
            </h4>
            <span style={{ fontSize: '10.5px', color: '#64748B' }}>
              Process categorization, contacts, remediation &amp; extended attributes
            </span>
          </div>
        </div>

        {/* Process Area & Issue Cause Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Process Area</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'processArea', 'Process Area', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.processArea}
              onChange={(e) => handleIssueFieldChange(item.id, 'processArea', e.target.value)}
              style={selectBaseStyle}
            >
              {item.processArea && !PROCESS_AREA_OPTIONS.includes(item.processArea) && (
                <option value={item.processArea}>
                  {item.processArea.replace(/_/g, ' ')}
                </option>
              )}
              {PROCESS_AREA_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Issue Cause Type</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'issueCauseType', 'Cause Type', isReadOnly)}
              </div>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.issueCauseType}
              onChange={(e) => handleIssueFieldChange(item.id, 'issueCauseType', e.target.value)}
              style={inputBaseStyle}
            />
          </div>
        </div>

        {/* SOX Reportable & Repeat Finding */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>SOX Reportable</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'soxReportable', 'SOX Reportable', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.soxReportable}
              onChange={(e) => handleIssueFieldChange(item.id, 'soxReportable', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Repeat Finding</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'repeatFinding', 'Repeat Finding', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.repeatFinding}
              onChange={(e) => handleIssueFieldChange(item.id, 'repeatFinding', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>

        {/* Management Response */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Management Response</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
              {renderFieldCommentTrigger(item.id, 'managementResponse', 'Management Response', isReadOnly)}
            </div>
          </label>
          <textarea
            rows={2}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.managementResponse || ''}
            placeholder="Enter management response..."
            onChange={(e) => handleIssueFieldChange(item.id, 'managementResponse', e.target.value)}
            style={textareaBaseStyle}
          />
        </div>

        {/* Accountable Contact & Agreed Remediation Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Accountable Contact</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'accountableContact', 'Accountable Contact', isReadOnly)}
              </div>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.accountableContact || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'accountableContact', e.target.value)}
              style={inputBaseStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Agreed Remediation Date</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'agreedRemediationDate', 'Agreed Remediation Date', isReadOnly)}
              </div>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.agreedRemediationDate || ''}
              placeholder="YYYY-MM-DD"
              onChange={(e) => handleIssueFieldChange(item.id, 'agreedRemediationDate', e.target.value)}
              style={inputBaseStyle}
            />
          </div>
        </div>

        {/* Summary Finding (Executive Summary) */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Summary Finding (Executive Summary)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
              {renderFieldCommentTrigger(item.id, 'summaryFinding', 'Summary Finding', isReadOnly)}
            </div>
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.summaryFinding || ''}
            placeholder="Enter summary finding (executive summary)..."
            onChange={(e) => handleIssueFieldChange(item.id, 'summaryFinding', e.target.value)}
            style={textareaBaseStyle}
          />
        </div>

        {/* Auditor Response */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Auditor Response</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
              {renderFieldCommentTrigger(item.id, 'auditorResponse', 'Auditor Response', isReadOnly)}
            </div>
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.auditorResponse || ''}
            placeholder="Enter auditor response details..."
            onChange={(e) => handleIssueFieldChange(item.id, 'auditorResponse', e.target.value)}
            style={textareaBaseStyle}
          />
        </div>

        {/* Mitigating Control */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Mitigating Control</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
              {renderFieldCommentTrigger(item.id, 'mitigatingControl', 'Mitigating Control', isReadOnly)}
            </div>
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.mitigatingControl || ''}
            placeholder="Enter mitigating control details..."
            onChange={(e) => handleIssueFieldChange(item.id, 'mitigatingControl', e.target.value)}
            style={textareaBaseStyle}
          />
        </div>

        {/* Exception Remed Comments */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Exception Remed Comments</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
              {renderFieldCommentTrigger(item.id, 'exceptionRemedComments', 'Exception Remed Comments', isReadOnly)}
            </div>
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.exceptionRemedComments || ''}
            placeholder="Enter exception remediation comments..."
            onChange={(e) => handleIssueFieldChange(item.id, 'exceptionRemedComments', e.target.value)}
            style={textareaBaseStyle}
          />
        </div>

        {/* Issue Type & Issue Source - Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Issue Type</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'issueType', 'Issue Type', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.issueType || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'issueType', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="" disabled>Select Issue Type...</option>
              {item.issueType && !ISSUE_TYPE_OPTIONS.includes(item.issueType) && (
                <option value={item.issueType}>{item.issueType}</option>
              )}
              {ISSUE_TYPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Issue Source</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'issueSource', 'Issue Source', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.issueSource || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'issueSource', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="" disabled>Select Issue Source...</option>
              {item.issueSource && !ISSUE_SOURCE_OPTIONS.includes(item.issueSource) && (
                <option value={item.issueSource}>{item.issueSource}</option>
              )}
              {ISSUE_SOURCE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Theme & Technology Related - Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Key Theme</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'keyTheme', 'Key Theme', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.keyTheme || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'keyTheme', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="" disabled>Select Key Theme...</option>
              {item.keyTheme && !KEY_THEME_OPTIONS.includes(item.keyTheme) && (
                <option value={item.keyTheme}>{item.keyTheme}</option>
              )}
              {KEY_THEME_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Technology Related</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'technologyRelated', 'Technology Related', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.technologyRelated || 'No'}
              onChange={(e) => handleIssueFieldChange(item.id, 'technologyRelated', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>

        {/* IT Asset Accountable Sector & Impacted Region - Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>IT Asset Accountable Sector</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'itAssetAccountableSector', 'IT Asset Accountable Sector', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.itAssetAccountableSector || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'itAssetAccountableSector', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="" disabled>Select Sector...</option>
              {item.itAssetAccountableSector && !IT_ASSET_ACCOUNTABLE_SECTOR_OPTIONS.includes(item.itAssetAccountableSector) && (
                <option value={item.itAssetAccountableSector}>{item.itAssetAccountableSector}</option>
              )}
              {IT_ASSET_ACCOUNTABLE_SECTOR_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Impacted Region</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'impactedRegion', 'Impacted Region', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.impactedRegion || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'impactedRegion', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="" disabled>Select Region...</option>
              {item.impactedRegion && !IMPACTED_REGION_OPTIONS.includes(item.impactedRegion) && (
                <option value={item.impactedRegion}>{item.impactedRegion}</option>
              )}
              {IMPACTED_REGION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Impacted Sector & Impacted MRC - Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Impacted Sector</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'impactedSector', 'Impacted Sector', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.impactedSector || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'impactedSector', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="" disabled>Select Sector...</option>
              {item.impactedSector && !IMPACTED_SECTOR_OPTIONS.includes(item.impactedSector) && (
                <option value={item.impactedSector}>{item.impactedSector}</option>
              )}
              {IMPACTED_SECTOR_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Impacted MRC</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'impactedMrc', 'Impacted MRC', isReadOnly)}
              </div>
            </label>
            <select
              disabled={isReadOnly}
              value={item.impactedMrc || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'impactedMrc', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="" disabled>Select MRC...</option>
              {item.impactedMrc && !IMPACTED_MRC_OPTIONS.includes(item.impactedMrc) && (
                <option value={item.impactedMrc}>{item.impactedMrc}</option>
              )}
              {IMPACTED_MRC_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quarter Impacted - Dropdown */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Quarter Impacted</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
              {renderFieldCommentTrigger(item.id, 'quarterImpacted', 'Quarter Impacted', isReadOnly)}
            </div>
          </label>
          <select
            disabled={isReadOnly}
            value={item.quarterImpacted || ''}
            onChange={(e) => handleIssueFieldChange(item.id, 'quarterImpacted', e.target.value)}
            style={selectBaseStyle}
          >
            <option value="" disabled>Select Quarter Impacted...</option>
            {item.quarterImpacted && !QUARTER_IMPACTED_OPTIONS.includes(item.quarterImpacted) && (
              <option value={item.quarterImpacted}>{item.quarterImpacted}</option>
            )}
            {QUARTER_IMPACTED_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Financial Metrics: Sales (USD), IBT (USD), Net Income (USD), Total Assets (USD) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Sales (USD)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'salesUsd', 'Sales (USD)', isReadOnly)}
              </div>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.salesUsd || ''}
              placeholder="$0.00"
              onChange={(e) => handleIssueFieldChange(item.id, 'salesUsd', e.target.value)}
              style={inputBaseStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>IBT (USD)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'ibtUsd', 'IBT (USD)', isReadOnly)}
              </div>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.ibtUsd || ''}
              placeholder="$0.00"
              onChange={(e) => handleIssueFieldChange(item.id, 'ibtUsd', e.target.value)}
              style={inputBaseStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Net Income (USD)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'netIncomeUsd', 'Net Income (USD)', isReadOnly)}
              </div>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.netIncomeUsd || ''}
              placeholder="$0.00"
              onChange={(e) => handleIssueFieldChange(item.id, 'netIncomeUsd', e.target.value)}
              style={inputBaseStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Total Assets (USD)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
                {renderFieldCommentTrigger(item.id, 'totalAssetsUsd', 'Total Assets (USD)', isReadOnly)}
              </div>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.totalAssetsUsd || ''}
              placeholder="$0.00"
              onChange={(e) => handleIssueFieldChange(item.id, 'totalAssetsUsd', e.target.value)}
              style={inputBaseStyle}
            />
          </div>
        </div>

        {/* Exception - Remed Date (Checkbox & Date input) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id={`exceptionRemedCheck_${item.id}`}
                disabled={isReadOnly}
                checked={!!item.hasExceptionRemedDate}
                onChange={(e) => handleIssueFieldChange(item.id, 'hasExceptionRemedDate', e.target.checked)}
                style={{ width: '15px', height: '15px', accentColor: '#D8001D', cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
              />
              <label
                htmlFor={`exceptionRemedCheck_${item.id}`}
                style={{ fontSize: '11px', fontWeight: '700', color: isReadOnly ? '#64748B' : '#334155', cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
              >
                Exception - Remed Date
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
              {renderFieldCommentTrigger(item.id, 'exceptionRemedDate', 'Exception - Remed Date', isReadOnly)}
            </div>
          </div>
          {item.hasExceptionRemedDate && (
            <input
              type="date"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.exceptionRemedDate || ''}
              onChange={(e) => handleIssueFieldChange(item.id, 'exceptionRemedDate', e.target.value)}
              style={{ ...inputBaseStyle, marginTop: '4px' }}
            />
          )}
        </div>
      </>
    );
  };

  // Helper to render Issue Action Toolbar Buttons
  const renderActionToolbar = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    const editability = target ? checkIssueEditability(target) : { canEdit: true };
    const isRoleRestricted = !editability.canEdit;
    const isLockedByOther = !!target?.isLocked;
    const isActionDisabled = isRoleRestricted || isLockedByOther;
    const disabledTooltip = isRoleRestricted ? editability.reason : isLockedByOther ? "This issue is locked by another user" : undefined;
    const roleConfig = getRoleSubmissionConfig(userRole);

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px', paddingBottom: '4px' }}>
        
        {/* Three Dots More Actions Menu (Track Changes, Mark Not my Function Issue, Mark Exclude Issue) */}
        <div style={{ position: 'relative' }} ref={actionMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreMenuOpen(!isMoreMenuOpen);
            }}
            style={{
              padding: '7px 9px',
              fontSize: '11.5px',
              fontWeight: '700',
              color: isMoreMenuOpen ? '#1E293B' : '#475569',
              backgroundColor: isMoreMenuOpen ? '#F1F5F9' : '#ffffff',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            title="More actions"
          >
            <MoreVertical style={{ width: '15px', height: '15px' }} />
          </button>

          {isMoreMenuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8F0',
              minWidth: '220px',
              width: 'max-content',
              padding: '4px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setIsIssueLogsModalOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  color: '#D8001D',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF0F2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <History style={{ width: '14px', height: '14px', color: '#D8001D' }} />
                <span>Track Changes</span>
              </button>

              <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '2px 0' }} />

              <button
                disabled={isActionDisabled}
                onClick={() => {
                  if (isActionDisabled) return;
                  setIsMoreMenuOpen(false);
                  handleMarkNotAnIssue(issueId);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  color: isActionDisabled ? '#94A3B8' : '#047857',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                  opacity: isActionDisabled ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  whiteSpace: 'nowrap'
                }}
                title={disabledTooltip}
                onMouseEnter={(e) => { if (!isActionDisabled) e.currentTarget.style.backgroundColor = '#ECFDF5'; }}
                onMouseLeave={(e) => { if (!isActionDisabled) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <CheckCircle2 style={{ width: '14px', height: '14px', color: isActionDisabled ? '#94A3B8' : '#047857' }} />
                <span>Mark Not my Function Issue</span>
              </button>

              {target?.isExcluded ? (
                <button
                  disabled={isActionDisabled}
                  onClick={() => {
                    if (isActionDisabled) return;
                    setIsMoreMenuOpen(false);
                    handleIncludeIssue(issueId);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    color: isActionDisabled ? '#94A3B8' : '#059669',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                    opacity: isActionDisabled ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left'
                  }}
                  title={disabledTooltip}
                  onMouseEnter={(e) => { if (!isActionDisabled) e.currentTarget.style.backgroundColor = '#ECFDF5'; }}
                  onMouseLeave={(e) => { if (!isActionDisabled) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <RotateCcw style={{ width: '14px', height: '14px', color: isActionDisabled ? '#94A3B8' : '#059669' }} />
                  <span>Include Issue in Report</span>
                </button>
              ) : (
                <button
                  disabled={isActionDisabled}
                  onClick={() => {
                    if (isActionDisabled) return;
                    setIsMoreMenuOpen(false);
                    handleMarkExcludeIssue(issueId);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    color: isActionDisabled ? '#94A3B8' : '#991B1B',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                    opacity: isActionDisabled ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left'
                  }}
                  title={disabledTooltip}
                  onMouseEnter={(e) => { if (!isActionDisabled) e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                  onMouseLeave={(e) => { if (!isActionDisabled) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <AlertOctagon style={{ width: '14px', height: '14px', color: isActionDisabled ? '#94A3B8' : '#991B1B' }} />
                  <span>Mark Exclude Issue</span>
                </button>
              )}

            </div>
          )}
        </div>

        {/* Call Back Button */}
        <button
          disabled={isActionDisabled}
          onClick={() => handleOpenCallbackModal(issueId)}
          style={{
            padding: '7px 14px',
            fontSize: '11.5px',
            fontWeight: '800',
            color: '#ffffff',
            backgroundColor: isActionDisabled ? '#94A3B8' : '#7C3AED',
            border: 'none',
            borderRadius: '6px',
            cursor: isActionDisabled ? 'not-allowed' : 'pointer',
            opacity: isActionDisabled ? 0.45 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: isActionDisabled ? 'none' : '0 1px 3px rgba(124,58,237,0.2)'
          }}
          title={disabledTooltip}
        >
          <RotateCcw style={{ width: '13.5px', height: '13.5px' }} />
          <span>Call Back</span>
        </button>

        {/* Send to Management Response Button (Visible for Director at Issue Level) */}
        {roleConfig.canSendToManagementResponse && (
          <button
            disabled={isActionDisabled}
            onClick={() => handleSendToManagementResponse(issueId)}
            style={{
              padding: '7px 14px',
              fontSize: '11.5px',
              fontWeight: '800',
              color: '#ffffff',
              backgroundColor: isActionDisabled ? '#94A3B8' : '#0284C7',
              border: 'none',
              borderRadius: '6px',
              cursor: isActionDisabled ? 'not-allowed' : 'pointer',
              opacity: isActionDisabled ? 0.45 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: isActionDisabled ? 'none' : '0 1px 3px rgba(2,132,199,0.25)',
              transition: 'all 0.15s ease'
            }}
            title={disabledTooltip || "Send this issue to Business for Management Response"}
          >
            <MessageSquare style={{ width: '13.5px', height: '13.5px' }} />
            <span>Send to Management Response</span>
          </button>
        )}

        {/* Role-Specific Submit Button (Submit to TC / Submit to Manager / Submit to Director / Submit to VP / Sign-Off) */}
        <button
          disabled={isActionDisabled}
          onClick={() => handleSubmitIssue(issueId)}
          style={{
            padding: '7px 14px',
            fontSize: '11.5px',
            fontWeight: '800',
            color: '#ffffff',
            backgroundColor: isActionDisabled ? '#94A3B8' : (roleConfig.baseRole === 'vp' ? '#0D9488' : '#059669'),
            border: 'none',
            borderRadius: '6px',
            cursor: isActionDisabled ? 'not-allowed' : 'pointer',
            opacity: isActionDisabled ? 0.45 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: isActionDisabled ? 'none' : (roleConfig.baseRole === 'vp' ? '0 1px 3px rgba(13,148,136,0.2)' : '0 1px 3px rgba(5,150,105,0.2)'),
            transition: 'all 0.15s ease'
          }}
          title={disabledTooltip || `${roleConfig.submitLabel} for review`}
        >
          {roleConfig.baseRole === 'vp' ? (
            <CheckCircle2 style={{ width: '13.5px', height: '13.5px' }} />
          ) : (
            <Send style={{ width: '13.5px', height: '13.5px' }} />
          )}
          <span>{roleConfig.submitLabel}</span>
        </button>

      </div>
    );
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      
      {/* Studio Toolbar (Sits directly under Application Header) */}
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        {/* Left Side: Back Arrow Button + Title: Audit Report - [Job Name] + Editing Pill Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Back Button */}
          <button
            onClick={onClose}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}
            title="Back to Reporting Queue"
          >
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#D8001D' }} />
            <span>Back</span>
          </button>

          {/* Title */}
          <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Audit Report — {job?.fileName || job?.id || 'BiosenseWebster_Catheters_Audit'}
          </h1>

          {/* Active Role Indicator */}
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#475569',
            backgroundColor: '#F8FAFC',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ color: '#94A3B8' }}>Role:</span>
            <strong style={{ color: '#0F172A' }}>{activeRoleObj.label}</strong>
          </span>

          {/* Editing Pill Badge / Read-Only Badge */}
          {selectedIssue && (
            selectedIssue.isLocked ? (
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#92400E', backgroundColor: '#FEF3C7', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Lock style={{ width: '12px', height: '12px' }} />
                Locked by {selectedIssue.lockedBy?.name || 'Another User'} (Read-Only)
              </span>
            ) : isBusinessUser ? (
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284C7', backgroundColor: '#F0F9FF', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MessageSquare style={{ width: '12px', height: '12px' }} />
                Pending Response: {selectedIssue.id}
              </span>
            ) : !selectedIssueEditability.canEdit ? (
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#4338CA', backgroundColor: '#EEF2FF', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldAlert style={{ width: '12px', height: '12px' }} />
                Read-Only: {selectedIssue.id} ({selectedIssueEditability.issueDomain})
              </span>
            ) : (
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#D8001D', backgroundColor: '#FFF0F2', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #FCA5A5' }}>
                Editing: {selectedIssue.id}
              </span>
            )
          )}


        </div>

        {/* Top Right Job-Level Actions + Three-Dots Design Switcher Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>

          {/* Switch to Executive Summary Report Button */}
          {onSwitchToExecutiveReport && (
            <button
              onClick={onSwitchToExecutiveReport}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '800',
                color: '#D8001D',
                backgroundColor: '#FFF1F2',
                border: '1.5px solid #FCA5A5',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Open Executive Summary Report Studio"
            >
              <FileText style={{ width: '14px', height: '14px', color: '#D8001D' }} />
              <span>Summary Report</span>
            </button>
          )}

          {/* Report-Level Submission / Sign Off Button (Only applicable for Manager, Director, and VP) */}
          {(() => {
            const roleConfig = getRoleSubmissionConfig(userRole);
            if (!roleConfig.hasReportSubmission) return null;

            const isVP = roleConfig.baseRole === 'vp';
            const buttonLabel = isVP 
              ? (isReportSignedOff ? 'Report Signed Off' : 'Sign-Off')
              : roleConfig.reportSubmitLabel;
            const buttonBg = isVP
              ? (isReportSignedOff ? '#059669' : '#0D9488')
              : '#059669';

            return (
              <button
                onClick={handleReportSubmit}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#ffffff',
                  backgroundColor: buttonBg,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isVP ? '0 1px 3px rgba(13,148,136,0.25)' : '0 1px 3px rgba(5,150,105,0.25)',
                  transition: 'all 0.15s ease'
                }}
                title={isVP ? 'Sign off this complete Audit Report' : `${roleConfig.reportSubmitLabel} for review`}
              >
                {isVP ? (
                  <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                ) : (
                  <Send style={{ width: '13.5px', height: '13.5px' }} />
                )}
                <span>{buttonLabel}</span>
              </button>
            );
          })()}

          {/* Download PDF Button */}
          <button
            onClick={() => alert(`Downloading PDF Report for ${job?.id || 'JOB-2026-881'}`)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#1E293B',
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download style={{ width: '14px', height: '14px', color: '#2563EB' }} />
            <span>Download PDF</span>
          </button>

          {/* Workflow Button */}
          <button
            onClick={() => setIsWorkflowModalOpen(true)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              color: isWorkflowModalOpen ? '#ffffff' : '#2563EB',
              backgroundColor: isWorkflowModalOpen ? '#2563EB' : '#ffffff',
              border: '1.5px solid #2563EB',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            title="View Workflow Stages & Status"
          >
            <GitBranch style={{ width: '14px', height: '14px', color: isWorkflowModalOpen ? '#ffffff' : '#2563EB' }} />
            <span>Workflow</span>
          </button>

          {/* Track Changes Button */}
          <button
            onClick={() => setIsIssueLogsModalOpen(true)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              color: isIssueLogsModalOpen ? '#ffffff' : '#D8001D',
              backgroundColor: isIssueLogsModalOpen ? '#D8001D' : '#ffffff',
              border: '1.5px solid #D8001D',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History style={{ width: '14px', height: '14px', color: isIssueLogsModalOpen ? '#ffffff' : '#D8001D' }} />
            <span>Track Changes</span>
          </button>



        </div>
      </div>

      {/* DYNAMIC DESIGN WORKSPACE RENDERER */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          userSelect: (isDraggingSplitter1 || isDraggingSplitter2) ? 'none' : 'auto'
        }}
      >
        
        {/* ============================================================== */}
        {/* MODE 1: DEFAULT INLINE EXPANDED TABLE LAYOUT                  */}
        {/* ============================================================== */}
        {designMode === 'default' && (
          <>
            {/* Left Column Issues Table */}
            <div style={{ width: '50%', borderRight: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #D8001D', color: '#D8001D', fontSize: '11.5px', textTransform: 'none' }}>
                      <th style={{ width: '36px', padding: '12px 8px', textAlign: 'center' }}></th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>Issue Title</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800', width: '80px' }}>Function</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800', width: '130px' }}>Process Area</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800', width: '90px' }}>Criticality</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800', width: '90px' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800', width: '60px', textAlign: 'center' }}>Reorder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
                          <AlertOctagon style={{ width: '36px', height: '36px', color: '#94A3B8', margin: '0 auto 10px' }} />
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B' }}>No Issues in Audit Engagement</div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>There are currently no findings or issues logged for {job?.fileName || job?.engagement || 'this engagement'}.</div>
                        </td>
                      </tr>
                    ) : (
                      issues.map((item, idx) => {
                        const isExpanded = expandedIssueId === item.id;
                      return (
                        <React.Fragment key={item.id}>
                          <tr style={{
                            borderBottom: '1px solid #E2E8F0',
                            backgroundColor: item.isExcluded ? '#F8FAFC' : (isExpanded ? '#FFF5F6' : 'transparent'),
                            opacity: item.isExcluded ? 0.65 : 1
                          }}>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              <button
                                onClick={() => setExpandedIssueId(isExpanded ? null : item.id)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: item.isExcluded ? '#64748B' : '#D8001D' }}
                              >
                                {isExpanded ? <Minus style={{ width: '15px', height: '15px' }} /> : <Plus style={{ width: '15px', height: '15px' }} />}
                              </button>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: '700', color: item.isExcluded ? '#64748B' : '#0F172A', textDecoration: item.isExcluded ? 'line-through' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  color: '#1E40AF',
                                  backgroundColor: '#EFF6FF',
                                  padding: '2px 8px',
                                  borderRadius: '5px',
                                  border: '1px solid #BFDBFE',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Report Ref - {item.reportRef || (idx + 1)}
                                </span>
                                <span>{item.title}</span>
                                {item.isExcluded ? (
                                  <span style={{ fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#E2E8F0', color: '#475569', border: '1px solid #CBD5E1', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                                    <Ban style={{ width: '9.5px', height: '9.5px' }} />
                                    EXCLUDED
                                  </span>
                                ) : item.isLocked ? (
                                  <span style={{ fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                                    <Lock style={{ width: '9.5px', height: '9.5px' }} />
                                    LOCKED ({item.lockedBy?.name || 'In Use'})
                                  </span>
                                ) : !checkIssueEditability(item).canEdit ? (
                                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                                    <Lock style={{ width: '9.5px', height: '9.5px' }} />
                                    Read-Only
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>{renderFunctionPill(item.function)}</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{item.processArea}</td>
                            <td style={{ padding: '12px 16px' }}>{renderCriticalityBadge(item.criticality)}</td>
                            <td style={{ padding: '12px 16px' }}>{renderStatusBadge(item.status)}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <button onClick={() => handleMoveIssue(idx, 'up')} disabled={idx === 0} style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#CBD5E1' : '#475569' }}>
                                  <ArrowUp style={{ width: '14px', height: '14px' }} />
                                </button>
                                <button onClick={() => handleMoveIssue(idx, 'down')} disabled={idx === issues.length - 1} style={{ border: 'none', background: 'none', cursor: idx === issues.length - 1 ? 'default' : 'pointer', color: idx === issues.length - 1 ? '#CBD5E1' : '#475569' }}>
                                  <ArrowDown style={{ width: '14px', height: '14px' }} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan="7" style={{ padding: '16px', backgroundColor: '#FAFAFA', borderBottom: '2px solid #CBD5E1' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {item.isExcluded ? (
                                    renderExcludedBanner(item)
                                  ) : item.isLocked ? (
                                    renderLockedBanner(item)
                                  ) : !checkIssueEditability(item).canEdit ? (
                                    renderDomainRestrictedBanner(item, checkIssueEditability(item))
                                  ) : isBusinessUser ? null : (
                                    renderActionToolbar(item.id)
                                  )}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
                                    {isBusinessUser ? renderBusinessResponseSection(item) : renderFormFields(item)}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    }))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', fontStyle: 'italic', color: '#D8001D' }}>
                  Note: The sorted order will determine the order of issues in the report
                </span>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* MODE 2: 3-PANE MASTER-DETAIL LAYOUT (Cards List | Form | PDF)   */}
        {/* ============================================================== */}
        {designMode === '3pane' && (
          <>
            {/* PANE 1: Master Issue Cards List */}
            {isPane1Collapsed ? (
              <div style={{
                width: '36px',
                minWidth: '36px',
                backgroundColor: '#F8FAFC',
                borderRight: '1px solid #CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '10px',
                gap: '16px',
                userSelect: 'none',
                flexShrink: 0
              }}>
                <button
                  onClick={() => setIsPane1Collapsed(false)}
                  title="Expand Master Issues List"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#ffffff',
                    color: '#2563EB',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PanelLeftOpen style={{ width: '14px', height: '14px' }} />
                </button>
                <div style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: '#475569',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap'
                }}>
                  MASTER LIST ({issues.length})
                </div>
              </div>
            ) : (
              <div style={{
                flexGrow: (isPane2Collapsed && isPane3Collapsed) ? 1 : 0,
                flexShrink: (isPane2Collapsed && isPane3Collapsed) ? 1 : 0,
                flexBasis: (isPane2Collapsed && isPane3Collapsed) ? 'auto' : `${pane1Width}%`,
                width: (isPane2Collapsed && isPane3Collapsed) ? 'auto' : `${pane1Width}%`,
                minWidth: '160px',
                maxWidth: (isPane2Collapsed && isPane3Collapsed) ? 'none' : '500px',
                borderRight: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid #E2E8F0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexShrink: 0
                }}>
                  {/* Left Group: Title + Count Badge + Minimum Width Filter Dropdown aligned right next to it */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexWrap: 'nowrap' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', margin: 0, whiteSpace: 'nowrap' }}>
                      {isBusinessUser ? 'Pending Issues' : 'Master Issues'}
                    </h3>

                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: '800',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      backgroundColor: isBusinessUser ? '#EFF6FF' : '#F1F5F9',
                      color: isBusinessUser ? '#1D4ED8' : '#475569',
                      border: isBusinessUser ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                      whiteSpace: 'nowrap'
                    }}>
                      {isBusinessUser ? filteredIssues.length : (functionFilter === 'all' ? issues.length : `${filteredIssues.length}/${issues.length}`)}
                    </span>

                    {/* Minimum Width Filter dropdown right next to title (hidden for Business role) */}
                    {!isBusinessUser && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        backgroundColor: functionFilter === 'IT' ? '#EFF6FF' : functionFilter === 'FinOps' ? '#ECFDF5' : '#F8FAFC',
                        padding: '1px 4px',
                        borderRadius: '5px',
                        border: functionFilter === 'IT' ? '1px solid #BFDBFE' : functionFilter === 'FinOps' ? '1px solid #A7F3D0' : '1px solid #CBD5E1'
                      }}>
                        <Filter style={{ width: '10.5px', height: '10.5px', color: functionFilter === 'IT' ? '#1D4ED8' : functionFilter === 'FinOps' ? '#047857' : '#64748B', flexShrink: 0 }} />
                        <select
                          value={functionFilter}
                          onChange={(e) => setFunctionFilter(e.target.value)}
                          title="Filter issues by function"
                          style={{
                            height: '22px',
                            padding: '0 2px',
                            fontSize: '10.5px',
                            fontWeight: '700',
                            color: functionFilter === 'IT' ? '#1D4ED8' : functionFilter === 'FinOps' ? '#047857' : '#334155',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            outline: 'none',
                            width: 'auto'
                          }}
                        >
                          <option value="all">All</option>
                          <option value="IT">IT ({itCount})</option>
                          <option value="FinOps">FinOps ({finOpsCount})</option>
                        </select>

                        {functionFilter !== 'all' && (
                          <button
                            onClick={() => setFunctionFilter('all')}
                            title="Clear filter"
                            style={{
                              border: 'none',
                              background: 'none',
                              fontSize: '9.5px',
                              color: '#2563EB',
                              cursor: 'pointer',
                              padding: '0 2px',
                              fontWeight: '800',
                              lineHeight: 1
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Collapse Button */}
                  <button
                    onClick={() => setIsPane1Collapsed(true)}
                    title="Collapse Pane 1"
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      color: '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <PanelLeftClose style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredIssues.length === 0 ? (
                    <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748B' }}>
                      <AlertOctagon style={{ width: '30px', height: '30px', color: '#94A3B8', margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>
                        {isBusinessUser ? 'No Pending Business Issues' : (functionFilter !== 'all' ? `No ${functionFilter} Issues` : 'No Issues in Audit')}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                        {isBusinessUser
                          ? 'There are currently no findings requiring business response for this engagement.'
                          : (functionFilter !== 'all' 
                            ? `There are no ${functionFilter} findings recorded for this audit.`
                            : 'There are no tracked issues for this audit engagement.')}
                      </div>
                      {!isBusinessUser && functionFilter !== 'all' && (
                        <button
                          onClick={() => setFunctionFilter('all')}
                          style={{
                            marginTop: '12px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            borderRadius: '5px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#ffffff',
                            color: '#2563EB',
                            cursor: 'pointer'
                          }}
                        >
                          View all issues
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredIssues.map((item, filteredIdx) => {
                    const isSelected = expandedIssueId === item.id;
                    const isLocked = !!item.isLocked;
                    const isExcluded = !!item.isExcluded;
                    const isDragging = draggedIssueId === item.id;
                    const isOver = dragOverIssueId === item.id;
                    return (
                      <div
                        key={item.id}
                        draggable={draggableCardId === item.id}
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDragLeave={(e) => handleDragLeave(e, item.id)}
                        onDrop={(e) => handleDrop(e, item.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setExpandedIssueId(isSelected ? null : item.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: isOver
                            ? '#EFF6FF'
                            : (isExcluded
                                ? (isSelected ? '#F1F5F9' : '#F8FAFC')
                                : (isLocked ? (isSelected ? '#FEF08A' : '#FEF9C3') : (isSelected ? '#F8FAFC' : '#ffffff'))),
                          border: isOver
                            ? '2px dashed #2563EB'
                            : (isSelected 
                              ? (isExcluded ? '2px dashed #64748B' : (isLocked ? '2px solid #D97706' : '2px solid #2563EB'))
                              : (isExcluded ? '1.5px dashed #CBD5E1' : (isLocked ? '1.5px solid #F59E0B' : '1px solid #CBD5E1'))),
                          borderLeft: isExcluded
                            ? (isSelected ? '5px solid #475569' : '4px solid #94A3B8')
                            : (isLocked 
                              ? (isSelected ? '5px solid #B45309' : '4px solid #D97706')
                              : undefined),
                          boxShadow: isOver
                            ? '0 6px 16px rgba(37,99,235,0.22)'
                            : (isSelected 
                              ? (isLocked ? '0 4px 12px rgba(217, 119, 6, 0.22)' : '0 4px 12px rgba(37,99,235,0.15)')
                              : (isLocked ? '0 2px 6px rgba(245, 158, 11, 0.10)' : '0 1px 3px rgba(0,0,0,0.03)')),
                          cursor: draggableCardId === item.id ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                          opacity: isDragging ? 0.45 : (isExcluded ? 0.65 : 1),
                          transform: isOver ? 'scale(1.02)' : 'none',
                          transition: 'all 0.15s ease',
                          position: 'relative'
                        }}
                      >
                        {/* Top row: Report Ref Number + ID + IT/FinOps Pill + Locked indicator + Criticality badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              color: isSelected ? (isExcluded ? '#475569' : isLocked ? '#854D0E' : '#1E40AF') : (isExcluded ? '#64748B' : isLocked ? '#854D0E' : '#0F172A'),
                              backgroundColor: isSelected ? '#EFF6FF' : '#F1F5F9',
                              padding: '1.5px 7px',
                              borderRadius: '4px',
                              border: isSelected ? '1px solid #BFDBFE' : '1px solid #CBD5E1',
                              whiteSpace: 'nowrap'
                            }}>
                              Report Ref - {item.reportRef || (issues.findIndex(i => i.id === item.id) + 1)}
                            </span>
                            <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#94A3B8' }}>
                              ({item.id})
                            </span>
                            {renderFunctionPill(item.function)}
                            {isExcluded ? (
                              <span style={{
                                fontSize: '9px',
                                fontWeight: '800',
                                padding: '1.5px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#E2E8F0',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3.5px',
                                letterSpacing: '0.3px'
                              }}>
                                <Ban style={{ width: '9px', height: '9px' }} />
                                EXCLUDED
                              </span>
                            ) : isLocked ? (
                              <span style={{
                                fontSize: '9px',
                                fontWeight: '800',
                                padding: '1.5px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#FEF08A',
                                color: '#854D0E',
                                border: '1px solid #FACC15',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3.5px',
                                letterSpacing: '0.3px'
                              }}>
                                <Lock style={{ width: '9px', height: '9px' }} />
                                LOCKED
                              </span>
                            ) : !checkIssueEditability(item).canEdit ? (
                              <span
                                title={checkIssueEditability(item).reason}
                                style={{
                                  fontSize: '9px',
                                  fontWeight: '700',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  backgroundColor: '#F1F5F9',
                                  color: '#64748B',
                                  border: '1px solid #CBD5E1',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Lock style={{ width: '8px', height: '8px', color: '#94A3B8' }} />
                                Read-Only
                              </span>
                            ) : null}
                          </div>
                          {renderCriticalityBadge(item.criticality)}
                        </div>

                        {/* Title Row with Drag Control Icon Near the Title */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                          <span
                            title="Drag control: Click and hold here to drag and reorder"
                            onMouseEnter={() => setDraggableCardId(item.id)}
                            onMouseLeave={() => { if (!draggedIssueId) setDraggableCardId(null); }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDraggableCardId(item.id);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isDragging ? '#2563EB' : (draggableCardId === item.id ? '#2563EB' : '#94A3B8'),
                              backgroundColor: draggableCardId === item.id ? '#EFF6FF' : '#F1F5F9',
                              border: draggableCardId === item.id ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                              borderRadius: '4px',
                              cursor: isDragging ? 'grabbing' : 'grab',
                              padding: '2px',
                              flexShrink: 0,
                              marginTop: '0px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <GripVertical style={{ width: '13px', height: '13px' }} />
                          </span>

                          <h4 style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: isExcluded ? '#64748B' : '#0F172A',
                            textDecoration: isExcluded ? 'line-through' : 'none',
                            lineHeight: '1.3',
                            margin: 0,
                            flex: 1
                          }}>
                            {item.title}
                          </h4>
                        </div>

                        {/* Process Area, Reorder Arrows & Status */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ color: '#94A3B8', fontSize: '10px' }}>Area:</span>
                            <strong style={{ color: isExcluded ? '#64748B' : '#334155', fontWeight: '600' }}>{item.processArea || item.function}</strong>
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* Up / Down Reorder button helpers */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                title="Move issue up"
                                disabled={filteredIdx === 0}
                                onClick={() => handleMoveIssueById(item.id, 'up')}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: '2px',
                                  cursor: filteredIdx === 0 ? 'default' : 'pointer',
                                  color: filteredIdx === 0 ? '#CBD5E1' : '#64748B',
                                  display: 'flex',
                                  alignItems: 'center',
                                  borderRadius: '3px'
                                }}
                              >
                                <ArrowUp style={{ width: '12px', height: '12px' }} />
                              </button>
                              <button
                                type="button"
                                title="Move issue down"
                                disabled={filteredIdx === filteredIssues.length - 1}
                                onClick={() => handleMoveIssueById(item.id, 'down')}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: '2px',
                                  cursor: filteredIdx === filteredIssues.length - 1 ? 'default' : 'pointer',
                                  color: filteredIdx === filteredIssues.length - 1 ? '#CBD5E1' : '#64748B',
                                  display: 'flex',
                                  alignItems: 'center',
                                  borderRadius: '3px'
                                }}
                              >
                                <ArrowDown style={{ width: '12px', height: '12px' }} />
                              </button>
                            </div>
                            {renderStatusBadge(item.status)}
                          </div>
                        </div>

                        {/* Excluded notice on card */}
                        {isExcluded && (
                          <div style={{
                            marginTop: '8px',
                            padding: '5px 8px',
                            backgroundColor: '#F1F5F9',
                            borderRadius: '5px',
                            border: '1px dashed #CBD5E1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px',
                            fontSize: '10.5px',
                            color: '#64748B'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Ban style={{ width: '11px', height: '11px', color: '#94A3B8' }} />
                              Excluded from report
                            </span>
                            <span style={{ fontWeight: '700', color: '#059669', fontSize: '10px' }}>
                              Click to include
                            </span>
                          </div>
                        )}

                        {/* Locked user badge on the card */}
                        {!isExcluded && isLocked && (
                          <div style={{
                            marginTop: '8px',
                            padding: '5px 8px',
                            backgroundColor: '#FEF3C7',
                            borderRadius: '5px',
                            border: '1px dashed #F59E0B',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '10.5px'
                          }}>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: item.lockedBy?.avatarBg || '#7C3AED',
                              color: '#ffffff',
                              fontSize: '9px',
                              fontWeight: '800',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {item.lockedBy?.avatar || 'MV'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <span style={{ fontWeight: '700', color: '#92400E' }}>
                                {item.lockedBy?.name || 'Another User'}
                              </span>
                              <span style={{ color: '#B45309', marginLeft: '4px', fontSize: '10px' }}>
                                is working on this
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }))}
                </div>

                {/* Footer Drag & Drop Helper Note */}
                <div style={{
                  padding: '8px 12px',
                  borderTop: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  fontSize: '10.5px',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <GripVertical style={{ width: '12px', height: '12px', color: '#94A3B8', flexShrink: 0 }} />
                  <span>Drag &amp; drop cards to reorder issues in the final report.</span>
                </div>
              </div>
            )}

            {/* SPLITTER HANDLE 1 */}
            {!isPane1Collapsed && !isPane2Collapsed && (
              <div
                onMouseDown={(e) => { e.preventDefault(); setIsDraggingSplitter1(true); }}
                onMouseEnter={() => setHoveredSplitter(1)}
                onMouseLeave={() => setHoveredSplitter(null)}
                title="Click and drag to resize Pane 1 width"
                style={{
                  width: '6px',
                  backgroundColor: (isDraggingSplitter1 || hoveredSplitter === 1) ? '#3B82F6' : '#E2E8F0',
                  cursor: 'col-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                  zIndex: 20,
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '2px',
                  height: '24px',
                  borderRadius: '1px',
                  backgroundColor: (isDraggingSplitter1 || hoveredSplitter === 1) ? '#ffffff' : '#94A3B8'
                }} />
              </div>
            )}

            {/* PANE 2: Form Editor */}
            {isPane2Collapsed ? (
              <div style={{
                width: '36px',
                minWidth: '36px',
                backgroundColor: '#FAFAFA',
                borderRight: '1px solid #CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '10px',
                gap: '16px',
                userSelect: 'none',
                flexShrink: 0
              }}>
                <button
                  onClick={() => setIsPane2Collapsed(false)}
                  title="Expand Form Editor"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#ffffff',
                    color: '#2563EB',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PanelLeftOpen style={{ width: '14px', height: '14px' }} />
                </button>
                <div style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: '#475569',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap'
                }}>
                  FORM EDITOR
                </div>
              </div>
            ) : (
              <div style={{
                flexGrow: isPane3Collapsed ? 1 : 0,
                flexShrink: isPane3Collapsed ? 1 : 0,
                flexBasis: isPane3Collapsed ? 'auto' : `${pane2Width}%`,
                width: isPane3Collapsed ? 'auto' : `${pane2Width}%`,
                minWidth: '200px',
                borderRight: '1px solid #CBD5E1',
                backgroundColor: '#FAFAFA',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedIssue ? (
                      <>
                        <span>{isBusinessUser ? `Business Response: ${selectedIssue.id}` : `Form Editor: ${selectedIssue.id}`}</span>
                        {selectedIssue.isExcluded ? (
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#475569', backgroundColor: '#E2E8F0', padding: '1px 6px', borderRadius: '4px', border: '1px solid #CBD5E1', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Ban style={{ width: '9.5px', height: '9.5px' }} />
                            EXCLUDED (DISABLED)
                          </span>
                        ) : selectedIssue.isLocked ? (
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#92400E', backgroundColor: '#FEF3C7', padding: '1px 6px', borderRadius: '4px', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Lock style={{ width: '9.5px', height: '9.5px' }} />
                            LOCKED (READ-ONLY)
                          </span>
                        ) : isBusinessUser ? (
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#B45309', backgroundColor: '#FEF3C7', padding: '1px 6px', borderRadius: '4px', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Clock style={{ width: '9.5px', height: '9.5px' }} />
                            RESPONSE REQUIRED
                          </span>
                        ) : !selectedIssueEditability.canEdit ? (
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#4338CA', backgroundColor: '#EEF2FF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #C7D2FE', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <ShieldAlert style={{ width: '9.5px', height: '9.5px' }} />
                            READ-ONLY ({selectedIssueEditability.issueDomain})
                          </span>
                        ) : null}
                      </>
                    ) : (
                      "Select an Issue from Master List"
                    )}
                  </h3>
                  <button
                    onClick={() => setIsPane2Collapsed(true)}
                    title="Collapse Pane 2"
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      color: '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <PanelLeftClose style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                {selectedIssue ? (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedIssue.isExcluded ? (
                      renderExcludedBanner(selectedIssue)
                    ) : selectedIssue.isLocked ? (
                      renderLockedBanner(selectedIssue)
                    ) : !selectedIssueEditability.canEdit ? (
                      renderDomainRestrictedBanner(selectedIssue, selectedIssueEditability)
                    ) : isBusinessUser ? null : (
                      renderActionToolbar(selectedIssue.id)
                    )}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {isBusinessUser ? renderBusinessResponseSection(selectedIssue) : renderFormFields(selectedIssue)}
                    </div>
                  </div>
                ) : issues.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '12px', padding: '32px 20px', textAlign: 'center' }}>
                    <FileText style={{ width: '36px', height: '36px', color: '#94A3B8', marginBottom: '10px' }} />
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>No Issues in Engagement</div>
                    <div style={{ fontSize: '12px', color: '#64748B', maxWidth: '320px', lineHeight: '1.5' }}>
                      There are currently no findings or discussion issues recorded for <strong>{job?.fileName || job?.engagement || 'this audit'}</strong>.
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '12px', padding: '20px', textAlign: 'center' }}>
                    👈 Click any issue on the Master List to view &amp; edit its fields here while keeping live PDF preview open!
                  </div>
                )}
              </div>
            )}

            {/* SPLITTER HANDLE 2 */}
            {!isPane2Collapsed && !isPane3Collapsed && (
              <div
                onMouseDown={(e) => { e.preventDefault(); setIsDraggingSplitter2(true); }}
                onMouseEnter={() => setHoveredSplitter(2)}
                onMouseLeave={() => setHoveredSplitter(null)}
                title="Click and drag to resize Form Editor width"
                style={{
                  width: '6px',
                  backgroundColor: (isDraggingSplitter2 || hoveredSplitter === 2) ? '#3B82F6' : '#E2E8F0',
                  cursor: 'col-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                  zIndex: 20,
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '2px',
                  height: '24px',
                  borderRadius: '1px',
                  backgroundColor: (isDraggingSplitter2 || hoveredSplitter === 2) ? '#ffffff' : '#94A3B8'
                }} />
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* MODE 3: LEFT SLIDE-OVER DRAWER LAYOUT                         */}
        {/* ============================================================== */}
        {designMode === 'slideover' && (
          <>
            {/* Left Table + Slide-over Drawer Wrapper (50%) */}
            <div style={{ width: '50%', borderRight: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', position: 'relative', overflow: 'hidden' }}>
              
              {/* Full Table View */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #059669', color: '#059669', fontSize: '11.5px' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>Issue Title</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>Function</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>Criticality</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map(item => (
                      <tr key={item.id} style={{
                        borderBottom: '1px solid #E2E8F0',
                        backgroundColor: item.isExcluded ? '#F8FAFC' : (item.isLocked ? '#FFFDF5' : 'transparent'),
                        opacity: item.isExcluded ? 0.65 : 1
                      }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: item.isExcluded ? '#64748B' : '#0F172A', textDecoration: item.isExcluded ? 'line-through' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>{item.title}</span>
                            {item.isExcluded ? (
                              <span style={{ fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#E2E8F0', color: '#475569', border: '1px solid #CBD5E1', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Ban style={{ width: '9.5px', height: '9.5px' }} />
                                EXCLUDED
                              </span>
                            ) : item.isLocked ? (
                              <span style={{ fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Lock style={{ width: '9.5px', height: '9.5px' }} />
                                LOCKED
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{renderFunctionPill(item.function)}</td>
                        <td style={{ padding: '14px 16px' }}>{renderCriticalityBadge(item.criticality)}</td>
                        <td style={{ padding: '14px 16px' }}>{renderStatusBadge(item.status)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setExpandedIssueId(item.id)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '11.5px',
                              fontWeight: '800',
                              color: item.isExcluded ? '#475569' : (item.isLocked ? '#92400E' : '#059669'),
                              backgroundColor: item.isExcluded ? '#E2E8F0' : (item.isLocked ? '#FEF3C7' : '#ECFDF5'),
                              border: item.isExcluded ? '1px solid #CBD5E1' : (item.isLocked ? '1px solid #FDE68A' : '1px solid #A7F3D0'),
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            {item.isExcluded ? 'View Excluded' : item.isLocked ? 'View Locked' : 'Edit Drawer'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Slide-over Form Drawer (Appears over Left Pane when issue selected) */}
              {selectedIssue && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#ffffff',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
                  animation: 'slideInLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  {/* Drawer Header */}
                  <div style={{ padding: '14px 20px', backgroundColor: selectedIssue.isExcluded ? '#475569' : (selectedIssue.isLocked ? '#92400E' : '#065F46'), color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => setExpandedIssueId(null)} style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer' }}>
                        <ArrowLeft style={{ width: '18px', height: '18px' }} />
                      </button>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Slide-over Drawer: {selectedIssue.id}</span>
                        {selectedIssue.isExcluded ? (
                          <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#E2E8F0', color: '#475569', padding: '1px 6px', borderRadius: '4px' }}>
                            EXCLUDED
                          </span>
                        ) : selectedIssue.isLocked ? (
                          <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px' }}>
                            READ-ONLY
                          </span>
                        ) : null}
                      </h3>
                    </div>
                    <button onClick={() => setExpandedIssueId(null)} style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer' }}>
                      <X style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>

                  {/* Drawer Tabs (Overview | Analysis | Actions) */}
                  <div style={{ padding: '12px 20px 0 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSlideoverTab('metadata')}
                      style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', backgroundColor: slideoverTab === 'metadata' ? (selectedIssue.isExcluded ? '#475569' : selectedIssue.isLocked ? '#92400E' : '#059669') : '#F1F5F9', color: slideoverTab === 'metadata' ? '#ffffff' : '#475569' }}
                    >
                      1. General Metadata
                    </button>
                    <button
                      onClick={() => setSlideoverTab('analysis')}
                      style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', backgroundColor: slideoverTab === 'analysis' ? (selectedIssue.isExcluded ? '#475569' : selectedIssue.isLocked ? '#92400E' : '#059669') : '#F1F5F9', color: slideoverTab === 'analysis' ? '#ffffff' : '#475569' }}
                    >
                      2. AI Analysis &amp; Cause
                    </button>
                    <button
                      onClick={() => setSlideoverTab('actions')}
                      style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', backgroundColor: slideoverTab === 'actions' ? (selectedIssue.isExcluded ? '#475569' : selectedIssue.isLocked ? '#92400E' : '#059669') : '#F1F5F9', color: slideoverTab === 'actions' ? '#ffffff' : '#475569' }}
                    >
                      3. Action Plan &amp; Approvals
                    </button>
                  </div>

                  {/* Tab Body */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {selectedIssue.isExcluded ? (
                      renderExcludedBanner(selectedIssue)
                    ) : selectedIssue.isLocked ? (
                      renderLockedBanner(selectedIssue)
                    ) : !selectedIssueEditability.canEdit ? (
                      renderDomainRestrictedBanner(selectedIssue, selectedIssueEditability)
                    ) : isBusinessUser ? null : (
                      renderActionToolbar(selectedIssue.id)
                    )}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff' }}>
                      {isBusinessUser ? renderBusinessResponseSection(selectedIssue) : renderFormFields(selectedIssue)}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* MODE 4: TABBED MULTI-STEP FORM LAYOUT                          */}
        {/* ============================================================== */}
        {designMode === 'tabbed' && (
          <>
            {/* Left Table + Step Wizard Form (50%) */}
            <div style={{ width: '50%', borderRight: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
              
              {selectedIssue ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA', overflow: 'hidden' }}>
                  
                  {/* Step Header Bar */}
                  <div style={{ padding: '14px 20px', backgroundColor: selectedIssue.isExcluded ? '#475569' : (selectedIssue.isLocked ? '#92400E' : '#7C3AED'), color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => setExpandedIssueId(null)} style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer' }}>
                        <ArrowLeft style={{ width: '18px', height: '18px' }} />
                      </button>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Step-by-Step Editor: {selectedIssue.id}</span>
                        {selectedIssue.isExcluded ? (
                          <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#E2E8F0', color: '#475569', padding: '1px 6px', borderRadius: '4px' }}>
                            EXCLUDED
                          </span>
                        ) : selectedIssue.isLocked ? (
                          <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px' }}>
                            READ-ONLY
                          </span>
                        ) : null}
                      </h3>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                      Step {tabbedStep} of 3
                    </span>
                  </div>

                  {/* Wizard Step Navigation */}
                  <div style={{ padding: '12px 20px', backgroundColor: '#ffffff', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '10px' }}>
                    {[1, 2, 3].map(stepNum => (
                      <button
                        key={stepNum}
                        onClick={() => setTabbedStep(stepNum)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: tabbedStep === stepNum ? (selectedIssue.isExcluded ? '#475569' : '#7C3AED') : '#F1F5F9',
                          color: tabbedStep === stepNum ? '#ffffff' : '#475569'
                        }}
                      >
                        Step {stepNum}: {stepNum === 1 ? 'General' : stepNum === 2 ? 'Analysis' : 'Recommendation'}
                      </button>
                    ))}
                  </div>

                  {/* Step Form Body */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {selectedIssue.isExcluded ? (
                      renderExcludedBanner(selectedIssue)
                    ) : selectedIssue.isLocked ? (
                      renderLockedBanner(selectedIssue)
                    ) : !selectedIssueEditability.canEdit ? (
                      renderDomainRestrictedBanner(selectedIssue, selectedIssueEditability)
                    ) : (
                      renderActionToolbar(selectedIssue.id)
                    )}

                    {(() => {
                      const isWizardReadOnly = !!selectedIssue.isLocked || !selectedIssueEditability.canEdit || !!selectedIssue.isExcluded;
                      return (
                        <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {tabbedStep === 1 && (
                            <>
                              <h4 style={{ fontSize: '13px', fontWeight: '800', color: selectedIssue.isExcluded ? '#475569' : selectedIssue.isLocked ? '#92400E' : '#7C3AED', margin: 0, borderBottom: '1px solid #DDD6FE', paddingBottom: '6px' }}>
                                Step 1: General Metadata &amp; Categorization {isWizardReadOnly && (selectedIssue.isExcluded ? "(Excluded - Disabled)" : "(Read-Only)")}
                              </h4>
                              {/* Title */}
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Issue Title</label>
                                <input
                                  type="text"
                                  disabled={isWizardReadOnly}
                                  readOnly={isWizardReadOnly}
                                  value={selectedIssue.title}
                                  onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'title', e.target.value)}
                                  style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: isWizardReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: isWizardReadOnly ? '#F8FAFC' : '#ffffff', cursor: isWizardReadOnly ? 'not-allowed' : 'text' }}
                                />
                              </div>
                              {/* Criticality, Process Area (Function dropdown removed per user request) */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Criticality</label>
                                  <select
                                    disabled={isWizardReadOnly}
                                    value={selectedIssue.criticality}
                                    onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'criticality', e.target.value)}
                                    style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: isWizardReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: isWizardReadOnly ? '#F8FAFC' : '#ffffff', cursor: isWizardReadOnly ? 'not-allowed' : 'pointer' }}
                                  >
                                    <option value="Critical">Critical</option>
                                    <option value="Major">Major</option>
                                    <option value="Minor">Minor</option>
                                  </select>
                                </div>
                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Process Area</label>
                                  <select
                                    disabled={isWizardReadOnly}
                                    value={selectedIssue.processArea}
                                    onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'processArea', e.target.value)}
                                    style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: isWizardReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: isWizardReadOnly ? '#F8FAFC' : '#ffffff', cursor: isWizardReadOnly ? 'not-allowed' : 'pointer' }}
                                  >
                                    {selectedIssue.processArea && !PROCESS_AREA_OPTIONS.includes(selectedIssue.processArea) && (
                                      <option value={selectedIssue.processArea}>
                                        {selectedIssue.processArea.replace(/_/g, ' ')}
                                      </option>
                                    )}
                                    {PROCESS_AREA_OPTIONS.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </>
                          )}

                          {tabbedStep === 2 && (
                            <>
                              <h4 style={{ fontSize: '13px', fontWeight: '800', color: selectedIssue.isExcluded ? '#475569' : selectedIssue.isLocked ? '#92400E' : '#7C3AED', margin: 0, borderBottom: '1px solid #DDD6FE', paddingBottom: '6px' }}>
                                Step 2: AI Root Cause &amp; Financial Impact {isWizardReadOnly && (selectedIssue.isExcluded ? "(Excluded - Disabled)" : "(Read-Only)")}
                              </h4>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Root Cause</label>
                                <textarea
                                  rows={3}
                                  disabled={isWizardReadOnly}
                                  readOnly={isWizardReadOnly}
                                  value={selectedIssue.rootCause}
                                  onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'rootCause', e.target.value)}
                                  style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: isWizardReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: isWizardReadOnly ? '#F8FAFC' : '#ffffff', cursor: isWizardReadOnly ? 'not-allowed' : 'text', fontFamily: 'inherit' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Impact</label>
                                <textarea
                                  rows={3}
                                  disabled={isWizardReadOnly}
                                  readOnly={isWizardReadOnly}
                                  value={selectedIssue.impact}
                                  onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'impact', e.target.value)}
                                  style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: isWizardReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: isWizardReadOnly ? '#F8FAFC' : '#ffffff', cursor: isWizardReadOnly ? 'not-allowed' : 'text', fontFamily: 'inherit' }}
                                />
                              </div>
                            </>
                          )}

                          {tabbedStep === 3 && (
                            <>
                              <h4 style={{ fontSize: '13px', fontWeight: '800', color: selectedIssue.isExcluded ? '#475569' : selectedIssue.isLocked ? '#92400E' : '#7C3AED', margin: 0, borderBottom: '1px solid #DDD6FE', paddingBottom: '6px' }}>
                                Step 3: Remediation Recommendations &amp; Sign-off {isWizardReadOnly && (selectedIssue.isExcluded ? "(Excluded - Disabled)" : "(Read-Only)")}
                              </h4>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Recommendation</label>
                                <textarea
                                  rows={4}
                                  disabled={isWizardReadOnly}
                                  readOnly={isWizardReadOnly}
                                  value={selectedIssue.recommendation}
                                  onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'recommendation', e.target.value)}
                                  style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: isWizardReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: isWizardReadOnly ? '#F8FAFC' : '#ffffff', cursor: isWizardReadOnly ? 'not-allowed' : 'text', fontFamily: 'inherit' }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step Controls Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                      <button
                        onClick={() => setTabbedStep(Math.max(1, tabbedStep - 1))}
                        disabled={tabbedStep === 1}
                        style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: tabbedStep === 1 ? '#F1F5F9' : '#ffffff', color: '#475569', cursor: tabbedStep === 1 ? 'default' : 'pointer' }}
                      >
                        Previous Step
                      </button>

                      <button
                        onClick={() => setTabbedStep(Math.min(3, tabbedStep + 1))}
                        disabled={tabbedStep === 3}
                        style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: 'none', backgroundColor: tabbedStep === 3 ? '#94A3B8' : '#7C3AED', color: '#ffffff', cursor: tabbedStep === 3 ? 'default' : 'pointer' }}
                      >
                        Next Step
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                /* Table View when no issue is selected */
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #7C3AED', color: '#7C3AED', fontSize: '11.5px' }}>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Issue Title</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Function</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Criticality</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Status</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.map(item => (
                        <tr key={item.id} style={{
                          borderBottom: '1px solid #E2E8F0',
                          backgroundColor: item.isExcluded ? '#F8FAFC' : (item.isLocked ? '#FFFDF5' : 'transparent'),
                          opacity: item.isExcluded ? 0.65 : 1
                        }}>
                          <td style={{ padding: '14px 16px', fontWeight: '700', color: item.isExcluded ? '#64748B' : '#0F172A', textDecoration: item.isExcluded ? 'line-through' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span>{item.title}</span>
                              {item.isExcluded ? (
                                <span style={{ fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#E2E8F0', color: '#475569', border: '1px solid #CBD5E1', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Ban style={{ width: '9.5px', height: '9.5px' }} />
                                  EXCLUDED
                                </span>
                              ) : item.isLocked ? (
                                <span style={{ fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Lock style={{ width: '9.5px', height: '9.5px' }} />
                                  LOCKED
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>{item.function}</td>
                          <td style={{ padding: '14px 16px' }}>{renderCriticalityBadge(item.criticality)}</td>
                          <td style={{ padding: '14px 16px' }}>{renderStatusBadge(item.status)}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => { setExpandedIssueId(item.id); setTabbedStep(1); }}
                              style={{
                                padding: '6px 12px',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                color: item.isExcluded ? '#475569' : (item.isLocked ? '#92400E' : '#7C3AED'),
                                backgroundColor: item.isExcluded ? '#E2E8F0' : (item.isLocked ? '#FEF3C7' : '#F3E8FF'),
                                border: item.isExcluded ? '1px solid #CBD5E1' : (item.isLocked ? '1px solid #FDE68A' : '1px solid #DDD6FE'),
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              {item.isExcluded ? 'View Excluded' : (item.isLocked ? 'View Locked' : 'Step Wizard')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* PANE 3 / RIGHT COLUMN: LIVE HTML PDF-STYLE REPORT PREVIEW       */}
        {/* ============================================================== */}
        {designMode === '3pane' && isPane3Collapsed ? (
          <div style={{
            width: '36px',
            minWidth: '36px',
            backgroundColor: '#27272A',
            borderLeft: '1px solid #52525B',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '10px',
            gap: '16px',
            userSelect: 'none',
            flexShrink: 0
          }}>
            <button
              onClick={() => setIsPane3Collapsed(false)}
              title="Expand Report Preview"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                border: '1px solid #52525B',
                backgroundColor: '#3F3F46',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PanelLeftOpen style={{ width: '14px', height: '14px' }} />
            </button>
            <div style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: '10.5px',
              fontWeight: '800',
              color: '#A1A1AA',
              letterSpacing: '1px',
              whiteSpace: 'nowrap'
            }}>
              REPORT PREVIEW
            </div>
          </div>
        ) : (
          <div style={{
            flexGrow: designMode === '3pane' ? 1 : 0,
            flexShrink: 1,
            flexBasis: designMode === '3pane' ? 'auto' : '50%',
            width: designMode === '3pane' ? 'auto' : '50%',
            backgroundColor: '#52525B',
            padding: '24px 20px',
            overflowY: 'auto',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            {designMode === '3pane' && (
              <div style={{ width: '100%', maxWidth: '840px', display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button
                  onClick={() => setIsPane3Collapsed(true)}
                  title="Collapse Report Preview Pane"
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: '1px solid #71717A',
                    backgroundColor: '#3F3F46',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Collapse Preview</span>
                  <ChevronRight style={{ width: '13px', height: '13px' }} />
                </button>
              </div>
            )}
          <div style={{
            width: '100%',
            maxWidth: '840px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            marginBottom: '40px'
          }}>
            
            {/* Red PDF Document Header Bar */}
            <div style={{
              backgroundColor: '#D8001D',
              color: '#ffffff',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.3px' }}>
                {job?.fileName || "MedTech Suzhou - Orthopedics Plant_AuditReport"}
              </span>
              <button
                onClick={() => alert(`Downloading PDF Report for ${job?.id || 'JOB-2026-881'}`)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                title="Download PDF"
              >
                <Download style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Document Content Canvas */}
            <div style={{ padding: '28px 32px', color: '#000000', minHeight: '840px', display: 'flex', flexDirection: 'column' }}>
              
              {/* Brand Header Line (Matching Image 2) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '8px',
                marginBottom: '8px'
              }}>
                <div>
                  <div style={{
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: '20px',
                    fontWeight: '900',
                    color: '#E05252',
                    letterSpacing: '-0.2px'
                  }}>
                    Johnson&amp;Johnson
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '800',
                    color: '#737373',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase'
                  }}>
                    REPORT DETAILS
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#737373' }}>
                    Global Audit and Assurance
                  </span>
                </div>
              </div>

              {/* Auditable Entity Subheader (Matching Image 2) */}
              <div style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#000000',
                marginBottom: '16px'
              }}>
                Auditable Entity: <span style={{ fontWeight: '600' }}>{selectedIssue ? selectedIssue.auditableEntity : (issues[0]?.auditableEntity || (job?.id ? `MRC-${job.id}-${job.fileName || 'J&J Medical'}` : "MRC-004341-GFS SSC Philippines"))}</span>
              </div>

              {/* Render Selected Issue or All Issues in Sequence */}
              <div style={{ flex: 1 }}>
                {issues.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                    <FileText style={{ width: '36px', height: '36px', color: '#94A3B8', margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>Report Contains 0 Issues</div>
                    <div style={{ fontSize: '12px' }}>No findings or issues have been recorded for {job?.fileName || 'this audit'}.</div>
                  </div>
                ) : selectedIssue ? (
                  selectedIssue.isExcluded ? (
                    <div>
                      <div style={{
                        padding: '10px 14px',
                        marginBottom: '16px',
                        borderRadius: '6px',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px dashed #94A3B8',
                        color: '#475569',
                        fontSize: '11.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Ban style={{ width: '15px', height: '15px', color: '#64748B' }} />
                          <span><strong>Notice:</strong> This issue is currently <strong>Excluded</strong> and omitted from the final generated report findings.</span>
                        </div>
                        <button
                          onClick={() => handleIncludeIssue(selectedIssue.id)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#ffffff',
                            backgroundColor: '#059669',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Include in Report
                        </button>
                      </div>
                      <div style={{ opacity: 0.55 }}>
                        {renderPdfIssueCard(selectedIssue, issues.findIndex(i => i.id === selectedIssue.id))}
                      </div>
                    </div>
                  ) : (
                    renderPdfIssueCard(selectedIssue, issues.findIndex(i => i.id === selectedIssue.id))
                  )
                ) : issues.filter(item => !item.isExcluded).length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                    <Ban style={{ width: '36px', height: '36px', color: '#94A3B8', margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>All Findings Excluded</div>
                    <div style={{ fontSize: '12px' }}>All findings in this audit are currently marked as excluded and omitted from the report.</div>
                  </div>
                ) : (
                  issues.filter(item => !item.isExcluded).map((item, idx) => renderPdfIssueCard(item, idx))
                )}
              </div>

              {/* Footer Section (Matching Image 3) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '16px',
                fontSize: '10px',
                color: '#555555',
                position: 'relative'
              }}>
                {/* Left: Page Number */}
                <div style={{ color: '#555555' }}>
                  Page {selectedIssue ? `${issues.findIndex(i => i.id === selectedIssue.id) + 1} of ${issues.length}` : `1 of ${Math.max(1, issues.length)}`}
                </div>

                {/* Center: Confidential Statement */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  color: '#555555',
                  fontSize: '10px'
                }}>
                  Confidential – Use Pursuant to Company Instructions
                </div>

                <div></div>
              </div>

            </div>

          </div>

        </div>
        )}

      </div>
      
      {/* Issue Logs Modal (Track Changes & Audit Trail) */}
      <IssueLogsModal
        isOpen={isIssueLogsModalOpen}
        report={job || { fileName: "MedTech Suzhou - Orthopedics Plant_AuditReport" }}
        onClose={() => setIsIssueLogsModalOpen(false)}
      />

      {/* Workflow Drawer Modal */}
      <WorkflowModal
        isOpen={isWorkflowModalOpen}
        job={job}
        issues={issues}
        type="audit"
        onClose={() => setIsWorkflowModalOpen(false)}
      />

      {/* Violation Document PDF Side Drawer */}
      <ViolationPdfDrawer
        isOpen={isViolationDrawerOpen}
        onClose={() => setIsViolationDrawerOpen(false)}
        violationDoc={selectedViolationDoc}
      />

      {/* Call Back Reason Modal */}
      {isCallbackModalOpen && (() => {
        const activeTarget = issues.find(i => i.id === callbackIssueId);
        return (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={handleCloseCallbackModal}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                maxWidth: '520px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '18px 22px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#EDE9FE',
                    border: '1px solid #DDD6FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7C3AED',
                    flexShrink: 0
                  }}>
                    <RotateCcw style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Call Back Issue
                      {activeTarget?.referenceNumber && (
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                          {activeTarget.referenceNumber}
                        </span>
                      )}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                      {activeTarget?.title || activeTarget?.issueTitle ? (activeTarget.title || activeTarget.issueTitle) : 'Specify the reason for calling back this audit issue.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseCallbackModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Close"
                >
                  <X style={{ width: '18px', height: '18px' }} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '20px 22px' }}>
                <label
                  htmlFor="callback-reason-input"
                  style={{
                    display: 'block',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: '#1E293B',
                    marginBottom: '6px'
                  }}
                >
                  Reason for Call Back <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                  Please provide details explaining why this issue is being recalled or returned to the previous review stage.
                </p>
                <textarea
                  id="callback-reason-input"
                  autoFocus
                  rows={4}
                  value={callbackReason}
                  onChange={(e) => {
                    setCallbackReason(e.target.value);
                    if (callbackError) setCallbackError('');
                  }}
                  placeholder="Enter reason for callback..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: callbackError ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '90px',
                    outline: 'none',
                    boxShadow: callbackError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleConfirmCallback();
                    }
                  }}
                />
                {callbackError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#DC2626', fontSize: '12px', fontWeight: '500' }}>
                    <AlertOctagon style={{ width: '13px', height: '13px' }} />
                    <span>{callbackError}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '14px 22px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={handleCloseCallbackModal}
                  style={{
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: '#475569',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCallback}
                  style={{
                    padding: '8px 20px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    backgroundColor: '#7C3AED',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(124, 58, 237, 0.25)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <RotateCcw style={{ width: '13px', height: '13px' }} />
                  <span>Call Back</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Enterprise Toast Notification */}
      <ToastNotification
        toast={toastNotification}
        onClose={() => setToastNotification(null)}
      />

    </div>
  );
}
