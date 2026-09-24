import React from 'react';
import { X, CheckCircle2, Clock, ShieldCheck, Cpu, TrendingUp, GitBranch } from 'lucide-react';

export default function WorkflowModal({
  isOpen,
  title,
  report,
  job,
  workflows,
  issues,
  onClose,
  type = 'executive'
}) {
  if (!isOpen) return null;

  const currentJob = report || job || {};
  let auditTitle = currentJob.fileName || currentJob.engagement || currentJob.id || "MedTech Suzhou - Orthopedics Plant";
  // Remove any occurrence of pipeline in audit title
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

  // Issue partitioning for Audit Workflow
  const issueList = (issues && issues.length > 0)
    ? issues
    : (currentJob.issuesList && currentJob.issuesList.length > 0 ? currentJob.issuesList : null);

  const itIssuesFromProps = issueList ? issueList.filter(i => (i.function || i.functionType || i.tech || 'IT') === 'IT') : [];
  const finOpsIssuesFromProps = issueList ? issueList.filter(i => (i.function || i.functionType || i.tech) === 'FinOps') : [];

  const itIssues = itIssuesFromProps.length > 0 ? itIssuesFromProps : [
    { id: 'ISSUE-001', title: 'DHL & HCL account disabling delay', tcStatus: 'Completed', managerStatus: 'In Progress', directorStatus: 'Pending', overallStatus: 'Pending TC' },
    { id: 'ISSUE-002', title: 'Line 3 telemetry gain calibration drift', tcStatus: 'Completed', managerStatus: 'In Progress', directorStatus: 'Pending', overallStatus: 'Pending TC' },
    { id: 'ISSUE-003', title: 'Cleanroom HVAC temperature excursion', tcStatus: 'Completed', managerStatus: 'In Progress', directorStatus: 'Pending', overallStatus: 'In progress TC' }
  ];

  const finOpsIssues = finOpsIssuesFromProps.length > 0 ? finOpsIssuesFromProps : [
    { id: 'ISSUE-004', title: 'Third-party vendor GxP access log policy', tcStatus: 'Completed', managerStatus: 'In Progress', directorStatus: 'Pending', overallStatus: 'Pending Manager' },
    { id: 'ISSUE-005', title: 'Un-reconciled material scrap variance', tcStatus: 'Completed', managerStatus: 'In Progress', directorStatus: 'Pending', overallStatus: 'In progress Manager' }
  ];

  const itTotal = itIssues.length;
  const itTcCompleted = itIssues.filter(i => (i.tcStatus === 'Completed' || i.status === 'Completed' || i.status === 'Signed Off' || !i.status?.includes('TC'))).length || itTotal;
  const itManagerActive = Math.max(1, Math.min(itTotal, Math.ceil(itTotal / 2)));

  const finOpsTotal = finOpsIssues.length;
  const finOpsTcCompleted = finOpsIssues.filter(i => (i.tcStatus === 'Completed' || i.status === 'Completed' || i.status === 'Signed Off' || !i.status?.includes('TC'))).length || finOpsTotal;
  const finOpsManagerActive = Math.max(1, Math.min(finOpsTotal, Math.ceil(finOpsTotal / 2)));

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
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '0.2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitBranch style={{ width: '18px', height: '18px', color: isAuditWorkflow ? '#60A5FA' : '#38BDF8' }} />
              <span>{displayTitle}</span>
            </h3>
            <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500', marginTop: '3px', opacity: 0.95 }}>
              {auditTitle}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            title="Close Workflow Drawer"
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Scrollable Workflow Content */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {isAuditWorkflow ? (
            /* ============================================================== */
            /* AUDIT REPORT WORKFLOW (IT & FINOPS DUAL GRAPHS + MATRIX)       */
            /* ============================================================== */
            <>
              {/* GRAPH 1: IT ISSUES WORKFLOW GRAPH */}
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
                    <span>IT Issues Workflow Graph ({itTotal} Total Issues)</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #BFDBFE' }}>
                    TC: {itTcCompleted}/{itTotal} | Manager: {itManagerActive}/{itTotal}
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
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#2563EB' }}>Completed ({itTcCompleted}/{itTotal})</div>
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
                            In Progress ({itManagerActive}/{itTotal})
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
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 4: Final Report */}
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>5</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Final Report</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 5: Management Response */}
                    <div style={{ position: 'absolute', left: '52%', top: '105px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>4</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Management Response</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Pending Owner Input</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRAPH 2: FINOPS ISSUES WORKFLOW GRAPH */}
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
                    <span>FinOps Issues Workflow Graph ({finOpsTotal} Total Issues)</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #A7F3D0' }}>
                    TC: {finOpsTcCompleted}/{finOpsTotal} | Manager: {finOpsManagerActive}/{finOpsTotal}
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
                          <div style={{ fontSize: '10px', fontWeight: '800', color: '#059669' }}>Completed ({finOpsTcCompleted}/{finOpsTotal})</div>
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
                            In Progress ({finOpsManagerActive}/{finOpsTotal})
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
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 4: Final Report */}
                    <div style={{ position: 'absolute', right: '0%', top: '10px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>5</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Final Report</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Not Started</div>
                        </div>
                      </div>
                    </div>

                    {/* Node 5: Management Response */}
                    <div style={{ position: 'absolute', left: '52%', top: '105px', pointerEvents: 'auto' }}>
                      <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>4</div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Management Response</div>
                          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#94A3B8' }}>Pending Owner Input</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CATEGORIZED ISSUE-LEVEL & ROLE-LEVEL WORKFLOW STATUS MATRIX */}
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
                      {itIssues.map((issue) => (
                        <tr key={issue.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>{issue.id}: {issue.title}</td>
                          <td style={{ padding: '8px 12px', color: '#166534', fontWeight: '700' }}>✓ Completed</td>
                          <td style={{ padding: '8px 12px', color: '#D8001D', fontWeight: '700' }}>⏳ In Progress</td>
                          <td style={{ padding: '8px 12px', color: '#94A3B8' }}>Pending</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#991B1B', backgroundColor: '#FEF2F2', padding: '2px 8px', borderRadius: '4px' }}>
                              {issue.overallStatus || issue.status || 'Pending TC'}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                      {finOpsIssues.map((issue) => (
                        <tr key={issue.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>{issue.id}: {issue.title}</td>
                          <td style={{ padding: '8px 12px', color: '#166534', fontWeight: '700' }}>✓ Completed</td>
                          <td style={{ padding: '8px 12px', color: '#7C3AED', fontWeight: '700' }}>⏳ In Progress</td>
                          <td style={{ padding: '8px 12px', color: '#94A3B8' }}>Pending</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                              {issue.overallStatus || issue.status || 'In progress Manager'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </>
          ) : (
            /* ============================================================== */
            /* EXECUTIVE SUMMARY WORKFLOW (4 CLEAN STAGES + AUDIT LOG)        */
            /* ============================================================== */
            <>
              {/* Premium Executive Workflow Stage Graph Card */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '24px 22px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}>

                {/* RESPONSIVE SVG & NODE PIPELINE CANVAS */}
                <div style={{ position: 'relative', width: '100%', minHeight: '80px', padding: '10px 0' }}>

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
                    <line x1="90" y1="35" x2="205" y2="35" stroke="#22C55E" strokeWidth="3" markerEnd="url(#arrowGreen)" />

                    {/* Connection 2: Audit Manager to Director */}
                    <line x1="375" y1="35" x2="430" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />

                    {/* Connection 3: Director to VP SignOff */}
                    <line x1="545" y1="35" x2="585" y2="35" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="5,5" markerEnd="url(#arrow)" />
                  </svg>

                  {/* HTML NODE MINI-CARDS WITH RESPONSIVE PERCENTAGE SPACING */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

                    {/* Node 1: TC */}
                    <div style={{ position: 'absolute', left: '0%', top: '8px', pointerEvents: 'auto' }}>
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
                    <div style={{ position: 'absolute', left: '30%', top: '6px', pointerEvents: 'auto' }}>
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
                    <div style={{ position: 'absolute', left: '62%', top: '8px', pointerEvents: 'auto' }}>
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

                    {/* Node 4: VP SignOff */}
                    <div style={{ position: 'absolute', right: '0%', top: '8px', pointerEvents: 'auto' }}>
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
                          <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569' }}>VP SignOff</div>
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
                      <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px', fontWeight: '500' }}>
                        Completed by: <strong>Rachel Green</strong> (TC Auditor)
                      </div>
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
                      <div style={{ fontWeight: '800', color: '#64748B', fontSize: '13px' }}>4. VP SignOff (Pending)</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Final Executive Sign-off</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8' }}>Not Started</span>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

      </aside>
    </div>
  );
}
