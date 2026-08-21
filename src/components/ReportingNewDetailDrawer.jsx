import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, FileText, Download, GitBranch, History, PlayCircle,
  MessageSquare, Calendar, CheckCircle2, Clock, ShieldCheck, ArrowRight, X,
  Cpu, TrendingUp, AlertOctagon, ChevronDown, Shield
} from 'lucide-react';

const formatUSDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-';
  const cleanStr = dateTimeStr.replace(' ', 'T');
  const dateObj = new Date(cleanStr);
  if (isNaN(dateObj.getTime())) return dateTimeStr;

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${formattedDate}, ${formattedTime}`;
};

const renderPremiumStatusPill = (statusText) => {
  const s = (statusText || '').toLowerCase();

  if (s === 'completed') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2.5px 8px',
        borderRadius: '5px',
        fontSize: '10.5px',
        fontWeight: '700',
        color: '#047857',
        backgroundColor: '#ECFDF5',
        border: '1px solid #A7F3D0',
        boxShadow: '0 1px 2px rgba(16, 185, 129, 0.06)',
        letterSpacing: '0.01em'
      }}>
        <span style={{ width: '5.5px', height: '5.5px', borderRadius: '50%', backgroundColor: '#10B981' }} />
        <span>Completed</span>
      </span>
    );
  }

  if (s === 'in progress' || s === 'inprogress') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2.5px 8px',
        borderRadius: '5px',
        fontSize: '10.5px',
        fontWeight: '700',
        color: '#1D4ED8',
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        boxShadow: '0 1px 2px rgba(37, 99, 235, 0.06)',
        letterSpacing: '0.01em'
      }}>
        <span style={{ width: '5.5px', height: '5.5px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
        <span>In Progress</span>
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '2.5px 8px',
      borderRadius: '5px',
      fontSize: '10.5px',
      fontWeight: '700',
      color: '#475569',
      backgroundColor: '#F8FAFC',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 2px rgba(100, 116, 139, 0.04)',
      letterSpacing: '0.01em'
    }}>
      <span style={{ width: '5.5px', height: '5.5px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
      <span>Not Started</span>
    </span>
  );
};

const getAuditReportPillStatus = (job) => {
  if (job.status === 'Completed') return 'Completed';
  if (['Audit Report Completed', 'Executive Report In Progress', 'Executive Report Completed'].includes(job.subStatus)) {
    return 'Completed';
  }
  if (job.status === 'Not Started') return 'Not Started';
  return 'In Progress';
};

const getExecReportPillStatus = (job) => {
  if (job.status === 'Completed' || job.subStatus === 'Executive Report Completed') return 'Completed';
  if (job.subStatus === 'Executive Report In Progress') return 'In Progress';
  return 'Not Started';
};

export default function ReportingNewDetailDrawer({
  isOpen,
  job,
  userRole = 'manager',
  onClose,
  onOpenDiscussionPoints,
  onOpenCreateIssue,
  onOpenWorkflow,
  onOpenHistory,
  onWorkOnReport
}) {
  const isAuditor = userRole === 'auditor';
  const [isAuditWorkflowOpen, setIsAuditWorkflowOpen] = useState(false);
  const [isExecWorkflowOpen, setIsExecWorkflowOpen] = useState(false);

  const [isAuditMenuOpen, setIsAuditMenuOpen] = useState(false);
  const [isExecMenuOpen, setIsExecMenuOpen] = useState(false);

  const auditMenuRef = useRef(null);
  const execMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (auditMenuRef.current && !auditMenuRef.current.contains(event.target)) {
        setIsAuditMenuOpen(false);
      }
      if (execMenuRef.current && !execMenuRef.current.contains(event.target)) {
        setIsExecMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !job) return null;

  const { auditReport, executiveSummaryReport, discussionPoints } = job;

  return (
    <>
      <aside style={{
        width: '480px',
        maxWidth: '90vw',
        height: '100%',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid var(--slate-200)',
        borderTop: 'none',
        marginTop: 0,
        paddingTop: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-6px 0 16px rgba(0,0,0,0.06)',
        animation: 'slideInRight 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        position: 'relative'
      }}>

        {/* Full-Width Dark Header Bar starting at y = 0 */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#ffffff',
          padding: '16px 20px',
          marginTop: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
          flexShrink: 0
        }}>
          {/* Back Arrow Button + Audit Name Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '6px',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              title="Back to Audit Queue"
            >
              <ArrowLeft style={{ width: '18px', height: '18px' }} />
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.2px', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {job.fileName}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content (Stacked Sections) */}
        <div style={{ padding: '22px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* SECTION 1: ISSUES (Shown ONLY for Auditor role) */}
          {isAuditor && (
            <div style={{
              backgroundColor: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '16px',
              boxShadow: '0 6px 20px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Header Row: Title + Action Button Right-Aligned (Only when Started) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <MessageSquare style={{ width: '17px', height: '17px', color: '#D8001D', flexShrink: 0 }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#991B1B', margin: 0, whiteSpace: 'nowrap' }}>
                    Issues
                  </h3>
                </div>

                {/* Action Button Right-Aligned on Header Row (Only shown when In Progress or Completed) */}
                {job.status !== 'Not Started' && (
                  <button
                    onClick={() => onOpenDiscussionPoints && onOpenDiscussionPoints(job)}
                    style={{
                      padding: '7px 12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      color: '#1D4ED8',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                  >
                    <MessageSquare style={{ width: '14px', height: '14px' }} />
                    <span>Open Issues ({discussionPoints?.count || 3})</span>
                  </button>
                )}
              </div>

              {/* Details Content Below */}
              {job.status === 'Not Started' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '6px' }}>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                    No issues logged yet for this audit. Click below to add an issue.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <button
                      onClick={() => {
                        if (isAuditor && job.status === 'Not Started' && onOpenCreateIssue) {
                          onOpenCreateIssue(job);
                        } else if (onOpenDiscussionPoints) {
                          onOpenDiscussionPoints(job);
                        }
                      }}
                      style={{
                        padding: '9px 24px',
                        width: '80%',
                        fontSize: '12px',
                        fontWeight: '800',
                        color: '#1D4ED8',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                    >
                      <MessageSquare style={{ width: '14px', height: '14px' }} />
                      <span>Start with Add Issue</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: 'transparent', border: 'none', padding: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748B' }}>Started On</span>
                    <strong style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>
                      {formatUSDateTime(discussionPoints?.startDateTime)}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 'none', paddingTop: '4px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748B' }}>Last Updated On</span>
                    <strong style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>
                      {formatUSDateTime(discussionPoints?.endDateTime)}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 'none', paddingTop: '4px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748B' }}>Last Updated By</span>
                    <strong style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>
                      {job.currentOwner || "Rachel Green"}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: AUDIT REPORT (Hidden when status is Not Started or when Auditor role) */}

          {/* SECTION 2: AUDIT REPORT (Hidden when status is Not Started or when Auditor role) */}
          {job.status !== 'Not Started' && !isAuditor && (
            <div style={{
              backgroundColor: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '16px',
              boxShadow: '0 6px 20px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Header Area: Title on Left, Action Button on Right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                {/* Left: Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <FileText style={{ width: '17px', height: '17px', color: '#D8001D', flexShrink: 0 }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#991B1B', margin: 0, whiteSpace: 'nowrap' }}>
                    Audit Report
                  </h3>
                </div>

                {/* Right: Action Button */}
                <div ref={auditMenuRef} style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
                  <button
                    onClick={() => onWorkOnReport && onWorkOnReport(job, 'audit')}
                    style={{
                      padding: '7px 11px',
                      fontSize: '12px',
                      fontWeight: '800',
                      color: '#1D4ED8',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRight: 'none',
                      borderTopLeftRadius: '6px',
                      borderBottomLeftRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                  >
                    <PlayCircle style={{ width: '14px', height: '14px' }} />
                    <span>Work On Report</span>
                  </button>

                  <div style={{ width: '1px', backgroundColor: '#BFDBFE' }} />

                  <button
                    onClick={() => setIsAuditMenuOpen(!isAuditMenuOpen)}
                    style={{
                      padding: '7px 9px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderLeft: 'none',
                      borderTopRightRadius: '6px',
                      borderBottomRightRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1D4ED8',
                      boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                    title="More Options"
                  >
                    <ChevronDown style={{
                      width: '14px',
                      height: '14px',
                      transform: isAuditMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease'
                    }} />
                  </button>

                  {isAuditMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      zIndex: 100,
                      minWidth: '190px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      animation: 'fadeIn 0.15s ease-out'
                    }}>
                      <button
                        onClick={() => {
                          alert(`Downloading Audit Report for ${job.id}`);
                          setIsAuditMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#334155',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Download style={{ width: '15px', height: '15px', color: '#2563EB' }} />
                        <span>Download Report</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsAuditWorkflowOpen(true);
                          setIsAuditMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#334155',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <GitBranch style={{ width: '15px', height: '15px', color: '#2563EB' }} />
                        <span>View Workflow</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenHistory && onOpenHistory(job);
                          setIsAuditMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#334155',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <History style={{ width: '15px', height: '15px', color: '#6366F1' }} />
                        <span>View History</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transparent Details Container Below */}
              <div style={{ backgroundColor: 'transparent', border: 'none', padding: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748B' }}>Status</span>
                  {renderPremiumStatusPill(getAuditReportPillStatus(job))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 'none', paddingTop: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748B' }}>Validation Started On</span>
                  <strong style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(auditReport?.validationStartDateTime)}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 'none', paddingTop: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748B' }}>Validation Ended On</span>
                  <strong style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(auditReport?.validationEndDateTime)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: EXECUTIVE REPORT (Visible only after Audit Report Completed subStatus) */}
          {[
            'Audit Report Completed',
            'Executive Report In Progress',
            'Executive Report Completed'
          ].includes(job.subStatus || (job.status === 'Completed' ? 'Executive Report Completed' : '')) && !isAuditor && (
            <div style={{
              backgroundColor: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '16px',
              boxShadow: '0 6px 20px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.07)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Header Area: Title on Left, Action Button on Right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                {/* Left: Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <ShieldCheck style={{ width: '17px', height: '17px', color: '#D8001D', flexShrink: 0 }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#991B1B', margin: 0, whiteSpace: 'nowrap' }}>
                    Executive Report
                  </h3>
                </div>

                {/* Right: Action Button */}
                <div ref={execMenuRef} style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
                  <button
                    onClick={() => onWorkOnReport && onWorkOnReport(job, 'executive')}
                    style={{
                      padding: '7px 11px',
                      fontSize: '12px',
                      fontWeight: '800',
                      color: '#1D4ED8',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRight: 'none',
                      borderTopLeftRadius: '6px',
                      borderBottomLeftRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                  >
                    <PlayCircle style={{ width: '14px', height: '14px' }} />
                    <span>Work On Report</span>
                  </button>

                  <div style={{ width: '1px', backgroundColor: '#BFDBFE' }} />

                  <button
                    onClick={() => setIsExecMenuOpen(!isExecMenuOpen)}
                    style={{
                      padding: '7px 9px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderLeft: 'none',
                      borderTopRightRadius: '6px',
                      borderBottomRightRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1D4ED8',
                      boxShadow: '0 1px 3px rgba(37, 99, 235, 0.08)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                    title="More Options"
                  >
                    <ChevronDown style={{
                      width: '14px',
                      height: '14px',
                      transform: isExecMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease'
                    }} />
                  </button>

                  {isExecMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      zIndex: 100,
                      minWidth: '190px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      animation: 'fadeIn 0.15s ease-out'
                    }}>
                      <button
                        onClick={() => {
                          alert(`Downloading Executive Summary Report for ${job.id}`);
                          setIsExecMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#334155',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Download style={{ width: '15px', height: '15px', color: '#059669' }} />
                        <span>Download Report</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsExecWorkflowOpen(true);
                          setIsExecMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#334155',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <GitBranch style={{ width: '15px', height: '15px', color: '#059669' }} />
                        <span>View Workflow</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenHistory && onOpenHistory(job);
                          setIsExecMenuOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#334155',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <History style={{ width: '15px', height: '15px', color: '#6366F1' }} />
                        <span>View History</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Transparent Details Container Below */}
              <div style={{ backgroundColor: 'transparent', border: 'none', padding: '10px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748B' }}>Status</span>
                  {renderPremiumStatusPill(getExecReportPillStatus(job))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 'none', paddingTop: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748B' }}>Validation Started On</span>
                  <strong style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(executiveSummaryReport?.validationStartDateTime)}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 'none', paddingTop: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748B' }}>Validation Ended On</span>
                  <strong style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(executiveSummaryReport?.validationEndDateTime)}</strong>
                </div>
              </div>
            </div>
          )}

        </div>
      </aside>

      {/* ========================================================================================= */}
      {/* AUDIT REPORT WORKFLOW OVERLAY DRAWER (Two Graphs: IT Issues vs FinOps Issues + Ratio Counts) */}
      {/* ========================================================================================= */}
      {isAuditWorkflowOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1300
          }}
          onClick={() => setIsAuditWorkflowOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '820px',
              maxWidth: '96vw',
              height: '100vh',
              backgroundColor: '#ffffff',
              boxShadow: '-12px 0 36px rgba(0,0,0,0.28)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 24px', backgroundColor: '#0F172A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setIsAuditWorkflowOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Back to Detail Drawer"
                >
                  <ArrowLeft style={{ width: '20px', height: '20px' }} />
                </button>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: '#60A5FA', letterSpacing: '0.2px' }}>
                    Audit Report Workflow Pipeline (IT &amp; FinOps Dual Graphs)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{job.fileName || job.id}</span>
                </div>
              </div>

              <button
                onClick={() => setIsAuditWorkflowOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                title="Close Workflow Overlay"
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Scrollable Workflow Content */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* GRAPH 1: IT ISSUES WORKFLOW GRAPH (6 ISSUES) */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '22px 20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                    <span>IT Issues Workflow Graph (6 Total Issues)</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #BFDBFE' }}>
                    TC: 6/6 | Manager: 3/6
                  </span>
                </div>

                {/* IT Pipeline Diagram Canvas */}
                <div style={{ position: 'relative', width: '100%', minHeight: '190px' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                      <marker id="arrowIT" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563EB" />
                      </marker>
                    </defs>
                    {/* TC (0%) to Audit Manager (26%) */}
                    <line x1="85" y1="35" x2="200" y2="35" stroke="#2563EB" strokeWidth="3" markerEnd="url(#arrowIT)" />
                    {/* Audit Manager (26%) to Director (56%) */}
                    <line x1="330" y1="35" x2="430" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    {/* Director (56%) to Final Report (82%) */}
                    <line x1="530" y1="35" x2="600" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    {/* Branch: Audit Manager down to Management Response */}
                    <path d="M 265 55 L 265 130 L 430 130" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    {/* Link: Director to Management Response */}
                    <line x1="480" y1="58" x2="480" y2="115" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                  </svg>

                  {/* IT Nodes */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {/* Node 1: TC */}
                    <div style={{ position: 'absolute', left: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2px solid #2563EB', borderRadius: '10px', padding: '6px 12px', boxShadow: '0 4px 12px rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '900', color: '#0F172A' }}>TC</div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#2563EB' }}>Completed (6/6 issues)</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 2: Audit Manager */}
                    <div style={{ position: 'absolute', left: '26%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2.5px solid #D8001D', borderRadius: '10px', padding: '6px 12px', boxShadow: '0 4px 16px rgba(216,0,29,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#FFF0F2', color: '#D8001D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '900', color: '#0F172A' }}>Audit Manager</div>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#D8001D', backgroundColor: '#FFF0F2', padding: '1px 6px', borderRadius: '4px', border: '1px solid #FCA5A5' }}>
                            Inprogress (3/6 issues)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Node 3: Director */}
                    <div style={{ position: 'absolute', left: '56%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>3</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Director</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started (0/6 issues)</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 4: Final Report */}
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>5</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Final Report</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started (0/6 issues)</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 5: Management Response */}
                    <div style={{ position: 'absolute', left: '52%', top: '105px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>4</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Management Response</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started (0/6 issues)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRAPH 2: FINOPS ISSUES WORKFLOW GRAPH (4 ISSUES) */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '22px 20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp style={{ width: '18px', height: '18px', color: '#059669' }} />
                    <span>FinOps Issues Workflow Graph (4 Total Issues)</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #A7F3D0' }}>
                    TC: 4/4 | Manager: 2/4
                  </span>
                </div>

                {/* FinOps Pipeline Diagram Canvas */}
                <div style={{ position: 'relative', width: '100%', minHeight: '190px' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                      <marker id="arrowFin" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
                      </marker>
                    </defs>
                    {/* TC (0%) to Audit Manager (26%) */}
                    <line x1="85" y1="35" x2="200" y2="35" stroke="#059669" strokeWidth="3" markerEnd="url(#arrowFin)" />
                    {/* Audit Manager (26%) to Director (56%) */}
                    <line x1="330" y1="35" x2="430" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    {/* Director (56%) to Final Report (82%) */}
                    <line x1="530" y1="35" x2="600" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    {/* Branch: Audit Manager down to Management Response */}
                    <path d="M 265 55 L 265 130 L 430 130" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    {/* Link: Director to Management Response */}
                    <line x1="480" y1="58" x2="480" y2="115" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                  </svg>

                  {/* FinOps Nodes */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {/* Node 1: TC */}
                    <div style={{ position: 'absolute', left: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2px solid #059669', borderRadius: '10px', padding: '6px 12px', boxShadow: '0 4px 12px rgba(5,150,105,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '900', color: '#0F172A' }}>TC</div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#059669' }}>Completed (4/4 issues)</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 2: Audit Manager */}
                    <div style={{ position: 'absolute', left: '26%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2.5px solid #7C3AED', borderRadius: '10px', padding: '6px 12px', boxShadow: '0 4px 16px rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '900', color: '#0F172A' }}>Audit Manager</div>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#7C3AED', backgroundColor: '#F3E8FF', padding: '1px 6px', borderRadius: '4px', border: '1px solid #DDD6FE' }}>
                            Inprogress (2/4 issues)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Node 3: Director */}
                    <div style={{ position: 'absolute', left: '56%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>3</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Director</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started (0/4 issues)</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 4: Final Report */}
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>5</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Final Report</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started (0/4 issues)</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 5: Management Response */}
                    <div style={{ position: 'absolute', left: '52%', top: '105px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>4</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Management Response</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started (0/4 issues)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CATEGORIZED ISSUE-LEVEL & ROLE-LEVEL WORKFLOW STATUS TABLES */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', margin: 0, borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                  <span>Issue &amp; Role Level Workflow Status Matrix</span>
                </h4>

                {/* CATEGORY 1: IT ISSUES WORKFLOW STATUS */}
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E3A8A', backgroundColor: '#EFF6FF', padding: '6px 12px', borderRadius: '6px', marginBottom: '8px', borderLeft: '4px solid #2563EB' }}>
                    💻 IT Category Issues Workflow Status
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', color: '#475569', borderBottom: '1px solid #CBD5E1' }}>
                        <th style={{ padding: '8px 12px', fontWeight: '800' }}>Issue ID &amp; Title</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '110px' }}>TC Auditor</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '130px' }}>Audit Manager</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '120px' }}>Director</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '120px' }}>Overall Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>ISSUE-001: DHL &amp; HCL account disabling delay</td>
                        <td style={{ padding: '8px 12px', color: '#166534', fontWeight: '700' }}>✓ Completed</td>
                        <td style={{ padding: '8px 12px', color: '#D8001D', fontWeight: '700' }}>⏳ In Progress</td>
                        <td style={{ padding: '8px 12px', color: '#94A3B8' }}>Pending</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '10.5px', fontWeight: '700', color: '#991B1B', backgroundColor: '#FEF2F2', padding: '2px 8px', borderRadius: '4px' }}>Pending TC</span></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>ISSUE-002: Line 3 telemetry gain calibration drift</td>
                        <td style={{ padding: '8px 12px', color: '#166534', fontWeight: '700' }}>✓ Completed</td>
                        <td style={{ padding: '8px 12px', color: '#D8001D', fontWeight: '700' }}>⏳ In Progress</td>
                        <td style={{ padding: '8px 12px', color: '#94A3B8' }}>Pending</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '10.5px', fontWeight: '700', color: '#991B1B', backgroundColor: '#FEF2F2', padding: '2px 8px', borderRadius: '4px' }}>Pending TC</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>ISSUE-003: Cleanroom HVAC temperature excursion</td>
                        <td style={{ padding: '8px 12px', color: '#166534', fontWeight: '700' }}>✓ Completed</td>
                        <td style={{ padding: '8px 12px', color: '#2563EB', fontWeight: '700' }}>⏳ In Progress</td>
                        <td style={{ padding: '8px 12px', color: '#94A3B8' }}>Pending</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '10.5px', fontWeight: '700', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>In progress TC</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* CATEGORY 2: FINOPS ISSUES WORKFLOW STATUS */}
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#065F46', backgroundColor: '#ECFDF5', padding: '6px 12px', borderRadius: '6px', marginBottom: '8px', borderLeft: '4px solid #059669' }}>
                    📊 FinOps Category Issues Workflow Status
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', color: '#475569', borderBottom: '1px solid #CBD5E1' }}>
                        <th style={{ padding: '8px 12px', fontWeight: '800' }}>Issue ID &amp; Title</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '110px' }}>TC Auditor</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '130px' }}>Audit Manager</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '120px' }}>Director</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '120px' }}>Overall Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>ISSUE-004: Third-party vendor GxP access log policy</td>
                        <td style={{ padding: '8px 12px', color: '#166534', fontWeight: '700' }}>✓ Completed</td>
                        <td style={{ padding: '8px 12px', color: '#7C3AED', fontWeight: '700' }}>⏳ In Progress</td>
                        <td style={{ padding: '8px 12px', color: '#94A3B8' }}>Pending</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '10.5px', fontWeight: '700', color: '#991B1B', backgroundColor: '#FEF2F2', padding: '2px 8px', borderRadius: '4px' }}>Pending Manager</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>ISSUE-005: Un-reconciled material scrap variance</td>
                        <td style={{ padding: '8px 12px', color: '#166534', fontWeight: '700' }}>✓ Completed</td>
                        <td style={{ padding: '8px 12px', color: '#7C3AED', fontWeight: '700' }}>⏳ In Progress</td>
                        <td style={{ padding: '8px 12px', color: '#94A3B8' }}>Pending</td>
                        <td style={{ padding: '8px 12px' }}><span style={{ fontSize: '10.5px', fontWeight: '700', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>In progress Manager</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* EXECUTIVE SUMMARY WORKFLOW OVERLAY DRAWER                                                */}
      {/* ========================================================================================= */}
      {isExecWorkflowOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1300
          }}
          onClick={() => setIsExecWorkflowOpen(false)}
        >
          {/* Extra-Wide 780px Right Overlay Drawer Panel */}
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '780px',
              maxWidth: '96vw',
              height: '100vh',
              backgroundColor: '#ffffff',
              boxShadow: '-12px 0 36px rgba(0,0,0,0.28)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}
          >
            {/* Dark Overlay Header */}
            <div style={{ padding: '18px 24px', backgroundColor: '#0F172A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setIsExecWorkflowOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Back to Detail Drawer"
                >
                  <ArrowLeft style={{ width: '20px', height: '20px' }} />
                </button>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: '#38BDF8', letterSpacing: '0.2px' }}>
                    Executive Summary Workflow Pipeline
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{job.fileName || job.id}</span>
                </div>
              </div>

              <button
                onClick={() => setIsExecWorkflowOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                title="Close Workflow Overlay"
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Workflow Diagram & Status Content */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC' }}>

              {/* Premium Executive Workflow Stage Graph Card */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '24px 22px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GitBranch style={{ width: '18px', height: '18px', color: '#D8001D' }} />
                    <span>Executive Workflow Stage Graph</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#D8001D', backgroundColor: '#FFF0F2', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #FCA5A5' }}>
                    Stage 2 of 5 Active
                  </span>
                </div>

                {/* RESPONSIVE SVG & NODE PIPELINE CANVAS (Width 780px generous spacing) */}
                <div style={{ position: 'relative', width: '100%', minHeight: '210px', padding: '10px 0' }}>

                  {/* SVG Connector Lines */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#CBD5E1" />
                      </marker>
                      <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#22C55E" />
                      </marker>
                    </defs>

                    {/* Connection 1: TC to Audit Manager (Solid Green) */}
                    <line x1="80" y1="35" x2="190" y2="35" stroke="#22C55E" strokeWidth="3" markerEnd="url(#arrowGreen)" />

                    {/* Connection 2: Audit Manager to Director */}
                    <line x1="330" y1="35" x2="420" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />

                    {/* Connection 3: Director to Final Report */}
                    <line x1="510" y1="35" x2="575" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />

                    {/* Branch Path: Audit Manager down to Management Response */}
                    <path d="M 260 55 L 260 135 L 420 135" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />

                    {/* Vertical Link: Director to Management Response */}
                    <line x1="465" y1="58" x2="465" y2="120" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                  </svg>

                  {/* HTML NODE MINI-CARDS WITH RESPONSIVE PERCENTAGE SPACING */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

                    {/* Node 1: TC */}
                    <div style={{ position: 'absolute', left: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{
                        backgroundColor: '#ffffff',
                        border: '2px solid #22C55E',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 12px rgba(34,197,94,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 style={{ width: '15px', height: '15px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A' }}>TC</div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#15803D' }}>Completed</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 2: Audit Manager (ACTIVE FOCUS NODE) */}
                    <div style={{ position: 'absolute', left: '26%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{
                        backgroundColor: '#ffffff',
                        border: '2.5px solid #D8001D',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        boxShadow: '0 4px 16px rgba(216,0,29,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#FFF0F2', color: '#D8001D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock style={{ width: '16px', height: '16px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A' }}>Audit Manager</div>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#D8001D', backgroundColor: '#FFF0F2', padding: '1px 6px', borderRadius: '4px', border: '1px solid #FCA5A5' }}>
                            In Progress
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Node 3: Director */}
                    <div style={{ position: 'absolute', left: '57%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                          3
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569' }}>Director</div>
                          <div style={{ fontSize: '10px', fontWeight: '600', color: '#94A3B8' }}>Not Started</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 4: Final Report (FITS SAFELY INSIDE CARD CONTAINER WITH NO OVERFLOW!) */}
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                          5
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569' }}>Final Report</div>
                          <div style={{ fontSize: '10px', fontWeight: '600', color: '#94A3B8' }}>Not Started</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 5: Management Response (Branched Below Director) */}
                    <div style={{ position: 'absolute', left: '52%', top: '110px', pointerEvents: 'auto' }}>
                      <div style={{
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                          4
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569' }}>Management Response</div>
                          <div style={{ fontSize: '10px', fontWeight: '600', color: '#94A3B8' }}>Not Started</div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Detailed Stage Audit Log Cards */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: '#0F172A', margin: '0 0 14px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck style={{ width: '16px', height: '16px', color: '#059669' }} />
                  <span>Stage Audit Log &amp; Responsible Parties</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#166534', fontSize: '13px' }}>1. TC Review (Completed)</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Assignee: Rachel Green (TC Auditor)</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534', backgroundColor: '#DCFCE7', padding: '3px 10px', borderRadius: '6px' }}>Completed: 2026-08-01 10:15 AM</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#FFF5F6', borderRadius: '8px', border: '1.5px solid #FCA5A5' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#D8001D', fontSize: '13px' }}>2. Audit Manager Review (In Progress)</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Assignee: Kevin Zhang (Director)</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#D8001D', backgroundColor: '#FFF0F2', padding: '3px 10px', borderRadius: '6px', border: '1px solid #FCA5A5' }}>Active Now</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#64748B', fontSize: '13px' }}>3. Director Approval (Pending)</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Awaiting Audit Manager sign-off</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8' }}>Not Started</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#64748B', fontSize: '13px' }}>4. Management Response (Pending)</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Awaiting Business Owner input</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8' }}>Not Started</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#64748B', fontSize: '13px' }}>5. Final Report Publishing (Pending)</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Final Executive Sign-off</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8' }}>Not Started</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>
        </div>
      )}
    </>
  );
}
