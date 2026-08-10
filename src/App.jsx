import React, { useState } from 'react';
import Header from './components/Header';
import JobQueueView from './components/JobQueueView';
import AuditDetailDrawer from './components/AuditDetailDrawer';
import ReportingDetailDrawer from './components/ReportingDetailDrawer';
import DiscussionModal from './components/DiscussionModal';
import IssueModal from './components/IssueModal';
import WorkflowModal from './components/WorkflowModal';
import HistoryModal from './components/HistoryModal';
import DiscussionPointsView from './views/DiscussionPointsView';
import ReportingQueueView from './views/ReportingQueueView';
import WorkOnReportView from './views/WorkOnReportView';
import WorkOnExecReportView from './views/WorkOnExecReportView';
import { initialReports } from './data/mockData';
import { mockReportingJobs } from './data/reportingMockData';
import {
  PrePlanningView,
  PlanningView,
  WrapUpView,
  DashboardsView
} from './components/PhaseViews';

export default function App() {
  const [currentPhase, setCurrentPhase] = useState('fieldwork');
  const [reports, setReports] = useState(initialReports);
  const [selectedReportId, setSelectedReportId] = useState("REP-2026-006"); // BiosenseWebster_Catheters_Audit as default
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reporting Module Drawer & Work On Report Studio State: { job, type: 'audit' | 'executive' }
  const [selectedReportingJobId, setSelectedReportingJobId] = useState(null);
  const [activeWorkOnReportJob, setActiveWorkOnReportJob] = useState(null);

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

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports.find(r => r.id === "REP-2026-006") || reports[0];
  const selectedReportingJob = mockReportingJobs.find(j => j.id === selectedReportingJobId) || null;

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

  const isCurrentDrawerOpen = (currentPhase === 'fieldwork' && isDrawerOpen) || (currentPhase === 'reporting' && !!selectedReportingJobId);

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
      />

      {/* 2. Main Content View Switcher */}
      {activeWorkOnReportJob ? (
        /* INTERACTIVE STUDIOS FOR AUDIT REPORT VS EXECUTIVE SUMMARY REPORT */
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
      ) : activeView === 'discussion-points' ? (
        <DiscussionPointsView
          report={selectedReport}
          initialFunction={discussionFuncFilter}
          onBackToQueue={handleBackToQueue}
          onOpenHistoryModal={handleOpenHistoryModal}
        />
      ) : (
        /* QUEUE TABLE & DRAWER WORKSPACE */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {currentPhase === 'fieldwork' && activeView === 'queue' && (
            <div className="job-queue-title-banner">
              <h2>Job Queue</h2>
            </div>
          )}

          {currentPhase === 'reporting' && activeView === 'queue' && (
            <div className="job-queue-title-banner">
              <h2>Reporting Queue</h2>
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

          </div>

        </div>
      )}

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
