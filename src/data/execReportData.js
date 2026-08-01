// Mock Executive Summary Report Data
export const mockExecutiveSummaryData = {
  id: "EXEC-2026-881",
  fileName: "MedTech Suzhou - Orthopedics Plant_ExecSummary",
  auditableEntity: "MRC-002960-J&J Medical Austral",
  
  // 5. Scope summary section fields
  scopeSummary: {
    assessmentPeriod: "Q1 2026 – Q2 2026 (Jan 1, 2026 – Jun 30, 2026)",
    entitySector: "MedTech / Supply Chain & Operations",
    entityLocation: "Suzhou Plant & Regional Operations Hub (Suzhou, China)",
    metric: "GxP Compliance, SOX 404 Controls & IT Access Security",
    objective: "To evaluate operating effectiveness of GxP change management, system access deprovisioning, and inventory valuation controls across orthopedics assembly lines.",
    background: "MedTech Suzhou is a primary manufacturing plant producing orthopedics implants and surgical devices. Global Audit and Assurance conducted this periodic review to validate operational compliance following ERP migration.",
    processMatrix: [
      { processTitle: "Leasing", critical: 0, major: 1, minor: 0, total: 1 },
      { processTitle: "Global access management", critical: 1, major: 1, minor: 1, total: 3 },
      { processTitle: "Global change management", critical: 0, major: 1, minor: 1, total: 2 },
      { processTitle: "System Configuration", critical: 1, major: 0, minor: 0, total: 1 },
      { processTitle: "Grand Total", critical: 2, major: 3, minor: 2, total: 7 }
    ]
  },

  // 6. Critical/Major section (AI generated content)
  criticalMajorSection: {
    criticalIssuesIT: "1. DHL and HCL network accounts were not disabled within the mandatory 10-business-day timeline following contractor separation, posing active unauthorized system access risk across Suzhou ERP endpoints.",
    majorIssuesIT: "1. Catheter Line 3 optic sensor telemetry gain calibration drift exceeded the 4.2% threshold without automated supervisory alerts or re-calibration logging.",
    criticalIssuesFinOps: "1. Un-reconciled material scrap variance totaling $142,500 in catheter assembly Line 4 was not reviewed or escalated to plant finance within the 30-day reporting window.",
    majorIssuesFinOps: "1. Third-party vendor GxP access log retention policy non-compliance: logs retained for only 90 days instead of the required 3-year audit trail standard.",
    auditInsights: "Over the past 2 assessment cycles, IT access control deprovisioning has shown a 15% improvement in SLA adherence. However, cross-functional integration between local HR separation tickets and central IAM queues remains a bottleneck requiring automated webhook triggers."
  }
};
