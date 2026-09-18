import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Minus, Download, Save, Send, GitBranch, History, 
  Sparkles, MoreVertical, Check, Layout, Columns, PanelLeft, Layers, X,
  Printer, FileText, ChevronRight, Eye, ZoomIn, ZoomOut
} from 'lucide-react';
import { mockExecutiveSummaryData } from '../data/execReportData';

export default function ExecutiveReportView({ job, onClose, onSwitchToAuditReport }) {
  const [execData, setExecData] = useState(mockExecutiveSummaryData);
  
  // Accordion Expand States: 'scope', 'insights', 'criticalMajor'
  const [expandedSection, setExpandedSection] = useState('scope');
  const [isTrackChangesActive, setIsTrackChangesActive] = useState(false);

  // PDF Preview Display Mode: 'all' | 'page1' | 'page2'
  const [pageViewFilter, setPageViewFilter] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(100);

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

  const handleObjectiveBulletChange = (idx, val) => {
    setExecData(prev => {
      const newBullets = [...prev.scopeSummary.objectiveBullets];
      newBullets[idx] = val;
      return {
        ...prev,
        scopeSummary: {
          ...prev.scopeSummary,
          objectiveBullets: newBullets
        }
      };
    });
  };

  const handleAddObjectiveBullet = () => {
    setExecData(prev => ({
      ...prev,
      scopeSummary: {
        ...prev.scopeSummary,
        objectiveBullets: [...prev.scopeSummary.objectiveBullets, ""]
      }
    }));
  };

  const handleRemoveObjectiveBullet = (idx) => {
    setExecData(prev => ({
      ...prev,
      scopeSummary: {
        ...prev.scopeSummary,
        objectiveBullets: prev.scopeSummary.objectiveBullets.filter((_, i) => i !== idx)
      }
    }));
  };

  // Process Matrix Row Update (with auto total & grand total recalculation)
  const handleProcessMatrixChange = (index, field, val) => {
    setExecData(prev => {
      const newMatrix = [...prev.scopeSummary.processMatrix];
      const targetRow = { ...newMatrix[index] };

      if (['critical', 'major', 'minor'].includes(field)) {
        const numVal = Math.max(0, parseInt(val, 10) || 0);
        targetRow[field] = numVal;
        targetRow.total = (targetRow.critical || 0) + (targetRow.major || 0) + (targetRow.minor || 0);
      } else {
        targetRow[field] = val;
      }
      newMatrix[index] = targetRow;

      // Recalculate Grand Total row (last row) if editing regular rows
      if (index < newMatrix.length - 1) {
        const grandTotalRow = { ...newMatrix[newMatrix.length - 1] };
        let grandCrit = 0, grandMaj = 0, grandMin = 0, grandAll = 0;
        for (let i = 0; i < newMatrix.length - 1; i++) {
          grandCrit += newMatrix[i].critical || 0;
          grandMaj += newMatrix[i].major || 0;
          grandMin += newMatrix[i].minor || 0;
          grandAll += newMatrix[i].total || 0;
        }
        grandTotalRow.critical = grandCrit;
        grandTotalRow.major = grandMaj;
        grandTotalRow.minor = grandMin;
        grandTotalRow.total = grandAll;
        newMatrix[newMatrix.length - 1] = grandTotalRow;
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

  const handleAddProcessRow = () => {
    setExecData(prev => {
      const newMatrix = [...prev.scopeSummary.processMatrix];
      const grandTotalRow = newMatrix.pop(); // Remove grand total temporarily
      newMatrix.push({
        processTitle: "New Process",
        critical: 0,
        major: 0,
        minor: 0,
        total: 0
      });
      newMatrix.push(grandTotalRow); // Put grand total back at end
      return {
        ...prev,
        scopeSummary: {
          ...prev.scopeSummary,
          processMatrix: newMatrix
        }
      };
    });
  };

  const handleRemoveProcessRow = (idx) => {
    setExecData(prev => {
      if (prev.scopeSummary.processMatrix.length <= 2) return prev; // Keep at least 1 process + grand total
      const newMatrix = prev.scopeSummary.processMatrix.filter((_, i) => i !== idx);
      
      // Recalculate Grand Total
      const grandTotalRow = { ...newMatrix[newMatrix.length - 1] };
      let grandCrit = 0, grandMaj = 0, grandMin = 0, grandAll = 0;
      for (let i = 0; i < newMatrix.length - 1; i++) {
        grandCrit += newMatrix[i].critical || 0;
        grandMaj += newMatrix[i].major || 0;
        grandMin += newMatrix[i].minor || 0;
        grandAll += newMatrix[i].total || 0;
      }
      grandTotalRow.critical = grandCrit;
      grandTotalRow.major = grandMaj;
      grandTotalRow.minor = grandMin;
      grandTotalRow.total = grandAll;
      newMatrix[newMatrix.length - 1] = grandTotalRow;

      return {
        ...prev,
        scopeSummary: {
          ...prev.scopeSummary,
          processMatrix: newMatrix
        }
      };
    });
  };

  // Audit Insights Handlers
  const handleInsightsOverallChange = (val) => {
    setExecData(prev => ({
      ...prev,
      auditInsights: {
        ...prev.auditInsights,
        overallText: val
      }
    }));
  };

  const handleInsightsParagraphChange = (idx, val) => {
    setExecData(prev => {
      const newParas = [...prev.auditInsights.paragraphs];
      newParas[idx] = val;
      return {
        ...prev,
        auditInsights: {
          ...prev.auditInsights,
          paragraphs: newParas
        }
      };
    });
  };

  // Critical & Major Issues Handlers
  const handleIssueChange = (issueType, field, val) => {
    setExecData(prev => ({
      ...prev,
      criticalMajorSection: {
        ...prev.criticalMajorSection,
        [issueType]: {
          ...prev.criticalMajorSection[issueType],
          [field]: val
        }
      }
    }));
  };

  // Action Handlers
  const handleGenerateExecSummary = () => {
    alert("AI Re-generating Executive Summary scope analysis & critical issue synthesis from audit issues...");
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

  const handlePrint = () => {
    window.print();
  };

  // Helper for matrix cell display: "-" when 0, or number when > 0
  const formatMatrixVal = (val) => {
    if (val === 0 || val === "0" || val === null || val === undefined || val === "") {
      return "-";
    }
    return val;
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
        padding: '10px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #CBD5E1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '17px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                Executive Summary — {job?.fileName || execData.fileName}
              </h1>
              <span style={{ 
                fontSize: '10.5px', 
                fontWeight: '800', 
                color: '#1E40AF', 
                backgroundColor: '#EFF6FF', 
                border: '1px solid #BFDBFE',
                padding: '1px 8px', 
                borderRadius: '4px' 
              }}>
                PDF Format 2-Page Standard
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
              {execData.auditableEntity} • Live Synchronized PDF Preview
            </div>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {onSwitchToAuditReport && (
            <button
              onClick={onSwitchToAuditReport}
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#475569',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Switch to Detailed Audit Report Studio"
            >
              <FileText style={{ width: '13px', height: '13px', color: '#64748B' }} />
              <span>Detailed Audit Report</span>
            </button>
          )}

          {/* Generate Executive summary */}
          <button
            onClick={handleGenerateExecSummary}
            style={{
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: '800',
              color: '#D8001D',
              backgroundColor: '#FFF1F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Sparkles style={{ width: '14px', height: '14px', color: '#D8001D' }} />
            <span>Generate Executive Summary</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            style={{
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: '800',
              color: '#ffffff',
              backgroundColor: '#D8001D',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Save style={{ width: '13px', height: '13px' }} />
            <span>Save</span>
          </button>

          {/* Track Changes */}
          <button
            onClick={() => setIsTrackChangesActive(!isTrackChangesActive)}
            style={{
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: '700',
              color: isTrackChangesActive ? '#ffffff' : '#475569',
              backgroundColor: isTrackChangesActive ? '#0F172A' : '#ffffff',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <History style={{ width: '13px', height: '13px' }} />
            <span>{isTrackChangesActive ? "Track Changes (On)" : "Track Changes"}</span>
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            style={{
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: '700',
              color: '#475569',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Main Studio Body: Left Form Panel (45%) | Right Live HTML PDF Preview (55%) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: EDITABLE ACCORDION SECTIONS                                   */}
        {/* ========================================================================= */}
        <div style={{
          width: '45%',
          borderRight: '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F8FAFC',
          overflowY: 'auto',
          padding: '20px'
        }}>
          
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Report Studio Editor
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Edits update live PDF preview
            </span>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 1 ACCORDION: Scope Summary & Process Matrix (Page 1)  */}
          {/* ------------------------------------------------------------- */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #E2E8F0', 
            marginBottom: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'scope' ? null : 'scope')}
              style={{
                border: 'none',
                background: expandedSection === 'scope' ? '#FFF5F5' : '#ffffff',
                color: expandedSection === 'scope' ? '#D8001D' : '#1E293B',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                width: '100%',
                textAlign: 'left',
                borderBottom: expandedSection === 'scope' ? '1px solid #FCA5A5' : 'none',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '4px', 
                  backgroundColor: '#8F8F8F', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '10px',
                  fontWeight: '900' 
                }}>1</span>
                <span>Page 1: Scope Summary &amp; Process Matrix</span>
              </div>
              {expandedSection === 'scope' ? <Minus style={{ width: '16px', height: '16px' }} /> : <Plus style={{ width: '16px', height: '16px' }} />}
            </button>

            {expandedSection === 'scope' && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff' }}>
                
                {/* a. Assessment Period */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                    Assessment Period:
                  </label>
                  <input
                    type="text"
                    value={execData.scopeSummary.assessmentPeriod}
                    onChange={(e) => handleScopeChange('assessmentPeriod', e.target.value)}
                    placeholder="e.g. Q1 2026 – Q2 2026 (Jan 1, 2026 – Jun 30, 2026)"
                    style={{ width: '100%', height: '32px', padding: '0 10px', fontSize: '12px', borderRadius: '5px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>

                {/* b. Entity Sector & c. Entity Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                      Entity Sector:
                    </label>
                    <input
                      type="text"
                      value={execData.scopeSummary.entitySector}
                      onChange={(e) => handleScopeChange('entitySector', e.target.value)}
                      placeholder="e.g. MedTech / Supply Chain & Operations"
                      style={{ width: '100%', height: '32px', padding: '0 10px', fontSize: '12px', borderRadius: '5px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                      Entity Location:
                    </label>
                    <input
                      type="text"
                      value={execData.scopeSummary.entityLocation}
                      onChange={(e) => handleScopeChange('entityLocation', e.target.value)}
                      placeholder="e.g. Suzhou Plant & Regional Operations Hub"
                      style={{ width: '100%', height: '32px', padding: '0 10px', fontSize: '12px', borderRadius: '5px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* d. Metric */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                    Metric:
                  </label>
                  <input
                    type="text"
                    value={execData.scopeSummary.metric}
                    onChange={(e) => handleScopeChange('metric', e.target.value)}
                    placeholder="e.g. GxP Compliance, SOX 404 Controls & IT Access Security"
                    style={{ width: '100%', height: '32px', padding: '0 10px', fontSize: '12px', borderRadius: '5px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                  />
                </div>

                {/* e. Objective Bullets */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                      Objective (with Examples Bullets):
                    </label>
                    <button
                      type="button"
                      onClick={handleAddObjectiveBullet}
                      style={{
                        padding: '2px 8px',
                        fontSize: '10.5px',
                        fontWeight: '700',
                        color: '#D8001D',
                        backgroundColor: '#FFF1F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Plus style={{ width: '11px', height: '11px' }} />
                      <span>Add Bullet</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {execData.scopeSummary.objectiveBullets.map((bullet, bIdx) => (
                      <div key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>•</span>
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => handleObjectiveBulletChange(bIdx, e.target.value)}
                          placeholder={`Objective bullet ${bIdx + 1}...`}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            fontSize: '11.5px',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                        {execData.scopeSummary.objectiveBullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveObjectiveBullet(bIdx)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '4px',
                              marginTop: '2px'
                            }}
                            title="Remove bullet"
                          >
                            <X style={{ width: '13px', height: '13px' }} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* f. Process Breakdown Matrix Table Editor */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>
                      Process Title Breakdown Matrix:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddProcessRow}
                      style={{
                        padding: '2px 8px',
                        fontSize: '10.5px',
                        fontWeight: '700',
                        color: '#D8001D',
                        backgroundColor: '#FFF1F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Plus style={{ width: '11px', height: '11px' }} />
                      <span>Add Row</span>
                    </button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #CBD5E1' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9', color: '#334155' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '800' }}>Process Title</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: '800', width: '48px', color: '#184A6E' }}>Crit</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: '800', width: '48px', color: '#D97706' }}>Maj</th>
                        <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: '800', width: '48px', color: '#047857' }}>Min</th>
                        <th style={{ padding: '6px 6px', textAlign: 'center', fontWeight: '800', width: '42px' }}>ALL</th>
                        <th style={{ width: '24px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {execData.scopeSummary.processMatrix.map((row, idx) => {
                        const isGrandTotal = idx === execData.scopeSummary.processMatrix.length - 1;
                        return (
                          <tr 
                            key={idx} 
                            style={{ 
                              borderBottom: '1px solid #E2E8F0', 
                              backgroundColor: isGrandTotal ? '#F8FAFC' : '#ffffff',
                              fontWeight: isGrandTotal ? '800' : 'normal'
                            }}
                          >
                            <td style={{ padding: '4px 8px' }}>
                              {isGrandTotal ? (
                                <span style={{ fontWeight: '800', color: '#0F172A' }}>{row.processTitle}</span>
                              ) : (
                                <input
                                  type="text"
                                  value={row.processTitle}
                                  onChange={(e) => handleProcessMatrixChange(idx, 'processTitle', e.target.value)}
                                  style={{ width: '100%', padding: '3px 4px', fontSize: '11px', border: '1px solid #E2E8F0', borderRadius: '3px' }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              {isGrandTotal ? (
                                <span style={{ fontWeight: '800' }}>{row.critical}</span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  value={row.critical}
                                  onChange={(e) => handleProcessMatrixChange(idx, 'critical', e.target.value)}
                                  style={{ width: '38px', padding: '2px', fontSize: '11px', textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '3px' }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              {isGrandTotal ? (
                                <span style={{ fontWeight: '800' }}>{row.major}</span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  value={row.major}
                                  onChange={(e) => handleProcessMatrixChange(idx, 'major', e.target.value)}
                                  style={{ width: '38px', padding: '2px', fontSize: '11px', textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '3px' }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '4px', textAlign: 'center' }}>
                              {isGrandTotal ? (
                                <span style={{ fontWeight: '800' }}>{row.minor}</span>
                              ) : (
                                <input
                                  type="number"
                                  min={0}
                                  value={row.minor}
                                  onChange={(e) => handleProcessMatrixChange(idx, 'minor', e.target.value)}
                                  style={{ width: '38px', padding: '2px', fontSize: '11px', textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '3px' }}
                                />
                              )}
                            </td>
                            <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: '800', color: isGrandTotal ? '#0F172A' : '#475569' }}>
                              {row.total}
                            </td>
                            <td style={{ padding: '2px', textAlign: 'center' }}>
                              {!isGrandTotal && execData.scopeSummary.processMatrix.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProcessRow(idx)}
                                  style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                                  title="Delete process row"
                                >
                                  <X style={{ width: '12px', height: '12px' }} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '4px' }}>
                    * Counts of 0 automatically render as "-" in the PDF preview table.
                  </div>
                </div>

                {/* g. Background Narrative */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                    Background Narrative:
                  </label>
                  <textarea
                    rows={4}
                    value={execData.scopeSummary.background}
                    onChange={(e) => handleScopeChange('background', e.target.value)}
                    placeholder="Enter background section narrative..."
                    style={{ width: '100%', padding: '8px', fontSize: '11.5px', borderRadius: '5px', border: '1px solid #CBD5E1', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 2 ACCORDION: Audit Insights (Page 2)                 */}
          {/* ------------------------------------------------------------- */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #E2E8F0', 
            marginBottom: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'insights' ? null : 'insights')}
              style={{
                border: 'none',
                background: expandedSection === 'insights' ? '#FFF5F5' : '#ffffff',
                color: expandedSection === 'insights' ? '#D8001D' : '#1E293B',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                width: '100%',
                textAlign: 'left',
                borderBottom: expandedSection === 'insights' ? '1px solid #FCA5A5' : 'none',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '4px', 
                  backgroundColor: '#8F8F8F', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '10px',
                  fontWeight: '900' 
                }}>2</span>
                <span>Page 2: Audit Insights</span>
              </div>
              {expandedSection === 'insights' ? <Minus style={{ width: '16px', height: '16px' }} /> : <Plus style={{ width: '16px', height: '16px' }} />}
            </button>

            {expandedSection === 'insights' && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff' }}>
                
                {/* Overall summary line */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                    Overall Summary Line (Starts with underlined "Overall"):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', textDecoration: 'underline', color: '#0F172A' }}>Overall</span>
                    <input
                      type="text"
                      value={execData.auditInsights.overallText}
                      onChange={(e) => handleInsightsOverallChange(e.target.value)}
                      placeholder="for the processes reviewed, 1 critical, 1 major and 6 minor findings were identified..."
                      style={{ flex: 1, height: '32px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                {/* Paragraphs */}
                {execData.auditInsights.paragraphs.map((para, pIdx) => (
                  <div key={pIdx}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '3px' }}>
                      Insights Narrative Paragraph {pIdx + 1}:
                    </label>
                    <textarea
                      rows={3}
                      value={para}
                      onChange={(e) => handleInsightsParagraphChange(pIdx, e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #CBD5E1', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}

              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 3 ACCORDION: Critical Issues / Major Issues (Page 2)  */}
          {/* ------------------------------------------------------------- */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #E2E8F0', 
            marginBottom: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <button
              onClick={() => setExpandedSection(expandedSection === 'criticalMajor' ? null : 'criticalMajor')}
              style={{
                border: 'none',
                background: expandedSection === 'criticalMajor' ? '#FFF5F5' : '#ffffff',
                color: expandedSection === 'criticalMajor' ? '#D8001D' : '#1E293B',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                width: '100%',
                textAlign: 'left',
                borderBottom: expandedSection === 'criticalMajor' ? '1px solid #FCA5A5' : 'none',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '4px', 
                  backgroundColor: '#8F8F8F', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '10px',
                  fontWeight: '900' 
                }}>3</span>
                <span>Page 2: Critical Issues / Major Issues</span>
              </div>
              {expandedSection === 'criticalMajor' ? <Minus style={{ width: '16px', height: '16px' }} /> : <Plus style={{ width: '16px', height: '16px' }} />}
            </button>

            {expandedSection === 'criticalMajor' && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff' }}>
                
                {/* Critical Issue */}
                <div style={{ backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#991B1B', marginBottom: '8px' }}>
                    Critical Issue:
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '10.5px', fontWeight: '700', color: '#7F1D1D', display: 'block', marginBottom: '3px' }}>
                      Title:
                    </label>
                    <input
                      type="text"
                      value={execData.criticalMajorSection.criticalIssue.title}
                      onChange={(e) => handleIssueChange('criticalIssue', 'title', e.target.value)}
                      style={{ width: '100%', height: '30px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #FCA5A5', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10.5px', fontWeight: '700', color: '#7F1D1D', display: 'block', marginBottom: '3px' }}>
                      Description:
                    </label>
                    <textarea
                      rows={3}
                      value={execData.criticalMajorSection.criticalIssue.description}
                      onChange={(e) => handleIssueChange('criticalIssue', 'description', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #FCA5A5', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Major Issue */}
                <div style={{ backgroundColor: '#FFFBEB', padding: '12px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#92400E', marginBottom: '8px' }}>
                    Major Issue:
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '10.5px', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '3px' }}>
                      Title:
                    </label>
                    <input
                      type="text"
                      value={execData.criticalMajorSection.majorIssue.title}
                      onChange={(e) => handleIssueChange('majorIssue', 'title', e.target.value)}
                      style={{ width: '100%', height: '30px', padding: '0 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #FDE68A', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10.5px', fontWeight: '700', color: '#78350F', display: 'block', marginBottom: '3px' }}>
                      Description:
                    </label>
                    <textarea
                      rows={3}
                      value={execData.criticalMajorSection.majorIssue.description}
                      onChange={(e) => handleIssueChange('majorIssue', 'description', e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #FDE68A', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE HTML PDF PREVIEW (MATCHING IMAGE 1 & IMAGE 2 VERBATIM) */}
        {/* ========================================================================= */}
        <div style={{
          width: '55%',
          backgroundColor: '#52525B', // Professional dark grey PDF viewer backdrop
          padding: '24px 20px',
          overflowY: 'auto',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          
          {/* PDF Viewer Top Floating Control Bar */}
          <div style={{
            width: '100%',
            maxWidth: '794px',
            backgroundColor: '#1E293B',
            color: '#ffffff',
            borderRadius: '6px',
            padding: '8px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            flexShrink: 0
          }}>
            {/* Page View Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', color: '#94A3B8', marginRight: '4px' }}>View:</span>
              <button
                onClick={() => setPageViewFilter('all')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: pageViewFilter === 'all' ? '#D8001D' : '#334155',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                All Pages (1 &amp; 2)
              </button>
              <button
                onClick={() => setPageViewFilter('page1')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: pageViewFilter === 'page1' ? '#D8001D' : '#334155',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Page 1 (Scope &amp; Background)
              </button>
              <button
                onClick={() => setPageViewFilter('page2')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: pageViewFilter === 'page2' ? '#D8001D' : '#334155',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Page 2 (Audit Insights &amp; Issues)
              </button>
            </div>

            {/* Print & Download Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handlePrint}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
                title="Print Executive Summary"
              >
                <Printer style={{ width: '14px', height: '14px' }} />
                <span>Print</span>
              </button>

              <button
                onClick={() => alert(`Downloading PDF: ${execData.fileName}.pdf`)}
                style={{
                  padding: '5px 12px',
                  backgroundColor: '#D8001D',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}
                title="Download PDF"
              >
                <Download style={{ width: '13px', height: '13px' }} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Wrapper for PDF Pages with optional scale */}
          <div style={{
            width: '100%',
            maxWidth: '794px', // Standard A4 width at 96 DPI
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>

            {/* ################################################################# */}
            {/* PAGE 1: EXACT MATCH TO FIRST IMAGE (Scope Summary, Matrix, Bg)    */}
            {/* ################################################################# */}
            {(pageViewFilter === 'all' || pageViewFilter === 'page1') && (
              <div style={{
                width: '100%',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                padding: '36px 36px 28px 36px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#000000',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '1000px',
                position: 'relative'
              }}>
                
                {/* Document Title (as requested: "it will have title under that as like first image...") */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '800', 
                    color: '#000000',
                    textAlign: 'left',
                    lineHeight: '1.2',
                    letterSpacing: '-0.2px'
                  }}>
                    {execData.fileName}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 1. SCOPE SUMMARY BOX                                          */}
                {/* ------------------------------------------------------------- */}
                <div style={{ marginBottom: '16px' }}>
                  {/* Scope Summary Banner Header (#8F8F8F / #969696) */}
                  <div style={{
                    backgroundColor: '#8F8F8F',
                    border: '1px solid #000000',
                    borderBottom: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '5px 10px',
                    letterSpacing: '0.2px'
                  }}>
                    Scope Summary
                  </div>

                  {/* Scope Summary Table (1px solid #000000 borders) */}
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11px',
                    border: '1px solid #000000',
                    tableLayout: 'fixed'
                  }}>
                    <tbody>
                      {/* Row 1: Assessment Period */}
                      <tr>
                        <td style={{
                          width: '160px',
                          padding: '5px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Assessment Period:
                        </td>
                        <td style={{
                          padding: '5px 8px',
                          color: '#000000',
                          border: '1px solid #000000'
                        }}>
                          {execData.scopeSummary.assessmentPeriod}
                        </td>
                      </tr>

                      {/* Row 2: Entity Sector */}
                      <tr>
                        <td style={{
                          padding: '5px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Entity Sector:
                        </td>
                        <td style={{
                          padding: '5px 8px',
                          color: '#000000',
                          border: '1px solid #000000'
                        }}>
                          {execData.scopeSummary.entitySector}
                        </td>
                      </tr>

                      {/* Row 3: Entity Location */}
                      <tr>
                        <td style={{
                          padding: '5px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Entity Location:
                        </td>
                        <td style={{
                          padding: '5px 8px',
                          color: '#000000',
                          border: '1px solid #000000'
                        }}>
                          {execData.scopeSummary.entityLocation}
                        </td>
                      </tr>

                      {/* Row 4: Metric */}
                      <tr>
                        <td style={{
                          padding: '5px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Metric:
                        </td>
                        <td style={{
                          padding: '5px 8px',
                          color: '#000000',
                          border: '1px solid #000000'
                        }}>
                          {execData.scopeSummary.metric}
                        </td>
                      </tr>

                      {/* Row 5: Objective */}
                      <tr>
                        <td style={{
                          padding: '6px 8px',
                          fontWeight: '700',
                          color: '#000000',
                          border: '1px solid #000000',
                          verticalAlign: 'top'
                        }}>
                          Objective:
                        </td>
                        <td style={{
                          padding: '6px 8px',
                          color: '#000000',
                          border: '1px solid #000000',
                          lineHeight: '1.4'
                        }}>
                          <div style={{ marginBottom: '3px' }}>Examples:</div>
                          <ul style={{ margin: 0, paddingLeft: '18px' }}>
                            {execData.scopeSummary.objectiveBullets.map((bullet, bIdx) => (
                              <li key={bIdx} style={{ marginBottom: bIdx === execData.scopeSummary.objectiveBullets.length - 1 ? 0 : '4px' }}>
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. PROCESS TITLE BREAKDOWN MATRIX (COLOR CODED HEADERS)       */}
                {/* ------------------------------------------------------------- */}
                <div style={{ marginBottom: '16px' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11.5px',
                    border: '1px solid #000000'
                  }}>
                    <thead>
                      <tr>
                        {/* Process Title: Grey #8F8F8F */}
                        <th style={{
                          backgroundColor: '#8F8F8F',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          fontSize: '12px'
                        }}>
                          Process Title
                        </th>

                        {/* Critical: Dark Blue #184A6E */}
                        <th style={{
                          backgroundColor: '#184A6E',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          width: '110px',
                          fontSize: '12px'
                        }}>
                          Critical
                        </th>

                        {/* Major: Yellow #F1B500 / #FFB900 */}
                        <th style={{
                          backgroundColor: '#F1B500',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          width: '110px',
                          fontSize: '12px'
                        }}>
                          Major
                        </th>

                        {/* Minor: Green #008000 */}
                        <th style={{
                          backgroundColor: '#008000',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          width: '110px',
                          fontSize: '12px'
                        }}>
                          Minor
                        </th>

                        {/* ALL: Grey #8F8F8F */}
                        <th style={{
                          backgroundColor: '#8F8F8F',
                          color: '#ffffff',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '6px 10px',
                          border: '1px solid #000000',
                          width: '110px',
                          fontSize: '12px'
                        }}>
                          ALL
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {execData.scopeSummary.processMatrix.map((row, idx) => {
                        const isGrandTotal = idx === execData.scopeSummary.processMatrix.length - 1;
                        return (
                          <tr key={idx}>
                            {/* Process Title */}
                            <td style={{
                              padding: '6px 10px',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal',
                              wordBreak: 'break-word'
                            }}>
                              {row.processTitle}
                            </td>

                            {/* Critical count */}
                            <td style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal'
                            }}>
                              {formatMatrixVal(row.critical)}
                            </td>

                            {/* Major count */}
                            <td style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal'
                            }}>
                              {formatMatrixVal(row.major)}
                            </td>

                            {/* Minor count */}
                            <td style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal'
                            }}>
                              {formatMatrixVal(row.minor)}
                            </td>

                            {/* ALL total */}
                            <td style={{
                              padding: '6px 10px',
                              textAlign: 'center',
                              color: '#000000',
                              border: '1px solid #000000',
                              fontWeight: isGrandTotal ? '700' : 'normal'
                            }}>
                              {formatMatrixVal(row.total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 3. BACKGROUND BOX                                             */}
                {/* ------------------------------------------------------------- */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                  {/* Background Banner Header (#8F8F8F / #969696) */}
                  <div style={{
                    backgroundColor: '#8F8F8F',
                    border: '1px solid #000000',
                    borderBottom: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '5px 10px',
                    letterSpacing: '0.2px'
                  }}>
                    Background
                  </div>

                  {/* Background Content Box */}
                  <div style={{
                    border: '1px solid #000000',
                    backgroundColor: '#ffffff',
                    padding: '14px',
                    minHeight: '200px',
                    flex: 1,
                    fontSize: '11px',
                    lineHeight: '1.45',
                    color: '#000000',
                    boxSizing: 'border-box'
                  }}>
                    {execData.scopeSummary.background ? (
                      <p style={{ margin: 0 }}>{execData.scopeSummary.background}</p>
                    ) : (
                      <div style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                        (Background notes and operational context)
                      </div>
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PAGE 1 FOOTER: Red Johnson & Johnson script logo              */}
                {/* ------------------------------------------------------------- */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '16px',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  {/* Iconic Red Johnson & Johnson script logo */}
                  <div style={{
                    color: '#D8001D',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    fontSize: '15px',
                    letterSpacing: '-0.2px'
                  }}>
                    Johnson &amp; Johnson
                  </div>

                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    Page 1 of 2
                  </div>
                </div>

              </div>
            )}

            {/* ################################################################# */}
            {/* PAGE 2: EXACT MATCH TO SECOND IMAGE (Audit Insights & Issues)     */}
            {/* ################################################################# */}
            {(pageViewFilter === 'all' || pageViewFilter === 'page2') && (
              <div style={{
                width: '100%',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                padding: '36px 36px 28px 36px',
                boxSizing: 'border-box',
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#000000',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '1000px',
                position: 'relative'
              }}>
                
                {/* Header line on Page 2 */}
                <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
                    {execData.fileName}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                    Section 2: Insights &amp; Findings
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 1. AUDIT INSIGHTS BOX                                         */}
                {/* ------------------------------------------------------------- */}
                <div style={{ marginBottom: '18px' }}>
                  {/* Banner Header: Audit Insights (#8F8F8F) */}
                  <div style={{
                    backgroundColor: '#8F8F8F',
                    border: '1px solid #000000',
                    borderBottom: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '5px 10px',
                    letterSpacing: '0.2px'
                  }}>
                    Audit Insights
                  </div>

                  {/* Audit Insights Content Box */}
                  <div style={{
                    border: '1px solid #000000',
                    backgroundColor: '#ffffff',
                    padding: '12px 14px',
                    fontSize: '11px',
                    lineHeight: '1.45',
                    color: '#000000'
                  }}>
                    {/* First line: Overall underlined */}
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ textDecoration: 'underline', fontWeight: '700' }}>Overall</span>{' '}
                      <span>{execData.auditInsights.overallText}</span>
                    </div>

                    {/* Narrative paragraphs matching Image 2 verbatim */}
                    {execData.auditInsights.paragraphs.map((para, pIdx) => (
                      <p key={pIdx} style={{ margin: '0 0 10px 0', lineHeight: '1.45' }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. CRITICAL ISSUES / MAJOR ISSUES BOX                         */}
                {/* ------------------------------------------------------------- */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                  {/* Banner Header: Critical Issues /Major Issues (#8F8F8F) */}
                  <div style={{
                    backgroundColor: '#8F8F8F',
                    border: '1px solid #000000',
                    borderBottom: 'none',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '13px',
                    textAlign: 'center',
                    padding: '5px 10px',
                    letterSpacing: '0.2px'
                  }}>
                    Critical Issues /Major Issues
                  </div>

                  {/* Content Box */}
                  <div style={{
                    border: '1px solid #000000',
                    backgroundColor: '#ffffff',
                    padding: '12px 14px',
                    fontSize: '11px',
                    lineHeight: '1.45',
                    color: '#000000',
                    flex: 1
                  }}>
                    {/* Critical Issues Subheading & Details */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontWeight: '700', fontSize: '12px', color: '#000000', marginBottom: '4px' }}>
                        Critical Issues
                      </div>
                      <div style={{ fontWeight: '400', color: '#000000', marginBottom: '3px' }}>
                        {execData.criticalMajorSection.criticalIssue.title}
                      </div>
                      <div style={{ color: '#000000', lineHeight: '1.45' }}>
                        {execData.criticalMajorSection.criticalIssue.description}
                      </div>
                    </div>

                    {/* Major Issues Subheading & Details */}
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '12px', color: '#000000', marginBottom: '4px' }}>
                        Major Issues
                      </div>
                      <div style={{ fontWeight: '400', color: '#000000', marginBottom: '3px' }}>
                        {execData.criticalMajorSection.majorIssue.title}
                      </div>
                      <div style={{ color: '#000000', lineHeight: '1.45' }}>
                        {execData.criticalMajorSection.majorIssue.description}
                      </div>
                    </div>

                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* PAGE 2 FOOTER: Red Johnson & Johnson script logo              */}
                {/* ------------------------------------------------------------- */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '16px',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  {/* Iconic Red Johnson & Johnson script logo */}
                  <div style={{
                    color: '#D8001D',
                    fontFamily: 'Georgia, serif',
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    fontSize: '15px',
                    letterSpacing: '-0.2px'
                  }}>
                    Johnson &amp; Johnson
                  </div>

                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                    Page 2 of 2
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
