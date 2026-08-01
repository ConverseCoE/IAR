import React from 'react';
import { 
  X, FileText, Download, GitBranch, History, PlayCircle, 
  MessageSquare, Calendar, CheckCircle2, Clock, ShieldCheck, ArrowRight
} from 'lucide-react';

export default function ReportingDetailDrawer({
  isOpen,
  job,
  onClose,
  onOpenDiscussionPoints,
  onOpenWorkflow,
  onOpenHistory
}) {
  if (!isOpen || !job) return null;

  const { auditReport, executiveSummaryReport, discussionPoints } = job;

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
      
      {/* Drawer Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--slate-200)',
        backgroundColor: '#0F172A',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#FCA5A5', letterSpacing: '0.8px' }}>
            Job Detail Overview
          </span>
          <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, marginTop: '2px', color: '#ffffff' }}>
            {job.id} — <span style={{ fontWeight: '400', opacity: 0.9 }}>{job.fileName}</span>
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>
      </div>

      {/* Scrollable Body: 3 Distinct Sections */}
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SECTION 1: AUDIT REPORT */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #CBD5E1',
          borderRadius: '10px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Card Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #2563EB', paddingBottom: '8px' }}>
            <FileText style={{ width: '18px', height: '18px', color: '#2563EB' }} />
            <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: '#1E3A8A', margin: 0 }}>
              Audit Report
            </h3>
          </div>

          {/* Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Gen AI Extraction Date Time</span>
              <strong style={{ color: '#0F172A', fontSize: '11.5px' }}>{auditReport?.genAiExtractionDateTime || '-'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Execution Status</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                {auditReport?.executionStatus || 'Completed'}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Validation Start Date Time</span>
              <strong style={{ color: '#0F172A', fontSize: '11.5px' }}>{auditReport?.validationStartDateTime || '-'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Validation End Date Time</span>
              <strong style={{ color: '#0F172A', fontSize: '11.5px' }}>{auditReport?.validationEndDateTime || '-'}</strong>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Validation Status</span>
              <strong style={{ color: '#2563EB', fontSize: '12px', fontWeight: '800' }}>{auditReport?.validationStatus || 'Validated'}</strong>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={() => alert(`Initiating Work On Audit Report for ${job.id}`)}
              style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: '700', color: '#ffffff', backgroundColor: '#D8001D', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <PlayCircle style={{ width: '14px', height: '14px' }} />
              <span>Work On Report</span>
            </button>

            <button
              onClick={() => alert(`Downloading Audit Report for ${job.id}`)}
              style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: '700', color: '#1E293B', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <Download style={{ width: '14px', height: '14px', color: '#2563EB' }} />
              <span>Download Report</span>
            </button>

            <button
              onClick={() => onOpenWorkflow && onOpenWorkflow(job)}
              style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: '700', color: '#475569', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <GitBranch style={{ width: '14px', height: '14px', color: '#059669' }} />
              <span>View Workflow</span>
            </button>

            <button
              onClick={() => onOpenHistory && onOpenHistory(job)}
              style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: '700', color: '#475569', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <History style={{ width: '14px', height: '14px', color: '#6366F1' }} />
              <span>View History</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: EXECUTIVE SUMMARY REPORT */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #CBD5E1',
          borderRadius: '10px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Card Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #059669', paddingBottom: '8px' }}>
            <ShieldCheck style={{ width: '18px', height: '18px', color: '#059669' }} />
            <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: '#065F46', margin: 0 }}>
              Executive Summary Report
            </h3>
          </div>

          {/* Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Gen AI Extraction Date Time</span>
              <strong style={{ color: '#0F172A', fontSize: '11.5px' }}>{executiveSummaryReport?.genAiExtractionDateTime || '-'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Execution Status</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                {executiveSummaryReport?.executionStatus || 'Completed'}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Validation Start Date Time</span>
              <strong style={{ color: '#0F172A', fontSize: '11.5px' }}>{executiveSummaryReport?.validationStartDateTime || '-'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Validation End Date Time</span>
              <strong style={{ color: '#0F172A', fontSize: '11.5px' }}>{executiveSummaryReport?.validationEndDateTime || '-'}</strong>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Validation Status</span>
              <strong style={{ color: '#059669', fontSize: '12px', fontWeight: '800' }}>{executiveSummaryReport?.validationStatus || 'Validated'}</strong>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={() => alert(`Initiating Work On Executive Summary Report for ${job.id}`)}
              style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: '700', color: '#ffffff', backgroundColor: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <PlayCircle style={{ width: '14px', height: '14px' }} />
              <span>Work On Report</span>
            </button>

            <button
              onClick={() => alert(`Downloading Executive Summary Report for ${job.id}`)}
              style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: '700', color: '#1E293B', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <Download style={{ width: '14px', height: '14px', color: '#059669' }} />
              <span>Download Report</span>
            </button>

            <button
              onClick={() => onOpenWorkflow && onOpenWorkflow(job)}
              style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: '700', color: '#475569', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <GitBranch style={{ width: '14px', height: '14px', color: '#059669' }} />
              <span>View Workflow</span>
            </button>

            <button
              onClick={() => onOpenHistory && onOpenHistory(job)}
              style={{ padding: '7px 10px', fontSize: '11.5px', fontWeight: '700', color: '#475569', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
            >
              <History style={{ width: '14px', height: '14px', color: '#6366F1' }} />
              <span>View History</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: DISCUSSION POINTS */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #CBD5E1',
          borderRadius: '10px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Card Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #D8001D', paddingBottom: '8px' }}>
            <MessageSquare style={{ width: '18px', height: '18px', color: '#D8001D' }} />
            <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: '#991B1B', margin: 0 }}>
              Discussion Points ({discussionPoints?.count || 3})
            </h3>
          </div>

          {/* Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Start Date Time</span>
              <strong style={{ color: '#0F172A', fontSize: '11.5px' }}>{discussionPoints?.startDateTime || '-'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>End Date Time</span>
              <strong style={{ color: '#0F172A', fontSize: '11.5px' }}>{discussionPoints?.endDateTime || '-'}</strong>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>Status</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#047857', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                {discussionPoints?.status || 'Active'}
              </span>
            </div>
          </div>

          {/* Open Discussion Points Action Button */}
          <button
            onClick={() => onOpenDiscussionPoints && onOpenDiscussionPoints(job)}
            style={{
              width: '100%',
              padding: '9px 14px',
              fontSize: '12.5px',
              fontWeight: '800',
              color: '#ffffff',
              backgroundColor: '#D8001D',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px',
              boxShadow: '0 2px 4px rgba(216, 0, 29, 0.2)'
            }}
          >
            <MessageSquare style={{ width: '15px', height: '15px' }} />
            <span>Open Discussion Points</span>
            <ArrowRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

      </div>

    </aside>
  );
}
