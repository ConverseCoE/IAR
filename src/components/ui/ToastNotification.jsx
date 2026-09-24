import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

/**
 * Enterprise Toast Notification Component
 * Matching the design from Issue Creation & SaaS Standards.
 *
 * @param {Object} toast - { type: 'warning' | 'success' | 'info' | 'error', title: string, description: string }
 * @param {Function} onClose - Callback when toast is closed
 * @param {number} duration - Auto-dismiss timeout in ms (default 4500)
 */
export default function ToastNotification({ toast, onClose, duration = 4500 }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const isWarning = toast.type === 'warning';
  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';
  const isSuccess = !isWarning && !isError && !isInfo;

  // Color schemes based on toast type
  let borderColor = '#10B981';
  let shadowGlow = 'rgba(16, 185, 129, 0.25)';
  let iconBg = '#064E3B';
  let iconBorder = '#10B981';
  let iconColor = '#34D399';
  let barColor = '#10B981';
  let pulseRgba = 'rgba(16, 185, 129, 0)';
  let pulseStart = 'rgba(16, 185, 129, 0.4)';
  let IconComponent = CheckCircle2;

  if (isWarning) {
    borderColor = '#F59E0B';
    shadowGlow = 'rgba(245, 158, 11, 0.28)';
    iconBg = '#451A03';
    iconBorder = '#F59E0B';
    iconColor = '#FBBF24';
    barColor = '#F59E0B';
    pulseRgba = 'rgba(245, 158, 11, 0)';
    pulseStart = 'rgba(245, 158, 11, 0.4)';
    IconComponent = AlertTriangle;
  } else if (isError) {
    borderColor = '#EF4444';
    shadowGlow = 'rgba(239, 68, 68, 0.28)';
    iconBg = '#450A0A';
    iconBorder = '#EF4444';
    iconColor = '#F87171';
    barColor = '#EF4444';
    pulseRgba = 'rgba(239, 68, 68, 0)';
    pulseStart = 'rgba(239, 68, 68, 0.4)';
    IconComponent = AlertOctagon;
  } else if (isInfo) {
    borderColor = '#38BDF8';
    shadowGlow = 'rgba(56, 189, 248, 0.25)';
    iconBg = '#082F49';
    iconBorder = '#38BDF8';
    iconColor = '#38BDF8';
    barColor = '#38BDF8';
    pulseRgba = 'rgba(56, 189, 248, 0)';
    pulseStart = 'rgba(56, 189, 248, 0.4)';
    IconComponent = Info;
  }

  return (
    <>
      <style>{`
        @keyframes toastSlideUp {
          from {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes toastProgressAnim {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes toastPulseAnim {
          0% { transform: scale(1); box-shadow: 0 0 0 0 ${pulseStart}; }
          70% { transform: scale(1.05); box-shadow: 0 0 0 8px ${pulseRgba}; }
          100% { transform: scale(1); box-shadow: 0 0 0 0 ${pulseRgba}; }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          minWidth: '380px',
          maxWidth: '460px',
          backgroundColor: '#0F172A',
          color: '#ffffff',
          borderRadius: '12px',
          border: `1px solid ${borderColor}`,
          boxShadow: `0 14px 36px rgba(15, 23, 42, 0.55), 0 0 24px ${shadowGlow}`,
          animation: 'toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: iconBg,
            border: `1.5px solid ${iconBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            animation: 'toastPulseAnim 2s infinite'
          }}>
            <IconComponent style={{ width: '18px', height: '18px', color: iconColor }} />
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '0.2px' }}>
              {toast.title}
            </h4>
            <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#94A3B8', lineHeight: '1.45' }}>
              {toast.description}
            </p>
          </div>

          <button
            onClick={onClose}
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
            backgroundColor: barColor,
            animation: `toastProgressAnim ${duration / 1000}s linear forwards`
          }} />
        </div>
      </div>
    </>
  );
}
