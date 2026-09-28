import React, { useState, useMemo } from 'react';
import { 
  Sparkles, X, Check, ArrowRight, RotateCcw, AlertTriangle, 
  History, CheckCircle2, ChevronRight, Layers, FileText, Ban 
} from 'lucide-react';
import { 
  getVersionsForIssue, 
  getActiveVersion, 
  adoptVersion, 
  revertToVersion, 
  discardVersion, 
  computeWordDiff 
} from '../../utils/aiVersionEngine';

const FIELD_DEFINITIONS = [
  { key: 'title', label: 'Issue Title' },
  { key: 'rootCause', label: 'Root Cause Analysis' },
  { key: 'impact', label: 'Operational & Financial Impact' },
  { key: 'recommendation', label: 'Audit Recommendation' },
  { key: 'description', label: 'Detailed Description & Citations' }
];

export default function AiVersionCompareModal({
  isOpen,
  onClose,
  issueId,
  issueReference = null,
  currentUser = {},
  onAdoptFields = null
}) {
  const versions = useMemo(() => getVersionsForIssue(issueId), [issueId]);
  const activeVersion = useMemo(() => getActiveVersion(issueId), [issueId]);

  // Determine comparison target: default to first non-active version (e.g. candidate or latest historical)
  const defaultTargetId = useMemo(() => {
    if (!versions || versions.length <= 1) return null;
    const candidate = versions.find(v => v.status === 'CANDIDATE');
    if (candidate) return candidate.id;
    const nonActive = versions.find(v => v.id !== activeVersion?.id);
    return nonActive ? nonActive.id : versions[0].id;
  }, [versions, activeVersion]);

  const [selectedVersionId, setSelectedVersionId] = useState(defaultTargetId);

  // Field selection state for hybrid merging: { [fieldKey]: 'active' | 'target' }
  const [selectedFields, setSelectedFields] = useState(() => ({
    title: 'target',
    rootCause: 'target',
    impact: 'target',
    recommendation: 'target',
    description: 'target'
  }));

  // Reset comparison target when issue changes
  React.useEffect(() => {
    setSelectedVersionId(defaultTargetId);
    setSelectedFields({
      title: 'target',
      rootCause: 'target',
      impact: 'target',
      recommendation: 'target',
      description: 'target'
    });
  }, [defaultTargetId, issueId]);

  if (!isOpen) return null;

  const targetVersion = versions.find(v => v.id === selectedVersionId) || versions[0] || null;
  const isComparingWithCandidate = targetVersion?.status === 'CANDIDATE';
  const isComparingWithOlder = targetVersion && activeVersion && (targetVersion.versionNumber < activeVersion.versionNumber);

  // Handle Full Adoption
  const handleAdoptAll = () => {
    if (!targetVersion) return;
    const res = adoptVersion({
      issueId,
      versionId: targetVersion.id,
      adoptedBy: currentUser,
      customFields: targetVersion.fields
    });

    if (onAdoptFields && res?.fields) {
      onAdoptFields(res.fields);
    }
    onClose();
  };

  // Handle Hybrid Merging
  const handleAdoptSelected = () => {
    if (!targetVersion || !activeVersion) return;
    const mergedFields = {};
    const selectionMap = {};

    FIELD_DEFINITIONS.forEach(({ key }) => {
      const choice = selectedFields[key];
      if (choice === 'target') {
        mergedFields[key] = targetVersion.fields[key] || '';
        selectionMap[key] = `v${targetVersion.versionNumber}`;
      } else {
        mergedFields[key] = activeVersion.fields[key] || '';
        selectionMap[key] = `v${activeVersion.versionNumber}`;
      }
    });

    const res = adoptVersion({
      issueId,
      versionId: targetVersion.id,
      fieldSelectionMap: selectionMap,
      adoptedBy: currentUser,
      customFields: mergedFields
    });

    if (onAdoptFields && res?.fields) {
      onAdoptFields(res.fields);
    }
    onClose();
  };

  // Handle Rollback to Historical Version
  const handleRollback = () => {
    if (!targetVersion) return;
    const res = revertToVersion({
      issueId,
      versionId: targetVersion.id,
      revertedBy: currentUser
    });

    if (onAdoptFields && res?.fields) {
      onAdoptFields(res.fields);
    }
    onClose();
  };

  // Handle Discard Candidate
  const handleDiscard = () => {
    if (!targetVersion) return;
    discardVersion({ versionId: targetVersion.id, user: currentUser });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '92vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E293B'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA'
            }}>
              <Sparkles style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', letterSpacing: '0.2px' }}>
                  AI Version History &amp; Field-Level Comparison
                </h3>
                {issueReference && (
                  <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '1px 8px', borderRadius: '12px', backgroundColor: '#1E293B', color: '#93C5FD', border: '1px solid #3B82F6' }}>
                    {issueReference}
                  </span>
                )}
                {activeVersion && (
                  <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '1px 8px', borderRadius: '12px', backgroundColor: '#064E3B', color: '#6EE7B7' }}>
                    Active: v{activeVersion.versionNumber}
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>
                Compare synthesized finding versions, inspect word-level diffs, and perform granular field adoption.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Version Timeline Selector Bar */}
        <div style={{
          padding: '10px 24px',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
              Select Version to Compare:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {versions.map(v => {
                const isSelected = v.id === selectedVersionId;
                const isActive = v.status === 'ACTIVE' || v.status === 'HYBRID_MERGED';
                const isCandidate = v.status === 'CANDIDATE';

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVersionId(v.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                      backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      color: isSelected ? '#1D4ED8' : '#334155',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: isSelected ? '0 1px 3px rgba(37,99,235,0.15)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>v{v.versionNumber}</span>
                    {isActive && (
                      <span style={{ fontSize: '9px', backgroundColor: '#DCFCE7', color: '#166534', padding: '1px 5px', borderRadius: '8px' }}>
                        Active
                      </span>
                    )}
                    {isCandidate && (
                      <span style={{ fontSize: '9px', backgroundColor: '#FEF3C7', color: '#92400E', padding: '1px 5px', borderRadius: '8px' }}>
                        Candidate
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {targetVersion && (
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Synthesized by <strong>{targetVersion.createdBy?.name || 'Vertex AI'}</strong> on {targetVersion.displayTime || 'Recently'}
            </div>
          )}
        </div>

        {/* Content Body: Side-by-Side Field Comparison Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          backgroundColor: '#F1F5F9'
        }}>
          {/* Column Titles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 style={{ width: '14px', height: '14px', color: '#16A34A' }} />
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>
                  Active Confirmed Workpaper (v{activeVersion?.versionNumber || 1})
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#64748B' }}>Current Single Source of Truth</span>
            </div>

            <div style={{
              padding: '8px 14px',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              border: '1.5px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles style={{ width: '14px', height: '14px', color: '#2563EB' }} />
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#1E40AF' }}>
                  Comparison Version (v{targetVersion?.versionNumber || 1}) {targetVersion?.status === 'CANDIDATE' ? '— Newly Synthesized' : ''}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: '700' }}>
                {targetVersion?.triggerStage || 'AI Synthesis'}
              </span>
            </div>
          </div>

          {/* Field-by-Field Comparison Cards */}
          {FIELD_DEFINITIONS.map(({ key, label }) => {
            const activeText = activeVersion?.fields[key] || '';
            const targetText = targetVersion?.fields[key] || '';
            const isDifferent = activeText.trim() !== targetText.trim();
            const selectedChoice = selectedFields[key] || 'target';

            return (
              <div
                key={key}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: isDifferent ? '1.5px solid #CBD5E1' : '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  overflow: 'hidden'
                }}
              >
                {/* Field Header Bar */}
                <div style={{
                  padding: '9px 14px',
                  backgroundColor: isDifferent ? '#F8FAFC' : '#FAFAFA',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>
                      {label}
                    </span>
                    {isDifferent ? (
                      <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FEF3C7', color: '#B45309', padding: '1px 7px', borderRadius: '10px' }}>
                        Modified in v{targetVersion?.versionNumber}
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', fontWeight: '600', color: '#94A3B8' }}>
                        Identical across versions
                      </span>
                    )}
                  </div>

                  {/* Field Option Selector (Hybrid Choice) */}
                  {isDifferent && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedFields(prev => ({ ...prev, [key]: 'active' }))}
                        style={{
                          padding: '3px 8px',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          borderRadius: '6px',
                          border: selectedChoice === 'active' ? '1.5px solid #16A34A' : '1px solid #CBD5E1',
                          backgroundColor: selectedChoice === 'active' ? '#DCFCE7' : '#FFFFFF',
                          color: selectedChoice === 'active' ? '#166534' : '#64748B',
                          cursor: 'pointer'
                        }}
                      >
                        Keep Active (v{activeVersion?.versionNumber})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFields(prev => ({ ...prev, [key]: 'target' }))}
                        style={{
                          padding: '3px 8px',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          borderRadius: '6px',
                          border: selectedChoice === 'target' ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                          backgroundColor: selectedChoice === 'target' ? '#DBEAFE' : '#FFFFFF',
                          color: selectedChoice === 'target' ? '#1E40AF' : '#64748B',
                          cursor: 'pointer'
                        }}
                      >
                        Adopt v{targetVersion?.versionNumber}
                      </button>
                    </div>
                  )}
                </div>

                {/* Side-by-Side Content */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80px' }}>
                  {/* Left: Active Version Text */}
                  <div style={{
                    padding: '12px 14px',
                    borderRight: '1px solid #E2E8F0',
                    backgroundColor: selectedChoice === 'active' && isDifferent ? '#F0FDF4' : '#FFFFFF',
                    fontSize: '12px',
                    color: '#1E293B',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {activeText || <em style={{ color: '#94A3B8' }}>(Empty)</em>}
                  </div>

                  {/* Right: Comparison Version Text with Word-Level Diff Highlights */}
                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: selectedChoice === 'target' && isDifferent ? '#EFF6FF' : '#FFFFFF',
                    fontSize: '12px',
                    color: '#1E293B',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {isDifferent ? (
                      <div>
                        {computeWordDiff(activeText, targetText).map((chunk, idx) => {
                          if (chunk.type === 'added') {
                            return (
                              <span key={idx} style={{ backgroundColor: '#BBF7D0', color: '#14532D', padding: '1px 3px', borderRadius: '3px', fontWeight: '600' }}>
                                {chunk.text}
                              </span>
                            );
                          }
                          if (chunk.type === 'removed') {
                            return (
                              <span key={idx} style={{ backgroundColor: '#FECACA', color: '#991B1B', textDecoration: 'line-through', padding: '1px 3px', borderRadius: '3px', opacity: 0.65 }}>
                                {chunk.text}
                              </span>
                            );
                          }
                          return <span key={idx}>{chunk.text}</span>;
                        })}
                      </div>
                    ) : (
                      targetText || <em style={{ color: '#94A3B8' }}>(Empty)</em>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions Bar */}
        <div style={{
          padding: '14px 24px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div>
            {isComparingWithCandidate && (
              <button
                type="button"
                onClick={handleDiscard}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#DC2626',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Ban style={{ width: '13px', height: '13px' }} />
                <span>Discard Candidate v{targetVersion?.versionNumber}</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#64748B',
                backgroundColor: 'transparent',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            {isComparingWithOlder ? (
              <button
                type="button"
                onClick={handleRollback}
                style={{
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  backgroundColor: '#7C3AED',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(124,58,237,0.25)'
                }}
              >
                <RotateCcw style={{ width: '13px', height: '13px' }} />
                <span>Rollback to v{targetVersion?.versionNumber}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAdoptSelected}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#1E40AF',
                    backgroundColor: '#EFF6FF',
                    border: '1.5px solid #BFDBFE',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Merge selected field choices into the active workpaper"
                >
                  <Layers style={{ width: '13px', height: '13px' }} />
                  <span>Adopt Hybrid Selection</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdoptAll}
                  style={{
                    padding: '8px 20px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    backgroundColor: '#059669',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(5,150,105,0.25)'
                  }}
                >
                  <Check style={{ width: '14px', height: '14px' }} />
                  <span>Adopt All from v{targetVersion?.versionNumber}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
