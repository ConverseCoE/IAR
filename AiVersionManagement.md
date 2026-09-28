# Functional Requirements: AI Generated Versions, Regeneration & Version Comparison
**Johnson & Johnson Internal Audit Reporting (IAR) Platform**

---

## 1. Executive Summary & Architecture Principles

The Johnson & Johnson Internal Audit Reporting (IAR) platform leverages enterprise LLM capabilities (Vertex AI MedTech GxP Compliance Engine) to assist audit teams in synthesizing complex audit findings, identifying relevant policy violations (e.g. IAPP standards), evaluating operational and financial impacts, and generating actionable remediation recommendations.

Because audit observations undergo iterative refinement throughout their lifecycle, the platform requires an **enterprise-grade, relational AI Version Management & Comparison System** designed around the following architectural principles:

1. **Normalized Active State (`tbl_issues`)**:
   * The primary issues table (`tbl_issues` / `issues.json`) always maintains the **single active, confirmed version** of the finding.
   * Downstream review queues, executive rollups, workpaper exports, and management response workflows read directly from `tbl_issues`.

2. **Immutable Version Ledger (`tbl_issue_ai_versions`)**:
   * Every AI generation and regeneration event produces an immutable record in `tbl_issue_ai_versions`.
   * Stored records capture complete prompt context, model metadata, generated fields, adoption status, and user attribution.

3. **Field-Level Granular Assembly (Hybrid Merging)**:
   * Reviewers must not be forced into an "all-or-nothing" choice between versions.
   * The system allows mix-and-match selection (e.g., retaining the Root Cause from Version 1 while adopting the enhanced Recommendation from Version 2).

4. **Strict GxP Lineage & Auditability**:
   * All version creations, comparisons, adoptions, and rollbacks are logged to the immutable Audit Trail (`auditLogEngine`), guaranteeing complete forensic traceability for regulatory inspections (FDA, SOX, ISO).

---

## 2. AI Lifecycle Operational Triggers

AI generation and regeneration occur across three distinct operational phases:

### 2.1 Phase 1: Creation-Time Generation (Initial Draft)
* **Location**: Issue Creation Drawer (`CreateIssueDrawerNew.jsx`).
* **Trigger**: Auditor enters test procedure reference and raw fieldwork observations, then clicks **"Generate with AI" (Magic Wand)**.
* **Outcome**:
  * Produces `version_number: 1` (`AIVER-xxx-01`).
  * `status: "ACTIVE"`.
  * Fields synthesized: `updatedIssueHeader`, `rootCause`, `impact`, `description` (with cited policy violations), and `recommendation`.
  * Auditor reviews the synthesized draft in the right-hand card.

### 2.2 Phase 2: Pre-Save Regeneration & In-Drawer Comparison
* **Location**: Issue Creation Drawer (`CreateIssueDrawerNew.jsx`).
* **Trigger**: Auditor reviews Version 1 and requests adjustments (e.g., changes test procedure, refines raw notes, or clicks **"Regenerate AI"**).
* **Outcome**:
  * Version 1 is retained as a candidate baseline (`status: "PREVIOUS"`).
  * A new candidate is synthesized as `version_number: 2` (`status: "CANDIDATE"`).
  * The drawer transitions into **Version Comparison Mode**.
  * The user can:
    1. **Keep Previous (v1)**: Discards candidate v2 and preserves v1.
    2. **Accept New (v2)**: Replaces all fields with v2.
    3. **Field-by-Field Hybrid Selection**: The user clicks card options per field (e.g., Title: v2, Root Cause: v1, Impact: v2, Recommendation: v2).
  * Upon clicking **"Accept & Save"**, the consolidated result is committed to `tbl_issues`, while both versions and the selection map are archived in `tbl_issue_ai_versions`.

### 2.3 Phase 3: In-Workflow Workpaper Regeneration & Review Compare
* **Location**: Audit Report Workpaper View (`AuditReportView.jsx`).
* **Trigger**: During Team Coordinator, Manager, or Director review, the reviewer identifies a need to sharpen the finding's technical root cause or strengthen the audit recommendation.
* **Workflow**:
  1. Reviewer clicks **"AI Refine / Regenerate"** on the workpaper.
  2. The system loads the active issue fields from `tbl_issues` as the current confirmed baseline (`v2`).
  3. The AI engine synthesizes `version_number: 3` (`AIVER-xxx-03`).
  4. The **AI Version History & Compare Modal** opens:
     * Displays a side-by-side or diff comparison between the **Active Version** and the **Newly Generated Version**.
     * Visual green/red diff highlights showcase exact textual modifications.
  5. The reviewer can:
     * **Adopt New Version**: Overwrites active workpaper fields, sets v3 as active, and logs the adoption event.
     * **Discard Regeneration**: Retains active v2, marking v3 as discarded without affecting the workpaper.
     * **Rollback / Revert**: Option to inspect and restore any earlier historical version (e.g., reverting back to v1).

---

## 3. Relational Data Model (`tbl_issue_ai_versions`)

| Column Name | Data Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` (PK) | VARCHAR(32) | Unique AI version identifier | `"AIVER-801-02"` |
| `issueId` (FK) | VARCHAR(32) | Parent issue reference | `"ISSUE-801"` |
| `engagementId` (FK) | VARCHAR(32) | Parent engagement reference | `"REP-2026-008"` |
| `versionNumber` | INTEGER | Sequential version counter for this issue | `2` |
| `triggerStage` | VARCHAR(32) | Operational context of generation | `'INITIAL_CREATION'`, `'PRE_SAVE_REGEN'`, `'WORKFLOW_REVIEW'` |
| `model` | VARCHAR(64) | LLM model version and parameter preset | `"medtech-gx-compliance-v2.5"` |
| `status` | VARCHAR(24) | Version state | `'ACTIVE'`, `'SUPERSEDED'`, `'DISCARDED'`, `'HYBRID_MERGED'` |
| `fields` | JSONB | Complete snapshot of synthesized fields | `{ "title", "rootCause", "impact", "recommendation", "description" }` |
| `fieldSelectionMap` | JSONB | Lineage record of field origins if hybrid | `{ "title": "v2", "rootCause": "v1", "recommendation": "v2" }` |
| `createdBy` | JSONB | Auditor or reviewer who triggered generation | `{ "userId": "USR-003", "name": "Kevin Zhang", "role": "IT Audit Lead" }` |
| `createdAt` | TIMESTAMP | ISO timestamp of generation | `"2026-07-30T10:15:00Z"` |

---

## 4. UI & Interaction Requirements

1. **Workpaper AI Status & Version Badge**:
   * In `AuditReportView.jsx`, the "AI Generated Fields" container must display an interactive **Version Badge** (e.g., `⚡ AI v2 (Adopted)`).
   * Clicking the badge opens the **AI Version History & Compare Modal**.

2. **AI Version History & Compare Modal**:
   * **Timeline Selector**: Top bar with pills for `Version 1`, `Version 2 (Active)`, `Version 3 (Candidate)`.
   * **Side-by-Side Comparison**:
     * Left Column: Active Confirmed Version.
     * Right Column: Selected Comparison Version / New Candidate.
   * **Field Diffs**: Clear visual badges on fields that have textual differences.
   * **Field-Level Checkboxes**: Allows selective adoption of individual fields.
   * **Action Bar**:
     * `Adopt All Changes`: Overwrites active issue fields with candidate version.
     * `Adopt Selected Fields`: Merges checked fields into active workpaper.
     * `Revert to this Version`: Available for historical versions to restore previous state.
     * `Discard`: Closes modal without modifying active issue.

3. **Audit Trail Synchronization**:
   * Every AI generation, regeneration, adoption, and rollback dispatches an event to `auditLogEngine` under category `'AI_GENERATION'`, `'AI_REGENERATION'`, or `'AI_VERSION_ADOPTED'`.
