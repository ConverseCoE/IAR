import React, { useState } from 'react';
import { Bell, ExternalLink, ChevronDown } from 'lucide-react';

export default function Header({ currentPhase, onPhaseChange }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const phases = [
    { id: "pre-planning", label: "Pre - Planning" },
    { id: "planning", label: "Planning" },
    { id: "fieldwork", label: "Fieldwork" },
    { id: "reporting", label: "Reporting" },
    { id: "wrap-up", label: "Wrap-up" },
    { id: "dashboards", label: "Dashboards" }
  ];

  const notifications = [
    { id: 1, title: "MedTech Suzhou Audit Report updated", time: "10m ago" },
    { id: 2, title: "IT Discussion point flagged by Security Board", time: "45m ago" },
    { id: 3, title: "FinOps approval completed for Ethicon Juarez", time: "2h ago" }
  ];

  return (
    <header className="app-header">
      <div className="app-header-inner">
        
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: '#D8001D',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(216, 0, 29, 0.2)'
          }}>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '16px', fontWeight: '900' }}>J&J</span>
            <span style={{ fontSize: '10px', letterSpacing: '1px', background: 'rgba(255,255,255,0.2)', padding: '1px 4px', borderRadius: '3px' }}>IAR</span>
          </div>
          <div>
            <h1 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', lineHeight: '1' }}>
              Johnson & Johnson
            </h1>
            <p style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>Intelligent Audit Report</p>
          </div>
        </div>

        {/* Center Top Navigation Bar */}
        <nav className="top-nav">
          {phases.map((phase) => {
            const isActive = currentPhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => onPhaseChange(phase.id)}
                className={`top-nav-item ${isActive ? 'active' : ''}`}
              >
                {phase.label}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              <Bell style={{ width: '18px', height: '18px' }} />
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#D8001D',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 'bold',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff'
              }}>
                10
              </span>
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                marginTop: '8px',
                width: '300px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--slate-200)',
                padding: '8px 0',
                zIndex: 100
              }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--slate-100)', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Notifications (10)</span>
                  <button style={{ fontSize: '11px', color: '#D8001D', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
                </div>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: '10px 16px', fontSize: '12px', borderBottom: '1px solid var(--slate-100)' }}>
                    <p style={{ fontWeight: '600', color: '#1E293B' }}>{n.title}</p>
                    <span style={{ fontSize: '10px', color: '#94A3B8' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#D8001D',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)'
              }}>
                SA
              </div>
              <ChevronDown style={{ width: '14px', height: '14px', color: '#64748B' }} />
            </button>

            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                marginTop: '8px',
                width: '200px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--slate-200)',
                padding: '6px 0',
                zIndex: 100
              }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--slate-100)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 'bold' }}>Lead Auditor (SA)</p>
                  <p style={{ fontSize: '11px', color: '#64748B' }}>sa.auditor@jnj.com</p>
                </div>
                <button style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Audit Role & Permissions</button>
                <button style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Global Preferences</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
