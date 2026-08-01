import React, { useState } from 'react';
import Header from './components/Header';
import JobQueueView from './components/JobQueueView';
import AuditDetailDrawer from './components/AuditDetailDrawer';
import DiscussionModal from './components/DiscussionModal';
import IssueModal from './components/IssueModal';
import WorkflowModal from './components/WorkflowModal';
import HistoryModal from './components/HistoryModal';
import DiscussionPointsView from './views/DiscussionPointsView';
import ReportingQueueView from './views/ReportingQueueView';
import { initialReports } from './data/mockData';
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

  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedReportId(null);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--slate-50)' }}>
      
      {/* 1. Top Application Header (54px) */}
      <Header 
        currentPhase={currentPhase} 
        onPhaseChange={(phase) => {
          setCurrentPhase(phase);
          setActiveView('queue');
        }} 
      />

      {/* 2. Full Viewport Width Sub-Header Banner (Identical styling for Fieldwork & Reporting) */}
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

      {/* 3. Main Workspace Split Container or Full-Screen Discussion Points View */}
      {activeView === 'discussion-points' ? (
        <DiscussionPointsView 
          report={selectedReport}
          initialFunction={discussionFuncFilter}
          onBackToQueue={handleBackToQueue}
          onOpenHistoryModal={handleOpenHistoryModal}
        />
      ) : (
        <div className={`workspace-split-container ${isDrawerOpen ? 'drawer-is-open' : ''}`}>
          
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
                onOpenDiscussionPointsView={() => handleOpenDiscussionPointsView('All')}
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
            />
          )}

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
