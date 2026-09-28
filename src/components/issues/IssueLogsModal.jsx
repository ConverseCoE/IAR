import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, History, Clock, ArrowRight, Sparkles, Filter, 
  AlertCircle, RotateCcw, Send, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { 
  getLogsByIssueId, 
  getAuditReportLogs, 
  subscribeToLogUpdates 
} from '../../utils/auditLogEngine';

export default function IssueLogsModal({ 
  isOpen, 
  report, 
  issue,
  issueId,
  engagementId,
  onClose,
  logs,
  title,
  category,
  description
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe to live log emissions
  useEffect(() => {
    const unsubscribe = subscribeToLogUpdates(() => {
      setRefreshTrigger(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const resolvedIssueId = issueId || issue?.id || issue?.issueId;
  const resolvedEngId = engagementId || report?.id || report?.jobId || report?.reportId || issue?.engagementId;
  const fileName = report ? (report.fileName || report.fullName) : (issue?.title || "Audit Finding");

  // Determine logs source
  const effectiveLogs = useMemo(() => {
    if (logs && logs.length > 0) return logs;
    if (resolvedIssueId) {
      const issueLogs = getLogsByIssueId(resolvedIssueId);
      if (issueLogs && issueLogs.length > 0) return issueLogs;
    }
    if (resolvedEngId) {
      const engLogs = getAuditReportLogs(resolvedEngId, true);
      if (engLogs && engLogs.length > 0) return engLogs;
    }
    return [];
  }, [logs, resolvedIssueId, resolvedEngId, refreshTrigger]);

  // Dynamic modal title and category
  const modalCategory = category || (resolvedIssueId ? `Issue Audit Trail — ${resolvedIssueId}` : "Engagement Audit History");
  const modalTitle = title || (resolvedIssueId ? (issue?.header || issue?.title || `Finding History — ${resolvedIssueId}`) : `History Log — ${fileName}`);
  const modalDescription = description || (resolvedIssueId 
    ? "Complete tamper-evident track changes, AI refinements, and workflow transitions for this issue" 
    : "Audit engagement lifecycle, batch clearance milestones, and report sign-offs");

  // Filter logs by active category tab
  const filteredLogs = useMemo(() => {
    if (activeFilter === 'ALL') return effectiveLogs;
    if (activeFilter === 'WORKFLOW') {
      return effectiveLogs.filter(l => 
        l.category === 'WORKFLOW_TRANSITION' || 
        l.category?.includes('BATCH') || 
        l.category?.includes('DIRECTOR') || 
        l.category?.includes('VP') || 
        l.badgeType === 'workflow' ||
        l.badgeType === 'director' ||
        l.badgeType === 'signoff'
      );
    }
    if (activeFilter === 'FIELD_EDIT') {
      return effectiveLogs.filter(l => l.category === 'FIELD_EDIT' || l.badgeType === 'update' || l.badgeType === 'matrix' || l.badgeType === 'scope');
    }
    if (activeFilter === 'AI') {
      return effectiveLogs.filter(l => l.category?.includes('AI') || l.badgeType === 'ai');
    }
    if (activeFilter === 'GOVERNANCE') {
      return effectiveLogs.filter(l => 
        l.category === 'CALL_BACK' || 
        l.category === 'SEND_TO' || 
        l.category === 'NOT_MY_FUNCTION' || 
        l.category === 'EXCLUSION_TOGGLE' ||
        l.badgeType === 'callback' ||
        l.badgeType === 'reroute' ||
        l.badgeType === 'function' ||
        l.badgeType === 'exclude'
      );
    }
    return effectiveLogs;
  }, [effectiveLogs, activeFilter]);

  if (!isOpen) return null;

  const renderBadge = (type) => {
    let bg = '#EEF2FF'; let text = '#4338CA'; let label = 'Updated';
    if (type === 'create') { bg = '#EFF6FF'; text = '#1D4ED8'; label = 'Created'; }
    else if (type === 'workflow') { bg = '#F0FDF4'; text = '#15803D'; label = 'Workflow'; }
    else if (type === 'ai') { bg = '#F5F3FF'; text = '#7C3AED'; label = 'AI Generated'; }
    else if (type === 'callback') { bg = '#FEF2F2'; text = '#B91C1C'; label = 'Called Back'; }
    else if (type === 'reroute') { bg = '#FFFBEB'; text = '#B45309'; label = 'Re-routed'; }
    else if (type === 'function') { bg = '#ECFDF5'; text = '#047857'; label = 'Not My Function'; }
    else if (type === 'exclude') { bg = '#FFF1F2'; text = '#BE123C'; label = 'Excluded'; }
    else if (type === 'director') { bg = '#EFF6FF'; text = '#1E40AF'; label = 'Director Review'; }
    else if (type === 'signoff') { bg = '#ECFDF5'; text = '#065F46'; label = 'VP Sign-Off'; }
    else if (type === 'response') { bg = '#F0FDFA'; text = '#0F766E'; label = 'Biz Response'; }
    else if (type === 'matrix') { bg = '#FEF3C7'; text = '#92400E'; label = 'Matrix Adjusted'; }
    else if (type === 'scope') { bg = '#F3E8FF'; text = '#6B21A8'; label = 'Scope Modified'; }
    else if (type === 'comment') { bg = '#EFF6FF'; text = '#2563EB'; label = 'Comment'; }
    else if (type === 'issue') { bg = '#FFF0F2'; text = '#D8001D'; label = 'Issue Logged'; }

    return (
      <span style={{ 
        fontSize: '11px', 
        fontWeight: '700', 
        padding: '3px 8px', 
        borderRadius: '6px', 
        backgroundColor: bg, 
        color: text,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {type === 'ai' && <Sparkles style={{ width: '11px', height: '11px' }} />}
        {label}
      </span>
    );
  };

  const getActorInitials = (name = 'User') => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', zIndex: 1500 }}>
      {/* Right Overlay Drawer Panel */}
      <aside style={{
        width: '640px',
        maxWidth: '94vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        animation: 'slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0F172A',
          color: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#F87171', letterSpacing: '0.9px' }}>
                {modalCategory}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: '600' }}>
                {effectiveLogs.length} logged event{effectiveLogs.length === 1 ? '' : 's'}
              </span>
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#FFFFFF', lineHeight: 1.3 }}>
              {modalTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '7px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            title="Close Drawer"
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div style={{
          padding: '10px 24px',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto'
        }}>
          <Filter style={{ width: '13px', height: '13px', color: '#64748B', flexShrink: 0 }} />
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'WORKFLOW', label: 'Workflow' },
            { id: 'FIELD_EDIT', label: 'Field Edits' },
            { id: 'AI', label: 'AI Magic Wand' },
            { id: 'GOVERNANCE', label: 'Governance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: activeFilter === tab.id ? '700' : '600',
                borderRadius: '6px',
                border: activeFilter === tab.id ? '1px solid #CBD5E1' : '1px solid transparent',
                backgroundColor: activeFilter === tab.id ? '#FFFFFF' : 'transparent',
                color: activeFilter === tab.id ? '#0F172A' : '#64748B',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: activeFilter === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Timeline Body */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '12px', fontWeight: '600' }}>
            <History style={{ width: '15px', height: '15px', color: '#D8001D' }} />
            <span>{modalDescription}</span>
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: '#F8FAFC',
              border: '1px dashed #CBD5E1',
              borderRadius: '8px',
              color: '#64748B'
            }}>
              <AlertCircle style={{ width: '28px', height: '28px', color: '#94A3B8', margin: '0 auto 8px auto' }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#334155' }}>No events recorded for this category</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px' }}>Events will appear as actions are performed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '8px' }}>
              
              {/* Vertical Timeline Line */}
              <div style={{
                position: 'absolute',
                top: '14px',
                bottom: '14px',
                left: '21px',
                width: '2px',
                backgroundColor: '#E2E8F0',
                zIndex: 1
              }} />

              {filteredLogs.map((log) => {
                const actorName = log.actor?.name || log.user || 'Team Member';
                const actorRole = log.actor?.role || log.role || 'Auditor';
                const actorInitials = getActorInitials(actorName);
                const isAI = (log.actor?.userId === 'SYS-AI' || log.category?.includes('AI') || log.badgeType === 'ai');

                return (
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
                      backgroundColor: isAI ? '#7C3AED' : '#ffffff',
                      border: isAI ? '2px solid #6D28D9' : '2px solid #D8001D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      color: isAI ? '#ffffff' : '#D8001D'
                    }}>
                      {isAI ? (
                        <Sparkles style={{ width: '13px', height: '13px' }} />
                      ) : (
                        <Clock style={{ width: '13px', height: '13px' }} />
                      )}
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: isAI ? '#7C3AED' : '#0F172A',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10.5px',
                            fontWeight: '800'
                          }}>
                            {isAI ? 'AI' : actorInitials}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                            {actorName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>({actorRole})</span>
                        </div>

                        {renderBadge(log.badgeType)}
                      </div>

                      {/* Action Title */}
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                        {log.action}
                      </p>

                      {/* Field Changes Detail Box (if oldValue or newValue exists) */}
                      {(log.fieldChanged || log.oldValue || log.newValue) && (
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
                          {log.fieldChanged && (
                            <span style={{ fontWeight: '700', color: '#475569' }}>
                              Field: <strong style={{ color: '#0F172A' }}>{log.fieldChanged}</strong>
                            </span>
                          )}

                          {log.oldValue && log.oldValue !== '-' && (
                            <div style={{ color: '#94A3B8', textDecoration: 'line-through' }}>
                              Previous: {log.oldValue}
                            </div>
                          )}

                          {log.newValue && (
                            <div style={{ color: '#047857', fontWeight: '700', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                              <ArrowRight style={{ width: '12px', height: '12px', marginTop: '2px', flexShrink: 0 }} />
                              <span>New: {log.newValue}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Call Back Reason Callout Box */}
                      {log.details?.reason && (
                        <div style={{
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '11.5px',
                          color: '#991B1B'
                        }}>
                          <strong>Mandatory Callback Justification:</strong> {log.details.reason}
                        </div>
                      )}

                      {/* Governance Re-route / Delegation Reason */}
                      {log.details?.notes && (
                        <div style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '11.5px',
                          color: '#1E40AF'
                        }}>
                          <strong>Routing Note:</strong> {log.details.notes}
                        </div>
                      )}

                      {/* AI Version Comparison Card Selection */}
                      {log.details?.versionComparison && (
                        <div style={{
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #DDD6FE',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '11.5px',
                          color: '#5B21B6'
                        }}>
                          <strong>Version Comparison:</strong> Adopted {log.details.versionComparison.adoptedVersion}.
                          {log.details.diffSummary && (
                            <div style={{ marginTop: '2px', color: '#6D28D9' }}>
                              {log.details.diffSummary}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Batch Clearance Gate Details */}
                      {log.details?.gateRule && (
                        <div style={{
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '11.5px',
                          color: '#065F46'
                        }}>
                          <strong>Batch Clearance Gate:</strong> All {log.details.totalIssuesCompiled || 'issues'} cleared by Manager. Engagement compiled and advanced.
                        </div>
                      )}

                      {/* Timestamp Footer */}
                      <span style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'right', marginTop: '2px' }}>
                        {log.displayTime || log.timestamp}
                      </span>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </div>

      </aside>
    </div>
  );
}
