import React from 'react';
import { X, History, User, Clock, CheckCircle2, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export default function HistoryModal({ isOpen, report, onClose }) {
  if (!isOpen) return null;

  const fileName = report ? report.fileName : "BiosenseWebster_Catheters_Audit";

  // Mock Audit Log Trail Data
  const historyLogs = [
    {
      id: "LOG-001",
      timestamp: "Today at 09:42 AM",
      date: "08/01/2026",
      user: "Kevin Zhang",
      role: "IT Audit Lead",
      action: "Updated Discussion Point & Re-generated AI Insights",
      fieldChanged: "Root Cause & Telemetry Logs",
      oldValue: "Initial automated calibration drift observation",
      newValue: "Systemic telemetry drift identified in Catheter Line 3 due to thermal excursions",
      badgeType: "update"
    },
    {
      id: "LOG-002",
      timestamp: "Yesterday at 04:15 PM",
      date: "07/31/2026",
      user: "Marcus Vance",
      role: "Quality Assurance",
      action: "Toggled Issue Indicator Status",
      fieldChanged: "Issue Indicator Status",
      oldValue: "Not an issue",
      newValue: "Marked as Active Issue (Criticality: High)",
      badgeType: "issue"
    },
    {
      id: "LOG-003",
      timestamp: "07/30/2026 at 02:30 PM",
      date: "07/30/2026",
      user: "Rachel Green",
      role: "FinOps Lead",
      action: "Delegated Primary Contact",
      fieldChanged: "Primary Business Contact",
      oldValue: "Kevin Zhang (IT Lead)",
      newValue: "Delegated to: Dr. Alexander Wright (Compliance Director)",
      badgeType: "delegate"
    },
    {
      id: "LOG-004",
      timestamp: "07/29/2026 at 11:00 AM",
      date: "07/29/2026",
      user: "System AI Engine",
      role: "Automated Compliance Audit",
      action: "Initial Discussion Point Generation",
      fieldChanged: "All Fields",
      oldValue: "-",
      newValue: "Record created and GxP compliance pipeline initiated",
      badgeType: "create"
    }
  ];

  const renderBadge = (type) => {
    let bg = '#EEF2FF'; let text = '#4338CA'; let label = 'Updated';
    if (type === 'issue') { bg = '#FFF0F2'; text = '#D8001D'; label = 'Issue Logged'; }
    else if (type === 'delegate') { bg = '#ECFDF5'; text = '#047857'; label = 'Delegated'; }
    else if (type === 'create') { bg = '#EFF6FF'; text = '#2563EB'; label = 'Created'; }

    return (
      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: bg, color: text }}>
        {label}
      </span>
    );
  };

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', zIndex: 125 }}>
      
      {/* Right Overlay Drawer Panel */}
      <aside style={{
        width: '580px',
        maxWidth: '92vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--slate-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0F172A',
          color: '#ffffff'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#FCA5A5', letterSpacing: '0.8px' }}>
              Audit History & Logs
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, marginTop: '2px' }}>
              History Log — {fileName}
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

        {/* Scrollable Timeline Body */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '12.5px', fontWeight: '600' }}>
            <History style={{ width: '16px', height: '16px', color: '#6366F1' }} />
            <span>Complete audit trail and change history for this record</span>
          </div>

          {/* Timeline Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '8px' }}>
            
            {/* Vertical Timeline Line */}
            <div style={{
              position: 'absolute',
              top: '12px',
              bottom: '12px',
              left: '21px',
              width: '2px',
              backgroundColor: '#E2E8F0',
              zIndex: 1
            }}></div>

            {historyLogs.map((log) => (
              <div 
                key={log.id} 
                style={{
                  display: 'flex',
                  gap: '16px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {/* Timeline Dot Icon */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2px solid #6366F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <Clock style={{ width: '14px', height: '14px', color: '#6366F1' }} />
                </div>

                {/* Timeline Event Card */}
                <div style={{
                  flex: 1,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}>
                  
                  {/* Top Header Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                        {log.user}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>({log.role})</span>
                    </div>

                    {renderBadge(log.badgeType)}
                  </div>

                  {/* Action Title */}
                  <p style={{ fontSize: '12.5px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                    {log.action}
                  </p>

                  {/* Field Changes Detail Box */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '11.5px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontWeight: '700', color: '#475569' }}>
                      Field: <strong style={{ color: '#0F172A' }}>{log.fieldChanged}</strong>
                    </span>

                    {log.oldValue !== '-' && (
                      <div style={{ color: '#94A3B8', textDecoration: 'line-through' }}>
                        Previous: {log.oldValue}
                      </div>
                    )}

                    <div style={{ color: '#047857', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowRight style={{ width: '12px', height: '12px' }} />
                      <span>New: {log.newValue}</span>
                    </div>
                  </div>

                  {/* Timestamp Footer */}
                  <span style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'right' }}>
                    {log.timestamp}
                  </span>

                </div>
              </div>
            ))}

          </div>

        </div>

      </aside>

    </div>
  );
}
