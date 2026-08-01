import React from 'react';
import { X, CheckCircle2, Clock, GitBranch, ArrowRight } from 'lucide-react';

export default function WorkflowModal({ isOpen, title, workflows, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--slate-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GitBranch style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                {title || "Workflow Stage Status"}
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B' }}>Live approval stages and current queue transitions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--slate-100)',
              color: 'var(--slate-600)',
              cursor: 'pointer'
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '65vh', overflowY: 'auto' }}>
          {workflows && workflows.length > 0 ? (
            workflows.map((group, idx) => (
              <div key={idx} style={{
                border: '1px solid var(--slate-200)',
                borderRadius: '10px',
                padding: '16px',
                backgroundColor: '#ffffff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{group.groupTitle}</h4>
                  <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: group.active ? '#ECFDF5' : '#F1F5F9', color: group.active ? '#047857' : '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                    {group.status || 'Active'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {group.steps.map((step, sIdx) => {
                    const isApproved = step.status === 'Approved' || step.status === 'Completed';
                    const isInProgress = step.status === 'In Progress';

                    return (
                      <div key={sIdx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: isApproved ? '#F8FAFC' : isInProgress ? '#FFFBEB' : '#ffffff',
                        border: isApproved ? '1px solid #E2E8F0' : isInProgress ? '1px solid #FDE68A' : '1px dashed #CBD5E1'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isApproved ? (
                            <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10B981', flexShrink: 0 }} />
                          ) : isInProgress ? (
                            <Clock style={{ width: '16px', height: '16px', color: '#F59E0B', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #CBD5E1', flexShrink: 0 }}></div>
                          )}
                          <div>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B' }}>{step.name}</p>
                            <p style={{ fontSize: '11px', color: '#64748B' }}>Assigned: <strong style={{ color: '#334155' }}>{step.user}</strong></p>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: isApproved ? '#047857' : isInProgress ? '#B45309' : '#64748B'
                          }}>
                            {step.status}
                          </span>
                          {step.date && step.date !== '-' && (
                            <p style={{ fontSize: '10px', color: '#94A3B8' }}>{step.date}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#64748B', padding: '24px' }}>No workflow stages recorded.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--slate-200)',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
