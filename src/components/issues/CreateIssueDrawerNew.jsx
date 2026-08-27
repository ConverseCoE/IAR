import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, RefreshCw, MessageSquare, AlertCircle, 
  CheckCircle2, Plus, ArrowRight, ShieldCheck, DollarSign, UserPlus, AlertOctagon, GitCompare, Check, ChevronDown, AlertTriangle, Eye, Wand2, FileText, Minimize2
} from 'lucide-react';

// Custom Enterprise SaaS Form Select Dropdown
function FormSelectDropdown({ label, required, value, onChange, options, placeholder = "Select option...", isMulti = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedValues = isMulti
    ? (Array.isArray(value)
        ? value
        : (typeof value === 'string' && value.trim() ? value.split(', ').map(s => s.trim()) : []))
    : [];

  const selectedOption = !isMulti ? options.find(opt => (typeof opt === 'object' ? opt.value : opt) === value) : null;
  
  let selectedLabel = placeholder;
  if (isMulti) {
    if (selectedValues.length === 1) {
      const opt = options.find(o => (typeof o === 'object' ? o.value : o) === selectedValues[0]);
      selectedLabel = opt ? (typeof opt === 'object' ? opt.label : opt) : selectedValues[0];
    } else if (selectedValues.length > 1) {
      selectedLabel = `${selectedValues.length} Selected`;
    }
  } else {
    selectedLabel = selectedOption ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption) : (value || placeholder);
  }

  const hasValue = isMulti ? selectedValues.length > 0 : !!value;

  const handleOptionClick = (optVal) => {
    if (isMulti) {
      let newValues;
      if (optVal === 'None' || optVal === 'none') {
        if (selectedValues.includes(optVal)) {
          newValues = [];
        } else {
          newValues = ['None'];
        }
      } else {
        const cleaned = selectedValues.filter(v => v !== 'None' && v !== 'none');
        if (cleaned.includes(optVal)) {
          newValues = cleaned.filter(v => v !== optVal);
        } else {
          newValues = [...cleaned, optVal];
        }
      }
      onChange(newValues);
    } else {
      onChange(optVal);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      {label && (
        <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
          {label} {required && <span style={{ color: '#D8001D' }}>*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          height: '38px',
          padding: '0 12px',
          fontSize: '12.5px',
          fontWeight: '600',
          color: hasValue ? '#0F172A' : '#94A3B8',
          backgroundColor: '#ffffff',
          border: isOpen ? '1px solid #94A3B8' : '1px solid #CBD5E1',
          borderRadius: '8px',
          outline: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: isOpen ? '0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#94A3B8';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.06)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#CBD5E1';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)';
          }
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          minWidth: 0,
          flex: 1,
          textAlign: 'left'
        }}>
          {selectedLabel}
        </span>
        <ChevronDown style={{
          width: '15px',
          height: '15px',
          color: '#64748B',
          flexShrink: 0,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 5px)',
          left: 0,
          right: 0,
          zIndex: 250,
          maxHeight: '220px',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.06)',
          padding: '5px',
          animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLbl = typeof opt === 'object' ? opt.label : opt;
            const isSelected = isMulti 
              ? selectedValues.includes(optVal)
              : value === optVal;

            return (
              <div
                key={optVal}
                onClick={() => handleOptionClick(optVal)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? '#0F172A' : '#334155',
                  backgroundColor: isSelected ? '#F1F5F9' : 'transparent',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{optLbl}</span>
                {isSelected && <Check style={{ width: '13px', height: '13px', color: '#2563EB', strokeWidth: 2.5 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Enterprise SaaS Radio Button Selection Group Component
function FormRadioButtonGroup({ label, required, value, onChange, options, fullWidth = false }) {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
          {label} {required && <span style={{ color: '#D8001D' }}>*</span>}
        </label>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const optVal = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          const isSelected = value === optVal;

          return (
            <button
              key={optVal}
              type="button"
              onClick={() => onChange(optVal)}
              style={{
                flex: fullWidth ? '1 1 auto' : '0 0 auto',
                minWidth: fullWidth ? 'auto' : '84px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0 16px',
                height: '36px',
                borderRadius: '8px',
                border: isSelected ? '1.5px solid #D8001D' : '1px solid #CBD5E1',
                backgroundColor: isSelected ? '#FFF5F6' : '#ffffff',
                color: isSelected ? '#D8001D' : '#334155',
                fontSize: '12.5px',
                fontWeight: isSelected ? '700' : '500',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 1px 4px rgba(216, 0, 29, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.03)',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#94A3B8';
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }
              }}
            >
              <span style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: isSelected ? '4.5px solid #D8001D' : '1.5px solid #94A3B8',
                backgroundColor: '#ffffff',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                flexShrink: 0
              }} />
              <span>{optLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateIssueDrawerNew({
  isOpen,
  onClose,
  onSaveDiscussionPoint,
  defaultFunction = 'IT',
  initialData = null,
  isReadOnly = false
}) {
  // Manual Entry Section State
  const [formData, setFormData] = useState({
    issueHeader: '',
    originalIssue: '',
    criticality: 'Major',
    tech: 'IT',
    soxReportable: 'No',
    primaryContact: '',
    secondaryContact: '',
    repeatFinding: 'No',
    accountableFunction: '',
    issueCauseType: '',
    processArea: ''
  });

  // Delegation State
  const [isDelegating, setIsDelegating] = useState(false);
  const [delegatedTo, setDelegatedTo] = useState('');

  // Issue Status State for Edit Drawer
  const [isIssueStatus, setIsIssueStatus] = useState(false);

  // AI Generation State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Version Comparison State
  const [previousAiData, setPreviousAiData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  // Field-level selection state
  const [selectedVersions, setSelectedVersions] = useState({
    updatedIssueHeader: 'current',
    rootCause: 'current',
    impact: 'current',
    description: 'current',
    recommendation: 'current'
  });

  // AI Fields State
  const [aiData, setAiData] = useState({
    updatedIssueHeader: '',
    rootCause: '',
    impact: '',
    description: '',
    recommendation: ''
  });

  // Remarks State for AI Generated Fields
  const [remarks, setRemarks] = useState({
    updatedIssueHeader: '',
    rootCause: '',
    impact: '',
    description: '',
    recommendation: ''
  });

  const [activeRemarkField, setActiveRemarkField] = useState(null);

  // AI Magic Wand & Selection Assistant State
  const [aiWandOpenField, setAiWandOpenField] = useState(null);
  const [selectionWandOpen, setSelectionWandOpen] = useState(false);
  const [textSelection, setTextSelection] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const wandContainerRef = useRef(null);
  const selectionWandRef = useRef(null);

  // Close AI Wand popover menu and floating selection button when clicking anywhere outside
  useEffect(() => {
    if (!aiWandOpenField && !selectionWandOpen && !textSelection) return;
    const handleWandClickOutside = (e) => {
      if (wandContainerRef.current && !wandContainerRef.current.contains(e.target)) {
        setAiWandOpenField(null);
      }
      if (selectionWandRef.current && !selectionWandRef.current.contains(e.target)) {
        setSelectionWandOpen(false);
        setTextSelection(null);
      }
    };
    document.addEventListener('mousedown', handleWandClickOutside);
    return () => document.removeEventListener('mousedown', handleWandClickOutside);
  }, [aiWandOpenField, selectionWandOpen, textSelection]);

  const getAiAdjustedText = (fieldKey, text, action) => {
    const clean = text ? text.trim() : '';

    if (action === 'rewrite') {
      if (fieldKey === 'updatedIssueHeader') {
        return clean ? `${clean} (Optimized & Verified)` : 'Automated Telemetry & Sensor Calibration Discrepancy';
      }
      if (fieldKey === 'rootCause') {
        return `Telemetry variance identified due to thermal dissipation latency in cleanroom HVAC Unit 4 during peak 72-hour operational cycles.`;
      }
      if (fieldKey === 'impact') {
        return `Potential delay in batch release timelines and $120,000 material scrap variance risk under Major criticality protocols.`;
      }
      if (fieldKey === 'description') {
        return `Automated sensor calibration logs registered telemetry drift exceeding the mandatory 1.5% SLA limit across 72 hours of continuous production.`;
      }
      if (fieldKey === 'recommendation') {
        return `1. Implement SHA-256 log integrity checks.\n2. Enforce MFA approval for sensor override procedures.\n3. Deploy optic sensor firmware patch v4.2 for automatic thermal drift compensation.`;
      }
      return clean ? `Rephrased: ${clean}` : 'Optimized enterprise audit details.';
    }

    if (action === 'tone') {
      if (fieldKey === 'updatedIssueHeader') {
        return `Compliance Notice: ${clean || 'Telemetry & Sensor Calibration Offsets on Catheter Line 3'}`;
      }
      if (fieldKey === 'rootCause') {
        return `Systemic audit findings confirm thermal dissipation delays in cleanroom HVAC Unit 4 created uncompensated optical sensor gain drift.`;
      }
      if (fieldKey === 'impact') {
        return `Formal Financial & Operational Exposure: Deferred batch clearance and $120,000 scrap material risk under Major criticality classification.`;
      }
      if (fieldKey === 'description') {
        return `Detailed Audit Observation: Automated sensor calibration telemetry logs demonstrated drift exceeding the 1.5% SLA threshold over 72 hours of continuous manufacturing.`;
      }
      if (fieldKey === 'recommendation') {
        return `1. Enforce automated SHA-256 checksum log verification across line systems.\n2. Mandate dual-level MFA authorization for sensor override procedures.\n3. Deploy optic sensor firmware patch v4.2 for automatic temperature drift compensation.`;
      }
      return clean ? `Professional Audit Format: ${clean}` : 'Formal audit documentation text.';
    }

    if (action === 'detailed') {
      if (fieldKey === 'updatedIssueHeader') {
        return `Catheter Line 3 Electrophysiology: Telemetry Sensor Offset & Thermal Gain Calibration Drift Variance`;
      }
      if (fieldKey === 'rootCause') {
        return `Root Cause Analysis: Thermal dissipation latency in cleanroom HVAC Unit 4 created secondary optic gain drift during peak 72-hour continuous production cycles. This resulted in uncompensated sensor calibration offsets exceeding established tolerance levels of 1.5%.`;
      }
      if (fieldKey === 'impact') {
        return `Quantitative & Operational Impact: Batch release timeline extended by 48 hours. Material scrap risk calculated at $120,000 across catheter batch runs under Major criticality compliance guidelines, impacting quarterly yield targets.`;
      }
      if (fieldKey === 'description') {
        return `Telemetry Log Analysis: Automated sensor calibration logs in Catheter Line 3 registered systematic gain drift exceeding the mandatory 1.5% threshold over 72 continuous operating hours. Secondary optic sensor offsets required manual override intervention to restore stability.`;
      }
      if (fieldKey === 'recommendation') {
        return `Comprehensive Action Plan:\n1. Implement automated SHA-256 integrity checksum log verification across process area.\n2. Enforce mandatory multi-factor authentication (MFA) approval policies for sensor recalibration overrides.\n3. Upgrade optic sensor firmware to v4.2 to enable automatic temperature drift compensation.\n4. Establish bi-weekly HVAC thermal dissipation audits for cleanroom Unit 4.`;
      }
      return clean ? `${clean}\n\nDetailed Supplement: Additional verification steps and root cause telemetry metrics recorded during audit review.` : 'Comprehensive detailed observation.';
    }

    if (action === 'shorter') {
      if (fieldKey === 'updatedIssueHeader') {
        return `Catheter Line 3 Sensor Offset Issue`;
      }
      if (fieldKey === 'rootCause') {
        return `HVAC Unit 4 thermal latency caused optic sensor gain drift during 72-hour batch runs.`;
      }
      if (fieldKey === 'impact') {
        return `48h release delay and $120k scrap material risk under Major criticality.`;
      }
      if (fieldKey === 'description') {
        return `Sensor calibration logs showed >1.5% telemetry drift over 72-hour run.`;
      }
      if (fieldKey === 'recommendation') {
        return `1. Add SHA-256 log checks.\n2. Require MFA for overrides.\n3. Upgrade firmware to v4.2.`;
      }
      return clean ? clean.split('\n')[0].substring(0, 80) + '...' : 'Concise summary.';
    }

    return clean;
  };

  // Field-level AI Loading & Review States
  const [aiFieldLoading, setAiFieldLoading] = useState({});
  const [aiPendingReviews, setAiPendingReviews] = useState({});

  const handleTriggerAiAdjustment = (key, action, selectionObj = null) => {
    const currentVal = aiData[key] || '';
    const actionLabels = {
      rewrite: 'Auto-rewrite',
      tone: 'Adjust tone professionally',
      detailed: 'Make it detailed',
      shorter: 'Make it shorter'
    };

    let targetText = currentVal;
    let isSubstring = false;
    let beforeText = '';
    let afterText = '';

    if (selectionObj && selectionObj.text) {
      targetText = selectionObj.text;
      isSubstring = true;
      beforeText = currentVal.substring(0, selectionObj.start);
      afterText = currentVal.substring(selectionObj.end);
    }

    setAiFieldLoading(prev => ({ ...prev, [key]: true }));
    setAiWandOpenField(null);
    setTextSelection(null);

    // Immediately set pending review state with isSubstring flag
    setAiPendingReviews(prev => ({
      ...prev,
      [key]: {
        isSubstring,
        beforeText,
        afterText,
        originalText: targetText,
        fullOriginalText: currentVal,
        newText: '',
        fullNewText: currentVal,
        actionLabel: actionLabels[action] || 'AI Rewrite'
      }
    }));

    setTimeout(() => {
      const generated = getAiAdjustedText(key, targetText, action);
      let newFullText = generated;
      if (isSubstring) {
        newFullText = `${beforeText}${generated}${afterText}`;
      } else {
        handleAiChange(key, generated);
      }

      setAiPendingReviews(prev => ({
        ...prev,
        [key]: {
          isSubstring,
          beforeText,
          afterText,
          originalText: targetText,
          fullOriginalText: currentVal,
          newText: generated,
          fullNewText: newFullText,
          actionLabel: actionLabels[action] || 'AI Rewrite'
        }
      }));

      setAiFieldLoading(prev => ({ ...prev, [key]: false }));
    }, 750);
  };

  const handleAcceptAiSuggestion = (key) => {
    const review = aiPendingReviews[key];
    if (review) {
      if (review.isSubstring) {
        const finalVal = `${review.beforeText || ''}${review.newText || ''}${review.afterText || ''}`;
        handleAiChange(key, finalVal);
      }
    }
    setAiPendingReviews(prev => ({ ...prev, [key]: null }));
  };

  const handleCancelAiSuggestion = (key) => {
    const review = aiPendingReviews[key];
    if (review) {
      if (review.isSubstring) {
        const revertedVal = `${review.beforeText || ''}${review.originalText || ''}${review.afterText || ''}`;
        handleAiChange(key, revertedVal);
      } else if (review.fullOriginalText !== undefined) {
        handleAiChange(key, review.fullOriginalText);
      }
    }
    setAiPendingReviews(prev => ({ ...prev, [key]: null }));
  };

  const handleAiChange = (field, val) => {
    setAiData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleTextareaSelect = (key, e) => {
    const target = e.target;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (start !== undefined && end !== undefined && start !== end) {
      const selText = target.value.substring(start, end).trim();
      if (selText.length > 0) {
        const linesBefore = target.value.substring(0, start).split('\n');
        const lineNumber = linesBefore.length - 1;
        const topOffset = Math.min(lineNumber * 18 + 6, 100);

        setTextSelection({
          fieldKey: key,
          start,
          end,
          text: selText,
          topOffset
        });
      }
    } else if (start === end && e.type === 'click') {
      setTextSelection(prev => (prev && prev.fieldKey === key ? null : prev));
      setSelectionWandOpen(false);
    }
  };

  // Populate initialData when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        issueHeader: initialData.header || initialData.title || '',
        originalIssue: initialData.originalIssue || initialData.description || initialData.header || '',
        criticality: initialData.criticality || 'Major',
        tech: initialData.tech || initialData.functionType || 'IT',
        soxReportable: initialData.isIssue ? 'Yes' : 'No',
        primaryContact: initialData.addedBy ? `${initialData.addedBy} (IT Lead)` : '',
        secondaryContact: initialData.lastUpdatedBy ? `${initialData.lastUpdatedBy} (IT Audit)` : '',
        repeatFinding: 'No',
        accountableFunction: initialData.functionType || defaultFunction,
        issueCauseType: 'Automated Sensor Calibration Drift',
        processArea: 'Catheter Line 3 Electrophysiology'
      });

      setIsIssueStatus(!!initialData.isIssue);
      setDelegatedTo(initialData.delegatedTo || '');
      setIsDelegating(false);

      const loadedAi = {
        updatedIssueHeader: initialData.header || initialData.title || '',
        rootCause: `Systemic telemetry drift identified in Catheter Line 3 Electrophysiology due to Automated Sensor Calibration Drift. Secondary thermal excursions caused optic sensor gain calibration offsets over 72 hours of continuous batch runs.`,
        impact: `Potential delay in batch release and risk of $120,000 material scrap variance under ${initialData.criticality || 'Major'} criticality level.`,
        description: initialData.description || '',
        recommendation: `1. Implement automated SHA-256 integrity checksum log verification across process area.\n2. Enforce mandatory multi-factor authentication (MFA) approval policies for sensor recalibration overrides.\n3. Upgrade optic sensor firmware to v4.2 to enable automatic temperature drift compensation.`
      };

      setAiData(loadedAi);
      setPreviousAiData(null);
      setIsComparing(false);
      setIsAiGenerated(true);
    } else {
      setIsAiGenerated(false);
      setIsIssueStatus(false);
      setDelegatedTo('');
      setIsDelegating(false);
      setPreviousAiData(null);
      setIsComparing(false);
      setFormData({
        issueHeader: '',
        originalIssue: '',
        criticality: 'Major',
        tech: 'IT',
        soxReportable: 'No',
        primaryContact: '',
        secondaryContact: '',
        repeatFinding: 'No',
        accountableFunction: '',
        issueCauseType: '',
        processArea: ''
      });
      setAiData({ updatedIssueHeader: '', rootCause: '', impact: '', description: '', recommendation: '' });
      setRemarks({ updatedIssueHeader: '', rootCause: '', impact: '', description: '', recommendation: '' });
      setActiveRemarkField(null);
    }
  }, [initialData, isOpen, defaultFunction]);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleGenerateAi = () => {
    let currentPrev = null;
    if (isAiGenerated && (aiData.updatedIssueHeader || aiData.rootCause)) {
      currentPrev = { ...aiData };
      setPreviousAiData(currentPrev);
    }
    setIsAiLoading(true);

    setTimeout(() => {
      setIsAiLoading(false);
      const newVersion = {
        updatedIssueHeader: formData.issueHeader ? `AI Refined v2: ${formData.issueHeader}` : `AI Refined Finding v2 in ${formData.processArea || 'System'}`,
        rootCause: `Enhanced Root Cause Analysis: Systemic telemetry & gain offset in ${formData.processArea || 'production line'} exacerbated by legacy control override parameters under ${formData.tech || 'IT'} scope.`,
        impact: `Escalated operational risk variance: Criticality level ${formData.criticality || 'Major'} with high potential compliance excursion impact.`,
        description: formData.originalIssue ? `AI Synthesized v2: ${formData.originalIssue}` : `Detailed AI synthesized observation v2 for ${formData.processArea || 'process area'}.`,
        recommendation: `1. Enforce automated SHA-256 log checksums across process area.\n2. Mandate MFA override approval for ${formData.accountableFunction || 'Tech Lead'}.\n3. Schedule quarterly recalibration audits.`
      };

      if (isAiGenerated && currentPrev) {
        setIsComparing(true);
        setAiData(newVersion);
        setSelectedVersions({
          updatedIssueHeader: 'current',
          rootCause: 'current',
          impact: 'current',
          description: 'current',
          recommendation: 'current'
        });
      } else {
        setAiData(newVersion);
        setIsAiGenerated(true);
      }
    }, 900);
  };

  const handleSelectCardVersion = (fieldKey, version, textVal) => {
    setSelectedVersions(prev => ({ ...prev, [fieldKey]: version }));
    setAiData(prev => ({ ...prev, [fieldKey]: textVal }));
  };

  const handleKeepEntireVersion = (versionType, dataObj) => {
    if (!dataObj) return;
    const newSelected = {};
    Object.keys(dataObj).forEach(k => { newSelected[k] = versionType; });
    setSelectedVersions(newSelected);
    setAiData({ ...dataObj });
    setIsComparing(false);
  };

  const handleSave = () => {
    if (!formData.issueHeader.trim()) {
      alert("Please enter an Issue Header before saving.");
      return;
    }
    if (!formData.originalIssue.trim()) {
      alert("Please enter the Original Issue before saving.");
      return;
    }
    if (!formData.tech) {
      alert("Please select Tech (IT or FinOps) before saving.");
      return;
    }

    const savedPoint = {
      id: initialData ? initialData.id : `${Date.now().toString().slice(-3)}`,
      issueId: initialData ? (initialData.issueId || initialData.id) : `${Date.now().toString().slice(-3)}`,
      reportId: "REP-2026-006",
      fileName: "BiosenseWebster_Catheters_Audit",
      rowNum: initialData ? initialData.rowNum : Date.now(),
      header: aiData.updatedIssueHeader || formData.issueHeader,
      title: aiData.updatedIssueHeader || formData.issueHeader,
      criticality: formData.criticality,
      tech: formData.tech,
      functionType: formData.accountableFunction,
      description: aiData.description || formData.originalIssue || "No description provided.",
      addedBy: delegatedTo || formData.primaryContact.split(' ')[0] || "Kevin Zhang",
      lastUpdatedBy: "Kevin Zhang",
      status: initialData ? initialData.status : "Manager Pending",
      isIssue: true,
      delegatedTo: delegatedTo
    };

    onSaveDiscussionPoint(savedPoint);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', zIndex: 1500 }}>
      
      {/* Overlay Drawer Panel */}
      <aside style={{
        width: isAiGenerated ? (isComparing ? '1380px' : (initialData ? '1380px' : '1260px')) : '720px',
        maxWidth: '96vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'width 0.25s ease',
        animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}>
        
        {/* Main Dark Drawer Header */}
        {!isComparing && (
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0F172A',
            color: '#ffffff'
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isReadOnly ? (
                <>
                  <Eye style={{ width: '18px', height: '18px', color: '#60A5FA' }} />
                  <span>View Issue (Read-Only)</span>
                </>
              ) : (
                initialData ? "Edit Issue" : "Add Issue"
              )}
            </h2>

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
        )}

        {/* Read-Only Banner */}
        {isReadOnly && (
          <div style={{
            padding: '10px 24px',
            backgroundColor: '#FEF3C7',
            borderBottom: '1px solid #FCD34D',
            color: '#92400E',
            fontSize: '12px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Eye style={{ width: '15px', height: '15px', color: '#D97706' }} />
            <span>Read-Only View Mode: You belong to a different domain role and do not have edit permissions for this issue.</span>
          </div>
        )}

        {/* AI Loading Overlay */}
        {isAiLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            zIndex: 100,
            color: '#ffffff'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              border: '4px solid rgba(255,255,255,0.2)',
              borderTopColor: '#D8001D',
              animation: 'spin 0.8s linear infinite'
            }}></div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '18px', height: '18px', color: '#FDE047' }} />
                <span>AI Generating Insights...</span>
              </p>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>Analyzing manual inputs and synthesizing root causes & recommendations</p>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div style={{ padding: '24px 28px', flex: 1, overflowY: 'auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isComparing ? '1fr' : (initialData ? '1fr 1.15fr' : (isAiGenerated ? '1fr 1.2fr' : '1fr')),
            gap: '28px',
            alignItems: 'stretch',
            minHeight: '100%'
          }}>

            {/* LEFT COLUMN: MANUAL ENTRY SECTION */}
            {!isComparing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Row 1: Issue Header */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Issue Header <span style={{ color: '#D8001D' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.issueHeader}
                    onChange={(e) => handleChange('issueHeader', e.target.value)}
                    placeholder="Enter issue header..."
                    style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>

                {/* Row 2: Original Issue (Multiline Textarea) */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Original Issue <span style={{ color: '#D8001D' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.originalIssue}
                    onChange={(e) => handleChange('originalIssue', e.target.value)}
                    placeholder="Enter original finding text..."
                    style={{ width: '100%', padding: '10px 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>

                {/* Row 3: Criticality (Radio Selection: Critical, Major, Minor) */}
                <div>
                  <FormRadioButtonGroup
                    label="Criticality"
                    required={false}
                    value={formData.criticality}
                    onChange={(val) => handleChange('criticality', val)}
                    options={['Critical', 'Major', 'Minor']}
                    fullWidth={true}
                  />
                </div>

                {/* Row 4: Repeat Finding & SOX Reportable (Radio: Yes / No) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div>
                    <FormRadioButtonGroup
                      label="Repeat Finding"
                      required={false}
                      value={formData.repeatFinding}
                      onChange={(val) => handleChange('repeatFinding', val)}
                      options={['No', 'Yes']}
                    />
                  </div>

                  <div>
                    <FormRadioButtonGroup
                      label="SOX Reportable"
                      required={false}
                      value={formData.soxReportable}
                      onChange={(val) => handleChange('soxReportable', val)}
                      options={['No', 'Yes']}
                    />
                  </div>
                </div>

                {/* Row 5: Tech (Radio: IT, FinOps) & Accountable Function */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div>
                    <FormRadioButtonGroup
                      label="Tech"
                      required={true}
                      value={formData.tech}
                      onChange={(val) => handleChange('tech', val)}
                      options={['IT', 'FinOps']}
                    />
                  </div>

                  <div>
                    <FormSelectDropdown
                      label="Accountable Function"
                      required={false}
                      value={formData.accountableFunction}
                      onChange={(val) => handleChange('accountableFunction', val)}
                      options={['IT', 'FinOps']}
                      placeholder="Select Function..."
                    />
                  </div>
                </div>

                {/* Row 6: Process Area & Issue Cause Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div>
                    <FormSelectDropdown
                      label="Process Area"
                      required={false}
                      value={formData.processArea}
                      onChange={(val) => handleChange('processArea', val)}
                      options={[
                        'Catheter Line 3 Electrophysiology',
                        'Cleanroom HVAC Unit 4',
                        'Packaging & Sterilization Unit',
                        'Optic Sensor Calibration',
                        'GxP Software Access Control'
                      ]}
                      placeholder="Select Process Area..."
                    />
                  </div>

                  <div>
                    <FormSelectDropdown
                      label="Issue Cause Type"
                      required={false}
                      value={formData.issueCauseType}
                      onChange={(val) => handleChange('issueCauseType', val)}
                      options={[
                        'Automated Sensor Calibration Drift',
                        'Manual Data Entry Excursion',
                        'Firmware Integrity Checksum Error',
                        'Cleanroom HVAC Environmental Excursion',
                        'System Access Control Failure'
                      ]}
                      placeholder="Select Cause Type..."
                    />
                  </div>
                </div>

                {/* Row 7: Primary Business Contact & Secondary Contact (Optional) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', margin: 0 }}>
                        Primary Business Contact
                      </label>

                      {initialData && (
                        <button
                          onClick={() => setIsDelegating(!isDelegating)}
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#2563EB',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <UserPlus style={{ width: '12px', height: '12px' }} />
                          <span>{isDelegating ? "Cancel Delegate" : "Delegate"}</span>
                        </button>
                      )}
                    </div>

                    <FormSelectDropdown
                      value={formData.primaryContact}
                      onChange={(val) => handleChange('primaryContact', val)}
                      options={[
                        'Kevin Zhang (IT Lead)',
                        'Rachel Green (FinOps Lead)',
                        'Marcus Vance (Quality Audit)',
                        'Sarah Jenkins (Compliance)'
                      ]}
                      placeholder="Select Primary Contact..."
                    />

                    {isDelegating && (
                      <div style={{ marginTop: '8px', padding: '8px 10px', backgroundColor: '#EFF6FF', border: '1px dashed #60A5FA', borderRadius: '6px' }}>
                        <FormSelectDropdown
                          label="Delegate To (User Name / Email)"
                          value={delegatedTo}
                          onChange={(val) => setDelegatedTo(val)}
                          options={[
                            'Dr. Alexander Wright (Compliance Director)',
                            'Elena Rostova (Lead Quality Auditor)',
                            'Michael Chang (VP FinOps)'
                          ]}
                          placeholder="Select Delegation Target..."
                        />
                      </div>
                    )}

                    {delegatedTo && !isDelegating && (
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', display: 'block', marginTop: '4px' }}>
                        ✓ Delegated to: {delegatedTo}
                      </span>
                    )}
                  </div>

                  <div>
                    <FormSelectDropdown
                      label="Secondary Business Contact"
                      isMulti={true}
                      value={formData.secondaryContact}
                      onChange={(val) => handleChange('secondaryContact', val)}
                      options={[
                        'David Miller (IT Audit)',
                        'Amanda Palmer (FinOps Lead)',
                        'Brian Cox (Executive VP)',
                        'None'
                      ]}
                      placeholder="Select Secondary Contact..."
                    />
                  </div>
                </div>

                {/* Action Button at Bottom of Manual Entry Form (Only in Step 1) */}
                {!isAiGenerated && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button
                      onClick={handleGenerateAi}
                      style={{
                        height: '42px',
                        padding: '0 24px',
                        fontSize: '13.5px',
                        fontWeight: '800',
                        color: '#ffffff',
                        backgroundColor: '#D8001D',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 6px rgba(216,0,29,0.25)'
                      }}
                    >
                      <Sparkles style={{ width: '16px', height: '16px' }} />
                      <span>Generate & AI Synthesize</span>
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* RIGHT COLUMN: AI SYNTHESIZED CARD (OR VERSION COMPARISON MODE) */}
            {isAiGenerated && !isComparing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <Sparkles style={{ width: '16px', height: '16px', color: '#D8001D' }} />
                    <span>AI Synthesized Insights</span>
                  </h3>

                  {/* Re-generate with AI button placed in Header */}
                  <button
                    type="button"
                    onClick={handleGenerateAi}
                    style={{
                      height: '32px',
                      padding: '0 14px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#ffffff',
                      backgroundColor: '#1E40AF',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 3px rgba(30, 64, 175, 0.2)'
                    }}
                  >
                    <RefreshCw style={{ width: '13px', height: '13px' }} />
                    <span>Re-generate with AI</span>
                  </button>
                </div>

                {/* AI Field Helper Renderer with Integrated Loader, Embedded Icons & Light Grey Reference Box */}
                {[
                  { key: 'updatedIssueHeader', label: 'Updated Issue Header', rows: 2 },
                  { key: 'rootCause', label: 'Root Cause', rows: 3 },
                  { key: 'impact', label: 'Impact', rows: 2 },
                  { key: 'description', label: 'Description', rows: 3 },
                  { key: 'recommendation', label: 'Recommendation', rows: 4 }
                ].map(({ key, label, rows }) => {
                  const isRemarkOpen = activeRemarkField === key;
                  const currentRemark = remarks[key] || '';
                  const isLoading = !!aiFieldLoading[key];
                  const pendingReview = aiPendingReviews[key];
                  const isPending = !!pendingReview;
                  const isSubstringReview = pendingReview && pendingReview.isSubstring;
                  const isWholePending = isPending && !isSubstringReview;
                  const isWholeLoading = isLoading && !isSubstringReview;

                  return (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        
                        {/* Label Header with Left Sparkle Wand Icon & Dropdown Options */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div 
                            ref={aiWandOpenField === key ? wandContainerRef : null}
                            style={{ position: 'relative' }}
                          >
                            <button
                              type="button"
                              onClick={() => setAiWandOpenField(aiWandOpenField === key ? null : key)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '2px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                outline: 'none',
                                transition: 'all 0.15s ease'
                              }}
                              title="AI Rewrite Options"
                            >
                              <Sparkles style={{ width: '14px', height: '14px', color: '#9333EA' }} />
                            </button>

                            {/* Dropdown Menu for AI Rewrite Options */}
                            {aiWandOpenField === key && (
                              <div style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 4px)',
                                left: 0,
                                zIndex: 300,
                                width: '210px',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.06)',
                                padding: '4px',
                                animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}>
                                {[
                                  { action: 'rewrite', label: 'Auto-rewrite', icon: Sparkles },
                                  { action: 'tone', label: 'Adjust tone professionally', icon: ShieldCheck },
                                  { action: 'detailed', label: 'Make it detailed', icon: FileText },
                                  { action: 'shorter', label: 'Make it shorter', icon: Minimize2 }
                                ].map(item => (
                                  <div
                                    key={item.action}
                                    onClick={() => handleTriggerAiAdjustment(key, item.action)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '7px 10px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '11.5px',
                                      fontWeight: '600',
                                      color: '#334155',
                                      transition: 'all 0.12s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#FAF5FF';
                                      e.currentTarget.style.color = '#7E22CE';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.color = '#334155';
                                    }}
                                  >
                                    <item.icon style={{ width: '13px', height: '13px', color: '#9333EA' }} />
                                    <span>{item.label}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', margin: 0 }}>
                            {label} <span style={{ color: '#D8001D' }}>*</span>
                          </label>
                        </div>

                        {/* Top-Right Add Remark Button (Only when no remark has been added yet) */}
                        {!currentRemark && (
                          <button
                            type="button"
                            onClick={() => setActiveRemarkField(isRemarkOpen ? null : key)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: isRemarkOpen ? '#2563EB' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 4px',
                              borderRadius: '4px'
                            }}
                            title="Add custom remark for this AI field"
                          >
                            <span>+ Add Remark</span>
                          </button>
                        )}
                      </div>

                      {/* Main Input Field Container */}
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        borderRadius: '8px',
                        border: isWholePending ? '1.5px solid #A855F7' : (isWholeLoading ? '1.5px solid #C084FC' : '1px solid #CBD5E1'),
                        backgroundColor: isWholePending ? '#FAF5FF' : '#ffffff',
                        boxShadow: isWholePending ? '0 2px 8px rgba(168, 85, 247, 0.12)' : 'none',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}>
                        
                        {/* Top-Left Clean Tick / Cancel Icons (Only for Whole Field AI Rewrites) */}
                        {isWholePending && !isLoading && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: '6px',
                            padding: '2px 4px 2px 4px'
                          }}>
                            {/* Tick Button */}
                            <button
                              type="button"
                              onClick={() => handleAcceptAiSuggestion(key)}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '4px',
                                backgroundColor: '#DCFCE7',
                                border: '1px solid #86EFAC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.12s ease'
                              }}
                              title="Accept AI Rewrite (Keep new text)"
                            >
                              <Check style={{ width: '13px', height: '13px', color: '#166534', strokeWidth: 2.5 }} />
                            </button>
                            {/* Cancel Button */}
                            <button
                              type="button"
                              onClick={() => handleCancelAiSuggestion(key)}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '4px',
                                backgroundColor: '#FEE2E2',
                                border: '1px solid #FCA5A5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.12s ease'
                              }}
                              title="Cancel AI Rewrite (Revert to original)"
                            >
                              <X style={{ width: '13px', height: '13px', color: '#991B1B', strokeWidth: 2.5 }} />
                            </button>
                          </div>
                        )}

                        {/* Meaningful Field-Specific Loader or Substring Review Box vs Standard Textarea */}
                        {isLoading && (!pendingReview || !pendingReview.isSubstring) ? (
                          <div style={{
                            minHeight: key === 'recommendation' ? '120px' : '75px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            backgroundColor: '#FAF5FF',
                            borderRadius: '6px',
                            padding: '16px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <RefreshCw style={{ width: '18px', height: '18px', color: '#9333EA', animation: 'spin 1s linear infinite' }} />
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#7E22CE' }}>
                                Synthesizing AI Response...
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#6B21A8' }}>
                              Applying tone, structure and compliance heuristics...
                            </span>
                          </div>
                        ) : pendingReview && pendingReview.isSubstring ? (
                          /* INLINE SUBSTRING SELECTION REVIEW BOX IN-BETWEEN BEFORE & AFTER TEXT */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {/* Before Text Area */}
                            {pendingReview.beforeText && (
                              <textarea
                                rows={Math.max(1, pendingReview.beforeText.split('\n').length)}
                                value={pendingReview.beforeText}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAiPendingReviews(prev => ({
                                    ...prev,
                                    [key]: { ...pendingReview, beforeText: val }
                                  }));
                                }}
                                style={{
                                  width: '100%',
                                  padding: '4px 6px',
                                  fontSize: '12px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  outline: 'none',
                                  fontFamily: 'inherit',
                                  resize: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#0F172A',
                                  lineHeight: '1.5'
                                }}
                              />
                            )}

                            {/* Inline Selection Review Box In-Between */}
                            <div style={{
                              padding: '8px 10px',
                              backgroundColor: '#FAF5FF',
                              border: '1.5px solid #A855F7',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(168, 85, 247, 0.12)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              animation: 'fadeInScale 0.15s ease'
                            }}>
                              {/* Inside Box Top Row: Tick & Cancel Icons on Top-Left */}
                              {!isLoading && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptAiSuggestion(key)}
                                    style={{
                                      width: '22px', height: '22px', borderRadius: '4px',
                                      backgroundColor: '#DCFCE7', border: '1px solid #86EFAC',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }}
                                    title="Accept AI Rewrite for Selection"
                                  >
                                    <Check style={{ width: '13px', height: '13px', color: '#166534', strokeWidth: 2.5 }} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCancelAiSuggestion(key)}
                                    style={{
                                      width: '22px', height: '22px', borderRadius: '4px',
                                      backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }}
                                    title="Cancel AI Rewrite (Revert Selection)"
                                  >
                                    <X style={{ width: '13px', height: '13px', color: '#991B1B', strokeWidth: 2.5 }} />
                                  </button>
                                </div>
                              )}

                              {/* Loader inside this in-between box */}
                              {isLoading ? (
                                <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                  <RefreshCw style={{ width: '16px', height: '16px', color: '#9333EA', animation: 'spin 1s linear infinite' }} />
                                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#7E22CE' }}>
                                    Rewriting selected text...
                                  </span>
                                </div>
                              ) : (
                                <>
                                  {/* New AI Generated Content for Selection */}
                                  <textarea
                                    rows={Math.max(2, (pendingReview.newText || '').split('\n').length)}
                                    value={pendingReview.newText || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAiPendingReviews(prev => ({
                                        ...prev,
                                        [key]: { ...pendingReview, newText: val }
                                      }));
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '6px 8px',
                                      fontSize: '12px',
                                      borderRadius: '6px',
                                      border: '1px solid #D8B4FE',
                                      outline: 'none',
                                      backgroundColor: '#ffffff',
                                      color: '#6B21A8',
                                      fontWeight: '600',
                                      lineHeight: '1.5',
                                      resize: 'vertical'
                                    }}
                                  />

                                  {/* Selected Previous Content in Grey Box */}
                                  <div style={{
                                    padding: '6px 8px',
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '6px'
                                  }}>
                                    <span style={{ fontSize: '11.5px', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                      {pendingReview.originalText}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* After Text Area */}
                            {pendingReview.afterText && (
                              <textarea
                                rows={Math.max(1, pendingReview.afterText.split('\n').length)}
                                value={pendingReview.afterText}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAiPendingReviews(prev => ({
                                    ...prev,
                                    [key]: { ...pendingReview, afterText: val }
                                  }));
                                }}
                                style={{
                                  width: '100%',
                                  padding: '4px 6px',
                                  fontSize: '12px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  outline: 'none',
                                  fontFamily: 'inherit',
                                  resize: 'none',
                                  backgroundColor: 'transparent',
                                  color: '#0F172A',
                                  lineHeight: '1.5'
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          (() => {
                            const lineCount = (aiData[key] || '').split('\n').length;
                            const dynamicRows = key === 'recommendation' ? Math.max(5, lineCount + 1) : rows;
                            return (
                              <textarea
                                rows={dynamicRows}
                                value={aiData[key] || ''}
                                onChange={(e) => handleAiChange(key, e.target.value)}
                                onSelect={(e) => handleTextareaSelect(key, e)}
                                onMouseUp={(e) => handleTextareaSelect(key, e)}
                                onKeyUp={(e) => handleTextareaSelect(key, e)}
                                placeholder={`AI Generated ${label}...`}
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  fontSize: '12px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  outline: 'none',
                                  fontFamily: 'inherit',
                                  resize: 'vertical',
                                  backgroundColor: 'transparent',
                                  color: isPending ? '#6B21A8' : '#0F172A',
                                  fontWeight: isPending ? '600' : '400',
                                  minHeight: key === 'recommendation' ? '120px' : 'auto',
                                  lineHeight: '1.5'
                                }}
                              />
                            );
                          })()
                        )}

                        {/* Floating Selection Sparkles Icon near Selected Text */}
                        {textSelection && textSelection.fieldKey === key && !isLoading && !isPending && (
                          <div 
                            ref={selectionWandRef}
                            style={{
                              position: 'absolute',
                              top: `${Math.max(6, textSelection.topOffset || 6)}px`,
                              right: '12px',
                              zIndex: 200,
                              animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                          >
                            <div style={{ position: 'relative' }}>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectionWandOpen(prev => !prev);
                                }}
                                style={{
                                  backgroundColor: '#9333EA',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '16px',
                                  padding: '3px 8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.35)',
                                  transition: 'all 0.15s ease'
                                }}
                                title="AI Rewrite Selected Text"
                              >
                                <Sparkles style={{ width: '12px', height: '12px', color: '#ffffff' }} />
                                <span>Rewrite</span>
                              </button>

                              {/* Popover Menu for Selected Text AI Rewrite Options */}
                              {selectionWandOpen && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: 'calc(100% + 4px)',
                                  right: 0,
                                  zIndex: 300,
                                  width: '210px',
                                  backgroundColor: '#ffffff',
                                  borderRadius: '8px',
                                  border: '1px solid #E2E8F0',
                                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
                                  padding: '4px',
                                  animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}>
                                  {[
                                    { action: 'rewrite', label: 'Auto-rewrite', icon: Sparkles },
                                    { action: 'tone', label: 'Adjust tone professionally', icon: ShieldCheck },
                                    { action: 'detailed', label: 'Make it detailed', icon: FileText },
                                    { action: 'shorter', label: 'Make it shorter', icon: Minimize2 }
                                  ].map(item => (
                                    <div
                                      key={item.action}
                                      onClick={() => {
                                        setSelectionWandOpen(false);
                                        handleTriggerAiAdjustment(key, item.action, textSelection);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '7px 10px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '11.5px',
                                        fontWeight: '600',
                                        color: '#334155',
                                        transition: 'all 0.12s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FAF5FF';
                                        e.currentTarget.style.color = '#7E22CE';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#334155';
                                      }}
                                    >
                                      <item.icon style={{ width: '13px', height: '13px', color: '#9333EA' }} />
                                      <span>{item.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Whole-Field Original Content in Light Grey Box at Bottom */}
                        {isPending && !pendingReview?.isSubstring && !isLoading && pendingReview.originalText && (
                          <div style={{
                            marginTop: '4px',
                            padding: '8px 10px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px'
                          }}>
                            <span style={{ fontSize: '11.5px', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                              {pendingReview.originalText}
                            </span>
                          </div>
                        )}

                      </div>



                      {/* Inline Multiline Auto-Height Remark Textarea */}
                      {isRemarkOpen && (
                        <div style={{ marginTop: '4px', padding: '8px 10px', backgroundColor: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE', animation: 'fadeInScale 0.15s ease' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>Auditor Remark ({label}):</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveRemarkField(null)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}
                            >
                              Done
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Type custom remark..."
                            value={remarks[key] || ''}
                            onChange={(e) => setRemarks(prev => ({ ...prev, [key]: e.target.value }))}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #93C5FD', outline: 'none', backgroundColor: '#ffffff', fontFamily: 'inherit', resize: 'vertical' }}
                          />
                        </div>
                      )}

                      {/* Readable Saved Remark Text Block (Contains the Edit Remark button) */}
                      {currentRemark && !isRemarkOpen && (
                        <div style={{
                          marginTop: '6px',
                          padding: '8px 12px',
                          backgroundColor: '#F0FDF4',
                          borderRadius: '6px',
                          border: '1px solid #BBF2D0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534' }}>
                              ✓ Auditor Remark:
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveRemarkField(key)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10.5px', color: '#2563EB', fontWeight: '700' }}
                            >
                              Edit Remark
                            </button>
                          </div>
                          <p style={{ margin: 0, fontSize: '11.5px', lineHeight: '1.45', color: '#14532D', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {currentRemark}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>
            )}

            {/* VERSION COMPARISON MODE (STREAMLINED TABLE COMPARISON GRID) */}
            {isComparing && previousAiData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <GitCompare style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                      <span>Compare AI Generated Versions</span>
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                      Select field options directly below to assemble your final AI synthesis version.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleKeepEntireVersion('previous', previousAiData)}
                      style={{
                        height: '34px',
                        padding: '0 14px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#1E40AF',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Keep Previous Version
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsComparing(false)}
                      style={{
                        height: '34px',
                        padding: '0 16px',
                        fontSize: '12px',
                        fontWeight: '800',
                        color: '#ffffff',
                        backgroundColor: '#15803D',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(21, 128, 61, 0.2)'
                      }}
                    >
                      <Check style={{ width: '14px', height: '14px' }} />
                      <span>Accept Selected Version</span>
                    </button>
                  </div>
                </div>

                {/* Streamlined Field Rows with Field Label Placed Above */}
                {[
                  { key: 'updatedIssueHeader', label: 'Updated Issue Header' },
                  { key: 'rootCause', label: 'Root Cause' },
                  { key: 'impact', label: 'Impact' },
                  { key: 'description', label: 'Description' },
                  { key: 'recommendation', label: 'Recommendation' }
                ].map(({ key, label }, idx) => {
                  const prevVal = previousAiData[key] || '';
                  const currVal = aiData[key] || '';
                  const isPrevSelected = selectedVersions[key] === 'previous';
                  const isCurrSelected = selectedVersions[key] === 'current';

                  return (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      {/* Field Label Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                          {label}
                        </span>
                      </div>

                      {/* Full-Width 2-Column Options (1fr 1fr) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                        {/* Previous Version Box */}
                        <div
                          onClick={() => handleSelectCardVersion(key, 'previous', prevVal)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: isPrevSelected ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                            backgroundColor: isPrevSelected ? '#ECFDF5' : '#ffffff',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: isPrevSelected ? '#047857' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Previous Version
                            </span>

                            {isPrevSelected && (
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check style={{ width: '12px', height: '12px' }} />
                                <span>Selected</span>
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.45', color: isPrevSelected ? '#064E3B' : '#475569', whiteSpace: 'pre-wrap' }}>
                            {prevVal}
                          </p>
                        </div>

                        {/* Newly Generated AI Version Box */}
                        <div
                          onClick={() => handleSelectCardVersion(key, 'current', currVal)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            border: isCurrSelected ? '1.5px solid #10B981' : '1px solid #BFDBFE',
                            backgroundColor: isCurrSelected ? '#ECFDF5' : '#EFF6FF',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: isCurrSelected ? '#047857' : '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Newly Generated AI Version
                            </span>

                            {isCurrSelected && (
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check style={{ width: '12px', height: '12px' }} />
                                <span>Selected</span>
                              </span>
                            )}
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.45', color: isCurrSelected ? '#064E3B' : '#1E3A8A', whiteSpace: 'pre-wrap' }}>
                            {currVal}
                          </p>
                        </div>

                      </div>
                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </div>

        {/* Read-Only Footer Bar */}
        {isReadOnly && (
          <div style={{
            padding: '14px 28px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.05)',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: '40px',
                padding: '0 24px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#1E293B',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close Drawer
            </button>
          </div>
        )}

        {/* Fixed Bottom Drawer Footer Bar (Shown Only After AI Generation in Step 2, Hidden during Version Comparison) */}
        {!isReadOnly && isAiGenerated && !isComparing && (
          <div style={{
            padding: '14px 28px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.05)',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: '40px',
                padding: '0 20px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#475569',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                height: '40px',
                padding: '0 28px',
                backgroundColor: '#15803D',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Check style={{ width: '16px', height: '16px', strokeWidth: 3 }} />
              <span>Save Issue</span>
            </button>
          </div>
        )}

      </aside>

    </div>
  );
}
