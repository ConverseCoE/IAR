import React, { useState, useRef, useEffect } from 'react';
import {
  Search, RotateCcw, Filter, ArrowUpDown, Clock,
  FileText, ChevronRight, ChevronDown, Check, X,
  Plus, MessageSquare, PlayCircle, ShieldCheck, Shield,
  UserCheck, Users, AlertCircle, CheckCircle, GitCommit, Eye, User, Layers, ArrowRight, CheckCircle2, Edit2, ExternalLink, Maximize2, Minimize2
} from 'lucide-react';
import { mockReportingNewJobs } from '../data/reportingNewMockData';
import CreateIssueDrawerNew from '../components/CreateIssueDrawerNew';

const STATUS_OPTIONS = [
  { id: 'Not Started', label: 'Not Started', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
  { id: 'Audit Report In Progress', label: 'Audit Report In Progress', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  { id: 'Audit Report Completed', label: 'Audit Report Completed', color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' },
  { id: 'Executive Report In Progress', label: 'Executive Report In Progress', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  { id: 'Executive Report Completed', label: 'Executive Report Completed', color: '#15803D', bg: '#F0FDF4', border: '#BBF2D0' }
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
  viewMode = 'concept1-edge-to-edge',
  userRole = 'manager',
  onOpenDiscussionPoints,
  onOpenCreateIssue,
  onWorkOnReport,
  onOpenHistory
}) {
  const [jobs, setJobs] = useState(mockReportingNewJobs);

  // Concept 2 Granular Issue Lineage Tab Filter State
  const [concept2TabFilter, setConcept2TabFilter] = useState('all');
  const [expandedInnerTabs, setExpandedInnerTabs] = useState({});
  const [includeCompletedAudits, setIncludeCompletedAudits] = useState(false);

  // Direct Create Issue Drawer State for Auditor 'Not Started' Jobs
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [selectedJobForIssue, setSelectedJobForIssue] = useState(null);
  const [editingIssueData, setEditingIssueData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Send to Dropdown State
  const [sendToDropdownIssueId, setSendToDropdownIssueId] = useState(null);

  const ROLE_STAGES = [
    { id: 'Auditor Drafting', label: 'Auditor Drafting', role: 'Auditor', color: '#1E293B', bg: '#F1F5F9' },
    { id: 'Manager Review', label: 'Manager Review', role: 'Manager', color: '#D97706', bg: '#FEF3C7' },
    { id: 'Director Review', label: 'Director Review', role: 'Director', color: '#7C3AED', bg: '#F3E8FF' },
    { id: 'VP Sign-Off', label: 'VP Sign-Off', role: 'VP', color: '#059669', bg: '#ECFDF5' }
  ];

  const getAvailableNextStages = (currentLevel) => {
    const levelStr = (currentLevel || '').toLowerCase();
    const curIdx = ROLE_STAGES.findIndex(stg =>
      levelStr.includes(stg.id.toLowerCase()) ||
      levelStr.includes(stg.role.toLowerCase())
    );
    if (curIdx === -1) {
      if (levelStr.includes('tc')) return ROLE_STAGES.slice(1);
      return ROLE_STAGES.slice(1);
    }
    return ROLE_STAGES.slice(curIdx + 1);
  };

  const handleSendToRole = (jobId, issueId, targetStageObj, e) => {
    if (e) e.stopPropagation();
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'In Progress',
          issuesList: (j.issuesList || []).map(iss =>
            iss.id === issueId
              ? { ...iss, currentLevel: targetStageObj.id, status: targetStageObj.id === 'VP Sign-Off' ? 'Completed' : 'In Review' }
              : iss
          )
        };
      }
      return j;
    }));
    setToastMessage({
      title: `Issue Sent to ${targetStageObj.role}`,
      description: `Issue ${issueId} current stage updated to ${targetStageObj.label}.`
    });
    setSendToDropdownIssueId(null);
  };

  const getRoleDetails = (roleId) => {
    const rLower = (roleId || '').toLowerCase();
    const isIT = rLower.includes('it-') || rLower.startsWith('it');
    const isFinOps = rLower.includes('finops');
    const domain = isIT ? 'IT' : isFinOps ? 'FinOps' : 'All';

    let baseRole = 'manager';
    if (rLower.includes('auditor')) baseRole = 'auditor';
    else if (rLower.includes('coordinator') || rLower.includes('team-coordinator')) baseRole = 'team-coordinator';
    else if (rLower.includes('manager')) baseRole = 'manager';
    else if (rLower.includes('director')) baseRole = 'director';
    else if (rLower.includes('vp')) baseRole = 'vp';

    return { domain, baseRole };
  };

  const userRoleDetails = getRoleDetails(userRole);
  const isAuditor = userRoleDetails.baseRole === 'auditor';

  const canEditIssue = (issueObj) => {
    const { baseRole, domain } = userRoleDetails;
    // Director and VP have no domain restrictions
    if (baseRole === 'director' || baseRole === 'vp' || domain === 'All') {
      return true;
    }

    // Auditor, Team Co-ordinator, and Manager can only edit issues in their domain
    const issueDomain = (issueObj.tech || issueObj.function || 'IT').toUpperCase();
    if (domain.toUpperCase() === 'IT') {
      return issueDomain === 'IT';
    } else if (domain.toUpperCase() === 'FINOPS') {
      return issueDomain === 'FINOPS';
    }
    return true;
  };

  const [isViewOnlyDrawerMode, setIsViewOnlyDrawerMode] = useState(false);

  const handleOpenEditIssueForJob = (jobObj, issueObj, e) => {
    if (e) e.stopPropagation();
    setSelectedJobForIssue(jobObj);
    setEditingIssueData({
      id: issueObj.id,
      header: issueObj.title || issueObj.header || issueObj.id,
      title: issueObj.title || issueObj.header || issueObj.id,
      originalIssue: issueObj.description || issueObj.rootCause || issueObj.title || '',
      criticality: issueObj.criticality || issueObj.severity || 'Major',
      tech: issueObj.tech || jobObj?.tech || 'IT',
      soxReportable: issueObj.soxReportable || 'No',
      primaryContact: issueObj.primaryContact || '',
      secondaryContact: issueObj.secondaryContact || '',
      repeatFinding: issueObj.repeatFinding || 'No',
      accountableFunction: issueObj.accountableFunction || '',
      issueCauseType: issueObj.issueCauseType || '',
      processArea: issueObj.processArea || ''
    });
    setIsViewOnlyDrawerMode(false);
    setIsCreateDrawerOpen(true);
  };

  const handleOpenViewIssueForJob = (jobObj, issueObj, e) => {
    if (e) e.stopPropagation();
    setSelectedJobForIssue(jobObj);
    setEditingIssueData({
      id: issueObj.id,
      header: issueObj.title || issueObj.header || issueObj.id,
      title: issueObj.title || issueObj.header || issueObj.id,
      originalIssue: issueObj.description || issueObj.rootCause || issueObj.title || '',
      criticality: issueObj.criticality || issueObj.severity || 'Major',
      tech: issueObj.tech || jobObj?.tech || 'IT',
      soxReportable: issueObj.soxReportable || 'No',
      primaryContact: issueObj.primaryContact || '',
      secondaryContact: issueObj.secondaryContact || '',
      repeatFinding: issueObj.repeatFinding || 'No',
      accountableFunction: issueObj.accountableFunction || '',
      issueCauseType: issueObj.issueCauseType || '',
      processArea: issueObj.processArea || ''
    });
    setIsViewOnlyDrawerMode(true);
    setIsCreateDrawerOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setSendToDropdownIssueId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleOpenCreateForJob = (job) => {
    setEditingIssueData(null);
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
          const existingList = j.issuesList || [];
          const exists = existingList.some(item => item.id === savedPoint.id || item.id === editingIssueData?.id);
          const updatedList = exists
            ? existingList.map(item => (item.id === savedPoint.id || item.id === editingIssueData?.id)
                ? { ...item, ...savedPoint, title: savedPoint.header || savedPoint.issueHeader || item.title }
                : item)
            : [...existingList, savedPoint];
          return {
            ...j,
            status: 'In Progress',
            subStatus: 'Audit Report In Progress',
            issuesList: updatedList
          };
        }
        return j;
      }));
    }
    setIsCreateDrawerOpen(false);
    setSelectedJobForIssue(null);
    setEditingIssueData(null);

    setToastMessage({
      title: editingIssueData ? "Issue Updated Successfully" : "Issue Saved Successfully",
      description: `Issue #${savedPoint.issueId || savedPoint.id || editingIssueData?.id} has been updated.`
    });
  };

  // Filters State
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [personaFilterTab, setPersonaFilterTab] = useState('all'); // 'all', 'pending', 'contributions'
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Expanded Row & Full Screen View States
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [fullScreenJobId, setFullScreenJobId] = useState(null);

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

  // Concept 2 Metric Calculation Helpers
  const getMyIssuesCount = (job) => {
    return (job.issuesList || []).filter(iss =>
      iss.createdBy === 'Rachel Green' ||
      iss.lastEditedBy === 'Rachel Green' ||
      iss.createdRole === 'auditor'
    ).length;
  };

  const getOthersIssuesCount = (job) => {
    return (job.issuesList || []).filter(iss =>
      iss.createdBy !== 'Rachel Green' &&
      iss.lastEditedBy !== 'Rachel Green'
    ).length;
  };

  const getPendingWithMeCount = (job) => {
    return (job.issuesList || []).filter(iss =>
      (iss.currentRoleTarget || '').toLowerCase() === userRole.toLowerCase() ||
      (iss.currentLevel || '').toLowerCase().includes(userRole.toLowerCase())
    ).length;
  };

  const getExternalContributionsCount = (job) => {
    return (job.issuesList || []).filter(iss =>
      iss.createdRole === 'auditor' ||
      iss.createdBy !== userRole
    ).length;
  };

  const getCompletedMySideCount = (job) => {
    return (job.issuesList || []).filter(iss =>
      iss.lastEditedBy === userRole ||
      (iss.currentLevel || '').toLowerCase().includes('signed off') ||
      (iss.status === 'Completed' && (iss.lastEditedBy || '').toLowerCase() === userRole.toLowerCase())
    ).length;
  };

  const getOverallCompletedCount = (job) => {
    return (job.issuesList || []).filter(iss => iss.status === 'Completed').length;
  };

  const isITIssue = (iss) => {
    const tech = (iss.tech || '').toUpperCase();
    const func = (iss.functionType || '').toUpperCase();
    const title = (iss.title || '').toLowerCase();
    return tech === 'IT' || func === 'IT' || title.includes('firmware') || title.includes('software') || title.includes('sox') || title.includes('telemetry') || title.includes('bluetooth') || title.includes('robotics');
  };

  const getIssueBreakdown = (job) => {
    const issues = job.issuesList || [];

    // Total
    const total = issues.length;
    const totalIT = issues.filter(iss => isITIssue(iss)).length;
    const totalFin = total - totalIT;

    // In Progress
    const inProgressList = issues.filter(iss => iss.status !== 'Completed');
    const inProgress = inProgressList.length;
    const inProgressIT = inProgressList.filter(iss => isITIssue(iss)).length;
    const inProgressFin = inProgress - inProgressIT;

    // Completed
    const completedList = issues.filter(iss => iss.status === 'Completed');
    const completed = completedList.length;
    const completedIT = completedList.filter(iss => isITIssue(iss)).length;
    const completedFin = completed - completedIT;

    return {
      total, totalIT, totalFin,
      inProgress, inProgressIT, inProgressFin,
      completed, completedIT, completedFin
    };
  };

  const getInProgressITIssuesCount = (job) => {
    return (job.issuesList || []).filter(iss =>
      iss.status !== 'Completed' &&
      isITIssue(iss)
    ).length;
  };

  const getInProgressFinOpsIssuesCount = (job) => {
    return (job.issuesList || []).filter(iss =>
      iss.status !== 'Completed' &&
      !isITIssue(iss)
    ).length;
  };

  const getCategoryFilteredIssues = (job, categoryTabKey) => {
    const issues = job.issuesList || [];
    if (categoryTabKey === 'it') {
      return issues.filter(iss => isITIssue(iss));
    }
    if (categoryTabKey === 'finops') {
      return issues.filter(iss => !isITIssue(iss));
    }
    if (categoryTabKey === 'completed') {
      return issues.filter(iss => iss.status === 'Completed' || (iss.currentLevel || '').toLowerCase().includes('completed') || (iss.currentLevel || '').toLowerCase().includes('signed off'));
    }
    return issues;
  };

  const getFilteredIssuesForInnerTab = (job, innerTabKey) => {
    const issues = job.issuesList || [];
    if (innerTabKey === 'total' || !innerTabKey) return issues;

    if (isAuditor) {
      if (innerTabKey === 'my-contributed') {
        return issues.filter(iss => iss.createdBy === 'Rachel Green' || iss.lastEditedBy === 'Rachel Green' || iss.createdRole === 'auditor');
      }
      if (innerTabKey === 'others-contributions') {
        return issues.filter(iss => iss.createdBy !== 'Rachel Green' && iss.lastEditedBy !== 'Rachel Green');
      }
    } else {
      if (innerTabKey === 'pending-me') {
        return issues.filter(iss =>
          (iss.currentRoleTarget || '').toLowerCase() === userRole.toLowerCase() ||
          (iss.currentLevel || '').toLowerCase().includes(userRole.toLowerCase())
        );
      }
      if (innerTabKey === 'external') {
        return issues.filter(iss => iss.createdRole === 'auditor' || iss.createdBy !== userRole);
      }
      if (innerTabKey === 'completed-my-side') {
        return issues.filter(iss =>
          iss.lastEditedBy === userRole ||
          (iss.currentLevel || '').toLowerCase().includes('signed off') ||
          (iss.status === 'Completed' && (iss.lastEditedBy || '').toLowerCase() === userRole.toLowerCase())
        );
      }
      if (innerTabKey === 'overall-completed') {
        return issues.filter(iss => iss.status === 'Completed');
      }
    }

    return issues;
  };

  // Counts for Persona Hub
  const pendingWithMeCount = jobs.filter(j => getPersonaAuditState(j, userRole).isPendingWithMe).length;
  const myContributionsCount = jobs.filter(j => getPersonaAuditState(j, userRole).isMyContribution).length;

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    if (!includeCompletedAudits && job.status === 'Completed') return false;

    if (selectedStatuses.length > 0) {
      const currentSub = getSubStatus(job);
      const matchesStatus = selectedStatuses.includes(job.status) || selectedStatuses.includes(currentSub);
      if (!matchesStatus) return false;
    }
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

  const selectedJobForPanel = (viewMode === 'split-pane' && expandedRowId) ? filteredJobs.find(j => j.id === expandedRowId) : null;

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
    if (['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode)) return 7;
    if (viewMode === 'enhanced-lineage') return 7;
    if (viewMode === 'roster-matrix') return 7;
    return 6;
  };

  return (
    <div className="full-width-queue" style={{ position: 'relative' }}>



      {/* Slick Single-Row Filter Toolbar */}
      {!fullScreenJobId && (
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
            <span style={{ whiteSpace: 'nowrap' }}>
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
              minWidth: '280px',
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
                  const optCount = jobs.filter(j => getSubStatus(j) === opt.id || j.status === opt.id).length;
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
                        <span style={{ fontSize: '12px', fontWeight: isChecked ? '700' : '500', color: isChecked ? '#D8001D' : '#334155', whiteSpace: 'nowrap' }}>
                          {opt.label}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: '800',
                        color: isChecked ? '#ffffff' : '#64748B',
                        backgroundColor: isChecked ? '#D8001D' : '#F1F5F9',
                        padding: '1px 7px',
                        borderRadius: '10px'
                      }}>
                        {optCount}
                      </span>
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

        {/* Premium SaaS Checkbox Filter for Completed Audits */}
        {['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
          <div
            onClick={() => setIncludeCompletedAudits(!includeCompletedAudits)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              height: '36px',
              backgroundColor: includeCompletedAudits ? '#F0FDF4' : '#ffffff',
              border: `1px solid ${includeCompletedAudits ? '#BBF2D0' : '#CBD5E1'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: includeCompletedAudits
                ? '0 2px 8px rgba(21, 128, 61, 0.12)'
                : '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              border: `2px solid ${includeCompletedAudits ? '#15803D' : '#94A3B8'}`,
              backgroundColor: includeCompletedAudits ? '#15803D' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}>
              {includeCompletedAudits && <Check style={{ width: '12px', height: '12px', color: '#ffffff', strokeWidth: 3 }} />}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: includeCompletedAudits ? '#166534' : '#475569' }}>
              Include Completed Audits
            </span>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              color: includeCompletedAudits ? '#ffffff' : '#64748B',
              backgroundColor: includeCompletedAudits ? '#15803D' : '#F1F5F9',
              padding: '1px 7px',
              borderRadius: '10px',
              lineHeight: '1.2',
              transition: 'all 0.15s ease'
            }}>
              {jobs.filter(j => j.status === 'Completed').length}
            </span>
          </div>
        )}

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
      )}

      {/* Concept 1: Persona Lens Work Hub Bar */}
      {!fullScreenJobId && viewMode === 'persona-lens' && (
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

      {/* Split-Pane Layout Wrapper */}
      <div style={{
        display: 'flex',
        flexDirection: (viewMode === 'split-pane' && selectedJobForPanel) ? 'row' : 'column',
        flex: 1,
        minHeight: 0,
        gap: '16px',
        alignItems: (viewMode === 'split-pane' && selectedJobForPanel) ? 'flex-start' : 'stretch'
      }}>
        <div style={{
          flex: (viewMode === 'split-pane' && selectedJobForPanel) ? '1 1 55%' : '1 1 100%',
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Table Container */}
          <div className="table-card-container">
            <div className="table-scroll-body">
              <table>
                {!fullScreenJobId && (
                  <thead>
                  <tr>
                    {/* Left Expand/Collapse Column Header */}
                    {['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
                      <th style={{ width: '36px', minWidth: '36px', maxWidth: '36px', padding: '16px 4px 16px 10px', textAlign: 'center' }}></th>
                    )}

                    {/* 1. Job ID */}
                    {['default', 'persona-lens', 'roster-matrix', 'enhanced-lineage'].includes(viewMode) && (
                      <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                        <div className="th-content">
                          <span>Job ID</span>
                          <ArrowUpDown className="th-sort-icon" />
                        </div>
                      </th>
                    )}

                    {/* 2. Engagement */}
                    <th onClick={() => handleSort('engagement')} style={{ cursor: 'pointer', width: 'auto', minWidth: '220px' }}>
                      <div className="th-content">
                        <span>{['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) ? 'Engagement' : 'Engagement Audit'}</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>

                    {/* 3. Status (Removed for Concept 1, 2, Tree-Table & Split-Pane) */}
                    {!['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
                      <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                        <div className="th-content">
                          <span>Status</span>
                          <ArrowUpDown className="th-sort-icon" />
                        </div>
                      </th>
                    )}

                    {/* 4. Report Status / Sub-Status */}
                    {(viewMode === 'with-substatus' || ['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode)) && (
                      <th onClick={() => handleSort('subStatus')} style={{ cursor: 'pointer', width: ['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) ? '20%' : 'auto', minWidth: '170px' }}>
                        <div className="th-content">
                          <span>{['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) ? 'Report Status' : 'Sub-Status'}</span>
                          <ArrowUpDown className="th-sort-icon" />
                        </div>
                      </th>
                    )}

                    {viewMode === 'persona-lens' && (
                      <th style={{ minWidth: '220px' }}>
                        <span>Persona Workload Status</span>
                      </th>
                    )}

                    {/* Concept 1, 2, Tree-Table & Split-Pane Columns */}
                    {['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
                      <>
                        <th style={{ textAlign: 'center', padding: '12px 10px', width: '13%', minWidth: '110px' }}>
                          <span>Total Issues</span>
                        </th>
                        <th style={{ textAlign: 'center', padding: '12px 10px', width: '13%', minWidth: '110px' }}>
                          <span>In-Progress Issues</span>
                        </th>
                        <th style={{ textAlign: 'center', padding: '12px 10px', width: '13%', minWidth: '110px' }}>
                          <span>Completed Issues</span>
                        </th>
                      </>
                    )}

                    {viewMode === 'enhanced-lineage' && (
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
                    {!['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
                      <th onClick={() => handleSort('aging')} style={{ cursor: 'pointer' }}>
                        <div className="th-content">
                          <span>Time in Queue</span>
                          <ArrowUpDown className="th-sort-icon" />
                        </div>
                      </th>
                    )}

                    {/* 6. Last Updated */}
                    {!['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
                      <th onClick={() => handleSort('lastUpdated')} style={{ cursor: 'pointer' }}>
                        <div className="th-content">
                          <span>Last Updated</span>
                          <ArrowUpDown className="th-sort-icon" />
                        </div>
                      </th>
                    )}

                    {/* 7. Action Header */}
                    {['inline-action', 'persona-lens', 'issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) ? (
                      <th style={{ textAlign: 'right', paddingRight: '24px', width: '1%', whiteSpace: 'nowrap' }}>
                        <span>Actions</span>
                      </th>
                    ) : (
                      <th style={{ width: '40px', padding: '16px 12px' }}></th>
                    )}
                  </tr>
                </thead>
                )}
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
                      if (fullScreenJobId && job.id !== fullScreenJobId) return null;
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
                          {/* Main Table Row (Hidden when expanded in Concept 1 & 2, but STAYS VISIBLE in Tree-Table & Split-Pane) */}
                          {(!fullScreenJobId && !(['issue-cards', 'concept1-edge-to-edge'].includes(viewMode) && isExpanded)) && (
                            <tr
                              onClick={() => {
                                if (['expand-action', 'issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane', 'enhanced-lineage'].includes(viewMode)) {
                                  setExpandedRowId(isExpanded ? null : job.id);
                                } else if (viewMode !== 'inline-action') {
                                  onSelectJob(job.id);
                                }
                              }}
                              className={`table-row-interactive ${isSelected ? 'active-selected' : ''}`}
                              style={{
                                cursor: viewMode === 'inline-action' ? 'default' : 'pointer',
                                backgroundColor: expandedRowId ? '#F8FAFC' : 'transparent',
                                borderLeft: isExpanded ? '2px solid #D8001D' : 'none'
                              }}
                            >
                              {/* Left Expand/Collapse Arrow Cell */}
                              {['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
                                <td style={{ width: '36px', minWidth: '36px', maxWidth: '36px', padding: '10px 4px 10px 10px', textAlign: 'center' }}>
                                  {isExpanded ? (
                                    <ChevronDown style={{ width: '16px', height: '16px', color: '#D8001D', transition: 'transform 0.2s ease' }} />
                                  ) : (
                                    <ChevronRight style={{ width: '16px', height: '16px', color: '#64748B', transition: 'transform 0.2s ease' }} />
                                  )}
                                </td>
                              )}

                              {/* 1. Job ID */}
                              {['default', 'persona-lens', 'roster-matrix', 'enhanced-lineage'].includes(viewMode) && (
                                <td style={{ padding: '10px 18px', fontSize: '12.5px', fontWeight: '700', color: '#D8001D' }}>
                                  {job.id}
                                </td>
                              )}

                              {/* 2. Engagement Audit */}
                              <td style={{ padding: '10px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {viewMode !== 'default' && viewMode !== 'concept1-edge-to-edge' && (
                                    <div className="file-icon-box" style={{ flexShrink: 0 }}>
                                      <FileText style={{ width: '16px', height: '16px' }} />
                                    </div>
                                  )}
                                  <span className="file-name-text" style={{ color: viewMode === 'concept1-edge-to-edge' ? '#0F172A' : '#D8001D', fontWeight: '600', fontSize: '13px' }}>
                                    {job.fileName || job.engagement}
                                  </span>
                                </div>
                              </td>

                              {/* 3. Status Column */}
                              {!['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
                                <td style={{ padding: '10px 18px' }}>
                                  {renderStatusPill(job.status)}
                                </td>
                              )}

                              {/* 4. Report Status / Sub-Status Column */}
                              {(viewMode === 'with-substatus' || ['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode)) && (
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

                              {/* Issue Metric Columns (Total, In-Progress, Completed with IT/FinOps sub-badges) */}
                              {['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (() => {
                                if (job.status === 'Not Started') {
                                  return (
                                    <>
                                      <td style={{ textAlign: 'center', padding: '5px 8px' }}>
                                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>-</span>
                                      </td>
                                      <td style={{ textAlign: 'center', padding: '5px 8px' }}>
                                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>-</span>
                                      </td>
                                      <td style={{ textAlign: 'center', padding: '5px 8px' }}>
                                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>-</span>
                                      </td>
                                    </>
                                  );
                                }

                                const bd = getIssueBreakdown(job);
                                return (
                                  <>
                                    {/* 1. Total Issues */}
                                    <td style={{ textAlign: 'center', padding: '5px 8px', width: '13%' }}>
                                      {bd.total === 0 ? (
                                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>-</span>
                                      ) : (
                                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap' }}>
                                            {bd.total} {bd.total === 1 ? 'Issue' : 'Issues'}
                                          </span>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {bd.totalIT > 0 && (
                                              <span style={{ padding: '1px 5px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '600', lineHeight: '1.2', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', whiteSpace: 'nowrap' }}>
                                                {bd.totalIT} IT
                                              </span>
                                            )}
                                            {bd.totalFin > 0 && (
                                              <span style={{ padding: '1px 5px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '600', lineHeight: '1.2', backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FEF3C7', whiteSpace: 'nowrap' }}>
                                                {bd.totalFin} FinOps
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </td>

                                    {/* 2. In-Progress Issues */}
                                    <td style={{ textAlign: 'center', padding: '5px 8px', width: '13%' }}>
                                      {bd.inProgress === 0 ? (
                                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>-</span>
                                      ) : (
                                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap' }}>
                                            {bd.inProgress} {bd.inProgress === 1 ? 'Issue' : 'Issues'}
                                          </span>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {bd.inProgressIT > 0 && (
                                              <span style={{ padding: '1px 5px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '600', lineHeight: '1.2', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', whiteSpace: 'nowrap' }}>
                                                {bd.inProgressIT} IT
                                              </span>
                                            )}
                                            {bd.inProgressFin > 0 && (
                                              <span style={{ padding: '1px 5px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '600', lineHeight: '1.2', backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FEF3C7', whiteSpace: 'nowrap' }}>
                                                {bd.inProgressFin} FinOps
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </td>

                                    {/* 3. Completed Issues */}
                                    <td style={{ textAlign: 'center', padding: '5px 8px', width: '13%' }}>
                                      {bd.completed === 0 ? (
                                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>-</span>
                                      ) : (
                                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap' }}>
                                            {bd.completed} {bd.completed === 1 ? 'Issue' : 'Issues'}
                                          </span>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {bd.completedIT > 0 && (
                                              <span style={{ padding: '1px 5px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '600', lineHeight: '1.2', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', whiteSpace: 'nowrap' }}>
                                                {bd.completedIT} IT
                                              </span>
                                            )}
                                            {bd.completedFin > 0 && (
                                              <span style={{ padding: '1px 5px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '600', lineHeight: '1.2', backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FEF3C7', whiteSpace: 'nowrap' }}>
                                                {bd.completedFin} FinOps
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                  </>
                                );
                              })()}

                              {viewMode === 'enhanced-lineage' && (
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
                                      Hand-off: {job.currentQueue}
                                    </span>
                                  </div>
                                </td>
                              )}

                              {/* 5. Time in Queue */}
                              {!['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
                                <td style={{ fontSize: '12.5px', padding: '10px 18px' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: '700' }}>
                                    <Clock style={{ width: '13px', height: '13px', color: '#D8001D' }} />
                                    <span>{job.aging}</span>
                                  </div>
                                </td>
                              )}

                              {/* 6. Last Updated */}
                              {!['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) && (
                                <td style={{ fontSize: '12.5px', color: '#64748B', padding: '10px 18px', whiteSpace: 'nowrap' }}>
                                  {formatUSDateTime(job.lastUpdated)}
                                </td>
                              )}

                              {/* 7. Action Column */}
                              {['inline-action', 'persona-lens', 'issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) ? (
                                <td style={{ padding: '8px 18px', textAlign: 'right', width: '1%', whiteSpace: 'nowrap' }}>
                                  <div className="row-action-buttons" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                    {['issue-cards', 'concept1-edge-to-edge', 'tree-table', 'split-pane'].includes(viewMode) ? (
                                      <>
                                        {/* 1. Create Issue (Available for ALL Roles) */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenCreateForJob(job);
                                          }}
                                          style={{
                                            padding: '5px 11px',
                                            fontSize: '11.5px',
                                            fontWeight: '700',
                                            color: '#D8001D',
                                            backgroundColor: '#FEF2F2',
                                            border: '1px solid #FECDD3',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            transition: 'all 0.15s ease'
                                          }}
                                          title="Create New Issue"
                                        >
                                          <Plus style={{ width: '13px', height: '13px', color: '#D8001D' }} />
                                          <span>Issue</span>
                                        </button>

                                        {/* 3. Audit Report (Non-Auditors when status !== Not Started) */}
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
                                            title="Open Audit Report"
                                          >
                                            <PlayCircle style={{ width: '13px', height: '13px' }} />
                                            <span>Audit Report</span>
                                          </button>
                                        )}

                                        {/* 4. Summary Report (Non-Auditors when eligible) */}
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
                                              color: '#4338CA',
                                              backgroundColor: '#EEF2FF',
                                              border: '1px solid #C7D2FE',
                                              borderRadius: '6px',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '5px'
                                            }}
                                            title="Open Summary Report"
                                          >
                                            <ExternalLink style={{ width: '13px', height: '13px' }} />
                                            <span>Summary Report</span>
                                          </button>
                                        )}
                                      </>
                                    ) : (
                                      <>
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
                                      </>
                                    )}
                                  </div>
                                </td>
                              ) : ['expand-action', 'enhanced-lineage'].includes(viewMode) ? (
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
                          )}

                          {/* Concept 2 HIERARCHICAL TREE-TABLE CONTAINER */}
                          {viewMode === 'tree-table' && isExpanded && (
                            <tr style={{ backgroundColor: '#ffffff' }}>
                              <td
                                colSpan={getColSpanCount()}
                                style={{
                                  padding: '12px 16px 16px 16px',
                                  borderLeft: '2px solid #D8001D',
                                  borderBottom: '2px solid #CBD5E1',
                                  backgroundColor: '#ffffff'
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                                  {/* Metric Filter Chips Bar (Right above sub-rows) */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}>
                                    {(() => {
                                      const bd = getIssueBreakdown(job);
                                      const categoryTabs = [
                                        { id: 'all', label: 'ALL', count: bd.total },
                                        { id: 'it', label: 'IT', count: bd.totalIT },
                                        { id: 'finops', label: 'FINOPS', count: bd.totalFin },
                                        { id: 'completed', label: 'COMPLETED', count: bd.completed }
                                      ];
                                      const currentTab = expandedInnerTabs[job.id] || 'all';

                                      return categoryTabs.map(tab => {
                                        const isActive = currentTab === tab.id;
                                        return (
                                          <button
                                            key={tab.id}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedInnerTabs(prev => ({ ...prev, [job.id]: tab.id }));
                                            }}
                                            style={{
                                              padding: '5px 11px',
                                              fontSize: '11.5px',
                                              fontWeight: isActive ? '700' : '500',
                                              color: isActive ? '#D8001D' : '#475569',
                                              backgroundColor: isActive ? '#FEF2F2' : '#F8FAFC',
                                              border: `1px solid ${isActive ? '#FECDD3' : '#E2E8F0'}`,
                                              borderRadius: '6px',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              transition: 'all 0.15s ease'
                                            }}
                                          >
                                            <span>{tab.label}</span>
                                            <span style={{
                                              fontSize: '10px',
                                              fontWeight: '800',
                                              color: isActive ? '#ffffff' : '#64748B',
                                              backgroundColor: isActive ? '#D8001D' : '#CBD5E1',
                                              borderRadius: '10px',
                                              padding: '1px 5px',
                                              lineHeight: '1.2'
                                            }}>
                                              {tab.count}
                                            </span>
                                          </button>
                                        );
                                      });
                                    })()}
                                  </div>

                                  {/* Hierarchical Sub-Rows Container */}
                                  {(() => {
                                    const currentTabKey = expandedInnerTabs[job.id] || 'all';
                                    const displayedIssues = getCategoryFilteredIssues(job, currentTabKey);

                                    if (displayedIssues.length === 0) {
                                      return (
                                        <div style={{
                                          padding: '20px',
                                          textAlign: 'center',
                                          backgroundColor: '#ffffff',
                                          borderRadius: '8px',
                                          border: '1px solid #E2E8F0',
                                          color: '#64748B',
                                          fontSize: '12.5px'
                                        }}>
                                          No sub-row issues match this category filter.
                                        </div>
                                      );
                                    }

                                    return (
                                      <div style={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        border: '1px solid #E2E8F0',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                                      }}>
                                        <table className="inner-sub-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                          <thead>
                                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                              <th style={{ padding: '9px 12px', fontSize: '11px', fontWeight: '800', color: '#475569', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Hierarchy & Issue
                                              </th>
                                              <th style={{ padding: '9px 12px', fontSize: '11px', fontWeight: '800', color: '#475569', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Current Stage
                                              </th>
                                              <th style={{ padding: '9px 12px', fontSize: '11px', fontWeight: '800', color: '#475569', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Created By
                                              </th>
                                              <th style={{ padding: '9px 12px', fontSize: '11px', fontWeight: '800', color: '#475569', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Last Updated By
                                              </th>
                                              <th style={{ padding: '9px 12px', fontSize: '11px', fontWeight: '800', color: '#475569', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.04em', paddingRight: '16px' }}>
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {displayedIssues.map((iss, iIdx) => {
                                              const isLast = iIdx === displayedIssues.length - 1;
                                              return (
                                                <tr key={iss.id || iIdx} style={{ borderBottom: isLast ? 'none' : '1px solid #F1F5F9', backgroundColor: iIdx % 2 === 0 ? '#ffffff' : '#FAFAFA' }}>
                                                  {/* 1. Hierarchy & Issue */}
                                                  <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                      {/* Vertical Connector Tree Branch Line */}
                                                      <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '28px',
                                                        height: '24px',
                                                        position: 'relative',
                                                        flexShrink: 0
                                                      }}>
                                                        {/* Vertical stem */}
                                                        <div style={{
                                                          position: 'absolute',
                                                          top: 0,
                                                          bottom: isLast ? '50%' : 0,
                                                          left: '12px',
                                                          width: '2px',
                                                          backgroundColor: '#CBD5E1'
                                                        }} />
                                                        {/* Horizontal branch */}
                                                        <div style={{
                                                          position: 'absolute',
                                                          top: '50%',
                                                          left: '12px',
                                                          right: '4px',
                                                          height: '2px',
                                                          backgroundColor: '#CBD5E1'
                                                        }} />
                                                      </div>

                                                      <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>
                                                        {iss.title}
                                                      </span>
                                                    </div>
                                                  </td>

                                                  {/* 2. Current Stage */}
                                                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                    <span style={{
                                                      padding: '3px 9px',
                                                      borderRadius: '6px',
                                                      fontSize: '11px',
                                                      fontWeight: '700',
                                                      backgroundColor: '#F1F5F9',
                                                      color: '#0F172A',
                                                      border: '1px solid #CBD5E1'
                                                    }}>
                                                      {iss.currentLevel || 'Auditor Drafting'}
                                                    </span>
                                                  </td>

                                                  {/* 3. Created By */}
                                                  <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#334155', fontWeight: '600' }}>
                                                      <User style={{ width: '12px', height: '12px', color: '#64748B' }} />
                                                      <span>{iss.createdBy}</span>
                                                    </div>
                                                  </td>

                                                  {/* 4. Last Updated By */}
                                                  <td style={{ padding: '10px 12px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                      <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155' }}>
                                                        {iss.lastEditedBy}
                                                      </span>
                                                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                                                        {iss.lastUpdated}
                                                      </span>
                                                    </div>
                                                  </td>

                                                  {/* 5. Actions */}
                                                  <td style={{ padding: '10px 12px', textAlign: 'right', paddingRight: '16px' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                                                      {!canEditIssue(iss) ? (
                                                        <button
                                                          onClick={(e) => handleOpenViewIssueForJob(job, iss, e)}
                                                          style={{
                                                            padding: '4px 8px',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            color: '#475569',
                                                            backgroundColor: '#F8FAFC',
                                                            border: '1px solid #CBD5E1',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                          }}
                                                          title="View Issue (Read-Only)"
                                                        >
                                                          <Eye style={{ width: '11px', height: '11px', color: '#64748B' }} />
                                                          <span>View</span>
                                                        </button>
                                                      ) : (
                                                        <>
                                                          <button
                                                            onClick={(e) => handleOpenEditIssueForJob(job, iss, e)}
                                                            style={{
                                                              padding: '4px 8px',
                                                              fontSize: '11px',
                                                              fontWeight: '700',
                                                              color: '#334155',
                                                              backgroundColor: '#ffffff',
                                                              border: '1px solid #CBD5E1',
                                                              borderRadius: '5px',
                                                              cursor: 'pointer',
                                                              display: 'inline-flex',
                                                              alignItems: 'center',
                                                              gap: '4px'
                                                            }}
                                                            title="Edit Issue"
                                                          >
                                                            <Edit2 style={{ width: '11px', height: '11px' }} />
                                                            <span>Edit</span>
                                                          </button>
                                                      {(() => {
                                                        const isIssueCompleted = (iss.status === 'Completed' ||
                                                          (iss.currentLevel || '').toLowerCase().includes('completed') ||
                                                          (iss.currentLevel || '').toLowerCase().includes('signed off'));
                                                        const nextStages = getAvailableNextStages(iss.currentLevel);

                                                        if (isIssueCompleted) return null;

                                                        return (
                                                          <>
                                                            {!isAuditor && nextStages.length > 0 && (
                                                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                                                <button
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSendToDropdownIssueId(sendToDropdownIssueId === iss.id ? null : iss.id);
                                                                  }}
                                                                  style={{
                                                                    padding: '4px 8px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    color: '#1D4ED8',
                                                                    backgroundColor: '#EFF6FF',
                                                                    border: '1px solid #BFDBFE',
                                                                    borderRadius: '5px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                  }}
                                                                  title="Send to Role"
                                                                >
                                                                  <span>Send to</span>
                                                                  <ChevronDown style={{
                                                                    width: '11px',
                                                                    height: '11px',
                                                                    transform: sendToDropdownIssueId === iss.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                    transition: 'transform 0.15s ease'
                                                                  }} />
                                                                </button>

                                                                {sendToDropdownIssueId === iss.id && (
                                                                  <div
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{
                                                                      position: 'absolute',
                                                                      top: 'calc(100% + 4px)',
                                                                      left: 0,
                                                                      zIndex: 1000,
                                                                      minWidth: '170px',
                                                                      backgroundColor: '#ffffff',
                                                                      borderRadius: '8px',
                                                                      border: '1px solid #CBD5E1',
                                                                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
                                                                      padding: '5px',
                                                                      display: 'flex',
                                                                      flexDirection: 'column',
                                                                      gap: '2px'
                                                                    }}
                                                                  >
                                                                    {nextStages.map((stg) => (
                                                                      <button
                                                                        key={stg.id}
                                                                        onClick={(e) => handleSendToRole(job.id, iss.id, stg, e)}
                                                                        style={{
                                                                          display: 'flex',
                                                                          alignItems: 'center',
                                                                          justifyContent: 'space-between',
                                                                          padding: '6px 10px',
                                                                          fontSize: '11px',
                                                                          fontWeight: '600',
                                                                          color: '#334155',
                                                                          backgroundColor: 'transparent',
                                                                          border: 'none',
                                                                          borderRadius: '6px',
                                                                          cursor: 'pointer',
                                                                          textAlign: 'left',
                                                                          width: '100%',
                                                                          transition: 'all 0.15s ease'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                      >
                                                                        <span>{stg.label}</span>
                                                                      </button>
                                                                    ))}
                                                                  </div>
                                                                )}
                                                              </div>
                                                            )}
                                                            {!isAuditor && (
                                                              <button
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  setJobs(prev => prev.map(j => {
                                                                    if (j.id === job.id) {
                                                                      return {
                                                                        ...j,
                                                                        issuesList: (j.issuesList || []).map(item => item.id === iss.id ? { ...item, status: 'Completed', currentLevel: 'Completed & Signed Off' } : item)
                                                                      };
                                                                    }
                                                                    return j;
                                                                  }));
                                                                  setToastMessage && setToastMessage({
                                                                    title: "Issue Signed Off",
                                                                    description: `Issue ${iss.id} status updated to Completed & Signed Off.`
                                                                  });
                                                                }}
                                                                style={{
                                                                  padding: '4px 8px',
                                                                  fontSize: '11px',
                                                                  fontWeight: '700',
                                                                  color: '#15803D',
                                                                  backgroundColor: '#F0FDF4',
                                                                  border: '1px solid #BBF2D0',
                                                                  borderRadius: '5px',
                                                                  cursor: 'pointer',
                                                                  display: 'inline-flex',
                                                                  alignItems: 'center',
                                                                  gap: '4px'
                                                                }}
                                                                title="Sign-off Issue"
                                                              >
                                                                <CheckCircle style={{ width: '11px', height: '11px' }} />
                                                                <span>Sign-off</span>
                                                              </button>
                                                            )}
                                                          </>
                                                        );
                                                      })()}
                                                      {!isAuditor && (
                                                        <button
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            onOpenHistory && onOpenHistory(job);
                                                          }}
                                                          style={{
                                                            padding: '4px 8px',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            color: '#4338CA',
                                                            backgroundColor: '#EEF2FF',
                                                            border: '1px solid #C7D2FE',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                          }}
                                                          title="Track Log Changes History"
                                                        >
                                                          <Eye style={{ width: '11px', height: '11px' }} />
                                                          <span>History</span>
                                                        </button>
                                                      )}
                                                        </>
                                                      )}
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    );
                                  })()}

                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Concept 1 SEAMLESS EDGE-TO-EDGE WORKBENCH CONTAINER */}
                          {viewMode === 'concept1-edge-to-edge' && isExpanded && (
                            <tr style={{ backgroundColor: '#ffffff' }}>
                              <td
                                colSpan={getColSpanCount()}
                                style={{
                                  padding: '0',
                                  borderLeft: '2px solid #D8001D',
                                  borderBottom: '2px solid #CBD5E1',
                                  backgroundColor: '#ffffff'
                                }}
                              >
                                 <div style={{
                                   padding: fullScreenJobId === job.id ? '20px 24px' : '16px 20px',
                                   display: 'flex',
                                   flexDirection: 'column',
                                   gap: '10px',
                                   ...(fullScreenJobId === job.id ? {
                                     position: 'absolute',
                                     top: 0,
                                     left: 0,
                                     right: 0,
                                     bottom: 0,
                                     zIndex: 600,
                                     backgroundColor: '#ffffff',
                                     overflowY: 'auto'
                                   } : {})
                                 }}>

                                  {/* Seamless Workbench Header */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      {/* Tiny Collapse Arrow Button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedRowId(null);
                                          setFullScreenJobId(null);
                                        }}
                                        style={{
                                          width: '26px',
                                          height: '26px',
                                          borderRadius: '6px',
                                          backgroundColor: '#ffffff',
                                          border: '1px solid #CBD5E1',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          color: '#475569',
                                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                                          transition: 'all 0.15s ease',
                                          flexShrink: 0
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = '#FEF2F2';
                                          e.currentTarget.style.color = '#D8001D';
                                          e.currentTarget.style.borderColor = '#FECDD3';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = '#ffffff';
                                          e.currentTarget.style.color = '#475569';
                                          e.currentTarget.style.borderColor = '#CBD5E1';
                                        }}
                                        title="Collapse & Return to Table"
                                      >
                                        <ChevronDown style={{ width: '15px', height: '15px', transform: 'rotate(90deg)', strokeWidth: 2.5 }} />
                                      </button>

                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                                            {job.fileName || job.engagement}
                                          </h3>
                                          {renderSubStatusPill(job)}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Workbench Header Buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenCreateForJob(job);
                                        }}
                                        style={{
                                          padding: '6px 12px',
                                          fontSize: '11.5px',
                                          fontWeight: '700',
                                          color: '#D8001D',
                                          backgroundColor: '#FEF2F2',
                                          border: '1px solid #FECDD3',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                          transition: 'all 0.15s ease'
                                        }}
                                        title="Create New Issue"
                                      >
                                        <Plus style={{ width: '13px', height: '13px', color: '#D8001D' }} />
                                        <span>Issue</span>
                                      </button>

                                      {!isAuditor && job.status !== 'Not Started' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onWorkOnReport && onWorkOnReport(job, 'audit');
                                          }}
                                          style={{
                                            padding: '7px 14px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: '#1D4ED8',
                                            backgroundColor: '#EFF6FF',
                                            border: '1px solid #BFDBFE',
                                            borderRadius: '7px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 1px 4px rgba(29, 78, 216, 0.1)'
                                          }}
                                        >
                                          <PlayCircle style={{ width: '14px', height: '14px', color: '#1D4ED8' }} />
                                          <span>Audit Report</span>
                                        </button>
                                      )}

                                      {!isAuditor && isExecEligible && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onWorkOnReport && onWorkOnReport(job, 'executive');
                                          }}
                                          style={{
                                            padding: '7px 14px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: '#4338CA',
                                            backgroundColor: '#EEF2FF',
                                            border: '1px solid #C7D2FE',
                                            borderRadius: '7px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 1px 4px rgba(67, 56, 202, 0.1)'
                                          }}
                                        >
                                          <ExternalLink style={{ width: '14px', height: '14px', color: '#4338CA' }} />
                                          <span>Executive Summary Report</span>
                                        </button>
                                      )}

                                      {/* Icon-based Button for Full Screen View */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFullScreenJobId(fullScreenJobId === job.id ? null : job.id);
                                        }}
                                        style={{
                                          padding: '7px 10px',
                                          fontSize: '12px',
                                          fontWeight: '700',
                                          color: fullScreenJobId === job.id ? '#D8001D' : '#475569',
                                          backgroundColor: fullScreenJobId === job.id ? '#FEF2F2' : '#F8FAFC',
                                          border: `1px solid ${fullScreenJobId === job.id ? '#FECDD3' : '#CBD5E1'}`,
                                          borderRadius: '7px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: '4px',
                                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                                          transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                          if (fullScreenJobId !== job.id) {
                                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                                            e.currentTarget.style.color = '#D8001D';
                                            e.currentTarget.style.borderColor = '#FECDD3';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (fullScreenJobId !== job.id) {
                                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                                            e.currentTarget.style.color = '#475569';
                                            e.currentTarget.style.borderColor = '#CBD5E1';
                                          }
                                        }}
                                        title={fullScreenJobId === job.id ? "Exit Full Screen" : "Full Screen View"}
                                      >
                                        {fullScreenJobId === job.id ? (
                                          <Minimize2 style={{ width: '14px', height: '14px' }} />
                                        ) : (
                                          <Maximize2 style={{ width: '14px', height: '14px' }} />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Category Filter Tabs (All Issues, IT Issues, FinOps Issues, Completed Issues) */}
                                  {(() => {
                                    const bd = getIssueBreakdown(job);
                                    const categoryTabs = [
                                      { id: 'all', label: 'ALL', count: bd.total },
                                      { id: 'it', label: 'IT', count: bd.totalIT },
                                      { id: 'finops', label: 'FINOPS', count: bd.totalFin },
                                      { id: 'completed', label: 'COMPLETED', count: bd.completed }
                                    ];
                                    const currentTab = expandedInnerTabs[job.id] || 'all';

                                    return (
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        paddingLeft: '38px',
                                        marginBottom: '0px'
                                      }}>
                                        {categoryTabs.map(tab => {
                                          const isActive = currentTab === tab.id;
                                          return (
                                            <button
                                              key={tab.id}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedInnerTabs(prev => ({ ...prev, [job.id]: tab.id }));
                                              }}
                                              onMouseEnter={(e) => {
                                                if (!isActive) {
                                                  e.currentTarget.style.color = '#000000';
                                                }
                                              }}
                                              onMouseLeave={(e) => {
                                                if (!isActive) {
                                                  e.currentTarget.style.color = '#64748B';
                                                }
                                              }}
                                              style={{
                                                padding: '2px 2px 4px 2px',
                                                fontSize: '12.5px',
                                                fontWeight: '600',
                                                color: isActive ? '#475569' : '#64748B',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                borderBottom: isActive ? '2px solid #D8001D' : '2px solid transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'color 0.15s ease, border-bottom-color 0.15s ease',
                                                outline: 'none'
                                              }}
                                            >
                                              <span>{tab.label}</span>
                                              <span style={{
                                                fontSize: '10.5px',
                                                fontWeight: '700',
                                                color: isActive ? '#475569' : '#64748B',
                                                backgroundColor: '#F1F5F9',
                                                borderRadius: '10px',
                                                padding: '1px 6px',
                                                lineHeight: '1.2'
                                              }}>
                                                {tab.count}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    );
                                  })()}

                                  {/* Inner Table (Edge-to-Edge Grid) */}
                                  {(() => {
                                    const currentTabKey = expandedInnerTabs[job.id] || 'all';
                                    const displayedIssues = getCategoryFilteredIssues(job, currentTabKey);

                                    if (displayedIssues.length === 0) {
                                      return (
                                        <div style={{
                                          padding: '24px',
                                          textAlign: 'center',
                                          backgroundColor: '#ffffff',
                                          borderRadius: '8px',
                                          border: '1px solid #E2E8F0',
                                          color: '#64748B',
                                          fontSize: '13px'
                                        }}>
                                          No issues match this category filter.
                                        </div>
                                      );
                                    }

                                    return (
                                      <div style={{
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                      }}>
                                        <table className="inner-sub-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                          <thead>
                                            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E2E8F0' }}>
                                              <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '600', color: '#475569', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Issue
                                              </th>
                                              <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '600', color: '#475569', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Current Stage
                                              </th>
                                              <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '600', color: '#475569', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Created By
                                              </th>
                                              <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '600', color: '#475569', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Last Updated By
                                              </th>
                                              <th style={{ padding: '10px 14px', textAlign: 'right', paddingRight: '18px' }}></th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {displayedIssues.map((iss, iIdx) => (
                                              <tr key={iss.id || iIdx} style={{ borderBottom: iIdx === displayedIssues.length - 1 ? 'none' : '1px solid #E2E8F0' }}>
                                                <td style={{ padding: '12px 14px' }}>
                                                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                                                    {iss.title}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                  <span style={{
                                                    padding: '3px 10px',
                                                    borderRadius: '6px',
                                                    fontSize: '11.5px',
                                                    fontWeight: '700',
                                                    backgroundColor: '#F1F5F9',
                                                    color: '#0F172A',
                                                    border: '1px solid #CBD5E1'
                                                  }}>
                                                    {iss.currentLevel || 'Auditor Drafting'}
                                                  </span>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', fontWeight: '600' }}>
                                                    <User style={{ width: '13px', height: '13px', color: '#64748B' }} />
                                                    <span>{iss.createdBy}</span>
                                                  </div>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', fontWeight: '600' }}>
                                                      <User style={{ width: '13px', height: '13px', color: '#64748B' }} />
                                                      <span>{iss.lastEditedBy}</span>
                                                    </div>
                                                    <span style={{ fontSize: '10.5px', color: '#94A3B8', paddingLeft: '19px' }}>
                                                      {iss.lastUpdated}
                                                    </span>
                                                  </div>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'right', paddingRight: '18px' }}>
                                                  <div className="inner-row-action-buttons" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                                                    {!canEditIssue(iss) ? (
                                                      <button
                                                        onClick={(e) => handleOpenViewIssueForJob(job, iss, e)}
                                                        style={{
                                                          padding: '4px 9px',
                                                          fontSize: '11px',
                                                          fontWeight: '700',
                                                          color: '#475569',
                                                          backgroundColor: '#F8FAFC',
                                                          border: '1px solid #CBD5E1',
                                                          borderRadius: '5px',
                                                          cursor: 'pointer',
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          gap: '4px'
                                                        }}
                                                        title="View Issue (Read-Only)"
                                                      >
                                                        <Eye style={{ width: '11px', height: '11px', color: '#64748B' }} />
                                                        <span>View</span>
                                                      </button>
                                                    ) : (
                                                      <>
                                                        <button
                                                          onClick={(e) => handleOpenEditIssueForJob(job, iss, e)}
                                                          style={{
                                                            padding: '4px 9px',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            color: '#334155',
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #CBD5E1',
                                                            borderRadius: '5px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                          }}
                                                          title="Edit Issue"
                                                        >
                                                          <Edit2 style={{ width: '11px', height: '11px' }} />
                                                          <span>Edit</span>
                                                        </button>
                                                    {(() => {
                                                        const isIssueCompleted = (iss.status === 'Completed' ||
                                                          (iss.currentLevel || '').toLowerCase().includes('completed') ||
                                                          (iss.currentLevel || '').toLowerCase().includes('signed off'));
                                                        const nextStages = getAvailableNextStages(iss.currentLevel);

                                                        if (isIssueCompleted) return null;

                                                        return (
                                                          <>
                                                            {!isAuditor && nextStages.length > 0 && (
                                                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                                                <button
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSendToDropdownIssueId(sendToDropdownIssueId === iss.id ? null : iss.id);
                                                                  }}
                                                                  style={{
                                                                    padding: '4px 9px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    color: '#1D4ED8',
                                                                    backgroundColor: '#EFF6FF',
                                                                    border: '1px solid #BFDBFE',
                                                                    borderRadius: '5px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                  }}
                                                                  title="Send to Role"
                                                                >
                                                                  <span>Send to</span>
                                                                  <ChevronDown style={{
                                                                    width: '11px',
                                                                    height: '11px',
                                                                    transform: sendToDropdownIssueId === iss.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                    transition: 'transform 0.15s ease'
                                                                  }} />
                                                                </button>

                                                                {sendToDropdownIssueId === iss.id && (
                                                                  <div
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{
                                                                      position: 'absolute',
                                                                      top: 'calc(100% + 4px)',
                                                                      left: 0,
                                                                      zIndex: 1000,
                                                                      minWidth: '190px',
                                                                      backgroundColor: '#ffffff',
                                                                      borderRadius: '8px',
                                                                      border: '1px solid #CBD5E1',
                                                                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
                                                                      padding: '5px',
                                                                      display: 'flex',
                                                                      flexDirection: 'column',
                                                                      gap: '2px'
                                                                    }}
                                                                  >
                                                                    {nextStages.map((stg) => (
                                                                      <button
                                                                        key={stg.id}
                                                                        onClick={(e) => handleSendToRole(job.id, iss.id, stg, e)}
                                                                        style={{
                                                                          display: 'flex',
                                                                          alignItems: 'center',
                                                                          justifyContent: 'space-between',
                                                                          padding: '6px 10px',
                                                                          fontSize: '11px',
                                                                          fontWeight: '600',
                                                                          color: '#334155',
                                                                          backgroundColor: 'transparent',
                                                                          border: 'none',
                                                                          borderRadius: '6px',
                                                                          cursor: 'pointer',
                                                                          textAlign: 'left',
                                                                          width: '100%',
                                                                          transition: 'all 0.15s ease'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                      >
                                                                        <span>{stg.label}</span>
                                                                      </button>
                                                                    ))}
                                                                  </div>
                                                                )}
                                                              </div>
                                                            )}
                                                            {!isAuditor && (
                                                              <button
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  setJobs(prev => prev.map(j => {
                                                                    if (j.id === job.id) {
                                                                      return {
                                                                        ...j,
                                                                        issuesList: (j.issuesList || []).map(item => item.id === iss.id ? { ...item, status: 'Completed', currentLevel: 'Completed & Signed Off' } : item)
                                                                      };
                                                                    }
                                                                    return j;
                                                                  }));
                                                                  setToastMessage && setToastMessage({
                                                                    title: "Issue Signed Off",
                                                                    description: `Issue ${iss.id} status updated to Completed & Signed Off.`
                                                                  });
                                                                }}
                                                                style={{
                                                                  padding: '4px 9px',
                                                                  fontSize: '11px',
                                                                  fontWeight: '700',
                                                                  color: '#15803D',
                                                                  backgroundColor: '#F0FDF4',
                                                                  border: '1px solid #BBF2D0',
                                                                  borderRadius: '5px',
                                                                  cursor: 'pointer',
                                                                  display: 'inline-flex',
                                                                  alignItems: 'center',
                                                                  gap: '4px'
                                                                }}
                                                                title="Sign-off Issue"
                                                              >
                                                                <CheckCircle style={{ width: '11px', height: '11px' }} />
                                                                <span>Sign-off</span>
                                                              </button>
                                                            )}
                                                          </>
                                                        );
                                                      })()}
                                                    {!isAuditor && (
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          onOpenHistory && onOpenHistory(job);
                                                        }}
                                                        style={{
                                                          padding: '4px 9px',
                                                          fontSize: '11px',
                                                          fontWeight: '700',
                                                          color: '#4338CA',
                                                          backgroundColor: '#EEF2FF',
                                                          border: '1px solid #C7D2FE',
                                                          borderRadius: '5px',
                                                          cursor: 'pointer',
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          gap: '4px'
                                                        }}
                                                        title="Track Log Changes History"
                                                      >
                                                        <Eye style={{ width: '11px', height: '11px' }} />
                                                        <span>History</span>
                                                      </button>
                                                    )}
                                                      </>
                                                    )}
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    );
                                  })()}

                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Concept 2 EXPANDED SCREEN-INSIDE-TABLE CONTAINER FOR ISSUE CARDS */}
                          {viewMode === 'issue-cards' && isExpanded && (
                            <tr style={{ backgroundColor: '#ffffff' }}>
                              <td colSpan={getColSpanCount()} style={{ padding: '14px 8px', borderBottom: '2px solid #CBD5E1', backgroundColor: '#ffffff' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>

                                  {/* Tiny Collapse Arrow Button (Outside the information container) */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedRowId(null);
                                      setFullScreenJobId(null);
                                    }}
                                    style={{
                                      width: '26px',
                                      height: '26px',
                                      borderRadius: '6px',
                                      backgroundColor: '#ffffff',
                                      border: '1px solid #CBD5E1',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      color: '#475569',
                                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                                      transition: 'all 0.15s ease',
                                      flexShrink: 0,
                                      marginTop: '6px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                                      e.currentTarget.style.color = '#D8001D';
                                      e.currentTarget.style.borderColor = '#FECDD3';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#ffffff';
                                      e.currentTarget.style.color = '#475569';
                                      e.currentTarget.style.borderColor = '#CBD5E1';
                                    }}
                                    title="Collapse & Return to Table"
                                  >
                                    <ChevronDown style={{ width: '15px', height: '15px', transform: 'rotate(90deg)', strokeWidth: 2.5 }} />
                                  </button>

                                  {/* Main Information Container */}
                                  <div style={{
                                     flex: '1 1 0px',
                                     backgroundColor: '#ffffff',
                                     borderRadius: fullScreenJobId === job.id ? 0 : '12px',
                                     border: fullScreenJobId === job.id ? 'none' : '1px solid #E2E8F0',
                                     boxShadow: fullScreenJobId === job.id ? 'none' : '0 4px 16px rgba(15, 23, 42, 0.08)',
                                     padding: '20px 22px',
                                     display: 'flex',
                                     flexDirection: 'column',
                                     gap: '18px',
                                     ...(fullScreenJobId === job.id ? {
                                       position: 'absolute',
                                       top: 0,
                                       left: 0,
                                       right: 0,
                                       bottom: 0,
                                       zIndex: 600,
                                       backgroundColor: '#ffffff',
                                       overflowY: 'auto'
                                     } : {})
                                   }}>

                                    {/* Header Bar inside Expanded Screen Container */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                                              {job.fileName || job.engagement}
                                            </h3>
                                            {renderSubStatusPill(job)}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Header Action Buttons */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {/* + Add Issue Button (Available for ALL Roles) */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenCreateForJob(job);
                                          }}
                                          style={{
                                            padding: '7px 14px',
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            color: '#ffffff',
                                            backgroundColor: '#D8001D',
                                            border: 'none',
                                            borderRadius: '7px',
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
                                          <span>Issue</span>
                                        </button>

                                        {/* Audit Report Button (Non-Auditor personas when status !== Not Started) */}
                                        {!isAuditor && job.status !== 'Not Started' && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onWorkOnReport && onWorkOnReport(job, 'audit');
                                            }}
                                            style={{
                                              padding: '7px 14px',
                                              fontSize: '12px',
                                              fontWeight: '700',
                                              color: '#1D4ED8',
                                              backgroundColor: '#EFF6FF',
                                              border: '1px solid #BFDBFE',
                                              borderRadius: '7px',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              boxShadow: '0 1px 4px rgba(29, 78, 216, 0.1)'
                                            }}
                                          >
                                            <PlayCircle style={{ width: '14px', height: '14px', color: '#1D4ED8' }} />
                                            <span>Audit Report</span>
                                          </button>
                                        )}

                                        {/* Executive Summary Report Button (Non-Auditor personas when eligible) */}
                                        {!isAuditor && isExecEligible && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onWorkOnReport && onWorkOnReport(job, 'executive');
                                            }}
                                            style={{
                                              padding: '7px 14px',
                                              fontSize: '12px',
                                              fontWeight: '700',
                                              color: '#4338CA',
                                              backgroundColor: '#EEF2FF',
                                              border: '1px solid #C7D2FE',
                                              borderRadius: '7px',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              boxShadow: '0 1px 4px rgba(67, 56, 202, 0.1)'
                                            }}
                                          >
                                            <ExternalLink style={{ width: '14px', height: '14px', color: '#4338CA' }} />
                                            <span>Executive Summary Report</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Inner Category Tabs inside Expanded Container */}
                                    {(() => {
                                      const bd = getIssueBreakdown(job);
                                      const categoryTabs = [
                                        { id: 'all', label: 'ALL', count: bd.total },
                                        { id: 'it', label: 'IT', count: bd.totalIT },
                                        { id: 'finops', label: 'FINOPS', count: bd.totalFin },
                                        { id: 'completed', label: 'COMPLETED', count: bd.completed }
                                      ];
                                      const currentTab = expandedInnerTabs[job.id] || 'all';

                                      return (
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '20px',
                                          marginBottom: '6px'
                                        }}>
                                          {categoryTabs.map(tab => {
                                            const isActive = currentTab === tab.id;
                                            return (
                                              <button
                                                key={tab.id}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setExpandedInnerTabs(prev => ({ ...prev, [job.id]: tab.id }));
                                                }}
                                                style={{
                                                  padding: '6px 2px 8px 2px',
                                                  fontSize: '12.5px',
                                                  fontWeight: '600',
                                                  color: '#475569',
                                                  backgroundColor: 'transparent',
                                                  border: 'none',
                                                  borderBottom: isActive ? '2px solid #D8001D' : '2px solid transparent',
                                                  cursor: 'pointer',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '6px',
                                                  transition: 'all 0.15s ease',
                                                  outline: 'none'
                                                }}
                                              >
                                                <span>{tab.label}</span>
                                                <span style={{
                                                  fontSize: '10.5px',
                                                  fontWeight: '700',
                                                  color: '#475569',
                                                  backgroundColor: '#F1F5F9',
                                                  borderRadius: '10px',
                                                  padding: '1px 6px',
                                                  lineHeight: '1.2'
                                                }}>
                                                  {tab.count}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}

                                    {/* Inner Table View for Issues inside Expanded Container */}
                                    {(() => {
                                      const activeInnerTab = expandedInnerTabs[job.id] || 'all';
                                      const filteredIssues = getCategoryFilteredIssues(job, activeInnerTab);

                                      if (filteredIssues.length === 0) {
                                        return (
                                          <div style={{
                                            padding: '32px 20px',
                                            textAlign: 'center',
                                            backgroundColor: '#F8FAFC',
                                            borderRadius: '8px',
                                            border: '1px dashed #CBD5E1'
                                          }}>
                                            <AlertCircle style={{ width: '28px', height: '28px', color: '#94A3B8', margin: '0 auto 8px auto' }} />
                                            <h5 style={{ fontSize: '13px', fontWeight: '700', color: '#475569', margin: '0 0 4px 0' }}>
                                              No issues found in this category
                                            </h5>
                                            <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0 }}>
                                              {job.status === 'Not Started'
                                                ? 'This audit is Not Started. Click + Add Issue to create the first issue.'
                                                : 'No issues match the selected category tab filter.'}
                                            </p>
                                            {isAuditor && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenCreateForJob(job);
                                                }}
                                                style={{
                                                  marginTop: '12px',
                                                  padding: '6px 14px',
                                                  fontSize: '11.5px',
                                                  fontWeight: '700',
                                                  color: '#ffffff',
                                                  backgroundColor: '#D8001D',
                                                  border: 'none',
                                                  borderRadius: '6px',
                                                  cursor: 'pointer'
                                                }}
                                              >
                                                + Add Issue
                                              </button>
                                            )}
                                          </div>
                                        );
                                      }

                                      return (
                                        <div style={{ overflowX: 'auto' }}>
                                          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                            <thead>
                                              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: '700' }}>
                                                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Issue & Severity</th>
                                                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Current Stage</th>
                                                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Created By</th>
                                                <th style={{ textAlign: 'left', padding: '10px 14px' }}>Last Updated By</th>
                                                <th style={{ textAlign: 'right', padding: '10px 14px' }}>Actions</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {filteredIssues.map((issue, idx) => (
                                                <tr key={issue.id} style={{ borderBottom: idx < filteredIssues.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                                  {/* 1. Issue & Severity */}
                                                  <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{issue.title}</strong>
                                                      <span style={{ fontSize: '10.5px', fontWeight: '700', color: issue.severity === 'Critical' ? '#991B1B' : '#B45309', backgroundColor: issue.severity === 'Critical' ? '#FEE2E2' : '#FEF3C7', padding: '1px 6px', borderRadius: '10px' }}>
                                                        {issue.severity}
                                                      </span>
                                                    </div>
                                                  </td>

                                                  {/* 2. Current Stage */}
                                                  <td style={{ padding: '12px 14px' }}>
                                                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: '6px' }}>
                                                      {issue.currentLevel || 'Auditor Drafting'}
                                                    </span>
                                                  </td>

                                                  {/* 3. Created By */}
                                                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#334155' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                      <User style={{ width: '12px', height: '12px', color: '#2563EB' }} />
                                                      <span><strong>{issue.createdBy || 'Rachel Green'}</strong></span>
                                                    </div>
                                                  </td>

                                                  {/* 4. Last Updated By */}
                                                  <td style={{ padding: '12px 14px', fontSize: '11.5px', color: '#64748B' }}>
                                                    <span>{issue.lastEditedBy || 'Carlos Mendez'}</span>
                                                    <span style={{ fontSize: '10.5px', color: '#94A3B8', display: 'block' }}>{issue.updatedOn}</span>
                                                  </td>

                                                  {/* 5. Actions Toolbar */}
                                                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                                                      {/* 1. Edit Issue (Available for Auditor and all roles) */}
                                                      {!canEditIssue(issue) ? (
                                                        <button
                                                          onClick={(e) => handleOpenViewIssueForJob(job, issue, e)}
                                                          style={{ padding: '5px 9px', fontSize: '11px', fontWeight: '700', color: '#475569', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                          title="View Issue (Read-Only)"
                                                        >
                                                          <Eye style={{ width: '12px', height: '12px', color: '#64748B' }} />
                                                          <span>View</span>
                                                        </button>
                                                      ) : (
                                                        <button
                                                          onClick={(e) => handleOpenEditIssueForJob(job, issue, e)}
                                                          style={{ padding: '5px 9px', fontSize: '11px', fontWeight: '700', color: '#0F172A', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                          title="Edit Issue"
                                                        >
                                                          <Edit2 style={{ width: '12px', height: '12px' }} />
                                                          <span>Edit</span>
                                                        </button>
                                                      )}

                                                      {(() => {
                                                        const isIssueCompleted = (issue.status === 'Completed' ||
                                                          (issue.currentLevel || '').toLowerCase().includes('completed') ||
                                                          (issue.currentLevel || '').toLowerCase().includes('signed off'));
                                                        const nextStages = getAvailableNextStages(issue.currentLevel);

                                                        if (isIssueCompleted) return null;

                                                        return (
                                                          <>
                                                            {!isAuditor && nextStages.length > 0 && (
                                                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                                                <button
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSendToDropdownIssueId(sendToDropdownIssueId === issue.id ? null : issue.id);
                                                                  }}
                                                                  style={{
                                                                    padding: '5px 9px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    color: '#1D4ED8',
                                                                    backgroundColor: '#EFF6FF',
                                                                    border: '1px solid #BFDBFE',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                  }}
                                                                  title="Send to Role"
                                                                >
                                                                  <span>Send to</span>
                                                                  <ChevronDown style={{
                                                                    width: '12px',
                                                                    height: '12px',
                                                                    transform: sendToDropdownIssueId === issue.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                    transition: 'transform 0.15s ease'
                                                                  }} />
                                                                </button>

                                                                {sendToDropdownIssueId === issue.id && (
                                                                  <div
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{
                                                                      position: 'absolute',
                                                                      top: 'calc(100% + 4px)',
                                                                      left: 0,
                                                                      zIndex: 1000,
                                                                      minWidth: '190px',
                                                                      backgroundColor: '#ffffff',
                                                                      borderRadius: '8px',
                                                                      border: '1px solid #CBD5E1',
                                                                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
                                                                      padding: '5px',
                                                                      display: 'flex',
                                                                      flexDirection: 'column',
                                                                      gap: '2px'
                                                                    }}
                                                                  >
                                                                    {nextStages.map((stg) => (
                                                                      <button
                                                                        key={stg.id}
                                                                        onClick={(e) => handleSendToRole(job.id, issue.id, stg, e)}
                                                                        style={{
                                                                          display: 'flex',
                                                                          alignItems: 'center',
                                                                          justifyContent: 'space-between',
                                                                          padding: '6px 10px',
                                                                          fontSize: '11px',
                                                                          fontWeight: '600',
                                                                          color: '#334155',
                                                                          backgroundColor: 'transparent',
                                                                          border: 'none',
                                                                          borderRadius: '6px',
                                                                          cursor: 'pointer',
                                                                          textAlign: 'left',
                                                                          width: '100%',
                                                                          transition: 'all 0.15s ease'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                      >
                                                                        <span>{stg.label}</span>
                                                                      </button>
                                                                    ))}
                                                                  </div>
                                                                )}
                                                              </div>
                                                            )}
                                                            {!isAuditor && (
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
                                                                    title: "Issue Signed Off",
                                                                    description: `${issue.id} marked as Completed & Signed Off.`
                                                                  });
                                                                }}
                                                                style={{ padding: '5px 9px', fontSize: '11px', fontWeight: '700', color: '#15803D', backgroundColor: '#F0FDF4', border: '1px solid #BBF2D0', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                                title="Sign-off Issue"
                                                              >
                                                                <CheckCircle style={{ width: '12px', height: '12px' }} />
                                                                <span>Sign-off</span>
                                                              </button>
                                                            )}
                                                          </>
                                                        );
                                                      })()}
                                                      {!isAuditor && (
                                                        <button
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            onOpenHistory && onOpenHistory(job);
                                                          }}
                                                          style={{ padding: '5px 9px', fontSize: '11px', fontWeight: '700', color: '#4338CA', backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                          title="Track Log Changes History"
                                                        >
                                                          <Eye style={{ width: '12px', height: '12px' }} />
                                                          <span>History</span>
                                                        </button>
                                                      )}
                                                    </div>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      );
                                    })()}

                                  </div>
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

                                          {/* 2. Sign-off */}
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
                                                title: "Issue Signed Off",
                                                description: `${issue.id} marked as Completed & Signed Off.`
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
                                            title="Sign-off Issue"
                                          >
                                            <CheckCircle style={{ width: '12px', height: '12px' }} />
                                            <span>Sign-off</span>
                                          </button>

                                          {/* 3. View History */}
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
                                            title="Track Log Changes History"
                                          >
                                            <Eye style={{ width: '12px', height: '12px' }} />
                                            <span>History</span>
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
        </div>

        {/* Concept 3 RIGHT SLIDE-OVER WORKBENCH PANEL */}
        {viewMode === 'split-pane' && selectedJobForPanel && (
          <div style={{
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out',
            ...(fullScreenJobId === selectedJobForPanel.id ? {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 600,
              borderRadius: 0,
              border: 'none',
              width: '100%',
              flex: '1 1 100%',
              maxHeight: '100%'
            } : {
              flex: '0 0 45%',
              width: '45%',
              minWidth: '400px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              boxShadow: '-6px 0 24px rgba(15, 23, 42, 0.12)',
              position: 'sticky',
              top: '16px',
              maxHeight: 'calc(100vh - 120px)',
              flexShrink: 0
            })
          }}>

            {/* Panel Top Header Bar */}
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#FAFAFA',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECDD3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Layers style={{ width: '18px', height: '18px', color: '#D8001D' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                      {selectedJobForPanel.fileName || selectedJobForPanel.engagement}
                    </h3>
                    {renderStatusPill(selectedJobForPanel.status)}
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                    Queue Owner: <strong>{selectedJobForPanel.currentOwner}</strong> • Issues: <strong>{(selectedJobForPanel.issuesList || []).length}</strong>
                  </span>
                </div>
              </div>

              {/* Close Panel Button */}
              <button
                onClick={() => {
                  setExpandedRowId(null);
                  setFullScreenJobId(null);
                }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                  e.currentTarget.style.color = '#D8001D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#64748B';
                }}
                title="Close Workbench Panel"
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Panel Content Body (Scrollable) */}
            <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

              {/* Top Action Toolbar inside Panel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleOpenCreateForJob(selectedJobForPanel)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    color: '#D8001D',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECDD3',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Create New Issue"
                >
                  <Plus style={{ width: '13px', height: '13px', color: '#D8001D' }} />
                  <span>Issue</span>
                </button>

                {!isAuditor && selectedJobForPanel.status !== 'Not Started' && (
                  <button
                    onClick={() => onWorkOnReport && onWorkOnReport(selectedJobForPanel, 'audit')}
                    style={{
                      padding: '6px 12px',
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
                    <PlayCircle style={{ width: '13px', height: '13px', color: '#1D4ED8' }} />
                    <span>Audit Report</span>
                  </button>
                )}

                {!isAuditor && [
                  'Audit Report Completed',
                  'Executive Report In Progress',
                  'Executive Report Completed'
                ].includes(selectedJobForPanel.subStatus || (selectedJobForPanel.status === 'Completed' ? 'Executive Report Completed' : '')) && (
                    <button
                      onClick={() => onWorkOnReport && onWorkOnReport(selectedJobForPanel, 'executive')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: '#4338CA',
                        backgroundColor: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <ExternalLink style={{ width: '13px', height: '13px', color: '#4338CA' }} />
                      <span>Executive Summary Report</span>
                    </button>
                  )}

                {/* Icon-based Button for Full Screen View */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullScreenJobId(fullScreenJobId === selectedJobForPanel.id ? null : selectedJobForPanel.id);
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: fullScreenJobId === selectedJobForPanel.id ? '#D8001D' : '#475569',
                    backgroundColor: fullScreenJobId === selectedJobForPanel.id ? '#FEF2F2' : '#F8FAFC',
                    border: `1px solid ${fullScreenJobId === selectedJobForPanel.id ? '#FECDD3' : '#CBD5E1'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (fullScreenJobId !== selectedJobForPanel.id) {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                      e.currentTarget.style.color = '#D8001D';
                      e.currentTarget.style.borderColor = '#FECDD3';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (fullScreenJobId !== selectedJobForPanel.id) {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.color = '#475569';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }
                  }}
                  title={fullScreenJobId === selectedJobForPanel.id ? "Exit Full Screen" : "Full Screen View"}
                >
                  {fullScreenJobId === selectedJobForPanel.id ? (
                    <Minimize2 style={{ width: '13px', height: '13px' }} />
                  ) : (
                    <Maximize2 style={{ width: '13px', height: '13px' }} />
                  )}
                </button>
              </div>

              {/* Metric Filter Tabs inside Panel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {(isAuditor ? [
                  { id: 'total', label: 'Total Issues', count: (selectedJobForPanel.issuesList || []).length },
                  { id: 'my-contributed', label: 'Contributed', count: getMyIssuesCount(selectedJobForPanel) },
                  { id: 'others-contributions', label: 'Others', count: getOthersIssuesCount(selectedJobForPanel) }
                ] : [
                  { id: 'total', label: 'Total', count: (selectedJobForPanel.issuesList || []).length },
                  { id: 'pending-me', label: 'Pending Me', count: getPendingWithMeCount(selectedJobForPanel) },
                  { id: 'external', label: 'External', count: getExternalContributionsCount(selectedJobForPanel) },
                  { id: 'completed-my-side', label: 'My Completed', count: getCompletedMySideCount(selectedJobForPanel) },
                  { id: 'overall-completed', label: 'Overall Done', count: getOverallCompletedCount(selectedJobForPanel) }
                ]).map(tab => {
                  const currentTab = expandedInnerTabs[selectedJobForPanel.id] || 'total';
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setExpandedInnerTabs(prev => ({ ...prev, [selectedJobForPanel.id]: tab.id }))}
                      style={{
                        padding: '4px 9px',
                        fontSize: '11px',
                        fontWeight: isActive ? '700' : '500',
                        color: isActive ? '#D8001D' : '#475569',
                        backgroundColor: isActive ? '#FEF2F2' : '#F8FAFC',
                        border: `1px solid ${isActive ? '#FECDD3' : '#E2E8F0'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: '800',
                        color: isActive ? '#ffffff' : '#64748B',
                        backgroundColor: isActive ? '#D8001D' : '#CBD5E1',
                        borderRadius: '8px',
                        padding: '1px 5px'
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Spacious Vertical Issues Stream */}
              {(() => {
                const currentTabKey = expandedInnerTabs[selectedJobForPanel.id] || 'total';
                const displayedIssues = getFilteredIssuesForInnerTab(selectedJobForPanel, currentTabKey);

                if (displayedIssues.length === 0) {
                  return (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '12.5px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      No issues match the selected filter.
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {displayedIssues.map((iss, idx) => (
                      <div
                        key={iss.id || idx}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        {/* Issue Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '700',
                              backgroundColor: '#FEF2F2',
                              color: '#D8001D',
                              border: '1px solid #FECDD3',
                              fontFamily: 'monospace'
                            }}>
                              {iss.id}
                            </span>
                            <span style={{
                              padding: '1px 7px',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: '800',
                              backgroundColor: iss.severity === 'Critical' ? '#FEF2F2' : iss.severity === 'High' ? '#FFFBEB' : '#F0FDF4',
                              color: iss.severity === 'Critical' ? '#991B1B' : iss.severity === 'High' ? '#B45309' : '#166534',
                              border: `1px solid ${iss.severity === 'Critical' ? '#FCA5A5' : iss.severity === 'High' ? '#FDE68A' : '#BBF2D0'}`
                            }}>
                              {iss.severity}
                            </span>
                          </div>

                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: '#F1F5F9',
                            color: '#0F172A',
                            border: '1px solid #CBD5E1'
                          }}>
                            {iss.currentLevel || 'Auditor Drafting'}
                          </span>
                        </div>

                        {/* Issue Title */}
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                          {iss.title}
                        </h4>

                        {/* Issue Meta */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User style={{ width: '12px', height: '12px' }} />
                            <span>Created by: <strong>{iss.createdBy}</strong></span>
                          </div>
                          <span>Edited by <strong>{iss.lastEditedBy}</strong></span>
                        </div>

                        {/* Issue Actions Toolbar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                          {!canEditIssue(iss) ? (
                            <button
                              onClick={(e) => handleOpenViewIssueForJob(selectedJobForPanel, iss, e)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#475569',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="View Issue (Read-Only)"
                            >
                              <Eye style={{ width: '11px', height: '11px', color: '#64748B' }} />
                              <span>View</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => handleOpenEditIssueForJob(selectedJobForPanel, iss, e)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: '#334155',
                                  backgroundColor: '#F8FAFC',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Edit Issue"
                              >
                                <Edit2 style={{ width: '11px', height: '11px' }} />
                                <span>Edit</span>
                              </button>

                          {(() => {
                            const isIssueCompleted = (iss.status === 'Completed' ||
                              (iss.currentLevel || '').toLowerCase().includes('completed') ||
                              (iss.currentLevel || '').toLowerCase().includes('signed off'));
                            const nextStages = getAvailableNextStages(iss.currentLevel);

                            if (isIssueCompleted) return null;

                            return (
                              <>
                                {!isAuditor && nextStages.length > 0 && (
                                  <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSendToDropdownIssueId(sendToDropdownIssueId === iss.id ? null : iss.id);
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: '#1D4ED8',
                                        backgroundColor: '#EFF6FF',
                                        border: '1px solid #BFDBFE',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                      title="Send to Role"
                                    >
                                      <span>Send to</span>
                                      <ChevronDown style={{
                                        width: '11px',
                                        height: '11px',
                                        transform: sendToDropdownIssueId === iss.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.15s ease'
                                      }} />
                                    </button>

                                    {sendToDropdownIssueId === iss.id && (
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          position: 'absolute',
                                          top: 'calc(100% + 4px)',
                                          left: 0,
                                          zIndex: 1000,
                                          minWidth: '170px',
                                          backgroundColor: '#ffffff',
                                          borderRadius: '8px',
                                          border: '1px solid #CBD5E1',
                                          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
                                          padding: '5px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '2px'
                                        }}
                                      >
                                        {nextStages.map((stg) => (
                                          <button
                                            key={stg.id}
                                            onClick={(e) => handleSendToRole(selectedJobForPanel.id, iss.id, stg, e)}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              padding: '6px 10px',
                                              fontSize: '11px',
                                              fontWeight: '600',
                                              color: '#334155',
                                              backgroundColor: 'transparent',
                                              border: 'none',
                                              borderRadius: '6px',
                                              cursor: 'pointer',
                                              textAlign: 'left',
                                              width: '100%',
                                              transition: 'all 0.15s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                          >
                                            <span>{stg.label}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {!isAuditor && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setJobs(prev => prev.map(j => {
                                        if (j.id === selectedJobForPanel.id) {
                                          return {
                                            ...j,
                                            issuesList: (j.issuesList || []).map(item => item.id === iss.id ? { ...item, status: 'Completed', currentLevel: 'Completed & Signed Off' } : item)
                                          };
                                        }
                                        return j;
                                      }));
                                      setToastMessage && setToastMessage({
                                        title: "Issue Signed Off",
                                        description: `Issue ${iss.id} status updated to Completed & Signed Off.`
                                      });
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      color: '#15803D',
                                      backgroundColor: '#F0FDF4',
                                      border: '1px solid #BBF2D0',
                                      borderRadius: '5px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Sign-off Issue"
                                  >
                                    <CheckCircle style={{ width: '11px', height: '11px' }} />
                                    <span>Sign-off</span>
                                  </button>
                                )}
                              </>
                            );
                          })()}

                          {!isAuditor && (
                            <button
                              onClick={() => onOpenDiscussionPoints && onOpenDiscussionPoints(selectedJobForPanel)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#4338CA',
                                backgroundColor: '#EEF2FF',
                                border: '1px solid #C7D2FE',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye style={{ width: '11px', height: '11px' }} />
                              <span>Lineage</span>
                            </button>
                          )}
                            </>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                );
              })()}

            </div>

          </div>
        )}
      </div>

      {/* Create / Edit / View Issue Drawer Overlay */}
      <CreateIssueDrawerNew
        isOpen={isCreateDrawerOpen}
        onClose={() => {
          setIsCreateDrawerOpen(false);
          setSelectedJobForIssue(null);
          setEditingIssueData(null);
          setIsViewOnlyDrawerMode(false);
        }}
        onSaveDiscussionPoint={handleSaveDiscussionPoint}
        defaultFunction={selectedJobForIssue?.tech || 'IT'}
        initialData={editingIssueData}
        isReadOnly={isViewOnlyDrawerMode}
      />

      {/* Embedded CSS Keyframes for Animations & Hover Actions */}
      <style>{`
      .table-row-interactive .row-action-buttons {
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
      }
      .table-row-interactive:hover .row-action-buttons,
      .table-row-interactive.active-selected .row-action-buttons {
        opacity: 1;
        visibility: visible;
      }
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
