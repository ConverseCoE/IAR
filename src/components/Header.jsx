import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Check, Shield, UserCheck } from 'lucide-react';

export const APPLICATION_ROLES = [
  { id: 'auditor', label: 'Auditor', category: 'Hierarchical', scope: 'Issues Only' },
  { id: 'team-coordinator', label: 'Team Co-Ordinator', category: 'Hierarchical', scope: 'Issues, Audit & Summary' },
  { id: 'manager', label: 'Manager', category: 'Hierarchical', scope: 'Issues, Audit & Summary' },
  { id: 'director', label: 'Director', category: 'Hierarchical', scope: 'Issues, Audit & Summary' },
  { id: 'vp', label: 'VP', category: 'Hierarchical', scope: 'Issues, Audit & Summary' },
  { id: 'business-head', label: 'Business Head', category: 'Case-Based', scope: 'Issues, Audit & Summary' },
  { id: 'primary-business-contact', label: 'Primary Business Contact', category: 'Case-Based', scope: 'Issues, Audit & Summary' }
];

export default function Header({ currentPhase, onPhaseChange, userRole = 'manager', onRoleChange }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const profileMenuRef = useRef(null);
  const roleMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeRoleObj = APPLICATION_ROLES.find(r => r.id === userRole) || APPLICATION_ROLES[2];

  const phases = [
    { id: "pre-planning", label: "Pre - Planning" },
    { id: "planning", label: "Planning" },
    { id: "fieldwork", label: "Fieldwork" },
    { id: "reporting", label: "Reporting" },
    { id: "reporting-new", label: "Reporting - New" },
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
          
          {/* Quick Role Switcher Pill */}
          <div ref={roleMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowProfileMenu(false);
                setShowNotifications(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: activeRoleObj.id === 'auditor' ? '#FFFBEB' : '#F1F5F9',
                border: activeRoleObj.id === 'auditor' ? '1px solid #FDE68A' : '1px solid #CBD5E1',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '11.5px',
                fontWeight: '700',
                color: activeRoleObj.id === 'auditor' ? '#B45309' : '#1E293B',
                transition: 'all 0.15s ease'
              }}
              title="Switch Active User Role"
            >
              <Shield style={{ width: '13px', height: '13px', color: activeRoleObj.id === 'auditor' ? '#D97706' : '#D8001D' }} />
              <span>Role: {activeRoleObj.label}</span>
              <ChevronDown style={{ width: '12px', height: '12px', color: '#64748B' }} />
            </button>

            {showRoleMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                marginTop: '8px',
                width: '260px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18)',
                border: '1px solid #CBD5E1',
                padding: '8px',
                zIndex: 1100,
                maxHeight: '380px',
                overflowY: 'auto'
              }}>
                <div style={{ padding: '6px 8px 8px 8px', borderBottom: '1px solid #F1F5F9', marginBottom: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck style={{ width: '14px', height: '14px', color: '#D8001D' }} />
                    <span>Select Application Role</span>
                  </div>
                  <p style={{ fontSize: '10.5px', color: '#64748B', margin: '2px 0 0 0' }}>Changes UI permissions & view access</p>
                </div>

                {/* Section 1: Hierarchical Roles */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px' }}>
                  Hierarchical Levels
                </div>
                {APPLICATION_ROLES.filter(r => r.category === 'Hierarchical').map(role => {
                  const isSelected = userRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => {
                        onRoleChange && onRoleChange(role.id);
                        setShowRoleMenu(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        fontSize: '12px',
                        backgroundColor: isSelected ? '#FEF2F2' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginBottom: '2px',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: isSelected ? '800' : '600', color: isSelected ? '#D8001D' : '#1E293B' }}>
                          {role.label}
                        </div>
                        <div style={{ fontSize: '10.5px', color: role.id === 'auditor' ? '#D97706' : '#64748B' }}>
                          {role.scope}
                        </div>
                      </div>
                      {isSelected && <Check style={{ width: '14px', height: '14px', color: '#D8001D' }} />}
                    </button>
                  );
                })}

                {/* Section 2: Case-Based Roles */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 8px 4px 8px', borderTop: '1px solid #F1F5F9', marginTop: '4px' }}>
                  Case-Based Roles
                </div>
                {APPLICATION_ROLES.filter(r => r.category === 'Case-Based').map(role => {
                  const isSelected = userRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => {
                        onRoleChange && onRoleChange(role.id);
                        setShowRoleMenu(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        fontSize: '12px',
                        backgroundColor: isSelected ? '#FEF2F2' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginBottom: '2px',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: isSelected ? '800' : '600', color: isSelected ? '#D8001D' : '#1E293B' }}>
                          {role.label}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                          {role.scope}
                        </div>
                      </div>
                      {isSelected && <Check style={{ width: '14px', height: '14px', color: '#D8001D' }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                setShowRoleMenu(false);
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

          {/* User Profile Avatar Menu */}
          <div ref={profileMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowRoleMenu(false);
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
                width: '230px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--slate-200)',
                padding: '6px 0',
                zIndex: 1100
              }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--slate-100)' }}>
                  <p style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Sarah Adams</p>
                  <p style={{ fontSize: '11px', color: '#64748B' }}>sarah.adams@jnj.com</p>
                  <div style={{
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    backgroundColor: activeRoleObj.id === 'auditor' ? '#FFFBEB' : '#EFF6FF',
                    color: activeRoleObj.id === 'auditor' ? '#B45309' : '#1D4ED8',
                    border: activeRoleObj.id === 'auditor' ? '1px solid #FDE68A' : '1px solid #BFDBFE'
                  }}>
                    <span>Active Role: {activeRoleObj.label}</span>
                  </div>
                </div>

                <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
                  Quick Role Switcher
                </div>
                {APPLICATION_ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => {
                      onRoleChange && onRoleChange(role.id);
                      setShowProfileMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 16px',
                      fontSize: '12px',
                      fontWeight: userRole === role.id ? '700' : '500',
                      color: userRole === role.id ? '#D8001D' : '#334155',
                      backgroundColor: userRole === role.id ? '#FEF2F2' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{role.label}</span>
                    {userRole === role.id && <Check style={{ width: '13px', height: '13px', color: '#D8001D' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
