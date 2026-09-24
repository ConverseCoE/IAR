import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Minus, Download, Send, GitBranch, History, 
  Sparkles, MoreVertical, Check, CheckCircle2, Layout, Columns, PanelLeft, Layers, X,
  Printer, FileText, ChevronRight, Eye, ZoomIn, ZoomOut, MessageSquare
} from 'lucide-react';
import { mockExecutiveSummaryData, mockExecutiveSummaryLogs, generateExecutiveSummaryData } from '../data/execReportData';
import IssueLogsModal from '../components/issues/IssueLogsModal';
import WorkflowModal from '../components/reporting/WorkflowModal';
import RichTextEditor from '../components/ui/RichTextEditor';
import { getRoleSubmissionConfig } from './AuditReportView';

export default function ExecutiveReportView({ job, onClose, onSwitchToAuditReport, userRole = 'it-director' }) {
  const [execData, setExecData] = useState(() => generateExecutiveSummaryData(job));

  useEffect(() => {
    if (job) {
      setExecData(generateExecutiveSummaryData(job));
    }
  }, [job?.id, job?.issuesList?.length]);

  const [showPushTooltip, setShowPushTooltip] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Role Detection: Director & VP
  const roleLower = (userRole || '').toLowerCase();
  const isDirector = roleLower.includes('director');
  const isVP = roleLower.includes('vp');
  const isDirectorOrVP = isDirector || isVP;

  // Check if report has even one critical issue
  const hasCriticalIssues = (() => {
    if (job?.issuesList && job.issuesList.length > 0) {
      return job.issuesList.some(iss => (iss.criticality || iss.severity || '').toLowerCase() === 'critical');
    }
    if (execData?.scopeSummary?.processMatrix) {
      return execData.scopeSummary.processMatrix.some(r => (r.critical || 0) > 0);
    }
    if (job?.issueIndicator) {
      return (job.issueIndicator.critical || 0) > 0;
    }
    return false;
  })();

  const isPushDisabled = isDirector && !isVP && hasCriticalIssues;
  const pushTooltipText = "Report contains critical issues, VP signoff is mandatory";
  
  // Accordion Expand States: 'scope', 'insights', 'criticalMajor'
  const [expandedSection, setExpandedSection] = useState('scope');
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [execLogs, setExecLogs] = useState(mockExecutiveSummaryLogs);

  // Derive Current Pending Stage for Header Pill
  const getPendingStageInfo = () => {
    if (!job) return { label: "Pending with Manager", bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB" };
    const queue = (job.currentQueue || job.queue || "").toLowerCase();
    const status = (job.status || "").toLowerCase();
    const subStatus = (job.subStatus || "").toLowerCase();

    if (queue.includes("tc") || queue.includes("team co-ordinator") || queue.includes("auditor")) {
      return { label: "Pending with TC", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", dot: "#D97706" };
    }
    if (queue.includes("manager")) {
      return { label: "Pending with Manager", bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB" };
    }
    if (queue.includes("director")) {
      return { label: "Pending with Director", bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE", dot: "#7C3AED" };
    }
    if (queue.includes("vp")) {
      return { label: "Pending with VP", bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3", dot: "#E11D48" };
    }

    if (status.includes("tc") || subStatus.includes("tc")) {
      return { label: "Pending with TC", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", dot: "#D97706" };
    }
    if (status.includes("manager") || subStatus.includes("manager")) {
      return { label: "Pending with Manager", bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB" };
    }
    if (status.includes("director") || subStatus.includes("director")) {
      return { label: "Pending with Director", bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE", dot: "#7C3AED" };
    }
    if (status.includes("vp") || subStatus.includes("vp")) {
      return { label: "Pending with VP", bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3", dot: "#E11D48" };
    }

    if (status === "not started") {
      return { label: "Pending with TC", bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", dot: "#D97706" };
    }
    if (job.currentQueue) {
      return { label: `Pending with ${job.currentQueue}`, bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB" };
    }

    return { label: "Pending with Manager", bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB" };
  };

  const pendingStage = getPendingStageInfo();

  // Field edit logger for real-time track changes pop-over
  const recordFieldChange = (fieldName, oldVal, newVal, badgeType = 'update') => {
    const newLog = {
      id: `EXEC-LIVE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: "Just now",
      date: new Date().toLocaleDateString('en-US'),
      user: "Current Auditor",
      role: "Internal Audit (Active Session)",
      action: `Modified ${fieldName}`,
      fieldChanged: fieldName,
      oldValue: typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal ?? '-'),
      newValue: typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal ?? '-'),
      badgeType: badgeType
    };
    setExecLogs(prev => [newLog, ...prev]);
  };

  // Field change handlers (Instant real-time update to live HTML PDF preview)
  const handleScopeChange = (field, val) => {
    const oldVal = execData.scopeSummary[field];
    if (oldVal !== val) {
      recordFieldChange(`Scope Summary — ${field}`, oldVal, val, 'scope');
    }
    setExecData(prev => ({
      ...prev,
      scopeSummary: {
        ...prev.scopeSummary,
        [field]: val
      }
    }));
  };

  const handleObjectiveBulletChange = (idx, val) => {
    const oldVal = execData.scopeSummary.objectiveBullets[idx];
    if (oldVal !== val) {
      recordFieldChange(`Objective Bullet #${idx + 1}`, oldVal, val, 'update');
    }
    setExecData(prev => {
      const newBullets = [...prev.scopeSummary.objectiveBullets];
      newBullets[idx] = val;
      return {
        ...prev,
        scopeSummary: {
          ...prev.scopeSummary,
          objectiveBullets: newBullets
        }
      };
    });
  };

  const handleAddObjectiveBullet = () => {
    setExecData(prev => ({
      ...prev,
      scopeSummary: {
        ...prev.scopeSummary,
        objectiveBullets: [...prev.scopeSummary.objectiveBullets, ""]
      }
    }));
  };

  const handleRemoveObjectiveBullet = (idx) => {
    setExecData(prev => ({
      ...prev,
      scopeSummary: {
        ...prev.scopeSummary,
        objectiveBullets: prev.scopeSummary.objectiveBullets.filter((_, i) => i !== idx)
      }
    }));
  };

  // Process Matrix Row Update (with auto total & grand total recalculation)
  const handleProcessMatrixChange = (index, field, val) => {
    setExecData(prev => {
      const newMatrix = [...prev.scopeSummary.processMatrix];
      const targetRow = { ...newMatrix[index] };

      if (['critical', 'major', 'minor'].includes(field)) {
        const numVal = Math.max(0, parseInt(val, 10) || 0);
        targetRow[field] = numVal;
        targetRow.total = (targetRow.critical || 0) + (targetRow.major || 0) + (targetRow.minor || 0);
      } else {
        targetRow[field] = val;
      }
      newMatrix[index] = targetRow;

      const oldVal = prev.scopeSummary.processMatrix[index]?.[field];
      if (oldVal !== val) {
        recordFieldChange(`Process Matrix — ${targetRow.processTitle || 'Process'} (${field})`, oldVal, val, 'matrix');
      }

      // Recalculate Grand Total row (last row) if editing regular rows
      if (index < newMatrix.length - 1) {
        const grandTotalRow = { ...newMatrix[newMatrix.length - 1] };
        let grandCrit = 0, grandMaj = 0, grandMin = 0, grandAll = 0;
        for (let i = 0; i < newMatrix.length - 1; i++) {
          grandCrit += newMatrix[i].critical || 0;
          grandMaj += newMatrix[i].major || 0;
          grandMin += newMatrix[i].minor || 0;
          grandAll += newMatrix[i].total || 0;
        }
        grandTotalRow.critical = grandCrit;
        grandTotalRow.major = grandMaj;
        grandTotalRow.minor = grandMin;
        grandTotalRow.total = grandAll;
        newMatrix[newMatrix.length - 1] = grandTotalRow;
      }

      return {
        ...prev,
        scopeSummary: {
          ...prev.scopeSummary,
          processMatrix: newMatrix
        }
      };
    });
  };

  const handleAddProcessRow = () => {
    setExecData(prev => {
      const newMatrix = [...prev.scopeSummary.processMatrix];
      const grandTotalRow = newMatrix.pop(); // Remove grand total temporarily
      newMatrix.push({
        processTitle: "New Process",
        critical: 0,
        major: 0,
        minor: 0,
        total: 0
      });
      newMatrix.push(grandTotalRow); // Put grand total back at end
      recordFieldChange('Process Matrix', 'Added Row', 'New Process', 'matrix');
      return {
        ...prev,
        scopeSummary: {
          ...prev.scopeSummary,
          processMatrix: newMatrix
        }
      };
    });
  };

  const handleRemoveProcessRow = (idx) => {
    setExecData(prev => {
      if (prev.scopeSummary.processMatrix.length <= 2) return prev; // Keep at least 1 process + grand total
      const removedRow = prev.scopeSummary.processMatrix[idx];
      const newMatrix = prev.scopeSummary.processMatrix.filter((_, i) => i !== idx);
      
      // Recalculate Grand Total
      const grandTotalRow = { ...newMatrix[newMatrix.length - 1] };
      let grandCrit = 0, grandMaj = 0, grandMin = 0, grandAll = 0;
      for (let i = 0; i < newMatrix.length - 1; i++) {
        grandCrit += newMatrix[i].critical || 0;
        grandMaj += newMatrix[i].major || 0;
        grandMin += newMatrix[i].minor || 0;
        grandAll += newMatrix[i].total || 0;
      }
      grandTotalRow.critical = grandCrit;
      grandTotalRow.major = grandMaj;
      grandTotalRow.minor = grandMin;
      grandTotalRow.total = grandAll;
      newMatrix[newMatrix.length - 1] = grandTotalRow;

      recordFieldChange('Process Matrix', `Removed ${removedRow?.processTitle || 'Row'}`, 'Row Deleted', 'matrix');

      return {
        ...prev,
        scopeSummary: {
          ...prev.scopeSummary,
          processMatrix: newMatrix
        }
      };
    });
  };

  // Audit Insights Handlers
  const handleInsightsOverallChange = (val) => {
    const oldVal = execData.auditInsights.overallText;
    if (oldVal !== val) {
      recordFieldChange('Audit Insights Summary', oldVal, val, 'update');
    }
    setExecData(prev => ({
      ...prev,
      auditInsights: {
        ...prev.auditInsights,
        overallText: val
      }
    }));
  };

  const handleInsightsNarrativeChange = (html) => {
    const oldVal = execData.auditInsights.narrativeHtml;
    if (oldVal !== html) {
      recordFieldChange('Audit Insights Narrative', oldVal, html, 'insights');
    }
    setExecData(prev => ({
      ...prev,
      auditInsights: {
        ...prev.auditInsights,
        narrativeHtml: html
      }
    }));
  };

  const handleInsightsParagraphChange = (idx, val) => {
    const oldVal = execData.auditInsights.paragraphs[idx];
    if (oldVal !== val) {
      recordFieldChange(`Audit Insights Paragraph #${idx + 1}`, oldVal, val, 'update');
    }
    setExecData(prev => {
      const newParas = [...prev.auditInsights.paragraphs];
      newParas[idx] = val;
      return {
        ...prev,
        auditInsights: {
          ...prev.auditInsights,
          paragraphs: newParas
        }
      };
    });
  };

  // Critical & Major Issues Handlers
  const handleIssueChange = (issueType, field, val) => {
    const oldVal = execData.criticalMajorSection[issueType]?.[field];
    if (oldVal !== val) {
      recordFieldChange(`${issueType === 'criticalIssue' ? 'Critical Issue' : 'Major Issue'} — ${field}`, oldVal, val, 'issue');
    }
    setExecData(prev => ({
      ...prev,
      criticalMajorSection: {
        ...prev.criticalMajorSection,
        [issueType]: {
          ...prev.criticalMajorSection[issueType],
          [field]: val
        }
      }
    }));
  };

  // Action Handlers
  const handleGenerateExecSummary = () => {
    alert("AI Re-generating Executive Summary scope analysis & critical issue synthesis from audit issues...");
  };

  const handleSave = () => {
    alert("Executive Summary changes saved successfully!");
  };

  const handleSubmit = () => {
    alert("Executive Summary submitted for executive leadership approval.");
  };

  const handleReroute = () => {
    alert("Executive Summary rerouted to Senior Audit Director.");
  };

  // Helper for matrix cell display: "-" when 0, or number when > 0
  const formatMatrixVal = (val) => {
    if (val === 0 || val === "0" || val === null || val === undefined || val === "") {
      return "-";
    }
    return val;
  };

  // Field-level & Row-level Comments State
  const [fieldComments, setFieldComments] = useState({
    "scope_objective": [
      {
        id: "ec-1",
        user: "Marcus Vance",
        role: "Lead Compliance Auditor",
        avatar: "MV",
        avatarBg: "#7C3AED",
        timestamp: "25 mins ago",
        comment: "Ensure manufacturing automation drift controls align with the Q2 scope mandate."
      }
    ],
    "processMatrix_row_0": [
      {
        id: "ec-2",
        user: "Sarah Jenkins",
        role: "Quality Assurance Director",
        avatar: "SJ",
        avatarBg: "#059669",
        timestamp: "1 hour ago",
        comment: "Reclassified 1 Minor finding under this process to ensure alignment with local SOP-402."
      }
    ],
    "insights_narrative": [
      {
        id: "ec-3",
        user: "Kevin Zhang",
        role: "IT Audit Lead",
        avatar: "KZ",
        avatarBg: "#2563EB",
        timestamp: "2 hours ago",
        comment: "Executive insights narrative verified against Plant Leadership exit interview takeaways."
      }
    ],
    "criticalIssue_description": [
      {
        id: "ec-4",
        user: "Elena Rostova",
        role: "VP Global Quality",
        avatar: "ER",
        avatarBg: "#DC2626",
        timestamp: "3 hours ago",
        comment: "Confirmed remediating CAPA timeline is capped at 30 days due to critical status."
      }
    ]
  });

  const [activeCommentField, setActiveCommentField] = useState(null);
  const [newCommentInput, setNewCommentInput] = useState('');
  const [popoverPlacement, setPopoverPlacement] = useState('down');

  // Click outside to close active comment popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-field-comment-container]')) {
        setActiveCommentField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddComment = (fieldIdentifier) => {
    if (!newCommentInput.trim()) return;

    let authorName = "You";
    let authorRole = "Audit Contributor";
    let authorAvatar = "ME";
    let authorBg = "#059669";

    if (isVP) {
      authorName = "Elena Rostova";
      authorRole = "VP Global Audit & Quality";
      authorAvatar = "ER";
      authorBg = "#DC2626";
    } else if (isDirector) {
      authorName = "Marcus Vance";
      authorRole = "IT Audit Director";
      authorAvatar = "MV";
      authorBg = "#7C3AED";
    }

    const newEntry = {
      id: "ec-" + Date.now(),
      user: authorName,
      role: authorRole,
      avatar: authorAvatar,
      avatarBg: authorBg,
      timestamp: "Just now",
      comment: newCommentInput.trim()
    };

    setFieldComments(prev => ({
      ...prev,
      [fieldIdentifier]: [...(prev[fieldIdentifier] || []), newEntry]
    }));

    setNewCommentInput('');
  };

  const renderFieldCommentTrigger = (fieldKey, fieldLabel, isRowLevel = false) => {
    const commentsList = fieldComments[fieldKey] || [];
    const isOpen = activeCommentField === fieldKey;
    const latestComment = commentsList.length > 0 ? commentsList[commentsList.length - 1] : null;

    const handleToggleComment = (e) => {
      e.stopPropagation();
      if (isOpen) {
        setActiveCommentField(null);
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setPopoverPlacement(spaceBelow < 330 ? 'up' : 'down');
        setActiveCommentField(fieldKey);
        setNewCommentInput('');
      }
    };

    return (
      <div 
        data-field-comment-container="true" 
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      >
        {commentsList.length > 0 ? (
          <button
            type="button"
            onClick={handleToggleComment}
            title={`Comments on ${fieldLabel}\n${commentsList.length} comment(s). Click to view thread & reply.`}
            style={{
              padding: isRowLevel ? '2px 6px' : '2px 7px',
              fontSize: isRowLevel ? '9.5px' : '10px',
              fontWeight: '700',
              borderRadius: '12px',
              border: isOpen ? '1.5px solid #2563EB' : '1px solid #BFDBFE',
              backgroundColor: isOpen ? '#DBEAFE' : '#EFF6FF',
              color: '#1E40AF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(37,99,235,0.08)',
              transition: 'all 0.15s ease',
              maxWidth: isRowLevel ? '70px' : '220px'
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

            {/* Commenter Name & Comment Snippet (field-level only) */}
            {!isRowLevel && (
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
            )}

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
              {commentsList.length}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleToggleComment}
            title={`Add a comment on ${fieldLabel}`}
            style={{
              padding: isRowLevel ? '2px 5px' : '1px 6px',
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
            <span>{isRowLevel ? '' : '+ Comment'}</span>
          </button>
        )}

        {/* COMMENTS POPOVER */}
        {isOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: popoverPlacement === 'up' ? 'auto' : 'calc(100% + 4px)',
              bottom: popoverPlacement === 'up' ? 'calc(100% + 4px)' : 'auto',
              right: 0,
              width: '320px',
              maxWidth: '90vw',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 12px 28px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)',
              zIndex: 9999,
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
                  {commentsList.length}
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
              {commentsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 8px', color: '#94A3B8', fontSize: '11px' }}>
                  No comments yet on this {isRowLevel ? 'process row' : 'field'}.<br />
                  Be the first to leave a review note below!
                </div>
              ) : (
                commentsList.map(c => (
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
                    handleAddComment(fieldKey);
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
                  onClick={() => handleAddComment(fieldKey)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#ffffff',
                    backgroundColor: newCommentInput.trim() ? '#2563EB' : '#94A3B8',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: newCommentInput.trim() ? 'pointer' : 'not-allowed',
                    transition: 'background 0.15s ease'
                  }}
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      height: 'calc(100vh - 54px)',
      maxHeight: 'calc(100vh - 54px)',
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      
      {/* Studio Header Toolbar */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #CBD5E1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Left Side: Back Arrow Button, Document Title & Pending Stage Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            title="Back to Reporting Queue"
          >
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#D8001D' }} />
          </button>

          <h1 style={{ fontSize: '16.5px', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.2px' }}>
            Executive Summary — {job?.fileName || execData.fileName}
          </h1>

          {/* Current Pending Stage Pill right of Title */}
          <span style={{
            fontSize: '11.5px',
            fontWeight: '800',
            color: pendingStage.color,
            backgroundColor: pendingStage.bg,
            border: `1px solid ${pendingStage.border}`,
            padding: '3px 10px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pendingStage.dot }} />
            {pendingStage.label}
          </span>
        </div>

        {/* Top Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* 1. Dynamic Role-Based Submit Button (Only applicable for Manager, Director, and VP) */}
          {(() => {
            const roleConfig = getRoleSubmissionConfig(userRole);
            if (!roleConfig.hasReportSubmission) return null;
            return (
              <button
                onClick={handleSubmit}
                style={{
                  padding: '6px 16px',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  color: '#ffffff',
                  backgroundColor: '#D8001D',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 3px rgba(216, 0, 29, 0.28)',
                  transition: 'all 0.15s ease'
                }}
                title={`${roleConfig.reportSubmitLabel} for Leadership Approval`}
              >
                {roleConfig.baseRole === 'vp' ? (
                  <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                ) : (
                  <Send style={{ width: '13px', height: '13px' }} />
                )}
                <span>{roleConfig.reportSubmitLabel}</span>
              </button>
            );
          })()}

          {/* 2. Generate Executive summary */}
          <button
            onClick={handleGenerateExecSummary}
            style={{
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: '800',
              color: '#D8001D',
              backgroundColor: '#FFF1F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Sparkles style={{ width: '14px', height: '14px', color: '#D8001D' }} />
            <span>Generate Executive Summary</span>
          </button>

          {/* 3. Download PDF Button */}
          <button
            style={{
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: '800',
              color: '#1E40AF',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            title="Download PDF"
          >
            <Download style={{ width: '13px', height: '13px', color: '#1E40AF' }} />
            <span>Download PDF</span>
          </button>

          {/* 3b. Push to Teammate Button (For Director & VP only) */}
          {isDirectorOrVP && (
            <div
              style={{ position: 'relative', display: 'inline-flex' }}
              onMouseEnter={() => {
                if (isPushDisabled) setShowPushTooltip(true);
              }}
              onMouseLeave={() => setShowPushTooltip(false)}
            >
              <button
                disabled={isPushDisabled}
                onClick={() => {
                  if (!isPushDisabled) {
                    setToastMessage({
                      title: "Push to Teammate Initiated",
                      description: `Executive summary review for ${job?.fileName?.replace(/_/g, ' ') || execData.fileName} has been initiated and pushed to teammate.`
                    });
                  }
                }}
                style={{
                  padding: '6px 14px',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  color: isPushDisabled ? '#64748B' : '#6D28D9',
                  backgroundColor: isPushDisabled ? '#F1F5F9' : '#F5F3FF',
                  border: isPushDisabled ? '1.5px solid #CBD5E1' : '1.5px solid #DDD6FE',
                  borderRadius: '6px',
                  cursor: isPushDisabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isPushDisabled ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease',
                  opacity: isPushDisabled ? 0.75 : 1
                }}
                title={isPushDisabled ? pushTooltipText : "Push to Teammate"}
              >
                <Send style={{ width: '13px', height: '13px', color: isPushDisabled ? '#94A3B8' : '#7C3AED' }} />
                <span>Push to Teammate</span>
              </button>

              {/* Disabled Tooltip on Hover */}
              {isPushDisabled && showPushTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#0F172A',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    lineHeight: '1.35',
                    whiteSpace: 'nowrap',
                    zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    pointerEvents: 'none'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderBottom: '5px solid #0F172A'
                    }}
                  />
                  <span>Report contains critical issues, VP signoff is mandatory</span>
                </div>
              )}
            </div>
          )}

          {/* 4. Audit Report Button (inbetween Download PDF and Workflow) */}
          {onSwitchToAuditReport && (
            <button
              onClick={onSwitchToAuditReport}
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#475569',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Switch to Audit Report Studio"
            >
              <FileText style={{ width: '13px', height: '13px', color: '#64748B' }} />
              <span>Audit Report</span>
            </button>
          )}

          {/* 5. Workflow Button */}
          <button
            onClick={() => setIsWorkflowModalOpen(true)}
            style={{
              padding: '6px 14px',
              fontSize: '11.5px',
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
            <GitBranch style={{ width: '13px', height: '13px', color: isWorkflowModalOpen ? '#ffffff' : '#2563EB' }} />
            <span>Workflow</span>
          </button>

          {/* 6. Track Changes Button */}
          <button
            onClick={() => setIsLogsModalOpen(true)}
            style={{
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: '800',
              color: isLogsModalOpen ? '#ffffff' : '#D8001D',
              backgroundColor: isLogsModalOpen ? '#D8001D' : '#ffffff',
              border: '1.5px solid #D8001D',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            title="View Executive Report Field Changes & Audit History"
          >
            <History style={{ width: '13px', height: '13px', color: isLogsModalOpen ? '#ffffff' : '#D8001D' }} />
            <span>Track Changes</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Left Form Panel (45%) | Right Live HTML PDF Preview (55%) */}
      <div style={{
        height: 'calc(100vh - 106px)',
        maxHeight: 'calc(100vh - 106px)',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        overflow: 'hidden'
      }}>
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: EDITABLE ACCORDION SECTIONS                                   */}
        {/* ========================================================================= */}
        <div
          className="studio-left-panel"
          style={{
            width: '45%',
            height: 'calc(100vh - 106px)',
            maxHeight: 'calc(100vh - 106px)',
            borderRight: '1px solid #CBD5E1',
            backgroundColor: '#F8FAFC',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px 20px 100px 20px',
            boxSizing: 'border-box'
          }}
        >
          {/* ------------------------------------------------------------- */}
          {/* SECTION 1 ACCORDION: Scope Summary & Process Matrix (Page 1)  */}
          {/* ------------------------------------------------------------- */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #E2E8F0', 
            marginBottom: '12px',
            overflow: expandedSection === 'scope' ? 'visible' : 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'scope' ? null : 'scope')}
              style={{
                border: 'none',
                background: expandedSection === 'scope' ? '#FFF5F5' : '#ffffff',
                color: expandedSection === 'scope' ? '#D8001D' : '#1E293B',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                width: '100%',
                textAlign: 'left',
                borderBottom: expandedSection === 'scope' ? '1px solid #FCA5A5' : 'none',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Scope Summary &amp; Process Matrix</span>
              </div>
              {expandedSection === 'scope' ? <Minus style={{ width: '16px', height: '16px' }} /> : <Plus style={{ width: '16px', height: '16px' }} />}
            </button>

            {expandedSection === 'scope' && (
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#ffffff' }}>
                
                {/* a. Assessment Period */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                      Assessment Period:
                    </label>
                    {renderFieldCommentTrigger('scope_assessmentPeriod', 'Assessment Period')}
                  </div>
                  <input
                    type="text"
                    value={execData.scopeSummary.assessmentPeriod}
                    onChange={(e) => handleScopeChange('assessmentPeriod', e.target.value)}
                    placeholder="e.g. Q1 2026 – Q2 2026 (Jan 1, 2026 – Jun 30, 2026)"
                    style={{ width: '100%', height: '28px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>

                {/* b. Entity Sector & c. Entity Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                        Entity Sector:
                      </label>
                      {renderFieldCommentTrigger('scope_entitySector', 'Entity Sector')}
                    </div>
                    <input
                      type="text"
                      value={execData.scopeSummary.entitySector}
                      onChange={(e) => handleScopeChange('entitySector', e.target.value)}
                      placeholder="e.g. MedTech / Supply Chain & Operations"
                      style={{ width: '100%', height: '28px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                        Entity Location:
                      </label>
                      {renderFieldCommentTrigger('scope_entityLocation', 'Entity Location')}
                    </div>
                    <input
                      type="text"
                      value={execData.scopeSummary.entityLocation}
                      onChange={(e) => handleScopeChange('entityLocation', e.target.value)}
                      placeholder="e.g. Suzhou Plant & Regional Operations Hub"
                      style={{ width: '100%', height: '28px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* d. Metric */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                      Metric:
                    </label>
                    {renderFieldCommentTrigger('scope_metric', 'Metric')}
                  </div>
                  <input
                    type="text"
                    value={execData.scopeSummary.metric}
                    onChange={(e) => handleScopeChange('metric', e.target.value)}
                    placeholder="e.g. GxP Compliance, SOX 404 Controls & IT Access Security"
                    style={{ width: '100%', height: '28px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>

                {/* e. Objective Rich Text Editor */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                      Objective:
                    </label>
                    {renderFieldCommentTrigger('scope_objective', 'Objective')}
                  </div>
                  <RichTextEditor
                    value={execData.scopeSummary.objectiveHtml ?? (execData.scopeSummary.objectiveBullets ? `<ul>${execData.scopeSummary.objectiveBullets.map(b => `<li>${b}</li>`).join('')}</ul>` : '')}
                    onChange={(html) => handleScopeChange('objectiveHtml', html)}
                    placeholder="Enter objective notes, examples, and bullet points..."
                    minHeight="85px"
                  />
                </div>

                {/* f. Process Breakdown Matrix Table Editor (With Row-Level Comments) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                      Process Breakdown Matrix:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddProcessRow}
                      style={{
                        padding: '2px 8px',
                        fontSize: '10.5px',
                        fontWeight: '700',
                        color: '#D8001D',
                        backgroundColor: '#FFF1F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Plus style={{ width: '11px', height: '11px' }} />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #CBD5E1' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9', color: '#334155' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '800' }}>Process Title</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: '800', width: '42px', color: '#D8001D' }}>Crit</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: '800', width: '42px', color: '#D97706' }}>Maj</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: '800', width: '42px', color: '#047857' }}>Min</th>
                        <th style={{ padding: '6px 6px', textAlign: 'center', fontWeight: '800', width: '38px' }}>ALL</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: '800', width: '52px', color: '#475569' }} title="Row Level Comments">💬 Note</th>
                        <th style={{ width: '22px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {execData.scopeSummary.processMatrix.map((row, idx) => {
                        const isGrandTotal = idx === execData.scopeSummary.processMatrix.length - 1;
                        return (
                          <tr 
                            key={idx} 
                            style={{ 
                              borderBottom: '1px solid #E2E8F0', 
                              backgroundColor: isGrandTotal ? '#F8FAFC' : '#ffffff',
                              fontWeight: isGrandTotal ? '800' : 'normal'
                            }}
                          >
                            <td style={{ padding: '4px 8px' }}>
                              {isGrandTotal ? (
                                <span style={{ fontWeight: '800', color: '#0F172A' }}>{row.processTitle}</span>
                              ) : (
                                <input
                                  type="text"
                                  value={row.processTitle}
                                  onChange={(e) => handleProcessMatrixChange(idx, 'processTitle', e.target.value)}
                                  style={{ width: '100%', padding: '3px 4px', fontSize: '11px', border: '1px solid #E2E8F0', borderRadius: '3px' }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              {isGrandTotal ? (
                                <span style={{ fontWeight: '800' }}>{row.critical}</span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  value={row.critical}
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => handleProcessMatrixChange(idx, 'critical', e.target.value)}
                                  style={{ width: '36px', padding: '2px', fontSize: '11px', textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '3px' }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              {isGrandTotal ? (
                                <span style={{ fontWeight: '800' }}>{row.major}</span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  value={row.major}
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => handleProcessMatrixChange(idx, 'major', e.target.value)}
                                  style={{ width: '36px', padding: '2px', fontSize: '11px', textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '3px' }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              {isGrandTotal ? (
                                <span style={{ fontWeight: '800' }}>{row.minor}</span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  value={row.minor}
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => handleProcessMatrixChange(idx, 'minor', e.target.value)}
                                  style={{ width: '36px', padding: '2px', fontSize: '11px', textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '3px' }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: '800', color: isGrandTotal ? '#0F172A' : '#475569' }}>
                              {row.total}
                            </td>
                            {/* Row-Level Comment Trigger */}
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              {!isGrandTotal && renderFieldCommentTrigger(`processMatrix_row_${idx}`, row.processTitle || `Row ${idx + 1}`, true)}
                            </td>
                            <td style={{ padding: '2px', textAlign: 'center' }}>
                              {!isGrandTotal && execData.scopeSummary.processMatrix.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProcessRow(idx)}
                                  style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                                  title="Delete process row"
                                >
                                  <X style={{ width: '12px', height: '12px' }} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* g. Background Rich Text Editor */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                      Background:
                    </label>
                    {renderFieldCommentTrigger('scope_background', 'Background')}
                  </div>
                  <RichTextEditor
                    value={execData.scopeSummary.background || ''}
                    onChange={(html) => handleScopeChange('background', html)}
                    placeholder="Enter background section narrative..."
                    minHeight="100px"
                  />
                </div>

              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 2 ACCORDION: Audit Insights (Page 2)                 */}
          {/* ------------------------------------------------------------- */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #E2E8F0', 
            marginBottom: '12px',
            overflow: expandedSection === 'insights' ? 'visible' : 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'insights' ? null : 'insights')}
              style={{
                border: 'none',
                background: expandedSection === 'insights' ? '#FFF5F5' : '#ffffff',
                color: expandedSection === 'insights' ? '#D8001D' : '#1E293B',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                width: '100%',
                textAlign: 'left',
                borderBottom: expandedSection === 'insights' ? '1px solid #FCA5A5' : 'none',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Audit Insights</span>
              </div>
              {expandedSection === 'insights' ? <Minus style={{ width: '16px', height: '16px' }} /> : <Plus style={{ width: '16px', height: '16px' }} />}
            </button>

            {expandedSection === 'insights' && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff' }}>
                
                {/* Overall summary line */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', textDecoration: 'underline', color: '#0F172A' }}>Overall</span>
                    {renderFieldCommentTrigger('insights_overall', 'Overall Line')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      value={execData.auditInsights.overallText}
                      onChange={(e) => handleInsightsOverallChange(e.target.value)}
                      placeholder="for the processes reviewed, 1 critical, 1 major and 6 minor findings were identified..."
                      style={{ flex: 1, height: '32px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                {/* Audit Insights Narrative Rich Text Editor */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                      Audit Insights:
                    </label>
                    {renderFieldCommentTrigger('insights_narrative', 'Audit Insights')}
                  </div>
                  <RichTextEditor
                    value={
                      execData.auditInsights.narrativeHtml ??
                      (execData.auditInsights.paragraphs
                        ? execData.auditInsights.paragraphs.map(p => `<p>${p}</p>`).join('')
                        : '')
                    }
                    onChange={(html) => handleInsightsNarrativeChange(html)}
                    placeholder="Enter audit insights narrative paragraphs..."
                    minHeight="140px"
                  />
                </div>

              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 3 ACCORDION: Critical Issues / Major Issues (Page 2)  */}
          {/* ------------------------------------------------------------- */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #E2E8F0', 
            marginBottom: '12px',
            overflow: expandedSection === 'criticalMajor' ? 'visible' : 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'criticalMajor' ? null : 'criticalMajor')}
              style={{
                border: 'none',
                background: expandedSection === 'criticalMajor' ? '#FFF5F5' : '#ffffff',
                color: expandedSection === 'criticalMajor' ? '#D8001D' : '#1E293B',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                width: '100%',
                textAlign: 'left',
                borderBottom: expandedSection === 'criticalMajor' ? '1px solid #FCA5A5' : 'none',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Critical Issues / Major Issues</span>
              </div>
              {expandedSection === 'criticalMajor' ? <Minus style={{ width: '16px', height: '16px' }} /> : <Plus style={{ width: '16px', height: '16px' }} />}
            </button>

            {expandedSection === 'criticalMajor' && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff' }}>
                
                {/* Critical Issue */}
                <div style={{ backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#991B1B', marginBottom: '8px' }}>
                    Critical Issue:
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <label style={{ fontSize: '10.5px', fontWeight: '700', color: '#7F1D1D' }}>
                        Title:
                      </label>
                      {renderFieldCommentTrigger('criticalIssue_title', 'Critical Issue Title')}
                    </div>
                    <input
                      type="text"
                      value={execData.criticalMajorSection.criticalIssue.title}
                      onChange={(e) => handleIssueChange('criticalIssue', 'title', e.target.value)}
                      style={{ width: '100%', height: '30px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #FCA5A5', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <label style={{ fontSize: '10.5px', fontWeight: '700', color: '#7F1D1D' }}>
                        Description:
                      </label>
                      {renderFieldCommentTrigger('criticalIssue_description', 'Critical Issue Description')}
                    </div>
                    <textarea
                      rows={3}
                      value={execData.criticalMajorSection.criticalIssue.description}
                      onChange={(e) => handleIssueChange('criticalIssue', 'description', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #FCA5A5', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Major Issue */}
                <div style={{ backgroundColor: '#FFFBEB', padding: '12px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#92400E', marginBottom: '8px' }}>
                    Major Issue:
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <label style={{ fontSize: '10.5px', fontWeight: '700', color: '#78350F' }}>
                        Title:
                      </label>
                      {renderFieldCommentTrigger('majorIssue_title', 'Major Issue Title')}
                    </div>
                    <input
                      type="text"
                      value={execData.criticalMajorSection.majorIssue.title}
                      onChange={(e) => handleIssueChange('majorIssue', 'title', e.target.value)}
                      style={{ width: '100%', height: '30px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #FDE68A', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <label style={{ fontSize: '10.5px', fontWeight: '700', color: '#78350F' }}>
                        Description:
                      </label>
                      {renderFieldCommentTrigger('majorIssue_description', 'Major Issue Description')}
                    </div>
                    <textarea
                      rows={3}
                      value={execData.criticalMajorSection.majorIssue.description}
                      onChange={(e) => handleIssueChange('majorIssue', 'description', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #FDE68A', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE HTML PDF PREVIEW (MATCHING IMAGE 1 & IMAGE 2 VERBATIM) */}
        {/* ========================================================================= */}
        <div style={{
          width: '55%',
          height: 'calc(100vh - 106px)',
          maxHeight: 'calc(100vh - 106px)',
          backgroundColor: '#52525B', // Professional dark grey PDF viewer backdrop
          padding: '24px 20px',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>

          {/* Wrapper for PDF Pages */}
          <div style={{
            width: '100%',
            maxWidth: '794px', // Standard A4 width at 96 DPI
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>

            {/* ################################################################# */}
            {/* PAGE 1: EXACT MATCH TO FIRST IMAGE (Scope Summary, Matrix, Bg)    */}
            {/* ################################################################# */}
            <div style={{
                width: '100%',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                padding: '36px 36px 28px 36px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#000000',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '1000px',
                position: 'relative'
              }}>
                
                {/* Document Title (as requested: "it will have title under that as like first image...") */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '800', 
                    color: '#000000',
                    textAlign: 'left',
                    lineHeight: '1.2',
                    letterSpacing: '-0.2px'
                  }}>
                    {execData.fileName}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 1. SCOPE SUMMARY BOX                                          */}
                {/* ------------------------------------------------------------- */}
                <div style={{ marginBottom: '16px' }}>
                  {/* Scope Summary Banner Header (#8F8F8F / #969696) */}
                  <div style={{
                    backgroundColor: '#8F8F8F',
                    border: '1px solid #000000',
                    borderBottom: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '5px 10px',
                    letterSpacing: '0.2px'
                  }}>
                    Scope Summary
                  </div>

                  {/* Scope Summary Table (1px solid #000000 borders) */}
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11px',
                    border: '1px solid #000000',
                    tableLayout: 'fixed'
                  }}>
                    <tbody>
                      {/* Row 1: Assessment Period */}
                      <tr>
                        <td style={{
                          width: '160px',
                          padding: '5px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Assessment Period:
                        </td>
                        <td style={{
                          padding: '5px 8px',
                          color: '#000000',
                          border: '1px solid #000000'
                        }}>
                          {execData.scopeSummary.assessmentPeriod}
                        </td>
                      </tr>

                      {/* Row 2: Entity Sector */}
                      <tr>
                        <td style={{
                          padding: '5px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Entity Sector:
                        </td>
                        <td style={{
                          padding: '5px 8px',
                          color: '#000000',
                          border: '1px solid #000000'
                        }}>
                          {execData.scopeSummary.entitySector}
                        </td>
                      </tr>

                      {/* Row 3: Entity Location */}
                      <tr>
                        <td style={{
                          padding: '5px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Entity Location:
                        </td>
                        <td style={{
                          padding: '5px 8px',
                          color: '#000000',
                          border: '1px solid #000000'
                        }}>
                          {execData.scopeSummary.entityLocation}
                        </td>
                      </tr>

                      {/* Row 4: Metric */}
                      <tr>
                        <td style={{
                          padding: '5px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Metric:
                        </td>
                        <td style={{
                          padding: '5px 8px',
                          color: '#000000',
                          border: '1px solid #000000'
                        }}>
                          {execData.scopeSummary.metric}
                        </td>
                      </tr>

                      {/* Row 5: Objective */}
                      <tr>
                        <td style={{
                          padding: '6px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Objective:
                        </td>
                        <td style={{
                          padding: '6px 8px',
                          color: '#000000',
                          border: '1px solid #000000',
                          lineHeight: '1.4'
                        }}>
                          <div style={{ marginBottom: '3px', fontWeight: '500' }}>Examples:</div>
                          {execData.scopeSummary.objectiveHtml ? (
                            <div
                              className="rich-text-preview"
                              dangerouslySetInnerHTML={{ __html: execData.scopeSummary.objectiveHtml }}
                            />
                          ) : (
                            <ul style={{ margin: 0, paddingLeft: '18px' }}>
                              {(execData.scopeSummary.objectiveBullets || []).map((bullet, bIdx) => (
                                <li key={bIdx} style={{ marginBottom: bIdx === execData.scopeSummary.objectiveBullets.length - 1 ? 0 : '4px' }}>
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. PROCESS TITLE BREAKDOWN MATRIX (COLOR CODED HEADERS)       */}
                {/* ------------------------------------------------------------- */}
                <div style={{ marginBottom: '16px' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11.5px',
                    border: '1px solid #000000'
                  }}>
                    <thead>
                      <tr>
                        {/* Process Title: Grey #8F8F8F */}
                        <th style={{
                          backgroundColor: '#8F8F8F',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          fontSize: '12px'
                        }}>
                          Process Title
                        </th>

                        {/* Critical: Red #D8001D */}
                        <th style={{
                          backgroundColor: '#D8001D',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          width: '110px',
                          fontSize: '12px'
                        }}>
                          Critical
                        </th>

                        {/* Major: Yellow #F1B500 / #FFB900 */}
                        <th style={{
                          backgroundColor: '#F1B500',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          width: '110px',
                          fontSize: '12px'
                        }}>
                          Major
                        </th>

                        {/* Minor: Green #008000 */}
                        <th style={{
                          backgroundColor: '#008000',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          width: '110px',
                          fontSize: '12px'
                        }}>
                          Minor
                        </th>

                        {/* ALL: Grey #8F8F8F */}
                        <th style={{
                          backgroundColor: '#8F8F8F',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          width: '110px',
                          fontSize: '12px'
                        }}>
                          ALL
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {execData.scopeSummary.processMatrix.map((row, idx) => {
                        const isGrandTotal = idx === execData.scopeSummary.processMatrix.length - 1;
                        return (
                          <tr key={idx}>
                            {/* Process Title */}
                            <td style={{
                              padding: '6px 10px',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal',
                              wordBreak: 'break-word'
                            }}>
                              {row.processTitle}
                            </td>

                            {/* Critical count */}
                            <td style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal'
                            }}>
                              {formatMatrixVal(row.critical)}
                            </td>

                            {/* Major count */}
                            <td style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal'
                            }}>
                              {formatMatrixVal(row.major)}
                            </td>

                            {/* Minor count */}
                            <td style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal'
                            }}>
                              {formatMatrixVal(row.minor)}
                            </td>

                            {/* ALL total */}
                            <td style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal'
                            }}>
                              {formatMatrixVal(row.total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 3. BACKGROUND BOX                                             */}
                {/* ------------------------------------------------------------- */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                  {/* Background Banner Header (#8F8F8F / #969696) */}
                  <div style={{
                    backgroundColor: '#8F8F8F',
                    border: '1px solid #000000',
                    borderBottom: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '5px 10px',
                    letterSpacing: '0.2px'
                  }}>
                    Background
                  </div>

                  {/* Background Content Box */}
                  <div style={{
                    border: '1px solid #000000',
                    backgroundColor: '#ffffff',
                    padding: '14px',
                    minHeight: '200px',
                    flex: 1,
                    fontSize: '11px',
                    lineHeight: '1.45',
                    color: '#000000',
                    boxSizing: 'border-box'
                  }}>
                    {execData.scopeSummary.background ? (
                      <div 
                        className="rich-text-preview"
                        dangerouslySetInnerHTML={{ __html: execData.scopeSummary.background }}
                      />
                    ) : (
                      <div style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                        (Background notes and operational context)
                      </div>
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PAGE 1 FOOTER: Red Johnson & Johnson script logo              */}
                {/* ------------------------------------------------------------- */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '16px',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  {/* Iconic Red Johnson & Johnson script logo */}
                  <div style={{
                    color: '#D8001D',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    fontSize: '15px',
                    letterSpacing: '-0.2px'
                  }}>
                    Johnson &amp; Johnson
                  </div>

                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    Page 1 of 2
                  </div>
                </div>

              </div>

            {/* ################################################################# */}
            {/* PAGE 2: EXACT MATCH TO SECOND IMAGE (Audit Insights & Issues)     */}
            {/* ################################################################# */}
            <div style={{
                width: '100%',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                padding: '36px 36px 28px 36px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#000000',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '1000px',
                position: 'relative'
              }}>
                
                {/* Header line on Page 2 */}
                <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
                    {execData.fileName}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                    Section 2: Insights &amp; Findings
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 1. AUDIT INSIGHTS BOX                                         */}
                {/* ------------------------------------------------------------- */}
                <div style={{ marginBottom: '18px' }}>
                  {/* Banner Header: Audit Insights (#8F8F8F) */}
                  <div style={{
                    backgroundColor: '#8F8F8F',
                    border: '1px solid #000000',
                    borderBottom: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '5px 10px',
                    letterSpacing: '0.2px'
                  }}>
                    Audit Insights
                  </div>

                  {/* Audit Insights Content Box */}
                  <div style={{
                    border: '1px solid #000000',
                    backgroundColor: '#ffffff',
                    padding: '12px 14px',
                    fontSize: '11px',
                    lineHeight: '1.45',
                    color: '#000000'
                  }}>
                    {/* First line: Overall underlined */}
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ textDecoration: 'underline', fontWeight: '700' }}>Overall</span>{' '}
                      <span>{execData.auditInsights.overallText}</span>
                    </div>

                    {/* Narrative paragraphs with rich text support */}
                    {execData.auditInsights.narrativeHtml ? (
                      <div
                        className="rich-text-preview"
                        dangerouslySetInnerHTML={{ __html: execData.auditInsights.narrativeHtml }}
                      />
                    ) : (
                      (execData.auditInsights.paragraphs || []).map((para, pIdx) => (
                        <p key={pIdx} style={{ margin: '0 0 10px 0', lineHeight: '1.45' }}>
                          {para}
                        </p>
                      ))
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. CRITICAL ISSUES / MAJOR ISSUES BOX                         */}
                {/* ------------------------------------------------------------- */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                  {/* Banner Header: Critical Issues /Major Issues (#8F8F8F) */}
                  <div style={{
                    backgroundColor: '#8F8F8F',
                    border: '1px solid #000000',
                    borderBottom: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '5px 10px',
                    letterSpacing: '0.2px'
                  }}>
                    Critical Issues /Major Issues
                  </div>

                  {/* Content Box */}
                  <div style={{
                    border: '1px solid #000000',
                    backgroundColor: '#ffffff',
                    padding: '12px 14px',
                    fontSize: '11px',
                    lineHeight: '1.45',
                    color: '#000000',
                    flex: 1
                  }}>
                    {/* Critical Issues Subheading & Details */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontWeight: '700', fontSize: '12px', color: '#000000', marginBottom: '4px' }}>
                        Critical Issues
                      </div>
                      <div style={{ fontWeight: '400', color: '#000000', marginBottom: '3px' }}>
                        {execData.criticalMajorSection.criticalIssue.title}
                      </div>
                      <div style={{ color: '#000000', lineHeight: '1.45' }}>
                        {execData.criticalMajorSection.criticalIssue.description}
                      </div>
                    </div>

                    {/* Major Issues Subheading & Details */}
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '12px', color: '#000000', marginBottom: '4px' }}>
                        Major Issues
                      </div>
                      <div style={{ fontWeight: '400', color: '#000000', marginBottom: '3px' }}>
                        {execData.criticalMajorSection.majorIssue.title}
                      </div>
                      <div style={{ color: '#000000', lineHeight: '1.45' }}>
                        {execData.criticalMajorSection.majorIssue.description}
                      </div>
                    </div>

                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PAGE 2 FOOTER: Red Johnson & Johnson script logo              */}
                {/* ------------------------------------------------------------- */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '16px',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  {/* Iconic Red Johnson & Johnson script logo */}
                  <div style={{
                    color: '#D8001D',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    fontSize: '15px',
                    letterSpacing: '-0.2px'
                  }}>
                    Johnson &amp; Johnson
                  </div>

                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    Page 2 of 2
                  </div>
                </div>

              </div>
          </div>

        </div>

      </div>

      {/* Executive Report Field Edits / Track Changes Modal Popover */}
      <IssueLogsModal
        isOpen={isLogsModalOpen}
        report={job || { fileName: execData.fileName }}
        onClose={() => setIsLogsModalOpen(false)}
        title={`Track Changes — ${job?.fileName || execData.fileName}`}
        category="Executive Report Field Edits"
        description="Audit trail and field edit history for Executive Summary sections"
        logs={execLogs}
      />

      {/* Workflow Stages Drawer */}
      <WorkflowModal
        isOpen={isWorkflowModalOpen}
        title="Executive Summary Workflow"
        report={job || { fileName: execData.fileName }}
        onClose={() => setIsWorkflowModalOpen(false)}
      />

      {/* Embedded CSS Keyframes for Toast Animations */}
      <style>{`
        @keyframes slideUpToast {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes toastPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      {/* Premium Enterprise Toast Notification (matching issue creation toaster) */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            minWidth: '380px',
            maxWidth: '450px',
            backgroundColor: '#0F172A',
            color: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #10B981',
            boxShadow: '0 14px 36px rgba(15, 23, 42, 0.45), 0 0 24px rgba(16, 185, 129, 0.25)',
            animation: 'slideUpToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#064E3B',
              border: '1.5px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'toastPulse 2s infinite'
            }}>
              <CheckCircle2 style={{ width: '18px', height: '18px', color: '#34D399' }} />
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '0.2px' }}>
                {toastMessage.title}
              </h4>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#94A3B8', lineHeight: '1.45' }}>
                {toastMessage.description}
              </p>
            </div>

            <button
              onClick={() => setToastMessage(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
              title="Dismiss notification"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          <div style={{ width: '100%', height: '3px', backgroundColor: '#1E293B', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              backgroundColor: '#10B981',
              animation: 'toastProgress 4.5s linear forwards'
            }} />
          </div>
        </div>
      )}

    </div>
  );
}
