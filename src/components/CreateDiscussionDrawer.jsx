import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Sparkles, RefreshCw, MessageSquare, AlertCircle, 
  CheckCircle2, Plus, ArrowRight, ShieldCheck, DollarSign, UserPlus, AlertOctagon, GitCompare, Check, ChevronDown
} from 'lucide-react';

// Custom Enterprise SaaS Form Select Dropdown with Micro-Interactions & Motion Animations
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

export default function CreateDiscussionDrawer({
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
    criticality: 'High',
    soxReportable: 'No',
    primaryContact: 'Kevin Zhang (IT Lead)',
    secondaryContact: 'David Miller (IT Audit)',
    repeatFinding: 'No',
    accountableFunction: defaultFunction,
    issueCauseType: 'Automated Sensor Calibration Drift',
    processArea: 'Catheter Line 3 Electrophysiology',
    riskRating: 'High',
    issue: ''
  });

  // Delegation State (Edit Drawer Feature)
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

  // Track field-level selection state: { updatedIssueHeader: 'current', rootCause: 'previous', ... }
  const [selectedVersions, setSelectedVersions] = useState({
    updatedIssueHeader: 'current',
    rootCause: 'current',
    impact: 'current',
    description: 'current',
    recommendation: 'current'
  });

  // AI Fields State
  const [aiData, setAiData] = useState({
    rootCause: '',
    updatedIssueHeader: '',
    impact: '',
    description: '',
    recommendation: ''
  });

  const [activeRemarkField, setActiveRemarkField] = useState(null);

  // Effect to populate initialData when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        issueHeader: initialData.header || '',
        originalIssue: initialData.originalIssue || initialData.header || '',
        criticality: initialData.criticality || 'High',
        soxReportable: initialData.isIssue ? 'Yes' : 'No',
        primaryContact: `${initialData.addedBy || 'Kevin Zhang'} (IT Lead)`,
        secondaryContact: `${initialData.lastUpdatedBy || 'David Miller'} (IT Audit)`,
        repeatFinding: 'No',
        accountableFunction: initialData.functionType || defaultFunction,
        issueCauseType: 'Automated Sensor Calibration Drift',
        processArea: 'Catheter Line 3 Electrophysiology',
        riskRating: initialData.criticality || 'High',
        issue: initialData.description || ''
      });

      setIsIssueStatus(!!initialData.isIssue);
      setDelegatedTo(initialData.delegatedTo || '');
      setIsDelegating(false);

      const loadedAi = {
        rootCause: `Systemic telemetry drift identified in Catheter Line 3 Electrophysiology due to Automated Sensor Calibration Drift. Secondary thermal excursions caused optic sensor gain calibration offsets over 72 hours of continuous batch runs.`,
        updatedIssueHeader: initialData.header || '',
        impact: `Potential delay in batch release and risk of $120,000 material scrap variance if unmitigated under ${initialData.criticality || 'High'} risk level.`,
        description: initialData.description || '',
        recommendation: `1. Implement automated SHA-256 integrity checksum log verification across process area.\n2. Enforce mandatory multi-factor authentication (MFA) approval policies for sensor recalibration overrides.\n3. Upgrade optic sensor firmware to v4.2 to enable automatic temperature drift compensation.`
      };

      setAiData(loadedAi);
      setPreviousAiData(null); // Reset comparison history
      setIsComparing(false);
      setIsAiGenerated(true); // Open directly in Side-by-Side Mode!
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
        criticality: 'High',
        soxReportable: 'No',
        primaryContact: 'Kevin Zhang (IT Lead)',
        secondaryContact: 'David Miller (IT Audit)',
        repeatFinding: 'No',
        accountableFunction: defaultFunction,
        issueCauseType: 'Automated Sensor Calibration Drift',
        processArea: 'Catheter Line 3 Electrophysiology',
        riskRating: 'High',
        issue: ''
      });
      setAiData({ rootCause: '', updatedIssueHeader: '', impact: '', description: '', recommendation: '' });
    }
  }, [initialData, isOpen, defaultFunction]);

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleAiChange = (field, val) => {
    setAiData(prev => ({ ...prev, [field]: val }));
  };

  const handleGenerateAi = () => {
    if (isAiGenerated && aiData.rootCause) {
      setPreviousAiData({ ...aiData });
    }
    setIsAiLoading(true);

    setTimeout(() => {
      setIsAiLoading(false);
      setIsAiGenerated(true);
      if (!initialData) {
        setAiData({
          rootCause: `Root cause analysis indicates ${formData.issueCauseType || 'calibration drift'} within ${formData.processArea || 'the production line'}, stemming from legacy control parameter overrides.`,
          updatedIssueHeader: formData.issueHeader ? `AI Refined: ${formData.issueHeader}` : `AI Refined Finding in ${formData.processArea}`,
          impact: `Risk Rating: ${formData.riskRating}. Unmanaged escalation could lead to non-compliance audit findings and operational delays.`,
          description: formData.issue || `Detailed AI synthesized observation for ${formData.processArea}.`,
          recommendation: `1. Enforce strict change control validation for ${formData.issueCauseType}.\n2. Conduct quarterly compliance reviews for ${formData.accountableFunction} personnel.`
        });
      }
    }, 900);
  };

  const handleSelectCardVersion = (fieldKey, versionType, contentText) => {
    setSelectedVersions(prev => ({ ...prev, [fieldKey]: versionType }));
    setAiData(prev => ({ ...prev, [fieldKey]: contentText }));
  };

  const handleKeepEntireVersion = (versionType, versionObj) => {
    setAiData({ ...versionObj });
    setSelectedVersions({
      updatedIssueHeader: versionType,
      rootCause: versionType,
      impact: versionType,
      description: versionType,
      recommendation: versionType
    });
    setIsComparing(false);
  };

  const handleSave = () => {
    if (!formData.issueHeader.trim()) {
      alert("Please enter an Issue Header before saving.");
      return;
    }

    const savedPoint = {
      id: initialData ? initialData.id : `DP-${Date.now().toString().slice(-3)}`,
      reportId: "REP-2026-006",
      fileName: "BiosenseWebster_Catheters_Audit",
      rowNum: initialData ? initialData.rowNum : Date.now(),
      header: aiData.updatedIssueHeader || formData.issueHeader,
      criticality: formData.criticality,
      functionType: formData.accountableFunction,
      description: aiData.description || formData.issue || "No description provided.",
      addedBy: delegatedTo || formData.primaryContact.split(' ')[0] || "Kevin Zhang",
      lastUpdatedBy: "Kevin Zhang",
      status: "Active",
      isIssue: initialData ? isIssueStatus : (formData.soxReportable === 'Yes' || formData.criticality === 'Critical'),
      delegatedTo: delegatedTo
    };

    onSaveDiscussionPoint(savedPoint);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', zIndex: 120 }}>
      
      {/* Overlay Drawer Panel */}
      <aside style={{
        width: isAiGenerated ? (isComparing ? '1280px' : '1220px') : '720px',
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
              border: '3px solid rgba(255,255,255,0.2)',
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
            gridTemplateColumns: isComparing ? '1fr' : (isAiGenerated ? '1.25fr 1fr' : '1fr'),
            gap: '28px',
            alignItems: 'stretch',
            minHeight: '100%'
          }}>

            {/* LEFT COLUMN: MANUAL ENTRY SECTION (HIDDEN ENTIRELY WHEN COMPARING VERSIONS) */}
            {!isComparing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Row 1: Issue Header */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Issue Header
                  </label>
                  <input
                    type="text"
                    value={formData.issueHeader}
                    onChange={(e) => handleChange('issueHeader', e.target.value)}
                    placeholder="Enter issue header..."
                    style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>

                {/* Row 2: Original Issue */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Original Issue
                  </label>
                  <input
                    type="text"
                    value={formData.originalIssue}
                    onChange={(e) => handleChange('originalIssue', e.target.value)}
                    placeholder="Original finding text..."
                    style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
                  />
                </div>

                {/* Row 3: Criticality & SOX Reportable */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <FormSelectDropdown
                      label="Criticality"
                      value={formData.criticality}
                      onChange={(val) => handleChange('criticality', val)}
                      options={['Critical', 'High', 'Medium', 'Low']}
                    />
                  </div>

                  <div>
                    <FormSelectDropdown
                      label="SOX Reportable"
                      required={true}
                      value={formData.soxReportable}
                      onChange={(val) => handleChange('soxReportable', val)}
                      options={['No', 'Yes']}
                    />
                  </div>
                </div>

                {/* Row 4: Primary Business Contact & Secondary Contact */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
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
                    />
                  </div>
                </div>

                {/* Row 5: Accountable Function & Repeat Finding */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <FormSelectDropdown
                      label="Accountable Function"
                      value={formData.accountableFunction}
                      onChange={(val) => handleChange('accountableFunction', val)}
                      options={['IT', 'FinOps']}
                    />
                  </div>

                  <div>
                    <FormSelectDropdown
                      label="Repeat Finding"
                      value={formData.repeatFinding}
                      onChange={(val) => handleChange('repeatFinding', val)}
                      options={['No', 'Yes']}
                    />
                  </div>
                </div>

                {/* Row 6: Issue Cause Type & Process Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <FormSelectDropdown
                      label="Issue Cause Type"
                      value={formData.issueCauseType}
                      onChange={(val) => handleChange('issueCauseType', val)}
                      options={[
                        'Automated Sensor Calibration Drift',
                        'Manual Data Entry Excursion',
                        'Firmware Integrity Checksum Error',
                        'Cleanroom HVAC Environmental Excursion',
                        'System Access Control Failure'
                      ]}
                    />
                  </div>

                  <div>
                    <FormSelectDropdown
                      label="Process Area"
                      value={formData.processArea}
                      onChange={(val) => handleChange('processArea', val)}
                      options={[
                        'Catheter Line 3 Electrophysiology',
                        'Cleanroom HVAC Unit 4',
                        'Packaging & Sterilization Unit',
                        'Optic Sensor Calibration',
                        'GxP Software Access Control'
                      ]}
                    />
                  </div>
                </div>

                {/* Row 7: Risk Rating */}
                <div>
                  <FormSelectDropdown
                    label="Risk Rating"
                    value={formData.riskRating}
                    onChange={(val) => handleChange('riskRating', val)}
                    options={['Critical', 'High', 'Medium', 'Low']}
                  />
                </div>

                {/* Row 8: Issue Textarea */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Issue
                  </label>
                  <textarea
                    rows={4}
                    value={formData.issue}
                    onChange={(e) => handleChange('issue', e.target.value)}
                    placeholder="Enter comprehensive issue details..."
                    style={{ width: '100%', padding: '10px 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>

                {/* Action Button at Bottom of Manual Entry Form */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    onClick={handleGenerateAi}
                    style={{
                      height: '42px',
                      padding: '0 24px',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      color: '#ffffff',
                      backgroundColor: isAiGenerated ? '#1E40AF' : '#D8001D',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: isAiGenerated ? '0 2px 6px rgba(30,64,175,0.25)' : '0 2px 6px rgba(216,0,29,0.25)'
                    }}
                  >
                    {isAiGenerated ? <RefreshCw style={{ width: '16px', height: '16px' }} /> : <Sparkles style={{ width: '16px', height: '16px' }} />}
                    <span>{isAiGenerated ? "Re-generate AI Insights" : "AI Generate"}</span>
                  </button>
                </div>

              </div>
            )}

            {/* RIGHT COLUMN OR FULL-WIDTH COMPARISON SECTION */}
            {isAiGenerated && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                padding: '20px',
                height: '100%',
                animation: 'fadeIn 0.25s ease-out'
              }}>
                
                {/* AI Section Header with ALL Comparison Controls Stacked on Header Line */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #2563EB', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles style={{ width: '18px', height: '18px', color: '#2563EB' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1E40AF', margin: 0 }}>
                      {isComparing ? "AI Version Comparison" : "AI Generated Insights"}
                    </h3>
                  </div>

                  {/* Header Stacked Buttons (Keep Previous, Keep Current, Keep Selected, Cancel) */}
                  {isComparing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      
                      {/* Keep Previous */}
                      <button
                        onClick={() => handleKeepEntireVersion('previous', previousAiData)}
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          color: '#1E40AF',
                          backgroundColor: '#ffffff',
                          border: '1px solid #93C5FD',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Keep Previous
                      </button>

                      {/* Keep Current */}
                      <button
                        onClick={() => setIsComparing(false)}
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          color: '#ffffff',
                          backgroundColor: '#2563EB',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Keep Current
                      </button>

                      {/* Keep Selected */}
                      <button
                        onClick={() => setIsComparing(false)}
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          color: '#ffffff',
                          backgroundColor: '#059669',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Keep Selected
                      </button>

                      {/* Cancel */}
                      <button
                        onClick={() => setIsComparing(false)}
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: '#64748B',
                          backgroundColor: '#ffffff',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>

                    </div>
                  ) : (
                    previousAiData && (
                      <button
                        onClick={() => setIsComparing(true)}
                        style={{
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: '800',
                          color: '#6366F1',
                          backgroundColor: '#ffffff',
                          border: '1px solid #818CF8',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(99,102,241,0.15)'
                        }}
                        title="Compare previous AI content vs newly generated AI content"
                      >
                        <GitCompare style={{ width: '14px', height: '14px' }} />
                        <span>Compare Versions</span>
                      </button>
                    )
                  )}
                </div>

                {/* FULL-WIDTH VERSION COMPARISON VIEW (ENTIRE CARD IS SELECTABLE WITH GREEN HIGHLIGHT) */}
                {isComparing && previousAiData ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease' }}>
                    
                    {/* Side-by-Side Selectable Version Cards */}
                    {['updatedIssueHeader', 'rootCause', 'impact', 'description', 'recommendation'].map((key) => {
                      const labelMap = {
                        updatedIssueHeader: 'Updated Issue Header',
                        rootCause: 'Root Cause',
                        impact: 'Impact',
                        description: 'Description',
                        recommendation: 'Recommendation'
                      };
                      const label = labelMap[key];
                      const prevVal = previousAiData[key] || '';
                      const currVal = aiData[key] || '';
                      const isPrevSelected = selectedVersions[key] === 'previous';
                      const isCurrSelected = selectedVersions[key] === 'current';

                      return (
                        <div key={key} style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{label}</span>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            
                            {/* Previous Version Box */}
                            <div 
                              onClick={() => handleSelectCardVersion(key, 'previous', prevVal)}
                              style={{
                                backgroundColor: isPrevSelected ? '#ECFDF5' : '#F8FAFC',
                                border: isPrevSelected ? '2px solid #10B981' : '1px solid #E2E8F0',
                                borderRadius: '8px',
                                padding: '14px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: isPrevSelected ? '0 2px 8px rgba(16,185,129,0.18)' : 'none'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span style={{ fontWeight: '800', color: isPrevSelected ? '#047857' : '#64748B', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Previous Version
                                  </span>

                                  {isPrevSelected && (
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Check style={{ width: '12px', height: '12px' }} />
                                      <span>Selected</span>
                                    </span>
                                  )}
                                </div>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: isPrevSelected ? '#064E3B' : '#475569', lineHeight: '1.5' }}>{prevVal}</p>
                              </div>
                            </div>

                            {/* Current Generated Version Box */}
                            <div 
                              onClick={() => handleSelectCardVersion(key, 'current', currVal)}
                              style={{
                                backgroundColor: isCurrSelected ? '#ECFDF5' : '#EFF6FF',
                                border: isCurrSelected ? '2px solid #10B981' : '1px solid #93C5FD',
                                borderRadius: '8px',
                                padding: '14px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: isCurrSelected ? '0 2px 8px rgba(16,185,129,0.18)' : 'none'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span style={{ fontWeight: '800', color: isCurrSelected ? '#047857' : '#1E40AF', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Current Generated Version
                                  </span>

                                  {isCurrSelected && (
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Check style={{ width: '12px', height: '12px' }} />
                                      <span>Selected</span>
                                    </span>
                                  )}
                                </div>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: isCurrSelected ? '#064E3B' : '#1E293B', lineHeight: '1.5' }}>{currVal}</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}

                  </div>
                ) : (
                  /* NORMAL AI INSIGHTS VIEW */
                  <>
                    {/* AI Field 1: Updated Issue Header */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#1E3A8A' }}>
                          Updated Issue Header
                        </label>
                        <button
                          onClick={() => setActiveRemarkField(activeRemarkField === 'updatedIssueHeader' ? null : 'updatedIssueHeader')}
                          style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          +Remarks
                        </button>
                      </div>
                      <input
                        type="text"
                        value={aiData.updatedIssueHeader}
                        onChange={(e) => handleAiChange('updatedIssueHeader', e.target.value)}
                        style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '12px', fontWeight: '700', color: '#0F172A', borderRadius: '6px', border: '1px solid #93C5FD', outline: 'none', backgroundColor: '#ffffff' }}
                      />
                      {activeRemarkField === 'updatedIssueHeader' && (
                        <input
                          type="text"
                          placeholder="Add remarks for AI learning..."
                          value={remarks.updatedIssueHeader}
                          onChange={(e) => setRemarks(prev => ({ ...prev, updatedIssueHeader: e.target.value }))}
                          style={{ width: '100%', height: '30px', padding: '0 10px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #60A5FA', marginTop: '6px', backgroundColor: '#ffffff' }}
                        />
                      )}
                    </div>

                    {/* AI Field 2: Root Cause (2-3 lines) */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#1E3A8A' }}>
                          Root Cause
                        </label>
                        <button
                          onClick={() => setActiveRemarkField(activeRemarkField === 'rootCause' ? null : 'rootCause')}
                          style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          +Remarks
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={aiData.rootCause}
                        onChange={(e) => handleAiChange('rootCause', e.target.value)}
                        style={{ width: '100%', padding: '10px', fontSize: '12px', lineHeight: '1.5', borderRadius: '6px', border: '1px solid #93C5FD', outline: 'none', backgroundColor: '#ffffff', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                      {activeRemarkField === 'rootCause' && (
                        <input
                          type="text"
                          placeholder="Add remarks for AI learning..."
                          value={remarks.rootCause}
                          onChange={(e) => setRemarks(prev => ({ ...prev, rootCause: e.target.value }))}
                          style={{ width: '100%', height: '30px', padding: '0 10px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #60A5FA', marginTop: '6px', backgroundColor: '#ffffff' }}
                        />
                      )}
                    </div>

                    {/* AI Field 3: Impact */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#1E3A8A' }}>
                          Impact
                        </label>
                        <button
                          onClick={() => setActiveRemarkField(activeRemarkField === 'impact' ? null : 'impact')}
                          style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          +Remarks
                        </button>
                      </div>
                      <textarea
                        rows={5}
                        value={aiData.impact}
                        onChange={(e) => handleAiChange('impact', e.target.value)}
                        style={{ width: '100%', padding: '10px', fontSize: '12px', lineHeight: '1.5', borderRadius: '6px', border: '1px solid #93C5FD', outline: 'none', backgroundColor: '#ffffff', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                      {activeRemarkField === 'impact' && (
                        <input
                          type="text"
                          placeholder="Add remarks for AI learning..."
                          value={remarks.impact}
                          onChange={(e) => setRemarks(prev => ({ ...prev, impact: e.target.value }))}
                          style={{ width: '100%', height: '30px', padding: '0 10px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #60A5FA', marginTop: '6px', backgroundColor: '#ffffff' }}
                        />
                      )}
                    </div>

                    {/* AI Field 4: Description */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#1E3A8A' }}>
                          Description
                        </label>
                        <button
                          onClick={() => setActiveRemarkField(activeRemarkField === 'description' ? null : 'description')}
                          style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          +Remarks
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={aiData.description}
                        onChange={(e) => handleAiChange('description', e.target.value)}
                        style={{ width: '100%', padding: '10px', fontSize: '12px', lineHeight: '1.5', borderRadius: '6px', border: '1px solid #93C5FD', outline: 'none', backgroundColor: '#ffffff', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                      {activeRemarkField === 'description' && (
                        <input
                          type="text"
                          placeholder="Add remarks for AI learning..."
                          value={remarks.description}
                          onChange={(e) => setRemarks(prev => ({ ...prev, description: e.target.value }))}
                          style={{ width: '100%', height: '30px', padding: '0 10px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #60A5FA', marginTop: '6px', backgroundColor: '#ffffff' }}
                        />
                      )}
                    </div>

                    {/* AI Field 5: Recommendation */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#1E3A8A' }}>
                          Recommendation
                        </label>
                        <button
                          onClick={() => setActiveRemarkField(activeRemarkField === 'recommendation' ? null : 'recommendation')}
                          style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          +Remarks
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        value={aiData.recommendation}
                        onChange={(e) => handleAiChange('recommendation', e.target.value)}
                        style={{ width: '100%', padding: '10px', fontSize: '12px', lineHeight: '1.5', borderRadius: '6px', border: '1px solid #93C5FD', outline: 'none', backgroundColor: '#ffffff', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                      {activeRemarkField === 'recommendation' && (
                        <input
                          type="text"
                          placeholder="Add remarks for AI learning..."
                          value={remarks.recommendation}
                          onChange={(e) => setRemarks(prev => ({ ...prev, recommendation: e.target.value }))}
                          style={{ width: '100%', height: '30px', padding: '0 10px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #60A5FA', marginTop: '6px', backgroundColor: '#ffffff' }}
                        />
                      )}
                    </div>
                  </>
                )}

              </div>
            )}

          </div>

        </div>

        {/* Sticky Footer: HIDDEN ENTIRELY WHEN COMPARING VERSIONS */}
        {isAiGenerated && !isComparing && (
          <div style={{
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button onClick={onClose} className="btn btn-secondary" style={{ height: '40px', padding: '0 18px' }}>
              Cancel
            </button>

            {initialData && (
              <button
                onClick={() => setIsIssueStatus(!isIssueStatus)}
                style={{
                  height: '40px',
                  padding: '0 18px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  color: isIssueStatus ? '#047857' : '#D8001D',
                  backgroundColor: isIssueStatus ? '#ECFDF5' : '#FFF0F2',
                  border: isIssueStatus ? '1px solid #A7F3D0' : '1px solid #FCA5A5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertOctagon style={{ width: '15px', height: '15px' }} />
                <span>{isIssueStatus ? "Not an issue" : "Mark as Issue"}</span>
              </button>
            )}
            
            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{ height: '40px', padding: '0 24px', fontSize: '13px', fontWeight: '800' }}
            >
              <span>{initialData ? "Update Observation" : "Add Observation"}</span>
            </button>
          </div>
        )}

      </aside>

    </div>
  );
}
