import React, { useState, useRef, useEffect } from 'react';
import {
  Search, RotateCcw, Filter, ArrowUpDown, Clock,
  FileText, ChevronRight, ChevronDown, Check, X,
  Plus, MessageSquare, PlayCircle, ShieldCheck, Shield,
  UserCheck, Users, AlertCircle, CheckCircle, GitCommit, Eye, User, Layers, ArrowRight, CheckCircle2, Edit2
} from 'lucide-react';
import { mockReportingNewJobs } from '../data/reportingNewMockData';
import CreateIssueDrawerNew from '../components/CreateIssueDrawerNew';

const STATUS_OPTIONS = [
  { id: 'Not Started', label: 'Not Started', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
  { id: 'In Progress', label: 'In Progress', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  { id: 'Completed', label: 'Completed', color: '#15803D', bg: '#F0FDF4', border: '#BBF2D0' }
];

const formatUSDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const cleanStr = dateTimeStr.replace(' ', 'T');
  const dateObj = new Date(cleanStr);
  if (isNaN(dateObj.getTime())) return dateTimeStr;

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `${formattedDate}, ${formattedTime}`;
};

export default function ReportingNewQueueView({
  selectedJobId,
  onSelectJob,
  viewMode = 'default',
  userRole = 'manager',
  onOpenDiscussionPoints,
  onOpenCreateIssue,
  onWorkOnReport,
  onOpenHistory
}) {
  const isAuditor = userRole === 'auditor';
  const [jobs, setJobs] = useState(mockReportingNewJobs);

  // Concept 2 Granular Issue Lineage Tab Filter State
  const [concept2TabFilter, setConcept2TabFilter] = useState('all');

  // Direct Create Issue Drawer State for Auditor 'Not Started' Jobs
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [selectedJobForIssue, setSelectedJobForIssue] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleOpenCreateForJob = (job) => {
    if (onOpenCreateIssue) {
      onOpenCreateIssue(job);
    } else {
      setSelectedJobForIssue(job);
      setIsCreateDrawerOpen(true);
    }
  };

  const handleSaveDiscussionPoint = (savedPoint) => {
    if (selectedJobForIssue) {
      setJobs(prev => prev.map(j => {
        if (j.id === selectedJobForIssue.id) {
          return {
            ...j,
            status: 'In Progress',
            subStatus: 'Audit Report In Progress',
            issuesList: [...(j.issuesList || []), savedPoint]
          };
        }
        return j;
      }));
    }
    setIsCreateDrawerOpen(false);
    setSelectedJobForIssue(null);

    setToastMessage({
      title: "Issue Saved Successfully",
      description: `Issue #${savedPoint.issueId || savedPoint.id} has been saved to the audit queue and synthesized with AI.`
    });
  };

  // Filters State
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [personaFilterTab, setPersonaFilterTab] = useState('all'); // 'all', 'pending', 'contributions'
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Expanded Row State for 'expand-action' mode
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Sort State
  const [sortField, setSortField] = useState('lastUpdated');
  const [sortAsc, setSortAsc] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSubStatus = (job) => {
    if (job.subStatus) return job.subStatus;
    const s = (job.status || '').toLowerCase();
    if (s === 'not started') return 'Not Started';
    if (s === 'completed') return 'Executive Report Completed';
    return 'Audit Report In Progress';
  };

  const getPersonaAuditState = (job, role) => {
    const issues = job.issuesList || [];
    const roleLower = (role || 'manager').toLowerCase();

    const pendingIssues = issues.filter(iss => {
      if (roleLower === 'auditor') return iss.currentRoleTarget === 'auditor' || iss.status === 'Drafting';
      if (roleLower === 'team-coordinator') return iss.currentRoleTarget === 'team-coordinator' || iss.status === 'In Review';
      if (roleLower === 'manager') return iss.currentRoleTarget === 'manager' || iss.status === 'Manager Review' || iss.status === 'Pending Sign-Off';
      if (roleLower === 'director') return iss.currentRoleTarget === 'director' || iss.status === 'Director Sign-Off' || iss.status === 'In Executive Review';
      if (roleLower === 'vp') return iss.currentRoleTarget === 'vp' || iss.status === 'VP Review' || iss.status === 'Pending Executive';
      return iss.currentRoleTarget === roleLower;
    });

    const myContributions = issues.filter(iss => {
      if (roleLower === 'auditor') return iss.createdRole === 'auditor' || iss.createdBy.includes('Rachel') || iss.createdBy.includes('Carlos');
      return true;
    });

    const isPendingWithMe = pendingIssues.length > 0 || (roleLower === 'auditor' && job.status === 'Not Started');
    const isMyContribution = myContributions.length > 0;

    return {
      isPendingWithMe,
      pendingCount: pendingIssues.length || (roleLower === 'auditor' && job.status === 'Not Started' ? 1 : 0),
      isMyContribution,
      pendingIssues,
      myContributions
    };
  };

  // Counts for Persona Hub
  const pendingWithMeCount = jobs.filter(j => getPersonaAuditState(j, userRole).isPendingWithMe).length;
  const myContributionsCount = jobs.filter(j => getPersonaAuditState(j, userRole).isMyContribution).length;

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    if (viewMode === 'issue-cards' && concept2TabFilter !== 'all') {
      if (concept2TabFilter === 'in-progress' && job.status !== 'In Progress') return false;
      if (concept2TabFilter === 'not-started' && job.status !== 'Not Started') return false;
      if (concept2TabFilter === 'completed' && job.status !== 'Completed') return false;
    }

    if (selectedStatuses.length > 0 && !selectedStatuses.includes(job.status)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = job.id.toLowerCase().includes(q) ||
        (job.engagement && job.engagement.toLowerCase().includes(q)) ||
        job.fileName.toLowerCase().includes(q) ||
        (job.subStatus && job.subStatus.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (viewMode === 'persona-lens') {
      const pState = getPersonaAuditState(job, userRole);
      if (personaFilterTab === 'pending' && !pState.isPendingWithMe) return false;
      if (personaFilterTab === 'contributions' && !pState.isMyContribution) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortField === 'lastUpdated') {
      const dateA = new Date((a.lastUpdated || '').replace(' ', 'T')).getTime() || 0;
      const dateB = new Date((b.lastUpdated || '').replace(' ', 'T')).getTime() || 0;
      return sortAsc ? dateA - dateB : dateB - dateA;
    }
    let valA = sortField === 'engagement' ? a.fileName : sortField === 'subStatus' ? getSubStatus(a) : a[sortField];
    let valB = sortField === 'engagement' ? b.fileName : sortField === 'subStatus' ? getSubStatus(b) : b[sortField];
    valA = (valA || '').toString().toLowerCase();
    valB = (valB || '').toString().toLowerCase();
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

  const handleToggleStatus = (statusId) => {
    if (selectedStatuses.includes(statusId)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== statusId));
    } else {
      setSelectedStatuses([...selectedStatuses, statusId]);
    }
  };

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery('');
  };

  const isFilterActive = selectedStatuses.length > 0 || searchQuery.trim() !== '';
  const activeFilterCount = selectedStatuses.length + (searchQuery.trim() ? 1 : 0);

  const renderStatusPill = (statusText) => {
    const s = (statusText || '').toLowerCase();
    if (s === 'completed') {
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
          color: '#15803D',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF2D0'
        }}>
          <span style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#22C55E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Check style={{ width: '10px', height: '10px', color: '#ffffff', strokeWidth: 3 }} />
          </span>
          <span>Completed</span>
        </span>
      );
    }

    if (s === 'in progress') {
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
          color: '#1D4ED8',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE'
        }}>
          <span style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }}></span>
          </span>
          <span>In Progress</span>
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
        <span>Not Started</span>
      </span>
    );
  };

  const renderSubStatusPill = (job) => {
    const sub = getSubStatus(job);
    let color = '#475569';
    let bg = '#F8FAFC';
    let border = '#E2E8F0';

    if (sub.includes('Completed')) {
      color = '#15803D';
      bg = '#F0FDF4';
      border = '#BBF2D0';
    } else if (sub.includes('In Progress')) {
      color = '#1D4ED8';
      bg = '#EFF6FF';
      border = '#BFDBFE';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: '5px',
        fontSize: '10.5px',
        fontWeight: '700',
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`
      }}>
        {sub}
      </span>
    );
  };

  const getColSpanCount = () => {
    if (viewMode === 'default') return 6;
    if (viewMode === 'with-substatus') return 7;
    if (viewMode === 'inline-action') return 5;
    if (viewMode === 'expand-action') return 5;
    if (viewMode === 'persona-lens') return 7;
    if (viewMode === 'issue-cards') return 6;
    if (viewMode === 'enhanced-lineage') return 7;
    if (viewMode === 'roster-matrix') return 7;
    return 6;
  };

  return (
    <div className="full-width-queue">

      {/* Concept 2 Granular Issue Lineage Tab-Based Filter Bar */}
      {viewMode === 'issue-cards' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          marginBottom: '14px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'in-progress', label: 'In Progress', count: jobs.filter(j => j.status === 'In Progress').length },
            { id: 'not-started', label: 'Not Started', count: jobs.filter(j => j.status === 'Not Started').length },
            { id: 'completed', label: 'Completed', count: jobs.filter(j => j.status === 'Completed').length },
            { id: 'all', label: 'ALL', count: jobs.length }
          ].map(tab => {
            const isActive = concept2TabFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setConcept2TabFilter(tab.id)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: isActive ? '800' : '600',
                  color: isActive ? '#D8001D' : '#475569',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  border: isActive ? '1px solid #FECDD3' : '1px solid transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isActive ? '0 1px 3px rgba(216, 0, 29, 0.12)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#F1F5F9';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: isActive ? '#ffffff' : '#64748B',
                  backgroundColor: isActive ? '#D8001D' : '#E2E8F0',
                  borderRadius: '10px',
                  padding: '1px 7px',
                  lineHeight: '1.2'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Slick Single-Row Filter Toolbar */}
      <div className="single-row-filter-panel" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>

        {/* Premium Multi-Select Status Filter */}
        <div ref={statusDropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              height: '36px',
              backgroundColor: '#ffffff',
              border: isStatusDropdownOpen ? '1px solid #94A3B8' : '1px solid #CBD5E1',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              color: '#1E293B',
              boxShadow: isStatusDropdownOpen ? '0 1px 3px rgba(0, 0, 0, 0.08)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
          >
            <Filter style={{ width: '13px', height: '13px', color: selectedStatuses.length > 0 ? '#D8001D' : '#64748B' }} />
            <span>
              {selectedStatuses.length === 0
                ? 'All Statuses'
                : selectedStatuses.length === 1
                  ? selectedStatuses[0]
                  : `${selectedStatuses.length} Selected`}
            </span>
            {selectedStatuses.length > 0 && (
              <span style={{
                backgroundColor: '#D8001D',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: '700',
                borderRadius: '10px',
                padding: '1px 6px',
                lineHeight: '1.2'
              }}>
                {selectedStatuses.length}
              </span>
            )}
            <ChevronDown style={{
              width: '14px',
              height: '14px',
              color: '#64748B',
              transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} />
          </button>

          {/* Popover Dropdown Menu */}
          {isStatusDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 100,
              minWidth: '190px',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.06)',
              padding: '6px',
              animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ padding: '2px 0' }}>
                {STATUS_OPTIONS.map((opt) => {
                  const isChecked = selectedStatuses.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleToggleStatus(opt.id)}
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
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          border: isChecked ? '1.5px solid #D8001D' : '1.5px solid #CBD5E1',
                          backgroundColor: isChecked ? '#D8001D' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}>
                          {isChecked && <Check style={{ width: '11px', height: '11px', color: '#ffffff', strokeWidth: 3 }} />}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: isChecked ? '700' : '500', color: isChecked ? '#D8001D' : '#334155' }}>
                          {opt.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="search-input-wrapper search-subtle-focus">
          <Search style={{ width: '14px', height: '14px', color: '#94A3B8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search Job ID, engagement..."
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
      </div>

      {/* Concept 1: Persona Lens Work Hub Bar */}
      {viewMode === 'persona-lens' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '14px 0 6px 0',
          padding: '10px 14px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
            <UserCheck style={{ width: '15px', height: '15px', color: '#D8001D' }} />
            <span>WORKLOAD LENS ({userRole.toUpperCase()}):</span>
          </span>

          <button
            type="button"
            onClick={() => setPersonaFilterTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: personaFilterTab === 'all' ? '1px solid #0F172A' : '1px solid #CBD5E1',
              backgroundColor: personaFilterTab === 'all' ? '#0F172A' : '#ffffff',
              color: personaFilterTab === 'all' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>⚪ All Audits</span>
            <span style={{ backgroundColor: personaFilterTab === 'all' ? '#334155' : '#F1F5F9', padding: '1px 6px', borderRadius: '10px', fontSize: '10.5px' }}>{jobs.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setPersonaFilterTab('pending')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: personaFilterTab === 'pending' ? '1px solid #D97706' : '1px solid #FDE68A',
              backgroundColor: personaFilterTab === 'pending' ? '#FFFBEB' : '#ffffff',
              color: '#B45309',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: personaFilterTab === 'pending' ? '0 1px 3px rgba(217, 119, 6, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertCircle style={{ width: '13px', height: '13px', color: '#D97706' }} />
            <span>🔴 Action Required / Pending With Me</span>
            <span style={{ backgroundColor: '#FDE68A', color: '#92400E', padding: '1px 7px', borderRadius: '10px', fontSize: '10.5px', fontWeight: '800' }}>
              {pendingWithMeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPersonaFilterTab('contributions')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              border: personaFilterTab === 'contributions' ? '1px solid #2563EB' : '1px solid #BFDBFE',
              backgroundColor: personaFilterTab === 'contributions' ? '#EFF6FF' : '#ffffff',
              color: '#1D4ED8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle style={{ width: '13px', height: '13px', color: '#2563EB' }} />
            <span>🔵 My Contributions (I Worked On)</span>
            <span style={{ backgroundColor: '#BFDBFE', color: '#1E40AF', padding: '1px 7px', borderRadius: '10px', fontSize: '10.5px', fontWeight: '800' }}>
              {myContributionsCount}
            </span>
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="table-card-container">
        <div className="table-scroll-body">
          <table>
            <thead>
              <tr>
                {/* 1. Job ID */}
                {['default', 'persona-lens', 'roster-matrix', 'enhanced-lineage'].includes(viewMode) && (
                  <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                    <div className="th-content">
                      <span>Job ID</span>
                      <ArrowUpDown className="th-sort-icon" />
                    </div>
                  </th>
                )}

                {/* 2. Engagement Audit */}
                <th onClick={() => handleSort('engagement')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Engagement Audit</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>

                {/* 3. Status */}
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Status</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>

                {/* 4. Custom Middle Columns */}
                {viewMode === 'with-substatus' && (
                  <th onClick={() => handleSort('subStatus')} style={{ cursor: 'pointer' }}>
                    <div className="th-content">
                      <span>Sub-Status</span>
                      <ArrowUpDown className="th-sort-icon" />
                    </div>
                  </th>
                )}

                {viewMode === 'persona-lens' && (
                  <th style={{ minWidth: '220px' }}>
                    <span>Persona Workload Status</span>
                  </th>
                )}

                {['issue-cards', 'enhanced-lineage'].includes(viewMode) && (
                  <th style={{ minWidth: '240px' }}>
                    <span>Issue Lineage & Ownership</span>
                  </th>
                )}

                {viewMode === 'roster-matrix' && (
                  <th style={{ minWidth: '240px' }}>
                    <span>Stakeholder Roster Matrix</span>
                  </th>
                )}

                {/* 5. Time in Queue */}
                <th onClick={() => handleSort('aging')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Time in Queue</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>

                {/* 6. Last Updated */}
                <th onClick={() => handleSort('lastUpdated')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Last Updated</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>

                {/* 7. Action / Chevron Header */}
                {['inline-action', 'persona-lens'].includes(viewMode) ? (
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>
                    <span>Actions</span>
                  </th>
                ) : (
                  <th style={{ width: '40px', padding: '16px 12px' }}></th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={getColSpanCount()} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <Filter style={{ width: '36px', height: '36px', color: '#CBD5E1', margin: '0 auto 8px' }} />
                    <p style={{ fontWeight: '600', color: '#334155' }}>No reporting jobs matched your filters</p>
                    <p style={{ fontSize: '11px', color: '#94A3B8' }}>Try clearing your search query or status filters.</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  const isExpanded = expandedRowId === job.id;
                  const pState = getPersonaAuditState(job, userRole);
                  const isExecEligible = [
                    'Audit Report Completed',
                    'Executive Report In Progress',
                    'Executive Report Completed'
                  ].includes(job.subStatus || (job.status === 'Completed' ? 'Executive Report Completed' : ''));

                  return (
                    <React.Fragment key={job.id}>
                      <tr
                        onClick={() => {
                          if (['expand-action', 'issue-cards', 'enhanced-lineage'].includes(viewMode)) {
                            setExpandedRowId(isExpanded ? null : job.id);
                          } else if (viewMode !== 'inline-action') {
                            onSelectJob(job.id);
                          }
                        }}
                        className={`table-row-interactive ${isSelected ? 'active-selected' : ''}`}
                        style={{ cursor: viewMode === 'inline-action' ? 'default' : 'pointer' }}
                      >
                        {/* 1. Job ID */}
                        {['default', 'persona-lens', 'roster-matrix', 'enhanced-lineage'].includes(viewMode) && (
                          <td style={{ padding: '10px 18px', fontSize: '12.5px', fontWeight: '700', color: '#D8001D' }}>
                            {job.id}
                          </td>
                        )}

                        {/* 2. Engagement Audit */}
                        <td style={{ padding: '10px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {viewMode !== 'default' && (
                              <div className="file-icon-box" style={{ flexShrink: 0 }}>
                                <FileText style={{ width: '16px', height: '16px' }} />
                              </div>
                            )}
                            <span className="file-name-text" style={{ color: '#D8001D', fontWeight: '800', fontSize: '13px' }}>
                              {job.fileName || job.engagement}
                            </span>
                          </div>
                        </td>

                        {/* 3. Status Column */}
                        <td style={{ padding: '10px 18px' }}>
                          {renderStatusPill(job.status)}
                        </td>

                        {/* 4. Custom Mode Columns */}
                        {viewMode === 'with-substatus' && (
                          <td style={{ padding: '10px 18px' }}>
                            {renderSubStatusPill(job)}
                          </td>
                        )}

                        {viewMode === 'persona-lens' && (
                          <td style={{ padding: '10px 18px' }}>
                            {pState.isPendingWithMe ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: '#FFFBEB',
                                color: '#B45309',
                                border: '1px solid #FDE68A'
                              }}>
                                <AlertCircle style={{ width: '13px', height: '13px', color: '#D97706' }} />
                                <span>Action Needed ({pState.pendingCount} Item)</span>
                              </span>
                            ) : pState.isMyContribution ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                border: '1px solid #BFDBFE'
                              }}>
                                <CheckCircle style={{ width: '13px', height: '13px', color: '#2563EB' }} />
                                <span>You Contributed</span>
                              </span>
                            ) : (
                              <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: '500' }}>
                                Pending with {job.currentQueue}
                              </span>
                            )}
                          </td>
                        )}

                        {['issue-cards', 'enhanced-lineage'].includes(viewMode) && (
                          <td style={{ padding: '10px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Layers style={{ width: '15px', height: '15px', color: '#6366F1' }} />
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                                {job.issuesList?.length || 0} Issues Tracked
                              </span>
                              <span style={{ fontSize: '10.5px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                {isExpanded ? 'Hide Lineage ▲' : 'View Lineage ▼'}
                              </span>
                            </div>
                          </td>
                        )}

                        {viewMode === 'roster-matrix' && (
                          <td style={{ padding: '10px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {(job.roster || []).slice(0, 4).map((m, idx) => (
                                <div
                                  key={idx}
                                  title={`${m.name} (${m.role}): ${m.status}`}
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    backgroundColor: idx === 0 ? '#DBEAFE' : idx === 1 ? '#FEF3C7' : idx === 2 ? '#E0E7FF' : '#F3E8FF',
                                    color: idx === 0 ? '#1E40AF' : idx === 1 ? '#92400E' : idx === 2 ? '#3730A3' : '#6B21A8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    border: '1.5px solid #ffffff',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {m.avatar}
                                </div>
                              ))}
                              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginLeft: '4px' }}>
                                Hand-off: {job.currentOwner}
                              </span>
                            </div>
                          </td>
                        )}

                        {/* 5. Time in Queue */}
                        <td style={{ fontSize: '12.5px', padding: '10px 18px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: '700' }}>
                            <Clock style={{ width: '13px', height: '13px', color: '#D8001D' }} />
                            <span>{job.aging}</span>
                          </div>
                        </td>

                        {/* 6. Last Updated */}
                        <td style={{ fontSize: '12.5px', color: '#64748B', padding: '10px 18px', whiteSpace: 'nowrap' }}>
                          {formatUSDateTime(job.lastUpdated)}
                        </td>

                        {/* 7. Action / Chevron Column */}
                        {['inline-action', 'persona-lens'].includes(viewMode) ? (
                          <td style={{ padding: '8px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                              {/* 1. Issues Action - ONLY FOR AUDITOR ROLE */}
                              {isAuditor && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (job.status === 'Not Started') {
                                      handleOpenCreateForJob(job);
                                    } else {
                                      onOpenDiscussionPoints && onOpenDiscussionPoints(job);
                                    }
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    color: '#B45309',
                                    backgroundColor: '#FFFBEB',
                                    border: '1px solid #FDE68A',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  {job.status === 'Not Started' ? (
                                    <>
                                      <Plus style={{ width: '13px', height: '13px' }} />
                                      <span>Add Issue</span>
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare style={{ width: '13px', height: '13px' }} />
                                      <span>Issues ({job.discussionPoints?.count || 1})</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {/* 2. Audit Report Action - ONLY FOR NON-AUDITOR ROLES */}
                              {!isAuditor && job.status !== 'Not Started' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onWorkOnReport && onWorkOnReport(job, 'audit');
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    color: '#1D4ED8',
                                    backgroundColor: '#EFF6FF',
                                    border: '1px solid #BFDBFE',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <PlayCircle style={{ width: '13px', height: '13px' }} />
                                  <span>Audit Report</span>
                                </button>
                              )}

                              {/* 3. Executive Report Action - ONLY FOR NON-AUDITOR ROLES */}
                              {!isAuditor && isExecEligible && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onWorkOnReport && onWorkOnReport(job, 'executive');
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    color: '#7C3AED',
                                    backgroundColor: '#F5F3FF',
                                    border: '1px solid #DDD6FE',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <ShieldCheck style={{ width: '13px', height: '13px' }} />
                                  <span>Executive Report</span>
                                </button>
                              )}
                            </div>
                          </td>
                        ) : ['expand-action', 'issue-cards', 'enhanced-lineage'].includes(viewMode) ? (
                          <td style={{ width: '40px', padding: '10px 16px 10px 0', textAlign: 'right' }}>
                            <ChevronDown
                              style={{
                                width: '16px',
                                height: '16px',
                                color: '#94A3B8',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                              }}
                            />
                          </td>
                        ) : (
                          <td style={{ width: '40px', padding: '10px 16px 10px 0', textAlign: 'right' }}>
                            <ChevronRight className="row-chevron-icon" style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
                          </td>
                        )}
                      </tr>

                      {/* Concept 2 EXPANDED ACCORDION FOR ISSUE CARDS */}
                      {viewMode === 'issue-cards' && isExpanded && (
                        <tr style={{ backgroundColor: '#F8FAFC' }}>
                          <td colSpan={getColSpanCount()} style={{ padding: '16px 20px', borderBottom: '1px solid #CBD5E1' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Layers style={{ width: '15px', height: '15px', color: '#6366F1' }} />
                                  <span>Granular Issue Progression & Ownership Lineage for {job.fileName}</span>
                                </h4>
                              </div>

                              {(job.issuesList || []).map((issue) => (
                                <div key={issue.id} style={{
                                  backgroundColor: '#ffffff',
                                  borderRadius: '8px',
                                  padding: '14px 16px',
                                  border: '1px solid #E2E8F0',
                                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '16px'
                                }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#D8001D', backgroundColor: '#FFF1F2', padding: '2px 6px', borderRadius: '4px' }}>
                                        {issue.id}
                                      </span>
                                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{issue.title}</strong>
                                      <span style={{ fontSize: '10.5px', fontWeight: '700', color: issue.severity === 'Critical' ? '#991B1B' : '#B45309', backgroundColor: issue.severity === 'Critical' ? '#FEE2E2' : '#FEF3C7', padding: '1px 6px', borderRadius: '4px' }}>
                                        {issue.severity}
                                      </span>
                                    </div>

                                    <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '2px' }}>
                                      <span><strong>Created By:</strong> {issue.createdBy}</span>
                                      <span>•</span>
                                      <span><strong>Last Edited By:</strong> {issue.lastEditedBy} ({issue.updatedOn})</span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                      <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block', textTransform: 'uppercase', fontWeight: '700' }}>Current Target Stage</span>
                                      <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#1E293B' }}>{issue.currentLevel}</span>
                                    </div>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenDiscussionPoints && onOpenDiscussionPoints(job);
                                      }}
                                      style={{
                                        padding: '6px 12px',
                                        fontSize: '11.5px',
                                        fontWeight: '700',
                                        color: '#1D4ED8',
                                        backgroundColor: '#EFF6FF',
                                        border: '1px solid #BFDBFE',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                    >
                                      <Eye style={{ width: '13px', height: '13px' }} />
                                      <span>Review Issue</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Enhanced Granular Issue Lineage Card */}
                      {viewMode === 'enhanced-lineage' && isExpanded && (
                        <tr style={{ backgroundColor: '#F8FAFC' }}>
                          <td colSpan={getColSpanCount()} style={{ padding: '16px 20px', borderBottom: '1px solid #CBD5E1' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              
                              {/* Top Header Row for Audit Card */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Layers style={{ width: '18px', height: '18px', color: '#4F46E5' }} />
                                  </div>
                                  <div>
                                    <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span>{job.engagement} — Enhanced Granular Lineage & Persona Stepper</span>
                                      <span style={{ fontSize: '11px', fontWeight: '700', color: job.status === 'Not Started' ? '#64748B' : job.status === 'In Progress' ? '#1D4ED8' : '#15803D', backgroundColor: job.status === 'Not Started' ? '#F1F5F9' : job.status === 'In Progress' ? '#EFF6FF' : '#F0FDF4', border: `1px solid ${job.status === 'Not Started' ? '#CBD5E1' : job.status === 'In Progress' ? '#BFDBFE' : '#BBF2D0'}`, padding: '2px 8px', borderRadius: '12px' }}>
                                        {job.status}
                                      </span>
                                    </h4>
                                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>File: {job.fileName} • Queue Owner: {job.currentOwner}</span>
                                  </div>
                                </div>

                                {/* Universal Add Issue Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCreateForJob(job);
                                  }}
                                  style={{
                                    padding: '7px 15px',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    color: '#ffffff',
                                    backgroundColor: '#D8001D',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 6px rgba(216, 0, 29, 0.25)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B90018'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D8001D'}
                                >
                                  <Plus style={{ width: '14px', height: '14px' }} />
                                  <span>+ Add Issue (Universal)</span>
                                </button>
                              </div>

                              {/* Issue Cards Stack */}
                              {(job.issuesList || []).map((issue, idx) => (
                                <div key={issue.id} style={{
                                  backgroundColor: '#ffffff',
                                  borderRadius: '10px',
                                  padding: '16px 18px',
                                  border: '1px solid #E2E8F0',
                                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '14px'
                                }}>
                                  {/* Top Info Bar of Issue */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#D8001D', backgroundColor: '#FFF1F2', border: '1px solid #FECDD3', padding: '3px 8px', borderRadius: '5px' }}>
                                        {issue.id}
                                      </span>
                                      <strong style={{ fontSize: '13.5px', color: '#0F172A', fontWeight: '800' }}>{issue.title}</strong>
                                      <span style={{ fontSize: '11px', fontWeight: '700', color: issue.severity === 'Critical' ? '#991B1B' : '#B45309', backgroundColor: issue.severity === 'Critical' ? '#FEE2E2' : '#FEF3C7', padding: '2px 8px', borderRadius: '12px' }}>
                                        {issue.severity}
                                      </span>
                                      <span style={{ fontSize: '11px', fontWeight: '700', color: issue.status === 'Completed' ? '#15803D' : '#1E293B', backgroundColor: issue.status === 'Completed' ? '#F0FDF4' : '#F1F5F9', border: `1px solid ${issue.status === 'Completed' ? '#BBF2D0' : '#CBD5E1'}`, padding: '2px 8px', borderRadius: '12px' }}>
                                        {issue.status}
                                      </span>
                                    </div>

                                    {/* Action Toolbar on Every Issue */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {/* 1. Edit Issue (Universal) */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenCreateForJob(job);
                                        }}
                                        style={{
                                          padding: '5px 11px',
                                          fontSize: '11.5px',
                                          fontWeight: '700',
                                          color: '#0F172A',
                                          backgroundColor: '#F8FAFC',
                                          border: '1px solid #CBD5E1',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '5px'
                                        }}
                                        title="Edit Issue (Self or Others Contributed)"
                                      >
                                        <Edit2 style={{ width: '12px', height: '12px' }} />
                                        <span>Edit Issue</span>
                                      </button>

                                      {/* 2. Mark Completed & Sign-Off (Early Override) */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setJobs(prev => prev.map(j => {
                                            if (j.id === job.id) {
                                              return {
                                                ...j,
                                                status: 'In Progress',
                                                issuesList: (j.issuesList || []).map(iss => iss.id === issue.id ? { ...iss, status: 'Completed', currentLevel: 'Completed & Signed Off' } : iss)
                                              };
                                            }
                                            return j;
                                          }));
                                          setToastMessage({
                                            title: "Issue Fast-Tracked & Signed Off",
                                            description: `${issue.id} marked as Completed & Signed Off by ${userRole.toUpperCase()}.`
                                          });
                                        }}
                                        style={{
                                          padding: '5px 11px',
                                          fontSize: '11.5px',
                                          fontWeight: '700',
                                          color: '#15803D',
                                          backgroundColor: '#F0FDF4',
                                          border: '1px solid #BBF2D0',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '5px'
                                        }}
                                        title="Mark Completed & Sign-Off at Any Stage"
                                      >
                                        <CheckCircle style={{ width: '12px', height: '12px' }} />
                                        <span>Mark Completed & Sign-Off</span>
                                      </button>

                                      {/* 3. View Lineage History */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenHistory && onOpenHistory(job);
                                        }}
                                        style={{
                                          padding: '5px 11px',
                                          fontSize: '11.5px',
                                          fontWeight: '700',
                                          color: '#4338CA',
                                          backgroundColor: '#EEF2FF',
                                          border: '1px solid #C7D2FE',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '5px'
                                        }}
                                      >
                                        <Eye style={{ width: '12px', height: '12px' }} />
                                        <span>Lineage History</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Workflow Pipeline Stepper */}
                                  <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    {[
                                      { stage: 'Auditor Drafting', role: 'Auditor', user: issue.createdBy || 'Rachel Green' },
                                      { stage: 'TC Review', role: 'Team Co-Ordinator', user: 'Kevin Zhang' },
                                      { stage: 'Manager Review', role: 'Manager', user: 'Sarah Jenkins' },
                                      { stage: 'Director Review', role: 'Director', user: 'Marcus Vance' },
                                      { stage: 'VP Sign-Off', role: 'VP', user: 'Elena Rostova' }
                                    ].map((stg, sIdx) => {
                                      const currentLvlStr = (issue.currentLevel || '').toLowerCase();
                                      const stageStr = stg.stage.toLowerCase();
                                      const isCurrent = currentLvlStr.includes(stageStr) || (sIdx === 0 && issue.status === 'Drafting') || (sIdx === 1 && issue.status === 'In Review');
                                      const isPassed = issue.status === 'Completed' || (sIdx === 0 && issue.status !== 'Drafting');

                                      return (
                                        <React.Fragment key={stg.stage}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                              width: '24px',
                                              height: '24px',
                                              borderRadius: '50%',
                                              backgroundColor: isPassed ? '#15803D' : isCurrent ? '#1D4ED8' : '#E2E8F0',
                                              color: isPassed || isCurrent ? '#ffffff' : '#64748B',
                                              fontSize: '11px',
                                              fontWeight: '800',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              boxShadow: isCurrent ? '0 0 0 4px rgba(29, 78, 216, 0.15)' : 'none'
                                            }}>
                                              {isPassed ? <Check style={{ width: '13px', height: '13px' }} /> : sIdx + 1}
                                            </div>
                                            <div>
                                              <span style={{ fontSize: '11.5px', fontWeight: isCurrent ? '800' : '600', color: isCurrent ? '#1D4ED8' : isPassed ? '#15803D' : '#64748B', display: 'block' }}>
                                                {stg.stage}
                                              </span>
                                              <span style={{ fontSize: '10px', color: '#94A3B8' }}>{stg.user}</span>
                                            </div>
                                          </div>
                                          {sIdx < 4 && (
                                            <div style={{ flex: 1, height: '2px', backgroundColor: isPassed ? '#86EFAC' : '#E2E8F0', margin: '0 8px' }} />
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>

                                  {/* Contributor Lineage Chips */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: '#64748B' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <UserCheck style={{ width: '13px', height: '13px', color: '#2563EB' }} />
                                        <span><strong>Authored By:</strong> {issue.createdBy || 'Rachel Green'} (Auditor)</span>
                                      </div>
                                      <span>•</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <GitCommit style={{ width: '13px', height: '13px', color: '#D97706' }} />
                                        <span><strong>Last Contributor:</strong> {issue.lastEditedBy || 'Carlos Mendez'} ({issue.updatedOn})</span>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}

                    {/* EXPANDED ACCORDION ROW (For 'expand-action' mode) */}
                    {viewMode === 'expand-action' && isExpanded && (
                      <tr style={{ backgroundColor: '#F8FAFC' }}>
                        <td colSpan={getColSpanCount()} style={{ padding: '12px 18px 16px 18px', borderBottom: '1px solid #CBD5E1' }}>
                          {/* One Main Child Container Div Holding Sections */}
                          <div style={{
                            backgroundColor: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '20px 24px',
                            boxShadow: '0 0 0 1px rgba(15, 23, 42, 0.08), 0 4px 16px -2px rgba(15, 23, 42, 0.08)',
                            display: 'flex',
                            alignItems: 'stretch',
                            justifyContent: isAuditor ? 'flex-start' : 'space-between'
                          }}>

                            {/* Section 1: Issues (ONLY FOR AUDITOR ROLE) */}
                            {isAuditor && (
                              <div style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '28px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <MessageSquare style={{ width: '16px', height: '16px', color: '#D8001D' }} />
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#991B1B', margin: 0 }}>Issues</h4>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (isAuditor && job.status === 'Not Started') {
                                        handleOpenCreateForJob(job);
                                      } else {
                                        onOpenDiscussionPoints && onOpenDiscussionPoints(job);
                                      }
                                    }}
                                    style={{
                                      height: '26px',
                                      padding: '0 10px',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      color: '#B45309',
                                      backgroundColor: '#FFFBEB',
                                      border: '1px solid #FDE68A',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      flexShrink: 0,
                                      transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF3C7'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFBEB'}
                                  >
                                    {job.status === 'Not Started' ? (
                                      <>
                                        <Plus style={{ width: '13px', height: '13px' }} />
                                        <span>Add Issue</span>
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquare style={{ width: '13px', height: '13px' }} />
                                        <span>Issues ({job.discussionPoints?.count || 3})</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748B', minWidth: '160px', flexShrink: 0 }}>Started On:</span>
                                    <strong style={{ fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(job.discussionPoints?.startDateTime || '2026-08-01 10:00 AM')}</strong>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748B', minWidth: '160px', flexShrink: 0 }}>Last Updated On:</span>
                                    <strong style={{ fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(job.discussionPoints?.endDateTime || '2026-08-01 10:30 AM')}</strong>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748B', minWidth: '160px', flexShrink: 0 }}>Last Updated By:</span>
                                    <strong style={{ fontWeight: '700', color: '#0F172A' }}>{job.currentOwner || 'Rachel Green'}</strong>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Section 2: Audit Report (ONLY FOR NON-AUDITOR ROLES) */}
                            {!isAuditor && job.status !== 'Not Started' && (
                              <div style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '28px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <FileText style={{ width: '16px', height: '16px', color: '#D8001D' }} />
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#991B1B', margin: 0 }}>Audit Report</h4>
                                  </div>
                                  <button
                                    onClick={() => onWorkOnReport && onWorkOnReport(job, 'audit')}
                                    style={{
                                      height: '26px',
                                      padding: '0 10px',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      color: '#1D4ED8',
                                      backgroundColor: '#EFF6FF',
                                      border: '1px solid #BFDBFE',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      flexShrink: 0,
                                      transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                  >
                                    <PlayCircle style={{ width: '13px', height: '13px' }} />
                                    <span>Work On Report</span>
                                  </button>
                                </div>

                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748B', minWidth: '160px', flexShrink: 0 }}>Status:</span>
                                    <div>{renderSubStatusPill(job)}</div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748B', minWidth: '160px', flexShrink: 0 }}>Validation Started On:</span>
                                    <strong style={{ fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(job.auditReport?.validationStartDateTime || '2026-08-01 09:30 AM')}</strong>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748B', minWidth: '160px', flexShrink: 0 }}>Validation Ended On:</span>
                                    <strong style={{ fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(job.auditReport?.validationEndDateTime || '2026-08-01 11:30 AM')}</strong>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Vertical Separator 2 Flex Wrapper (ONLY FOR NON-AUDITOR ROLES) */}
                            {!isAuditor && isExecEligible && job.status !== 'Not Started' && (
                              <div style={{ flex: '1 1 0px', minWidth: '32px', display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                                <div style={{ width: '1px', backgroundColor: '#E2E8F0', alignSelf: 'stretch' }} />
                              </div>
                            )}

                            {/* Section 3: Executive Report (ONLY FOR NON-AUDITOR ROLES) */}
                            {!isAuditor && isExecEligible && (
                              <div style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '28px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <ShieldCheck style={{ width: '16px', height: '16px', color: '#D8001D' }} />
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#991B1B', margin: 0 }}>Executive Report</h4>
                                  </div>
                                  <button
                                    onClick={() => onWorkOnReport && onWorkOnReport(job, 'executive')}
                                    style={{
                                      height: '26px',
                                      padding: '0 10px',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      color: '#7C3AED',
                                      backgroundColor: '#F5F3FF',
                                      border: '1px solid #DDD6FE',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      flexShrink: 0,
                                      transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EDE9FE'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F5F3FF'}
                                  >
                                    <ShieldCheck style={{ width: '13px', height: '13px' }} />
                                    <span>Work On Report</span>
                                  </button>
                                </div>

                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748B', minWidth: '160px', flexShrink: 0 }}>Status:</span>
                                    <div>{renderSubStatusPill(job)}</div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748B', minWidth: '160px', flexShrink: 0 }}>Validation Started On:</span>
                                    <strong style={{ fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(job.executiveSummaryReport?.validationStartDateTime || '2026-08-01 11:30 AM')}</strong>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <span style={{ fontWeight: '600', color: '#64748B', minWidth: '160px', flexShrink: 0 }}>Validation Ended On:</span>
                                    <strong style={{ fontWeight: '700', color: '#0F172A' }}>{formatUSDateTime(job.executiveSummaryReport?.validationEndDateTime || '2026-08-01 02:15 PM')}</strong>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Create Issue Drawer Overlay for Not Started Jobs */}
    <CreateIssueDrawerNew
      isOpen={isCreateDrawerOpen}
      onClose={() => {
        setIsCreateDrawerOpen(false);
        setSelectedJobForIssue(null);
      }}
      onSaveDiscussionPoint={handleSaveDiscussionPoint}
      defaultFunction={selectedJobForIssue?.tech || 'IT'}
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
