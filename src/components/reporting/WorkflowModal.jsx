import React from 'react';
import { 
  X, CheckCircle2, Clock, ShieldCheck, Cpu, TrendingUp, 
  GitBranch, AlertCircle, ArrowRight, User, Layers 
} from 'lucide-react';
import { getIssuesByEngagement, getUsersByEngagementAndRole } from '../../data/assignmentsData';
import { getEngagementWorkflowState } from '../../utils/auditWorkflowEngine';

/**
 * Dynamically resolves an individual issue's progression status across each workflow stage
 */
export const resolveIssueStageStatuses = (issue) => {
  const s = (issue.status || '').toLowerCase();
  const isExcluded = !!issue.isExcluded;

  // Baseline stage statuses
  let staff = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
  let tc = { label: 'Pending', color: '#94A3B8', bg: '#F8FAFC' };
  let manager = { label: 'Pending', color: '#94A3B8', bg: '#F8FAFC' };
  let director = { label: 'Pending', color: '#94A3B8', bg: '#F8FAFC' };
  let vp = { label: 'Pending', color: '#94A3B8', bg: '#F8FAFC' };
  let business = { label: 'Not Required', color: '#94A3B8', bg: '#F8FAFC' };

  if (s.includes('staff') || s === 'draft') {
    staff = { label: '⏳ In Progress', color: '#2563EB', bg: '#EFF6FF' };
  } else if (s.includes('tc') || s.includes('coordinator')) {
    staff = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    tc = { label: '⏳ In Progress', color: '#D97706', bg: '#FEF3C7' };
  } else if (s.includes('business') || s.includes('response')) {
    staff = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    tc = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    manager = { label: '⏳ Biz Response', color: '#0284C7', bg: '#F0F9FF' };
    business = { label: '⏳ In Progress', color: '#0284C7', bg: '#F0F9FF' };
  } else if (s.includes('waiting on other') || s.includes('waiting other') || s.includes('manager completed')) {
    staff = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    tc = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    manager = { label: '✓ Cleared (Wait)', color: '#047857', bg: '#ECFDF5' };
    director = { label: 'Pending Batch', color: '#64748B', bg: '#F1F5F9' };
  } else if (s.includes('manager')) {
    staff = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    tc = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    manager = { label: '⏳ In Progress', color: '#D8001D', bg: '#FFF0F2' };
  } else if (s.includes('director')) {
    staff = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    tc = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    manager = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    director = { label: '⏳ In Progress', color: '#1D4ED8', bg: '#EFF6FF' };
  } else if (s.includes('vp')) {
    staff = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    tc = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    manager = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    director = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    vp = { label: '⏳ In Review', color: '#7C3AED', bg: '#F5F3FF' };
  } else if (s === 'signed off' || s === 'completed') {
    staff = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    tc = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    manager = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    director = { label: '✓ Completed', color: '#166534', bg: '#F0FDF4' };
    vp = { label: '✓ Signed Off', color: '#166534', bg: '#F0FDF4' };
  } else if (s === 'called back') {
    manager = { label: '↺ Called Back', color: '#B91C1C', bg: '#FEF2F2' };
  } else if (s.includes('not my function')) {
    tc = { label: 'Out of Scope', color: '#059669', bg: '#ECFDF5' };
  }

  return { staff, tc, manager, director, vp, business, isExcluded };
};

export default function WorkflowModal({
  isOpen,
  title,
  report,
  job,
  workflows,
  issues: issuesProp,
  onClose,
  type = 'executive'
}) {
  if (!isOpen) return null;

  const currentJob = job || report || {};
  const jobId = currentJob.jobId || currentJob.id || currentJob.reportId || "REP-2026-001";
  let auditTitle = currentJob.fileName || currentJob.fullName || currentJob.engagement || jobId;
  auditTitle = auditTitle.replace(/_?pipeline/gi, '').trim();

  // Detect whether this is an Audit Report workflow or Executive Summary workflow
  const isAuditWorkflow = type === 'audit' ||
    (title && title.toLowerCase().includes('audit report')) ||
    (currentJob.type === 'audit');

  const defaultTitle = isAuditWorkflow
    ? "Audit Report Workflow Pipeline"
    : "Executive Summary Workflow";

  let displayTitle = (title || defaultTitle).replace(/\s*pipeline\s*/gi, ' ').trim();
  if (!displayTitle || displayTitle.toLowerCase() === 'workflow stages') {
    displayTitle = defaultTitle;
  }

  // Dynamically resolve real issues for this engagement
  const realIssues = (issuesProp && issuesProp.length > 0)
    ? issuesProp
    : ((currentJob.issuesList && currentJob.issuesList.length > 0)
        ? currentJob.issuesList
        : getIssuesByEngagement(jobId));

  // Partition real issues by domain
  const itIssues = realIssues.filter(i => {
    const f = (i.function || i.functionType || i.tech || 'IT').toLowerCase();
    return f.includes('it') || f.includes('tech');
  });

  const finOpsIssues = realIssues.filter(i => {
    const f = (i.function || i.functionType || i.tech || '').toLowerCase();
    return f.includes('finops') || f.includes('finance');
  });

  const otherIssues = realIssues.filter(i => !itIssues.includes(i) && !finOpsIssues.includes(i));

  // Dynamically resolve team members assigned to this engagement
  const workflowState = getEngagementWorkflowState(currentJob);
  const tcUsers = getUsersByEngagementAndRole(jobId, 'it-team-coordinator')
    .concat(getUsersByEngagementAndRole(jobId, 'finops-team-coordinator'));
  const mgrUsers = getUsersByEngagementAndRole(jobId, 'it-manager')
    .concat(getUsersByEngagementAndRole(jobId, 'finops-manager'));
  const dirUsers = getUsersByEngagementAndRole(jobId, 'it-director')
    .concat(getUsersByEngagementAndRole(jobId, 'finops-director'));
  const vpUsers = getUsersByEngagementAndRole(jobId, 'it-vp')
    .concat(getUsersByEngagementAndRole(jobId, 'finops-vp'));

  const leadTC = tcUsers[0]?.name || 'Kevin Zhang';
  const leadMgr = mgrUsers[0]?.name || 'Amanda Palmer';
  const leadDir = dirUsers[0]?.name || 'Brian Cox';
  const leadVP = vpUsers[0]?.name || 'Robert Chen';

  // Helper to compute domain metrics
  const computeDomainMetrics = (issueArray) => {
    const total = issueArray.length;
    if (total === 0) {
      return { total: 0, tcCompleted: 0, tcActive: 0, mgrCompleted: 0, mgrActive: 0, bizActive: 0, dirActive: 0, vpActive: 0, isAllCleared: false };
    }
    let tcCompleted = 0;
    let tcActive = 0;
    let mgrCompleted = 0;
    let mgrActive = 0;
    let bizActive = 0;
    let dirActive = 0;
    let vpActive = 0;

    issueArray.forEach(iss => {
      const stage = resolveIssueStageStatuses(iss);
      if (stage.tc.label.includes('Completed')) tcCompleted++;
      if (stage.tc.label.includes('In Progress')) tcActive++;
      if (stage.manager.label.includes('Completed') || stage.manager.label.includes('Cleared')) mgrCompleted++;
      if (stage.manager.label.includes('In Progress')) mgrActive++;
      if (stage.business.label.includes('In Progress')) bizActive++;
      if (stage.director.label.includes('In Progress')) dirActive++;
      if (stage.vp.label.includes('In Review') || stage.vp.label.includes('Signed Off')) vpActive++;
    });

    const isAllCleared = (mgrCompleted === total && total > 0);

    return { total, tcCompleted, tcActive, mgrCompleted, mgrActive, bizActive, dirActive, vpActive, isAllCleared };
  };

  const itMetrics = computeDomainMetrics(itIssues);
  const finOpsMetrics = computeDomainMetrics(finOpsIssues);

  // Pipeline diagram renderer component for a domain category
  const renderPipelineDiagram = ({ domainLabel, metrics, themeColor, themeBg, themeBorder, icon: DomainIcon }) => {
    const { total, tcCompleted, tcActive, mgrCompleted, mgrActive, bizActive, dirActive, vpActive, isAllCleared } = metrics;

    if (total === 0) {
      return (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #CBD5E1',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#64748B'
        }}>
          <DomainIcon style={{ width: '20px', height: '20px', color: themeColor }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{domainLabel} Workflow Pipeline</div>
            <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>No findings currently mapped to this functional domain for this engagement.</div>
          </div>
        </div>
      );
    }

    // Dynamic connectors
    const isConn1Done = tcCompleted === total;
    const isConn2Done = isAllCleared;
    const isConn3Done = vpActive === total && total > 0;

    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #CBD5E1',
        borderRadius: '16px',
        padding: '22px 20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
      }}>
        {/* Domain Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '900', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DomainIcon style={{ width: '18px', height: '18px', color: themeColor }} />
            <span>{domainLabel} Workflow Pipeline ({total} Finding{total === 1 ? '' : 's'})</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '800', color: themeColor, backgroundColor: themeBg, padding: '3px 10px', borderRadius: '9999px', border: `1px solid ${themeBorder}` }}>
            TC: {tcCompleted}/{total} | Manager: {mgrCompleted}/{total} | Director: {dirActive}/{total}
          </span>
        </div>

        {/* Dynamic Pipeline Canvas */}
        <div style={{ position: 'relative', width: '100%', minHeight: '180px' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <marker id={`arrow-${domainLabel}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={isConn1Done ? '#166534' : themeColor} />
              </marker>
              <marker id={`arrow-mgr-${domainLabel}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={isConn2Done ? '#166534' : '#94A3B8'} />
              </marker>
            </defs>

            {/* TC to Manager */}
            <line 
              x1="90" y1="35" x2="200" y2="35" 
              stroke={isConn1Done ? '#166534' : (tcActive > 0 ? themeColor : '#CBD5E1')} 
              strokeWidth={isConn1Done || tcActive > 0 ? 3 : 2} 
              markerEnd={`url(#arrow-${domainLabel})`} 
            />

            {/* Manager to Director */}
            <line 
              x1="340" y1="35" x2="430" y2="35" 
              stroke={isConn2Done ? '#166534' : '#CBD5E1'} 
              strokeWidth={isConn2Done ? 3 : 2} 
              strokeDasharray={isConn2Done ? 'none' : '5,5'} 
              markerEnd={`url(#arrow-mgr-${domainLabel})`} 
            />

            {/* Director to Final Report */}
            <line 
              x1="550" y1="35" x2="610" y2="35" 
              stroke={isConn3Done ? '#166534' : '#CBD5E1'} 
              strokeWidth={isConn3Done ? 3 : 2} 
              strokeDasharray={isConn3Done ? 'none' : '5,5'} 
            />

            {/* Branch: Manager to Management Response */}
            <path 
              d="M 270 55 L 270 125 L 430 125" 
              fill="none" 
              stroke={bizActive > 0 ? '#0284C7' : '#E2E8F0'} 
              strokeWidth={bizActive > 0 ? 2.5 : 2} 
              strokeDasharray={bizActive > 0 ? 'none' : '4,4'} 
            />
          </svg>

          {/* Nodes */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            
            {/* Node 1: TC */}
            <div style={{ position: 'absolute', left: '0%', top: '10px', pointerEvents: 'auto' }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: isConn1Done ? '2px solid #166534' : (tcActive > 0 ? `2.5px solid ${themeColor}` : '1.5px solid #CBD5E1'),
                borderRadius: '10px',
                padding: '6px 12px',
                boxShadow: isConn1Done ? '0 2px 8px rgba(22,101,52,0.12)' : '0 2px 6px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  backgroundColor: isConn1Done ? '#F0FDF4' : (tcActive > 0 ? themeBg : '#F1F5F9'),
                  color: isConn1Done ? '#166534' : (tcActive > 0 ? themeColor : '#64748B'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {isConn1Done ? <CheckCircle2 style={{ width: '14px', height: '14px' }} /> : <Clock style={{ width: '14px', height: '14px' }} />}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#0F172A' }}>TC Review</div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: isConn1Done ? '#166534' : (tcActive > 0 ? themeColor : '#94A3B8') }}>
                    {isConn1Done ? `Completed (${tcCompleted}/${total})` : (tcActive > 0 ? `In Progress (${tcActive}/${total})` : 'Pending')}
                  </div>
                </div>
              </div>
            </div>

            {/* Node 2: Audit Manager */}
            <div style={{ position: 'absolute', left: '26%', top: '8px', pointerEvents: 'auto' }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: isConn2Done ? '2px solid #166534' : (mgrActive > 0 ? '2.5px solid #D8001D' : '1.5px solid #CBD5E1'),
                borderRadius: '10px',
                padding: '6px 12px',
                boxShadow: mgrActive > 0 ? '0 4px 16px rgba(216,0,29,0.2)' : '0 2px 6px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  backgroundColor: isConn2Done ? '#F0FDF4' : (mgrActive > 0 ? '#FFF0F2' : '#F1F5F9'),
                  color: isConn2Done ? '#166534' : (mgrActive > 0 ? '#D8001D' : '#64748B'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {isConn2Done ? <CheckCircle2 style={{ width: '14px', height: '14px' }} /> : <Clock style={{ width: '14px', height: '14px' }} />}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#0F172A' }}>Audit Manager</div>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: isConn2Done ? '#166534' : (mgrActive > 0 ? '#D8001D' : '#94A3B8') }}>
                    {isConn2Done ? `Cleared (${mgrCompleted}/${total})` : (mgrActive > 0 ? `In Progress (${mgrActive}/${total})` : 'Pending')}
                  </div>
                </div>
              </div>
            </div>

            {/* Node 3: Director Clearance (Batch gate) */}
            <div style={{ position: 'absolute', left: '56%', top: '10px', pointerEvents: 'auto' }}>
              <div style={{
                backgroundColor: dirActive > 0 ? '#EFF6FF' : '#F8FAFC',
                border: dirActive > 0 ? '2px solid #2563EB' : '1.5px solid #CBD5E1',
                borderRadius: '10px',
                padding: '6px 12px',
                boxShadow: dirActive > 0 ? '0 4px 12px rgba(37,99,235,0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: dirActive > 0 ? '#DBEAFE' : '#E2E8F0',
                  color: dirActive > 0 ? '#1D4ED8' : '#64748B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '800'
                }}>
                  {dirActive > 0 ? <Clock style={{ width: '12px', height: '12px' }} /> : '3'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: dirActive > 0 ? '#1E3A8A' : '#475569' }}>Director Review</div>
                  <div style={{ fontSize: '9.5px', fontWeight: '700', color: dirActive > 0 ? '#2563EB' : (isAllCleared ? 'Batch Ready' : 'Pending Batch') }}>
                    {dirActive > 0 ? `In Review (${dirActive}/${total})` : (isAllCleared ? 'Cleared for Director' : 'Waiting on All Issues')}
                  </div>
                </div>
              </div>
            </div>

            {/* Node 4: Final Report / VP SignOff */}
            <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
              <div style={{
                backgroundColor: vpActive > 0 ? '#FAF5FF' : '#F8FAFC',
                border: vpActive > 0 ? '2px solid #7C3AED' : '1.5px solid #CBD5E1',
                borderRadius: '10px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: vpActive > 0 ? '#F3E8FF' : '#E2E8F0',
                  color: vpActive > 0 ? '#7C3AED' : '#64748B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '800'
                }}>
                  {vpActive > 0 ? <Clock style={{ width: '12px', height: '12px' }} /> : '4'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: vpActive > 0 ? '#581C87' : '#475569' }}>VP Sign-Off</div>
                  <div style={{ fontSize: '9.5px', fontWeight: '600', color: vpActive > 0 ? '#7C3AED' : '#94A3B8' }}>
                    {vpActive > 0 ? 'VP Review' : 'Not Started'}
                  </div>
                </div>
              </div>
            </div>

            {/* Node 5: Branch - Management Response */}
            <div style={{ position: 'absolute', left: '52%', top: '100px', pointerEvents: 'auto' }}>
              <div style={{
                backgroundColor: bizActive > 0 ? '#F0F9FF' : '#F8FAFC',
                border: bizActive > 0 ? '2px solid #0284C7' : '1.5px solid #CBD5E1',
                borderRadius: '10px',
                padding: '6px 12px',
                boxShadow: bizActive > 0 ? '0 4px 12px rgba(2,132,199,0.18)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: bizActive > 0 ? '#E0F2FE' : '#E2E8F0',
                  color: bizActive > 0 ? '#0369A1' : '#64748B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '800'
                }}>
                  {bizActive > 0 ? <Clock style={{ width: '12px', height: '12px' }} /> : 'B'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: bizActive > 0 ? '#075985' : '#475569' }}>Management Response</div>
                  <div style={{ fontSize: '9.5px', fontWeight: '700', color: bizActive > 0 ? '#0284C7' : '#94A3B8' }}>
                    {bizActive > 0 ? `Active: ${bizActive} Finding(s)` : 'Pending Owner Input'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1500
      }}
      onClick={onClose}
    >
      {/* 820px Wide Drawer Panel */}
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
          animation: 'slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Dark Drawer Header */}
        <div style={{
          padding: '18px 24px',
          backgroundColor: '#0F172A',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#60A5FA', letterSpacing: '0.8px' }}>
                {isAuditWorkflow ? 'Audit Report Workflow Engine' : 'Executive Report Pipeline'}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: '600' }}>
                Queue: <strong style={{ color: '#F87171' }}>{workflowState.queue}</strong>
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitBranch style={{ width: '18px', height: '18px', color: isAuditWorkflow ? '#60A5FA' : '#38BDF8' }} />
              <span>{displayTitle}</span>
            </h3>
            <div style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '2px' }}>
              {auditTitle} ({realIssues.length} Findings)
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
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

        {/* Scrollable Workflow Content */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {isAuditWorkflow ? (
            /* ============================================================== */
            /* AUDIT REPORT WORKFLOW (DYNAMIC IT & FINOPS PIPELINES + MATRIX)  */
            /* ============================================================== */
            <>
              {/* IT Issues Pipeline */}
              {renderPipelineDiagram({
                domainLabel: 'IT & Digital Systems',
                metrics: itMetrics,
                themeColor: '#2563EB',
                themeBg: '#EFF6FF',
                themeBorder: '#BFDBFE',
                icon: Cpu
              })}

              {/* FinOps Issues Pipeline */}
              {renderPipelineDiagram({
                domainLabel: 'FinOps & Supply Chain',
                metrics: finOpsMetrics,
                themeColor: '#059669',
                themeBg: '#ECFDF5',
                themeBorder: '#A7F3D0',
                icon: TrendingUp
              })}

              {/* DYNAMIC ISSUE & ROLE LEVEL WORKFLOW STATUS MATRIX */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                    <span>Issue &amp; Role Level Workflow Status Matrix</span>
                  </h4>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                    Total Findings: {realIssues.length}
                  </span>
                </div>

                {realIssues.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                    <AlertCircle style={{ width: '24px', height: '24px', margin: '0 auto 6px auto', color: '#94A3B8' }} />
                    <div style={{ fontSize: '12.5px', fontWeight: '700' }}>No findings drafted for this audit yet</div>
                    <div style={{ fontSize: '11px' }}>Findings will appear dynamically in this matrix as they are created.</div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', color: '#475569', borderBottom: '1px solid #CBD5E1' }}>
                          <th style={{ padding: '8px 12px', fontWeight: '800' }}>Issue ID &amp; Finding Title</th>
                          <th style={{ padding: '8px 10px', fontWeight: '800', width: '90px' }}>Domain</th>
                          <th style={{ padding: '8px 12px', fontWeight: '800', width: '110px' }}>TC Auditor</th>
                          <th style={{ padding: '8px 12px', fontWeight: '800', width: '130px' }}>Audit Manager</th>
                          <th style={{ padding: '8px 12px', fontWeight: '800', width: '110px' }}>Director</th>
                          <th style={{ padding: '8px 12px', fontWeight: '800', width: '130px' }}>Overall Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {realIssues.map((issue) => {
                          const stages = resolveIssueStageStatuses(issue);
                          const domainTag = (issue.function || issue.functionType || issue.tech || 'IT');
                          const isIT = domainTag.toLowerCase().includes('it');

                          return (
                            <tr key={issue.id} style={{ borderBottom: '1px solid #E2E8F0', opacity: issue.isExcluded ? 0.6 : 1 }}>
                              <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: '800', color: '#2563EB' }}>{issue.id}</span>
                                  <span>{issue.header || issue.title}</span>
                                  {issue.isExcluded && (
                                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#BE123C', backgroundColor: '#FFE4E6', padding: '1px 5px', borderRadius: '4px' }}>
                                      EXCLUDED
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td style={{ padding: '8px 10px' }}>
                                <span style={{
                                  fontSize: '10px', fontWeight: '800',
                                  padding: '2px 6px', borderRadius: '4px',
                                  backgroundColor: isIT ? '#EFF6FF' : '#ECFDF5',
                                  color: isIT ? '#1D4ED8' : '#047857'
                                }}>
                                  {domainTag}
                                </span>
                              </td>

                              <td style={{ padding: '8px 12px', color: stages.tc.color, fontWeight: '700' }}>
                                <span style={{ backgroundColor: stages.tc.bg, padding: '2px 6px', borderRadius: '4px' }}>
                                  {stages.tc.label}
                                </span>
                              </td>

                              <td style={{ padding: '8px 12px', color: stages.manager.color, fontWeight: '700' }}>
                                <span style={{ backgroundColor: stages.manager.bg, padding: '2px 6px', borderRadius: '4px' }}>
                                  {stages.manager.label}
                                </span>
                              </td>

                              <td style={{ padding: '8px 12px', color: stages.director.color, fontWeight: '700' }}>
                                <span style={{ backgroundColor: stages.director.bg, padding: '2px 6px', borderRadius: '4px' }}>
                                  {stages.director.label}
                                </span>
                              </td>

                              <td style={{ padding: '8px 12px' }}>
                                <span style={{
                                  fontSize: '10.5px', fontWeight: '700',
                                  color: issue.status?.includes('Manager') ? '#991B1B' : (issue.status?.includes('Director') ? '#1E40AF' : '#047857'),
                                  backgroundColor: issue.status?.includes('Manager') ? '#FEF2F2' : (issue.status?.includes('Director') ? '#EFF6FF' : '#ECFDF5'),
                                  padding: '2px 8px', borderRadius: '4px'
                                }}>
                                  {issue.status || 'Pending TC'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ============================================================== */
            /* EXECUTIVE SUMMARY WORKFLOW (4 DYNAMIC PIPELINE STAGES)         */
            /* ============================================================== */
            <>
              {/* Executive Workflow Canvas */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '24px 22px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}>
                <div style={{ position: 'relative', width: '100%', minHeight: '80px', padding: '10px 0' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <defs>
                      <marker id="arrowExec" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#166534" />
                      </marker>
                    </defs>

                    {/* Step 1 to 2 */}
                    <line x1="100" y1="35" x2="220" y2="35" stroke="#166534" strokeWidth="3" markerEnd="url(#arrowExec)" />

                    {/* Step 2 to 3 */}
                    <line 
                      x1="380" y1="35" x2="450" y2="35" 
                      stroke={workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '#166534' : '#CBD5E1'} 
                      strokeWidth={2.5} 
                      strokeDasharray={workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? 'none' : '5,5'} 
                    />

                    {/* Step 3 to 4 */}
                    <line 
                      x1="570" y1="35" x2="620" y2="35" 
                      stroke={workflowState.status === 'Completed' ? '#166534' : '#CBD5E1'} 
                      strokeWidth={2.5} 
                      strokeDasharray={workflowState.status === 'Completed' ? 'none' : '5,5'} 
                    />
                  </svg>

                  {/* HTML Node Cards */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    
                    {/* Node 1: AI Draft */}
                    <div style={{ position: 'absolute', left: '0%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '2px solid #166534', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 style={{ width: '15px', height: '15px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A' }}>AI Draft</div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#166534' }}>Synthesized</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 2: Manager Review */}
                    <div style={{ position: 'absolute', left: '30%', top: '6px', pointerEvents: 'auto' }}>
                      <div style={{
                        backgroundColor: '#ffffff',
                        border: workflowState.queue === 'Staff' || workflowState.queue.includes('Manager') ? '2.5px solid #D8001D' : '2px solid #166534',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          backgroundColor: workflowState.queue === 'Staff' || workflowState.queue.includes('Manager') ? '#FFF0F2' : '#DCFCE7',
                          color: workflowState.queue === 'Staff' || workflowState.queue.includes('Manager') ? '#D8001D' : '#166534',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {workflowState.queue === 'Staff' || workflowState.queue.includes('Manager') ? <Clock style={{ width: '15px', height: '15px' }} /> : <CheckCircle2 style={{ width: '15px', height: '15px' }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A' }}>Manager Review</div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: workflowState.queue === 'Staff' || workflowState.queue.includes('Manager') ? '#D8001D' : '#166534' }}>
                            {workflowState.queue === 'Staff' || workflowState.queue.includes('Manager') ? 'Active Now' : 'Completed'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Node 3: Director Approval */}
                    <div style={{ position: 'absolute', left: '62%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{
                        backgroundColor: workflowState.queue === 'Director' ? '#EFF6FF' : '#F8FAFC',
                        border: workflowState.queue === 'Director' ? '2.5px solid #2563EB' : (workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '2px solid #166534' : '1.5px solid #CBD5E1'),
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          backgroundColor: workflowState.queue === 'Director' ? '#DBEAFE' : '#E2E8F0',
                          color: workflowState.queue === 'Director' ? '#1D4ED8' : '#64748B',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: '800'
                        }}>
                          {workflowState.queue === 'Director' ? <Clock style={{ width: '13px', height: '13px' }} /> : (workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? <CheckCircle2 style={{ width: '13px', height: '13px', color: '#166534' }} /> : '3')}
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569' }}>Director Review</div>
                          <div style={{ fontSize: '10px', fontWeight: '700', color: workflowState.queue === 'Director' ? '#2563EB' : '#94A3B8' }}>
                            {workflowState.queue === 'Director' ? 'Active Now' : (workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? 'Completed' : 'Pending')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Node 4: VP SignOff */}
                    <div style={{ position: 'absolute', right: '0%', top: '8px', pointerEvents: 'auto' }}>
                      <div style={{
                        backgroundColor: workflowState.queue === 'Vice President' ? '#FAF5FF' : (workflowState.status === 'Completed' ? '#F0FDF4' : '#F8FAFC'),
                        border: workflowState.queue === 'Vice President' ? '2.5px solid #7C3AED' : (workflowState.status === 'Completed' ? '2px solid #166534' : '1.5px solid #CBD5E1'),
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          backgroundColor: workflowState.queue === 'Vice President' ? '#F3E8FF' : (workflowState.status === 'Completed' ? '#DCFCE7' : '#E2E8F0'),
                          color: workflowState.queue === 'Vice President' ? '#7C3AED' : (workflowState.status === 'Completed' ? '#166534' : '#64748B'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: '800'
                        }}>
                          {workflowState.status === 'Completed' ? <CheckCircle2 style={{ width: '13px', height: '13px' }} /> : (workflowState.queue === 'Vice President' ? <Clock style={{ width: '13px', height: '13px' }} /> : '4')}
                        </div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569' }}>VP Sign-Off</div>
                          <div style={{ fontSize: '10px', fontWeight: '700', color: workflowState.status === 'Completed' ? '#166534' : (workflowState.queue === 'Vice President' ? '#7C3AED' : '#94A3B8') }}>
                            {workflowState.status === 'Completed' ? 'Signed Off' : (workflowState.queue === 'Vice President' ? 'Active Now' : 'Not Started')}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}

          {/* DYNAMIC STAGE AUDIT LOG & RESPONSIBLE PARTIES */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #CBD5E1',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: '#0F172A', margin: '0 0 14px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck style={{ width: '16px', height: '16px', color: '#059669' }} />
              <span>Engagement Governance Pipeline &amp; Responsible Parties</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              {/* Stage 1: TC Quality Review */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0'
              }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#166534', fontSize: '13px' }}>1. Quality &amp; Fieldwork Review</div>
                  <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '2px', fontWeight: '500' }}>
                    Responsible: <strong>{leadTC}</strong> (Team Coordinator)
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534', backgroundColor: '#DCFCE7', padding: '3px 10px', borderRadius: '6px' }}>
                  {realIssues.length > 0 ? '✓ Fieldwork Completed' : 'In Progress'}
                </span>
              </div>

              {/* Stage 2: Audit Manager Clearance */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: workflowState.queue.includes('Manager') ? '#FFF5F6' : (workflowState.queue === 'Director' || workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '#F0FDF4' : '#F8FAFC'),
                borderRadius: '8px',
                border: workflowState.queue.includes('Manager') ? '1.5px solid #FCA5A5' : '1px solid #E2E8F0'
              }}>
                <div>
                  <div style={{ fontWeight: '800', color: workflowState.queue.includes('Manager') ? '#D8001D' : '#0F172A', fontSize: '13px' }}>
                    2. Audit Manager Clearance &amp; Consolidation
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                    Responsible: <strong>{leadMgr}</strong> (Audit Manager)
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '800',
                  color: workflowState.queue.includes('Manager') ? '#D8001D' : (workflowState.queue === 'Director' || workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '#166534' : '#94A3B8'),
                  backgroundColor: workflowState.queue.includes('Manager') ? '#FFF0F2' : (workflowState.queue === 'Director' || workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '#DCFCE7' : '#F1F5F9'),
                  padding: '3px 10px', borderRadius: '6px'
                }}>
                  {workflowState.queue.includes('Manager') ? 'Active Now' : (workflowState.queue === 'Director' || workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '✓ Completed' : 'Pending')}
                </span>
              </div>

              {/* Stage 3: Director Clearance Gate */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: workflowState.queue === 'Director' ? '#EFF6FF' : (workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '#F0FDF4' : '#F8FAFC'),
                borderRadius: '8px',
                border: workflowState.queue === 'Director' ? '1.5px solid #93C5FD' : '1px solid #E2E8F0'
              }}>
                <div>
                  <div style={{ fontWeight: '800', color: workflowState.queue === 'Director' ? '#1D4ED8' : '#0F172A', fontSize: '13px' }}>
                    3. Director Clearance Gate (Batch Clearance)
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                    Responsible: <strong>{leadDir}</strong> (Audit Director)
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '800',
                  color: workflowState.queue === 'Director' ? '#1D4ED8' : (workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '#166534' : '#94A3B8'),
                  backgroundColor: workflowState.queue === 'Director' ? '#DBEAFE' : (workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '#DCFCE7' : '#F1F5F9'),
                  padding: '3px 10px', borderRadius: '6px'
                }}>
                  {workflowState.queue === 'Director' ? 'Active Now' : (workflowState.queue === 'Vice President' || workflowState.status === 'Completed' ? '✓ Completed' : 'Pending Batch Gate')}
                </span>
              </div>

              {/* Stage 4: Vice President Sign-Off */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: workflowState.queue === 'Vice President' ? '#FAF5FF' : (workflowState.status === 'Completed' ? '#F0FDF4' : '#F8FAFC'),
                borderRadius: '8px',
                border: workflowState.queue === 'Vice President' ? '1.5px solid #DDD6FE' : '1px solid #E2E8F0'
              }}>
                <div>
                  <div style={{ fontWeight: '800', color: workflowState.queue === 'Vice President' ? '#7C3AED' : (workflowState.status === 'Completed' ? '#166534' : '#0F172A'), fontSize: '13px' }}>
                    4. Vice President Final Sign-Off &amp; Publication
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                    Responsible: <strong>{leadVP}</strong> (Vice President)
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '800',
                  color: workflowState.status === 'Completed' ? '#166534' : (workflowState.queue === 'Vice President' ? '#7C3AED' : '#94A3B8'),
                  backgroundColor: workflowState.status === 'Completed' ? '#DCFCE7' : (workflowState.queue === 'Vice President' ? '#F3E8FF' : '#F1F5F9'),
                  padding: '3px 10px', borderRadius: '6px'
                }}>
                  {workflowState.status === 'Completed' ? '✓ Signed Off & Closed' : (workflowState.queue === 'Vice President' ? 'Active Now' : 'Not Started')}
                </span>
              </div>

            </div>
          </div>

        </div>
      </aside>
    </div>
  );
}
