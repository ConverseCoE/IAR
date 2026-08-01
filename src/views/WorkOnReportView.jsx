import React, { useState } from 'react';
import { 
  ArrowLeft, Plus, Minus, Download, Save, Send, GitBranch, History, 
  AlertOctagon, CheckCircle2, RefreshCw, FileText, ArrowUp, ArrowDown, Sparkles,
  MoreVertical, Check, Layout, Columns, PanelLeft, Layers, X
} from 'lucide-react';
import { mockAuditReportIssues } from '../data/reportIssuesData';

export default function WorkOnReportView({ job, onClose }) {
  const [issues, setIssues] = useState(mockAuditReportIssues);
  // Default to null so NO row is selected initially and the full report (ALL issues) is displayed in PDF preview
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [isTrackChangesActive, setIsTrackChangesActive] = useState(false);

  // Multi-Design Mode State ('default', '3pane', 'slideover', 'tabbed')
  const [designMode, setDesignMode] = useState('default');
  const [isDesignMenuOpen, setIsDesignMenuOpen] = useState(false);

  // Slide-over & Tabbed Modal Active Tab States
  const [slideoverTab, setSlideoverTab] = useState('metadata'); // 'metadata', 'analysis', 'actions'
  const [tabbedStep, setTabbedStep] = useState(1); // 1, 2, 3

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

  // Helper to render Form Fields for an issue
  const renderFormFields = (item) => (
    <>
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
    </>
  );

  // Helper to render Issue Action Toolbar Buttons
  const renderActionToolbar = (issueId) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingBottom: '4px' }}>
      
      {/* Left End: Mark Not an Issue & Mark Exclude Issue */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => handleMarkNotAnIssue(issueId)}
          style={{ padding: '7px 12px', fontSize: '11.5px', fontWeight: '800', color: '#047857', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', cursor: 'pointer' }}
        >
          Mark Not an Issue
        </button>

        <button
          onClick={() => handleMarkExcludeIssue(issueId)}
          style={{ padding: '7px 12px', fontSize: '11.5px', fontWeight: '800', color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer' }}
        >
          Mark Exclude Issue
        </button>
      </div>

      {/* Right End: Track Changes -> Reroute -> Submit -> Save (Reading Right-to-Left: Save is rightmost) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setIsTrackChangesActive(!isTrackChangesActive)}
          style={{ padding: '7px 14px', fontSize: '11.5px', fontWeight: '800', color: '#D8001D', backgroundColor: '#ffffff', border: '1.5px solid #D8001D', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <History style={{ width: '13.5px', height: '13.5px' }} />
          <span>Track Changes</span>
        </button>

        <button
          onClick={() => handleRerouteIssue(issueId)}
          style={{ padding: '7px 14px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#7C3AED', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(124,58,237,0.2)' }}
        >
          <GitBranch style={{ width: '13.5px', height: '13.5px' }} />
          <span>Reroute</span>
        </button>

        <button
          onClick={() => handleSubmitIssue(issueId)}
          style={{ padding: '7px 14px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(5,150,105,0.2)' }}
        >
          <Send style={{ width: '13.5px', height: '13.5px' }} />
          <span>Submit</span>
        </button>

        <button
          onClick={() => handleSaveIssue(issueId)}
          style={{ padding: '7px 14px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(37,99,235,0.2)' }}
        >
          <Save style={{ width: '13.5px', height: '13.5px' }} />
          <span>Save</span>
        </button>
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

          {/* Active Design Mode Indicator */}
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#1E40AF', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #BFDBFE' }}>
            Mode: {designMode === 'default' ? 'Inline Table' : designMode === '3pane' ? '3-Pane Master-Detail' : designMode === 'slideover' ? 'Left Slide-over Drawer' : 'Tabbed Multi-Step'}
          </span>
        </div>

        {/* Top Right Job-Level Actions + Three-Dots Design Switcher Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          
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

          {/* THREE-DOTS DESIGN SWITCHER MENU BUTTON */}
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
              title="Switch Design Layout for Demo Presentation"
            >
              <MoreVertical style={{ width: '18px', height: '18px', color: '#0F172A' }} />
            </button>

            {/* THREE-DOTS DROPDOWN MENU */}
            {isDesignMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '260px',
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
                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '800', color: '#64748B', borderBottom: '1px solid #F1F5F9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select UX Design Layout
                </div>

                {/* Option 1: Default Inline */}
                <button
                  onClick={() => { setDesignMode('default'); setIsDesignMenuOpen(false); }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: designMode === 'default' ? '#FFF0F2' : 'transparent',
                    color: designMode === 'default' ? '#D8001D' : '#1E293B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layout style={{ width: '15px', height: '15px', color: designMode === 'default' ? '#D8001D' : '#64748B' }} />
                    <span>Default Inline Table</span>
                  </div>
                  {designMode === 'default' && <Check style={{ width: '14px', height: '14px', color: '#D8001D' }} />}
                </button>

                {/* Option 2: 3-Pane Master-Detail */}
                <button
                  onClick={() => { setDesignMode('3pane'); setIsDesignMenuOpen(false); }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: designMode === '3pane' ? '#EFF6FF' : 'transparent',
                    color: designMode === '3pane' ? '#2563EB' : '#1E293B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Columns style={{ width: '15px', height: '15px', color: designMode === '3pane' ? '#2563EB' : '#64748B' }} />
                    <span>3-Pane Master-Detail</span>
                  </div>
                  {designMode === '3pane' && <Check style={{ width: '14px', height: '14px', color: '#2563EB' }} />}
                </button>

                {/* Option 3: Left Slide-over Drawer */}
                <button
                  onClick={() => { setDesignMode('slideover'); setIsDesignMenuOpen(false); }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: designMode === 'slideover' ? '#ECFDF5' : 'transparent',
                    color: designMode === 'slideover' ? '#059669' : '#1E293B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PanelLeft style={{ width: '15px', height: '15px', color: designMode === 'slideover' ? '#059669' : '#64748B' }} />
                    <span>Left Slide-over Drawer</span>
                  </div>
                  {designMode === 'slideover' && <Check style={{ width: '14px', height: '14px', color: '#059669' }} />}
                </button>

                {/* Option 4: Tabbed Multi-Step */}
                <button
                  onClick={() => { setDesignMode('tabbed'); setIsDesignMenuOpen(false); }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textAlign: 'left',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: designMode === 'tabbed' ? '#F3E8FF' : 'transparent',
                    color: designMode === 'tabbed' ? '#7C3AED' : '#1E293B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers style={{ width: '15px', height: '15px', color: designMode === 'tabbed' ? '#7C3AED' : '#64748B' }} />
                    <span>Tabbed Multi-Step Form</span>
                  </div>
                  {designMode === 'tabbed' && <Check style={{ width: '14px', height: '14px', color: '#7C3AED' }} />}
                </button>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* DYNAMIC DESIGN WORKSPACE RENDERER */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* ============================================================== */}
        {/* MODE 1: DEFAULT INLINE EXPANDED TABLE LAYOUT                  */}
        {/* ============================================================== */}
        {designMode === 'default' && (
          <>
            {/* Left Column Issues Table */}
            <div style={{ width: '50%', borderRight: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
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
                          <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: isExpanded ? '#FFF5F6' : 'transparent', transition: 'background-color 0.15s ease' }}>
                            <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                              <button onClick={() => setExpandedIssueId(isExpanded ? null : item.id)} style={{ border: 'none', background: 'none', color: '#D8001D', cursor: 'pointer', fontWeight: '900', fontSize: '15px' }}>
                                {isExpanded ? <Minus style={{ width: '15px', height: '15px' }} /> : <Plus style={{ width: '15px', height: '15px' }} />}
                              </button>
                            </td>
                            <td onClick={() => setExpandedIssueId(isExpanded ? null : item.id)} style={{ padding: '14px 16px', fontWeight: '700', color: isExpanded ? '#D8001D' : '#0F172A', cursor: 'pointer', lineHeight: '1.4' }}>
                              {item.title}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#475569', fontWeight: '600' }}>{item.function}</td>
                            <td style={{ padding: '14px 16px', color: '#475569' }}>{item.processArea}</td>
                            <td style={{ padding: '14px 16px' }}>{renderCriticalityBadge(item.criticality)}</td>
                            <td style={{ padding: '14px 16px' }}>{renderStatusBadge(item.status)}</td>
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <button onClick={() => handleMoveIssue(idx, 'up')} disabled={idx === 0} style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#CBD5E1' : '#475569' }}>
                                  <ArrowUp style={{ width: '14px', height: '14px' }} />
                                </button>
                                <button onClick={() => handleMoveIssue(idx, 'down')} disabled={idx === issues.length - 1} style={{ border: 'none', background: 'none', cursor: idx === issues.length - 1 ? 'default' : 'pointer', color: idx === issues.length - 1 ? '#CBD5E1' : '#475569' }}>
                                  <ArrowDown style={{ width: '14px', height: '14px' }} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan="7" style={{ padding: '16px', backgroundColor: '#FAFAFA', borderBottom: '2px solid #CBD5E1' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {renderActionToolbar(item.id)}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
                                    {renderFormFields(item)}
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

              <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', fontStyle: 'italic', color: '#D8001D' }}>
                  Note: The sorted order will determine the order of issues in the report
                </span>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* MODE 2: 3-PANE MASTER-DETAIL LAYOUT (Cards List | Form | PDF)   */}
        {/* ============================================================== */}
        {designMode === '3pane' && (
          <>
            {/* Pane 1: Master Issue Cards List (22%) */}
            <div style={{ width: '22%', borderRight: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Master Issues List ({issues.length})
                </h3>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {issues.map(item => {
                  const isSelected = expandedIssueId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setExpandedIssueId(isSelected ? null : item.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: isSelected ? '#2563EB' : '#64748B' }}>{item.id}</span>
                        {renderCriticalityBadge(item.criticality)}
                      </div>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', lineHeight: '1.3', margin: '0 0 6px 0' }}>
                        {item.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                        <span>{item.function}</span>
                        {renderStatusBadge(item.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pane 2: Issue Form Editor Pane (33%) */}
            <div style={{ width: '33%', borderRight: '1px solid #CBD5E1', backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  {selectedIssue ? `Form Editor: ${selectedIssue.id}` : "Select an Issue from Master List"}
                </h3>
              </div>

              {selectedIssue ? (
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {renderActionToolbar(selectedIssue.id)}
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {renderFormFields(selectedIssue)}
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '13px', padding: '20px', textAlign: 'center' }}>
                  👈 Click any issue on the Master List to view &amp; edit its fields here while keeping live PDF preview open!
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* MODE 3: LEFT SLIDE-OVER DRAWER LAYOUT                         */}
        {/* ============================================================== */}
        {designMode === 'slideover' && (
          <>
            {/* Left Table + Slide-over Drawer Wrapper (50%) */}
            <div style={{ width: '50%', borderRight: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', position: 'relative', overflow: 'hidden' }}>
              
              {/* Full Table View */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #059669', color: '#059669', fontSize: '11.5px' }}>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>Issue Title</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>Function</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>Criticality</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0F172A' }}>{item.title}</td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>{item.function}</td>
                        <td style={{ padding: '14px 16px' }}>{renderCriticalityBadge(item.criticality)}</td>
                        <td style={{ padding: '14px 16px' }}>{renderStatusBadge(item.status)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setExpandedIssueId(item.id)}
                            style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800', color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Edit Drawer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Slide-over Form Drawer (Appears over Left Pane when issue selected) */}
              {selectedIssue && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#ffffff',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
                  animation: 'slideInLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  {/* Drawer Header */}
                  <div style={{ padding: '14px 20px', backgroundColor: '#065F46', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => setExpandedIssueId(null)} style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer' }}>
                        <ArrowLeft style={{ width: '18px', height: '18px' }} />
                      </button>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>
                        Slide-over Drawer: {selectedIssue.id}
                      </h3>
                    </div>
                    <button onClick={() => setExpandedIssueId(null)} style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer' }}>
                      <X style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>

                  {/* Drawer Tabs (Overview | Analysis | Actions) */}
                  <div style={{ padding: '12px 20px 0 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSlideoverTab('metadata')}
                      style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', backgroundColor: slideoverTab === 'metadata' ? '#059669' : '#F1F5F9', color: slideoverTab === 'metadata' ? '#ffffff' : '#475569' }}
                    >
                      1. General Metadata
                    </button>
                    <button
                      onClick={() => setSlideoverTab('analysis')}
                      style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', backgroundColor: slideoverTab === 'analysis' ? '#059669' : '#F1F5F9', color: slideoverTab === 'analysis' ? '#ffffff' : '#475569' }}
                    >
                      2. AI Analysis &amp; Cause
                    </button>
                    <button
                      onClick={() => setSlideoverTab('actions')}
                      style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', backgroundColor: slideoverTab === 'actions' ? '#059669' : '#F1F5F9', color: slideoverTab === 'actions' ? '#ffffff' : '#475569' }}
                    >
                      3. Action Plan &amp; Approvals
                    </button>
                  </div>

                  {/* Tab Body */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {renderActionToolbar(selectedIssue.id)}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {renderFormFields(selectedIssue)}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* MODE 4: TABBED MULTI-STEP FORM LAYOUT                          */}
        {/* ============================================================== */}
        {designMode === 'tabbed' && (
          <>
            {/* Left Table + Step Wizard Form (50%) */}
            <div style={{ width: '50%', borderRight: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
              
              {selectedIssue ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA', overflow: 'hidden' }}>
                  
                  {/* Step Header Bar */}
                  <div style={{ padding: '14px 20px', backgroundColor: '#7C3AED', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => setExpandedIssueId(null)} style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer' }}>
                        <ArrowLeft style={{ width: '18px', height: '18px' }} />
                      </button>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>
                        Step-by-Step Editor: {selectedIssue.id}
                      </h3>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                      Step {tabbedStep} of 3
                    </span>
                  </div>

                  {/* Wizard Step Navigation */}
                  <div style={{ padding: '12px 20px', backgroundColor: '#ffffff', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '10px' }}>
                    {[1, 2, 3].map(stepNum => (
                      <button
                        key={stepNum}
                        onClick={() => setTabbedStep(stepNum)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: tabbedStep === stepNum ? '#7C3AED' : '#F1F5F9',
                          color: tabbedStep === stepNum ? '#ffffff' : '#475569'
                        }}
                      >
                        Step {stepNum}: {stepNum === 1 ? 'General' : stepNum === 2 ? 'Analysis' : 'Recommendation'}
                      </button>
                    ))}
                  </div>

                  {/* Step Form Body */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {renderActionToolbar(selectedIssue.id)}

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {tabbedStep === 1 && (
                        <>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#7C3AED', margin: 0, borderBottom: '1px solid #DDD6FE', paddingBottom: '6px' }}>
                            Step 1: General Metadata &amp; Categorization
                          </h4>
                          {/* Title */}
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Issue Title</label>
                            <input type="text" value={selectedIssue.title} onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'title', e.target.value)} style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                          </div>
                          {/* Function, Process Area, Criticality */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Criticality</label>
                              <select value={selectedIssue.criticality} onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'criticality', e.target.value)} style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                                <option value="Critical">Critical</option>
                                <option value="Major">Major</option>
                                <option value="Minor">Minor</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Function</label>
                              <select value={selectedIssue.function} onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'function', e.target.value)} style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                                <option value="IT">IT</option>
                                <option value="FinOps">FinOps</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Process Area</label>
                              <input type="text" value={selectedIssue.processArea} onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'processArea', e.target.value)} style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                            </div>
                          </div>
                        </>
                      )}

                      {tabbedStep === 2 && (
                        <>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#7C3AED', margin: 0, borderBottom: '1px solid #DDD6FE', paddingBottom: '6px' }}>
                            Step 2: AI Root Cause &amp; Financial Impact
                          </h4>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Root Cause</label>
                            <textarea rows={3} value={selectedIssue.rootCause} onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'rootCause', e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Impact</label>
                            <textarea rows={3} value={selectedIssue.impact} onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'impact', e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }} />
                          </div>
                        </>
                      )}

                      {tabbedStep === 3 && (
                        <>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#7C3AED', margin: 0, borderBottom: '1px solid #DDD6FE', paddingBottom: '6px' }}>
                            Step 3: Remediation Recommendations &amp; Sign-off
                          </h4>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Recommendation</label>
                            <textarea rows={4} value={selectedIssue.recommendation} onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'recommendation', e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontFamily: 'inherit' }} />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Step Controls Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                      <button
                        onClick={() => setTabbedStep(Math.max(1, tabbedStep - 1))}
                        disabled={tabbedStep === 1}
                        style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: tabbedStep === 1 ? '#F1F5F9' : '#ffffff', color: '#475569', cursor: tabbedStep === 1 ? 'default' : 'pointer' }}
                      >
                        Previous Step
                      </button>

                      <button
                        onClick={() => setTabbedStep(Math.min(3, tabbedStep + 1))}
                        disabled={tabbedStep === 3}
                        style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: 'none', backgroundColor: tabbedStep === 3 ? '#94A3B8' : '#7C3AED', color: '#ffffff', cursor: tabbedStep === 3 ? 'default' : 'pointer' }}
                      >
                        Next Step
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                /* Table View when no issue is selected */
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #7C3AED', color: '#7C3AED', fontSize: '11.5px' }}>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Issue Title</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Function</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Criticality</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800' }}>Status</th>
                        <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0F172A' }}>{item.title}</td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>{item.function}</td>
                          <td style={{ padding: '14px 16px' }}>{renderCriticalityBadge(item.criticality)}</td>
                          <td style={{ padding: '14px 16px' }}>{renderStatusBadge(item.status)}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => { setExpandedIssueId(item.id); setTabbedStep(1); }}
                              style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800', color: '#7C3AED', backgroundColor: '#F3E8FF', border: '1px solid #DDD6FE', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              Step Wizard
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* RIGHT COLUMN: LIVE HTML PDF-STYLE REPORT PREVIEW               */}
        {/* ============================================================== */}
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
