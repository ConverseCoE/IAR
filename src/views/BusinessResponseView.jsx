import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Save, Send, Sparkles, Lock, Clock, MessageSquare,
  CheckCircle2, AlertOctagon, UploadCloud, Paperclip, Calendar, Trash2, FileText
} from 'lucide-react';
import { getIssuesByEngagement, getTestProceduresByEngagement } from '../data/assignmentsData';
import { logIssueEvent } from '../utils/auditLogEngine';
import {
  getCommentsForIssueField,
  subscribeToCommentUpdates
} from '../utils/commentEngine';
import FieldCommentPopover from '../components/common/FieldCommentPopover';
import usersData from '../data/users.json';
import ToastNotification from '../components/ui/ToastNotification';
import { APPLICATION_ROLES } from '../components/layout/Header';
import DescriptionWithViolations from '../components/common/DescriptionWithViolations';
import ViolationPdfDrawer from '../components/common/ViolationPdfDrawer';
import {
  PROCESS_AREA_OPTIONS,
  TEST_PROCEDURE_OPTIONS,
  ISSUE_TYPE_OPTIONS,
  ISSUE_SOURCE_OPTIONS,
  KEY_THEME_OPTIONS,
  IT_ASSET_ACCOUNTABLE_SECTOR_OPTIONS,
  IMPACTED_REGION_OPTIONS,
  IMPACTED_SECTOR_OPTIONS,
  IMPACTED_MRC_OPTIONS,
  QUARTER_IMPACTED_OPTIONS
} from './AuditReportView';

function normalizeIssueForBusinessResponse(item, job) {
  if (!item) return null;
  const func = item.function || item.functionType || item.tech || 'IT';

  let crit = item.criticality;
  if (!crit) {
    if (item.severity === 'Critical') crit = 'Critical';
    else if (item.severity === 'High') crit = 'Major';
    else crit = 'Minor';
  }

  let status = item.status || 'Pending with Business';
  if (item.status === 'Pending with Business' || item.status?.includes('Business') || item.currentLevel?.includes('Business')) {
    status = 'Pending with Business';
  }

  const auditableEntity = item.auditableEntity || (job?.id ? `MRC-${job.id}-${job.fileName || 'J&J Medical'}` : 'MRC-004341-GFS SSC Philippines');
  let processArea = item.processArea || (func === 'FinOps' ? 'Supply Chain & Operations' : 'Global_Access_Management');
  if (processArea === 'Third_Party_technology') processArea = 'Global_Access_Management';
  if (processArea === 'Supply_Chain_Operations') processArea = 'Supply Chain & Operations';
  const issueCauseType = item.issueCauseType || (func === 'FinOps' ? 'Financial Reconciliation Discrepancy' : 'Operating Effectiveness');
  const soxReportable = item.soxReportable || (crit === 'Critical' || crit === 'Major' ? 'Yes' : 'No');
  const repeatFinding = item.repeatFinding || 'No';

  const accountableContact = item.accountableContact || 'Narasimha, Vinay';
  const agreedRemediationDate = item.agreedRemediationDate || '2026-11-30';
  const managementResponse = item.managementResponse || '';
  const reportRef = item.reportRef || (item.id ? parseInt(item.id.replace(/\D/g, ''), 10) : 5) || 5;
  const accountableFunction = item.accountableFunction || (func === 'IT' ? 'Business IT, Finance' : 'Finance, Operations');

  let issueNarrative = item.issue || `${item.title}. Testing and telemetry verification identified operational execution and control gaps contrary to standard operating procedures.`;
  if (!issueNarrative.includes('Violation Reference')) {
    issueNarrative = `${issueNarrative}\n\nViolation Reference\nNon-Compliant with some of the sections of IAPP:\n1. S-15 Section No. [2] - Security Assessment for COTS Systems/Applications — Security assessment not completed for the environment\n2. S-15 Section No. [11] - ISRM Approval Prior to Production — ISRM approval lacking due to missing assessment\n3. S-15 Section No. [4.18] - Periodic Application Architecture/Code/Config Assessment — No periodic assessment of architecture, code, configuration`;
  }
  const rootCause = item.rootCause || `Process execution gap in automated synchronization and manual handoff between operational units and central monitoring systems.`;
  const impact = item.impact || `• Potential risk of operational delay and regulatory audit observation under GxP / SOX internal guidelines.\n• Resource variance required for secondary reconciliation and verification.`;
  const recommendation = item.recommendation || `1. Deploy automated validation checks across shopfloor telemetry pipelines.\n2. Update standard operating procedures (SOP) and conduct role-based refresher training.\n3. Establish periodic review checkpoints to ensure sustained compliance.`;

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
    status,
    currentLevel: item.currentLevel || 'Business Response',
    currentRoleTarget: item.currentRoleTarget || 'primary-business-contact',
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
    exceptionRemedDate
  };
}

export default function BusinessResponseView({
  job,
  initialIssueId = null,
  onClose,
  onUpdateIssues,
  userRole = 'primary-business-contact'
}) {
  const activeRoleObj = APPLICATION_ROLES?.find(r => r.id === userRole) || {
    id: userRole,
    label: 'Primary Business Contact',
    domain: 'All',
    baseRole: 'primary-business-contact'
  };

  const getJobIssues = useCallback(() => {
    let rawList = [];
    if (job && Array.isArray(job.issuesList) && job.issuesList.length > 0) {
      rawList = job.issuesList.map(iss => normalizeIssueForBusinessResponse(iss, job));
    } else {
      const dbIssues = getIssuesByEngagement(job?.id || job?.jobId || job?.reportId);
      if (dbIssues && dbIssues.length > 0) {
        rawList = dbIssues.map(iss => normalizeIssueForBusinessResponse(iss, job));
      }
    }
    return rawList.map((item, idx) => ({
      ...item,
      reportRef: item.reportRef || idx + 1
    }));
  }, [job]);

  const [issues, setIssues] = useState(getJobIssues);

  useEffect(() => {
    setIssues(getJobIssues());
  }, [job?.id, getJobIssues]);

  // Filter issues relevant to Primary Business Contact (or fall back to all issues if none are flagged)
  const businessIssues = React.useMemo(() => {
    const filtered = issues.filter(item => {
      const st = (item.status || '').toLowerCase();
      const lvl = (item.currentLevel || '').toLowerCase();
      const tgt = (item.currentRoleTarget || '').toLowerCase();
      return (
        st.includes('business') ||
        lvl.includes('business') ||
        tgt.includes('business') ||
        !!item.sentToManagementResponseAt ||
        !!item.managementResponseSubmittedAt
      );
    });
    return filtered.length > 0 ? filtered : issues;
  }, [issues]);

  const [selectedIssueId, setSelectedIssueId] = useState(() => {
    if (initialIssueId) return initialIssueId;
    return businessIssues[0]?.id || null;
  });

  useEffect(() => {
    if (initialIssueId && businessIssues.some(i => i.id === initialIssueId)) {
      setSelectedIssueId(initialIssueId);
    } else if (businessIssues.length > 0 && (!selectedIssueId || !businessIssues.some(i => i.id === selectedIssueId))) {
      setSelectedIssueId(businessIssues[0].id);
    }
  }, [initialIssueId, businessIssues, selectedIssueId]);

  const selectedIssue = businessIssues.find(i => i.id === selectedIssueId) || businessIssues[0] || null;

  const updateIssuesAndSync = (newIssues) => {
    setIssues(newIssues);
    if (onUpdateIssues) {
      onUpdateIssues(newIssues);
    }
  };

  // Dynamically resolved test procedures for the active engagement
  const activeTestProcedures = React.useMemo(() => {
    const engId = job?.id || job?.jobId || job?.reportId;
    if (!engId) return TEST_PROCEDURE_OPTIONS;
    const mapped = getTestProceduresByEngagement(engId);
    if (!mapped || mapped.length === 0) return TEST_PROCEDURE_OPTIONS;
    return mapped.map(tp => tp.fullName || `${tp.code}: ${tp.name}`);
  }, [job?.id, job?.jobId, job?.reportId]);

  // Violation Reference Document Side-Drawer State
  const [selectedViolationDoc, setSelectedViolationDoc] = useState(null);
  const [isViolationDrawerOpen, setIsViolationDrawerOpen] = useState(false);

  const handleOpenViolationDoc = (violation) => {
    setSelectedViolationDoc(violation);
    setIsViolationDrawerOpen(true);
  };

  // Field-Level Comments Reactive Subscription
  const [, setCommentTick] = useState(0);
  useEffect(() => {
    return subscribeToCommentUpdates(() => setCommentTick(t => t + 1));
  }, []);

  // Resolve Current Business Owner User for comment authorship
  const currentCommentUser = React.useMemo(() => {
    const found = usersData.find(u =>
      u.baselineRole === userRole ||
      (userRole === 'primary-business-contact' && u.baselineRole === 'business-contact')
    );
    if (found) {
      return {
        id: found.id,
        userId: found.id,
        name: found.name,
        role: found.title || 'Primary Business Contact',
        baselineRole: 'primary-business-contact',
        isBusinessUser: true,
        avatar: found.initials || found.name.split(' ').map(n => n[0]).join(''),
        avatarBg: '#0284C7'
      };
    }
    return {
      id: 'USR-BUSINESS',
      userId: 'USR-BUSINESS',
      name: 'Thomas Wright',
      role: activeRoleObj?.label || 'Primary Business Contact',
      baselineRole: 'primary-business-contact',
      isBusinessUser: true,
      avatar: 'TW',
      avatarBg: '#0284C7'
    };
  }, [userRole, activeRoleObj]);

  // Available Business Contacts for Tagging
  const availableBusinessUsers = React.useMemo(() => {
    return usersData
      .filter(u => (u.baselineRole || '').includes('business') || (u.function || '').toLowerCase() === 'business')
      .map(u => ({
        id: u.id,
        userId: u.id,
        name: u.name,
        role: u.title,
        baselineRole: u.baselineRole,
        isBusinessUser: true,
        avatar: u.initials || u.name.split(' ').map(n => n[0]).join(''),
        avatarBg: '#0284C7'
      }));
  }, []);

  const [activeCommentField, setActiveCommentField] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-field-comment-container]')) {
        setActiveCommentField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveCommentField(null);
  }, [selectedIssueId]);

  // Business Response State
  const businessFileInputRef = useRef(null);
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const [businessResponseError, setBusinessResponseError] = useState('');
  const [toastNotification, setToastNotification] = useState(null);

  const handleBusinessFieldChange = (issueId, field, val) => {
    const target = issues.find(i => i.id === issueId);
    if (!target) return;
    const oldVal = target[field];

    const newIssues = issues.map(item => {
      if (item.id === issueId) {
        return { ...item, [field]: val };
      }
      return item;
    });
    updateIssuesAndSync(newIssues);

    try {
      logIssueEvent({
        issueId,
        engagementId: job?.id || job?.jobId || target.engagementId,
        actor: {
          name: currentCommentUser.name,
          role: activeRoleObj?.label || 'Primary Business Contact',
          domain: 'Business'
        },
        category: 'FIELD_EDIT',
        badgeType: 'update',
        action: `Updated business response field: ${field}`,
        fieldChanged: field,
        oldValue: oldVal || '',
        newValue: val || ''
      });
    } catch (err) {
      console.error('Failed to log business field change:', err);
    }
  };

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

  const renderCriticalityBadge = (crit) => {
    const val = (crit || 'Major').trim();
    let bg = '#F1B500';
    let border = '#D97706';
    if (val === 'Critical') {
      bg = '#D8001D';
      border = '#A00014';
    } else if (val === 'Minor' || val === 'Low') {
      bg = '#008000';
      border = '#047857';
    }
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: '800',
        padding: '2.5px 9px',
        borderRadius: '4px',
        backgroundColor: bg,
        color: '#ffffff',
        border: `1px solid ${border}`,
        display: 'inline-block',
        textAlign: 'center',
        letterSpacing: '0.2px'
      }}>
        {val}
      </span>
    );
  };

  const renderFunctionPill = (func) => {
    const val = (func || '').toString().trim().toLowerCase();
    const isIT = val.includes('it') || val.includes('tech') || val.includes('cyber') || val.includes('system');
    return (
      <span style={{
        fontSize: '10px',
        fontWeight: '800',
        padding: '2px 8px',
        borderRadius: '9999px',
        backgroundColor: isIT ? '#EFF6FF' : '#ECFDF5',
        color: isIT ? '#1D4ED8' : '#047857',
        border: `1px solid ${isIT ? '#BFDBFE' : '#A7F3D0'}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ width: '5.5px', height: '5.5px', borderRadius: '50%', backgroundColor: isIT ? '#3B82F6' : '#10B981', display: 'inline-block' }} />
        {isIT ? 'IT' : 'FinOps'}
      </span>
    );
  };

  // Field-level comment trigger restricted strictly to Business Owner's own comments (audit team comments hidden)
  const renderFieldCommentTrigger = (issueId, fieldKey, fieldLabel) => {
    const comments = getCommentsForIssueField(issueId, fieldKey, { businessOnly: true });
    const fieldIdentifier = `${issueId}_${fieldKey}`;
    const isOpen = activeCommentField === fieldIdentifier;
    const unresolvedCount = comments.filter(c => !c.isResolved).length;
    const isAllResolved = comments.length > 0 && unresolvedCount === 0;
    const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;

    return (
      <div data-field-comment-container="true" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        {comments.length > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommentField(isOpen ? null : fieldIdentifier);
            }}
            title={`Your comments on ${fieldLabel}\n${comments.length} comment(s) (${unresolvedCount} open). Click to view thread & reply.`}
            style={{
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: '700',
              borderRadius: '12px',
              border: isAllResolved
                ? (isOpen ? '1.5px solid #16A34A' : '1px solid #BBF7D0')
                : (isOpen ? '1.5px solid #2563EB' : '1px solid #BFDBFE'),
              backgroundColor: isAllResolved
                ? (isOpen ? '#DCFCE7' : '#F0FDF4')
                : (isOpen ? '#DBEAFE' : '#EFF6FF'),
              color: isAllResolved ? '#166534' : '#1E40AF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: isAllResolved ? '0 1px 2px rgba(22,163,74,0.08)' : '0 1px 2px rgba(37,99,235,0.08)',
              transition: 'all 0.15s ease',
              maxWidth: '220px'
            }}
          >
            {isAllResolved ? (
              <>
                <CheckCircle2 style={{ width: '11px', height: '11px', color: '#16A34A' }} />
                <span style={{ fontSize: '9.5px', fontWeight: '800' }}>✓ Resolved ({comments.length})</span>
              </>
            ) : (
              <>
                <span style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: latestComment?.author?.avatarBg || '#0284C7',
                  color: '#ffffff',
                  fontSize: '8px',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {latestComment?.author?.avatar || 'BC'}
                </span>

                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '110px',
                  fontSize: '9.5px',
                  color: '#1E3A8A'
                }}>
                  <strong>{latestComment?.author?.name ? latestComment.author.name.split(' ')[0] : 'Note'}:</strong> "{latestComment?.text || ''}"
                </span>

                <span style={{
                  backgroundColor: unresolvedCount > 0 ? '#2563EB' : '#16A34A',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '0 5px',
                  fontSize: '9px',
                  fontWeight: '800',
                  lineHeight: '12px'
                }}>
                  {unresolvedCount}
                </span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommentField(isOpen ? null : fieldIdentifier);
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

        <FieldCommentPopover
          isOpen={isOpen}
          onClose={() => setActiveCommentField(null)}
          targetType="ISSUE_FIELD"
          engagementId={job?.id || job?.jobId || 'REP-2026-008'}
          issueId={issueId}
          fieldKey={fieldKey}
          fieldLabel={fieldLabel}
          comments={comments}
          currentUser={currentCommentUser}
          availableUsers={availableBusinessUsers}
          placement="down"
        />
      </div>
    );
  };

  // Left Section: All Issue Fields in Read-Only Mode with Field-Level Comment Option
  const renderReadOnlyIssueFields = (item) => {
    const isReadOnly = true;

    const inputBaseStyle = {
      width: '100%',
      height: '34px',
      padding: '0 10px',
      fontSize: '12px',
      borderRadius: '6px',
      border: '1px solid #E2E8F0',
      backgroundColor: '#F8FAFC',
      color: '#475569',
      cursor: 'not-allowed',
      outline: 'none',
      boxSizing: 'border-box'
    };

    const selectBaseStyle = {
      width: '100%',
      height: '34px',
      padding: '0 8px',
      fontSize: '12px',
      borderRadius: '6px',
      border: '1px solid #E2E8F0',
      backgroundColor: '#F8FAFC',
      color: '#475569',
      cursor: 'not-allowed',
      outline: 'none',
      boxSizing: 'border-box'
    };

    const textareaBaseStyle = {
      width: '100%',
      padding: '8px 10px',
      fontSize: '12px',
      borderRadius: '6px',
      border: '1px solid #E2E8F0',
      backgroundColor: '#F8FAFC',
      color: '#475569',
      cursor: 'not-allowed',
      fontFamily: 'inherit',
      resize: 'none',
      outline: 'none',
      lineHeight: '1.5',
      boxSizing: 'border-box'
    };

    const labelStyle = {
      fontSize: '11px',
      fontWeight: '700',
      color: '#475569',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '4px'
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* 1. TOP SECTION: MANUAL IMPORTANT FIELDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Field 1: Test Procedure */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Test Procedure</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'testProcedure', 'Test Procedure')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.testProcedure || ''} style={selectBaseStyle}>
              <option value="" disabled>Select Test Procedure...</option>
              {item.testProcedure && !activeTestProcedures.includes(item.testProcedure) && (
                <option value={item.testProcedure}>{item.testProcedure}</option>
              )}
              {activeTestProcedures.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Field 2: Original Issue */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Original Issue</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'originalIssue', 'Original Issue')}
              </div>
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.originalIssue || item.issue || ''}
              style={textareaBaseStyle}
            />
          </div>

          {/* Field 3: Criticality */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Criticality</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'criticality', 'Criticality')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.criticality} style={selectBaseStyle}>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>
        </div>

        {/* 2. MIDDLE SECTION: AI GENERATED FIELDS */}
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
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  AI Generated Fields
                </h4>
                <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                  AI Synthesized title, observation, root cause, impact &amp; recommendation
                </span>
              </div>
            </div>

            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              color: '#64748B',
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Lock style={{ width: '10px', height: '10px' }} />
              <span>Read-Only</span>
            </span>
          </div>

          {/* AI Field 1: Issue Title */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Issue Title</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>🔒 Read Only</span>
                {renderFieldCommentTrigger(item.id, 'title', 'Issue Title')}
              </div>
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.title}
              style={inputBaseStyle}
            />
          </div>

          {/* AI Field 2: Description */}
          <DescriptionWithViolations
            issueId={item.id}
            label="Description"
            value={item.issue || ''}
            isReadOnly={true}
            onOpenViolationDoc={handleOpenViolationDoc}
            commentTrigger={renderFieldCommentTrigger(item.id, 'issue', 'Description')}
          />

          {/* AI Field 3: Root Cause */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Root Cause</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>🔒 Read Only</span>
                {renderFieldCommentTrigger(item.id, 'rootCause', 'Root Cause')}
              </div>
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.rootCause}
              style={textareaBaseStyle}
            />
          </div>

          {/* AI Field 4: Impact */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Impact</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>🔒 Read Only</span>
                {renderFieldCommentTrigger(item.id, 'impact', 'Impact')}
              </div>
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.impact}
              style={textareaBaseStyle}
            />
          </div>

          {/* AI Field 5: Recommendation */}
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Recommendation</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>🔒 Read Only</span>
                {renderFieldCommentTrigger(item.id, 'recommendation', 'Recommendation')}
              </div>
            </label>
            <textarea
              rows={3}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.recommendation}
              style={textareaBaseStyle}
            />
          </div>
        </div>

        {/* 3. BOTTOM SECTION: ALL OTHER AUDIT & GOVERNANCE FIELDS */}
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
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'processArea', 'Process Area')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.processArea} style={selectBaseStyle}>
              {item.processArea && !PROCESS_AREA_OPTIONS.includes(item.processArea) && (
                <option value={item.processArea}>{item.processArea.replace(/_/g, ' ')}</option>
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
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'issueCauseType', 'Cause Type')}
              </div>
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.issueCauseType} style={inputBaseStyle} />
          </div>
        </div>

        {/* SOX Reportable & Repeat Finding */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>SOX Reportable</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'soxReportable', 'SOX Reportable')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.soxReportable} style={selectBaseStyle}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Repeat Finding</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'repeatFinding', 'Repeat Finding')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.repeatFinding} style={selectBaseStyle}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>

        {/* Management Response (Read-Only Mirror) */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Management Response</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
              {renderFieldCommentTrigger(item.id, 'managementResponse', 'Management Response')}
            </div>
          </label>
          <textarea
            rows={2}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.managementResponse || ''}
            placeholder="No management response recorded yet..."
            style={textareaBaseStyle}
          />
        </div>

        {/* Accountable Contact & Agreed Remediation Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Accountable Contact</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'accountableContact', 'Accountable Contact')}
              </div>
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.accountableContact || ''} style={inputBaseStyle} />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Agreed Remediation Date</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'agreedRemediationDate', 'Agreed Remediation Date')}
              </div>
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.agreedRemediationDate || ''} style={inputBaseStyle} />
          </div>
        </div>

        {/* Summary Finding (Executive Summary) */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Summary Finding (Executive Summary)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
              {renderFieldCommentTrigger(item.id, 'summaryFinding', 'Summary Finding')}
            </div>
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.summaryFinding || ''}
            placeholder="No summary finding..."
            style={textareaBaseStyle}
          />
        </div>

        {/* Auditor Response */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Auditor Response</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
              {renderFieldCommentTrigger(item.id, 'auditorResponse', 'Auditor Response')}
            </div>
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.auditorResponse || ''}
            placeholder="No auditor response..."
            style={textareaBaseStyle}
          />
        </div>

        {/* Mitigating Control */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Mitigating Control</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
              {renderFieldCommentTrigger(item.id, 'mitigatingControl', 'Mitigating Control')}
            </div>
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.mitigatingControl || ''}
            placeholder="No mitigating control..."
            style={textareaBaseStyle}
          />
        </div>

        {/* Exception Remed Comments */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Exception Remed Comments</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
              {renderFieldCommentTrigger(item.id, 'exceptionRemedComments', 'Exception Remed Comments')}
            </div>
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.exceptionRemedComments || ''}
            placeholder="No exception remediation comments..."
            style={textareaBaseStyle}
          />
        </div>

        {/* Issue Type & Issue Source */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Issue Type</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'issueType', 'Issue Type')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.issueType || ''} style={selectBaseStyle}>
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
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'issueSource', 'Issue Source')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.issueSource || ''} style={selectBaseStyle}>
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

        {/* Key Theme & Technology Related */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Key Theme</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'keyTheme', 'Key Theme')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.keyTheme || ''} style={selectBaseStyle}>
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
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'technologyRelated', 'Technology Related')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.technologyRelated || 'No'} style={selectBaseStyle}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>

        {/* IT Asset Accountable Sector & Impacted Region */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>IT Asset Accountable Sector</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'itAssetAccountableSector', 'IT Asset Accountable Sector')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.itAssetAccountableSector || ''} style={selectBaseStyle}>
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
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'impactedRegion', 'Impacted Region')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.impactedRegion || ''} style={selectBaseStyle}>
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

        {/* Impacted Sector & Impacted MRC */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Impacted Sector</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'impactedSector', 'Impacted Sector')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.impactedSector || ''} style={selectBaseStyle}>
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
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'impactedMrc', 'Impacted MRC')}
              </div>
            </label>
            <select disabled={isReadOnly} value={item.impactedMrc || ''} style={selectBaseStyle}>
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

        {/* Quarter Impacted */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Quarter Impacted</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
              {renderFieldCommentTrigger(item.id, 'quarterImpacted', 'Quarter Impacted')}
            </div>
          </label>
          <select disabled={isReadOnly} value={item.quarterImpacted || ''} style={selectBaseStyle}>
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
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'salesUsd', 'Sales (USD)')}
              </div>
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.salesUsd || ''} style={inputBaseStyle} />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>IBT (USD)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'ibtUsd', 'IBT (USD)')}
              </div>
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.ibtUsd || ''} style={inputBaseStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Net Income (USD)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'netIncomeUsd', 'Net Income (USD)')}
              </div>
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.netIncomeUsd || ''} style={inputBaseStyle} />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Total Assets (USD)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
                {renderFieldCommentTrigger(item.id, 'totalAssetsUsd', 'Total Assets (USD)')}
              </div>
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.totalAssetsUsd || ''} style={inputBaseStyle} />
          </div>
        </div>

        {/* Exception - Remed Date */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                disabled={isReadOnly}
                checked={!!item.hasExceptionRemedDate}
                readOnly
                style={{ width: '15px', height: '15px', accentColor: '#D8001D', cursor: 'not-allowed' }}
              />
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                Exception - Remed Date
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />
              {renderFieldCommentTrigger(item.id, 'exceptionRemedDate', 'Exception - Remed Date')}
            </div>
          </div>
          {item.hasExceptionRemedDate && (
            <input
              type="date"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.exceptionRemedDate || ''}
              style={{ ...inputBaseStyle, marginTop: '4px' }}
            />
          )}
        </div>
      </div>
    );
  };

  // Right Section: Business Response Inputs (Response, Date, Attachment)
  const renderBusinessResponseInputs = (item) => {
    const attachments = Array.isArray(item.attachments) ? item.attachments : [];
    const isSubmitted = item.status === 'Submitted to Director' || item.currentLevel === 'Director Review';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Business Response Status Banner */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '8px',
          backgroundColor: isSubmitted ? '#ECFDF5' : '#EFF6FF',
          border: isSubmitted ? '1px solid #A7F3D0' : '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: isSubmitted ? '#10B981' : '#0284C7',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: isSubmitted ? '#065F46' : '#1E40AF' }}>
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
            <p style={{ fontSize: '12px', color: isSubmitted ? '#047857' : '#1E3A8A', margin: 0, lineHeight: '1.45' }}>
              {isSubmitted
                ? 'Your response and supporting evidence have been submitted to the Audit Director for review.'
                : 'Review the read-only issue fields on the left, then enter your Management Response, Agreed Remediation Date, and supporting attachments below.'}
            </p>
          </div>
        </div>

        {/* Input 1: Management Response & Corrective Action Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare style={{ width: '14px', height: '14px', color: '#0284C7' }} />
              Management Response &amp; Corrective Action Plan <span style={{ color: '#DC2626' }}>*</span>
            </span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B' }}>
              {(item.managementResponse || '').length} characters
            </span>
          </label>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0 }}>
            Specify the corrective actions agreed upon by management, systemic fixes, ownership, and milestones.
          </p>
          <textarea
            rows={6}
            value={item.managementResponse || ''}
            onChange={(e) => {
              if (businessResponseError) setBusinessResponseError('');
              handleBusinessFieldChange(item.id, 'managementResponse', e.target.value);
            }}
            placeholder="Enter detailed management response, corrective action plan, and accountability details..."
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '12.5px',
              borderRadius: '8px',
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

        {/* Input 2: Agreed Remediation Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar style={{ width: '14px', height: '14px', color: '#0284C7' }} />
            Agreed Remediation Date <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0 }}>
            Target completion date agreed upon with Internal Audit for full closure of corrective actions.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={item.agreedRemediationDate || ''}
              onChange={(e) => {
                if (businessResponseError) setBusinessResponseError('');
                handleBusinessFieldChange(item.id, 'agreedRemediationDate', e.target.value);
              }}
              style={{
                height: '38px',
                padding: '0 12px',
                fontSize: '12.5px',
                fontWeight: '600',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#ffffff',
                color: '#0F172A',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            {['2026-10-31', '2026-11-30', '2026-12-31', '2027-01-31'].map(presetDate => (
              <button
                key={presetDate}
                type="button"
                onClick={() => {
                  if (businessResponseError) setBusinessResponseError('');
                  handleBusinessFieldChange(item.id, 'agreedRemediationDate', presetDate);
                }}
                style={{
                  height: '34px',
                  padding: '0 10px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: item.agreedRemediationDate === presetDate ? '1.5px solid #0284C7' : '1px solid #CBD5E1',
                  backgroundColor: item.agreedRemediationDate === presetDate ? '#EFF6FF' : '#F8FAFC',
                  color: item.agreedRemediationDate === presetDate ? '#0284C7' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {presetDate}
              </button>
            ))}
          </div>
        </div>

        {/* Input 3: Upload Attachments & Evidence Files */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Paperclip style={{ width: '14px', height: '14px', color: '#0284C7' }} />
              Upload Attachments &amp; Evidence Files
            </span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>
              {attachments.length} {attachments.length === 1 ? 'file' : 'files'} attached
            </span>
          </label>
          <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0 }}>
            Upload supporting artifacts such as ticket extracts, vendor agreements, architecture diagrams, or sign-off emails.
          </p>

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
              padding: '24px 20px',
              border: uploadDragOver ? '2px dashed #0284C7' : '2px dashed #CBD5E1',
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
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: uploadDragOver ? '#DBEAFE' : '#E2E8F0',
              color: uploadDragOver ? '#0284C7' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UploadCloud style={{ width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>
              Click to upload or drag and drop files here
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Supports PDF, DOCX, XLSX, PNG, JPG (up to 25 MB per file)
            </div>
          </div>

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
                      width: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      backgroundColor: '#EFF6FF',
                      color: '#0284C7',
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
                      padding: '4px 8px',
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
          paddingTop: '14px',
          borderTop: '1px solid #E2E8F0',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => handleSaveBusinessDraft(item.id)}
            style={{
              padding: '9px 16px',
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
            <Save style={{ width: '14px', height: '14px', color: '#64748B' }} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmitBusinessResponse(item.id)}
            style={{
              padding: '9px 20px',
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

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#F8FAFC'
    }}>
      {/* Top Toolbar */}
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
            title="Back to My Audits"
          >
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#D8001D' }} />
            <span>Back</span>
          </button>

          <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Provide Business Response — {job?.fileName || job?.engagement || job?.id || 'Audit Engagement'}
          </h1>

          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#0369A1',
            backgroundColor: '#F0F9FF',
            padding: '3px 10px',
            borderRadius: '6px',
            border: '1px solid #BAE6FD',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ color: '#0284C7' }}>Role:</span>
            <strong style={{ color: '#0C4A6E' }}>{activeRoleObj.label}</strong>
          </span>
        </div>

        {/* Issue Selector Tabs if engagement has issues */}
        {businessIssues.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B' }}>
              {businessIssues.length > 1 ? `Select Issue (${businessIssues.length}):` : 'Active Issue:'}
            </span>
            {businessIssues.map((iss, idx) => {
              const isSelected = selectedIssue?.id === iss.id;
              return (
                <button
                  key={iss.id}
                  type="button"
                  onClick={() => {
                    setSelectedIssueId(iss.id);
                    setBusinessResponseError('');
                  }}
                  style={{
                    padding: '5px 12px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    borderRadius: '6px',
                    border: isSelected ? '1.5px solid #0284C7' : '1px solid #CBD5E1',
                    backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    color: isSelected ? '#0369A1' : '#475569',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Ref #{iss.reportRef || idx + 1} ({iss.id})</span>
                  {iss.status === 'Submitted to Director' && (
                    <CheckCircle2 style={{ width: '12px', height: '12px', color: '#10B981' }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Two-Section Workspace */}
      {selectedIssue ? (
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          overflow: 'hidden'
        }}>
          {/* LEFT SECTION: All Issue Fields in Read-Only Mode with Field-Level Comment Option */}
          <div style={{
            borderRight: '1px solid #CBD5E1',
            backgroundColor: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <FileText style={{ width: '15px', height: '15px', color: '#1E40AF' }} />
                <h2 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Issue Details &amp; Fields — {selectedIssue.id}
                </h2>
                {renderFunctionPill(selectedIssue.function)}
                {renderCriticalityBadge(selectedIssue.criticality)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: '700',
                  color: '#0369A1',
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <MessageSquare style={{ width: '11px', height: '11px' }} />
                  <span>My Comments Only</span>
                </span>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: '#475569',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Lock style={{ width: '10.5px', height: '10.5px' }} />
                  <span>Read-Only Mode</span>
                </span>
              </div>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px 20px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '18px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}>
                {renderReadOnlyIssueFields(selectedIssue)}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: Business Response Inputs (Response, Date, Attachment) */}
          <div style={{
            backgroundColor: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 20px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare style={{ width: '15px', height: '15px', color: '#0284C7' }} />
                <h2 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Business Response Inputs — {selectedIssue.id}
                </h2>
              </div>
              <span style={{
                fontSize: '10.5px',
                fontWeight: '800',
                color: '#0284C7',
                backgroundColor: '#F0F9FF',
                border: '1px solid #BAE6FD',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Response • Date • Attachments
              </span>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px 20px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}>
                {renderBusinessResponseInputs(selectedIssue)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: '#64748B'
        }}>
          <AlertOctagon style={{ width: '40px', height: '40px', color: '#94A3B8', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>
            No Issues Available for Business Response
          </h3>
          <p style={{ fontSize: '13px', margin: 0 }}>
            There are currently no findings requiring a business response in this engagement.
          </p>
        </div>
      )}

      {/* Violation Reference PDF Side-Drawer */}
      <ViolationPdfDrawer
        isOpen={isViolationDrawerOpen}
        onClose={() => setIsViolationDrawerOpen(false)}
        violation={selectedViolationDoc}
      />

      {/* Toast Notification */}
      {toastNotification && (
        <ToastNotification
          toast={toastNotification}
          onClose={() => setToastNotification(null)}
        />
      )}
    </div>
  );
}

