import React, { useState } from 'react';
import { 
  ArrowLeft, Search, RotateCcw, Plus, Edit2, AlertOctagon, 
  CheckCircle2, History, ShieldCheck, DollarSign, Filter, ArrowUpDown
} from 'lucide-react';
import { mockDiscussionPoints } from '../data/mockData';
import CreateDiscussionDrawer from '../components/CreateDiscussionDrawer';

export default function DiscussionPointsView({ 
  report, 
  initialFunction = 'All', 
  onBackToQueue,
  onOpenHistoryModal
}) {
  const [points, setPoints] = useState(mockDiscussionPoints);
  const [funcFilter, setFuncFilter] = useState(initialFunction);
  const [critFilter, setCritFilter] = useState('All');
  const [addedByFilter, setAddedByFilter] = useState('All');
  const [updatedByFilter, setUpdatedByFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('rowNum');
  const [sortAsc, setSortAsc] = useState(true);

  // Create & Edit Drawer state
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);

  const reportFileName = report ? report.fileName : "BiosenseWebster_Catheters_Audit";

  // Filter Points
  const filteredPoints = points.filter(p => {
    if (funcFilter !== 'All' && p.functionType.toLowerCase() !== funcFilter.toLowerCase()) return false;
    if (critFilter !== 'All' && p.criticality.toLowerCase() !== critFilter.toLowerCase()) return false;
    if (addedByFilter !== 'All' && p.addedBy.toLowerCase() !== addedByFilter.toLowerCase()) return false;
    if (updatedByFilter !== 'All' && p.lastUpdatedBy.toLowerCase() !== updatedByFilter.toLowerCase()) return false;
    if (statusFilter !== 'All' && p.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.header.toLowerCase().includes(q) || 
                    p.description.toLowerCase().includes(q) ||
                    p.addedBy.toLowerCase().includes(q);
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

  const handleToggleIssue = (pointId) => {
    setPoints(prev => prev.map(p => {
      if (p.id === pointId) {
        return { ...p, isIssue: !p.isIssue };
      }
      return p;
    }));
  };

  const handleClearFilters = () => {
    setFuncFilter('All');
    setCritFilter('All');
    setAddedByFilter('All');
    setUpdatedByFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
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
  };

  const handleOpenEdit = (point) => {
    setEditingPoint(point);
    setIsCreateDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingPoint(null);
    setIsCreateDrawerOpen(true);
  };

  const renderCriticalityBadge = (crit) => {
    let bg = '#F8FAFC'; let text = '#475569'; let border = '#E2E8F0';
    if (crit === 'Critical') { bg = '#FEF2F2'; text = '#991B1B'; border = '#FCA5A5'; }
    else if (crit === 'High') { bg = '#FFF7ED'; text = '#C2410C'; border = '#FFEDD5'; }
    else if (crit === 'Medium') { bg = '#FFFBEB'; text = '#B45309'; border = '#FDE68A'; }
    else if (crit === 'Low') { bg = '#ECFDF5'; text = '#047857'; border = '#A7F3D0'; }

    return (
      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px', backgroundColor: bg, color: text, border: `1px solid ${border}` }}>
        {crit}
      </span>
    );
  };

  const renderFunctionBadge = (func) => {
    const isIT = func === 'IT';
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 10px',
        borderRadius: '6px',
        backgroundColor: isIT ? '#EFF6FF' : '#ECFDF5',
        color: isIT ? '#2563EB' : '#059669',
        border: isIT ? '1px solid #BFDBFE' : '1px solid #A7F3D0',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {isIT ? <ShieldCheck style={{ width: '12px', height: '12px' }} /> : <DollarSign style={{ width: '12px', height: '12px' }} />}
        <span>{func}</span>
      </span>
    );
  };

  const renderStatusBadge = (status) => {
    const isActive = status === 'Active';
    return (
      <span style={{
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 10px',
        borderRadius: '9999px',
        backgroundColor: isActive ? '#ECFDF5' : '#F1F5F9',
        color: isActive ? '#047857' : '#64748B',
        border: isActive ? '1px solid #A7F3D0' : '1px solid #CBD5E1'
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--slate-50)', position: 'relative' }}>
      
      {/* Title Sub-Header Banner */}
      <div className="job-queue-title-banner" style={{ padding: '12px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBackToQueue}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}
          >
            <ArrowLeft style={{ width: '15px', height: '15px' }} />
            <span>Back</span>
          </button>
          
          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.3)', height: '20px' }}></div>

          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
            Discussion Points — <span style={{ fontWeight: '400', opacity: 0.9 }}>{reportFileName}</span>
          </h2>
        </div>
      </div>

      {/* Main Content Area (Single-Row Filters + Borderless Table) */}
      <div className="main-container">
        <div className="full-width-queue">

          {/* Slick Single-Row Filter Toolbar */}
          <div className="single-row-filter-panel" style={{ padding: '16px 0 24px 0' }}>
            
            {/* Function Filter */}
            <div className="filter-input-group">
              <span className="filter-label">Function:</span>
              <select value={funcFilter} onChange={(e) => setFuncFilter(e.target.value)} className="filter-select">
                <option value="All">All Functions</option>
                <option value="IT">IT</option>
                <option value="FinOps">FinOps</option>
              </select>
            </div>

            {/* Criticality Filter */}
            <div className="filter-input-group">
              <span className="filter-label">Criticality:</span>
              <select value={critFilter} onChange={(e) => setCritFilter(e.target.value)} className="filter-select">
                <option value="All">All Criticalities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Added By Filter */}
            <div className="filter-input-group">
              <span className="filter-label">Added By:</span>
              <select value={addedByFilter} onChange={(e) => setAddedByFilter(e.target.value)} className="filter-select">
                <option value="All">All Users</option>
                <option value="Kevin Zhang">Kevin Zhang</option>
                <option value="Rachel Green">Rachel Green</option>
                <option value="Marcus Vance">Marcus Vance</option>
              </select>
            </div>

            {/* Last Updated By Filter */}
            <div className="filter-input-group">
              <span className="filter-label">Updated By:</span>
              <select value={updatedByFilter} onChange={(e) => setUpdatedByFilter(e.target.value)} className="filter-select">
                <option value="All">All Users</option>
                <option value="Marcus Vance">Marcus Vance</option>
                <option value="David Miller">David Miller</option>
                <option value="Sarah Jenkins">Sarah Jenkins</option>
                <option value="Kevin Zhang">Kevin Zhang</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-input-group">
              <span className="filter-label">Status:</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Search Input on Discussion Header */}
            <div className="search-input-wrapper">
              <Search style={{ width: '14px', height: '14px', color: '#94A3B8', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search discussion header or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-field-input"
              />
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={handleClearFilters}
              className="btn btn-secondary"
              style={{ height: '36px', padding: '0 12px', fontSize: '11px' }}
              title="Clear all filters"
            >
              <RotateCcw style={{ width: '12px', height: '12px' }} />
              <span>Clear Filters</span>
            </button>

            {/* Create Discussion Button */}
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary"
              style={{ height: '36px', padding: '0 14px', fontSize: '12px', fontWeight: '700' }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              <span>Create Discussion</span>
            </button>

          </div>

          {/* Borderless Table Container */}
          <div className="table-card-container">
            <div className="table-scroll-body">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                    <th onClick={() => handleSort('header')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Discussion Header</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('criticality')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Criticality</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('functionType')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Function</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th style={{ minWidth: '240px' }}>Description</th>
                    <th onClick={() => handleSort('addedBy')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Added By</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('lastUpdatedBy')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Last Updated By</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                      <div className="th-content">
                        <span>Status</span>
                        <ArrowUpDown className="th-sort-icon" />
                      </div>
                    </th>
                    <th style={{ textAlign: 'center', minWidth: '220px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPoints.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                        <Filter style={{ width: '36px', height: '36px', color: '#CBD5E1', margin: '0 auto 8px' }} />
                        <p style={{ fontWeight: '600', color: '#334155' }}>No discussion points matched your filters</p>
                        <p style={{ fontSize: '11px', color: '#94A3B8' }}>Try clearing your search query or function filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPoints.map((point, index) => (
                      <tr key={point.id} className="table-row-interactive">
                        {/* 1. Row Number */}
                        <td style={{ textAlign: 'center', fontWeight: '700', color: '#64748B', fontSize: '12px' }}>
                          {index + 1}
                        </td>

                        {/* 2. Discussion Header */}
                        <td>
                          <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>
                            {point.header}
                          </span>
                        </td>

                        {/* 3. Criticality Badge */}
                        <td>
                          {renderCriticalityBadge(point.criticality)}
                        </td>

                        {/* 4. Function Badge */}
                        <td>
                          {renderFunctionBadge(point.functionType)}
                        </td>

                        {/* 5. Description */}
                        <td style={{ fontSize: '12.5px', color: '#334155', maxWidth: '280px', lineHeight: '1.4' }}>
                          {point.description}
                        </td>

                        {/* 6. Added By */}
                        <td style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: '600' }}>
                          {point.addedBy}
                        </td>

                        {/* 7. Last Updated By */}
                        <td style={{ fontSize: '12.5px', color: '#475569' }}>
                          {point.lastUpdatedBy}
                        </td>

                        {/* 8. Status */}
                        <td>
                          {renderStatusBadge(point.status)}
                        </td>

                        {/* 9. Actions (Edit opens side-by-side drawer, Mark as Issue, View History) */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEdit(point)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                              title="Edit Discussion Point in Side-by-Side View"
                            >
                              <Edit2 style={{ width: '12px', height: '12px', color: '#2563EB' }} />
                              <span>Edit</span>
                            </button>

                            {/* Mark as Issue / Not an issue Toggle Button */}
                            <button
                              onClick={() => handleToggleIssue(point.id)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: point.isIssue ? '1px solid #A7F3D0' : '1px solid #FCA5A5',
                                backgroundColor: point.isIssue ? '#ECFDF5' : '#FFF0F2',
                                color: point.isIssue ? '#047857' : '#D8001D',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}
                              title={point.isIssue ? "Click to revert (Not an issue)" : "Click to mark as an issue"}
                            >
                              <AlertOctagon style={{ width: '12px', height: '12px' }} />
                              <span>{point.isIssue ? "Not an issue" : "Mark as Issue"}</span>
                            </button>

                            {/* View History Button */}
                            <button
                              onClick={() => onOpenHistoryModal && onOpenHistoryModal(report)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#ffffff',
                                color: '#475569',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                              title="View History Log"
                            >
                              <History style={{ width: '12px', height: '12px', color: '#6366F1' }} />
                              <span>History</span>
                            </button>

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
      <CreateDiscussionDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => {
          setIsCreateDrawerOpen(false);
          setEditingPoint(null);
        }}
        onSaveDiscussionPoint={handleSaveDiscussionPoint}
        defaultFunction={funcFilter !== 'All' ? funcFilter : 'IT'}
        initialData={editingPoint}
      />

    </div>
  );
}
