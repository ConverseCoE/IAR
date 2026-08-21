import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Search, RotateCcw, Plus, History, ShieldCheck, DollarSign,
  Filter, ArrowUpDown, MoreVertical, Edit2, ChevronDown, Check, X, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { mockDiscussionPointsNew, mockDiscussionPointsByReport } from '../data/reportingNewMockData';
import CreateIssueDrawerNew from '../components/CreateIssueDrawerNew';

export default function DiscussionPointsNewView({ 
  report, 
  initialFunction = 'All', 
  onBackToQueue,
  onOpenHistoryModal
}) {
  const getInitialPoints = (repObj) => {
    if (!repObj) return mockDiscussionPointsByReport["20260884"];

    // 1. Check if repObj has its own issuesList array
    if (repObj.issuesList && Array.isArray(repObj.issuesList) && repObj.issuesList.length > 0) {
      return repObj.issuesList.map((iss, idx) => ({
        id: iss.id?.replace('ISSUE-', '') || `${idx + 101}`,
        issueId: iss.id?.replace('ISSUE-', '') || `${idx + 101}`,
        header: iss.title || iss.header,
        title: iss.title || iss.header,
        criticality: iss.severity || iss.criticality || "Major",
        tech: iss.tech || "IT",
        functionType: iss.functionType || iss.tech || "IT",
        description: iss.description || `${iss.title} identified during ${repObj.fileName || repObj.engagement || 'audit'}.`,
        addedBy: iss.createdBy || "Rachel Green",
        lastUpdatedBy: iss.lastEditedBy || "Carlos Mendez",
        status: iss.status || "Manager Pending",
        updatedOn: iss.updatedOn || "2026-08-05 10:15 AM",
        rowNum: idx + 1
      }));
    }

    // 2. Check mockDiscussionPointsByReport by ID or reportId
    const repId = repObj.id || repObj.reportId || '';
    if (mockDiscussionPointsByReport[repId]) {
      return mockDiscussionPointsByReport[repId];
    }

    // 3. Match by fileName
    const matchByFile = Object.entries(mockDiscussionPointsByReport).find(([k, arr]) => 
      repObj.fileName && arr.some(p => p.description && p.description.toLowerCase().includes(repObj.fileName.toLowerCase()))
    );
    if (matchByFile) return matchByFile[1];

    return mockDiscussionPointsByReport["20260884"];
  };

  const [points, setPoints] = useState(() => getInitialPoints(report));

  useEffect(() => {
    setPoints(getInitialPoints(report));
  }, [report]);
  
  // Filter States
  const [techFilter, setTechFilter] = useState(initialFunction !== 'All' ? initialFunction : 'All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [critFilter, setCritFilter] = useState('All');
  const [addedByFilter, setAddedByFilter] = useState('All');
  const [updatedByFilter, setUpdatedByFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dropdown Open States for Filters (Matching Audit Queue design)
  const [openDropdown, setOpenDropdown] = useState(null); // 'tech', 'status', 'crit', 'addedBy', 'updatedBy'
  const filterToolbarRef = useRef(null);

  // Sort State
  const [sortField, setSortField] = useState('issueId');
  const [sortAsc, setSortAsc] = useState(true);

  // Active 3-Dots Row Menu State
  const [openRowMenuId, setOpenRowMenuId] = useState(null);
  const rowMenuRef = useRef(null);

  // Create & Edit Drawer state
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);

  // Premium SaaS Toast State
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const reportFileName = report ? (report.fileName || report.engagement) : "BiosenseWebster_Catheters_Audit";

  // Dynamic unique user lists for filters
  const uniqueAddedBy = Array.from(new Set(points.map(p => p.addedBy).filter(Boolean)));
  const uniqueUpdatedBy = Array.from(new Set(points.map(p => p.lastUpdatedBy).filter(Boolean)));

  // Calculate active filter count
  const activeFilterCount = (techFilter !== 'All' ? 1 : 0) +
    (statusFilter !== 'All' ? 1 : 0) +
    (critFilter !== 'All' ? 1 : 0) +
    (addedByFilter !== 'All' ? 1 : 0) +
    (updatedByFilter !== 'All' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);
  const isFilterActive = activeFilterCount > 0;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterToolbarRef.current && !filterToolbarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (rowMenuRef.current && !rowMenuRef.current.contains(event.target)) {
        setOpenRowMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Points
  const filteredPoints = points.filter(p => {
    const techVal = p.tech || p.functionType || '';
    if (techFilter !== 'All' && techVal.toLowerCase() !== techFilter.toLowerCase()) return false;
    if (statusFilter !== 'All' && (p.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (critFilter !== 'All' && (p.criticality || '').toLowerCase() !== critFilter.toLowerCase()) return false;
    if (addedByFilter !== 'All' && (p.addedBy || '').toLowerCase() !== addedByFilter.toLowerCase()) return false;
    if (updatedByFilter !== 'All' && (p.lastUpdatedBy || '').toLowerCase() !== updatedByFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (p.title || p.header || '').toLowerCase().includes(q) || 
                    (p.description || '').toLowerCase().includes(q) ||
                    (p.issueId || p.id || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    const valA = (a[sortField] || '').toString().toLowerCase();
    const valB = (b[sortField] || '').toString().toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleClearFilters = () => {
    setTechFilter('All');
    setStatusFilter('All');
    setCritFilter('All');
    setAddedByFilter('All');
    setUpdatedByFilter('All');
    setSearchQuery('');
    setOpenDropdown(null);
  };

  const handleSaveDiscussionPoint = (savedPoint) => {
    setPoints(prev => {
      const exists = prev.some(p => p.id === savedPoint.id);
      if (exists) {
        return prev.map(p => p.id === savedPoint.id ? savedPoint : p);
      }
      return [savedPoint, ...prev];
    });
    setEditingPoint(null);
    setIsCreateDrawerOpen(false);

    // Trigger Toast Notification
    setToastMessage({
      title: "Issue Saved Successfully",
      description: `Issue #${savedPoint.issueId || savedPoint.id} has been saved to the audit queue and synthesized with AI.`
    });
  };

  const handleOpenEdit = (point) => {
    setEditingPoint(point);
    setIsCreateDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingPoint(null);
    setIsCreateDrawerOpen(true);
  };

  // Criticality Pill Renderer matching Audit Queue table status pills
  const renderCriticalityPill = (crit) => {
    if (crit === 'Critical') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 9px 3px 5px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.2px',
          color: '#991B1B',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5'
        }}>
          <span style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle style={{ width: '10px', height: '10px', color: '#ffffff', strokeWidth: 2.5 }} />
          </span>
          <span>Critical</span>
        </span>
      );
    }

    if (crit === 'Major' || crit === 'High') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 9px 3px 5px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.2px',
          color: '#C2410C',
          backgroundColor: '#FFF7ED',
          border: '1px solid #FFEDD5'
        }}>
          <span style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#F97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }}></span>
          </span>
          <span>Major</span>
        </span>
      );
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 9px 3px 5px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.2px',
        color: '#475569',
        backgroundColor: '#F8FAFC',
        border: '1px solid #CBD5E1'
      }}>
        <span style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#94A3B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ffffff' }}></span>
        </span>
        <span>Minor</span>
      </span>
    );
  };

  const renderTechBadge = (techVal) => {
    const isIT = techVal === 'IT';
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 8px 3px 6px',
        borderRadius: '6px',
        backgroundColor: isIT ? '#EFF6FF' : '#ECFDF5',
        color: isIT ? '#2563EB' : '#059669',
        border: isIT ? '1px solid #BFDBFE' : '1px solid #A7F3D0',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        {isIT ? <ShieldCheck style={{ width: '13px', height: '13px', flexShrink: 0 }} /> : <DollarSign style={{ width: '13px', height: '13px', flexShrink: 0 }} />}
        <span>{techVal || 'IT'}</span>
      </span>
    );
  };

  const renderStatusBadge = (status) => {
    let bg = '#F1F5F9'; let text = '#475569'; let border = '#CBD5E1';

    if (status === 'TC Pending') { bg = '#FEF3C7'; text = '#92400E'; border = '#FDE68A'; }
    else if (status === 'Manager Pending') { bg = '#EFF6FF'; text = '#1D4ED8'; border = '#BFDBFE'; }
    else if (status === 'Director Pending') { bg = '#F5F3FF'; text = '#7C3AED'; border = '#DDD6FE'; }
    else if (status === 'VP Pending') { bg = '#E0E7FF'; text = '#3730A3'; border = '#C7D2FE'; }
    else if (status === 'Completed') { bg = '#F0FDF4'; text = '#15803D'; border = '#BBF2D0'; }

    return (
      <span style={{
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 10px',
        borderRadius: '9999px',
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        display: 'inline-block',
        whiteSpace: 'nowrap'
      }}>
        {status}
      </span>
    );
  };

  // Generic Filter Dropdown Component without label prefix
  const renderFilterDropdown = (id, options, currentValue, onSelect, defaultLabel) => {
    const isOpen = openDropdown === id;
    const isSelected = currentValue !== 'All';

    return (
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            height: '36px',
            backgroundColor: '#ffffff',
            border: isOpen ? '1px solid #94A3B8' : isSelected ? '1px solid #D8001D' : '1px solid #CBD5E1',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            color: isSelected ? '#D8001D' : '#1E293B',
            boxShadow: isOpen ? '0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
        >
          <Filter style={{ width: '13px', height: '13px', color: isSelected ? '#D8001D' : '#64748B' }} />
          <span>{currentValue === 'All' ? defaultLabel : currentValue}</span>
          <ChevronDown style={{
            width: '14px',
            height: '14px',
            color: '#64748B',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} />
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            minWidth: '180px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.06)',
            padding: '6px',
            animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ padding: '2px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {options.map((opt) => {
                const optVal = typeof opt === 'object' ? opt.value : opt;
                const optLabel = typeof opt === 'object' ? opt.label : opt;
                const isChecked = currentValue === optVal;

                return (
                  <div
                    key={optVal}
                    onClick={() => {
                      onSelect(optVal);
                      setOpenDropdown(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: isChecked ? '#FFF5F6' : 'transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: isChecked ? '700' : '500', color: isChecked ? '#D8001D' : '#334155' }}>
                      {optLabel}
                    </span>
                    {isChecked && <Check style={{ width: '13px', height: '13px', color: '#D8001D' }} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--slate-50)', position: 'relative' }}>
      
      {/* Title Sub-Header Banner */}
      <div className="job-queue-title-banner" style={{ padding: '12px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Header Back Button: Icon-only with border & background */}
          <button
            onClick={onBackToQueue}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
            title="Back to Audit Queue"
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
          </button>
          
          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.3)', height: '20px' }}></div>

          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
            {reportFileName} - Issues
          </h2>
        </div>
      </div>

      {/* Main Content Area (Single-Row Filters + Borderless Table) */}
      <div className="main-container">
        <div className="full-width-queue">

          {/* Slick Single-Row Filter Toolbar */}
          <div ref={filterToolbarRef} className="single-row-filter-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            
            {/* 1. Tech Filter */}
            {renderFilterDropdown(
              'tech',
              ['All', 'IT', 'FinOps'],
              techFilter,
              setTechFilter,
              'All Tech'
            )}

            {/* 2. Status Filter */}
            {renderFilterDropdown(
              'status',
              ['All', 'TC Pending', 'Manager Pending', 'Director Pending', 'VP Pending', 'Completed'],
              statusFilter,
              setStatusFilter,
              'All Statuses'
            )}

            {/* 3. Criticality Filter */}
            {renderFilterDropdown(
              'crit',
              ['All', 'Critical', 'Major', 'Minor'],
              critFilter,
              setCritFilter,
              'All Criticalities'
            )}

            {/* 4. Added By Filter */}
            {renderFilterDropdown(
              'addedBy',
              ['All', ...uniqueAddedBy],
              addedByFilter,
              setAddedByFilter,
              'All Added By'
            )}

            {/* 5. Updated By Filter */}
            {renderFilterDropdown(
              'updatedBy',
              ['All', ...uniqueUpdatedBy],
              updatedByFilter,
              setUpdatedByFilter,
              'All Updated By'
            )}

            {/* Search Input (Synced with Audit Queue focus state) */}
            <div className="search-input-wrapper search-subtle-focus" style={{ flex: '1 1 200px' }}>
              <Search style={{ width: '14px', height: '14px', color: '#94A3B8', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search issue title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-field-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', color: '#94A3B8' }}
                >
                  <X style={{ width: '12px', height: '12px' }} />
                </button>
              )}
            </div>

            {/* Clear Filters Button (Shown ONLY when active filters exist) */}
            {isFilterActive && (
              <button
                onClick={handleClearFilters}
                className="btn btn-secondary"
                style={{
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFF1F2',
                  color: '#D8001D',
                  border: '1px solid #FECDD3',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(216, 0, 29, 0.08)',
                  transition: 'all 0.2s ease'
                }}
                title="Clear all active filters"
              >
                <RotateCcw style={{ width: '12px', height: '12px', color: '#D8001D' }} />
                <span>Clear Filters</span>
                <span style={{
                  backgroundColor: '#D8001D',
                  color: '#ffffff',
                  fontSize: '10px',
                  borderRadius: '10px',
                  padding: '0 5px',
                  fontWeight: '700'
                }}>
                  {activeFilterCount}
                </span>
              </button>
            )}

            {/* Create Issue Button */}
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary"
              style={{
                height: '36px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#D8001D',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(216, 0, 29, 0.2)'
              }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              <span>Create Issue</span>
            </button>

          </div>

          {/* Borderless Table Container */}
          <div className="table-card-container">
            <div className="table-scroll-body">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('issueId')} style={{ cursor: 'pointer', width: '80px' }}>
                      <div className="th-content">
                        <span>ID</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('title')} style={{ cursor: 'pointer', minWidth: '200px' }}>
                      <div className="th-content">
                        <span>Issue Title</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('criticality')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Criticality</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('tech')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Tech</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th style={{ minWidth: '320px', maxWidth: '460px' }}>Issue Description</th>
                    <th onClick={() => handleSort('addedBy')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Added By</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('lastUpdatedBy')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Updated By</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Status</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th style={{ width: '40px', padding: '16px 12px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPoints.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                        <Filter style={{ width: '36px', height: '36px', color: '#CBD5E1', margin: '0 auto 8px' }} />
                        <p style={{ fontWeight: '600', color: '#334155' }}>No issues matched your filters</p>
                        <p style={{ fontSize: '11px', color: '#94A3B8' }}>Try clearing your search query or filter selections.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPoints.map((point) => (
                      <tr
                        key={point.id}
                        onClick={() => handleOpenEdit(point)}
                        className="table-row-interactive"
                        style={{ cursor: 'pointer' }}
                      >
                        {/* 1. Issue ID (Numeric format without prefix) */}
                        <td style={{ padding: '10px 18px', fontSize: '12.5px', fontWeight: '700', color: '#D8001D' }}>
                          {point.issueId || point.id}
                        </td>

                        {/* 2. Issue Title */}
                        <td style={{ padding: '10px 18px' }}>
                          <span className="file-name-text" style={{ color: '#0F172A', fontWeight: '800', fontSize: '13px' }}>
                            {point.title || point.header}
                          </span>
                        </td>

                        {/* 3. Criticality Pill (Icon-based non-filled border-based pill UI) */}
                        <td style={{ padding: '10px 18px' }}>
                          {renderCriticalityPill(point.criticality)}
                        </td>

                        {/* 4. Tech Badge */}
                        <td style={{ padding: '10px 18px' }}>
                          {renderTechBadge(point.tech || point.functionType)}
                        </td>

                        {/* 5. Issue Description (Spacious Meaningful Width) */}
                        <td style={{ fontSize: '12.5px', color: '#334155', minWidth: '320px', maxWidth: '460px', lineHeight: '1.45', padding: '10px 18px' }}>
                          {point.description}
                        </td>

                        {/* 6. Added By */}
                        <td style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: '600', padding: '10px 18px', whiteSpace: 'nowrap' }}>
                          {point.addedBy}
                        </td>

                        {/* 7. Updated By */}
                        <td style={{ fontSize: '12.5px', color: '#475569', padding: '10px 18px', whiteSpace: 'nowrap' }}>
                          {point.lastUpdatedBy}
                        </td>

                        {/* 8. Status */}
                        <td style={{ padding: '10px 18px' }}>
                          {renderStatusBadge(point.status)}
                        </td>

                        {/* 9. 3-Dots More Options Menu */}
                        <td style={{ width: '40px', padding: '10px 12px', textAlign: 'right', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenRowMenuId(openRowMenuId === point.id ? null : point.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                color: '#94A3B8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="More Options"
                            >
                              <MoreVertical style={{ width: '16px', height: '16px' }} />
                            </button>

                            {openRowMenuId === point.id && (
                              <div
                                ref={rowMenuRef}
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  zIndex: 100,
                                  backgroundColor: '#ffffff',
                                  borderRadius: '8px',
                                  border: '1px solid #CBD5E1',
                                  boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.15)',
                                  padding: '4px',
                                  minWidth: '140px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px'
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenRowMenuId(null);
                                    handleOpenEdit(point);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '7px 10px',
                                    fontSize: '12px',
                                    color: '#334155',
                                    fontWeight: '600',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'left'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <Edit2 style={{ width: '13px', height: '13px', color: '#2563EB' }} />
                                  <span>Edit Issue</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenRowMenuId(null);
                                    onOpenHistoryModal && onOpenHistoryModal(report);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '7px 10px',
                                    fontSize: '12px',
                                    color: '#334155',
                                    fontWeight: '600',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'left'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <History style={{ width: '13px', height: '13px', color: '#6366F1' }} />
                                  <span>View History</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Create / Edit Discussion Point Overlay Drawer */}
      <CreateIssueDrawerNew
        isOpen={isCreateDrawerOpen}
        onClose={() => {
          setIsCreateDrawerOpen(false);
          setEditingPoint(null);
        }}
        onSaveDiscussionPoint={handleSaveDiscussionPoint}
        defaultFunction={techFilter !== 'All' ? techFilter : 'IT'}
        initialData={editingPoint}
      />

      {/* Embedded CSS Keyframes for Toast Animations */}
      <style>{`
        @keyframes slideUpToast {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes toastPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>

      {/* Premium Enterprise SaaS Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            minWidth: '380px',
            maxWidth: '450px',
            backgroundColor: '#0F172A',
            color: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #10B981',
            boxShadow: '0 14px 36px rgba(15, 23, 42, 0.45), 0 0 24px rgba(16, 185, 129, 0.25)',
            animation: 'slideUpToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#064E3B',
              border: '1.5px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              animation: 'toastPulse 2s infinite'
            }}>
              <CheckCircle2 style={{ width: '18px', height: '18px', color: '#34D399' }} />
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '0.2px' }}>
                {toastMessage.title}
              </h4>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#94A3B8', lineHeight: '1.45' }}>
                {toastMessage.description}
              </p>
            </div>

            <button
              onClick={() => setToastMessage(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
              title="Dismiss notification"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Toast Countdown Progress Bar */}
          <div style={{ width: '100%', height: '3px', backgroundColor: '#1E293B', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              backgroundColor: '#10B981',
              animation: 'toastProgress 4.5s linear forwards'
            }} />
          </div>
        </div>
      )}

    </div>
  );
}
