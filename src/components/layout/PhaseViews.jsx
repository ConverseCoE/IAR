import React from 'react';
import { Construction } from 'lucide-react';

function MinimalPhasePlaceholder({ title }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 160px)',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <Construction style={{ width: '42px', height: '42px', color: '#94A3B8', strokeWidth: 1.5, marginBottom: '14px' }} />
      <h2 style={{
        fontSize: '22px',
        fontWeight: '700',
        color: '#64748B',
        margin: 0,
        letterSpacing: '-0.01em'
      }}>
        {title}
      </h2>
    </div>
  );
}

export function PrePlanningView() {
  return <MinimalPhasePlaceholder title="Pre - Planning" />;
}

export function PlanningView() {
  return <MinimalPhasePlaceholder title="Planning & Fieldwork" />;
}

export function ReportingView() {
  return <MinimalPhasePlaceholder title="Reporting Phase" />;
}

export function WrapUpView() {
  return <MinimalPhasePlaceholder title="Wrap - Up" />;
}

export function DashboardsView() {
  return <MinimalPhasePlaceholder title="Dashboards & Analytics" />;
}
