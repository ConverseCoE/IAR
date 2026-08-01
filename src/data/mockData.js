export const initialReports = [
  {
    id: "REP-2026-001",
    fileName: "Orthopedics Plant_AuditReport",
    plant: "MedTech Suzhou",
    fullName: "MedTech Suzhou - Orthopedics Plant_AuditReport",
    startDate: "04/27/2026 07:24:57 AM",
    executionStatus: "In Progress",
    validationStatus: "Not Started",
    lastUpdate: "04/27/2026 07:24:57 AM",
    status: "In Review",
    currentQueue: "TC",
    itDiscussion: {
      status: "Not started",
      lastUpdated: "04/26/2026",
      items: [
        { id: "IT-101", topic: "GxP System Access Logging", status: "Open", priority: "High", assignee: "Marcus Vance", notes: "Audit logs for CNC machinery calibration software require multi-factor verification." },
        { id: "IT-102", topic: "Backup Redundancy Test", status: "Not Started", priority: "Medium", assignee: "Sarah Jenkins", notes: "Verify offsite disaster recovery backup for plant telemetry databases." }
      ]
    },
    finOpsDiscussion: {
      status: "Not started",
      lastUpdated: "04/25/2026",
      items: [
        { id: "FO-201", topic: "CapEx Equipment Depreciation Variance", status: "In Review", priority: "Medium", assignee: "David Miller", notes: "Reconcile $1.2M automated sterilization line asset capitalization timeline." }
      ]
    },
    approvalWorkflows: {
      itWorkflow: [
        { name: "IT Audit Scope Approval", status: "Approved", user: "Marcus Vance", date: "04/25/2026 14:30" },
        { name: "Technical Safeguards Review", status: "In Progress", user: "Security Board", date: "04/27/2026 09:15" },
        { name: "Final IT Sign-off", status: "Pending", user: "CIO Office", date: "-" }
      ],
      finOpsWorkflow: [
        { name: "Cost Center Validation", status: "Approved", user: "David Miller", date: "04/24/2026 11:00" },
        { name: "FinOps Compliance Audit", status: "In Progress", user: "Global Finance", date: "04/27/2026 08:00" }
      ],
      execSummaryWorkflow: [
        { name: "Draft Review", status: "In Progress", user: "Lead Auditor (SA)", date: "04/27/2026 07:24" },
        { name: "Executive Committee Approval", status: "Pending", user: "VP Quality", date: "-" }
      ]
    },
    issueIndicator: {
      count: 2,
      critical: 1,
      minor: 1,
      issues: [
        { id: "ISS-01", title: "Calibration Log Discrepancy on Line 4", severity: "Critical", status: "Open", date: "04/26/2026" },
        { id: "ISS-02", title: "Operator Certification Expiry Alert", severity: "Minor", status: "Pending Review", date: "04/27/2026" }
      ]
    }
  },
  {
    id: "REP-2026-002",
    fileName: "Ethicon Surgical_PlantAuditReport",
    plant: "Ethicon Juarez",
    fullName: "Ethicon Juarez - Surgical Needles Plant_AuditReport",
    startDate: "04/26/2026 09:10:15 AM",
    executionStatus: "Completed",
    validationStatus: "Completed",
    lastUpdate: "04/27/2026 06:12:00 AM",
    status: "Completed",
    currentQueue: "QA",
    itDiscussion: {
      status: "Completed",
      lastUpdated: "04/26/2026",
      items: [
        { id: "IT-103", topic: "Cleanroom IoT Sensor Network Security", status: "Resolved", priority: "Low", assignee: "Elena Rostova", notes: "WPA3 Enterprise encryption validated across all wireless cleanroom sensors." }
      ]
    },
    finOpsDiscussion: {
      status: "Completed",
      lastUpdated: "04/26/2026",
      items: [
        { id: "FO-202", topic: "Raw Material Scrap Accounting", status: "Resolved", priority: "Low", assignee: "Carlos Gomez", notes: "Material variance within 0.02% of target enterprise tolerance." }
      ]
    },
    approvalWorkflows: {
      itWorkflow: [
        { name: "IT Audit Scope Approval", status: "Approved", user: "Elena Rostova", date: "04/25/2026 10:00" },
        { name: "Technical Safeguards Review", status: "Approved", user: "Security Board", date: "04/26/2026 15:30" }
      ],
      finOpsWorkflow: [
        { name: "FinOps Compliance Audit", status: "Approved", user: "Carlos Gomez", date: "04/26/2026 16:45" }
      ],
      execSummaryWorkflow: [
        { name: "Executive Committee Approval", status: "Approved", user: "VP Quality", date: "04/27/2026 06:00" }
      ]
    },
    issueIndicator: {
      count: 0,
      critical: 0,
      minor: 0,
      issues: []
    }
  },
  {
    id: "REP-2026-003",
    fileName: "Janssen Pharma_Biologics_Audit",
    plant: "Janssen Leiden",
    fullName: "Janssen Leiden - Biologics Facility_AuditReport",
    startDate: "04/27/2026 08:00:00 AM",
    executionStatus: "In Progress",
    validationStatus: "In Progress",
    lastUpdate: "04/27/2026 10:15:30 AM",
    status: "In Progress",
    currentQueue: "VAL",
    itDiscussion: {
      status: "In Progress",
      lastUpdated: "04/27/2026",
      items: [
        { id: "IT-104", topic: "Cold-chain Temperature Monitoring API", status: "In Review", priority: "High", assignee: "Lars van Dijk", notes: "REST API timeout observed during bulk batch data transfer to SAP S/4HANA." }
      ]
    },
    finOpsDiscussion: {
      status: "Not started",
      lastUpdated: "04/27/2026",
      items: [
        { id: "FO-203", topic: "Bioreactor Energy Consumption Offset", status: "Not Started", priority: "Medium", assignee: "Anke De Jong", notes: "Evaluate green energy credits allocated to bioreactor vessel 3." }
      ]
    },
    approvalWorkflows: {
      itWorkflow: [
        { name: "IT Audit Scope Approval", status: "Approved", user: "Lars van Dijk", date: "04/26/2026 13:00" },
        { name: "Technical Safeguards Review", status: "In Progress", user: "Security Board", date: "04/27/2026 10:00" }
      ],
      finOpsWorkflow: [
        { name: "FinOps Compliance Audit", status: "Pending", user: "Anke De Jong", date: "-" }
      ],
      execSummaryWorkflow: [
        { name: "Executive Committee Approval", status: "Pending", user: "VP Quality", date: "-" }
      ]
    },
    issueIndicator: {
      count: 1,
      critical: 1,
      minor: 0,
      issues: [
        { id: "ISS-03", title: "API Timeout on Batch Transfer #9921", severity: "Critical", status: "Open", date: "04/27/2026" }
      ]
    }
  },
  {
    id: "REP-2026-004",
    fileName: "DePuy Synthes_Implants_Audit",
    plant: "DePuy Cork",
    fullName: "DePuy Cork - Joint Reconstruction_AuditReport",
    startDate: "04/25/2026 11:45:00 AM",
    executionStatus: "Not Started",
    validationStatus: "Not Started",
    lastUpdate: "04/25/2026 11:45:00 AM",
    status: "Not Started",
    currentQueue: "PRE",
    itDiscussion: { status: "Not started", items: [] },
    finOpsDiscussion: { status: "Not started", items: [] },
    approvalWorkflows: {
      itWorkflow: [{ name: "IT Audit Scope Approval", status: "Pending", user: "Liam O'Connor", date: "-" }],
      finOpsWorkflow: [{ name: "FinOps Compliance Audit", status: "Pending", user: "Siobhan Kelly", date: "-" }],
      execSummaryWorkflow: [{ name: "Executive Committee Approval", status: "Pending", user: "VP Quality", date: "-" }]
    },
    issueIndicator: { count: 0, critical: 0, minor: 0, issues: [] }
  },
  {
    id: "REP-2026-005",
    fileName: "VisionCare_Lenses_GlobalAudit",
    plant: "J&J Vision Jacksonville",
    fullName: "J&J Vision Jacksonville - Contact Lens Plant_AuditReport",
    startDate: "04/24/2026 06:30:00 AM",
    executionStatus: "Completed",
    validationStatus: "Completed",
    lastUpdate: "04/26/2026 18:00:00 PM",
    status: "Completed",
    currentQueue: "DONE",
    itDiscussion: { status: "Completed", items: [] },
    finOpsDiscussion: { status: "Completed", items: [] },
    approvalWorkflows: {
      itWorkflow: [{ name: "IT Audit Scope Approval", status: "Approved", user: "Robert Davis", date: "04/24/2026" }],
      finOpsWorkflow: [{ name: "FinOps Compliance Audit", status: "Approved", user: "Patricia Taylor", date: "04/26/2026" }],
      execSummaryWorkflow: [{ name: "Executive Committee Approval", status: "Approved", user: "VP Quality", date: "04/26/2026" }]
    },
    issueIndicator: { count: 0, critical: 0, minor: 0, issues: [] }
  },
  {
    id: "REP-2026-006",
    fileName: "BiosenseWebster_Catheters_Audit",
    plant: "MedTech Irvine",
    fullName: "MedTech Irvine - Electrophysiology Catheters_AuditReport",
    startDate: "04/28/2026 09:00:00 AM",
    executionStatus: "In Progress",
    validationStatus: "In Progress",
    lastUpdate: "04/28/2026 11:30:00 AM",
    status: "In Review",
    currentQueue: "TC",
    itDiscussion: {
      status: "In Progress",
      items: [{ id: "IT-105", topic: "Laser Calibration Logs", status: "Open", priority: "High", assignee: "Kevin Zhang", notes: "Verify automated optic sensors compliance with FDA Part 11 electronic records." }]
    },
    finOpsDiscussion: { status: "Not started", items: [] },
    approvalWorkflows: {
      itWorkflow: [{ name: "IT Audit Scope Approval", status: "Approved", user: "Kevin Zhang", date: "04/27/2026" }],
      finOpsWorkflow: [{ name: "FinOps Compliance Audit", status: "In Progress", user: "Rachel Green", date: "04/28/2026" }],
      execSummaryWorkflow: [{ name: "Executive Committee Approval", status: "Pending", user: "VP Quality", date: "-" }]
    },
    issueIndicator: { count: 1, critical: 0, minor: 1, issues: [{ id: "ISS-04", title: "Cleanroom Humidity Excursion Log #442", severity: "Minor", status: "Open", date: "04/28/2026" }] }
  },
  {
    id: "REP-2026-007",
    fileName: "SurgicalVision_LASER_SystemAudit",
    plant: "J&J Vision Milpitas",
    fullName: "J&J Vision Milpitas - Femtosecond Lasers_AuditReport",
    startDate: "04/27/2026 14:15:00 PM",
    executionStatus: "Completed",
    validationStatus: "Completed",
    lastUpdate: "04/28/2026 08:45:00 AM",
    status: "Completed",
    currentQueue: "QA",
    itDiscussion: { status: "Completed", items: [] },
    finOpsDiscussion: { status: "Completed", items: [] },
    approvalWorkflows: {
      itWorkflow: [{ name: "IT Scope", status: "Approved", user: "Jessica Wong", date: "04/27/2026" }],
      finOpsWorkflow: [{ name: "FinOps", status: "Approved", user: "Michael Scott", date: "04/28/2026" }],
      execSummaryWorkflow: [{ name: "Exec", status: "Approved", user: "VP Quality", date: "04/28/2026" }]
    },
    issueIndicator: { count: 0, critical: 0, minor: 0, issues: [] }
  },
  {
    id: "REP-2026-008",
    fileName: "Cermak_Medical_Instruments_Audit",
    plant: "MedTech Prague",
    fullName: "MedTech Prague - Surgical Instruments_AuditReport",
    startDate: "04/29/2026 07:00:00 AM",
    executionStatus: "Not Started",
    validationStatus: "Not Started",
    lastUpdate: "04/29/2026 07:00:00 AM",
    status: "Not Started",
    currentQueue: "PRE",
    itDiscussion: { status: "Not started", items: [] },
    finOpsDiscussion: { status: "Not started", items: [] },
    approvalWorkflows: {
      itWorkflow: [{ name: "IT Scope", status: "Pending", user: "Jan Novak", date: "-" }],
      finOpsWorkflow: [{ name: "FinOps", status: "Pending", user: "Petra Cerna", date: "-" }],
      execSummaryWorkflow: [{ name: "Exec", status: "Pending", user: "VP Quality", date: "-" }]
    },
    issueIndicator: { count: 0, critical: 0, minor: 0, issues: [] }
  },
  {
    id: "REP-2026-009",
    fileName: "Ethicon_EndoSurgery_PlantAudit",
    plant: "Ethicon Cincinnati",
    fullName: "Ethicon Cincinnati - Minimally Invasive Instruments_AuditReport",
    startDate: "04/29/2026 08:30:00 AM",
    executionStatus: "In Progress",
    validationStatus: "In Progress",
    lastUpdate: "04/29/2026 11:10:00 AM",
    status: "In Progress",
    currentQueue: "TC",
    itDiscussion: { status: "In Progress", items: [{ id: "IT-106", topic: "Robotic Assembly Firmware Hashing", status: "Open", priority: "High", assignee: "Tom Bradley", notes: "SHA-256 integrity checksum verification." }] },
    finOpsDiscussion: { status: "Not started", items: [] },
    approvalWorkflows: {
      itWorkflow: [{ name: "IT Scope", status: "In Progress", user: "Tom Bradley", date: "04/29/2026" }],
      finOpsWorkflow: [{ name: "FinOps", status: "Pending", user: "Karen White", date: "-" }],
      execSummaryWorkflow: [{ name: "Exec", status: "Pending", user: "VP Quality", date: "-" }]
    },
    issueIndicator: { count: 1, critical: 1, minor: 0, issues: [{ id: "ISS-05", title: "Firmware Checksum Mismatch", severity: "Critical", status: "Open", date: "04/29/2026" }] }
  },
  {
    id: "REP-2026-010",
    fileName: "Janssen_Vaccines_FacilityAudit",
    plant: "Janssen Bern",
    fullName: "Janssen Bern - Viral Vector Vaccine Hub_AuditReport",
    startDate: "04/26/2026 10:00:00 AM",
    executionStatus: "Completed",
    validationStatus: "Completed",
    lastUpdate: "04/28/2026 16:20:00 PM",
    status: "Completed",
    currentQueue: "DONE",
    itDiscussion: { status: "Completed", items: [] },
    finOpsDiscussion: { status: "Completed", items: [] },
    approvalWorkflows: {
      itWorkflow: [{ name: "IT Scope", status: "Approved", user: "Beatrix Meier", date: "04/27/2026" }],
      finOpsWorkflow: [{ name: "FinOps", status: "Approved", user: "Hans Peter", date: "04/28/2026" }],
      execSummaryWorkflow: [{ name: "Exec", status: "Approved", user: "VP Quality", date: "04/28/2026" }]
    },
    issueIndicator: { count: 0, critical: 0, minor: 0, issues: [] }
  },
  {
    id: "REP-2026-011",
    fileName: "DePuySynthes_Trauma_Audit",
    plant: "DePuy Zuchwil",
    fullName: "DePuy Zuchwil - Bone Fixation Trauma Plant_AuditReport",
    startDate: "04/30/2026 06:15:00 AM",
    executionStatus: "Not Started",
    validationStatus: "Not Started",
    lastUpdate: "04/30/2026 06:15:00 AM",
    status: "Not Started",
    currentQueue: "PRE",
    itDiscussion: { status: "Not started", items: [] },
    finOpsDiscussion: { status: "Not started", items: [] },
    approvalWorkflows: {
      itWorkflow: [{ name: "IT Scope", status: "Pending", user: "Stefan Weber", date: "-" }],
      finOpsWorkflow: [{ name: "FinOps", status: "Pending", user: "Claudia Roth", date: "-" }],
      execSummaryWorkflow: [{ name: "Exec", status: "Pending", user: "VP Quality", date: "-" }]
    },
    issueIndicator: { count: 0, critical: 0, minor: 0, issues: [] }
  },
  {
    id: "REP-2026-012",
    fileName: "Mentor_Implants_QualityAudit",
    plant: "Mentor Santa Barbara",
    fullName: "Mentor Santa Barbara - Aesthetics Facility_AuditReport",
    startDate: "04/27/2026 13:00:00 PM",
    executionStatus: "In Progress",
    validationStatus: "Not Started",
    lastUpdate: "04/29/2026 09:40:00 AM",
    status: "In Review",
    currentQueue: "TC",
    itDiscussion: { status: "In Progress", items: [] },
    finOpsDiscussion: { status: "In Progress", items: [] },
    approvalWorkflows: {
      itWorkflow: [{ name: "IT Scope", status: "Approved", user: "Amanda Palmer", date: "04/27/2026" }],
      finOpsWorkflow: [{ name: "FinOps", status: "In Progress", user: "Brian Cox", date: "04/29/2026" }],
      execSummaryWorkflow: [{ name: "Exec", status: "Pending", user: "VP Quality", date: "-" }]
    },
    issueIndicator: { count: 0, critical: 0, minor: 0, issues: [] }
  }
];

export const phaseConfig = [
  { id: "pre-planning", label: "Pre - Planning", count: 4 },
  { id: "planning", label: "Planning", count: 6 },
  { id: "fieldwork", label: "Fieldwork", count: 12, active: true },
  { id: "reporting", label: "Reporting", count: 5 },
  { id: "wrap-up", label: "Wrap-up", count: 2 },
  { id: "dashboards", label: "Dashboards", count: null }
];

export const mockDiscussionPoints = [
  {
    id: "DP-001",
    reportId: "REP-2026-006",
    fileName: "BiosenseWebster_Catheters_Audit",
    rowNum: 1,
    header: "Laser Optics Sensor Calibration Verification",
    criticality: "Critical",
    functionType: "IT",
    description: "Verify automated optic sensors compliance with FDA Part 11 electronic record checksums.",
    addedBy: "Kevin Zhang",
    lastUpdatedBy: "Marcus Vance",
    status: "Active",
    isIssue: true
  },
  {
    id: "DP-002",
    reportId: "REP-2026-006",
    fileName: "BiosenseWebster_Catheters_Audit",
    rowNum: 2,
    header: "Cleanroom Temperature & Humidity Excursion Log",
    criticality: "High",
    functionType: "FinOps",
    description: "Evaluate cost variance of HVAC cleanroom environmental sensor recalibration.",
    addedBy: "Rachel Green",
    lastUpdatedBy: "David Miller",
    status: "Active",
    isIssue: false
  },
  {
    id: "DP-003",
    reportId: "REP-2026-006",
    fileName: "BiosenseWebster_Catheters_Audit",
    rowNum: 3,
    header: "Electrophysiology Catheter Line 3 Machine Firmware",
    criticality: "Medium",
    functionType: "IT",
    description: "Validate SHA-256 integrity hash verification during automated firmware flashes.",
    addedBy: "Kevin Zhang",
    lastUpdatedBy: "Sarah Jenkins",
    status: "Active",
    isIssue: false
  },
  {
    id: "DP-004",
    reportId: "REP-2026-006",
    fileName: "BiosenseWebster_Catheters_Audit",
    rowNum: 4,
    header: "Sterile Packaging Scrap Rate Accounting",
    criticality: "Low",
    functionType: "FinOps",
    description: "Audit scrap variance tolerance across Catheter Line 4 packaging unit.",
    addedBy: "Rachel Green",
    lastUpdatedBy: "Rachel Green",
    status: "Inactive",
    isIssue: false
  },
  {
    id: "DP-005",
    reportId: "REP-2026-006",
    fileName: "BiosenseWebster_Catheters_Audit",
    rowNum: 5,
    header: "GxP User Role & Audit Trail Security Review",
    criticality: "Critical",
    functionType: "IT",
    description: "Ensure multi-factor authentication audit logs for cleanroom CNC machinery software.",
    addedBy: "Kevin Zhang",
    lastUpdatedBy: "Kevin Zhang",
    status: "Active",
    isIssue: true
  }
];

