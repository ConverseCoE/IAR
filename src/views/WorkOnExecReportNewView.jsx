import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Minus, Download, Save, Send, GitBranch, History, 
  Sparkles, MoreVertical, Check, Layout, Columns, PanelLeft, Layers, X
} from 'lucide-react';
import { mockExecutiveSummaryData } from '../data/execReportData';

export default function WorkOnExecReportNewView({ job, onClose }) {
  const [execData, setExecData] = useState(mockExecutiveSummaryData);
  
  // Accordion Expand States: 'scope', 'criticalMajor', or null
  const [expandedSection, setExpandedSection] = useState(null);
  const [isTrackChangesActive, setIsTrackChangesActive] = useState(false);

  // Multi-Design Mode State ('default', '3pane', 'slideover', 'tabbed')
  const [designMode, setDesignMode] = useState('default');
  const [isDesignMenuOpen, setIsDesignMenuOpen] = useState(false);

  // Field change handlers (Instant real-time update to live HTML PDF preview)
  const handleScopeChange = (field, val) => {
    setExecData(prev => ({
      ...prev,
      scopeSummary: {
        ...prev.scopeSummary,
        [field]: val
      }
    }));
  };

  const handleProcessMatrixChange = (index, field, val) => {
    setExecData(prev => {
      const newMatrix = [...prev.scopeSummary.processMatrix];
      newMatrix[index] = { ...newMatrix[index], [field]: val };
      
      // Auto recalculate total if numbers change
      if (['critical', 'major', 'minor'].includes(field)) {
        const numVal = parseInt(val) || 0;
        newMatrix[index][field] = numVal;
        newMatrix[index].total = (newMatrix[index].critical || 0) + (newMatrix[index].major || 0) + (newMatrix[index].minor || 0);
      } else {
        newMatrix[index][field] = val;
      }

      return {
        ...prev,
        scopeSummary: {
          ...prev.scopeSummary,
          processMatrix: newMatrix
        }
      };
    });
  };

  const handleCriticalMajorChange = (field, val) => {
    setExecData(prev => ({
      ...prev,
      criticalMajorSection: {
        ...prev.criticalMajorSection,
        [field]: val
      }
    }));
  };

  // Action Handlers
  const handleGenerateExecSummary = () => {
    alert("AI Re-generating Executive Summary scope analysis & critical issue synthesis...");
  };

  const handleSave = () => {
    alert("Executive Summary changes saved successfully!");
  };

  const handleSubmit = () => {
    alert("Executive Summary submitted for executive leadership approval.");
  };

  const handleReroute = () => {
    alert("Executive Summary rerouted to Senior Audit Director.");
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      
      {/* Studio Header Toolbar */}
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        {/* Left Side: Back Arrow Button + Title: Executive Summary — [Job Name] */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}
            title="Back to Reporting Queue"
          >
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#D8001D' }} />
            <span>Back</span>
          </button>

          <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Executive Summary — {job?.fileName || job?.id || 'MedTech Suzhou - Orthopedics Plant'}
          </h1>

          {expandedSection && (
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#D8001D', backgroundColor: '#FFF0F2', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #FCA5A5' }}>
              Editing: {expandedSection === 'scope' ? 'Scope Summary' : 'Critical/Major Issues'}
            </span>
          )}
        </div>

        {/* Top Right Action Buttons (Matching Screenshot 1: Generate Executive summary, Save, Reroute, Submit, Track Changes) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          
          {/* Generate Executive summary */}
          <button
            onClick={handleGenerateExecSummary}
            style={{
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: '800',
              color: '#D8001D',
              backgroundColor: '#ffffff',
              border: '1.5px solid #D8001D',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles style={{ width: '14px', height: '14px', color: '#D8001D' }} />
            <span>Generate Executive summary</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            style={{
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: '800',
              color: '#D8001D',
              backgroundColor: '#ffffff',
              border: '1.5px solid #D8001D',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>

          {/* Reroute */}
          <button
            onClick={handleReroute}
            style={{
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#94A3B8',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reroute
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            style={{
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#94A3B8',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>

          {/* Track Changes */}
          <button
            onClick={() => setIsTrackChangesActive(!isTrackChangesActive)}
            style={{
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: '800',
              color: isTrackChangesActive ? '#ffffff' : '#D8001D',
              backgroundColor: isTrackChangesActive ? '#D8001D' : '#ffffff',
              border: '1.5px solid #D8001D',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History style={{ width: '14px', height: '14px' }} />
            <span>{isTrackChangesActive ? "Track Changes (Active)" : "Track Changes"}</span>
          </button>

          {/* Three-Dots Menu Button for Design Layout Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDesignMenuOpen(!isDesignMenuOpen)}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: isDesignMenuOpen ? '#F1F5F9' : '#ffffff',
                color: '#0F172A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Switch Design Layout for Presentation"
            >
              <MoreVertical style={{ width: '18px', height: '18px', color: '#0F172A' }} />
            </button>

            {isDesignMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '240px',
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 1100,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '800', color: '#64748B', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase' }}>
                  Select UX Design Layout
                </div>

                <button
                  onClick={() => { setDesignMode('default'); setIsDesignMenuOpen(false); }}
                  style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '700', borderRadius: '6px', border: 'none', backgroundColor: designMode === 'default' ? '#FFF0F2' : 'transparent', color: designMode === 'default' ? '#D8001D' : '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>Default Accordions</span>
                  {designMode === 'default' && <Check style={{ width: '14px', height: '14px', color: '#D8001D' }} />}
                </button>

                <button
                  onClick={() => { setDesignMode('3pane'); setIsDesignMenuOpen(false); }}
                  style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '700', borderRadius: '6px', border: 'none', backgroundColor: designMode === '3pane' ? '#EFF6FF' : 'transparent', color: designMode === '3pane' ? '#2563EB' : '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>3-Pane Split View</span>
                  {designMode === '3pane' && <Check style={{ width: '14px', height: '14px', color: '#2563EB' }} />}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Studio Body: Left Form Panel | Right Live HTML PDF Preview */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: EXPANDABLE ACCORDIONS (Scope Summary & Critical/Major Issues) */}
        <div style={{
          width: '50%',
          borderRight: '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          overflowY: 'auto',
          padding: '24px'
        }}>
          
          {/* SECTION 1: Scope summary */}
          <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '16px' }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'scope' ? null : 'scope')}
              style={{
                border: 'none',
                background: 'none',
                color: '#D8001D',
                cursor: 'pointer',
                fontWeight: '900',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0',
                width: '100%',
                textAlign: 'left'
              }}
            >
              {expandedSection === 'scope' ? <Minus style={{ width: '16px', height: '16px' }} /> : <Plus style={{ width: '16px', height: '16px' }} />}
              <span style={{ fontSize: '15px', fontWeight: '800' }}>Scope summary</span>
            </button>

            {/* Scope Summary Form Fields */}
            {expandedSection === 'scope' && (
              <div style={{ marginTop: '14px', backgroundColor: '#FAFAFA', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* a. Assessment Period */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>a. Assessment Period</label>
                  <input
                    type="text"
                    value={execData.scopeSummary.assessmentPeriod}
                    onChange={(e) => handleScopeChange('assessmentPeriod', e.target.value)}
                    style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                {/* b. Entity Sector & c. Entity Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>b. Entity Sector</label>
                    <input
                      type="text"
                      value={execData.scopeSummary.entitySector}
                      onChange={(e) => handleScopeChange('entitySector', e.target.value)}
                      style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>c. Entity Location</label>
                    <input
                      type="text"
                      value={execData.scopeSummary.entityLocation}
                      onChange={(e) => handleScopeChange('entityLocation', e.target.value)}
                      style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                {/* d. Metric */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>d. Metric</label>
                  <input
                    type="text"
                    value={execData.scopeSummary.metric}
                    onChange={(e) => handleScopeChange('metric', e.target.value)}
                    style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                {/* e. Objective */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>e. Objective</label>
                  <textarea
                    rows={2}
                    value={execData.scopeSummary.objective}
                    onChange={(e) => handleScopeChange('objective', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }}
                  />
                </div>

                {/* f. Process Matrix Table */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '6px' }}>f. Process Breakdown Matrix</label>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left', border: '1px solid #CBD5E1' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#D8001D', color: '#ffffff' }}>
                        <th style={{ padding: '8px 10px', fontWeight: '800' }}>Process Title</th>
                        <th style={{ padding: '8px 10px', fontWeight: '800', width: '60px', textAlign: 'center' }}>Critical</th>
                        <th style={{ padding: '8px 10px', fontWeight: '800', width: '60px', textAlign: 'center' }}>Major</th>
                        <th style={{ padding: '8px 10px', fontWeight: '800', width: '60px', textAlign: 'center' }}>Minor</th>
                        <th style={{ padding: '8px 10px', fontWeight: '800', width: '60px', textAlign: 'center' }}>All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {execData.scopeSummary.processMatrix.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx === execData.scopeSummary.processMatrix.length - 1 ? '#F8FAFC' : '#ffffff', fontWeight: idx === execData.scopeSummary.processMatrix.length - 1 ? '800' : 'normal' }}>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              value={row.processTitle}
                              onChange={(e) => handleProcessMatrixChange(idx, 'processTitle', e.target.value)}
                              style={{ width: '100%', padding: '4px', fontSize: '11.5px', border: 'none', background: 'transparent', fontWeight: 'inherit' }}
                            />
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            <input
                              type="number"
                              value={row.critical}
                              onChange={(e) => handleProcessMatrixChange(idx, 'critical', e.target.value)}
                              style={{ width: '44px', padding: '3px', fontSize: '11.5px', textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                            />
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            <input
                              type="number"
                              value={row.major}
                              onChange={(e) => handleProcessMatrixChange(idx, 'major', e.target.value)}
                              style={{ width: '44px', padding: '3px', fontSize: '11.5px', textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                            />
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            <input
                              type="number"
                              value={row.minor}
                              onChange={(e) => handleProcessMatrixChange(idx, 'minor', e.target.value)}
                              style={{ width: '44px', padding: '3px', fontSize: '11.5px', textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '4px' }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: '800', color: '#D8001D' }}>
                            {row.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* g. Background */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>g. Background</label>
                  <textarea
                    rows={3}
                    value={execData.scopeSummary.background}
                    onChange={(e) => handleScopeChange('background', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }}
                  />
                </div>

              </div>
            )}
          </div>

          {/* SECTION 2: Critical/Major Issues */}
          <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'criticalMajor' ? null : 'criticalMajor')}
              style={{
                border: 'none',
                background: 'none',
                color: '#D8001D',
                cursor: 'pointer',
                fontWeight: '900',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0',
                width: '100%',
                textAlign: 'left'
              }}
            >
              {expandedSection === 'criticalMajor' ? <Minus style={{ width: '16px', height: '16px' }} /> : <Plus style={{ width: '16px', height: '16px' }} />}
              <span style={{ fontSize: '15px', fontWeight: '800' }}>Critical/Major Issues (AI Generated Content)</span>
            </button>

            {/* Critical/Major Issues Form Fields */}
            {expandedSection === 'criticalMajor' && (
              <div style={{ marginTop: '14px', backgroundColor: '#FAFAFA', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* a. Critical Issues - IT */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#991B1B', display: 'block', marginBottom: '4px' }}>a. Critical Issues - IT</label>
                  <textarea
                    rows={3}
                    value={execData.criticalMajorSection.criticalIssuesIT}
                    onChange={(e) => handleCriticalMajorChange('criticalIssuesIT', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }}
                  />
                </div>

                {/* b. Major Issues - IT */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#B45309', display: 'block', marginBottom: '4px' }}>b. Major Issues - IT</label>
                  <textarea
                    rows={3}
                    value={execData.criticalMajorSection.majorIssuesIT}
                    onChange={(e) => handleCriticalMajorChange('majorIssuesIT', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }}
                  />
                </div>

                {/* c. Critical Issues - FinOps */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#991B1B', display: 'block', marginBottom: '4px' }}>c. Critical Issues - FinOps</label>
                  <textarea
                    rows={3}
                    value={execData.criticalMajorSection.criticalIssuesFinOps}
                    onChange={(e) => handleCriticalMajorChange('criticalIssuesFinOps', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }}
                  />
                </div>

                {/* d. Major Issues - FinOps */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#B45309', display: 'block', marginBottom: '4px' }}>d. Major Issues - FinOps</label>
                  <textarea
                    rows={3}
                    value={execData.criticalMajorSection.majorIssuesFinOps}
                    onChange={(e) => handleCriticalMajorChange('majorIssuesFinOps', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }}
                  />
                </div>

                {/* e. Audit Insights */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#1E40AF', display: 'block', marginBottom: '4px' }}>e. Audit Insights</label>
                  <textarea
                    rows={3}
                    value={execData.criticalMajorSection.auditInsights}
                    onChange={(e) => handleCriticalMajorChange('auditInsights', e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }}
                  />
                </div>

              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE HTML PDF-STYLE EXECUTIVE SUMMARY PREVIEW */}
        <div style={{
          width: '50%',
          backgroundColor: '#52525B',
          padding: '28px 24px',
          overflowY: 'auto',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          
          {/* Outer PDF Paper Container */}
          <div style={{
            width: '100%',
            maxWidth: '840px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            marginBottom: '40px'
          }}>
            
            {/* Dark Red PDF Header Bar (Matching Image 1: MedTech Suzhou - Orthopedics Plant_ExecSummary + Download icon) */}
            <div style={{
              backgroundColor: '#B91C1C',
              color: '#ffffff',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '13.5px', fontWeight: '800', letterSpacing: '0.3px' }}>
                {execData.fileName}
              </span>
              <button
                onClick={() => alert(`Downloading PDF Executive Summary for ${job?.id || 'JOB-2026-881'}`)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                title="Download PDF Executive Summary"
              >
                <Download style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Document Content Canvas */}
            <div style={{ padding: '32px 36px', color: '#0F172A' }}>
              
              {/* Scope Summary Section Header */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Scope Summary
                </h2>
              </div>

              {/* Scope Summary Fields Grid Box */}
              <div style={{
                border: '1.5px solid #000000',
                padding: '20px 24px',
                fontSize: '12.5px',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontWeight: '900', color: '#000000' }}>Assessment Period: </span>
                  <span style={{ color: '#1E293B' }}>{execData.scopeSummary.assessmentPeriod}</span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontWeight: '900', color: '#000000' }}>Entity Sector: </span>
                  <span style={{ color: '#1E293B' }}>{execData.scopeSummary.entitySector}</span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontWeight: '900', color: '#000000' }}>Entity Location: </span>
                  <span style={{ color: '#1E293B' }}>{execData.scopeSummary.entityLocation}</span>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontWeight: '900', color: '#000000' }}>Metric: </span>
                  <span style={{ color: '#1E293B' }}>{execData.scopeSummary.metric}</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontWeight: '900', color: '#000000' }}>Objective: </span>
                  <span style={{ color: '#1E293B' }}>{execData.scopeSummary.objective}</span>
                </div>

                {/* Process Title Matrix Table (Matching Red Header Row in Image 1) */}
                <div style={{ marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', border: '1px solid #000000' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#B91C1C', color: '#ffffff' }}>
                        <th style={{ padding: '8px 12px', fontWeight: '800', textAlign: 'left' }}>Process Title</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '60px', textAlign: 'center' }}>Critical</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '60px', textAlign: 'center' }}>Major</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '60px', textAlign: 'center' }}>Minor</th>
                        <th style={{ padding: '8px 12px', fontWeight: '800', width: '60px', textAlign: 'center' }}>All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {execData.scopeSummary.processMatrix.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #000000', backgroundColor: idx === execData.scopeSummary.processMatrix.length - 1 ? '#F1F5F9' : '#ffffff', fontWeight: idx === execData.scopeSummary.processMatrix.length - 1 ? '800' : 'normal' }}>
                          <td style={{ padding: '7px 12px', color: '#000000' }}>{row.processTitle}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center' }}>{row.critical || ''}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center' }}>{row.major || ''}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center' }}>{row.minor || ''}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center', fontWeight: '800' }}>{row.total || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Background */}
                <div>
                  <span style={{ fontWeight: '900', color: '#000000' }}>Background: </span>
                  <span style={{ color: '#1E293B' }}>{execData.scopeSummary.background}</span>
                </div>

              </div>

              {/* Section 2: Critical / Major Issues & Audit Insights */}
              <div style={{ textAlign: 'center', margin: '28px 0 16px 0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Critical &amp; Major Issues Synthesis (AI Generated)
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px', lineHeight: '1.5' }}>
                <div style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #991B1B', padding: '12px 16px', borderRadius: '4px' }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#991B1B', margin: '0 0 4px 0' }}>
                    Critical Issues — IT
                  </h4>
                  <p style={{ margin: 0, color: '#1E293B' }}>{execData.criticalMajorSection.criticalIssuesIT}</p>
                </div>

                <div style={{ backgroundColor: '#FFFBEB', borderLeft: '4px solid #B45309', padding: '12px 16px', borderRadius: '4px' }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#B45309', margin: '0 0 4px 0' }}>
                    Major Issues — IT
                  </h4>
                  <p style={{ margin: 0, color: '#1E293B' }}>{execData.criticalMajorSection.majorIssuesIT}</p>
                </div>

                <div style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #991B1B', padding: '12px 16px', borderRadius: '4px' }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#991B1B', margin: '0 0 4px 0' }}>
                    Critical Issues — FinOps
                  </h4>
                  <p style={{ margin: 0, color: '#1E293B' }}>{execData.criticalMajorSection.criticalIssuesFinOps}</p>
                </div>

                <div style={{ backgroundColor: '#FFFBEB', borderLeft: '4px solid #B45309', padding: '12px 16px', borderRadius: '4px' }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#B45309', margin: '0 0 4px 0' }}>
                    Major Issues — FinOps
                  </h4>
                  <p style={{ margin: 0, color: '#1E293B' }}>{execData.criticalMajorSection.majorIssuesFinOps}</p>
                </div>

                <div style={{ backgroundColor: '#EFF6FF', borderLeft: '4px solid #1E40AF', padding: '12px 16px', borderRadius: '4px' }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E40AF', margin: '0 0 4px 0' }}>
                    Audit Insights
                  </h4>
                  <p style={{ margin: 0, color: '#1E293B' }}>{execData.criticalMajorSection.auditInsights}</p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
