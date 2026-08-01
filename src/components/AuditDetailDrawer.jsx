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
  onOpenDiscussionPointsView,
  onOpenWorkflowOverlay
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
                    onOpenWorkflowOverlay && onOpenWorkflowOverlay('audit');
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
                      onClick={() => onOpenWorkflowOverlay && onOpenWorkflowOverlay('audit')}
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
                          onClick={() => onOpenWorkflowOverlay && onOpenWorkflowOverlay('it')}
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
                          onClick={() => onOpenWorkflowOverlay && onOpenWorkflowOverlay('finops')}
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
                      onClick={() => onOpenWorkflowOverlay && onOpenWorkflowOverlay('executive')}
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

    </aside>
  );
}
