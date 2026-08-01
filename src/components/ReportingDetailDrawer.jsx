import React, { useState } from 'react';
import { 
  ArrowLeft, FileText, Download, GitBranch, History, PlayCircle, 
  MessageSquare, Calendar, CheckCircle2, Clock, ShieldCheck, ArrowRight
} from 'lucide-react';

export default function ReportingDetailDrawer({
  isOpen,
  job,
  onClose,
  onOpenDiscussionPoints,
  onOpenWorkflow,
  onOpenHistory,
  onWorkOnReport
}) {
  const [activeTab, setActiveTab] = useState('audit-report'); // 'audit-report', 'executive-report', 'discussion-points'

  if (!isOpen || !job) return null;

  const { auditReport, executiveSummaryReport, discussionPoints } = job;

  const tabs = [
    { id: 'audit-report', label: 'Audit Report', icon: FileText },
    { id: 'executive-report', label: 'Executive Report', icon: ShieldCheck },
    { id: 'discussion-points', label: 'Discussions', icon: MessageSquare, count: discussionPoints?.count || 3 }
  ];

  return (
    <aside style={{
      width: '480px',
      maxWidth: '90vw',
      height: '100%',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid var(--slate-200)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-6px 0 16px rgba(0,0,0,0.06)',
      animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden'
    }}>
      
      {/* Inset Dark Rectangle Title Card */}
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
          {/* Back Arrow Button + Job ID & Name Title */}
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
              {job.id} — {job.fileName}
            </h2>
          </div>
        </div>
      </div>

      {/* Segmented Tab Switcher Container */}
      <div style={{ padding: '16px 20px 0 20px', backgroundColor: '#ffffff', flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#F1F5F9',
          borderRadius: '8px',
          padding: '4px',
          gap: '4px'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '9px 8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? '#D8001D' : '#64748B',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Icon style={{ width: '14px', height: '14px', color: isActive ? '#D8001D' : '#94A3B8' }} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '1px 5px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? '#FFF0F2' : '#E2E8F0',
                    color: isActive ? '#D8001D' : '#475569'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Tab Body Content */}
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        
        {/* TAB 1: AUDIT REPORT */}
        {activeTab === 'audit-report' && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #2563EB', paddingBottom: '8px' }}>
              <FileText style={{ width: '18px', height: '18px', color: '#2563EB' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1E3A8A', margin: 0 }}>
                Audit Report Details
              </h3>
            </div>

            {/* Single-Column Left Label & Right Value Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Gen AI Extraction Date Time</span>
                <strong style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>{auditReport?.genAiExtractionDateTime || '-'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Execution Status</span>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 10px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                  {auditReport?.executionStatus || 'Completed'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Validation Start Date Time</span>
                <strong style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>{auditReport?.validationStartDateTime || '-'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Validation End Date Time</span>
                <strong style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>{auditReport?.validationEndDateTime || '-'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Validation Status</span>
                <strong style={{ fontSize: '13px', fontWeight: '800', color: '#2563EB' }}>{auditReport?.validationStatus || 'Validated'}</strong>
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <button
                onClick={() => onWorkOnReport && onWorkOnReport(job, 'audit')}
                style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '800', color: '#ffffff', backgroundColor: '#D8001D', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <PlayCircle style={{ width: '15px', height: '15px' }} />
                <span>Work On Report</span>
              </button>

              <button
                onClick={() => alert(`Downloading Audit Report for ${job.id}`)}
                style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '700', color: '#1E293B', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download style={{ width: '15px', height: '15px', color: '#2563EB' }} />
                <span>Download Report</span>
              </button>

              <button
                onClick={() => onOpenWorkflow && onOpenWorkflow(job)}
                style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '700', color: '#475569', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <GitBranch style={{ width: '15px', height: '15px', color: '#059669' }} />
                <span>View Workflow</span>
              </button>

              <button
                onClick={() => onOpenHistory && onOpenHistory(job)}
                style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '700', color: '#475569', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <History style={{ width: '15px', height: '15px', color: '#6366F1' }} />
                <span>View History</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EXECUTIVE REPORT */}
        {activeTab === 'executive-report' && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #059669', paddingBottom: '8px' }}>
              <ShieldCheck style={{ width: '18px', height: '18px', color: '#059669' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#065F46', margin: 0 }}>
                Executive Summary Report
              </h3>
            </div>

            {/* Single-Column Left Label & Right Value Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Gen AI Extraction Date Time</span>
                <strong style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>{executiveSummaryReport?.genAiExtractionDateTime || '-'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Execution Status</span>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 10px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                  {executiveSummaryReport?.executionStatus || 'Completed'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Validation Start Date Time</span>
                <strong style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>{executiveSummaryReport?.validationStartDateTime || '-'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Validation End Date Time</span>
                <strong style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>{executiveSummaryReport?.validationEndDateTime || '-'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Validation Status</span>
                <strong style={{ fontSize: '13px', fontWeight: '800', color: '#059669' }}>{executiveSummaryReport?.validationStatus || 'Validated'}</strong>
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <button
                onClick={() => onWorkOnReport && onWorkOnReport(job, 'executive')}
                style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '800', color: '#ffffff', backgroundColor: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <PlayCircle style={{ width: '15px', height: '15px' }} />
                <span>Work On Report</span>
              </button>

              <button
                onClick={() => alert(`Downloading Executive Summary Report for ${job.id}`)}
                style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '700', color: '#1E293B', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download style={{ width: '15px', height: '15px', color: '#059669' }} />
                <span>Download Report</span>
              </button>

              <button
                onClick={() => onOpenWorkflow && onOpenWorkflow(job)}
                style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '700', color: '#475569', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <GitBranch style={{ width: '15px', height: '15px', color: '#059669' }} />
                <span>View Workflow</span>
              </button>

              <button
                onClick={() => onOpenHistory && onOpenHistory(job)}
                style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '700', color: '#475569', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <History style={{ width: '15px', height: '15px', color: '#6366F1' }} />
                <span>View History</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DISCUSSIONS */}
        {activeTab === 'discussion-points' && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #D8001D', paddingBottom: '8px' }}>
              <MessageSquare style={{ width: '18px', height: '18px', color: '#D8001D' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#991B1B', margin: 0 }}>
                Discussions Overview
              </h3>
            </div>

            {/* Single-Column Left Label & Right Value Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1.5px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Start Date Time</span>
                <strong style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>{discussionPoints?.startDateTime || '-'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>End Date Time</span>
                <strong style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>{discussionPoints?.endDateTime || '-'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>Status</span>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 10px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                  {discussionPoints?.status || 'Active'}
                </span>
              </div>

            </div>

            {/* Open Discussion Points Action Button */}
            <button
              onClick={() => onOpenDiscussionPoints && onOpenDiscussionPoints(job)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#ffffff',
                backgroundColor: '#D8001D',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                boxShadow: '0 2px 4px rgba(216, 0, 29, 0.2)'
              }}
            >
              <MessageSquare style={{ width: '16px', height: '16px' }} />
              <span>Open Discussion Points</span>
              <ArrowRight style={{ width: '15px', height: '15px' }} />
            </button>
          </div>
        )}

      </div>

    </aside>
  );
}
