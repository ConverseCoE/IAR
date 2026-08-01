import React, { useState } from 'react';
import { 
  ArrowLeft, FileText, ShieldCheck, DollarSign, AlertOctagon, 
  GitBranch, History, Eye, ExternalLink, MessageSquare, Layers, MoreVertical
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
  onOpenDiscussionPointsView
}) {
  const [activeReportTab, setActiveReportTab] = useState('audit');
  const [activeAltTab, setActiveAltTab] = useState('reports');
  const [designVariant, setDesignVariant] = useState('default');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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
    <aside className="inline-detail-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      
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
          {/* Left Side: Back Button + File Name Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <button
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Back to Full Table View"
            >
              <ArrowLeft style={{ width: '16px', height: '16px', color: '#FCA5A5' }} />
            </button>

            <h2 style={{ fontSize: '14.5px', fontWeight: '800', color: '#ffffff', lineHeight: '1.3', margin: 0, wordBreak: 'break-word' }}>
              {report.fileName}
            </h2>
          </div>

          {/* Right Side: Three Vertical Dots Menu Button */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: isMoreMenuOpen ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              title="More Actions & Design Options"
            >
              <MoreVertical style={{ width: '16px', height: '16px', color: '#ffffff' }} />
              {report.issueIndicator && report.issueIndicator.count > 0 && (
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
              )}
            </button>

            {/* Dropdown Menu Popup */}
            {isMoreMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '210px',
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.08)',
                zIndex: 50,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {/* Toggle to Another Design */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setDesignVariant(designVariant === 'default' ? 'alt3Tab' : 'default');
                  }}
                  style={{
                    padding: '9px 12px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    color: '#2563EB',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <Layers style={{ width: '15px', height: '15px', color: '#2563EB' }} />
                  <span>{designVariant === 'default' ? "Another Design (3-Tab)" : "Current Design View"}</span>
                </button>

                <div style={{ borderTop: '1px solid #F1F5F9', margin: '2px 0' }}></div>

                {/* Option 1: View Workflows */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenWorkflowModal({
                      title: "All Workflows Combined View",
                      workflows: [
                        { groupTitle: "IT Discussion Workflow", status: report.itDiscussion.status, steps: report.approvalWorkflows?.itWorkflow || [] },
                        { groupTitle: "FinOps Discussion Workflow", status: report.finOpsDiscussion.status, steps: report.approvalWorkflows?.finOpsWorkflow || [] },
                        { groupTitle: "Executive Summary Workflow", status: report.status, steps: report.approvalWorkflows?.execSummaryWorkflow || [] }
                      ]
                    });
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

      {/* DESIGN VARIANT 1: DEFAULT DESIGN */}
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
                      onClick={() => alert(`Opening Audit Report Viewer for ${report.fileName}...`)}
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
                      onClick={() => onOpenWorkflowModal({
                        title: "Audit Report Overall Workflow",
                        workflows: [
                          { groupTitle: "IT Discussion Pipeline", status: report.itDiscussion.status, steps: report.approvalWorkflows?.itWorkflow || [] },
                          { groupTitle: "FinOps Discussion Pipeline", status: report.finOpsDiscussion.status, steps: report.approvalWorkflows?.finOpsWorkflow || [] }
                        ]
                      })}
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
                          onClick={() => onOpenWorkflowModal({
                            title: "IT Discussion Workflow Stages",
                            workflows: [{
                              groupTitle: "IT Approval Pipeline",
                              status: report.itDiscussion.status,
                              active: true,
                              steps: report.approvalWorkflows?.itWorkflow || []
                            }]
                          })}
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
                          onClick={() => onOpenWorkflowModal({
                            title: "FinOps Discussion Workflow Stages",
                            workflows: [{
                              groupTitle: "FinOps Approval Pipeline",
                              status: report.finOpsDiscussion.status,
                              active: true,
                              steps: report.approvalWorkflows?.finOpsWorkflow || []
                            }]
                          })}
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
                      onClick={() => alert(`Opening Executive Summary Viewer for ${report.fileName}...`)}
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
                      onClick={() => onOpenWorkflowModal({
                        title: "Executive Summary Report Workflow",
                        workflows: [{
                          groupTitle: "Executive Committee Approval Pipeline",
                          status: report.status,
                          active: true,
                          steps: report.approvalWorkflows?.execSummaryWorkflow || []
                        }]
                      })}
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

      {/* DESIGN VARIANT 2: ANOTHER DESIGN (3 TABS) */}
      {designVariant === 'alt3Tab' && (
        <>
          {/* Segmented Tab Switcher (3 Tabs) */}
          <div style={{ padding: '16px 20px 0 20px', backgroundColor: '#ffffff', flexShrink: 0 }}>
            <div style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '8px',
              padding: '4px',
              gap: '4px'
            }}>
              <button
                onClick={() => setActiveAltTab('reports')}
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeAltTab === 'reports' ? '#ffffff' : 'transparent',
                  color: activeAltTab === 'reports' ? '#D8001D' : '#64748B',
                  boxShadow: activeAltTab === 'reports' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <FileText style={{ width: '14px', height: '14px' }} />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setActiveAltTab('discussions')}
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeAltTab === 'discussions' ? '#ffffff' : 'transparent',
                  color: activeAltTab === 'discussions' ? '#D8001D' : '#64748B',
                  boxShadow: activeAltTab === 'discussions' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <MessageSquare style={{ width: '14px', height: '14px' }} />
                <span>Discussions</span>
              </button>

              <button
                onClick={() => setActiveAltTab('workflows')}
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: activeAltTab === 'workflows' ? '#ffffff' : 'transparent',
                  color: activeAltTab === 'workflows' ? '#D8001D' : '#64748B',
                  boxShadow: activeAltTab === 'workflows' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <GitBranch style={{ width: '14px', height: '14px' }} />
                <span>Workflows</span>
              </button>
            </div>
          </div>

          <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {activeAltTab === 'reports' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>1. Audit Report</h4>
                    {renderStatusBadge(report.status)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#475569' }}>
                    <span>Current Queue:</span>
                    <strong style={{ color: '#D8001D', fontFamily: 'monospace' }}>{report.currentQueue}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => alert(`Opening Audit Report...`)} style={{ flex: 1, height: '36px', fontSize: '12px', fontWeight: '700', color: '#D8001D', backgroundColor: '#ffffff', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <FileText style={{ width: '14px', height: '14px' }} />
                      <span>Open Report</span>
                    </button>
                    <button onClick={() => onOpenWorkflowModal({ title: "Audit Report Overall Workflow", workflows: [{ groupTitle: "IT Pipeline", status: report.itDiscussion.status, steps: report.approvalWorkflows?.itWorkflow || [] }] })} style={{ flex: 1, height: '36px', fontSize: '12px', fontWeight: '700', color: '#2563EB', backgroundColor: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <GitBranch style={{ width: '14px', height: '14px' }} />
                      <span>View Workflow</span>
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>2. Executive Summary Report</h4>
                    {renderStatusBadge(report.status)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#475569' }}>
                    <span>Current Queue:</span>
                    <strong style={{ color: '#D8001D', fontFamily: 'monospace' }}>{report.currentQueue}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => alert(`Opening Executive Summary...`)} style={{ flex: 1, height: '36px', fontSize: '12px', fontWeight: '700', color: '#D8001D', backgroundColor: '#ffffff', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <FileText style={{ width: '14px', height: '14px' }} />
                      <span>Open Report</span>
                    </button>
                    <button onClick={() => onOpenWorkflowModal({ title: "Executive Summary Workflow", workflows: [{ groupTitle: "Executive Pipeline", status: report.status, active: true, steps: report.approvalWorkflows?.execSummaryWorkflow || [] }] })} style={{ flex: 1, height: '36px', fontSize: '12px', fontWeight: '700', color: '#2563EB', backgroundColor: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <GitBranch style={{ width: '14px', height: '14px' }} />
                      <span>View Workflow</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeAltTab === 'discussions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck style={{ width: '16px', height: '16px', color: '#2563EB' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>IT Discussion Points</h4>
                    </div>
                    {renderStatusBadge(report.itDiscussion.status)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenPoints('IT')} style={{ flex: 1, height: '36px', fontSize: '12px', fontWeight: '700', color: '#D8001D', backgroundColor: '#FFF0F2', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <MessageSquare style={{ width: '14px', height: '14px' }} />
                      <span>View Points</span>
                    </button>
                    <button onClick={() => onOpenWorkflowModal({ title: "IT Workflow", workflows: [{ groupTitle: "IT Pipeline", status: report.itDiscussion.status, steps: report.approvalWorkflows?.itWorkflow || [] }] })} style={{ flex: 1, height: '36px', fontSize: '12px', fontWeight: '700', color: '#2563EB', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <GitBranch style={{ width: '14px', height: '14px' }} />
                      <span>View Workflow</span>
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign style={{ width: '16px', height: '16px', color: '#059669' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>FinOps Discussion Points</h4>
                    </div>
                    {renderStatusBadge(report.finOpsDiscussion.status)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenPoints('FinOps')} style={{ flex: 1, height: '36px', fontSize: '12px', fontWeight: '700', color: '#D8001D', backgroundColor: '#FFF0F2', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <MessageSquare style={{ width: '14px', height: '14px' }} />
                      <span>View Points</span>
                    </button>
                    <button onClick={() => onOpenWorkflowModal({ title: "FinOps Workflow", workflows: [{ groupTitle: "FinOps Pipeline", status: report.finOpsDiscussion.status, steps: report.approvalWorkflows?.finOpsWorkflow || [] }] })} style={{ flex: 1, height: '36px', fontSize: '12px', fontWeight: '700', color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <GitBranch style={{ width: '14px', height: '14px' }} />
                      <span>View Workflow</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeAltTab === 'workflows' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h5 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>Audit Report Workflow</h5>
                  </div>
                  <button onClick={() => onOpenWorkflowModal({ title: "Audit Workflow", workflows: [{ groupTitle: "IT Pipeline", status: report.itDiscussion.status, steps: report.approvalWorkflows?.itWorkflow || [] }] })} style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '700', color: '#2563EB', backgroundColor: '#ffffff', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer' }}>View Workflow</button>
                </div>
              </div>
            )}

          </div>
        </>
      )}

    </aside>
  );
}
