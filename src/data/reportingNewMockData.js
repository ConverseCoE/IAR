// Mock Dataset for Reporting (New) Module Queue Jobs & Details
// Curated 5 distinct audit states representing the exact workflow lifecycle
// Enriched with Granular Issue Lineage and Multi-Persona Stakeholder Rosters

export const mockReportingNewJobs = [
  // 1. Audit for status Not Started
  {
    id: "20260881",
    reportId: "REP-2026-001",
    fileName: "Ethicon_Surgical_Robotics_SOX",
    engagement: "Audit Enhancements",
    currentOwner: "Kevin Zhang",
    currentQueue: "Director",
    lastUpdated: "2026-08-05 09:15:00",
    status: "Not Started",
    subStatus: "Not Started",
    executionStatus: "Pending",
    aging: "1 day 2.15 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-08-04 11:20:00",
      validationStartDateTime: "2026-08-04 14:15:00",
      validationEndDateTime: "2026-08-05 09:00:00",
      executionStatus: "Pending",
      validationStatus: "Not Started"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-08-04 11:40:00",
      validationStartDateTime: "2026-08-04 14:30:00",
      validationEndDateTime: "2026-08-05 09:10:00",
      executionStatus: "Pending",
      validationStatus: "Not Started"
    },
    discussionPoints: {
      startDateTime: "2026-08-04 10:00:00",
      endDateTime: "2026-08-05 09:15:00",
      status: "Active",
      count: 1
    },
    issuesList: [
      {
        id: "ISSUE-101",
        title: "Initial Robotics Control Log Discrepancy",
        createdBy: "Rachel Green",
        createdRole: "auditor",
        lastEditedBy: "Rachel Green",
        currentLevel: "Auditor Drafting",
        currentRoleTarget: "auditor",
        status: "Drafting",
        severity: "Medium",
        updatedOn: "2026-08-05 09:15 AM"
      }
    ],
    roster: [
      { role: "Auditor", name: "Rachel Green", avatar: "RG", status: "Drafting Issue #101" },
      { role: "Team Co-Ordinator", name: "Kevin Zhang", avatar: "KZ", status: "Assigned" },
      { role: "Manager", name: "Sarah Jenkins", avatar: "SJ", status: "Awaiting Issues" },
      { role: "Director", name: "Marcus Vance", avatar: "MV", status: "Awaiting Issues" }
    ]
  },

  // 2. In Progress state & Audit Report In Progress substate
  {
    id: "20260882",
    reportId: "REP-2026-002",
    fileName: "Neurovascular_Stent_Manufacturing_Review",
    engagement: "Manufacturing Plant Audit",
    currentOwner: "Carlos Mendez",
    currentQueue: "Plant Auditor",
    lastUpdated: "2026-08-04 14:30:00",
    status: "In Progress",
    subStatus: "Audit Report In Progress",
    executionStatus: "Running",
    aging: "3 days 5.20 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-08-01 09:00:00",
      validationStartDateTime: "2026-08-01 10:00:00",
      validationEndDateTime: "2026-08-04 14:00:00",
      executionStatus: "Running",
      validationStatus: "In Progress"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-08-01 09:30:00",
      validationStartDateTime: "2026-08-01 10:30:00",
      validationEndDateTime: "2026-08-04 14:15:00",
      executionStatus: "Pending",
      validationStatus: "Not Started"
    },
    discussionPoints: {
      startDateTime: "2026-08-01 08:30:00",
      endDateTime: "2026-08-04 14:30:00",
      status: "Active",
      count: 2
    },
    issuesList: [
      {
        id: "ISSUE-201",
        title: "Cleanroom Temperature Calibration Drift",
        createdBy: "Carlos Mendez",
        createdRole: "auditor",
        lastEditedBy: "Rachel Green",
        currentLevel: "Team Co-Ordinator Review",
        currentRoleTarget: "team-coordinator",
        status: "In Review",
        severity: "High",
        updatedOn: "2026-08-04 02:30 PM"
      },
      {
        id: "ISSUE-202",
        title: "Sterilization Batch Documentation Gap",
        createdBy: "Rachel Green",
        createdRole: "auditor",
        lastEditedBy: "Sarah Jenkins",
        currentLevel: "Manager Approval",
        currentRoleTarget: "manager",
        status: "Pending Sign-Off",
        severity: "Critical",
        updatedOn: "2026-08-04 11:15 AM"
      }
    ],
    roster: [
      { role: "Auditor", name: "Carlos Mendez", avatar: "CM", status: "Created Issue #201" },
      { role: "Auditor", name: "Rachel Green", avatar: "RG", status: "Edited Issue #201 & #202" },
      { role: "Team Co-Ordinator", name: "Kevin Zhang", avatar: "KZ", status: "Reviewing #201" },
      { role: "Manager", name: "Sarah Jenkins", avatar: "SJ", status: "Pending Action on #202" },
      { role: "Director", name: "Marcus Vance", avatar: "MV", status: "Queued" }
    ]
  },

  // 3. In Progress state & Audit Report Completed substate
  {
    id: "20260883",
    reportId: "REP-2026-003",
    fileName: "Janssen_SupplyChain_ColdStorage",
    engagement: "Audit Enhancements",
    currentOwner: "Sarah Jenkins",
    currentQueue: "Manager",
    lastUpdated: "2026-08-03 16:45:00",
    status: "In Progress",
    subStatus: "Audit Report Completed",
    executionStatus: "Completed",
    aging: "5 days 8.40 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-07-29 14:10:00",
      validationStartDateTime: "2026-07-30 09:00:00",
      validationEndDateTime: "2026-08-03 16:00:00",
      executionStatus: "Completed",
      validationStatus: "Validated"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-07-29 14:30:00",
      validationStartDateTime: "2026-07-30 10:00:00",
      validationEndDateTime: "2026-08-03 16:30:00",
      executionStatus: "Pending",
      validationStatus: "Not Started"
    },
    discussionPoints: {
      startDateTime: "2026-07-29 13:00:00",
      endDateTime: "2026-08-03 16:45:00",
      status: "Active",
      count: 3
    },
    issuesList: [
      {
        id: "ISSUE-301",
        title: "Cold Chain Warehouse Sensor Outage",
        createdBy: "Rachel Green",
        createdRole: "auditor",
        lastEditedBy: "Carlos Mendez",
        currentLevel: "Manager Approval",
        currentRoleTarget: "manager",
        status: "Manager Review",
        severity: "Critical",
        updatedOn: "2026-08-03 04:45 PM"
      },
      {
        id: "ISSUE-302",
        title: "Refrigerated Transit Backup Generator Test",
        createdBy: "Carlos Mendez",
        createdRole: "auditor",
        lastEditedBy: "Kevin Zhang",
        currentLevel: "Director Approval",
        currentRoleTarget: "director",
        status: "Director Sign-Off",
        severity: "Medium",
        updatedOn: "2026-08-03 02:10 PM"
      },
      {
        id: "ISSUE-303",
        title: "Vendor SLA Data Integrity Verification",
        createdBy: "Rachel Green",
        createdRole: "auditor",
        lastEditedBy: "Sarah Jenkins",
        currentLevel: "VP Final Sign-Off",
        currentRoleTarget: "vp",
        status: "VP Review",
        severity: "High",
        updatedOn: "2026-08-03 11:30 AM"
      }
    ],
    roster: [
      { role: "Auditor", name: "Rachel Green", avatar: "RG", status: "Authored #301, #303" },
      { role: "Auditor", name: "Carlos Mendez", avatar: "CM", status: "Authored #302" },
      { role: "Team Co-Ordinator", name: "Kevin Zhang", avatar: "KZ", status: "Reviewed All" },
      { role: "Manager", name: "Sarah Jenkins", avatar: "SJ", status: "Pending Sign-Off #301" },
      { role: "Director", name: "Marcus Vance", avatar: "MV", status: "Pending Sign-Off #302" },
      { role: "VP", name: "Elena Rostova", avatar: "ER", status: "Pending Sign-Off #303" }
    ]
  },

  // 4. In Progress state & Executive Report In Progress substate
  {
    id: "20260884",
    reportId: "REP-2026-004",
    fileName: "BiosenseWebster_Catheters_Audit",
    engagement: "Audit Training",
    currentOwner: "Rachel Green",
    currentQueue: "TC Auditor",
    lastUpdated: "2026-08-02 11:20:00",
    status: "In Progress",
    subStatus: "Executive Report In Progress",
    executionStatus: "Running",
    aging: "7 days 11.15 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-07-25 09:30:15",
      validationStartDateTime: "2026-07-26 10:00:00",
      validationEndDateTime: "2026-08-01 16:45:00",
      executionStatus: "Completed",
      validationStatus: "Validated"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-07-25 09:45:00",
      validationStartDateTime: "2026-07-26 11:15:00",
      validationEndDateTime: "2026-08-02 11:00:00",
      executionStatus: "Running",
      validationStatus: "In Progress"
    },
    discussionPoints: {
      startDateTime: "2026-07-25 08:00:00",
      endDateTime: "2026-08-02 11:20:00",
      status: "Active",
      count: 2
    },
    issuesList: [
      {
        id: "ISSUE-401",
        title: "Electrophysiology Catheter Lot Traceability",
        createdBy: "Rachel Green",
        createdRole: "auditor",
        lastEditedBy: "Kevin Zhang",
        currentLevel: "Director Approval",
        currentRoleTarget: "director",
        status: "In Executive Review",
        severity: "High",
        updatedOn: "2026-08-02 11:20 AM"
      },
      {
        id: "ISSUE-402",
        title: "Supplier Quality Inspection Deviation",
        createdBy: "Carlos Mendez",
        createdRole: "auditor",
        lastEditedBy: "Sarah Jenkins",
        currentLevel: "VP Sign-Off",
        currentRoleTarget: "vp",
        status: "Pending Executive",
        severity: "Critical",
        updatedOn: "2026-08-02 09:15 AM"
      }
    ],
    roster: [
      { role: "Auditor", name: "Rachel Green", avatar: "RG", status: "Authored #401" },
      { role: "Auditor", name: "Carlos Mendez", avatar: "CM", status: "Authored #402" },
      { role: "Manager", name: "Sarah Jenkins", avatar: "SJ", status: "Approved Audit Report" },
      { role: "Director", name: "Marcus Vance", avatar: "MV", status: "Reviewing Executive Draft" },
      { role: "VP", name: "Elena Rostova", avatar: "ER", status: "Awaiting Final Submission" }
    ]
  },

  // 5. Completed state & Executive Report Completed substate
  {
    id: "20260885",
    reportId: "REP-2026-005",
    fileName: "DePuySynthes_Implant_Inventory",
    engagement: "GxP Compliance Audit",
    currentOwner: "Marcus Vance",
    currentQueue: "Business Owner",
    lastUpdated: "2026-08-01 15:10:00",
    status: "Completed",
    subStatus: "Executive Report Completed",
    executionStatus: "Completed",
    aging: "9 days 1.30 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-07-22 08:00:00",
      validationStartDateTime: "2026-07-22 13:00:00",
      validationEndDateTime: "2026-07-28 10:00:00",
      executionStatus: "Completed",
      validationStatus: "Approved"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-07-22 08:30:00",
      validationStartDateTime: "2026-07-22 14:00:00",
      validationEndDateTime: "2026-08-01 14:30:00",
      executionStatus: "Completed",
      validationStatus: "Approved"
    },
    discussionPoints: {
      startDateTime: "2026-07-22 07:30:00",
      endDateTime: "2026-08-01 15:10:00",
      status: "Completed",
      count: 2
    },
    issuesList: [
      {
        id: "ISSUE-501",
        title: "Titanium Joint Implant Barcode Serialization",
        createdBy: "Rachel Green",
        createdRole: "auditor",
        lastEditedBy: "Elena Rostova",
        currentLevel: "Completed & Signed Off",
        currentRoleTarget: "completed",
        status: "Completed",
        severity: "Medium",
        updatedOn: "2026-08-01 03:10 PM"
      },
      {
        id: "ISSUE-502",
        title: "Sterile Packaging Inspection Variance",
        createdBy: "Carlos Mendez",
        createdRole: "auditor",
        lastEditedBy: "Elena Rostova",
        currentLevel: "Completed & Signed Off",
        currentRoleTarget: "completed",
        status: "Completed",
        severity: "High",
        updatedOn: "2026-08-01 02:45 PM"
      }
    ],
    roster: [
      { role: "Auditor", name: "Rachel Green", avatar: "RG", status: "Completed" },
      { role: "Auditor", name: "Carlos Mendez", avatar: "CM", status: "Completed" },
      { role: "Team Co-Ordinator", name: "Kevin Zhang", avatar: "KZ", status: "Completed" },
      { role: "Manager", name: "Sarah Jenkins", avatar: "SJ", status: "Signed Off" },
      { role: "Director", name: "Marcus Vance", avatar: "MV", status: "Signed Off" },
      { role: "VP", name: "Elena Rostova", avatar: "ER", status: "Final Approved" }
    ]
  },

  // 6. Completed Audit (Others Contributed — Completed)
  {
    id: "20260886",
    reportId: "REP-2026-006",
    fileName: "Animas_Insulin_Pump_Software_SOX",
    engagement: "Medical Device Software Audit",
    currentOwner: "Elena Rostova",
    currentQueue: "VP Review",
    lastUpdated: "2026-07-31 16:20:00",
    status: "Completed",
    subStatus: "Executive Report Completed",
    executionStatus: "Completed",
    aging: "11 days 4.00 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-07-20 08:00:00",
      validationStartDateTime: "2026-07-20 11:00:00",
      validationEndDateTime: "2026-07-25 16:00:00",
      executionStatus: "Completed",
      validationStatus: "Approved"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-07-20 08:30:00",
      validationStartDateTime: "2026-07-20 11:30:00",
      validationEndDateTime: "2026-07-31 16:00:00",
      executionStatus: "Completed",
      validationStatus: "Approved"
    },
    discussionPoints: {
      startDateTime: "2026-07-20 07:30:00",
      endDateTime: "2026-07-31 16:20:00",
      status: "Completed",
      count: 1
    },
    issuesList: [
      {
        id: "ISSUE-601",
        title: "Insulin Dosing Firmware Telemetry Logging",
        createdBy: "Carlos Mendez",
        createdRole: "auditor",
        lastEditedBy: "Elena Rostova",
        currentLevel: "Completed & Signed Off",
        currentRoleTarget: "completed",
        status: "Completed",
        severity: "Critical",
        updatedOn: "2026-07-31 04:20 PM"
      }
    ],
    roster: [
      { role: "Auditor", name: "Carlos Mendez", avatar: "CM", status: "Authored #601" },
      { role: "Manager", name: "Sarah Jenkins", avatar: "SJ", status: "Signed Off" },
      { role: "VP", name: "Elena Rostova", avatar: "ER", status: "Final Approved" }
    ]
  },

  // 7. Not Started Audit (Allocated Audits — Not Started)
  {
    id: "20260887",
    reportId: "REP-2026-007",
    fileName: "Acclarent_ENT_Surgical_Equipment_Audit",
    engagement: "Quality Management Review",
    currentOwner: "Rachel Green",
    currentQueue: "Auditor Queue",
    lastUpdated: "2026-08-06 08:30:00",
    status: "Not Started",
    subStatus: "Not Started",
    executionStatus: "Pending",
    aging: "0 days 4.30 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-08-06 08:00:00",
      validationStartDateTime: "2026-08-06 08:15:00",
      validationEndDateTime: "2026-08-06 08:30:00",
      executionStatus: "Pending",
      validationStatus: "Not Started"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-08-06 08:15:00",
      validationStartDateTime: "2026-08-06 08:20:00",
      validationEndDateTime: "2026-08-06 08:30:00",
      executionStatus: "Pending",
      validationStatus: "Not Started"
    },
    discussionPoints: {
      startDateTime: "2026-08-06 08:00:00",
      endDateTime: "2026-08-06 08:30:00",
      status: "Active",
      count: 0
    },
    issuesList: [],
    roster: [
      { role: "Auditor", name: "Rachel Green", avatar: "RG", status: "Assigned Lead" },
      { role: "Team Co-Ordinator", name: "Kevin Zhang", avatar: "KZ", status: "Awaiting Issues" }
    ]
  },

  // 8. In Progress Audit (Others Contributed — In Progress)
  {
    id: "20260888",
    reportId: "REP-2026-008",
    fileName: "Mentor_Breast_Implants_Regulatory_Review",
    engagement: "Regulatory Compliance Audit",
    currentOwner: "Elena Rostova",
    currentQueue: "VP Queue",
    lastUpdated: "2026-08-05 15:45:00",
    status: "In Progress",
    subStatus: "Audit Report Completed",
    executionStatus: "Running",
    aging: "2 days 3.10 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-08-03 09:00:00",
      validationStartDateTime: "2026-08-03 10:00:00",
      validationEndDateTime: "2026-08-05 15:00:00",
      executionStatus: "Completed",
      validationStatus: "Validated"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-08-03 09:30:00",
      validationStartDateTime: "2026-08-03 10:30:00",
      validationEndDateTime: "2026-08-05 15:30:00",
      executionStatus: "Running",
      validationStatus: "In Progress"
    },
    discussionPoints: {
      startDateTime: "2026-08-03 08:30:00",
      endDateTime: "2026-08-05 15:45:00",
      status: "Active",
      count: 1
    },
    issuesList: [
      {
        id: "ISSUE-801",
        title: "Post-Market Surveillance Vigilance Reporting",
        createdBy: "Carlos Mendez",
        createdRole: "auditor",
        lastEditedBy: "Marcus Vance",
        currentLevel: "VP Sign-Off",
        currentRoleTarget: "vp",
        status: "VP Review",
        severity: "Critical",
        updatedOn: "2026-08-05 03:45 PM"
      }
    ],
    roster: [
      { role: "Auditor", name: "Carlos Mendez", avatar: "CM", status: "Authored #801" },
      { role: "Manager", name: "Sarah Jenkins", avatar: "SJ", status: "Approved" },
      { role: "Director", name: "Marcus Vance", avatar: "MV", status: "Approved" },
      { role: "VP", name: "Elena Rostova", avatar: "ER", status: "Pending Final Review" }
    ]
  }
];

export const mockDiscussionPointsByReport = {
  // 1. Ethicon Surgical Robotics
  "20260881": [
    {
      id: "101",
      issueId: "101",
      header: "Robotics Automated Calibration Discrepancy",
      title: "Robotics Automated Calibration Discrepancy",
      criticality: "Critical",
      tech: "IT",
      functionType: "IT",
      description: "Automated calibration logs in the Ethicon cleanroom robotics suite showed unvalidated parameter drifts exceeding 1.5% margin during night shift batch processes.",
      addedBy: "Rachel Green",
      lastUpdatedBy: "Carlos Mendez",
      status: "Manager Pending",
      updatedOn: "2026-08-05 10:15 AM",
      rowNum: 1
    }
  ],

  // 2. Neurovascular Stent Manufacturing
  "20260882": [
    {
      id: "201",
      issueId: "201",
      header: "Cleanroom Temperature Calibration Drift",
      title: "Cleanroom Temperature Calibration Drift",
      criticality: "Major",
      tech: "FinOps",
      functionType: "FinOps",
      description: "HVAC sensor calibration log in Building 4 cleanroom showed a 1.2°C temperature variance over 72 hours, impacting stent coating curing times.",
      addedBy: "Carlos Mendez",
      lastUpdatedBy: "Rachel Green",
      status: "TC Pending",
      updatedOn: "2026-08-04 02:30 PM",
      rowNum: 1
    },
    {
      id: "202",
      issueId: "202",
      header: "Sterilization Batch Documentation Gap",
      title: "Sterilization Batch Documentation Gap",
      criticality: "Critical",
      tech: "IT",
      functionType: "IT",
      description: "Batch sterilization records for Lot #NV-2026-89 were missing required dual-sign-off timestamps in the Electronic Batch Record (EBR) system.",
      addedBy: "Rachel Green",
      lastUpdatedBy: "Sarah Jenkins",
      status: "Manager Pending",
      updatedOn: "2026-08-04 11:15 AM",
      rowNum: 2
    }
  ],

  // 3. Janssen Supply Chain Cold Storage
  "20260883": [
    {
      id: "301",
      issueId: "301",
      header: "Cold Chain Warehouse Sensor Outage",
      title: "Cold Chain Warehouse Sensor Outage",
      criticality: "Critical",
      tech: "IT",
      functionType: "IT",
      description: "IoT thermal monitoring sensors in Zone B cold storage experienced an unmonitored 45-minute telemetry gap during firmware upgrade.",
      addedBy: "Rachel Green",
      lastUpdatedBy: "Carlos Mendez",
      status: "Manager Pending",
      updatedOn: "2026-08-03 04:45 PM",
      rowNum: 1
    },
    {
      id: "302",
      issueId: "302",
      header: "Refrigerated Transit Backup Generator Test",
      title: "Refrigerated Transit Backup Generator Test",
      criticality: "Major",
      tech: "FinOps",
      functionType: "FinOps",
      description: "Secondary generator quarterly failover tests at distribution hub failed to activate automatically within the mandatory 15-second SLA window.",
      addedBy: "Carlos Mendez",
      lastUpdatedBy: "Kevin Zhang",
      status: "Director Pending",
      updatedOn: "2026-08-03 02:10 PM",
      rowNum: 2
    },
    {
      id: "303",
      issueId: "303",
      header: "Vendor SLA Data Integrity Verification",
      title: "Vendor SLA Data Integrity Verification",
      criticality: "Major",
      tech: "IT",
      functionType: "IT",
      description: "Third-party logistics provider temperature compliance manifests contained unverified manual overrides on 12 international shipments.",
      addedBy: "Rachel Green",
      lastUpdatedBy: "Sarah Jenkins",
      status: "VP Pending",
      updatedOn: "2026-08-03 11:30 AM",
      rowNum: 3
    }
  ],

  // 4. Biosense Webster Catheters Audit
  "20260884": [
    {
      id: "401",
      issueId: "401",
      header: "Electrophysiology Catheter Lot Traceability",
      title: "Electrophysiology Catheter Lot Traceability",
      criticality: "Critical",
      tech: "IT",
      functionType: "IT",
      description: "Lot barcode scanning logs for Catheter Sub-Assembly #EP-902 showed 8 unmapped component batches in MES database.",
      addedBy: "Rachel Green",
      lastUpdatedBy: "Kevin Zhang",
      status: "Manager Pending",
      updatedOn: "2026-08-02 02:40 PM",
      rowNum: 1
    },
    {
      id: "402",
      issueId: "402",
      header: "Cleanroom Sensor Calibration Interval",
      title: "Cleanroom Sensor Calibration Interval",
      criticality: "Major",
      tech: "FinOps",
      functionType: "FinOps",
      description: "Differential pressure gauges in Catheter Assembly Suite 3 exceeded annual recalibration deadline by 18 calendar days.",
      addedBy: "Carlos Mendez",
      lastUpdatedBy: "Sarah Jenkins",
      status: "TC Pending",
      updatedOn: "2026-08-02 11:15 AM",
      rowNum: 2
    },
    {
      id: "403",
      issueId: "403",
      header: "Automated Catheter Testing Software Validation",
      title: "Automated Catheter Testing Software Validation",
      criticality: "Minor",
      tech: "IT",
      functionType: "IT",
      description: "Software release v4.2 for electrical continuity testing lacked documented User Acceptance Testing (UAT) sign-off prior to deployment.",
      addedBy: "Kevin Zhang",
      lastUpdatedBy: "Carlos Mendez",
      status: "Completed",
      updatedOn: "2026-08-01 09:30 AM",
      rowNum: 3
    }
  ],

  // 5. DePuy Synthes Implants Quality
  "20260885": [
    {
      id: "501",
      issueId: "501",
      header: "Implant Component Batch Testing Compliance",
      title: "Implant Component Batch Testing Compliance",
      criticality: "Critical",
      tech: "IT",
      functionType: "IT",
      description: "Titanium alloy fatigue testing certificates for hip implant batch #DS-2026 were uploaded to DMS without QA sign-off stamp.",
      addedBy: "Rachel Green",
      lastUpdatedBy: "Elena Rostova",
      status: "VP Pending",
      updatedOn: "2026-08-01 03:10 PM",
      rowNum: 1
    },
    {
      id: "502",
      issueId: "502",
      header: "Sterile Packaging Seal Integrity Verification",
      title: "Sterile Packaging Seal Integrity Verification",
      criticality: "Major",
      tech: "FinOps",
      functionType: "FinOps",
      description: "Heat sealing pressure validation logs for sterile pouch packaging line #2 showed 4 pressure drops below 4.5 bar operating threshold.",
      addedBy: "Carlos Mendez",
      lastUpdatedBy: "Sarah Jenkins",
      status: "Manager Pending",
      updatedOn: "2026-08-01 02:45 PM",
      rowNum: 2
    }
  ]
};

export const mockDiscussionPointsNew = mockDiscussionPointsByReport["20260884"];
