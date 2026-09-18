// Mock Executive Summary Report Data
export const mockExecutiveSummaryData = {
  id: "EXEC-2026-881",
  fileName: "MedTech Suzhou - Orthopedics Plant_ExecSummary",
  reportTitle: "Executive Summary Report",
  auditableEntity: "MRC-002960-J&J Medical Austral",
  
  // 1. Scope summary section fields (Image 1)
  scopeSummary: {
    assessmentPeriod: "Q1 2026 – Q2 2026 (Jan 1, 2026 – Jun 30, 2026)",
    entitySector: "MedTech / Supply Chain & Operations",
    entityLocation: "Suzhou Plant & Regional Operations Hub (Suzhou, China)",
    metric: "GxP Compliance, SOX 404 Controls & IT Access Security",
    objectivePrefix: "Examples:",
    objectiveBullets: [
      "Cover controls and processes associated with production lines, manufacturing activities, warehouse management, and operational technology managed by the plant IT team.",
      "Assess the company's oversight over critical third-party vendors."
    ],
    // Interactive Matrix Table (Leasing, Global_Access_Management, Global_Change_Management, System Configuration, Grand Total)
    processMatrix: [
      { processTitle: "Leasing", critical: 1, major: 0, minor: 3, total: 4 },
      { processTitle: "Global_Access_Management", critical: 0, major: 1, minor: 1, total: 2 },
      { processTitle: "Global_Change_Management", critical: 0, major: 0, minor: 1, total: 1 },
      { processTitle: "System Configuration", critical: 0, major: 0, minor: 1, total: 1 },
      { processTitle: "Grand Total", critical: 1, major: 1, minor: 6, total: 8 }
    ],
    background: "MedTech Suzhou is a primary manufacturing facility producing orthopedics implants, surgical devices, and precision instruments. Global Audit and Assurance conducted this periodic review to evaluate operational resilience, lease management compliance in Costar records, and system access governance following the regional infrastructure modernization."
  },

  // 2. Audit Insights section (Image 2)
  auditInsights: {
    overallText: "for the processes reviewed, 1 critical, 1 major and 6 minor findings were identified, 0 of which were repeated",
    paragraphs: [
      "The audit findings highlight significant deficiencies in the accuracy and management of lease-related data and user access reviews within the organization's systems. Inaccurate documentation of lease modification and renewal dates has led to financial misstatements, including an understatement of lease liabilities by USD 1.28M, which could impact financial reporting integrity and compliance. Additionally, the inability to process payments beyond lease terms and discrepancies in payment schedules reflect operational inefficiencies that may hinder effective lease management and financial planning.",
      "Furthermore, the incomplete user access review process, which excludes dormant users with active access, poses a risk to system security and access control. This gap in oversight increases the likelihood of unauthorized access and compromises the organization's ability to maintain robust access governance, potentially exposing sensitive data and systems to vulnerabilities.",
      "These issues collectively underscore broader risks to operational efficiency, financial accuracy, and security governance, which may adversely affect the organization's ability to achieve strategic objectives and maintain stakeholder trust."
    ]
  },

  // 3. Critical Issues / Major Issues section (Image 2)
  criticalMajorSection: {
    criticalIssue: {
      title: "Lease data discrepancies and system limitations in Costar records",
      description: "The audit identified discrepancies in lease modification and renewal dates, payment schedules, and liability calculations within the Costar system. These inaccuracies result in understated liabilities, misaligned payment records, and non-compliance with documented processes, highlighting deficiencies in information management and operational accuracy."
    },
    majorIssue: {
      title: "Semi-Annual User Access review exclusion of dormant users with access",
      description: "The Semi-Annual User Access review conducted in November 2025 was incomplete, as it did not account for dormant users with active access. This omission resulted in a failure to ensure a comprehensive user access review and recertification."
    }
  }
};

// Executive Report Field Edit History & Audit Logs for Track Changes Pop-over
export const mockExecutiveSummaryLogs = [
  {
    id: "EXEC-LOG-001",
    timestamp: "Today at 02:45 PM",
    date: "08/18/2026",
    user: "Sarah Jenkins",
    role: "Lead Internal Auditor",
    action: "Updated Process Matrix Severity Ratings",
    fieldChanged: "Scope Matrix — Leasing Row",
    oldValue: "Critical: 0, Major: 1, Minor: 3 (Total: 4)",
    newValue: "Critical: 1, Major: 0, Minor: 3 (Total: 4, Grand Total: 8)",
    badgeType: "matrix"
  },
  {
    id: "EXEC-LOG-002",
    timestamp: "Today at 01:18 PM",
    date: "08/18/2026",
    user: "David Ross",
    role: "Audit Director",
    action: "Extended Assessment Period & Location Details",
    fieldChanged: "Scope Summary — Assessment Period",
    oldValue: "Q1 2026 (Jan 1, 2026 – Mar 31, 2026)",
    newValue: "Q1 2026 – Q2 2026 (Jan 1, 2026 – Jun 30, 2026)",
    badgeType: "scope"
  },
  {
    id: "EXEC-LOG-003",
    timestamp: "Today at 11:30 AM",
    date: "08/18/2026",
    user: "Sarah Jenkins",
    role: "Lead Internal Auditor",
    action: "Refined Executive Summary Objective Bullets",
    fieldChanged: "Scope Summary — Objective Bullet #2",
    oldValue: "Assess plant vendor management activities",
    newValue: "Assess the company's oversight over critical third-party vendors and GxP contract manufacturers.",
    badgeType: "update"
  },
  {
    id: "EXEC-LOG-004",
    timestamp: "Yesterday at 04:20 PM",
    date: "08/17/2026",
    user: "AI Executive Summary Generator",
    role: "Audit Intelligence Copilot",
    action: "Synthesized Executive Audit Insights & Root Cause",
    fieldChanged: "Audit Insights — Key Observations",
    oldValue: "Raw observations collected from 8 individual fieldwork testing sheets",
    newValue: "Synthesized executive narrative identifying $1.28M Costar liability understatement & dormant user access risks",
    badgeType: "create"
  },
  {
    id: "EXEC-LOG-005",
    timestamp: "Yesterday at 02:15 PM",
    date: "08/17/2026",
    user: "Marcus Vance",
    role: "Quality Assurance & Compliance Lead",
    action: "Updated Critical Issue Title & Costar Impact Description",
    fieldChanged: "Critical Issue — Costar Lease Records",
    oldValue: "Lease calculation differences in Costar",
    newValue: "Lease data discrepancies and system limitations in Costar records (understated liabilities by USD 1.28M)",
    badgeType: "issue"
  },
  {
    id: "EXEC-LOG-006",
    timestamp: "08/16/2026 at 10:05 AM",
    date: "08/16/2026",
    user: "System Engine",
    role: "Automated Report Builder",
    action: "Executive Summary Draft Initialized",
    fieldChanged: "All Executive Fields",
    oldValue: "-",
    newValue: "Initial executive report draft generated from finalized workpaper issues and scope parameters",
    badgeType: "create"
  }
];
