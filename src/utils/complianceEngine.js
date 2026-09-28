import initialStandards from '../data/complianceStandards.json';
import initialViolations from '../data/issueViolations.json';

const VIOLATIONS_STORAGE_KEY = 'jnj_issue_compliance_violations';

function loadStoredViolations() {
  try {
    const raw = localStorage.getItem(VIOLATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load compliance violations from storage:', e);
  }
  return [...initialViolations];
}

function saveStoredViolations(list) {
  try {
    localStorage.setItem(VIOLATIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save compliance violations to storage:', e);
  }
}

/**
 * Returns all compliance standards from the master catalog
 */
export function getComplianceStandards() {
  return initialStandards;
}

/**
 * Look up a standard by standardId (e.g. "STD-IAPP-S15") or code (e.g. "S-15")
 */
export function getStandardByIdOrCode(idOrCode) {
  if (!idOrCode) return null;
  const target = idOrCode.trim().toLowerCase();
  return initialStandards.find(s => 
    s.standardId.toLowerCase() === target ||
    s.code.toLowerCase() === target ||
    target.includes(s.code.toLowerCase())
  ) || null;
}

/**
 * Get active violations linked to an issue
 */
export function getViolationsForIssue(issueId) {
  if (!issueId) return [];
  const all = loadStoredViolations();
  
  // Normalize issueId matching (e.g. ISSUE-001 vs ISSUE-801 vs ISS-ENG-2025-001-01)
  const normId = String(issueId).trim();
  const directMatches = all.filter(v => v.issueId === normId && v.status !== 'DISMISSED');
  if (directMatches.length > 0) return directMatches;

  // If issueId is numeric or variant (e.g. "1" or "ISSUE-1"), try matching suffixes
  const numMatch = normId.match(/\d+$/);
  if (numMatch) {
    const num = parseInt(numMatch[0], 10);
    const padded = `ISSUE-${String(num).padStart(3, '0')}`;
    const aliasMatches = all.filter(v => v.issueId === padded && v.status !== 'DISMISSED');
    if (aliasMatches.length > 0) return aliasMatches;
  }

  return [];
}

/**
 * Add a new violation citation to an issue
 */
export function addIssueViolation({
  issueId,
  standardId,
  standardCode,
  sectionNumber,
  sectionTitle,
  rationale = '',
  source = 'MANUAL',
  aiConfidence = null,
  confirmedBy = 'Auditor'
}) {
  const all = loadStoredViolations();
  const std = standardId ? getStandardByIdOrCode(standardId) : getStandardByIdOrCode(standardCode);
  
  let finalStdCode = standardCode || (std ? std.code : 'IAPP');
  let finalSecTitle = sectionTitle;
  
  if (std && !finalSecTitle) {
    const matchedSec = std.sections.find(s => String(s.sectionNumber) === String(sectionNumber));
    if (matchedSec) {
      finalSecTitle = matchedSec.title;
    }
  }

  const newViolation = {
    id: `VIOL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    issueId: String(issueId),
    standardId: std ? std.standardId : (standardId || `STD-IAPP-${finalStdCode}`),
    standardCode: finalStdCode,
    sectionNumber: String(sectionNumber),
    sectionTitle: finalSecTitle || 'General Policy Requirement',
    rationale: rationale || `Non-compliant with ${finalStdCode} Section [${sectionNumber}]`,
    source,
    status: 'ACTIVE',
    aiConfidence: source === 'AI_GENERATED' ? (aiConfidence || 0.92) : 1.0,
    confirmedBy,
    createdAt: new Date().toISOString()
  };

  all.push(newViolation);
  saveStoredViolations(all);
  return newViolation;
}

/**
 * Remove or dismiss a violation citation
 */
export function removeIssueViolation(violationId) {
  const all = loadStoredViolations();
  const idx = all.findIndex(v => v.id === violationId);
  if (idx !== -1) {
    all[idx].status = 'DISMISSED';
    saveStoredViolations(all);
    return true;
  }
  return false;
}

/**
 * Link AI-suggested violations during generation or regeneration
 */
export function linkAiSuggestedViolations(issueId, suggestedList = [], confirmedBy = 'AI Engine') {
  if (!issueId || !Array.isArray(suggestedList) || suggestedList.length === 0) return [];
  
  const created = [];
  suggestedList.forEach(s => {
    const v = addIssueViolation({
      issueId,
      standardId: s.standardId,
      standardCode: s.standardCode || s.code || 'S-15',
      sectionNumber: s.sectionNumber || s.section || '2',
      sectionTitle: s.sectionTitle || s.title || '',
      rationale: s.rationale || s.detail || '',
      source: 'AI_GENERATED',
      aiConfidence: s.aiConfidence || s.confidence || 0.94,
      confirmedBy
    });
    created.push(v);
  });
  return created;
}

/**
 * Converts violation records to the official Corporate Johnson & Johnson text format
 * for document exports or report rendering
 */
export function formatViolationsAsCorporateText(violations = []) {
  if (!violations || violations.length === 0) return '';
  
  const lines = [
    'Violation Reference',
    'Non-Compliant with some of the sections of IAPP:'
  ];

  violations.forEach((v, idx) => {
    const stdCode = v.standardCode?.startsWith('S-') ? v.standardCode : `S-${v.standardCode || '15'}`;
    const secNum = v.sectionNumber || '1';
    const title = v.sectionTitle || 'Policy Requirement';
    const detail = v.rationale ? ` — ${v.rationale}` : '';
    lines.push(`${idx + 1}. ${stdCode} Section No. [${secNum}] - ${title}${detail}`);
  });

  return lines.join('\n');
}

/**
 * Splits raw legacy text into clean narrative observation and structured violations
 * Ensures 100% backward compatibility with legacy concatenated strings
 */
export function splitDescriptionAndViolations(rawText = '', issueId = null) {
  if (!rawText || typeof rawText !== 'string') {
    const existing = issueId ? getViolationsForIssue(issueId) : [];
    return {
      cleanDescription: '',
      violations: existing
    };
  }

  // Look for "Violation Reference" or "Non-Compliant with"
  const markerRegex = /(?:\n\s*)?(?:Violation Reference|Non-Compliant with some of the sections of IAPP:)/i;
  const match = rawText.match(markerRegex);

  if (!match) {
    const existing = issueId ? getViolationsForIssue(issueId) : [];
    return {
      cleanDescription: rawText.trim(),
      violations: existing
    };
  }

  const cleanDescription = rawText.slice(0, match.index).trim();
  const violationPortion = rawText.slice(match.index).trim();

  // If we already have stored relational violations for this issueId, prefer them
  const stored = issueId ? getViolationsForIssue(issueId) : [];
  if (stored.length > 0) {
    return {
      cleanDescription,
      violations: stored
    };
  }

  // Otherwise parse the text block into structured violation objects on-the-fly
  const parsedItems = [];
  const lines = violationPortion.split('\n').map(l => l.trim()).filter(Boolean);
  
  lines.forEach((line) => {
    const numMatch = line.match(/^(\d+)[\.\)]\s*(.*)$/);
    if (!numMatch) return;
    
    const rest = numMatch[2].trim();
    // Example: "S-15 Section No. [2] - Security Assessment for COTS Systems/Applications — Security assessment not completed"
    const dashParts = rest.split(/\s*[-—]\s*/);
    const linkText = dashParts[0] || '';
    const title = dashParts[1] || '';
    const rationale = dashParts.slice(2).join(' — ') || '';
    
    // Extract standard code & section number from linkText (e.g. "S-15 Section No. [2]")
    const stdMatch = linkText.match(/(S-\d+|GxP-[A-Za-z0-9]+)/i);
    const secMatch = linkText.match(/\[(.*?)\]/);

    const stdCode = stdMatch ? stdMatch[1] : 'S-15';
    const secNum = secMatch ? secMatch[1] : '1';

    parsedItems.push({
      id: `VIOL-PARSED-${Math.random().toString(36).substring(2, 9)}`,
      issueId: issueId || 'ISSUE-GENERIC',
      standardId: `STD-IAPP-${stdCode}`,
      standardCode: stdCode,
      sectionNumber: secNum,
      sectionTitle: title,
      rationale,
      source: 'AI_GENERATED',
      status: 'ACTIVE',
      aiConfidence: 0.95
    });
  });

  return {
    cleanDescription,
    violations: parsedItems.length > 0 ? parsedItems : (issueId ? getViolationsForIssue(issueId) : [])
  };
}

/**
 * Builds the drawer payload required by ViolationPdfDrawer
 */
export function buildViolationDoc(violation) {
  if (!violation) return null;
  const stdCode = violation.standardCode?.startsWith('S-') 
    ? violation.standardCode 
    : `S-${violation.standardCode || '15'}`;
  
  return {
    linkText: `${stdCode} Section No. [${violation.sectionNumber || '1'}]`,
    title: violation.sectionTitle || 'Policy Requirement',
    detail: violation.rationale || '',
    standardId: violation.standardId,
    standardCode: stdCode,
    sectionNumber: violation.sectionNumber
  };
}
