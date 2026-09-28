# Functional Requirements: Field-Level Comments & Workflow Collaboration
**Johnson & Johnson Internal Audit Reporting (IAR) Platform**

---

## 1. Executive Summary & Purpose
The Johnson & Johnson Internal Audit Reporting (IAR) platform requires a structured, multi-role collaboration system that allows auditors, team coordinators, managers, directors, vice presidents, and business partners to annotate, discuss, and resolve observations directly on workpapers.

Collaboration occurs in two primary operational contexts:
1. **In-Situ Field Collaboration**: Granular comment threads attached to specific fields on Issue workpapers (Audit Report page) and Executive Summary sections (Executive Report page).
2. **Workflow Transition & Hand-Off Notes**: Formal transition remarks provided when advancing an issue or report to downstream review queues or sending for business management response.

---

## 2. Scope of Field-Level Comments

### 2.1 Issue-Level Workpaper Fields (Audit Report Page)
Comment threads can be initiated on any standard or dynamic field within an audit finding:
* Issue Title / Header
* Test Procedure Reference
* Criticality Level
* Summary Finding & Detailed Description
* Root Cause Analysis
* Operational, Financial & Compliance Impact
* Audit Recommendation
* Accountable Function & Process Area
* Mitigating Controls & Interim Safeguards
* Auditor Response & Evaluation Notes
* Agreed Management Response & Target Remediation Date

### 2.2 Executive Report Fields (Executive Report Page)
Comment threads can be initiated on high-level executive summary components:
* Executive Scope Summary & Assessment Objective
* Operational Process Scope Matrix (row-level and severity-count comments)
* Key Audit Insights & Executive Narrative
* Critical & Major Finding Summaries
* Quantified Financial & Exposure Calculations

---

## 3. Collaboration Types & Resolution Governance

To ensure clear ownership and avoid premature sign-offs, comment threads are divided into two distinct governance classes:

### 3.1 Generic Collaboration Comments
* **Definition**: A comment submitted without assigning or tagging a specific team member. Intended for open questions, general clarifications, policy references, or informational notes.
* **Resolution Rule**: **Any active workflow participant** with review/edit permissions on the issue or report (Auditor, Team Coordinator, Manager, Director, Vice President) can resolve and mark the comment as done.

### 3.2 Tagged Person Comments (@Mention & Direct Assignment)
* **Definition**: A comment submitted with an explicit assignment to a designated individual (e.g., tagging the Audit Manager `@Amanda Palmer` or the Plant Business Lead `@Thomas Wright`).
* **Governance Rule (Strict Resolution Lock)**:
  * **ONLY the tagged individual** is permitted to mark the comment as done.
  * For all other users, the "Mark as Done" action is disabled, displaying a clear lock indicator:  
    *`"Assigned to [Tagged User] — only the tagged recipient can resolve this comment."`*
  * **Audit Committee & Lead Override**: A designated Lead Auditor or Director may resolve under administrative authority with a logged justification.
* **Visual States**:
  * **Open**: Prominently highlights the tagged recipient chip (`Assigned to @Amanda Palmer`).
  * **Resolved**: Locks the thread, stamps resolution timestamp, and displays resolution badge (`✓ Resolved by Amanda Palmer on [Date/Time]`).

---

## 4. Workflow Transition & Routing Hand-Off Notes

When sending an issue or report to another queue, users require a mechanism to communicate transition context:

### 4.1 Issue-Level Transition Comments
When executing workflow progression actions:
* `Submit to TC` (Staff $\rightarrow$ Team Coordinator)
* `Submit to Manager` (Team Coordinator $\rightarrow$ Audit Manager)
* `Submit to Director` (Manager $\rightarrow$ Audit Director)
* `Send to Business` (Audit Team $\rightarrow$ Business Contact for Management Response)
* `Call Back` (Recalling issue to previous author)
* `Re-route / Send To` (Delegating to another domain or auditor)

**Requirements**:
1. The user must be provided with an optional **Hand-Off Note / Transition Comment** field.
2. The user may optionally tag a specific recipient to draw their attention.
3. The transition comment is stored as an official collaboration record (`targetType: "WORKFLOW_TRANSITION"`) and simultaneously logged in the audit trail.
4. The receiving reviewer must immediately see this hand-off note upon opening the issue workpaper.

### 4.2 Report-Level Transition Comments
* When compiling the final batch of issues for Director review or Vice President sign-off, leadership can attach an overarching engagement review note.

---

## 5. UI & Interaction Requirements

1. **Visual Comment Badges**:
   * Every commented field must display a visible comment icon next to its label.
   * If there are open/unresolved comments, display an active numeric indicator (e.g., blue pill with count `[2]`).
   * If all comments on that field are resolved, display a muted green check indicator (`✓`).
2. **Comment Popover & Thread Drawer**:
   * **Header**: Field title and active comments count.
   * **Feed**: Chronological list of comment cards showing author avatar, author name, role, timestamp, tagged recipient chip, comment body, and resolution status.
   * **Tag Picker**: User dropdown or `@mention` selector pre-filtered to team members mapped to the current engagement.
   * **Input Box**: Expandable textarea with `Post Comment` button.
3. **Audit Trail Synchronization**:
   * Creating or resolving a comment automatically dispatches an immutable log event to the Audit Trail (`auditLogEngine`), ensuring full GxP and regulatory auditability.
