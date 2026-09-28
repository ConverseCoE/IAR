# Functional Requirements: Audit Logging & Track Changes System
**Johnson & Johnson Internal Audit Reporting (IAR) Platform**

---

## 1. Executive Summary & Purpose
The Johnson & Johnson Internal Audit Reporting (IAR) platform requires a comprehensive, tamper-evident, and GxP/IAPP-compliant Audit Logging & Track Changes system. Every user interaction, workflow progression, field-level edit, governance exception, and AI model generation must be systematically logged with an immutable audit trail.

This document outlines the **functional requirements** across the three operational tiers of the audit lifecycle:
1. **Tier 1: Issue-Level Logs** (Granular finding lifecycle and collaborative editing)
2. **Tier 2: Audit Report-Level Logs** (Engagement lifecycle, batch synchronization gates, Director & VP clearance)
3. **Tier 3: Executive Report-Level Logs** (Executive summary AI synthesis, matrix calibration, reviewer collaboration, and committee sign-off)

---

## 2. Core Functional Requirements Across All Tiers

### 2.1 Universal Auditability Invariants
1. **Actor Identification**: Every log event must capture the actor who executed the action, including User ID, Full Name, Functional Role (Auditor, Team Coordinator, Manager, Director, Vice President, Business Contact), and Domain (IT, FinOps, Cross-Domain).
2. **System & AI Identification**: Automated actions, pipeline initializations, and AI Magic Wand syntheses must clearly identify the AI model/agent (e.g., `Vertex AI / MedTech GxP Model v2.4`, `System Automated Pipeline`).
3. **Dual Timestamps**: Logs must maintain both an immutable ISO-8601 UTC timestamp for machine sorting/filtering and a human-readable localized display timestamp (e.g., `"Today at 02:40 PM"`, `"08/01/2026 at 10:15 AM"`).
4. **Relational Traceability**: Every log record must link to its parent entities via foreign keys (`issueId`, `engagementId`, `reportId`, `userId`).
5. **Change Differentiation**: Any modification to data must record the previous value (`oldValue`) and the updated value (`newValue`), accompanied by the changed field label.

---

## 3. Tier 1: Issue-Level Logging Requirements

Issue-level logs document the granular, end-to-end lifecycle of an individual audit finding from drafting through final resolution.

### 3.1 Issue Creation
* **Manual Entry Drafting**: When an auditor initiates a finding manually, the system must log the initial status, accountable function, criticality, and author.
* **Test Procedure Generation**: When an issue is instantiated from a mapped test procedure, the log must record the test procedure code (e.g., `TP-101`), test procedure name, and mapped audit scope.

### 3.2 Workflow Stage Progression & Batch Clearance
* **Individual Stage Progression**: Log transitions between individual roles:
  * Auditor $\rightarrow$ Team Coordinator Submission
  * Team Coordinator $\rightarrow$ Audit Manager Submission
  * Audit Manager $\rightarrow$ Business Contact (Management Response request)
* **Interim Manager Clearance Gate**: When a Manager completes review of an individual issue while other issues under the same audit remain in-flight, the system must record the issue status as `Manager Completed (Waiting on other issues)` and log the remaining issues count.
* **Batch Director Gate Trigger**: When the final issue under an audit reaches Manager completion, the system must log the simultaneous promotion of the issue to `Pending Director`.

### 3.3 Field-Level Edits & Track Changes
Every modification to an issue workpaper must generate a field edit log capturing the specific field name, previous value, and updated value. Applicable fields include:
* Issue Header / Title
* Finding Summary & Detailed Description
* Root Cause Analysis
* Operational / Financial / Compliance Impact
* Audit Recommendation
* Criticality Level (e.g., `Moderate` $\rightarrow$ `Major`, triggering priority realignment notices)
* Accountable Function (e.g., `IT`, `FinOps`, `Supply Chain`)
* Mitigating Controls
* Auditor Evaluation Response
* Agreed Management Response & Target Remediation Date

### 3.4 Governance & Issue Action Functionalities
* **Send To / Re-route**:
  * Log the re-routing or delegation of an issue from one user or role to another (e.g., IT Coordinator transferring finding to FinOps Lead for materiality assessment).
  * Record the source role, target role, target user, and routing reason.
* **Call Back**:
  * When an auditor or manager recalls an issue from a downstream queue (e.g., recalling an issue from the Business Contact), the system must enforce and log a **mandatory callback reason**.
  * Capture the source status, target status (`Called Back`), author who triggered the recall, and the business justification.
* **Not My Function Issue**:
  * When an auditor flags a finding as outside their functional domain, the system must log the action, current function, suggested receiving function, and auditor explanatory comments.
* **Exclude / Include Issue**:
  * When an issue is excluded from final audit report compilation, the system must log the exclusion toggle, the preceding status, timestamp, and exclusion rationale.
  * When an excluded issue is restored back into the report, the system must log the reinstatement event.

### 3.5 AI Generation & AI Regeneration
* **Initial AI Magic Wand Synthesis**:
  * When the auditor activates the AI Magic Wand to synthesize a finding, the system must log the prompt context, AI model version, fields generated (`updatedIssueHeader`, `rootCause`, `impact`, `description`, `recommendation`), and cited IAPP/GxP compliance standards.
* **Iterative AI Prompt Regeneration**:
  * When an auditor refines the prompt and requests an AI regeneration, the system must record the generation cycle number (e.g., Cycle 2, Cycle 3), updated prompts, and delta comparison.
* **Version Comparison & Field-by-Field Adoption**:
  * When comparing AI versions (Side-by-Side comparison cards), the system must log whether the user accepted the entire new version or cherry-picked individual fields (e.g., accepted AI Recommendation and Root Cause, but kept original Impact).

---

## 4. Tier 2: Audit Report-Level Logging Requirements

Audit report-level logs track engagement-wide milestones, batch governance gates, executive leadership reviews, and final sign-offs.

### 4.1 Engagement Initialization & Scope Definition
* Record the formal initiation of an audit report, lead auditor assignment, planned dates, and mapped workpaper count.
* Record any changes to overall engagement scope, auditable entity (MRC), or lead team assignments.

### 4.2 Batch Synchronization Clearance Gate
* In accordance with J&J IAR governance, Audit Directors and Vice Presidents review compiled reports as a unified package, never as fragmented individual findings.
* The system must record a report-level log event when **100% of issues** under an audit reach Manager completion, compiling the audit report and moving the engagement queue to `Pending Director`.
* The log must include an executive summary of compiled findings: total issue count and severity breakdown (Critical, Major, Moderate, Minor).

### 4.3 Leadership Reviews & Approvals
* **Director Review & Clearance**:
  * Log Director acceptance, review duration, qualitative commentary, and submission to the Vice President.
* **Director Return / Pushback**:
  * If a Director returns a report to the Audit Manager for revisions, log the return action, specific instructions, and target issues requiring rework.
* **Vice President Review & Official Sign-Off**:
  * When the Vice President signs off on the audit report, the system must record the final sign-off event, VP identity, official closing timestamp, digital signature hash, and committee distribution list.

### 4.4 Report-Level Rollup Capability
* The Audit Report History modal must provide the capability to view both high-level report milestones and an aggregated, chronological feed of all issue-level events belonging to the engagement.

---

## 5. Tier 3: Executive Report-Level Logging Requirements

Executive report logs track the synthesis, editing, collaboration, and finalization of high-level executive summaries delivered to the Audit Committee and Board of Directors.

### 5.1 AI Executive Report Generation & Regeneration
* **Automated Executive Synthesis**:
  * When the system or user generates the executive summary, record the synthesis event, aggregated source findings count, generated sections (Background Summary, Process Scope Matrix, Key Themes, Financial Exposures), and total quantified financial exposure.
* **AI Prompt Regeneration**:
  * When executive narrative sections are re-generated with custom prompt guidelines (e.g., highlighting regional GxP cold chain risks), log the regeneration cycle, prompt adjustments, and refined narrative snippets.

### 5.2 Section & Process Matrix Field Edits
* Log field edits to executive narrative blocks:
  * Audit Background & Objective
  * Executive Insights & Overall Assessment Rating (e.g., `Needs Improvement` $\rightarrow$ `Unsatisfactory`)
  * Scope Matrix Severity Counts (adjustments to Critical, Major, and Minor counts across operational rows such as Production, IT Security, Vendor Management)
  * Quantified Financial Impact (e.g., liability understatement amounts)

### 5.3 Reviewer Comments & Collaboration
* Log all field-level collaborative comments exchanged between auditors, managers, and directors on executive report sections.
* Record comment creation, reviewer identity, tagged section, comment resolution status, and resolution timestamps.

### 5.4 Executive Report Workflow Progression
* Record workflow state transitions for the Executive Report:
  * `Draft` $\rightarrow$ `In Review` (Manager/Director Review)
  * `In Review` $\rightarrow$ `Pending VP Sign-Off`
  * `Signed Off` (Final executive report lock and publication)

---

## 6. UI & Experience Requirements for Track Changes Modal

1. **Context-Sensitive Presentation**:
   * When accessed from an issue's three-dots menu or issue header, the modal must display **Issue Track Changes** specific to that finding.
   * When accessed from the top navigation of the Audit Report View, the modal must display **Audit Report Engagement History**, with an option to toggle issue-level rollups.
   * When accessed from the Executive Report View, the modal must display **Executive Summary Track Changes**.
2. **Category Filtering**:
   * Provide intuitive filter chips/tabs to quickly isolate log types:
     * `All Events`
     * `Workflow & Approvals`
     * `Field Edits`
     * `AI Magic Wand & Refinements`
     * `Governance (Call Back, Send To, Exclusions)`
3. **Visual Diffing & Clarity**:
   * Present distinct badge colors per action type (e.g., Green for Created/Included, Indigo for Updated, Rose for Excluded/Critical, Amber for Call Back, Violet for AI Generated, Blue for Workflow).
   * Render clear strike-through styling for `Previous Value` and bold highlighting for `Updated Value`.
   * Prominently display explanatory reason boxes for Call Backs, Re-routes, and Scope Exclusions.
4. **Real-Time Responsiveness**:
   * Any action taken in the active browser session (e.g., editing a field, executing a callback, toggling an exclusion, clicking AI Magic Wand) must immediately dispatch a new log into active state, allowing instant verification in the Track Changes modal without requiring a page reload.
