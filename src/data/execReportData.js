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
    objectiveHtml: "<ul><li>Cover controls and processes associated with production lines, manufacturing activities, warehouse management, and operational technology managed by the plant IT team.</li><li>Assess the company's oversight over critical third-party vendors.</li></ul>",
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
    narrativeHtml: "<p>The audit findings highlight significant deficiencies in the accuracy and management of lease-related data and user access reviews within the organization's systems. Inaccurate documentation of lease modification and renewal dates has led to financial misstatements, including an understatement of lease liabilities by USD 1.28M, which could impact financial reporting integrity and compliance. Additionally, the inability to process payments beyond lease terms and discrepancies in payment schedules reflect operational inefficiencies that may hinder effective lease management and financial planning.</p><p>Furthermore, the incomplete user access review process, which excludes dormant users with active access, poses a risk to system security and access control. This gap in oversight increases the likelihood of unauthorized access and compromises the organization's ability to maintain robust access governance, potentially exposing sensitive data and systems to vulnerabilities.</p><p>These issues collectively underscore broader risks to operational efficiency, financial accuracy, and security governance, which may adversely affect the organization's ability to achieve strategic objectives and maintain stakeholder trust.</p>",
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

// Dynamically generate meaningful executive summary data based on each audit and its issues
export function generateExecutiveSummaryData(job) {
  if (!job) return mockExecutiveSummaryData;

  const rawFileName = job.fileName || job.fullName || "MedTech Audit Report";
  const cleanTitle = rawFileName.replace(/_/g, ' ');
  const auditableEntity = job.issuesList?.[0]?.auditableEntity || 
    (job.id ? `MRC-${job.id}-${cleanTitle.split(' ')[0]}` : "MRC-002960-J&J Medical Austral");

  // Determine Sector, Location, Facility details based on audit name / engagement
  let sector = "MedTech / Supply Chain & Operations";
  let location = "Regional Manufacturing & Operations Hub";
  let facilityName = cleanTitle;
  let facilityPurpose = "medical device manufacturing, product assembly, and distribution";
  let metric = "GxP Compliance, SOX 404 Controls & IT Access Security";

  const lowerName = cleanTitle.toLowerCase();
  if (lowerName.includes("robotics") || lowerName.includes("surgical")) {
    sector = "MedTech / Robotics & Digital Solutions";
    location = "Juarez Manufacturing Campus (Chihuahua, Mexico)";
    facilityName = "Ethicon Juarez Robotics & Surgical Facility";
    facilityPurpose = "precision robotic surgical instruments and SOX-governed digital operating software";
    metric = "SOX 404 ITGC Controls, Software Traceability & GxP Quality Assurance";
  } else if (lowerName.includes("stent") || lowerName.includes("neurovascular")) {
    sector = "MedTech / Neurovascular Interventional Systems";
    location = "Miami Lakes Plant & Regional Operations Hub (Florida, USA)";
    facilityName = "Neurovascular Interventional Manufacturing Plant";
    facilityPurpose = "endovascular implants, stent delivery systems, and catheter micro-assemblies";
    metric = "Cleanroom Environmental GxP, ISO 13485 Controls & BMS Automation";
  } else if (lowerName.includes("catheter") || lowerName.includes("biosense")) {
    sector = "MedTech / Cardiovascular & Specialty Solutions";
    location = "Irwindale Plant & Regional Operations Hub (California, USA)";
    facilityName = "Biosense Webster Electrophysiology Plant";
    facilityPurpose = "cardiac diagnostic and therapeutic ablation catheter technologies";
    metric = "GxP Sensor Calibration, Automated Robotics & SOX ITGC Access Governance";
  } else if (lowerName.includes("cold") || lowerName.includes("janssen") || lowerName.includes("storage")) {
    sector = "Innovative Medicine / Global Supply Chain & Logistics";
    location = "Leiden Global Distribution Center (Leiden, Netherlands)";
    facilityName = "Janssen Cold Chain Distribution Center";
    facilityPurpose = "temperature-sensitive biopharmaceutical storage, ultra-low temperature cold chains, and vaccine logistics";
    metric = "Cold Chain GxP Telemetry, Good Distribution Practices (GDP) & Vendor SLAs";
  } else if (lowerName.includes("orthopedics") || lowerName.includes("suzhou")) {
    sector = "MedTech / Orthopedics & Precision Manufacturing";
    location = "Suzhou Plant & Regional Operations Hub (Suzhou, China)";
    facilityName = "MedTech Suzhou Orthopedics Plant";
    facilityPurpose = "orthopedics implants, surgical devices, and precision instruments";
    metric = "GxP Compliance, SOX 404 Controls & IT Access Security";
  } else if (lowerName.includes("vision") || lowerName.includes("lens") || lowerName.includes("acuvue")) {
    sector = "MedTech / Vision Care & Ophthalmic Devices";
    location = "Limerick Manufacturing Campus (Limerick, Ireland)";
    facilityName = "Johnson & Johnson Vision Care Limerick Plant";
    facilityPurpose = "automated daily disposable contact lens casting, high-speed optical inspection, and sterile blister packaging";
    metric = "Automated Optical Inspection GxP, ISO 13485 Standards & Cleanroom Environmental Controls";
  }

  // Extract issues from job
  const issues = Array.isArray(job.issuesList) ? job.issuesList : [];

  // 1. Build Process Breakdown Matrix from actual issues
  let processMatrix = [];
  if (issues.length > 0) {
    const areaMap = new Map();
    
    issues.forEach(iss => {
      const area = (iss.processArea || iss.function || "General Operations").replace(/_/g, ' ');
      if (!areaMap.has(area)) {
        areaMap.set(area, { critical: 0, major: 0, minor: 0 });
      }
      const counts = areaMap.get(area);
      const crit = (iss.criticality || iss.severity || "").toLowerCase();
      if (crit === "critical") {
        counts.critical += 1;
      } else if (crit === "major" || crit === "high") {
        counts.major += 1;
      } else {
        counts.minor += 1;
      }
    });

    let sumCrit = 0, sumMaj = 0, sumMin = 0, sumAll = 0;
    areaMap.forEach((counts, area) => {
      const rowTotal = counts.critical + counts.major + counts.minor;
      sumCrit += counts.critical;
      sumMaj += counts.major;
      sumMin += counts.minor;
      sumAll += rowTotal;
      processMatrix.push({
        processTitle: area,
        critical: counts.critical,
        major: counts.major,
        minor: counts.minor,
        total: rowTotal
      });
    });

    // Grand total row
    processMatrix.push({
      processTitle: "Grand Total",
      critical: sumCrit,
      major: sumMaj,
      minor: sumMin,
      total: sumAll
    });
  } else {
    // Default matrix for Not Started or empty issues list
    processMatrix = [
      { processTitle: "Production & Assembly Controls", critical: 0, major: 0, minor: 1, total: 1 },
      { processTitle: "Quality & Regulatory Compliance", critical: 0, major: 0, minor: 1, total: 1 },
      { processTitle: "IT Access & Data Integrity", critical: 0, major: 1, minor: 0, total: 1 },
      { processTitle: "Facilities & Preventive Maintenance", critical: 0, major: 0, minor: 1, total: 1 },
      { processTitle: "Grand Total", critical: 0, major: 1, minor: 3, total: 4 }
    ];
  }

  // Compute Grand Totals
  const grandTotalRow = processMatrix[processMatrix.length - 1];
  const critCount = grandTotalRow.critical;
  const majCount = grandTotalRow.major;
  const minCount = grandTotalRow.minor;
  const allCount = grandTotalRow.total;

  // 2. Identify Critical and Major Issues
  const criticalIssues = issues.filter(i => (i.criticality || i.severity || "").toLowerCase() === "critical");
  const majorIssues = issues.filter(i => {
    const c = (i.criticality || i.severity || "").toLowerCase();
    return c === "major" || c === "high";
  });

  const topCrit = criticalIssues[0];
  const topMaj = majorIssues[0] || issues.find(i => i.id !== topCrit?.id);

  const criticalIssueData = topCrit ? {
    title: topCrit.title,
    description: topCrit.issue || topCrit.impact?.replace(/•/g, '').trim() || "Critical deficiency identified in operating controls requiring immediate remediation."
  } : {
    title: "No Critical Issues Identified",
    description: "No critical severity deficiencies were observed during this audit review period. Tested operating controls demonstrated acceptable control compliance."
  };

  const majorIssueData = topMaj ? {
    title: topMaj.title,
    description: topMaj.issue || topMaj.impact?.replace(/•/g, '').trim() || "Deficiency observed in procedural execution requiring management corrective action."
  } : {
    title: "No Major Issues Identified",
    description: "All evaluated process controls functioned within acceptable operating parameters."
  };

  // 3. Build Audit Insights Narrative
  const overallText = `for the processes reviewed, ${critCount} critical, ${majCount} major and ${minCount} minor findings were identified, 0 of which were repeated`;

  // Meaningful narrative paragraphs derived from the audit issues
  let p1 = "";
  let p2 = "";
  let p3 = "";

  const uniqueAreas = processMatrix.slice(0, -1).map(p => p.processTitle);
  const areasSummary = uniqueAreas.slice(0, 3).join(", ");

  if (issues.length > 0) {
    p1 = `The audit findings highlight observations identified across ${areasSummary || 'operational and technical controls'}. ${topCrit ? `Notably, regarding ${topCrit.title.toLowerCase()}, review identified that ${topCrit.issue || topCrit.rootCause || 'controls require procedural reinforcement'}.` : `Most findings were categorized as minor operational refinements with actionable management remediations.`}`;
    
    p2 = `Furthermore, root cause analysis across findings in ${uniqueAreas[0] || 'the reviewed scope'} indicated dependencies on ${topMaj?.rootCause ? topMaj.rootCause.toLowerCase() : 'automated configuration updates, sensor calibration monitoring, and strict procedural enforcement'}. ${topMaj ? `Addressing ${topMaj.title.toLowerCase()} will mitigate key operational and reporting vulnerabilities.` : ''}`;
    
    p3 = `These issues collectively underscore opportunities to strengthen preventative maintenance governance, automated segregation of duties, and environmental data integrity. Management has agreed with all observations and initiated remediation workstreams to uphold stakeholder confidence and compliance standards.`;
  } else {
    p1 = `The audit review for ${facilityName} assessed key operational controls across ${areasSummary || 'core facility operations'}. Preliminary evaluations indicate satisfactory design effectiveness across principal manufacturing workflows.`;
    p2 = `Continuous monitoring and internal oversight mechanisms are established to track ongoing equipment calibration and access governance as active fieldwork concludes.`;
    p3 = `Overall operational risk remains aligned with expected internal tolerance baselines, with supervisory teams actively maintaining preventative compliance procedures.`;
  }

  const narrativeHtml = `<p>${p1}</p><p>${p2}</p><p>${p3}</p>`;

  // 4. Build Scope Summary
  const objectiveBullets = [
    `Cover controls and processes associated with ${facilityPurpose} managed by the plant operations and engineering teams.`,
    `Assess compliance with ${metric} and Johnson & Johnson global assurance standards.`,
    `Evaluate oversight over critical third-party vendors and automated telemetry systems.`
  ];
  const objectiveHtml = `<ul>${objectiveBullets.map(b => `<li>${b}</li>`).join('')}</ul>`;

  const background = `${facilityName} is a primary facility located at ${location}. Global Audit and Assurance conducted this periodic review to evaluate operational resilience, process governance, and control effectiveness following recent infrastructure modernization and quality system reviews.`;

  return {
    id: `EXEC-${job.id || "2026-881"}`,
    fileName: `${cleanTitle}_ExecSummary`,
    reportTitle: "Executive Summary Report",
    auditableEntity,
    scopeSummary: {
      assessmentPeriod: "Q1 2026 – Q2 2026 (Jan 1, 2026 – Jun 30, 2026)",
      entitySector: sector,
      entityLocation: location,
      metric,
      objectivePrefix: "Examples:",
      objectiveBullets,
      objectiveHtml,
      processMatrix,
      background
    },
    auditInsights: {
      overallText,
      narrativeHtml,
      paragraphs: [p1, p2, p3]
    },
    criticalMajorSection: {
      criticalIssue: criticalIssueData,
      majorIssue: majorIssueData
    }
  };
}
