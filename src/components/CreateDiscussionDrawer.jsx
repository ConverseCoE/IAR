import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, RefreshCw, MessageSquare, AlertCircle, 
  CheckCircle2, Plus, ArrowRight, ShieldCheck, DollarSign, UserPlus, AlertOctagon, GitCompare, Check
} from 'lucide-react';

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

  // Remarks Modal/Input State
  const [remarks, setRemarks] = useState({
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
    // If AI content already exists, snapshot current content as previousAiData before generating new version
    if (isAiGenerated && aiData.rootCause) {
      setPreviousAiData({ ...aiData });
    }

    setIsAiLoading(true);

    setTimeout(() => {
      // Mock Smart AI Population with newly re-synthesized insights
      const newAiVersion = {
        rootCause: `[Re-generated Version] Systemic thermal feedback latency detected in ${formData.processArea}.\n\nOptic sensor array telemetry experienced gain calibration drift exceeding 4.2% tolerance threshold during continuous assembly.`,
        
        updatedIssueHeader: formData.issueHeader 
          ? `[AI Refined v2] ${formData.issueHeader} - GxP Sensor Audit`
          : `Optic Sensor Calibration Integrity Excursion - GxP Part 11 Audit`,
        
        impact: `[Re-generated Version] High financial scrap risk estimated at $145,000 across Line 3.\n\nPotential 48-hour release hold pending GxP electronic batch record verification.`,
        
        description: formData.issue 
          ? `[Re-generated Version] ${formData.issue} (Audited under ${formData.accountableFunction} compliance framework).\n\nDetailed Findings: SHA-256 sensor checksum validation failed on batch run #12.`
          : `Sensor telemetry log integrity checksum failed validation cycle #4 during high-speed electrophysiology catheter assembly.`,
        
        recommendation: `1. Re-calibrate optic sensor gain algorithms using FDA v4.2 standards.\n2. Enforce real-time telemetry threshold alerts on IT Monitoring Console.\n3. Implement mandatory dual MFA approval for sensor offset overrides.`
      };

      setAiData(newAiVersion);
      setSelectedVersions({
        updatedIssueHeader: 'current',
        rootCause: 'current',
        impact: 'current',
        description: 'current',
        recommendation: 'current'
      });
      setIsAiLoading(false);
      setIsAiGenerated(true);
    }, 1200);
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
        
        {/* Main Dark Drawer Header (HIDDEN IN COMPARISON MODE ALONE) */}
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
              {initialData ? "Edit Discussion Point" : "Add Discussion Point"}
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
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Criticality
                    </label>
                    <select
                      value={formData.criticality}
                      onChange={(e) => handleChange('criticality', e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#ffffff' }}
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                      SOX Reportable <span style={{ color: '#D8001D' }}>*</span>
                    </label>
                    <select
                      value={formData.soxReportable}
                      onChange={(e) => handleChange('soxReportable', e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#ffffff' }}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
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

                    <select
                      value={formData.primaryContact}
                      onChange={(e) => handleChange('primaryContact', e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#ffffff' }}
                    >
                      <option value="Kevin Zhang (IT Lead)">Kevin Zhang (IT Lead)</option>
                      <option value="Rachel Green (FinOps Lead)">Rachel Green (FinOps Lead)</option>
                      <option value="Marcus Vance (Quality Audit)">Marcus Vance (Quality Audit)</option>
                      <option value="Sarah Jenkins (Compliance)">Sarah Jenkins (Compliance)</option>
                    </select>

                    {isDelegating && (
                      <div style={{ marginTop: '8px', padding: '8px 10px', backgroundColor: '#EFF6FF', border: '1px dashed #60A5FA', borderRadius: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#1E40AF', display: 'block', marginBottom: '4px' }}>
                          Delegate To (User Name / Email):
                        </label>
                        <select
                          value={delegatedTo}
                          onChange={(e) => setDelegatedTo(e.target.value)}
                          style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #93C5FD', outline: 'none', backgroundColor: '#ffffff' }}
                        >
                          <option value="">Select Delegation Target...</option>
                          <option value="Dr. Alexander Wright (Compliance Director)">Dr. Alexander Wright (Compliance Director)</option>
                          <option value="Elena Rostova (Lead Quality Auditor)">Elena Rostova (Lead Quality Auditor)</option>
                          <option value="Michael Chang (VP FinOps)">Michael Chang (VP FinOps)</option>
                        </select>
                      </div>
                    )}

                    {delegatedTo && !isDelegating && (
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', display: 'block', marginTop: '4px' }}>
                        ✓ Delegated to: {delegatedTo}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Secondary Business Contact
                    </label>
                    <select
                      value={formData.secondaryContact}
                      onChange={(e) => handleChange('secondaryContact', e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#ffffff' }}
                    >
                      <option value="David Miller (IT Audit)">David Miller (IT Audit)</option>
                      <option value="Amanda Palmer (FinOps Lead)">Amanda Palmer (FinOps Lead)</option>
                      <option value="Brian Cox (Executive VP)">Brian Cox (Executive VP)</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Accountable Function & Repeat Finding */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Accountable Function
                    </label>
                    <select
                      value={formData.accountableFunction}
                      onChange={(e) => handleChange('accountableFunction', e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#ffffff' }}
                    >
                      <option value="IT">IT</option>
                      <option value="FinOps">FinOps</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Repeat Finding
                    </label>
                    <select
                      value={formData.repeatFinding}
                      onChange={(e) => handleChange('repeatFinding', e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#ffffff' }}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                {/* Row 6: Issue Cause Type & Process Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Issue Cause Type
                    </label>
                    <select
                      value={formData.issueCauseType}
                      onChange={(e) => handleChange('issueCauseType', e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#ffffff' }}
                    >
                      <option value="Automated Sensor Calibration Drift">Automated Sensor Calibration Drift</option>
                      <option value="Manual Data Entry Excursion">Manual Data Entry Excursion</option>
                      <option value="Firmware Integrity Checksum Error">Firmware Integrity Checksum Error</option>
                      <option value="Cleanroom HVAC Environmental Excursion">Cleanroom HVAC Environmental Excursion</option>
                      <option value="System Access Control Failure">System Access Control Failure</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                      Process Area
                    </label>
                    <select
                      value={formData.processArea}
                      onChange={(e) => handleChange('processArea', e.target.value)}
                      style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#ffffff' }}
                    >
                      <option value="Catheter Line 3 Electrophysiology">Catheter Line 3 Electrophysiology</option>
                      <option value="Cleanroom HVAC Unit 4">Cleanroom HVAC Unit 4</option>
                      <option value="Packaging & Sterilization Unit">Packaging & Sterilization Unit</option>
                      <option value="Optic Sensor Calibration">Optic Sensor Calibration</option>
                      <option value="GxP Software Access Control">GxP Software Access Control</option>
                    </select>
                  </div>
                </div>

                {/* Row 7: Risk Rating */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '5px' }}>
                    Risk Rating
                  </label>
                  <select
                    value={formData.riskRating}
                    onChange={(e) => handleChange('riskRating', e.target.value)}
                    style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none', backgroundColor: '#ffffff' }}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
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
              <span>{initialData ? "Update Discussion" : "Add Discussion"}</span>
            </button>
          </div>
        )}

      </aside>

    </div>
  );
}
