import React, { useState } from 'react';
import { 
  Search, RotateCcw, Filter, ArrowUpDown, Clock, 
  FileText, ShieldCheck, UserCheck, AlertCircle, ChevronRight 
} from 'lucide-react';
import { mockReportingJobs } from '../data/reportingMockData';

export default function ReportingQueueView({ 
  selectedJobId, 
  onSelectJob 
}) {
  const [jobs, setJobs] = useState(mockReportingJobs);

  // Filters State
  const [executionFilter, setExecutionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [agingFilter, setAgingFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort State
  const [sortField, setSortField] = useState('lastUpdated');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    if (executionFilter !== 'All' && job.executionStatus.toLowerCase() !== executionFilter.toLowerCase()) return false;
    if (statusFilter !== 'All' && job.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (ownerFilter !== 'All' && job.currentOwner.toLowerCase() !== ownerFilter.toLowerCase()) return false;
    if (agingFilter !== 'All') {
      const days = parseInt(job.aging.split(' ')[0], 10) || 0;
      if (agingFilter === '< 5 days' && days >= 5) return false;
      if (agingFilter === '5-10 days' && (days < 5 || days > 10)) return false;
      if (agingFilter === '> 10 days' && days <= 10) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = job.id.toLowerCase().includes(q) ||
                    job.engagement.toLowerCase().includes(q) ||
                    job.currentOwner.toLowerCase().includes(q) ||
                    job.currentQueue.toLowerCase().includes(q) ||
                    job.fileName.toLowerCase().includes(q);
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
    setExecutionFilter('All');
    setStatusFilter('All');
    setOwnerFilter('All');
    setAgingFilter('All');
    setSearchQuery('');
  };

  const renderStatusBadge = (status) => {
    let bg = '#ECFDF5'; let text = '#047857'; let border = '#A7F3D0';
    if (status === 'Under Review') { bg = '#FFFBEB'; text = '#B45309'; border = '#FDE68A'; }
    else if (status === 'In Progress') { bg = '#EFF6FF'; text = '#2563EB'; border = '#BFDBFE'; }

    return (
      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '9999px', backgroundColor: bg, color: text, border: `1px solid ${border}` }}>
        {status}
      </span>
    );
  };

  const renderQueueBadge = (queue) => {
    let bg = '#F8FAFC'; let text = '#475569';
    if (queue === 'Director') { bg = '#FEF2F2'; text = '#991B1B'; }
    else if (queue === 'TC Auditor') { bg = '#EFF6FF'; text = '#1E40AF'; }
    else if (queue === 'Business Owner') { bg = '#ECFDF5'; text = '#065F46'; }

    return (
      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: bg, color: text, border: '1px solid #CBD5E1' }}>
        {queue}
      </span>
    );
  };

  return (
    <div className="full-width-queue">
      
      {/* Slick Single-Row Filter Toolbar (Identical Structure to Fieldwork) */}
      <div className="single-row-filter-panel">
        
        {/* Execution Status Filter */}
        <div className="filter-input-group">
          <span className="filter-label">Execution Status:</span>
          <select value={executionFilter} onChange={(e) => setExecutionFilter(e.target.value)} className="filter-select">
            <option value="All">All Executions</option>
            <option value="Completed">Completed</option>
            <option value="Running">Running</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-input-group">
          <span className="filter-label">Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Current Owner Filter */}
        <div className="filter-input-group">
          <span className="filter-label">Current Owner:</span>
          <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="filter-select">
            <option value="All">All Owners</option>
            <option value="Rachel Green">Rachel Green</option>
            <option value="Kevin Zhang">Kevin Zhang</option>
            <option value="Marcus Vance">Marcus Vance</option>
            <option value="Sarah Jenkins">Sarah Jenkins</option>
          </select>
        </div>

        {/* Aging Filter */}
        <div className="filter-input-group">
          <span className="filter-label">Aging:</span>
          <select value={agingFilter} onChange={(e) => setAgingFilter(e.target.value)} className="filter-select">
            <option value="All">All Aging</option>
            <option value="< 5 days">&lt; 5 days</option>
            <option value="5-10 days">5 - 10 days</option>
            <option value="> 10 days">&gt; 10 days</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search style={{ width: '14px', height: '14px', color: '#94A3B8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search Job ID, engagement, owner..."
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

      </div>

      {/* Borderless Table Container (Identical Structure to Fieldwork) */}
      <div className="table-card-container">
        <div className="table-scroll-body">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Job ID</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('engagement')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Engagement</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('currentOwner')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Current Owner</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('currentQueue')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Current Queue</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('lastUpdated')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Last Updated Datetime</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Status</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('aging')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Aging</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <Filter style={{ width: '36px', height: '36px', color: '#CBD5E1', margin: '0 auto 8px' }} />
                    <p style={{ fontWeight: '600', color: '#334155' }}>No reporting jobs matched your filters</p>
                    <p style={{ fontSize: '11px', color: '#94A3B8' }}>Try clearing your search query or status filters.</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <tr 
                      key={job.id} 
                      onClick={() => onSelectJob(job.id)}
                      className={`table-row-interactive ${isSelected ? 'active-selected' : ''}`}
                    >
                      {/* 1. Job ID */}
                      <td style={{ fontWeight: '800', color: '#D8001D', fontSize: '13px' }}>
                        {job.id}
                      </td>

                      {/* 2. Engagement */}
                      <td style={{ fontWeight: '700', color: '#0F172A', fontSize: '12.5px' }}>
                        {job.engagement}
                      </td>

                      {/* 3. Current Owner */}
                      <td style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: '600' }}>
                        {job.currentOwner}
                      </td>

                      {/* 4. Current Queue */}
                      <td>
                        {renderQueueBadge(job.currentQueue)}
                      </td>

                      {/* 5. Last Updated Datetime */}
                      <td style={{ fontSize: '12px', color: '#64748B' }}>
                        {job.lastUpdated}
                      </td>

                      {/* 6. Status */}
                      <td>
                        {renderStatusBadge(job.status)}
                      </td>

                      {/* 7. Aging */}
                      <td style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock style={{ width: '13px', height: '13px', color: '#D8001D' }} />
                        <span>{job.aging}</span>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
