// Mock Dataset for Reporting Module Queue Jobs & Details

export const mockReportingJobs = [
  {
    id: "JOB-2026-881",
    reportId: "REP-2026-001",
    fileName: "BiosenseWebster_Catheters_Audit",
    engagement: "Audit Training",
    currentOwner: "Rachel Green",
    currentQueue: "TC Auditor",
    lastUpdated: "2026-08-01 10:15:22",
    status: "In Progress",
    executionStatus: "Completed",
    aging: "11 days 7.11 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-07-20 09:30:15",
      validationStartDateTime: "2026-07-21 10:00:00",
      validationEndDateTime: "2026-07-28 16:45:00",
      executionStatus: "Completed",
      validationStatus: "Validated"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-07-20 09:45:00",
      validationStartDateTime: "2026-07-21 11:15:00",
      validationEndDateTime: "2026-07-29 14:20:00",
      executionStatus: "Completed",
      validationStatus: "Validated"
    },
    discussionPoints: {
      startDateTime: "2026-07-20 08:00:00",
      endDateTime: "2026-08-01 09:42:00",
      status: "Active",
      count: 3
    }
  },
  {
    id: "JOB-2026-882",
    reportId: "REP-2026-002",
    fileName: "Ethicon_Surgical_Robotics_SOX",
    engagement: "Audit Enhancements",
    currentOwner: "Kevin Zhang",
    currentQueue: "Director",
    lastUpdated: "2026-07-31 16:20:10",
    status: "Under Review",
    executionStatus: "Running",
    aging: "4 days 2.45 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-07-27 11:20:00",
      validationStartDateTime: "2026-07-28 09:15:00",
      validationEndDateTime: "2026-07-30 18:00:00",
      executionStatus: "Running",
      validationStatus: "Pending Review"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-07-27 11:40:00",
      validationStartDateTime: "2026-07-28 10:00:00",
      validationEndDateTime: "2026-07-31 12:00:00",
      executionStatus: "Running",
      validationStatus: "Pending Review"
    },
    discussionPoints: {
      startDateTime: "2026-07-27 10:00:00",
      endDateTime: "2026-07-31 16:20:00",
      status: "Active",
      count: 4
    }
  },
  {
    id: "JOB-2026-883",
    reportId: "REP-2026-003",
    fileName: "DePuySynthes_Implant_Inventory",
    engagement: "GxP Compliance Audit",
    currentOwner: "Marcus Vance",
    currentQueue: "Business Owner",
    lastUpdated: "2026-07-30 14:10:05",
    status: "Completed",
    executionStatus: "Completed",
    aging: "2 days 1.12 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-07-28 08:00:00",
      validationStartDateTime: "2026-07-28 13:00:00",
      validationEndDateTime: "2026-07-30 10:00:00",
      executionStatus: "Completed",
      validationStatus: "Approved"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-07-28 08:30:00",
      validationStartDateTime: "2026-07-28 14:00:00",
      validationEndDateTime: "2026-07-30 11:30:00",
      executionStatus: "Completed",
      validationStatus: "Approved"
    },
    discussionPoints: {
      startDateTime: "2026-07-28 07:30:00",
      endDateTime: "2026-07-30 14:10:00",
      status: "Completed",
      count: 2
    }
  },
  {
    id: "JOB-2026-884",
    reportId: "REP-2026-004",
    fileName: "Janssen_SupplyChain_ColdStorage",
    engagement: "Audit Enhancements",
    currentOwner: "Sarah Jenkins",
    currentQueue: "Manager",
    lastUpdated: "2026-07-29 09:45:00",
    status: "In Progress",
    executionStatus: "Pending",
    aging: "7 days 18.30 Hours",
    auditReport: {
      genAiExtractionDateTime: "2026-07-24 14:10:00",
      validationStartDateTime: "2026-07-25 09:00:00",
      validationEndDateTime: "2026-07-29 09:00:00",
      executionStatus: "Pending",
      validationStatus: "In Validation"
    },
    executiveSummaryReport: {
      genAiExtractionDateTime: "2026-07-24 14:30:00",
      validationStartDateTime: "2026-07-25 10:00:00",
      validationEndDateTime: "2026-07-29 09:30:00",
      executionStatus: "Pending",
      validationStatus: "In Validation"
    },
    discussionPoints: {
      startDateTime: "2026-07-24 13:00:00",
      endDateTime: "2026-07-29 09:45:00",
      status: "Active",
      count: 5
    }
  }
];
