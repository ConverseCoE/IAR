import React, { useState } from 'react';
import { 
  Search, RotateCcw, FileText, ArrowUpDown, ChevronRight
} from 'lucide-react';

export default function JobQueueView({ 
  reports, 
  selectedReportId, 
  onSelectReport,
  onOpenITModal,
  onOpenFinOpsModal,
  onOpenIssueModal,
  isDrawerOpen
}) {
  const [execFilter, setExecFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('fileName');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter & Sort Reports
  const filteredReports = reports
    .filter(r => {
      if (execFilter !== 'All' && r.executionStatus.toLowerCase() !== execFilter.toLowerCase()) return false;
      if (statusFilter !== 'All' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = r.fileName.toLowerCase().includes(q) || 
                      r.fullName.toLowerCase().includes(q) ||
                      r.status.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleClearFilters = () => {
    setExecFilter('All');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const renderStatusPill = (statusText) => {
    const s = statusText.toLowerCase();
    let pillClass = "status-pill-not-started";
    let dotClass = "status-dot-not-started";

    if (s === 'completed' || s === 'approved') {
      pillClass = "status-pill-completed";
      dotClass = "status-dot-completed";
    } else if (s === 'in progress') {
      pillClass = "status-pill-in-progress";
      dotClass = "status-dot-in-progress";
    } else if (s === 'in review') {
      pillClass = "status-pill-in-review";
      dotClass = "status-dot-in-review";
    }

    return (
      <span className={`status-pill ${pillClass}`}>
        <span className={`status-dot ${dotClass}`}></span>
        <span>{statusText}</span>
      </span>
    );
  };

  return (
    <div className="full-width-queue">

      {/* Slick Single-Row Filter Panel */}
      <div className="single-row-filter-panel">
        
        {/* Execution Status */}
        <div className="filter-input-group">
          <span className="filter-label">Execution:</span>
          <select
            value={execFilter}
            onChange={(e) => setExecFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Not Started">Not Started</option>
          </select>
        </div>

        {/* Overall Status */}
        <div className="filter-input-group">
          <span className="filter-label">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">Select Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Validation Start Date */}
        <div className="filter-input-group">
          <span className="filter-label">Start:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="filter-date-input"
          />
        </div>

        {/* Validation End Date */}
        <div className="filter-input-group">
          <span className="filter-label">End:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="filter-date-input"
          />
        </div>

        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search style={{ width: '14px', height: '14px', color: '#94A3B8', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search phase / Dashboard / File..."
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

      {/* Borderless Table Container */}
      <div className="table-card-container">
        <div className="table-scroll-body">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('fileName')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>File Name</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('startDate')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Start Date & time</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('executionStatus')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Execution status</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('validationStatus')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Validation status</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('lastUpdate')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Last update Date & time</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    <span>Status</span>
                    <ArrowUpDown className="th-sort-icon" />
                  </div>
                </th>
                {/* Nameless Column for Right Arrow Indicator */}
                <th style={{ width: '40px', padding: '16px 12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <FileText style={{ width: '36px', height: '36px', color: '#CBD5E1', margin: '0 auto 8px' }} />
                    <p style={{ fontWeight: '600', color: '#334155' }}>No reports matched your filters</p>
                    <p style={{ fontSize: '11px', color: '#94A3B8' }}>Try clearing your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  /* Selection highlight is ONLY active when right drawer section is open */
                  const isSelected = isDrawerOpen && selectedReportId === report.id;

                  return (
                    <tr
                      key={report.id}
                      onClick={() => onSelectReport(report.id)}
                      className={`table-row-interactive ${isSelected ? 'active-selected' : ''}`}
                    >
                      {/* Clean File Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="file-icon-box">
                            <FileText style={{ width: '16px', height: '16px' }} />
                          </div>
                          <span className="file-name-text">
                            {report.fileName}
                          </span>
                        </div>
                      </td>

                      {/* Start Date & Time */}
                      <td style={{ color: '#475569', fontSize: '12.5px' }}>
                        <span style={{ fontWeight: '600', color: '#1E293B' }}>{report.startDate.split(' ')[0]}</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '6px' }}>{report.startDate.split(' ').slice(1).join(' ')}</span>
                      </td>

                      {/* Execution Status Premium Pill */}
                      <td>
                        {renderStatusPill(report.executionStatus)}
                      </td>

                      {/* Validation Status Premium Pill */}
                      <td>
                        {renderStatusPill(report.validationStatus)}
                      </td>

                      {/* Last Update Date & Time */}
                      <td style={{ color: '#475569', fontSize: '12.5px' }}>
                        <span style={{ fontWeight: '600', color: '#1E293B' }}>{report.lastUpdate.split(' ')[0]}</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '6px' }}>{report.lastUpdate.split(' ').slice(1).join(' ')}</span>
                      </td>

                      {/* Overall Status Premium Pill */}
                      <td>
                        {renderStatusPill(report.status)}
                      </td>

                      {/* Right Arrow Openable Indicator (No Actions Header / Details Button) */}
                      <td style={{ textAlign: 'center', padding: '14px 12px', width: '40px' }}>
                        <ChevronRight 
                          className="row-chevron-icon" 
                          style={{ 
                            width: '16px', 
                            height: '16px', 
                            color: isSelected ? '#D8001D' : '#94A3B8',
                            transition: 'all 0.2s ease'
                          }} 
                        />
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
