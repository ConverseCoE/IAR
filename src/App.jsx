import React, { useState } from 'react';
import Header from './components/Header';
import JobQueueView from './components/JobQueueView';
import AuditDetailDrawer from './components/AuditDetailDrawer';
import ReportingDetailDrawer from './components/ReportingDetailDrawer';
import DiscussionModal from './components/DiscussionModal';
import IssueModal from './components/IssueModal';
import WorkflowModal from './components/WorkflowModal';
import HistoryModal from './components/HistoryModal';
import WorkflowOverlayDrawer from './components/WorkflowOverlayDrawer';
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

  // Dedicated Full-Viewport Root Workflow Drawer Overlay state
  const [workflowOverlay, setWorkflowOverlay] = useState({
    isOpen: false,
    type: 'audit',
    report: null
  });

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports.find(r => r.id === "REP-2026-006") || reports[0];
  const selectedReportingJob = mockReportingJobs.find(j => j.id === selectedReportingJobId) || null;

  const handleOpenITModal = (report) => setDiscussionModal({ isOpen: true, type: 'IT', report });
  const handleOpenFinOpsModal = (report) => setDiscussionModal({ isOpen: true, type: 'FinOps', report });
  const handleOpenIssueModal = (report) => setIssueModal({ isOpen: true, report });
  const handleOpenWorkflowModal = (data) => setWorkflowModal({ isOpen: true, ...data });
  const handleOpenHistoryModal = (report) => setHistoryModal({ isOpen: true, report });

  const handleOpenWorkflowOverlay = (type, report) => {
    setWorkflowOverlay({ isOpen: true, type, report });
  };

  const handleSaveDiscussion = (updatedReport) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const handleSaveIssues = (updatedReport) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const handleOpenDiscussionPointsView = (filter = 'All') => {
    setDiscussionFuncFilter(filter);
    setActiveView('discussion-points');
  };

  const handleCloseDrawer = () => setIsDrawerOpen(false);
  const handleCloseReportingDrawer = () => setSelectedReportingJobId(null);

  const renderCurrentPhaseView = () => {
    switch (currentPhase) {
      case 'pre-planning':
        return <PrePlanningView />;
      case 'planning':
        return <PlanningView />;
      case 'wrap-up':
        return <WrapUpView />;
      case 'dashboards':
        return <DashboardsView />;
      case 'reporting':
        return (
          <ReportingQueueView 
            onOpenJobDrawer={(job) => {
              setSelectedReportingJobId(job.id);
            }} 
          />
        );
      case 'fieldwork':
      default:
        if (activeView === 'discussion-points') {
          return (
            <DiscussionPointsView 
              funcFilter={discussionFuncFilter}
              onBackToQueue={() => setActiveView('queue')}
              onOpenModal={(type, report) => {
                if (type === 'IT') handleOpenITModal(report);
                else handleOpenFinOpsModal(report);
              }}
            />
          );
        }
        return (
          <JobQueueView 
            reports={reports}
            selectedReportId={selectedReportId}
            onSelectReport={(id) => {
              setSelectedReportId(id);
              setIsDrawerOpen(true);
            }}
            onOpenDiscussionPointsView={handleOpenDiscussionPointsView}
            onOpenIssueModal={handleOpenIssueModal}
            onOpenWorkflowModal={handleOpenWorkflowModal}
            onOpenHistoryModal={handleOpenHistoryModal}
          />
        );
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Top Application Header Navbar */}
      <Header 
        currentPhase={currentPhase}
        onPhaseChange={(phase) => {
          setCurrentPhase(phase);
          if (phase !== 'fieldwork') {
            setActiveView('queue');
          }
          if (phase !== 'reporting') {
            setActiveWorkOnReportJob(null);
          }
        }}
      />

      {/* Conditional Full-Screen Work On Report Studio or Normal View */}
      {currentPhase === 'reporting' && activeWorkOnReportJob ? (
        activeWorkOnReportJob.type === 'executive' ? (
          <WorkOnExecReportView 
            job={activeWorkOnReportJob.job}
            onBack={() => setActiveWorkOnReportJob(null)}
          />
        ) : (
          <WorkOnReportView 
            job={activeWorkOnReportJob.job}
            onBack={() => setActiveWorkOnReportJob(null)}
          />
        )
      ) : (
        <div className="workspace-split-container">
          
          {/* Main Content Area */}
          <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {renderCurrentPhaseView()}
          </div>

          {/* Right Slide-over Panels Container */}
          <div style={{ height: '100%', display: 'flex', flexShrink: 0 }}>
            
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

                  setCurrentPhase('fieldwork');
                  setSelectedReportingJobId(null);
                  setActiveWorkOnReportJob(null);
                  setActiveView('queue');
                  setSelectedReportId(matchingReport.id);
                  setIsDrawerOpen(true);
                }}
                onOpenWorkflow={(job, type = 'audit') => handleOpenWorkflowOverlay(type, job)}
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

      {/* Full Viewport Root Workflow Drawer Overlay (zIndex: 999999 - OVERLAYS OVER TOP HEADER BAR!) */}
      <WorkflowOverlayDrawer
        isOpen={workflowOverlay.isOpen}
        type={workflowOverlay.type}
        report={workflowOverlay.report}
        onClose={() => setWorkflowOverlay({ isOpen: false, type: 'audit', report: null })}
      />

    </div>
  );
}
