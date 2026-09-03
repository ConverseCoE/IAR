import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Plus, Minus, Download, Save, Send, GitBranch, History, 
  AlertOctagon, CheckCircle2, RefreshCw, FileText, ArrowUp, ArrowDown, Sparkles,
  MoreVertical, Check, Layout, Columns, PanelLeft, Layers, X,
  ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen,
  Lock, Clock, ShieldAlert
} from 'lucide-react';
import { mockAuditReportIssues } from '../data/reportIssuesData';
import IssueLogsModal from '../components/issues/IssueLogsModal';

export default function AuditReportView({ job, onClose }) {
  const [issues, setIssues] = useState(mockAuditReportIssues);
  // Default to null so NO row is selected initially and the full report (ALL issues) is displayed in PDF preview
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [isTrackChangesActive, setIsTrackChangesActive] = useState(false);
  const [isIssueLogsModalOpen, setIsIssueLogsModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const actionMenuRef = useRef(null);

  // Multi-Design Mode State ('default', '3pane', 'slideover', 'tabbed')
  const [designMode, setDesignMode] = useState('3pane');
  const [isDesignMenuOpen, setIsDesignMenuOpen] = useState(false);

  // 3-Pane Resizable Widths & Collapse States
  const [pane1Width, setPane1Width] = useState(24); // percentage (12% to 45%)
  const [pane2Width, setPane2Width] = useState(36); // percentage (15% to 55%)

  const [isPane1Collapsed, setIsPane1Collapsed] = useState(false);
  const [isPane2Collapsed, setIsPane2Collapsed] = useState(false);
  const [isPane3Collapsed, setIsPane3Collapsed] = useState(false);

  const [isDraggingSplitter1, setIsDraggingSplitter1] = useState(false);
  const [isDraggingSplitter2, setIsDraggingSplitter2] = useState(false);
  const [hoveredSplitter, setHoveredSplitter] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;

      if (isDraggingSplitter1) {
        const mouseX = e.clientX - containerRect.left;
        const newPct = Math.min(Math.max((mouseX / containerWidth) * 100, 12), 45);
        setPane1Width(Math.round(newPct));
      } else if (isDraggingSplitter2) {
        const mouseX = e.clientX - containerRect.left;
        const pane1Px = isPane1Collapsed ? 36 : (containerWidth * (pane1Width / 100));
        const availablePx = mouseX - pane1Px;
        const newPct = Math.min(Math.max((availablePx / containerWidth) * 100, 15), 55);
        setPane2Width(Math.round(newPct));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSplitter1(false);
      setIsDraggingSplitter2(false);
    };

    if (isDraggingSplitter1 || isDraggingSplitter2) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplitter1, isDraggingSplitter2, pane1Width, isPane1Collapsed]);

  // Click outside to close three-dots more actions menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [expandedIssueId]);

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
    // Prevent modifications if issue is locked by another user
    const target = issues.find(i => i.id === issueId);
    if (target?.isLocked) return;

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

  const handleSendToIssue = (issueId) => {
    alert(`Issue ${issueId} sent to Lead Compliance Auditor.`);
  };

  const handleRerouteIssue = handleSendToIssue;

  const handleSignOffIssue = (issueId) => {
    setIssues(prev => prev.map(item => {
      if (item.id === issueId) {
        return { ...item, status: 'Signed Off' };
      }
      return item;
    }));
    alert(`Issue ${issueId} successfully signed off!`);
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

  // Helper to render Locked / Blocked Warning Banner
  const renderLockedBanner = (item) => {
    if (!item?.isLocked) return null;
    const lockedBy = item.lockedBy || {
      name: 'Marcus Vance',
      role: 'Lead Compliance Auditor',
      timestamp: '12 mins ago',
      activity: 'Drafting technical root cause analysis & recommendations'
    };

    return (
      <div style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: '#FFFBEB',
        border: '1.5px solid #F59E0B',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '7px',
          backgroundColor: '#FEF3C7',
          color: '#D97706',
          border: '1px solid #FDE68A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px'
        }}>
          <Lock style={{ width: '17px', height: '17px' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#92400E', margin: 0 }}>
                Issue Blocked &amp; Locked by {lockedBy.name}
              </h4>
              <span style={{
                fontSize: '9.5px',
                fontWeight: '800',
                color: '#92400E',
                backgroundColor: '#FDE68A',
                padding: '2px 7px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}>
                READ-ONLY MODE
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#B45309', fontWeight: '600' }}>
              <Clock style={{ width: '12px', height: '12px' }} />
              <span>Locked {lockedBy.timestamp || 'recently'}</span>
            </div>
          </div>
          <p style={{ fontSize: '11.5px', color: '#78350F', margin: '0 0 6px 0', lineHeight: '1.45' }}>
            <strong>{lockedBy.name}</strong> ({lockedBy.role || 'Compliance Auditor'}) is currently working on this issue. All form fields are disabled in read-only mode and action buttons have been hidden to prevent concurrent overwrite conflicts.
          </p>
          {lockedBy.activity && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#92400E',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontWeight: '600'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706', display: 'inline-block' }} />
              <span>Active Work: {lockedBy.activity}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper to render Form Fields for an issue
  const renderFormFields = (item) => {
    const isReadOnly = !!item.isLocked;

    const inputBaseStyle = {
      width: '100%',
      height: '34px',
      padding: '0 10px',
      fontSize: '12px',
      borderRadius: '6px',
      border: isReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
      backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff',
      color: isReadOnly ? '#64748B' : '#0F172A',
      cursor: isReadOnly ? 'not-allowed' : 'text',
      outline: 'none',
      boxSizing: 'border-box'
    };

    const selectBaseStyle = {
      width: '100%',
      height: '34px',
      padding: '0 8px',
      fontSize: '12px',
      borderRadius: '6px',
      border: isReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
      backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff',
      color: isReadOnly ? '#64748B' : '#0F172A',
      cursor: isReadOnly ? 'not-allowed' : 'pointer',
      outline: 'none',
      boxSizing: 'border-box'
    };

    const textareaBaseStyle = {
      width: '100%',
      padding: '8px 10px',
      fontSize: '12px',
      borderRadius: '6px',
      border: isReadOnly ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
      backgroundColor: isReadOnly ? '#F8FAFC' : '#ffffff',
      color: isReadOnly ? '#64748B' : '#0F172A',
      cursor: isReadOnly ? 'not-allowed' : 'text',
      fontFamily: 'inherit',
      resize: isReadOnly ? 'none' : 'vertical',
      outline: 'none',
      lineHeight: '1.5',
      boxSizing: 'border-box'
    };

    const labelStyle = {
      fontSize: '11px',
      fontWeight: '700',
      color: isReadOnly ? '#64748B' : '#334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '4px'
    };

    return (
      <>
        {/* Form Row 1: Issue Title */}
        <div>
          <label style={labelStyle}>
            <span>Issue Title</span>
            {isReadOnly && <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>🔒 Read Only</span>}
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.title}
            onChange={(e) => handleIssueFieldChange(item.id, 'title', e.target.value)}
            style={inputBaseStyle}
          />
        </div>

        {/* Form Row 2: Criticality, Function, Process Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span>Criticality</span>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
            </label>
            <select
              disabled={isReadOnly}
              value={item.criticality}
              onChange={(e) => handleIssueFieldChange(item.id, 'criticality', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span>Function</span>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
            </label>
            <select
              disabled={isReadOnly}
              value={item.function}
              onChange={(e) => handleIssueFieldChange(item.id, 'function', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="IT">IT</option>
              <option value="FinOps">FinOps</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span>Process Area</span>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.processArea}
              onChange={(e) => handleIssueFieldChange(item.id, 'processArea', e.target.value)}
              style={inputBaseStyle}
            />
          </div>
        </div>

        {/* Form Row 3: SOX Reportable, Repeat Finding, Issue Cause Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>
              <span>SOX Reportable</span>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
            </label>
            <select
              disabled={isReadOnly}
              value={item.soxReportable}
              onChange={(e) => handleIssueFieldChange(item.id, 'soxReportable', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span>Repeat Finding</span>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
            </label>
            <select
              disabled={isReadOnly}
              value={item.repeatFinding}
              onChange={(e) => handleIssueFieldChange(item.id, 'repeatFinding', e.target.value)}
              style={selectBaseStyle}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              <span>Issue Cause Type</span>
              {isReadOnly && <Lock style={{ width: '10px', height: '10px', color: '#94A3B8' }} />}
            </label>
            <input
              type="text"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              value={item.issueCauseType}
              onChange={(e) => handleIssueFieldChange(item.id, 'issueCauseType', e.target.value)}
              style={inputBaseStyle}
            />
          </div>
        </div>

        {/* Textarea 1: Issue Description */}
        <div>
          <label style={labelStyle}>
            <span>Issue Description</span>
            {isReadOnly && <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>🔒 Read Only</span>}
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.issue}
            onChange={(e) => handleIssueFieldChange(item.id, 'issue', e.target.value)}
            style={textareaBaseStyle}
          />
        </div>

        {/* Textarea 2: Root Cause */}
        <div>
          <label style={labelStyle}>
            <span>Root Cause</span>
            {isReadOnly && <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>🔒 Read Only</span>}
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.rootCause}
            onChange={(e) => handleIssueFieldChange(item.id, 'rootCause', e.target.value)}
            style={textareaBaseStyle}
          />
        </div>

        {/* Textarea 3: Impact */}
        <div>
          <label style={labelStyle}>
            <span>Impact</span>
            {isReadOnly && <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>🔒 Read Only</span>}
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.impact}
            onChange={(e) => handleIssueFieldChange(item.id, 'impact', e.target.value)}
            style={textareaBaseStyle}
          />
        </div>

        {/* Textarea 4: Recommendation */}
        <div>
          <label style={labelStyle}>
            <span>Recommendation</span>
            {isReadOnly && <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>🔒 Read Only</span>}
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            value={item.recommendation}
            onChange={(e) => handleIssueFieldChange(item.id, 'recommendation', e.target.value)}
            style={textareaBaseStyle}
          />
        </div>
      </>
    );
  };

  // Helper to render Issue Action Toolbar Buttons
  // Helper to render Issue Action Toolbar Buttons
  const renderActionToolbar = (issueId) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px', paddingBottom: '4px' }}>
      
      {/* Three Dots More Actions Menu (Track Changes, Mark Not an Issue, Mark Exclude Issue) */}
      <div style={{ position: 'relative' }} ref={actionMenuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMoreMenuOpen(!isMoreMenuOpen);
          }}
          style={{
            padding: '7px 9px',
            fontSize: '11.5px',
            fontWeight: '700',
            color: isMoreMenuOpen ? '#1E293B' : '#475569',
            backgroundColor: isMoreMenuOpen ? '#F1F5F9' : '#ffffff',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease'
          }}
          title="More actions"
        >
          <MoreVertical style={{ width: '15px', height: '15px' }} />
        </button>

        {isMoreMenuOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)',
            border: '1px solid #E2E8F0',
            width: '185px',
            padding: '4px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            <button
              onClick={() => {
                setIsMoreMenuOpen(false);
                setIsIssueLogsModalOpen(true);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#D8001D',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF0F2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <History style={{ width: '14px', height: '14px', color: '#D8001D' }} />
              <span>Track Changes</span>
            </button>

            <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '2px 0' }} />

            <button
              onClick={() => {
                setIsMoreMenuOpen(false);
                handleMarkNotAnIssue(issueId);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#047857',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ECFDF5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#047857' }} />
              <span>Mark Not an Issue</span>
            </button>

            <button
              onClick={() => {
                setIsMoreMenuOpen(false);
                handleMarkExcludeIssue(issueId);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#991B1B',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <AlertOctagon style={{ width: '14px', height: '14px', color: '#991B1B' }} />
              <span>Mark Exclude Issue</span>
            </button>
          </div>
        )}
      </div>

      {/* Send To Button (renamed from Reroute) */}
      <button
        onClick={() => handleSendToIssue(issueId)}
        style={{ padding: '7px 14px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#7C3AED', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(124,58,237,0.2)' }}
      >
        <GitBranch style={{ width: '13.5px', height: '13.5px' }} />
        <span>Send To</span>
      </button>

      {/* Sign off Button (new) */}
      <button
        onClick={() => handleSignOffIssue(issueId)}
        style={{ padding: '7px 14px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#0D9488', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(13,148,136,0.2)' }}
      >
        <CheckCircle2 style={{ width: '13.5px', height: '13.5px' }} />
        <span>Sign off</span>
      </button>

      {/* Submit Button */}
      <button
        onClick={() => handleSubmitIssue(issueId)}
        style={{ padding: '7px 14px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(5,150,105,0.2)' }}
      >
        <Send style={{ width: '13.5px', height: '13.5px' }} />
        <span>Submit</span>
      </button>

      {/* Save Button */}
      <button
        onClick={() => handleSaveIssue(issueId)}
        style={{ padding: '7px 14px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', backgroundColor: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 1px 3px rgba(37,99,235,0.2)' }}
      >
        <Save style={{ width: '13.5px', height: '13.5px' }} />
        <span>Save</span>
      </button>

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
            selectedIssue.isLocked ? (
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#92400E', backgroundColor: '#FEF3C7', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Lock style={{ width: '12px', height: '12px' }} />
                Locked by {selectedIssue.lockedBy?.name || 'Another User'} (Read-Only)
              </span>
            ) : (
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#D8001D', backgroundColor: '#FFF0F2', padding: '2px 10px', borderRadius: '9999px', border: '1px solid #FCA5A5' }}>
                Editing: {selectedIssue.id}
              </span>
            )
          )}


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

          {/* Download PDF Button */}
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

          {/* Download Word Button */}
          <button
            onClick={() => alert(`Downloading Word (.docx) Report for ${job?.fileName || job?.id || 'JOB-2026-881'}`)}
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
            <FileText style={{ width: '14px', height: '14px', color: '#1D4ED8' }} />
            <span>Download Word</span>
          </button>

          {/* Track Changes Button */}
          <button
            onClick={() => setIsIssueLogsModalOpen(true)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              color: isIssueLogsModalOpen ? '#ffffff' : '#D8001D',
              backgroundColor: isIssueLogsModalOpen ? '#D8001D' : '#ffffff',
              border: '1.5px solid #D8001D',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History style={{ width: '14px', height: '14px' }} />
            <span>Track Changes</span>
          </button>



        </div>
      </div>

      {/* DYNAMIC DESIGN WORKSPACE RENDERER */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          userSelect: (isDraggingSplitter1 || isDraggingSplitter2) ? 'none' : 'auto'
        }}
      >
        
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
                      <th style={{ padding: '12px 16px', fontWeight: '800', width: '90px' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: '800', width: '60px', textAlign: 'center' }}>Reorder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((item, idx) => {
                      const isExpanded = expandedIssueId === item.id;
                      return (
                        <React.Fragment key={item.id}>
                          <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: isExpanded ? '#FFF5F6' : 'transparent' }}>
                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                              <button
                                onClick={() => setExpandedIssueId(isExpanded ? null : item.id)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#D8001D' }}
                              >
                                {isExpanded ? <Minus style={{ width: '15px', height: '15px' }} /> : <Plus style={{ width: '15px', height: '15px' }} />}
                              </button>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0F172A' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span>{item.title}</span>
                                {item.isLocked && (
                                  <span style={{ fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                                    <Lock style={{ width: '9.5px', height: '9.5px' }} />
                                    LOCKED ({item.lockedBy?.name || 'In Use'})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{item.function}</td>
                            <td style={{ padding: '12px 16px', color: '#475569' }}>{item.processArea}</td>
                            <td style={{ padding: '12px 16px' }}>{renderCriticalityBadge(item.criticality)}</td>
                            <td style={{ padding: '12px 16px' }}>{renderStatusBadge(item.status)}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
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
                                  {item.isLocked ? renderLockedBanner(item) : renderActionToolbar(item.id)}
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
            {/* PANE 1: Master Issue Cards List */}
            {isPane1Collapsed ? (
              <div style={{
                width: '36px',
                minWidth: '36px',
                backgroundColor: '#F8FAFC',
                borderRight: '1px solid #CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '10px',
                gap: '16px',
                userSelect: 'none',
                flexShrink: 0
              }}>
                <button
                  onClick={() => setIsPane1Collapsed(false)}
                  title="Expand Master Issues List"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#ffffff',
                    color: '#2563EB',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PanelLeftOpen style={{ width: '14px', height: '14px' }} />
                </button>
                <div style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: '#475569',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap'
                }}>
                  MASTER LIST ({issues.length})
                </div>
              </div>
            ) : (
              <div style={{
                flexGrow: (isPane2Collapsed && isPane3Collapsed) ? 1 : 0,
                flexShrink: (isPane2Collapsed && isPane3Collapsed) ? 1 : 0,
                flexBasis: (isPane2Collapsed && isPane3Collapsed) ? 'auto' : `${pane1Width}%`,
                width: (isPane2Collapsed && isPane3Collapsed) ? 'auto' : `${pane1Width}%`,
                minWidth: '160px',
                maxWidth: (isPane2Collapsed && isPane3Collapsed) ? 'none' : '500px',
                borderRight: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Master Issues List ({issues.length})
                  </h3>
                  <button
                    onClick={() => setIsPane1Collapsed(true)}
                    title="Collapse Pane 1"
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      color: '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PanelLeftClose style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {issues.map(item => {
                    const isSelected = expandedIssueId === item.id;
                    const isLocked = !!item.isLocked;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setExpandedIssueId(isSelected ? null : item.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: isLocked ? (isSelected ? '#FFFBEB' : '#FFFDF5') : '#ffffff',
                          border: isSelected 
                            ? (isLocked ? '2px solid #D97706' : '2px solid #2563EB')
                            : (isLocked ? '1.5px solid #FCD34D' : '1px solid #E2E8F0'),
                          boxShadow: isSelected 
                            ? (isLocked ? '0 4px 12px rgba(217, 119, 6, 0.18)' : '0 4px 12px rgba(37,99,235,0.15)')
                            : '0 1px 3px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: isSelected ? (isLocked ? '#B45309' : '#2563EB') : '#64748B' }}>
                              {item.id}
                            </span>
                            {isLocked && (
                              <span style={{
                                fontSize: '9.5px',
                                fontWeight: '800',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                border: '1px solid #FDE68A',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                letterSpacing: '0.4px'
                              }}>
                                <Lock style={{ width: '9px', height: '9px' }} />
                                LOCKED
                              </span>
                            )}
                          </div>
                          {renderCriticalityBadge(item.criticality)}
                        </div>

                        <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', lineHeight: '1.3', margin: '0 0 6px 0' }}>
                          {item.title}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B' }}>
                          <span>{item.function}</span>
                          {renderStatusBadge(item.status)}
                        </div>

                        {/* Locked user badge on the card */}
                        {isLocked && (
                          <div style={{
                            marginTop: '8px',
                            padding: '5px 8px',
                            backgroundColor: '#FEF3C7',
                            borderRadius: '5px',
                            border: '1px dashed #F59E0B',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '10.5px'
                          }}>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: item.lockedBy?.avatarBg || '#7C3AED',
                              color: '#ffffff',
                              fontSize: '9px',
                              fontWeight: '800',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {item.lockedBy?.avatar || 'MV'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <span style={{ fontWeight: '700', color: '#92400E' }}>
                                {item.lockedBy?.name || 'Another User'}
                              </span>
                              <span style={{ color: '#B45309', marginLeft: '4px', fontSize: '10px' }}>
                                is working on this
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SPLITTER HANDLE 1 */}
            {!isPane1Collapsed && !isPane2Collapsed && (
              <div
                onMouseDown={(e) => { e.preventDefault(); setIsDraggingSplitter1(true); }}
                onMouseEnter={() => setHoveredSplitter(1)}
                onMouseLeave={() => setHoveredSplitter(null)}
                title="Click and drag to resize Pane 1 width"
                style={{
                  width: '6px',
                  backgroundColor: (isDraggingSplitter1 || hoveredSplitter === 1) ? '#3B82F6' : '#E2E8F0',
                  cursor: 'col-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                  zIndex: 20,
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '2px',
                  height: '24px',
                  borderRadius: '1px',
                  backgroundColor: (isDraggingSplitter1 || hoveredSplitter === 1) ? '#ffffff' : '#94A3B8'
                }} />
              </div>
            )}

            {/* PANE 2: Form Editor */}
            {isPane2Collapsed ? (
              <div style={{
                width: '36px',
                minWidth: '36px',
                backgroundColor: '#FAFAFA',
                borderRight: '1px solid #CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '10px',
                gap: '16px',
                userSelect: 'none',
                flexShrink: 0
              }}>
                <button
                  onClick={() => setIsPane2Collapsed(false)}
                  title="Expand Form Editor"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#ffffff',
                    color: '#2563EB',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PanelLeftOpen style={{ width: '14px', height: '14px' }} />
                </button>
                <div style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: '#475569',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap'
                }}>
                  FORM EDITOR
                </div>
              </div>
            ) : (
              <div style={{
                flexGrow: isPane3Collapsed ? 1 : 0,
                flexShrink: isPane3Collapsed ? 1 : 0,
                flexBasis: isPane3Collapsed ? 'auto' : `${pane2Width}%`,
                width: isPane3Collapsed ? 'auto' : `${pane2Width}%`,
                minWidth: '200px',
                borderRight: '1px solid #CBD5E1',
                backgroundColor: '#FAFAFA',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedIssue ? (
                      <>
                        <span>Form Editor: {selectedIssue.id}</span>
                        {selectedIssue.isLocked && (
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#92400E', backgroundColor: '#FEF3C7', padding: '1px 6px', borderRadius: '4px', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Lock style={{ width: '9.5px', height: '9.5px' }} />
                            LOCKED (READ-ONLY)
                          </span>
                        )}
                      </>
                    ) : (
                      "Select an Issue from Master List"
                    )}
                  </h3>
                  <button
                    onClick={() => setIsPane2Collapsed(true)}
                    title="Collapse Pane 2"
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      color: '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <PanelLeftClose style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                {selectedIssue ? (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedIssue.isLocked ? (
                      renderLockedBanner(selectedIssue)
                    ) : (
                      renderActionToolbar(selectedIssue.id)
                    )}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {renderFormFields(selectedIssue)}
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '12px', padding: '20px', textAlign: 'center' }}>
                    👈 Click any issue on the Master List to view &amp; edit its fields here while keeping live PDF preview open!
                  </div>
                )}
              </div>
            )}

            {/* SPLITTER HANDLE 2 */}
            {!isPane2Collapsed && !isPane3Collapsed && (
              <div
                onMouseDown={(e) => { e.preventDefault(); setIsDraggingSplitter2(true); }}
                onMouseEnter={() => setHoveredSplitter(2)}
                onMouseLeave={() => setHoveredSplitter(null)}
                title="Click and drag to resize Form Editor width"
                style={{
                  width: '6px',
                  backgroundColor: (isDraggingSplitter2 || hoveredSplitter === 2) ? '#3B82F6' : '#E2E8F0',
                  cursor: 'col-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                  zIndex: 20,
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '2px',
                  height: '24px',
                  borderRadius: '1px',
                  backgroundColor: (isDraggingSplitter2 || hoveredSplitter === 2) ? '#ffffff' : '#94A3B8'
                }} />
              </div>
            )}
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
                      <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: item.isLocked ? '#FFFDF5' : 'transparent' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0F172A' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>{item.title}</span>
                            {item.isLocked && (
                              <span style={{ fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Lock style={{ width: '9.5px', height: '9.5px' }} />
                                LOCKED
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>{item.function}</td>
                        <td style={{ padding: '14px 16px' }}>{renderCriticalityBadge(item.criticality)}</td>
                        <td style={{ padding: '14px 16px' }}>{renderStatusBadge(item.status)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setExpandedIssueId(item.id)}
                            style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800', color: item.isLocked ? '#92400E' : '#059669', backgroundColor: item.isLocked ? '#FEF3C7' : '#ECFDF5', border: item.isLocked ? '1px solid #FDE68A' : '1px solid #A7F3D0', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            {item.isLocked ? 'View Locked' : 'Edit Drawer'}
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
                  <div style={{ padding: '14px 20px', backgroundColor: selectedIssue.isLocked ? '#92400E' : '#065F46', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => setExpandedIssueId(null)} style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer' }}>
                        <ArrowLeft style={{ width: '18px', height: '18px' }} />
                      </button>
                      <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Slide-over Drawer: {selectedIssue.id}</span>
                        {selectedIssue.isLocked && (
                          <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px' }}>
                            READ-ONLY
                          </span>
                        )}
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
                      style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', backgroundColor: slideoverTab === 'metadata' ? (selectedIssue.isLocked ? '#92400E' : '#059669') : '#F1F5F9', color: slideoverTab === 'metadata' ? '#ffffff' : '#475569' }}
                    >
                      1. General Metadata
                    </button>
                    <button
                      onClick={() => setSlideoverTab('analysis')}
                      style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', backgroundColor: slideoverTab === 'analysis' ? (selectedIssue.isLocked ? '#92400E' : '#059669') : '#F1F5F9', color: slideoverTab === 'analysis' ? '#ffffff' : '#475569' }}
                    >
                      2. AI Analysis &amp; Cause
                    </button>
                    <button
                      onClick={() => setSlideoverTab('actions')}
                      style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '700', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', backgroundColor: slideoverTab === 'actions' ? (selectedIssue.isLocked ? '#92400E' : '#059669') : '#F1F5F9', color: slideoverTab === 'actions' ? '#ffffff' : '#475569' }}
                    >
                      3. Action Plan &amp; Approvals
                    </button>
                  </div>

                  {/* Tab Body */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {selectedIssue.isLocked ? (
                      renderLockedBanner(selectedIssue)
                    ) : (
                      renderActionToolbar(selectedIssue.id)
                    )}
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
                    {selectedIssue.isLocked ? (
                      renderLockedBanner(selectedIssue)
                    ) : (
                      renderActionToolbar(selectedIssue.id)
                    )}

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {tabbedStep === 1 && (
                        <>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: selectedIssue.isLocked ? '#92400E' : '#7C3AED', margin: 0, borderBottom: '1px solid #DDD6FE', paddingBottom: '6px' }}>
                            Step 1: General Metadata &amp; Categorization {selectedIssue.isLocked && "(Read-Only)"}
                          </h4>
                          {/* Title */}
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Issue Title</label>
                            <input
                              type="text"
                              disabled={selectedIssue.isLocked}
                              readOnly={selectedIssue.isLocked}
                              value={selectedIssue.title}
                              onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'title', e.target.value)}
                              style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: selectedIssue.isLocked ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: selectedIssue.isLocked ? '#F8FAFC' : '#ffffff', cursor: selectedIssue.isLocked ? 'not-allowed' : 'text' }}
                            />
                          </div>
                          {/* Function, Process Area, Criticality */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Criticality</label>
                              <select
                                disabled={selectedIssue.isLocked}
                                value={selectedIssue.criticality}
                                onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'criticality', e.target.value)}
                                style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: selectedIssue.isLocked ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: selectedIssue.isLocked ? '#F8FAFC' : '#ffffff', cursor: selectedIssue.isLocked ? 'not-allowed' : 'pointer' }}
                              >
                                <option value="Critical">Critical</option>
                                <option value="Major">Major</option>
                                <option value="Minor">Minor</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Function</label>
                              <select
                                disabled={selectedIssue.isLocked}
                                value={selectedIssue.function}
                                onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'function', e.target.value)}
                                style={{ width: '100%', height: '34px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: selectedIssue.isLocked ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: selectedIssue.isLocked ? '#F8FAFC' : '#ffffff', cursor: selectedIssue.isLocked ? 'not-allowed' : 'pointer' }}
                              >
                                <option value="IT">IT</option>
                                <option value="FinOps">FinOps</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Process Area</label>
                              <input
                                type="text"
                                disabled={selectedIssue.isLocked}
                                readOnly={selectedIssue.isLocked}
                                value={selectedIssue.processArea}
                                onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'processArea', e.target.value)}
                                style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '12px', borderRadius: '6px', border: selectedIssue.isLocked ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: selectedIssue.isLocked ? '#F8FAFC' : '#ffffff', cursor: selectedIssue.isLocked ? 'not-allowed' : 'text' }}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {tabbedStep === 2 && (
                        <>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: selectedIssue.isLocked ? '#92400E' : '#7C3AED', margin: 0, borderBottom: '1px solid #DDD6FE', paddingBottom: '6px' }}>
                            Step 2: AI Root Cause &amp; Financial Impact {selectedIssue.isLocked && "(Read-Only)"}
                          </h4>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Root Cause</label>
                            <textarea
                              rows={3}
                              disabled={selectedIssue.isLocked}
                              readOnly={selectedIssue.isLocked}
                              value={selectedIssue.rootCause}
                              onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'rootCause', e.target.value)}
                              style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: selectedIssue.isLocked ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: selectedIssue.isLocked ? '#F8FAFC' : '#ffffff', cursor: selectedIssue.isLocked ? 'not-allowed' : 'text', fontFamily: 'inherit' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Impact</label>
                            <textarea
                              rows={3}
                              disabled={selectedIssue.isLocked}
                              readOnly={selectedIssue.isLocked}
                              value={selectedIssue.impact}
                              onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'impact', e.target.value)}
                              style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: selectedIssue.isLocked ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: selectedIssue.isLocked ? '#F8FAFC' : '#ffffff', cursor: selectedIssue.isLocked ? 'not-allowed' : 'text', fontFamily: 'inherit' }}
                            />
                          </div>
                        </>
                      )}

                      {tabbedStep === 3 && (
                        <>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: selectedIssue.isLocked ? '#92400E' : '#7C3AED', margin: 0, borderBottom: '1px solid #DDD6FE', paddingBottom: '6px' }}>
                            Step 3: Remediation Recommendations &amp; Sign-off {selectedIssue.isLocked && "(Read-Only)"}
                          </h4>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Recommendation</label>
                            <textarea
                              rows={4}
                              disabled={selectedIssue.isLocked}
                              readOnly={selectedIssue.isLocked}
                              value={selectedIssue.recommendation}
                              onChange={(e) => handleIssueFieldChange(selectedIssue.id, 'recommendation', e.target.value)}
                              style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: selectedIssue.isLocked ? '1px solid #E2E8F0' : '1px solid #CBD5E1', backgroundColor: selectedIssue.isLocked ? '#F8FAFC' : '#ffffff', cursor: selectedIssue.isLocked ? 'not-allowed' : 'text', fontFamily: 'inherit' }}
                            />
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
                        <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: item.isLocked ? '#FFFDF5' : 'transparent' }}>
                          <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0F172A' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span>{item.title}</span>
                              {item.isLocked && (
                                <span style={{ fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Lock style={{ width: '9.5px', height: '9.5px' }} />
                                  LOCKED
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>{item.function}</td>
                          <td style={{ padding: '14px 16px' }}>{renderCriticalityBadge(item.criticality)}</td>
                          <td style={{ padding: '14px 16px' }}>{renderStatusBadge(item.status)}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => { setExpandedIssueId(item.id); setTabbedStep(1); }}
                              style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800', color: item.isLocked ? '#92400E' : '#7C3AED', backgroundColor: item.isLocked ? '#FEF3C7' : '#F3E8FF', border: item.isLocked ? '1px solid #FDE68A' : '1px solid #DDD6FE', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              {item.isLocked ? 'View Locked' : 'Step Wizard'}
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
        {/* PANE 3 / RIGHT COLUMN: LIVE HTML PDF-STYLE REPORT PREVIEW       */}
        {/* ============================================================== */}
        {designMode === '3pane' && isPane3Collapsed ? (
          <div style={{
            width: '36px',
            minWidth: '36px',
            backgroundColor: '#27272A',
            borderLeft: '1px solid #52525B',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '10px',
            gap: '16px',
            userSelect: 'none',
            flexShrink: 0
          }}>
            <button
              onClick={() => setIsPane3Collapsed(false)}
              title="Expand Report Preview"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                border: '1px solid #52525B',
                backgroundColor: '#3F3F46',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PanelLeftOpen style={{ width: '14px', height: '14px' }} />
            </button>
            <div style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: '10.5px',
              fontWeight: '800',
              color: '#A1A1AA',
              letterSpacing: '1px',
              whiteSpace: 'nowrap'
            }}>
              REPORT PREVIEW
            </div>
          </div>
        ) : (
          <div style={{
            flexGrow: designMode === '3pane' ? 1 : 0,
            flexShrink: 1,
            flexBasis: designMode === '3pane' ? 'auto' : '50%',
            width: designMode === '3pane' ? 'auto' : '50%',
            backgroundColor: '#52525B',
            padding: '24px 20px',
            overflowY: 'auto',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            {designMode === '3pane' && (
              <div style={{ width: '100%', maxWidth: '840px', display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button
                  onClick={() => setIsPane3Collapsed(true)}
                  title="Collapse Report Preview Pane"
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: '1px solid #71717A',
                    backgroundColor: '#3F3F46',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Collapse Preview</span>
                  <ChevronRight style={{ width: '13px', height: '13px' }} />
                </button>
              </div>
            )}
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
        )}

      </div>
      
      {/* Issue Logs Modal (Track Changes & Audit Trail) */}
      <IssueLogsModal
        isOpen={isIssueLogsModalOpen}
        report={job || { fileName: "MedTech Suzhou - Orthopedics Plant_AuditReport" }}
        onClose={() => setIsIssueLogsModalOpen(false)}
      />

    </div>
  );
}
