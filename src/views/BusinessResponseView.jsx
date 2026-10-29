import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Send, MessageSquare,
  CheckCircle2, AlertOctagon
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

  const handleSubmitBusinessResponse = (issueId) => {
    const target = issues.find(i => i.id === issueId);
    if (!target) return;

    if (!target.managementResponse || !target.managementResponse.trim()) {
      setBusinessResponseError('Please enter a Management Response before submitting.');
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
      description: `Management response for ${issueRef} has been successfully submitted.`
    });
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

  const isNeurovascularEngagement = (job?.fileName || job?.engagement || '').includes('Neurovascular_Stent_Manufacturing_Review');

  // Left Section: All Issue Fields in Read-Only Mode with Field-Level Comment Option
  const renderReadOnlyIssueFields = (item, isMultiColumn = false) => {
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

    if (isMultiColumn) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1 (3 Columns): Test Procedure, Criticality, Issue Title */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Test Procedure</span>
                {renderFieldCommentTrigger(item.id, 'testProcedure', 'Test Procedure')}
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

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Criticality</span>
                {renderFieldCommentTrigger(item.id, 'criticality', 'Criticality')}
              </label>
              <select disabled={isReadOnly} value={item.criticality} style={selectBaseStyle}>
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Issue Title</span>
                {renderFieldCommentTrigger(item.id, 'title', 'Issue Title')}
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                readOnly={isReadOnly}
                value={item.title}
                style={inputBaseStyle}
              />
            </div>
          </div>

          {/* Row 2 (2 Columns): Original Issue & Root Cause */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Original Issue</span>
                {renderFieldCommentTrigger(item.id, 'originalIssue', 'Original Issue')}
              </label>
              <textarea
                rows={3}
                disabled={isReadOnly}
                readOnly={isReadOnly}
                value={item.originalIssue || item.issue || ''}
                style={textareaBaseStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Root Cause</span>
                {renderFieldCommentTrigger(item.id, 'rootCause', 'Root Cause')}
              </label>
              <textarea
                rows={3}
                disabled={isReadOnly}
                readOnly={isReadOnly}
                value={item.rootCause}
                style={textareaBaseStyle}
              />
            </div>
          </div>

          {/* Row 3: Description with Violation Reference */}
          <DescriptionWithViolations
            issueId={item.id}
            label="Description"
            value={item.issue || ''}
            isReadOnly={true}
            hideReadOnlyBadge={true}
            onOpenViolationDoc={handleOpenViolationDoc}
            commentTrigger={renderFieldCommentTrigger(item.id, 'issue', 'Description')}
          />

          {/* Row 4 (2 Columns): Impact & Recommendation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Impact</span>
                {renderFieldCommentTrigger(item.id, 'impact', 'Impact')}
              </label>
              <textarea
                rows={3}
                disabled={isReadOnly}
                readOnly={isReadOnly}
                value={item.impact}
                style={textareaBaseStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Recommendation</span>
                {renderFieldCommentTrigger(item.id, 'recommendation', 'Recommendation')}
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

          {/* Row 5 (4 Columns): Process Area, Issue Cause Type, SOX Reportable, Repeat Finding */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Process Area</span>
                {renderFieldCommentTrigger(item.id, 'processArea', 'Process Area')}
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
                {renderFieldCommentTrigger(item.id, 'issueCauseType', 'Cause Type')}
              </label>
              <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.issueCauseType} style={inputBaseStyle} />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>SOX Reportable</span>
                {renderFieldCommentTrigger(item.id, 'soxReportable', 'SOX Reportable')}
              </label>
              <select disabled={isReadOnly} value={item.soxReportable} style={selectBaseStyle}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Repeat Finding</span>
                {renderFieldCommentTrigger(item.id, 'repeatFinding', 'Repeat Finding')}
              </label>
              <select disabled={isReadOnly} value={item.repeatFinding} style={selectBaseStyle}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Row 6 (2 Columns): Accountable Contact & Agreed Remediation Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Accountable Contact</span>
                {renderFieldCommentTrigger(item.id, 'accountableContact', 'Accountable Contact')}
              </label>
              <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.accountableContact || ''} style={inputBaseStyle} />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Agreed Remediation Date</span>
                {renderFieldCommentTrigger(item.id, 'agreedRemediationDate', 'Agreed Remediation Date')}
              </label>
              <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.agreedRemediationDate || ''} style={inputBaseStyle} />
            </div>
          </div>

          {/* Row 7 (2 Columns): Management Response & Summary Finding */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Management Response</span>
                {renderFieldCommentTrigger(item.id, 'managementResponse', 'Management Response')}
              </label>
              <textarea
                rows={3}
                disabled={isReadOnly}
                readOnly={isReadOnly}
                value={item.managementResponse || ''}
                placeholder="No management response recorded yet..."
                style={textareaBaseStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Summary Finding (Executive Summary)</span>
                {renderFieldCommentTrigger(item.id, 'summaryFinding', 'Summary Finding')}
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
          </div>

          {/* Row 8 (3 Columns): Auditor Response, Mitigating Control, Exception Remed Comments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Auditor Response</span>
                {renderFieldCommentTrigger(item.id, 'auditorResponse', 'Auditor Response')}
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

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Mitigating Control</span>
                {renderFieldCommentTrigger(item.id, 'mitigatingControl', 'Mitigating Control')}
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

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Exception Remed Comments</span>
                {renderFieldCommentTrigger(item.id, 'exceptionRemedComments', 'Exception Remed Comments')}
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
          </div>

          {/* Row 9 (4 Columns): Issue Type, Issue Source, Key Theme, Technology Related */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Issue Type</span>
                {renderFieldCommentTrigger(item.id, 'issueType', 'Issue Type')}
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
                {renderFieldCommentTrigger(item.id, 'issueSource', 'Issue Source')}
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

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Key Theme</span>
                {renderFieldCommentTrigger(item.id, 'keyTheme', 'Key Theme')}
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
                {renderFieldCommentTrigger(item.id, 'technologyRelated', 'Technology Related')}
              </label>
              <select disabled={isReadOnly} value={item.technologyRelated || 'No'} style={selectBaseStyle}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Row 10 (4 Columns): IT Asset Accountable Sector, Impacted Region, Impacted Sector, Impacted MRC */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>IT Asset Accountable Sector</span>
                {renderFieldCommentTrigger(item.id, 'itAssetAccountableSector', 'IT Asset Accountable Sector')}
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
                {renderFieldCommentTrigger(item.id, 'impactedRegion', 'Impacted Region')}
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

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Impacted Sector</span>
                {renderFieldCommentTrigger(item.id, 'impactedSector', 'Impacted Sector')}
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
                {renderFieldCommentTrigger(item.id, 'impactedMrc', 'Impacted MRC')}
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

          {/* Row 11 (5 Columns): Quarter Impacted, Sales (USD), IBT (USD), Net Income (USD), Total Assets (USD) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Quarter Impacted</span>
                {renderFieldCommentTrigger(item.id, 'quarterImpacted', 'Quarter Impacted')}
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

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Sales (USD)</span>
                {renderFieldCommentTrigger(item.id, 'salesUsd', 'Sales (USD)')}
              </label>
              <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.salesUsd || ''} style={inputBaseStyle} />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>IBT (USD)</span>
                {renderFieldCommentTrigger(item.id, 'ibtUsd', 'IBT (USD)')}
              </label>
              <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.ibtUsd || ''} style={inputBaseStyle} />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Net Income (USD)</span>
                {renderFieldCommentTrigger(item.id, 'netIncomeUsd', 'Net Income (USD)')}
              </label>
              <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.netIncomeUsd || ''} style={inputBaseStyle} />
            </div>

            <div>
              <label style={labelStyle}>
                <span style={{ fontWeight: '700' }}>Total Assets (USD)</span>
                {renderFieldCommentTrigger(item.id, 'totalAssetsUsd', 'Total Assets (USD)')}
              </label>
              <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.totalAssetsUsd || ''} style={inputBaseStyle} />
            </div>
          </div>

          {/* Row 12: Exception - Remed Date */}
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
              {renderFieldCommentTrigger(item.id, 'exceptionRemedDate', 'Exception - Remed Date')}
            </div>
            {item.hasExceptionRemedDate && (
              <input
                type="date"
                disabled={isReadOnly}
                readOnly={isReadOnly}
                value={item.exceptionRemedDate || ''}
                style={{ ...inputBaseStyle, marginTop: '4px', maxWidth: '300px' }}
              />
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Field 1: Test Procedure */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Test Procedure</span>
            {renderFieldCommentTrigger(item.id, 'testProcedure', 'Test Procedure')}
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
            {renderFieldCommentTrigger(item.id, 'originalIssue', 'Original Issue')}
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
            {renderFieldCommentTrigger(item.id, 'criticality', 'Criticality')}
          </label>
          <select disabled={isReadOnly} value={item.criticality} style={selectBaseStyle}>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
          </select>
        </div>

        {/* AI Field 1: Issue Title */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Issue Title</span>
            {renderFieldCommentTrigger(item.id, 'title', 'Issue Title')}
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
          hideReadOnlyBadge={true}
          onOpenViolationDoc={handleOpenViolationDoc}
          commentTrigger={renderFieldCommentTrigger(item.id, 'issue', 'Description')}
        />

        {/* AI Field 3: Root Cause */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Root Cause</span>
            {renderFieldCommentTrigger(item.id, 'rootCause', 'Root Cause')}
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
            {renderFieldCommentTrigger(item.id, 'impact', 'Impact')}
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
            {renderFieldCommentTrigger(item.id, 'recommendation', 'Recommendation')}
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.recommendation}
            style={textareaBaseStyle}
          />
        </div>

        {/* Process Area & Issue Cause Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Process Area</span>
              {renderFieldCommentTrigger(item.id, 'processArea', 'Process Area')}
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
              {renderFieldCommentTrigger(item.id, 'issueCauseType', 'Cause Type')}
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.issueCauseType} style={inputBaseStyle} />
          </div>
        </div>

        {/* SOX Reportable & Repeat Finding */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>SOX Reportable</span>
              {renderFieldCommentTrigger(item.id, 'soxReportable', 'SOX Reportable')}
            </label>
            <select disabled={isReadOnly} value={item.soxReportable} style={selectBaseStyle}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Repeat Finding</span>
              {renderFieldCommentTrigger(item.id, 'repeatFinding', 'Repeat Finding')}
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
            {renderFieldCommentTrigger(item.id, 'managementResponse', 'Management Response')}
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
              {renderFieldCommentTrigger(item.id, 'accountableContact', 'Accountable Contact')}
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.accountableContact || ''} style={inputBaseStyle} />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Agreed Remediation Date</span>
              {renderFieldCommentTrigger(item.id, 'agreedRemediationDate', 'Agreed Remediation Date')}
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.agreedRemediationDate || ''} style={inputBaseStyle} />
          </div>
        </div>

        {/* Summary Finding (Executive Summary) */}
        <div>
          <label style={labelStyle}>
            <span style={{ fontWeight: '700' }}>Summary Finding (Executive Summary)</span>
            {renderFieldCommentTrigger(item.id, 'summaryFinding', 'Summary Finding')}
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
            {renderFieldCommentTrigger(item.id, 'auditorResponse', 'Auditor Response')}
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
            {renderFieldCommentTrigger(item.id, 'mitigatingControl', 'Mitigating Control')}
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
            {renderFieldCommentTrigger(item.id, 'exceptionRemedComments', 'Exception Remed Comments')}
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
              {renderFieldCommentTrigger(item.id, 'issueType', 'Issue Type')}
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
              {renderFieldCommentTrigger(item.id, 'issueSource', 'Issue Source')}
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
              {renderFieldCommentTrigger(item.id, 'keyTheme', 'Key Theme')}
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
              {renderFieldCommentTrigger(item.id, 'technologyRelated', 'Technology Related')}
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
              {renderFieldCommentTrigger(item.id, 'itAssetAccountableSector', 'IT Asset Accountable Sector')}
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
              {renderFieldCommentTrigger(item.id, 'impactedRegion', 'Impacted Region')}
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
              {renderFieldCommentTrigger(item.id, 'impactedSector', 'Impacted Sector')}
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
              {renderFieldCommentTrigger(item.id, 'impactedMrc', 'Impacted MRC')}
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
            {renderFieldCommentTrigger(item.id, 'quarterImpacted', 'Quarter Impacted')}
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
              {renderFieldCommentTrigger(item.id, 'salesUsd', 'Sales (USD)')}
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.salesUsd || ''} style={inputBaseStyle} />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>IBT (USD)</span>
              {renderFieldCommentTrigger(item.id, 'ibtUsd', 'IBT (USD)')}
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.ibtUsd || ''} style={inputBaseStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Net Income (USD)</span>
              {renderFieldCommentTrigger(item.id, 'netIncomeUsd', 'Net Income (USD)')}
            </label>
            <input type="text" disabled={isReadOnly} readOnly={isReadOnly} value={item.netIncomeUsd || ''} style={inputBaseStyle} />
          </div>

          <div>
            <label style={labelStyle}>
              <span style={{ fontWeight: '700' }}>Total Assets (USD)</span>
              {renderFieldCommentTrigger(item.id, 'totalAssetsUsd', 'Total Assets (USD)')}
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
            {renderFieldCommentTrigger(item.id, 'exceptionRemedDate', 'Exception - Remed Date')}
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

  // Right Section: Only Management Response Field & Submit Response Button
  const renderBusinessResponseInputs = (item) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Management Response */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
            Management Response <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <textarea
            rows={6}
            value={item.managementResponse || ''}
            onChange={(e) => {
              if (businessResponseError) setBusinessResponseError('');
              handleBusinessFieldChange(item.id, 'managementResponse', e.target.value);
            }}
            placeholder="Enter management response..."
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
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

        {/* Submit Response Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingTop: '10px'
        }}>
          <button
            type="button"
            onClick={() => handleSubmitBusinessResponse(item.id)}
            style={{
              padding: '9px 20px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0284C7',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send style={{ width: '14px', height: '14px' }} />
            <span>Submit Response</span>
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
        gap: '12px',
        flexShrink: 0
      }}>
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
          {job?.fileName || job?.engagement || job?.id || 'Audit Engagement'}
        </h1>
      </div>

      {/* Main Workspace */}
      {selectedIssue ? (
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: isNeurovascularEngagement ? '1fr' : '1fr 1fr',
          overflow: 'hidden'
        }}>
          {/* LEFT SECTION: All Issue Fields in Read-Only Mode with Field-Level Comment Option */}
          <div style={{
            borderRight: isNeurovascularEngagement ? 'none' : '1px solid #E2E8F0',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px'
            }}>
              {renderReadOnlyIssueFields(selectedIssue, isNeurovascularEngagement)}
            </div>
          </div>

          {/* RIGHT SECTION: Business Response Inputs (Hidden for Neurovascular_Stent_Manufacturing_Review) */}
          {!isNeurovascularEngagement && (
            <div style={{
              backgroundColor: '#FDFDFD',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px'
              }}>
                {renderBusinessResponseInputs(selectedIssue)}
              </div>
            </div>
          )}
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
