import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import JobQueueView from './components/JobQueueView';
import AuditDetailDrawer from './components/AuditDetailDrawer';
import DiscussionModal from './components/DiscussionModal';
import IssueModal from './components/IssueModal';
import WorkflowModal from './components/WorkflowModal';
import HistoryModal from './components/HistoryModal';
import DiscussionPointsView from './views/DiscussionPointsView';
import DiscussionPointsNewView from './views/DiscussionPointsNewView';
import ReportingQueueView from './views/ReportingQueueView';
import ReportingNewQueueView from './views/ReportingNewQueueView';
import WorkOnReportView from './views/WorkOnReportView';
import WorkOnReportNewView from './views/WorkOnReportNewView';
import WorkOnExecReportView from './views/WorkOnExecReportView';
import WorkOnExecReportNewView from './views/WorkOnExecReportNewView';
import ReportingDetailDrawer from './components/ReportingDetailDrawer';
import ReportingNewDetailDrawer from './components/ReportingNewDetailDrawer';
import CreateIssueDrawerNew from './components/CreateIssueDrawerNew';
import { initialReports } from './data/mockData';
import { mockReportingJobs } from './data/reportingMockData';
import { mockReportingNewJobs } from './data/reportingNewMockData';
import {
  PrePlanningView,
  PlanningView,
  WrapUpView,
  DashboardsView
} from './components/PhaseViews';
import { MoreVertical, Check, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [currentPhase, setCurrentPhase] = useState('fieldwork');
  const [reports, setReports] = useState(initialReports);
  const [selectedReportId, setSelectedReportId] = useState("REP-2026-006"); // BiosenseWebster_Catheters_Audit as default
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reporting Module Drawer & Work On Report Studio State: { job, type: 'audit' | 'executive' }
  const [selectedReportingJobId, setSelectedReportingJobId] = useState(null);
  const [activeWorkOnReportJob, setActiveWorkOnReportJob] = useState(null);

  // Global Create Issue Drawer State for Auditor 'Not Started' Jobs
  const [isCreateIssueDrawerOpen, setIsCreateIssueDrawerOpen] = useState(false);
  const [createIssueJob, setCreateIssueJob] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleOpenCreateIssue = (job) => {
    setCreateIssueJob(job);
    setIsCreateIssueDrawerOpen(true);
  };

  const handleSaveIssueFromDrawer = (savedPoint) => {
    if (createIssueJob) {
      setReports(prev => prev.map(r => {
        if (r.id === createIssueJob.id || r.fileName === createIssueJob.fileName || r.engagement === createIssueJob.engagement) {
          return {
            ...r,
            status: 'In Progress'
          };
        }
        return r;
      }));
    }
    setIsCreateIssueDrawerOpen(false);
    setCreateIssueJob(null);

    setToastMessage({
      title: "Issue Saved Successfully",
      description: `Issue #${savedPoint.issueId || savedPoint.id} has been saved to the audit queue and synthesized with AI.`
    });
  };

  // Application Active User Role: 'auditor' | 'team-coordinator' | 'manager' | 'director' | 'vp' | 'business-head' | 'primary-business-contact'
  const [userRole, setUserRole] = useState('manager');

  // Audit Queue Title Banner Dropdown State: 'default' | 'with-substatus' | 'inline-action' | 'expand-action'
  const [auditQueueViewMode, setAuditQueueViewMode] = useState('default');
  const [isTitleMenuOpen, setIsTitleMenuOpen] = useState(false);
  const titleMenuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (titleMenuRef.current && !titleMenuRef.current.contains(event.target)) {
        setIsTitleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [activeView, setActiveView] = useState('queue'); // 'queue' or 'discussion-points'
  const [discussionFuncFilter, setDiscussionFuncFilter] = useState('All');

  // Modals state
  const [discussionModal, setDiscussionModal] = useState({
    isOpen: false,
    type: 'IT',
    report: null
  });

  const [issueModal, setIssueModal] = useState({
    isOpen: false,
    report: null
  });

  const [workflowModal, setWorkflowModal] = useState({
    isOpen: false,
    title: '',
    workflows: []
  });

  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    report: null
  });

  const activeReportingNewJob = mockReportingNewJobs.find(j => j.id === selectedReportId || j.id === selectedReportingJobId || j.reportId === selectedReportId) || null;
  const selectedReport = (currentPhase === 'reporting-new' && activeReportingNewJob)
    ? activeReportingNewJob
    : (reports.find(r => r.id === selectedReportId) || reports.find(r => r.id === "REP-2026-006") || reports[0]);

  const reportingJobsList = currentPhase === 'reporting-new' ? mockReportingNewJobs : mockReportingJobs;
  const selectedReportingJob = reportingJobsList.find(j => j.id === selectedReportingJobId) || null;

  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedReportId(null);
  };

  const handleSelectReportingJob = (jobId) => {
    setSelectedReportingJobId(selectedReportingJobId === jobId ? null : jobId);
  };

  const handleCloseReportingDrawer = () => {
    setSelectedReportingJobId(null);
  };

  // Open Full-Screen Discussion Points View
  const handleOpenDiscussionPointsView = (funcType = 'All') => {
    setDiscussionFuncFilter(funcType);
    setActiveView('discussion-points');
  };

  const handleBackToQueue = () => {
    setActiveView('queue');
  };

  // Discussion Save Handler
  const handleSaveDiscussion = (type, items) => {
    setReports(prev => prev.map(r => {
      if (selectedReport && r.id === selectedReport.id) {
        if (type === 'IT') {
          return {
            ...r,
            itDiscussion: {
              ...r.itDiscussion,
              items: items,
              status: items.length > 0 ? "In Progress" : "Not started"
            }
          };
        } else {
          return {
            ...r,
            finOpsDiscussion: {
              ...r.finOpsDiscussion,
              items: items,
              status: items.length > 0 ? "In Progress" : "Not started"
            }
          };
        }
      }
      return r;
    }));
  };

  // Issue Save Handler
  const handleSaveIssues = (reportId, newIssues) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          issueIndicator: {
            count: newIssues.length,
            critical: newIssues.filter(i => i.severity === 'Critical').length,
            minor: newIssues.filter(i => i.severity === 'Minor').length,
            issues: newIssues
          }
        };
      }
      return r;
    }));
  };

  const handleOpenITModal = (reportObj) => {
    handleOpenDiscussionPointsView('IT');
  };

  const handleOpenFinOpsModal = (reportObj) => {
    handleOpenDiscussionPointsView('FinOps');
  };

  const handleOpenIssueModal = (reportObj) => {
    setIssueModal({
      isOpen: true,
      report: reportObj || selectedReport
    });
  };

  const handleOpenWorkflowModal = ({ title, workflows }) => {
    setWorkflowModal({
      isOpen: true,
      title: title || "Workflow Stages",
      workflows: workflows || []
    });
  };

  const handleOpenHistoryModal = (reportObj) => {
    setHistoryModal({
      isOpen: true,
      report: reportObj || selectedReport
    });
  };

  const isCurrentDrawerOpen = (currentPhase === 'fieldwork' && isDrawerOpen) || ((currentPhase === 'reporting' || currentPhase === 'reporting-new') && !!selectedReportingJobId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--slate-50)', overflow: 'hidden' }}>

      {/* 1. Top Application Header (54px) */}
      <Header
        currentPhase={currentPhase}
        onPhaseChange={(phase) => {
          setCurrentPhase(phase);
          setActiveView('queue');
          setActiveWorkOnReportJob(null);
        }}
        userRole={userRole}
        onRoleChange={setUserRole}
      />

      {/* 2. Main Content View Switcher */}
      {activeWorkOnReportJob ? (
        /* INTERACTIVE STUDIOS FOR AUDIT REPORT VS EXECUTIVE SUMMARY REPORT */
        currentPhase === 'reporting-new' ? (
          activeWorkOnReportJob.type === 'executive' ? (
            <WorkOnExecReportNewView
              job={activeWorkOnReportJob.job}
              onClose={() => setActiveWorkOnReportJob(null)}
            />
          ) : (
            <WorkOnReportNewView
              job={activeWorkOnReportJob.job}
              onClose={() => setActiveWorkOnReportJob(null)}
            />
          )
        ) : (
          activeWorkOnReportJob.type === 'executive' ? (
            <WorkOnExecReportView
              job={activeWorkOnReportJob.job}
              onClose={() => setActiveWorkOnReportJob(null)}
            />
          ) : (
            <WorkOnReportView
              job={activeWorkOnReportJob.job}
              onClose={() => setActiveWorkOnReportJob(null)}
            />
          )
        )
      ) : activeView === 'discussion-points' ? (
        currentPhase === 'reporting-new' ? (
          <DiscussionPointsNewView
            report={selectedReport}
            initialFunction={discussionFuncFilter}
            onBackToQueue={handleBackToQueue}
            onOpenHistoryModal={handleOpenHistoryModal}
          />
        ) : (
          <DiscussionPointsView
            report={selectedReport}
            initialFunction={discussionFuncFilter}
            onBackToQueue={handleBackToQueue}
            onOpenHistoryModal={handleOpenHistoryModal}
          />
        )
      ) : (
        /* QUEUE TABLE & DRAWER WORKSPACE */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {currentPhase === 'fieldwork' && activeView === 'queue' && (
            <div className="job-queue-title-banner">
              <h2>Job Queue</h2>
            </div>
          )}

          {(currentPhase === 'reporting' || currentPhase === 'reporting-new') && activeView === 'queue' && (
            <div className="job-queue-title-banner" style={{ position: 'relative' }}>
              <h2>{currentPhase === 'reporting-new' ? 'Audit Queue' : 'Reporting Queue'}</h2>

              {currentPhase === 'reporting-new' && (
                <div ref={titleMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsTitleMenuOpen(!isTitleMenuOpen)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      padding: '5px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      zIndex: 3
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                    title="Queue View Options"
                  >
                    <MoreVertical style={{ width: '18px', height: '18px' }} />
                  </button>

                  {isTitleMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      zIndex: 1100,
                      minWidth: '190px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      animation: 'fadeIn 0.15s ease-out'
                    }}>
                      {[
                        { id: 'default', label: 'Default View' },
                        { id: 'with-substatus', label: 'With Sub-Status' },
                        { id: 'inline-action', label: 'Inline Action Buttons' },
                        { id: 'issue-cards', label: 'Concept 2: Granular Issue Lineage' },
                        { id: 'enhanced-lineage', label: 'Enhanced Granular Issue Lineage Card' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setAuditQueueViewMode(option.id);
                            setIsTitleMenuOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '12.5px',
                            fontWeight: auditQueueViewMode === option.id ? '700' : '500',
                            color: auditQueueViewMode === option.id ? '#D8001D' : '#334155',
                            backgroundColor: auditQueueViewMode === option.id ? '#FEF2F2' : 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (auditQueueViewMode !== option.id) {
                              e.currentTarget.style.backgroundColor = '#F1F5F9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (auditQueueViewMode !== option.id) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <span>{option.label}</span>
                          {auditQueueViewMode === option.id && (
                            <Check style={{ width: '14px', height: '14px', color: '#D8001D' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={`workspace-split-container ${isCurrentDrawerOpen ? 'drawer-is-open' : ''}`}>

            {/* Left Content Area */}
            <main className="main-container">
              {currentPhase === 'fieldwork' ? (
                <JobQueueView
                  reports={reports}
                  selectedReportId={selectedReportId}
                  onSelectReport={handleSelectReport}
                  onOpenITModal={handleOpenITModal}
                  onOpenFinOpsModal={handleOpenFinOpsModal}
                  onOpenIssueModal={handleOpenIssueModal}
                  isDrawerOpen={isDrawerOpen}
                />
              ) : currentPhase === 'pre-planning' ? (
                <PrePlanningView />
              ) : currentPhase === 'planning' ? (
                <PlanningView />
              ) : currentPhase === 'reporting' ? (
                <ReportingQueueView
                  selectedJobId={selectedReportingJobId}
                  onSelectJob={handleSelectReportingJob}
                />
              ) : currentPhase === 'reporting-new' ? (
                <ReportingNewQueueView
                  selectedJobId={selectedReportingJobId}
                  onSelectJob={handleSelectReportingJob}
                  viewMode={auditQueueViewMode}
                  userRole={userRole}
                  onOpenDiscussionPoints={(job) => {
                    const matchingReport = reports.find(r =>
                      r.id === job.id ||
                      r.fileName === job.fileName ||
                      r.engagement === job.engagement ||
                      (r.fileName && job.fileName && r.fileName.toLowerCase() === job.fileName.toLowerCase())
                    ) || {
                      id: job.id,
                      reportId: job.reportId || job.id,
                      fileName: job.fileName || job.engagement,
                      engagement: job.engagement || job.fileName,
                      status: job.status
                    };

                    setSelectedReportId(matchingReport.id);
                    setDiscussionFuncFilter('All');
                    setActiveView('discussion-points');
                  }}
                  onOpenCreateIssue={handleOpenCreateIssue}
                  onWorkOnReport={(job, type = 'audit') => setActiveWorkOnReportJob({ job, type })}
                  onOpenHistory={(job) => handleOpenHistoryModal({ id: job.id, header: job.engagement })}
                />
              ) : currentPhase === 'wrap-up' ? (
                <WrapUpView />
              ) : currentPhase === 'dashboards' ? (
                <DashboardsView />
              ) : null}
            </main>

            {/* Right Audit Detail Drawer Panel (For Fieldwork phase) */}
            {currentPhase === 'fieldwork' && isDrawerOpen && (
              <AuditDetailDrawer
                isOpen={isDrawerOpen}
                report={selectedReport}
                onClose={handleCloseDrawer}
                onOpenITModal={handleOpenITModal}
                onOpenFinOpsModal={handleOpenFinOpsModal}
                onOpenIssueModal={handleOpenIssueModal}
                onOpenWorkflowModal={handleOpenWorkflowModal}
                onOpenHistoryModal={handleOpenHistoryModal}
                onOpenDiscussionPointsView={handleOpenDiscussionPointsView}
                onOpenWorkflowOverlay={(type) => handleOpenWorkflowOverlay(type, selectedReport)}
                onWorkOnReport={(report, type = 'audit') => {
                  const job = {
                    id: report.id,
                    fileName: report.fileName,
                    engagement: report.engagement || report.fileName,
                    status: report.status,
                    currentQueue: report.currentQueue,
                    auditReport: { executionStatus: 'Completed', genAiExtractionDateTime: '2026-08-01 09:30 AM', validationStatus: 'Validated' },
                    executiveSummaryReport: { executionStatus: 'Completed', genAiExtractionDateTime: '2026-08-01 09:30 AM', validationStatus: 'Validated' },
                    discussionPoints: { count: report.issueIndicator?.count || 3, status: 'Active' }
                  };
                  setActiveWorkOnReportJob({ job, type });
                }}
              />
            )}

            {/* Right Reporting Detail Drawer Panel (For Reporting phase) */}
            {currentPhase === 'reporting' && selectedReportingJob && (
              <ReportingDetailDrawer
                isOpen={!!selectedReportingJob}
                job={selectedReportingJob}
                userRole={userRole}
                onClose={handleCloseReportingDrawer}
                onOpenDiscussionPoints={(job) => {
                  const matchingReport = reports.find(r =>
                    r.id === job.id ||
                    r.fileName === job.fileName ||
                    r.engagement === job.engagement ||
                    (r.fileName && job.fileName && r.fileName.toLowerCase() === job.fileName.toLowerCase())
                  ) || reports.find(r => r.id === "REP-2026-006") || reports[0];

                  setSelectedReportId(matchingReport.id);
                  setDiscussionFuncFilter('All');
                  setActiveView('discussion-points');
                }}
                onOpenWorkflow={(job) => handleOpenWorkflowModal({
                  title: `${job.id} — Workflow Stages`,
                  workflows: [
                    { groupTitle: "Audit Report Workflow", status: job.auditReport.validationStatus, steps: [] },
                    { groupTitle: "Executive Report Workflow", status: job.executiveSummaryReport.validationStatus, steps: [] }
                  ]
                })}
                onOpenHistory={(job) => handleOpenHistoryModal({ id: job.id, header: job.engagement })}
                onWorkOnReport={(job, type = 'audit') => setActiveWorkOnReportJob({ job, type })}
              />
            )}

            {/* Right Reporting Detail Drawer Panel (For Reporting - New phase) */}
            {currentPhase === 'reporting-new' && selectedReportingJob && (
              <ReportingNewDetailDrawer
                isOpen={!!selectedReportingJob}
                job={selectedReportingJob}
                userRole={userRole}
                onClose={handleCloseReportingDrawer}
                onOpenDiscussionPoints={(job) => {
                  const matchingReport = reports.find(r =>
                    r.id === job.id ||
                    r.fileName === job.fileName ||
                    r.engagement === job.engagement ||
                    (r.fileName && job.fileName && r.fileName.toLowerCase() === job.fileName.toLowerCase())
                  ) || {
                    id: job.id,
                    reportId: job.reportId || job.id,
                    fileName: job.fileName || job.engagement,
                    engagement: job.engagement || job.fileName,
                    status: job.status
                  };

                  setSelectedReportId(matchingReport.id);
                  setDiscussionFuncFilter('All');
                  setActiveView('discussion-points');
                }}
                onOpenCreateIssue={handleOpenCreateIssue}
                onOpenWorkflow={(job) => handleOpenWorkflowModal({
                  title: `${job.id} — Workflow Stages`,
                  workflows: [
                    { groupTitle: "Audit Report Workflow", status: job.auditReport.validationStatus, steps: [] },
                    { groupTitle: "Executive Report Workflow", status: job.executiveSummaryReport.validationStatus, steps: [] }
                  ]
                })}
                onOpenHistory={(job) => handleOpenHistoryModal({ id: job.id, header: job.engagement })}
                onWorkOnReport={(job, type = 'audit') => setActiveWorkOnReportJob({ job, type })}
              />
            )}

          </div>

        </div>
      )}

      {/* Global Create Issue Drawer Pop-over */}
      <CreateIssueDrawerNew
        isOpen={isCreateIssueDrawerOpen}
        onClose={() => {
          setIsCreateIssueDrawerOpen(false);
          setCreateIssueJob(null);
        }}
        onSaveDiscussionPoint={handleSaveIssueFromDrawer}
        defaultFunction={createIssueJob?.tech || 'IT'}
      />

      {/* Embedded CSS Keyframes for Toast Animations */}
      <style>{`
        @keyframes slideUpToast {
          from { opacity: 0; transform: translateY(24px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
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

          <div style={{ width: '100%', height: '3px', backgroundColor: '#1E293B', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              backgroundColor: '#10B981',
              animation: 'toastProgress 4.5s linear forwards'
            }} />
          </div>
        </div>
      )}

      {/* Discussion Points Modal */}

      {/* Discussion Points Modal */}
      <DiscussionModal
        isOpen={discussionModal.isOpen}
        type={discussionModal.type}
        report={discussionModal.report}
        onClose={() => setDiscussionModal({ isOpen: false, type: 'IT', report: null })}
        onSave={handleSaveDiscussion}
      />

      {/* Issue Indicator Register Modal */}
      <IssueModal
        isOpen={issueModal.isOpen}
        report={issueModal.report}
        onClose={() => setIssueModal({ isOpen: false, report: null })}
        onSaveIssue={handleSaveIssues}
      />

      {/* Workflow Stages Pop-up Modal */}
      <WorkflowModal
        isOpen={workflowModal.isOpen}
        title={workflowModal.title}
        workflows={workflowModal.workflows}
        onClose={() => setWorkflowModal({ isOpen: false, title: '', workflows: [] })}
      />

      {/* History & Edit Log Pop-up Modal */}
      <HistoryModal
        isOpen={historyModal.isOpen}
        report={historyModal.report}
        onClose={() => setHistoryModal({ isOpen: false, report: null })}
      />

    </div>
  );
}
