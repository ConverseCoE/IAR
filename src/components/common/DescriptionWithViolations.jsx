import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, ShieldCheck, X, ChevronDown, Check } from 'lucide-react';
import {
  getComplianceStandards,
  getViolationsForIssue,
  addIssueViolation,
  removeIssueViolation,
  splitDescriptionAndViolations,
  formatViolationsAsCorporateText,
  buildViolationDoc
} from '../../utils/complianceEngine';

// Default standard violation items matching official Johnson & Johnson IAPP specification
export const DEFAULT_IAPP_VIOLATIONS = [
  {
    number: '1',
    linkText: 'S-15 Section No. [2]',
    title: 'Security Assessment for COTS Systems/Applications',
    detail: 'Security assessment not completed for the environment'
  },
  {
    number: '2',
    linkText: 'S-15 Section No. [11]',
    title: 'ISRM Approval Prior to Production',
    detail: 'ISRM approval lacking due to missing assessment'
  },
  {
    number: '3',
    linkText: 'S-15 Section No. [4.18]',
    title: 'Periodic Application Architecture/Code/Config Assessment',
    detail: 'No periodic assessment of architecture, code, configuration'
  }
];

export const DEFAULT_IAPP_SUBTITLE = 'Non-Compliant with some of the sections of IAPP:';

/**
 * Legacy export for backwards compatibility
 */
export function parseDescriptionWithViolations(rawText = '') {
  const { cleanDescription, violations } = splitDescriptionAndViolations(rawText);
  
  if (violations.length === 0) {
    return {
      mainText: cleanDescription,
      hasViolations: true,
      subTitle: DEFAULT_IAPP_SUBTITLE,
      items: DEFAULT_IAPP_VIOLATIONS
    };
  }

  const items = violations.map((v, i) => ({
    id: v.id,
    number: `${i + 1}`,
    linkText: `${v.standardCode?.startsWith('S-') ? v.standardCode : `S-${v.standardCode || '15'}`} Section No. [${v.sectionNumber || '1'}]`,
    title: v.sectionTitle || '',
    detail: v.rationale || '',
    source: v.source || 'AI_GENERATED',
    aiConfidence: v.aiConfidence,
    rawViolation: v
  }));

  return {
    mainText: cleanDescription,
    hasViolations: true,
    subTitle: DEFAULT_IAPP_SUBTITLE,
    items
  };
}

export default function DescriptionWithViolations({
  issueId = null,
  value = '',
  text = '',
  onChange,
  isReadOnly = false,
  onOpenViolationDoc,
  label = 'Description',
  commentTrigger = null
}) {
  const incomingValue = value || text || '';
  const [violationsList, setViolationsList] = useState([]);
  const [cleanText, setCleanText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedStdId, setSelectedStdId] = useState('');
  const [selectedSecNum, setSelectedSecNum] = useState('');
  const [customRationale, setCustomRationale] = useState('');

  const masterStandards = getComplianceStandards();

  // Load and synchronize state from props
  useEffect(() => {
    const { cleanDescription, violations } = splitDescriptionAndViolations(incomingValue, issueId);
    setCleanText(cleanDescription);

    if (violations && violations.length > 0) {
      setViolationsList(violations);
    } else {
      // Fallback default
      setViolationsList(DEFAULT_IAPP_VIOLATIONS.map((it, idx) => ({
        id: `DEFAULT-${idx}`,
        standardCode: it.linkText.split(' ')[0],
        sectionNumber: it.linkText.match(/\[(.*?)\]/)?.[1] || '1',
        sectionTitle: it.title,
        rationale: it.detail,
        source: 'AI_GENERATED',
        aiConfidence: 0.94
      })));
    }
  }, [value, issueId]);

  const handleLinkClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenViolationDoc) {
      const docPayload = buildViolationDoc(item.rawViolation || item);
      onOpenViolationDoc(docPayload);
    }
  };

  const notifyChange = (newMainText, updatedViolations) => {
    if (!onChange) return;
    const corporateBlock = formatViolationsAsCorporateText(updatedViolations);
    const fullText = corporateBlock ? `${newMainText}\n\n${corporateBlock}` : newMainText;
    onChange(fullText);
  };

  const handleTextChange = (newMainText) => {
    setCleanText(newMainText);
    notifyChange(newMainText, violationsList);
  };

  const handleRemoveViolation = (violId) => {
    removeIssueViolation(violId);
    const updated = violationsList.filter(v => v.id !== violId);
    setViolationsList(updated);
    notifyChange(cleanText, updated);
  };

  const handleAddViolationSubmit = () => {
    if (!selectedStdId || !selectedSecNum) return;
    
    const std = masterStandards.find(s => s.standardId === selectedStdId);
    const sec = std?.sections.find(s => String(s.sectionNumber) === String(selectedSecNum));

    const newV = addIssueViolation({
      issueId: issueId || 'ISSUE-GENERIC',
      standardId: std?.standardId,
      standardCode: std?.code,
      sectionNumber: selectedSecNum,
      sectionTitle: sec?.title || 'Policy Requirement',
      rationale: customRationale.trim() || sec?.requirement || '',
      source: 'MANUAL',
      confirmedBy: 'Auditor'
    });

    const updated = [...violationsList, newV];
    setViolationsList(updated);
    notifyChange(cleanText, updated);

    // Reset picker
    setIsAdding(false);
    setSelectedStdId('');
    setSelectedSecNum('');
    setCustomRationale('');
  };

  const currentSelectedStd = masterStandards.find(s => s.standardId === selectedStdId);

  return (
    <div>
      {/* Field Label Header Row: ONLY label on left, lock/comment trigger on right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', margin: 0 }}>
            {label}
          </label>
          <span style={{
            fontSize: '11px',
            color: '#64748B',
            backgroundColor: '#F1F5F9',
            padding: '2px 7px',
            borderRadius: '10px',
            fontWeight: '600'
          }}>
            {violationsList.length} Standards Cited
          </span>
        </div>

        {/* Right side: Comment Trigger and Read-Only lock badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isReadOnly && (
            <span style={{ fontSize: '10.5px', color: '#B45309', fontWeight: '700' }}>
              🔒 Read Only
            </span>
          )}
          {commentTrigger}
        </div>
      </div>

      {/* Main Container matching user's design image verbatim */}
      <div
        style={{
          border: '1.5px solid #CBD5E1',
          borderRadius: '24px', // Signature large pill rounded corners from screenshot
          padding: '22px 28px',
          backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
          transition: 'border-color 0.15s ease',
          fontFamily: 'inherit'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}
      >
        {/* Main Description Observation Text (Directly editable if not read-only) */}
        {isReadOnly ? (
          <div style={{
            fontSize: '12.8px',
            color: '#0F172A',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            marginBottom: '16px'
          }}>
            {cleanText || 'No description recorded.'}
          </div>
        ) : (
          <textarea
            rows={Math.max(2, (cleanText || '').split('\n').length)}
            value={cleanText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter finding observation narrative..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
              fontSize: '12.8px',
              color: '#0F172A',
              lineHeight: '1.6',
              resize: 'vertical',
              padding: 0,
              margin: 0,
              marginBottom: '16px'
            }}
          />
        )}

        {/* Violation Reference Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderTop: '1px solid #F1F5F9',
          paddingTop: '14px'
        }}>
          {/* Header Row of Violations: Title and + Add Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '800',
                color: '#0F172A',
                letterSpacing: '-0.1px'
              }}>
                Violation Reference
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748B',
                marginTop: '1px'
              }}>
                {DEFAULT_IAPP_SUBTITLE}
              </div>
            </div>

            {!isReadOnly && !isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#2563EB',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DBEAFE'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
              >
                <Plus style={{ width: '13px', height: '13px' }} />
                Add Standard Citation
              </button>
            )}
          </div>

          {/* Inline Standard Citation Picker */}
          {isAdding && (
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '12px 14px',
              marginTop: '6px',
              marginBottom: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck style={{ width: '14px', height: '14px', color: '#2563EB' }} />
                  Select Governing Standard & Section
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', padding: '2px' }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Standard Select */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '3px' }}>
                    Standard Policy:
                  </label>
                  <select
                    value={selectedStdId}
                    onChange={(e) => {
                      setSelectedStdId(e.target.value);
                      setSelectedSecNum('');
                    }}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="">-- Choose Standard --</option>
                    {masterStandards.map(s => (
                      <option key={s.standardId} value={s.standardId}>
                        {s.code} - {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Select */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '3px' }}>
                    Section / Clause:
                  </label>
                  <select
                    value={selectedSecNum}
                    onChange={(e) => {
                      setSelectedSecNum(e.target.value);
                      const sec = currentSelectedStd?.sections.find(s => String(s.sectionNumber) === e.target.value);
                      if (sec) {
                        setCustomRationale(sec.requirement);
                      }
                    }}
                    disabled={!selectedStdId}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: !selectedStdId ? '#F1F5F9' : '#ffffff'
                    }}
                  >
                    <option value="">-- Choose Section --</option>
                    {currentSelectedStd?.sections.map(sec => (
                      <option key={sec.sectionNumber} value={sec.sectionNumber}>
                        Section [{sec.sectionNumber}] - {sec.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rationale Input */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '3px' }}>
                  Auditor Rationale / Observation Context:
                </label>
                <input
                  type="text"
                  value={customRationale}
                  onChange={(e) => setCustomRationale(e.target.value)}
                  placeholder="Explain why this finding breaches this standard section..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px 8px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddViolationSubmit}
                  disabled={!selectedStdId || !selectedSecNum}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    color: '#ffffff',
                    backgroundColor: (!selectedStdId || !selectedSecNum) ? '#94A3B8' : '#2563EB',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: (!selectedStdId || !selectedSecNum) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Check style={{ width: '13px', height: '13px' }} />
                  Attach Citation
                </button>
              </div>
            </div>
          )}

          {/* Numbered Violation Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {violationsList.map((item, index) => {
              const stdCode = item.standardCode?.startsWith('S-') ? item.standardCode : `S-${item.standardCode || '15'}`;
              const linkText = `${stdCode} Section No. [${item.sectionNumber || '1'}]`;

              return (
                <div
                  key={item.id || index}
                  style={{
                    fontSize: '12.5px',
                    lineHeight: '1.55',
                    color: '#0F172A',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    transition: 'background-color 0.12s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', flex: 1 }}>
                    <span style={{ fontWeight: '600', minWidth: '16px', color: '#64748B' }}>
                      {index + 1}.
                    </span>

                    <div>
                      {/* Clickable Violation Reference Link */}
                      <span
                        onClick={(e) => handleLinkClick(e, item)}
                        style={{
                          color: '#1D4ED8',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'color 0.12s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#1E40AF'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#1D4ED8'; }}
                        title="Click to view official IAPP PDF Document in side drawer"
                      >
                        {linkText}
                      </span>

                      {/* Title & Detail */}
                      {item.sectionTitle && (
                        <span style={{ color: '#0F172A', fontWeight: '500' }}>
                          {' '}- {item.sectionTitle}
                        </span>
                      )}
                      {item.rationale && (
                        <span style={{ color: '#475569' }}>
                          {' '}— {item.rationale}
                        </span>
                      )}

                      {/* AI Confidence / Source Chip */}
                      <span style={{ marginLeft: '8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        {item.source === 'AI_GENERATED' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '10px',
                            fontWeight: '700',
                            color: '#7C3AED',
                            backgroundColor: '#F5F3FF',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            border: '1px solid #DDD6FE'
                          }}>
                            <Sparkles style={{ width: '10px', height: '10px' }} />
                            AI Suggested {item.aiConfidence ? `${Math.round(item.aiConfidence * 100)}%` : ''}
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#047857',
                            backgroundColor: '#ECFDF5',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            border: '1px solid #A7F3D0'
                          }}>
                            Manual Citation
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button (Auditor Dismissal) */}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveViolation(item.id)}
                      title="Dismiss this standard citation"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '3px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#DC2626';
                        e.currentTarget.style.backgroundColor = '#FEE2E2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#94A3B8';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
