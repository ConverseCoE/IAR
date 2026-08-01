import React, { useState } from 'react';
import {
  ArrowLeft, FileText, ShieldCheck, DollarSign, AlertOctagon,
  GitBranch, History, Eye, ExternalLink, MessageSquare, Layers, MoreVertical, X, Clock, CheckCircle2, Cpu, TrendingUp
} from 'lucide-react';

export default function AuditDetailDrawer({
  isOpen,
  report,
  onClose,
  onOpenITModal,
  onOpenFinOpsModal,
  onOpenIssueModal,
  onOpenWorkflowModal,
  onOpenHistoryModal,
  onOpenDiscussionPointsView,
  onOpenWorkflowOverlay,
  onWorkOnReport
}) {
  const [activeReportTab, setActiveReportTab] = useState('audit');
  const [activeAltTab, setActiveAltTab] = useState('reports');
  const [designVariant, setDesignVariant] = useState('default');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Workflow Drawer Overlay States
  const [isAuditWorkflowOpen, setIsAuditWorkflowOpen] = useState(false);
  const [isExecWorkflowOpen, setIsExecWorkflowOpen] = useState(false);
  const [isITWorkflowOpen, setIsITWorkflowOpen] = useState(false);
  const [isFinOpsWorkflowOpen, setIsFinOpsWorkflowOpen] = useState(false);

  if (!isOpen || !report) return null;

  // Readable Status Badge Helper
  const renderStatusBadge = (statusText) => {
    const s = (statusText || '').toLowerCase();
    let bg = '#ffffff';
    let text = '#475569';
    let border = '#E2E8F0';

    if (s === 'completed' || s === 'approved') {
      bg = '#ECFDF5'; text = '#047857'; border = '#A7F3D0';
    } else if (s === 'in progress') {
      bg = '#FFFBEB'; text = '#B45309'; border = '#FDE68A';
    } else if (s === 'in review') {
      bg = '#EEF2FF'; text = '#4338CA'; border = '#C7D2FE';
    }

    return (
      <span style={{
        fontSize: '12px',
        fontWeight: '700',
        padding: '3px 10px',
        borderRadius: '9999px',
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap'
      }}>
        {statusText || 'Not Started'}
      </span>
    );
  };

  const handleOpenPoints = (funcType) => {
    if (onOpenDiscussionPointsView) {
      onOpenDiscussionPointsView(funcType);
    } else if (funcType === 'IT' && onOpenITModal) {
      onOpenITModal(report);
    } else if (funcType === 'FinOps' && onOpenFinOpsModal) {
      onOpenFinOpsModal(report);
    }
  };

  return (
    <aside className="inline-detail-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Inset Dark Rectangle Title Card with Three Vertical Dots 'More Options' Menu */}
      <div style={{ padding: '16px 20px 0 20px', backgroundColor: '#ffffff', flexShrink: 0 }}>
        <div style={{
          backgroundColor: '#0F172A',
          color: '#ffffff',
          padding: '12px 16px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
          position: 'relative'
        }}>
          {/* Back Arrow Button + Engagement Name Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px'
              }}
              title="Close Drawer"
            >
              <ArrowLeft style={{ width: '18px', height: '18px' }} />
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '0.2px', textTransform: 'uppercase', color: '#38BDF8' }}>
                {report.id} — <span style={{ color: '#ffffff' }}>{report.fileName}</span>
              </div>
            </div>
          </div>

          {/* Three Vertical Dots Dropdown Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                transition: 'color 0.2s'
              }}
              title="More Actions"
            >
              <MoreVertical style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Dropdown Options Popup Menu */}
            {isMoreMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #E2E8F0',
                padding: '6px',
                zIndex: 200,
                minWidth: '220px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                animation: 'fadeIn 0.15s ease-out'
              }}>
                <div style={{ padding: '6px 10px', fontSize: '10.5px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Quick Actions
                </div>

                {/* Option 1: View Workflows */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsAuditWorkflowOpen(true);
                  }}
                  style={{
                    padding: '9px 12px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: '#1E293B',
                    backgroundColor: '#F8FAFC',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <GitBranch style={{ width: '15px', height: '15px', color: '#D8001D' }} />
                  <span>View Workflows</span>
                </button>

                {/* Option 2: View History */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenHistoryModal(report);
                  }}
                  style={{
                    padding: '9px 12px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: '#1E293B',
                    backgroundColor: '#F8FAFC',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <History style={{ width: '15px', height: '15px', color: '#6366F1' }} />
                  <span>View History</span>
                </button>

                <div style={{ borderTop: '1px solid #F1F5F9', margin: '2px 0' }}></div>

                {/* Option 3: Issue Indicator */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenIssueModal(report);
                  }}
                  style={{
                    padding: '9px 12px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    color: '#D8001D',
                    backgroundColor: '#FFF0F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertOctagon style={{ width: '15px', height: '15px', color: '#D8001D' }} />
                    <span>Issue Indicator</span>
                  </div>
                  {report.issueIndicator && report.issueIndicator.count > 0 && (
                    <span style={{
                      backgroundColor: '#D8001D',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '900',
                      padding: '2px 6px',
                      borderRadius: '9999px'
                    }}>
                      {report.issueIndicator.count}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DEFAULT DESIGN */}
      {designVariant === 'default' && (
        <>
          {/* Segmented Tab Switcher (2 Tabs) */}
          <div style={{ padding: '16px 20px 0 20px', backgroundColor: '#ffffff', flexShrink: 0 }}>
            <div style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '8px',
              padding: '4px',
              gap: '4px'
            }}>
              <button
                onClick={() => setActiveReportTab('audit')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeReportTab === 'audit' ? '#ffffff' : 'transparent',
                  color: activeReportTab === 'audit' ? '#D8001D' : '#64748B',
                  boxShadow: activeReportTab === 'audit' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FileText style={{ width: '15px', height: '15px' }} />
                <span>Audit Report</span>
              </button>

              <button
                onClick={() => setActiveReportTab('exec')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeReportTab === 'exec' ? '#ffffff' : 'transparent',
                  color: activeReportTab === 'exec' ? '#D8001D' : '#64748B',
                  boxShadow: activeReportTab === 'exec' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Layers style={{ width: '15px', height: '15px' }} />
                <span>Executive Summary</span>
              </button>
            </div>
          </div>

          {/* Scrollable Tab Content Container */}
          <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* TAB 1: AUDIT REPORT DETAILS */}
            {activeReportTab === 'audit' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Main Audit Report Parent Card Container */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>

                  {/* Title & Description */}
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A' }}>
                      Audit Report
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px', lineHeight: '1.4' }}>
                      Comprehensive audit findings, technical verification, and financial compliance status.
                    </p>
                  </div>

                  {/* Status & Current Queue Key Information Lines */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderTop: '1px solid #E2E8F0',
                    borderBottom: '1px solid #E2E8F0',
                    padding: '10px 0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                        Status
                      </span>
                      {renderStatusBadge(report.status)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                        Current Queue
                      </span>
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#D8001D', fontFamily: 'monospace' }}>
                        {report.currentQueue}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: "Open Report" & "View Workflow" */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onWorkOnReport && onWorkOnReport(report, 'audit')}
                      style={{
                        flex: 1,
                        height: '38px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        color: '#D8001D',
                        backgroundColor: '#ffffff',
                        border: '1px solid #FCA5A5',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 2px rgba(216,0,29,0.06)'
                      }}
                    >
                      <FileText style={{ width: '15px', height: '15px' }} />
                      <span>Open Report</span>
                    </button>

                    <button
                      onClick={() => setIsAuditWorkflowOpen(true)}
                      style={{
                        flex: 1,
                        height: '38px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        color: '#2563EB',
                        backgroundColor: '#ffffff',
                        border: '1px solid #BFDBFE',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <GitBranch style={{ width: '15px', height: '15px' }} />
                      <span>View Workflow</span>
                    </button>
                  </div>

                  {/* CHILD SUB-BOXES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '2px', paddingLeft: '10px' }}>

                    {/* IT Discussion Points */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck style={{ width: '14px', height: '14px', color: '#2563EB' }} />
                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                          IT Discussion Points
                        </h4>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        borderTop: '1px solid #F1F5F9',
                        borderBottom: '1px solid #F1F5F9',
                        padding: '6px 0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>
                            Status
                          </span>
                          {renderStatusBadge(report.itDiscussion.status)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>
                            Current Queue
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#D8001D', fontFamily: 'monospace' }}>
                            {report.currentQueue}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenPoints('IT')}
                          style={{
                            flex: 1,
                            height: '32px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#D8001D',
                            backgroundColor: '#FFF0F2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <MessageSquare style={{ width: '12px', height: '12px' }} />
                          <span>View Points</span>
                        </button>

                        <button
                          onClick={() => setIsITWorkflowOpen(true)}
                          style={{
                            flex: 1,
                            height: '32px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#2563EB',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <GitBranch style={{ width: '12px', height: '12px' }} />
                          <span>View Workflow</span>
                        </button>
                      </div>
                    </div>

                    {/* FinOps Discussion Points */}
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <DollarSign style={{ width: '14px', height: '14px', color: '#059669' }} />
                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                          FinOps Discussion Points
                        </h4>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        borderTop: '1px solid #F1F5F9',
                        borderBottom: '1px solid #F1F5F9',
                        padding: '6px 0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>
                            Status
                          </span>
                          {renderStatusBadge(report.finOpsDiscussion.status)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#475569' }}>
                            Current Queue
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#D8001D', fontFamily: 'monospace' }}>
                            {report.currentQueue}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenPoints('FinOps')}
                          style={{
                            flex: 1,
                            height: '32px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#D8001D',
                            backgroundColor: '#FFF0F2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <MessageSquare style={{ width: '12px', height: '12px' }} />
                          <span>View Points</span>
                        </button>

                        <button
                          onClick={() => setIsFinOpsWorkflowOpen(true)}
                          style={{
                            flex: 1,
                            height: '32px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#059669',
                            backgroundColor: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <GitBranch style={{ width: '12px', height: '12px' }} />
                          <span>View Workflow</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: EXECUTIVE SUMMARY DETAILS */}
            {activeReportTab === 'exec' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>

                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                      Executive Summary Report
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', lineHeight: '1.5' }}>
                      High-level compliance insights, overall audit risk evaluation, and executive sign-off.
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    borderTop: '1px solid #E2E8F0',
                    borderBottom: '1px solid #E2E8F0',
                    padding: '14px 0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#475569' }}>
                        Status
                      </span>
                      {renderStatusBadge(report.status)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#475569' }}>
                        Current Queue
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#D8001D', fontFamily: 'monospace' }}>
                        {report.currentQueue}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      onClick={() => onWorkOnReport && onWorkOnReport(report, 'executive')}
                      style={{
                        flex: 1,
                        height: '42px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#D8001D',
                        backgroundColor: '#ffffff',
                        border: '1px solid #FCA5A5',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 1px 2px rgba(216,0,29,0.06)'
                      }}
                    >
                      <FileText style={{ width: '16px', height: '16px' }} />
                      <span>Open Report</span>
                    </button>

                    <button
                      onClick={() => setIsExecWorkflowOpen(true)}
                      style={{
                        flex: 1,
                        height: '42px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#2563EB',
                        backgroundColor: '#ffffff',
                        border: '1px solid #BFDBFE',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <GitBranch style={{ width: '16px', height: '16px' }} />
                      <span>View Workflow</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* ========================================================================================= */}
      {/* 1. MAIN AUDIT REPORT WORKFLOW OVERLAY DRAWER (Dual IT & FinOps Graphs)                  */}
      {/* ========================================================================================= */}
      {isAuditWorkflowOpen && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1300 }}
          onClick={() => setIsAuditWorkflowOpen(false)}
        >
          <aside onClick={(e) => e.stopPropagation()} style={{ width: '820px', maxWidth: '96vw', height: '100vh', backgroundColor: '#ffffff', boxShadow: '-12px 0 36px rgba(0,0,0,0.28)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', backgroundColor: '#0F172A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setIsAuditWorkflowOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Back">
                  <ArrowLeft style={{ width: '20px', height: '20px' }} />
                </button>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: '#60A5FA' }}>Audit Report Main Workflow Pipeline</h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{report.fileName || report.id}</span>
                </div>
              </div>
              <button onClick={() => setIsAuditWorkflowOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* IT GRAPH */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                    <span>IT Issues Workflow Graph (6 Total Issues)</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '9999px' }}>TC: 6/6 | Manager: 3/6</span>
                </div>
                <div style={{ position: 'relative', width: '100%', minHeight: '190px' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <line x1="85" y1="35" x2="200" y2="35" stroke="#2563EB" strokeWidth="3" />
                    <line x1="330" y1="35" x2="430" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="530" y1="35" x2="600" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <path d="M 265 55 L 265 130 L 430 130" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="480" y1="58" x2="480" y2="115" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2px solid #2563EB', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2563EB' }} />
                        <div><div style={{ fontSize: '12.5px', fontWeight: '900' }}>TC</div><div style={{ fontSize: '10px', color: '#2563EB', fontWeight: '800' }}>Completed (6/6 issues)</div></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '26%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2.5px solid #D8001D', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock style={{ width: '14px', height: '14px', color: '#D8001D' }} />
                        <div><div style={{ fontSize: '12.5px', fontWeight: '900' }}>Audit Manager</div><span style={{ fontSize: '10px', color: '#D8001D', fontWeight: '800' }}>Inprogress (3/6 issues)</span></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '56%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Director</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/6 issues)</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Final Report</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/6 issues)</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '52%', top: '105px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Management Response</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/6 issues)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FINOPS GRAPH */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#065F46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp style={{ width: '18px', height: '18px', color: '#059669' }} />
                    <span>FinOps Issues Workflow Graph (4 Total Issues)</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: '9999px' }}>TC: 4/4 | Manager: 2/4</span>
                </div>
                <div style={{ position: 'relative', width: '100%', minHeight: '190px' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <line x1="85" y1="35" x2="200" y2="35" stroke="#059669" strokeWidth="3" />
                    <line x1="330" y1="35" x2="430" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="530" y1="35" x2="600" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <path d="M 265 55 L 265 130 L 430 130" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="480" y1="58" x2="480" y2="115" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2px solid #059669', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px', color: '#059669' }} />
                        <div><div style={{ fontSize: '12.5px', fontWeight: '900' }}>TC</div><div style={{ fontSize: '10px', color: '#059669', fontWeight: '800' }}>Completed (4/4 issues)</div></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '26%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2.5px solid #7C3AED', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
                        <div><div style={{ fontSize: '12.5px', fontWeight: '900' }}>Audit Manager</div><span style={{ fontSize: '10px', color: '#7C3AED', fontWeight: '800' }}>Inprogress (2/4 issues)</span></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '56%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Director</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/4 issues)</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Final Report</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/4 issues)</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '52%', top: '105px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Management Response</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/4 issues)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 2. EXECUTIVE SUMMARY WORKFLOW OVERLAY DRAWER                                             */}
      {/* ========================================================================================= */}
      {isExecWorkflowOpen && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1300 }}
          onClick={() => setIsExecWorkflowOpen(false)}
        >
          <aside onClick={(e) => e.stopPropagation()} style={{ width: '780px', maxWidth: '96vw', height: '100vh', backgroundColor: '#ffffff', boxShadow: '-12px 0 36px rgba(0,0,0,0.28)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', backgroundColor: '#0F172A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setIsExecWorkflowOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Back"><ArrowLeft style={{ width: '20px', height: '20px' }} /></button>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: '#38BDF8' }}>Executive Summary Workflow Pipeline</h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{report.fileName || report.id}</span>
                </div>
              </div>
              <button onClick={() => setIsExecWorkflowOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '24px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitBranch style={{ width: '18px', height: '18px', color: '#D8001D' }} />
                  <span>Executive Workflow Stage Graph</span>
                </div>
                <div style={{ position: 'relative', width: '100%', minHeight: '210px' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <line x1="80" y1="35" x2="190" y2="35" stroke="#22C55E" strokeWidth="3" />
                    <line x1="330" y1="35" x2="420" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="510" y1="35" x2="575" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <path d="M 260 55 L 260 135 L 420 135" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="465" y1="58" x2="465" y2="120" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2px solid #22C55E', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '15px', height: '15px', color: '#15803D' }} />
                        <div><div style={{ fontSize: '13px', fontWeight: '900' }}>TC</div><div style={{ fontSize: '10px', color: '#15803D', fontWeight: '800' }}>Completed</div></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '26%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2.5px solid #D8001D', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock style={{ width: '16px', height: '16px', color: '#D8001D' }} />
                        <div><div style={{ fontSize: '13px', fontWeight: '900' }}>Audit Manager</div><span style={{ fontSize: '10px', color: '#D8001D', fontWeight: '800' }}>In Progress</span></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '57%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569' }}>Director</div><div style={{ fontSize: '10px', color: '#94A3B8' }}>Not Started</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569' }}>Final Report</div><div style={{ fontSize: '10px', color: '#94A3B8' }}>Not Started</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '52%', top: '110px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '8px 12px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569' }}>Management Response</div><div style={{ fontSize: '10px', color: '#94A3B8' }}>Not Started</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 3. IT DISCUSSION POINTS WORKFLOW OVERLAY DRAWER (IT Graph & IT Table ONLY)               */}
      {/* ========================================================================================= */}
      {isITWorkflowOpen && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1300 }}
          onClick={() => setIsITWorkflowOpen(false)}
        >
          <aside onClick={(e) => e.stopPropagation()} style={{ width: '780px', maxWidth: '96vw', height: '100vh', backgroundColor: '#ffffff', boxShadow: '-12px 0 36px rgba(0,0,0,0.28)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', backgroundColor: '#0F172A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setIsITWorkflowOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Back"><ArrowLeft style={{ width: '20px', height: '20px' }} /></button>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: '#38BDF8' }}>IT Discussion Points Workflow</h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{report.fileName || report.id}</span>
                </div>
              </div>
              <button onClick={() => setIsITWorkflowOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* IT GRAPH ONLY */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '22px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#1E3A8A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                    <span>IT Issues Workflow Graph (6 Total Issues)</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '9999px' }}>TC: 6/6 | Manager: 3/6</span>
                </div>
                <div style={{ position: 'relative', width: '100%', minHeight: '190px' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <line x1="85" y1="35" x2="200" y2="35" stroke="#2563EB" strokeWidth="3" />
                    <line x1="330" y1="35" x2="430" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="530" y1="35" x2="600" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <path d="M 265 55 L 265 130 L 430 130" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="480" y1="58" x2="480" y2="115" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2px solid #2563EB', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px', color: '#2563EB' }} />
                        <div><div style={{ fontSize: '12.5px', fontWeight: '900' }}>TC</div><div style={{ fontSize: '10px', color: '#2563EB', fontWeight: '800' }}>Completed (6/6 issues)</div></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '26%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2.5px solid #D8001D', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock style={{ width: '14px', height: '14px', color: '#D8001D' }} />
                        <div><div style={{ fontSize: '12.5px', fontWeight: '900' }}>Audit Manager</div><span style={{ fontSize: '10px', color: '#D8001D', fontWeight: '800' }}>Inprogress (3/6 issues)</span></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '56%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Director</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/6 issues)</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Final Report</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/6 issues)</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '52%', top: '105px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Management Response</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/6 issues)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* IT TABLE ONLY */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E3A8A', backgroundColor: '#EFF6FF', padding: '6px 12px', borderRadius: '6px', marginBottom: '12px', borderLeft: '4px solid #2563EB' }}>
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
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 4. FINOPS DISCUSSION POINTS WORKFLOW OVERLAY DRAWER (FinOps Graph & FinOps Table ONLY)   */}
      {/* ========================================================================================= */}
      {isFinOpsWorkflowOpen && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'flex-end', zIndex: 1300 }}
          onClick={() => setIsFinOpsWorkflowOpen(false)}
        >
          <aside onClick={(e) => e.stopPropagation()} style={{ width: '780px', maxWidth: '96vw', height: '100vh', backgroundColor: '#ffffff', boxShadow: '-12px 0 36px rgba(0,0,0,0.28)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', backgroundColor: '#0F172A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setIsFinOpsWorkflowOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Back"><ArrowLeft style={{ width: '20px', height: '20px' }} /></button>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: '#34D399' }}>FinOps Discussion Points Workflow</h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{report.fileName || report.id}</span>
                </div>
              </div>
              <button onClick={() => setIsFinOpsWorkflowOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* FINOPS GRAPH ONLY */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '22px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#065F46', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp style={{ width: '18px', height: '18px', color: '#059669' }} />
                    <span>FinOps Issues Workflow Graph (4 Total Issues)</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: '9999px' }}>TC: 4/4 | Manager: 2/4</span>
                </div>
                <div style={{ position: 'relative', width: '100%', minHeight: '190px' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <line x1="85" y1="35" x2="200" y2="35" stroke="#059669" strokeWidth="3" />
                    <line x1="330" y1="35" x2="430" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="530" y1="35" x2="600" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <path d="M 265 55 L 265 130 L 430 130" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" />
                    <line x1="480" y1="58" x2="480" y2="115" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', left: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2px solid #059669', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px', color: '#059669' }} />
                        <div><div style={{ fontSize: '12.5px', fontWeight: '900' }}>TC</div><div style={{ fontSize: '10px', color: '#059669', fontWeight: '800' }}>Completed (4/4 issues)</div></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '26%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2.5px solid #7C3AED', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
                        <div><div style={{ fontSize: '12.5px', fontWeight: '900' }}>Audit Manager</div><span style={{ fontSize: '10px', color: '#7C3AED', fontWeight: '800' }}>Inprogress (2/4 issues)</span></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '56%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Director</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/4 issues)</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Final Report</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/4 issues)</div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', left: '52%', top: '105px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800' }}>Management Response</div><div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Not Started (0/4 issues)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FINOPS TABLE ONLY */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#065F46', backgroundColor: '#ECFDF5', padding: '6px 12px', borderRadius: '6px', marginBottom: '12px', borderLeft: '4px solid #059669' }}>
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
          </aside>
        </div>
      )}

    </aside>
  );
}
