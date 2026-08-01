import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Minus, Download, Save, Send, GitBranch, History, 
  AlertOctagon, CheckCircle2, RefreshCw, FileText, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';
import { mockAuditReportIssues } from '../data/reportIssuesData';

export default function WorkOnReportView({ job, onClose }) {
  const [issues, setIssues] = useState(mockAuditReportIssues);
  // Default to null so NO row is selected initially and the full report (ALL issues) is displayed in PDF preview
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [isTrackChangesActive, setIsTrackChangesActive] = useState(false);

  // Active Issue Object for PDF Filter View
  const selectedIssue = issues.find(i => i.id === expandedIssueId) || null;

  // Re-order issues helper
  const handleMoveIssue = (index, direction) => {
    const newIssues = [...issues];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIssues.length) return;
    const temp = newIssues[index];
    newIssues[index] = newIssues[targetIndex];
    newIssues[targetIndex] = temp;
    setIssues(newIssues);
  };

  // Field change handler (Instant real-time update to live HTML PDF preview)
  const handleIssueFieldChange = (issueId, field, val) => {
    setIssues(prev => prev.map(item => {
      if (item.id === issueId) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // Issue Action Handlers
  const handleSaveIssue = (issueId) => {
    alert(`Issue ${issueId} changes saved successfully!`);
  };

  const handleSubmitIssue = (issueId) => {
    alert(`Issue ${issueId} submitted for management review.`);
  };

  const handleRerouteIssue = (issueId) => {
    alert(`Issue ${issueId} rerouted to Lead Compliance Auditor.`);
  };

  const handleMarkNotAnIssue = (issueId) => {
    setIssues(prev => prev.map(item => {
      if (item.id === issueId) {
        return { ...item, status: 'Not an Issue' };
      }
      return item;
    }));
  };

  const handleMarkExcludeIssue = (issueId) => {
    setIssues(prev => prev.filter(item => item.id !== issueId));
    if (expandedIssueId === issueId) {
      setExpandedIssueId(null);
    }
  };

  const renderCriticalityBadge = (crit) => {
    let bg = '#FEF2F2'; let text = '#991B1B'; let border = '#FCA5A5';
    if (crit === 'Minor') { bg = '#FFFBEB'; text = '#B45309'; border = '#FDE68A'; }
    else if (crit === 'Critical') { bg = '#D8001D'; text = '#ffffff'; border = '#A00014'; }

    return (
      <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', backgroundColor: bg, color: text, border: `1px solid ${border}`, display: 'inline-block' }}>
        {crit}
      </span>
    );
  };

  const renderStatusBadge = (st) => {
    let text = '#64748B';
    if (st.includes('Pending')) text = '#991B1B';
    else if (st.includes('progress')) text = '#2563EB';
    else if (st === 'Not an Issue') text = '#059669';

    return (
      <span style={{ fontSize: '11.5px', fontWeight: '600', color: text }}>
        {st}
      </span>
    );
  };

  // Helper to render PDF HTML card for an issue
  const renderPdfIssueCard = (item) => (
    <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
      
      {/* Grid Box Metadata */}
      <div style={{
        border: '1px solid #000000',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        fontSize: '11.5px'
      }}>
        {/* Row 1 */}
        <div style={{ padding: '8px 12px', borderRight: '1px solid #000000', borderBottom: '1px solid #000000' }}>
          <div style={{ fontWeight: '800', color: '#000000', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>
            Report Ref. -1
          </div>
          {renderCriticalityBadge(item.criticality)}
        </div>

        <div style={{ padding: '8px 12px', borderRight: '1px solid #000000', borderBottom: '1px solid #000000' }}>
          <div style={{ fontWeight: '800', color: '#000000', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>
            Accountable Function(s):
          </div>
          <span style={{ fontWeight: '600', color: '#1E293B' }}>{item.function} / Supply Chain</span>
        </div>

        <div style={{ padding: '8px 12px', borderBottom: '1px solid #000000' }}>
          <div style={{ fontWeight: '800', color: '#000000', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>
            Process Area
          </div>
          <span style={{ fontWeight: '600', color: '#1E293B' }}>{item.processArea}</span>
        </div>

        {/* Row 2 */}
        <div style={{ padding: '8px 12px', borderRight: '1px solid #000000' }}>
          <div style={{ fontWeight: '800', color: '#000000', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>
            Repeat Finding
          </div>
          <span style={{ fontWeight: '600', color: '#1E293B' }}>{item.repeatFinding}</span>
        </div>

        <div style={{ padding: '8px 12px', borderRight: '1px solid #000000' }}>
          <div style={{ fontWeight: '800', color: '#000000', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>
            Issue Cause Type
          </div>
          <span style={{ fontWeight: '600', color: '#1E293B' }}>{item.issueCauseType}</span>
        </div>

        <div style={{ padding: '8px 12px' }}>
          <div style={{ fontWeight: '800', color: '#000000', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>
            SOX Reportable
          </div>
          <span style={{ fontWeight: '600', color: '#1E293B' }}>{item.soxReportable}</span>
        </div>
      </div>

      {/* 3-Column Issue Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', fontSize: '11.5px', lineHeight: '1.5' }}>
        
        {/* Column 1: Issue Title & Description */}
        <div>
          <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#000000', marginBottom: '6px' }}>
            Issue:
          </h4>
          <p style={{ fontWeight: '800', color: '#000000', marginBottom: '6px' }}>
            {item.title}
          </p>
          <p style={{ color: '#1E293B', whiteSpace: 'pre-wrap', margin: 0 }}>
            {item.issue}
          </p>
        </div>

        {/* Column 2: Root Cause */}
        <div>
          <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#000000', marginBottom: '6px' }}>
            Root Cause
          </h4>
          <p style={{ color: '#1E293B', whiteSpace: 'pre-wrap', margin: 0 }}>
            {item.rootCause}
          </p>
        </div>

        {/* Column 3: Impact */}
        <div>
          <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#000000', marginBottom: '6px' }}>
            Impact
          </h4>
          <p style={{ color: '#1E293B', whiteSpace: 'pre-wrap', margin: 0 }}>
            {item.impact}
          </p>
        </div>

      </div>

      {/* Recommendation Block */}
      <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', fontSize: '11.5px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#000000', marginBottom: '4px' }}>
          Recommendation:
        </h4>
        <p style={{ color: '#1E293B', whiteSpace: 'pre-wrap', margin: 0, lineHeight: '1.5' }}>
          {item.recommendation}
        </p>
      </div>

    </div>
  );

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      
      {/* Studio Toolbar (Sits directly under Application Header) */}
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        {/* Left Side: Back Arrow Button + Title: Audit Report - [Job Name] + Editing Pill Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Back Button */}
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

          {/* Title */}
          <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
            Audit Report — {job?.fileName || job?.id || 'BiosenseWebster_Catheters_Audit'}
          </h1>

          {/* Editing Pill Badge (Shows only when an issue is selected) */}
          {selectedIssue && (
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#D8001D', backgroundColor: '#FFF0F2', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #FCA5A5' }}>
              Editing: {selectedIssue.id}
            </span>
          )}
        </div>

        {/* Top Right Job-Level Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Generate Report Button */}
          <button
            onClick={() => alert(`Re-generating AI Report compile for ${job?.id || 'JOB-2026-881'}`)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              color: '#ffffff',
              backgroundColor: '#1E40AF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles style={{ width: '14px', height: '14px', color: '#FDE047' }} />
            <span>Generate Report</span>
          </button>

          {/* Download Button */}
          <button
            onClick={() => alert(`Downloading PDF Report for ${job?.id || 'JOB-2026-881'}`)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#1E293B',
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download style={{ width: '14px', height: '14px', color: '#2563EB' }} />
            <span>Download PDF</span>
          </button>

          {/* Track Changes Button */}
          <button
            onClick={() => setIsTrackChangesActive(!isTrackChangesActive)}
            style={{
              padding: '6px 14px',
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

        </div>
      </div>

      {/* Studio Workspace Body (2 Columns: Left Issues List/Editor | Right Live HTML PDF Preview) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: ISSUES TABLE & EXPANDABLE EDIT FORM */}
        <div style={{
          width: '50%',
          borderRight: '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          overflow: 'hidden'
        }}>
          
          {/* Scrollable Table Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #D8001D', color: '#D8001D', fontSize: '11.5px', textTransform: 'none' }}>
                  <th style={{ width: '36px', padding: '12px 8px', textAlign: 'center' }}></th>
                  <th style={{ padding: '12px 16px', fontWeight: '800' }}>Issue Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: '800', width: '80px' }}>Function</th>
                  <th style={{ padding: '12px 16px', fontWeight: '800', width: '130px' }}>Process Area</th>
                  <th style={{ padding: '12px 16px', fontWeight: '800', width: '90px' }}>Criticality</th>
                  <th style={{ padding: '12px 16px', fontWeight: '800', width: '110px' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '800', width: '60px', textAlign: 'center' }}>Reorder</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((item, idx) => {
                  const isExpanded = expandedIssueId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      
                      {/* Main Table Row */}
                      <tr style={{
                        borderBottom: '1px solid #E2E8F0',
                        backgroundColor: isExpanded ? '#FFF5F6' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}>
                        
                        {/* Expand / Collapse Button */}
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          <button
                            onClick={() => setExpandedIssueId(isExpanded ? null : item.id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#D8001D',
                              cursor: 'pointer',
                              fontWeight: '900',
                              fontSize: '15px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isExpanded ? <Minus style={{ width: '15px', height: '15px' }} /> : <Plus style={{ width: '15px', height: '15px' }} />}
                          </button>
                        </td>

                        {/* Title */}
                        <td 
                          onClick={() => setExpandedIssueId(isExpanded ? null : item.id)}
                          style={{ padding: '14px 16px', fontWeight: '700', color: isExpanded ? '#D8001D' : '#0F172A', cursor: 'pointer', lineHeight: '1.4' }}
                        >
                          {item.title}
                        </td>

                        {/* Function */}
                        <td style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>
                          {item.function}
                        </td>

                        {/* Process Area */}
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          {item.processArea}
                        </td>

                        {/* Criticality */}
                        <td style={{ padding: '14px 16px' }}>
                          {renderCriticalityBadge(item.criticality)}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 16px' }}>
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* Reorder Arrows */}
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <button
                              onClick={() => handleMoveIssue(idx, 'up')}
                              disabled={idx === 0}
                              style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#CBD5E1' : '#475569' }}
                            >
                              <ArrowUp style={{ width: '14px', height: '14px' }} />
                            </button>
                            <button
                              onClick={() => handleMoveIssue(idx, 'down')}
                              disabled={idx === issues.length - 1}
                              style={{ border: 'none', background: 'none', cursor: idx === issues.length - 1 ? 'default' : 'pointer', color: idx === issues.length - 1 ? '#CBD5E1' : '#475569' }}
                            >
                              <ArrowDown style={{ width: '14px', height: '14px' }} />
                            </button>
                          </div>
                        </td>

                      </tr>

                      {/* EXPANDED INLINE EDIT FORM */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" style={{ padding: '16px', backgroundColor: '#FAFAFA', borderBottom: '2px solid #CBD5E1' }}>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
                              
                              {/* Issue-Level Action Toolbar (MOVED TO TOP OF EXPANDABLE VIEW) */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '2px' }}>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {/* Save */}
                                  <button
                                    onClick={() => handleSaveIssue(item.id)}
                                    style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Save style={{ width: '13px', height: '13px' }} />
                                    <span>Save</span>
                                  </button>

                                  {/* Submit */}
                                  <button
                                    onClick={() => handleSubmitIssue(item.id)}
                                    style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Send style={{ width: '13px', height: '13px' }} />
                                    <span>Submit</span>
                                  </button>

                                  {/* Reroute */}
                                  <button
                                    onClick={() => handleRerouteIssue(item.id)}
                                    style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#7C3AED', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <GitBranch style={{ width: '13px', height: '13px' }} />
                                    <span>Reroute</span>
                                  </button>

                                  {/* Track Changes */}
                                  <button
                                    onClick={() => setIsTrackChangesActive(!isTrackChangesActive)}
                                    style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800', color: '#D8001D', backgroundColor: '#ffffff', border: '1px solid #D8001D', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <History style={{ width: '13px', height: '13px' }} />
                                    <span>Track Changes</span>
                                  </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {/* Mark Not an Issue */}
                                  <button
                                    onClick={() => handleMarkNotAnIssue(item.id)}
                                    style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#047857', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', cursor: 'pointer' }}
                                  >
                                    Mark Not an Issue
                                  </button>

                                  {/* Mark Exclude Issue */}
                                  <button
                                    onClick={() => handleMarkExcludeIssue(item.id)}
                                    style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer' }}
                                  >
                                    Mark Exclude Issue
                                  </button>
                                </div>

                              </div>

                              {/* Form Row 1: Issue Title */}
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Issue Title</label>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => handleIssueFieldChange(item.id, 'title', e.target.value)}
                                  style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
                                />
                              </div>

                              {/* Form Row 2: Criticality, Function, Process Area */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Criticality</label>
                                  <select
                                    value={item.criticality}
                                    onChange={(e) => handleIssueFieldChange(item.id, 'criticality', e.target.value)}
                                    style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#ffffff' }}
                                  >
                                    <option value="Critical">Critical</option>
                                    <option value="Major">Major</option>
                                    <option value="Minor">Minor</option>
                                  </select>
                                </div>

                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Function</label>
                                  <select
                                    value={item.function}
                                    onChange={(e) => handleIssueFieldChange(item.id, 'function', e.target.value)}
                                    style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#ffffff' }}
                                  >
                                    <option value="IT">IT</option>
                                    <option value="FinOps">FinOps</option>
                                  </select>
                                </div>

                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Process Area</label>
                                  <input
                                    type="text"
                                    value={item.processArea}
                                    onChange={(e) => handleIssueFieldChange(item.id, 'processArea', e.target.value)}
                                    style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                                  />
                                </div>
                              </div>

                              {/* Form Row 3: SOX Reportable, Repeat Finding, Issue Cause Type */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>SOX Reportable</label>
                                  <select
                                    value={item.soxReportable}
                                    onChange={(e) => handleIssueFieldChange(item.id, 'soxReportable', e.target.value)}
                                    style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#ffffff' }}
                                  >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                  </select>
                                </div>

                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Repeat Finding</label>
                                  <select
                                    value={item.repeatFinding}
                                    onChange={(e) => handleIssueFieldChange(item.id, 'repeatFinding', e.target.value)}
                                    style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#ffffff' }}
                                  >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                  </select>
                                </div>

                                <div>
                                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Issue Cause Type</label>
                                  <input
                                    type="text"
                                    value={item.issueCauseType}
                                    onChange={(e) => handleIssueFieldChange(item.id, 'issueCauseType', e.target.value)}
                                    style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                                  />
                                </div>
                              </div>

                              {/* Textarea 1: Issue Description */}
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Issue Description</label>
                                <textarea
                                  rows={3}
                                  value={item.issue}
                                  onChange={(e) => handleIssueFieldChange(item.id, 'issue', e.target.value)}
                                  style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                              </div>

                              {/* Textarea 2: Root Cause */}
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Root Cause</label>
                                <textarea
                                  rows={3}
                                  value={item.rootCause}
                                  onChange={(e) => handleIssueFieldChange(item.id, 'rootCause', e.target.value)}
                                  style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                              </div>

                              {/* Textarea 3: Impact */}
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Impact</label>
                                <textarea
                                  rows={3}
                                  value={item.impact}
                                  onChange={(e) => handleIssueFieldChange(item.id, 'impact', e.target.value)}
                                  style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                              </div>

                              {/* Textarea 4: Recommendation */}
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Recommendation</label>
                                <textarea
                                  rows={3}
                                  value={item.recommendation}
                                  onChange={(e) => handleIssueFieldChange(item.id, 'recommendation', e.target.value)}
                                  style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                              </div>

                            </div>

                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

          </div>

          {/* Red Footer Note */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', fontStyle: 'italic', color: '#D8001D' }}>
              Note: The sorted order will determine the order of issues in the report
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE HTML PDF-STYLE REPORT PREVIEW */}
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
            
            {/* Red PDF Document Header Bar */}
            <div style={{
              backgroundColor: '#D8001D',
              color: '#ffffff',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.3px' }}>
                {job?.fileName || "MedTech Suzhou - Orthopedics Plant_AuditReport"}
              </span>
              <button
                onClick={() => alert(`Downloading PDF Report for ${job?.id || 'JOB-2026-881'}`)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                title="Download PDF"
              >
                <Download style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Document Content Canvas */}
            <div style={{ padding: '32px 36px', color: '#0F172A' }}>
              
              {/* Official Brand Logo & Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #000000', paddingBottom: '12px', marginBottom: '16px' }}>
                <div>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '24px', fontWeight: '900', color: '#EA580C', margin: 0 }}>
                    Johnson&amp;Johnson
                  </h1>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Report Details
                  </h2>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#94A3B8' }}>
                    Global Audit and Assurance
                  </span>
                </div>
              </div>

              {/* Auditable Entity */}
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#000000', marginBottom: '20px' }}>
                Auditable Entity: <span style={{ fontWeight: '600' }}>{selectedIssue ? selectedIssue.auditableEntity : "MRC-002960-J&J Medical Austral"}</span>
              </div>

              {/* Render Selected Issue or All Issues in Sequence */}
              {selectedIssue ? (
                renderPdfIssueCard(selectedIssue)
              ) : (
                issues.map(item => renderPdfIssueCard(item))
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
