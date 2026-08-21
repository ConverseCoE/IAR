import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, RefreshCw, MessageSquare, AlertCircle, 
  CheckCircle2, Plus, ArrowRight, ShieldCheck, DollarSign, UserPlus, AlertOctagon, GitCompare, Check, ChevronDown, AlertTriangle
} from 'lucide-react';

// Custom Enterprise SaaS Form Select Dropdown
function FormSelectDropdown({ label, required, value, onChange, options, placeholder = "Select option..." }) {
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

  const selectedOption = options.find(opt => (typeof opt === 'object' ? opt.value : opt) === value);
  const selectedLabel = selectedOption ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption) : (value || placeholder);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
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
          height: '38px',
          padding: '0 12px',
          fontSize: '12.5px',
          fontWeight: '600',
          color: value ? '#0F172A' : '#94A3B8',
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
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            const isSelected = value === optVal;

            return (
              <div
                key={optVal}
                onClick={() => {
                  onChange(optVal);
                  setIsOpen(false);
                }}
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
  initialData = null
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
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', zIndex: 120 }}>
      
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
            <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>
              {initialData ? "Edit Issue" : "Add Issue"}
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
                    required={true}
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
                      required={true}
                      value={formData.repeatFinding}
                      onChange={(val) => handleChange('repeatFinding', val)}
                      options={['No', 'Yes']}
                    />
                  </div>

                  <div>
                    <FormRadioButtonGroup
                      label="SOX Reportable"
                      required={true}
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
                      required={true}
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
                      required={true}
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
                      required={true}
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

                {/* AI Field Helper Renderer with Top-Right Remarks Provision */}
                {[
                  { key: 'updatedIssueHeader', label: 'Updated Issue Header', rows: 2 },
                  { key: 'rootCause', label: 'Root Cause', rows: 3 },
                  { key: 'impact', label: 'Impact', rows: 2 },
                  { key: 'description', label: 'Description', rows: 3 },
                  { key: 'recommendation', label: 'Recommendation', rows: 4 }
                ].map(({ key, label, rows }) => {
                  const isRemarkOpen = activeRemarkField === key;
                  const currentRemark = remarks[key] || '';

                  return (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', margin: 0 }}>
                          {label} <span style={{ color: '#D8001D' }}>*</span>
                        </label>

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

                      {(() => {
                        const lineCount = (aiData[key] || '').split('\n').length;
                        const dynamicRows = key === 'recommendation' ? Math.max(5, lineCount + 1) : rows;
                        return (
                          <textarea
                            rows={dynamicRows}
                            value={aiData[key] || ''}
                            onChange={(e) => handleAiChange(key, e.target.value)}
                            placeholder={`AI Generated ${label}...`}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: '12px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              outline: 'none',
                              fontFamily: 'inherit',
                              resize: 'vertical',
                              backgroundColor: '#ffffff',
                              minHeight: key === 'recommendation' ? '120px' : 'auto'
                            }}
                          />
                        );
                      })()}

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

        {/* Fixed Bottom Drawer Footer Bar (Shown Only After AI Generation in Step 2, Hidden during Version Comparison) */}
        {isAiGenerated && !isComparing && (
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
