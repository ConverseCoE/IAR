import React from 'react';
import { 
  ArrowLeft, X, CheckCircle2, Clock, Cpu, TrendingUp, ShieldCheck, GitBranch
} from 'lucide-react';

export default function WorkflowOverlayDrawer({ isOpen, type = 'audit', report, onClose }) {
  if (!isOpen) return null;

  const fileName = report ? (report.fileName || report.id) : "Ethicon_EndoSurgery_PlantAudit";

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.55)', 
        backdropFilter: 'blur(4px)', 
        display: 'flex', 
        justifyContent: 'flex-end', 
        zIndex: 999999,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <aside 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: type === 'executive' ? '780px' : '820px', 
          maxWidth: '96vw', 
          height: '100vh', 
          backgroundColor: '#ffffff', 
          boxShadow: '-12px 0 36px rgba(0,0,0,0.3)', 
          display: 'flex', 
          flexDirection: 'column', 
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)', 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Dark Header Card */}
        <div style={{ padding: '18px 24px', backgroundColor: '#0F172A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Back">
              <ArrowLeft style={{ width: '20px', height: '20px' }} />
            </button>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0, color: type === 'executive' ? '#38BDF8' : type === 'it' ? '#60A5FA' : type === 'finops' ? '#34D399' : '#60A5FA' }}>
                {type === 'executive' ? 'Executive Summary Workflow Pipeline' :
                 type === 'it' ? 'IT Discussion Points Workflow' :
                 type === 'finops' ? 'FinOps Discussion Points Workflow' :
                 'Audit Report Main Workflow Pipeline'}
              </h3>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{fileName}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X style={{ width: '20px', height: '20px' }} /></button>
        </div>

        {/* Scrollable Workflow Content */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TYPE 1: EXECUTIVE SUMMARY WORKFLOW (Single 5-Stage Graph) */}
          {type === 'executive' && (
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '24px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
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
          )}

          {/* TYPE 2: AUDIT REPORT MAIN WORKFLOW OR IT/FINOPS SPECIFIC */}
          {(type === 'audit' || type === 'it') && (
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
          )}

          {(type === 'audit' || type === 'finops') && (
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
          )}

          {/* TABLES */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', margin: 0, borderBottom: '1px solid #F1F5F9', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck style={{ width: '18px', height: '18px', color: '#2563EB' }} />
              <span>Issue &amp; Role Level Workflow Status Matrix</span>
            </h4>

            {(type === 'audit' || type === 'it') && (
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
            )}

            {(type === 'audit' || type === 'finops') && (
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
            )}
          </div>

        </div>
      </aside>
    </div>
  );
}
