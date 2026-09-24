import React, { useState } from 'react';
import {
  X, FileText, Download, Printer, ZoomIn, ZoomOut, RotateCcw,
  ShieldCheck, AlertTriangle, ExternalLink, CheckCircle2, ChevronRight,
  BookOpen, Eye, Info
} from 'lucide-react';

export default function ViolationPdfDrawer({
  isOpen,
  onClose,
  violationDoc
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState('rich'); // 'rich' | 'native'
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  const sectionCode = violationDoc?.linkText || violationDoc?.section || 'S-15 Section No. [2]';
  const sectionTitle = violationDoc?.title || 'Security Assessment for COTS Systems/Applications';
  const sectionDetail = violationDoc?.detail || 'Security assessment not completed for the environment';
  const standardName = sectionCode.includes('S-07') || sectionCode.includes('S-7')
    ? 'IAPP Standard S-07: Identity & Access Management Governance'
    : sectionCode.includes('S-12')
      ? 'IAPP Standard S-12: System Telemetry & Operational Logging'
      : sectionCode.includes('S-19')
        ? 'IAPP Standard S-19: GxP Audit Trail & Electronic Records Retention'
        : sectionCode.includes('S-04')
          ? 'IAPP Standard S-04: Manufacturing & Inventory Scrap Governance'
          : 'IAPP Standard S-15: Information Asset Protection Policies';

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = '/sample-iapp-standard.pdf';
    link.download = `${sectionCode.replace(/[^a-zA-Z0-9_-]/g, '_')}_IAPP_Standard.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 3500,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeInOverlay 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '740px',
          maxWidth: '92vw',
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div style={{
          padding: '16px 22px',
          backgroundColor: '#0F172A',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#D8001D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(216, 0, 29, 0.4)'
            }}>
              <FileText style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#F8FAFC' }}>
                  {sectionCode}
                </span>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: '700',
                  color: '#FCA5A5',
                  backgroundColor: 'rgba(216, 0, 29, 0.25)',
                  padding: '1.5px 7px',
                  borderRadius: '4px',
                  border: '1px solid rgba(216, 0, 29, 0.4)'
                }}>
                  IAPP Standard PDF
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#94A3B8', display: 'block', marginTop: '1px' }}>
                {standardName}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              style={{
                height: '32px',
                padding: '0 10px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              title="Download official PDF copy"
            >
              <Download style={{ width: '13px', height: '13px' }} />
              <span>Download PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DC2626';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <X style={{ width: '17px', height: '17px' }} />
            </button>
          </div>
        </div>

        {/* Viewer Subheader / Mode & Zoom Toolbar */}
        <div style={{
          padding: '8px 18px',
          backgroundColor: '#1E293B',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#0F172A', padding: '3px', borderRadius: '6px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('rich')}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'rich' ? '#D8001D' : 'transparent',
                color: activeTab === 'rich' ? '#ffffff' : '#94A3B8',
                transition: 'all 0.15s ease'
              }}
            >
              Standard PDF Sheet
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('native')}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '700',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'native' ? '#D8001D' : 'transparent',
                color: activeTab === 'native' ? '#ffffff' : '#94A3B8',
                transition: 'all 0.15s ease'
              }}
            >
              Browser PDF Frame
            </button>
          </div>

          {/* Controls: Zoom & Page Info */}
          {activeTab === 'rich' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: '#0F172A', padding: '2px 6px', borderRadius: '5px' }}>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(75, prev - 10))}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                  title="Zoom Out"
                >
                  <ZoomOut style={{ width: '13px', height: '13px' }} />
                </button>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#E2E8F0', minWidth: '38px', textAlign: 'center' }}>
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                  title="Zoom In"
                >
                  <ZoomIn style={{ width: '13px', height: '13px' }} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '11px' }}>
                <span>Page {currentPage} of 3</span>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Print Document"
              >
                <Printer style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          )}
        </div>

        {/* Viewer Scrollable Canvas */}
        <div style={{
          flex: 1,
          backgroundColor: '#52525B', // Professional Adobe/Chrome PDF dark grey canvas
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          {activeTab === 'native' ? (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
            }}>
              <iframe
                src="/sample-iapp-standard.pdf"
                title="Sample IAPP Standard PDF"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          ) : (
            /* Standard High-Fidelity PDF Page Sheet */
            <div style={{
              width: '100%',
              maxWidth: '640px',
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
              padding: '40px 44px',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
              color: '#0F172A',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              {/* PDF Document Top Header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '2px solid #D8001D',
                paddingBottom: '14px',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#D8001D', letterSpacing: '-0.5px' }}>
                      Johnson &amp; Johnson
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', borderLeft: '1px solid #CBD5E1', paddingLeft: '8px' }}>
                      ISRM Enterprise Standards
                    </span>
                  </div>
                  <h1 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '6px 0 2px 0' }}>
                    Information Asset Protection Policies (IAPP)
                  </h1>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Document Standard Specification: S-15 / Enterprise Compliance Framework
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '800',
                    color: '#991B1B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Controlled Policy
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                    Effective: 2025 – 2026
                  </div>
                </div>
              </div>

              {/* Document Meta Information Table */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                fontSize: '11px'
              }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>Standard ID</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>JNJ-IAPP-S15</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>Version</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>v4.2.1</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>Scope</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>Enterprise Wide</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>Classification</span>
                  <span style={{ fontWeight: '700', color: '#D8001D' }}>Confidential</span>
                </div>
              </div>

              {/* Active Highlight Banner for the Specific Violation Section */}
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1.5px solid #3B82F6',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '22px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '14px',
                  backgroundColor: '#2563EB',
                  color: '#ffffff',
                  fontSize: '9.5px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Selected Audit Citation Reference
                </div>

                <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#1E3A8A', margin: '4px 0 4px 0' }}>
                  {sectionCode} — {sectionTitle}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#1E40AF', lineHeight: '1.5' }}>
                  <strong>Associated Non-Compliance Finding:</strong> {sectionDetail}
                </p>
              </div>

              {/* Formal Policy Section Requirements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px', lineHeight: '1.6', color: '#334155' }}>
                <div>
                  <h3 style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                    1.0 Policy Purpose &amp; Regulatory Mandate
                  </h3>
                  <p style={{ margin: 0 }}>
                    In accordance with Johnson &amp; Johnson enterprise cybersecurity policies and global regulatory frameworks (SOX 404 ITGC, GxP 21 CFR Part 11, and ISO/IEC 27001), all operational systems, ERP platforms (e.g. MDG S4/HANA, SAP ECC), and connected manufacturing environments must undergo formal Information Security Risk Management (ISRM) baseline evaluations prior to production enablement.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                    2.0 Section Specification &amp; Mandatory Controls
                  </h3>
                  <p style={{ margin: '0 0 8px 0' }}>
                    Under <strong>{sectionCode}</strong>, operating companies and application owners must rigorously comply with the following mandatory safeguards:
                  </p>
                  
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>
                      <strong>2.1 Architecture &amp; Vulnerability Assessment:</strong> Execute comprehensive static/dynamic vulnerability testing and third-party code review for all COTS software and ERP modules prior to go-live.
                    </li>
                    <li>
                      <strong>2.2 Formal ISRM Sign-off:</strong> Secure documented sign-off from designated ISRM Sector Leads certifying that all High and Critical risk findings have been remediated or mitigated.
                    </li>
                    <li>
                      <strong>2.3 Access Control &amp; Inactivity Suspension:</strong> Ensure integration with corporate Identity &amp; Access Governance matrices, including mandatory automatic deprovisioning within 10 business days for terminated personnel and dormant accounts.
                    </li>
                    <li>
                      <strong>2.4 Continuous Telemetry &amp; Log Retention:</strong> Retain audit logs, calibration gains, and administrative access records for a minimum statutory period of 7 years in immutable format.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                    3.0 Audit Verification Criteria
                  </h3>
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '8px 12px'
                  }}>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#475569' }}>
                      Internal Audit shall verify compliance by inspecting documented security assessment reports, change management tickets (RFC), sign-off authorizations in ServiceNow GRC, and system configuration logs. Failure to produce valid assessment artifacts represents an operational exception reportable to the Audit Committee.
                    </p>
                  </div>
                </div>

                {/* Signatures & Approvals */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #CBD5E1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Approved by Global CISO:</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>Dr. Alexander Wright, CISSP</span>
                    <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>VP &amp; Chief Information Security Officer</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Enterprise Quality Audit:</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>Sarah Jenkins, CISA</span>
                    <span style={{ fontSize: '10px', color: '#94A3B8', display: 'block' }}>Senior Director, Global Internal Audit</span>
                  </div>
                </div>

                {/* PDF Page Footer */}
                <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '10px', color: '#94A3B8' }}>
                  Page 1 of 3 • Johnson &amp; Johnson Confidential • For Internal Compliance Evaluation Only
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Drawer Bottom Actions Footer */}
        <div style={{
          padding: '12px 22px',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info style={{ width: '13px', height: '13px', color: '#2563EB' }} />
            <span>Viewing cited violation reference for audit finding reconciliation</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleDownloadPdf}
              style={{
                height: '34px',
                padding: '0 14px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#1E293B',
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ExternalLink style={{ width: '13px', height: '13px' }} />
              <span>Open Raw PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                height: '34px',
                padding: '0 18px',
                fontSize: '12px',
                fontWeight: '800',
                color: '#ffffff',
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
