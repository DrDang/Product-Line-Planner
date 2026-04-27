# Product-Line Roadmap Decision Tool — Planning Notes

## 1. Purpose

Design a portable, local-first software tool that helps a chief engineer understand, evaluate, and communicate the state of a product line.

The tool should support defensible product-line roadmap planning by answering:

> What do we have today, what do we need next, what changes are required, what evidence supports the decision, what are the risks, and why is this roadmap choice better than the alternatives?

A good working description for the tool is:

> A product-line capability, gap, and roadmap impact-analysis tool for defensible block upgrade planning.

The tool should not try to replace Jama, DOORS, PLM, Confluence, formal MBSE tools, project scheduling tools, or risk management systems. It should act as a decision-support layer that organizes and traces the information needed to make roadmap decisions.

---

## 2. Preferred Implementation Direction

The preferred implementation is a **local-first browser application**.

The app should run locally from static files, open in the user's normal browser, and require:

- No hosting
- No database server
- No SQLite installation
- No Node/Python/.NET installation on the user's machine
- No administrator privileges
- No internet connection
- No telemetry
- No external API calls

The intended deployment model is similar to the existing Risk/Decision Register tool:

```text
ProductLineRoadmapTool/
  index.html
  assets/
  sample_project.plroadmap.json
  Launch Product Line Roadmap.bat
  Launch Product Line Roadmap.command
  README.md
```

The intended user workflow is:

1. User downloads or opens the tool folder.
2. User opens the app through `index.html`, a Windows `.bat` launcher, or a macOS `.command` launcher.
3. Browser opens the local app.
4. User opens/imports a `.plroadmap.json` project snapshot.
5. User edits or reviews the product-line data locally.
6. User exports an updated project snapshot and/or audience-specific reports.

This direction is preferred because it is low-friction for IT-restricted Windows environments while still preserving future macOS compatibility.

---

## 3. Primary Needs

The tool should help me:

1. Quickly and intuitively understand current product-line capabilities and gaps so that block upgrades can be planned.
2. Create, analyze, and present a roadmap that is coherent with the current product baseline.
3. Show exactly what needs to change in the next iteration to support a new capability.
4. Trace systems-engineering rationale from needs to features, functions, performance, design impact, verification, and roadmap decisions.
5. Explain to business development what the product can do, what it cannot do, what is verified, and what is only planned or assumed.
6. Defend product-line roadmap decisions to management using cost, benefit, risk, ROI, architecture impact, complexity, schedule drivers, and confidence/maturity.
7. Preserve why certain ideas were included, deferred, or rejected so the same roadmap debates do not restart repeatedly.

---

## 4. Core Workflow

The tool should be built around one central workflow:

> Given the current product baseline and a proposed new capability, determine what changes, what is impacted, what evidence exists, what the cost/risk/benefit is, and whether it should go into the next block upgrade.

Representative workflow:

1. Select a product, variant, or block baseline.
2. Select or define a desired future capability.
3. Compare the desired capability against current product capabilities.
4. Identify gaps.
5. Identify impacted design elements, requirements, interfaces, verification activities, equipment, teams, and risks.
6. Estimate rough cost, schedule, complexity, and confidence.
7. Capture business/technical rationale.
8. Make a roadmap decision: include now, defer, reject, or study further.
9. Export a management, engineering, or business-development view.

---

## 5. MVP Scope

The minimum viable product should focus on the highest-value decision-support functions and avoid becoming an all-in-one engineering management platform.

### 5.1 Product and Variant Baseline

The tool should capture retired, current, supported, and planned products in the product line.

For each product/variant/block, capture:

- Product name
- Variant or customer-specific configuration
- Block/version/revision
- Status: retired, current, supported, planned, obsolete, prototype, etc.
- Hardware revision
- Software/firmware version
- Relevant configuration notes
- Applicable source-of-truth references such as Jama item, released drawing, ICD, test report, Confluence page, etc.

This matters because a capability claim is only meaningful when tied to the configuration where it was verified, demonstrated, simulated, or assumed.

### 5.2 Capability Matrix

The tool should provide a clear product/variant capability matrix.

Capability data may include:

- Features
- Functions
- Performance parameters
- Environmental limits
- Interfaces
- Supported frequency bands
- Number of supported channels, users, or operating modes
- Supported operating modes
- Test and qualification status

Capability status should distinguish:

- Supported
- Not supported
- Partially supported
- Planned
- Unknown

Evidence maturity should distinguish:

- Verified by formal test
- Demonstrated in lab/prototype
- Supported by analysis
- Supported by simulation only
- Assumed based on design similarity
- Unknown/no evidence

This allows the tool to separate actual product claims from aspirational roadmap claims.

### 5.3 Gap Analysis

The tool should allow the user to define a target capability set or market need and compare it against the current product baseline.

Example questions the tool should answer:

- Which current products meet this target capability?
- Which variants partially meet it?
- Which required capabilities are missing?
- Which gaps are verified gaps versus unknowns caused by lack of evidence?
- Which gaps are blockers for a business segment or customer opportunity?

### 5.4 Roadmap Candidate Management

The tool should capture potential block upgrade candidates.

For each candidate, capture:

- Candidate name
- Description
- Driving need or rationale
- Target capability or gap addressed
- Business value
- Technical value
- Cost reduction value
- Reliability/sustainment value
- Market/customer value
- Affected products/variants
- Rough effort estimate
- Schedule drivers
- Technical risks
- Assumptions
- Decision status: include, defer, reject, study, blocked
- Decision rationale
- Revisit trigger

The tool should preserve not only what was selected for the roadmap, but also why other ideas were deferred or rejected.

### 5.5 Impact Analysis

Impact analysis should be a first-class part of the tool.

For each proposed roadmap candidate, capture impacted areas such as:

- Requirements
- Architecture
- Design elements
- Hardware
- Software/firmware
- subsystem interface
- Mechanical design
- Thermal design
- Power
- Interfaces/ICDs
- Manufacturing
- Test equipment
- Verification activities
- Qualification activities
- Supplier/components
- Safety/security/export concerns
- Existing product variants

Each impact should include:

- Impacted item
- Impact type
- Severity: low, medium, high, major redesign
- Confidence: low, medium, high
- Required team/owner
- Estimated effort range or t-shirt size
- Schedule driver
- Risk introduced or retired
- Verification consequence
- Notes/basis of estimate

The tool should avoid false precision. Early estimates should use ranges, t-shirt sizes, and explicit assumptions rather than overly specific hour counts unless there is a real basis of estimate.

### 5.6 Evidence, Maturity, and Confidence

The tool should track the maturity of product capabilities and performance claims.

For each capability or performance claim, capture:

- Claim statement
- Applicable product/variant/block
- Evidence type: test, demonstration, analysis, simulation, similarity, assumption
- Evidence reference
- Confidence level
- TRL/maturity level if useful
- Verification status
- Open evidence gaps
- Recommendation: acceptable, needs test, needs analysis, too risky to claim

This helps prevent business development or management from treating simulated/assumed performance as equivalent to formally verified performance.

### 5.7 Decision Records

The tool should include lightweight decision records.

For each roadmap decision, capture:

- Decision
- Date
- Decision owner/approver
- Options considered
- Selected option
- Rejected/deferred options
- Rationale
- Key assumptions
- Risks accepted
- Revisit condition
- Supporting evidence

This prevents repeated debates and makes the roadmap defensible.

### 5.8 Exports and Views

The tool should provide different views for different audiences.

#### Project Lead / Management View

- Product-line capability summary
- Roadmap candidates
- Cost/benefit/risk comparison
- Major architecture impacts
- Top assumptions
- Top risks
- Recommended block plan

#### Engineering View

- Impacted design elements
- Requirement implications
- Interface implications
- Verification/test implications
- Team ownership
- Open questions

#### Business Development View

- What the product can do
- What the product cannot do
- What is verified
- What is demonstrated only
- What is planned for future blocks
- What should not be promised yet

#### Roadmap View

- Candidate upgrades by block
- Include/defer/reject status
- Dependencies
- Decision rationale
- Revisit triggers

---

## 6. Recommended Data Format

For the local browser MVP, the primary project format should be a **flat JSON snapshot file**:

```text
Sample_ProductLine.plroadmap.json
Alternate_ProductLine.plroadmap.json
```

JSON is preferred for the first local-browser version because it is:

- Easy to load and save through browser file dialogs
- Cross-platform
- Human-readable
- Easy to back up
- Easy to diff in Git if needed
- Easy to inspect during early development
- Compatible with a no-install static web app

The JSON should use **flat arrays with stable IDs**, not deeply nested product trees. Flat IDs make traceability easier and avoid duplicated names.

Recommended top-level structure:

```json
{
  "schemaVersion": "0.1.0",
  "project": {
    "id": "proj_sample",
    "name": "Example Product Line Roadmap",
    "ownerRole": "Project Lead",
    "dataMarking": "Internal Use",
    "createdAt": "",
    "updatedAt": "",
    "snapshotNotes": ""
  },
  "products": [],
  "variants": [],
  "capabilities": [],
  "capabilityClaims": [],
  "evidence": [],
  "requirements": [],
  "targetCapabilitySets": [],
  "gaps": [],
  "roadmapCandidates": [],
  "designElements": [],
  "interfaces": [],
  "impactAssessments": [],
  "decisions": [],
  "assumptions": [],
  "risks": [],
  "opportunities": [],
  "viewSettings": {}
}
```

Example flat relationship:

```json
{
  "products": [
    {
      "id": "prod_sample",
      "name": "Sample Product"
    }
  ],
  "variants": [
    {
      "id": "var_sample_block1",
      "productId": "prod_sample",
      "name": "Block 1"
    }
  ],
  "capabilityClaims": [
    {
      "id": "claim_sample_b1_remote_update",
      "variantId": "var_sample_block1",
      "capabilityId": "cap_remote_update",
      "supportStatus": "supported",
      "maturity": "demonstrated",
      "confidence": "medium",
      "evidenceIds": ["ev_remote_update_demo_001"],
      "notes": "Demonstrated in lab, not formally verified for all configurations."
    }
  ]
}
```

Avoid deeply nested JSON such as product → variant → capabilities → evidence because it becomes hard to maintain when evidence, decisions, impacts, risks, requirements, and assumptions need to trace across multiple items.

SQLite may be reconsidered later if the app outgrows browser-file handling, needs embedded attachments, needs very large datasets, or needs stronger local database behavior. It should not be required for the first local-browser MVP.

---

## 7. Project Ownership and Distribution Model

The first version should be treated as a **chief-engineer-owned analysis and reporting tool**, not a broadly distributed collaborative database.

Recommended model:

- Chief engineer maintains the master `.plroadmap.json` project snapshot.
- Other stakeholders access exported views and reports.
- Broader editing is deferred until the schema, workflow, and governance are proven.

This avoids early problems with conflicting project files, uncontrolled edits, duplicate sources of truth, and users treating rough planning data as formal commitments.

Because the app is local and browser-based, file operations should be designed around browser security constraints.

Expected workflow:

- User clicks **Open Project** and selects a `.plroadmap.json` file.
- User edits data in browser memory.
- User clicks **Save Snapshot** or **Export Project**.
- Browser downloads the updated `.plroadmap.json` file.
- User manually replaces or archives the previous project file.

The UI should make the current project name, last loaded time, unsaved changes, and export timestamp obvious.

---

## 8. Recommended Data Model

A practical first data model could include the following entities:

### Product

- ID
- Name
- Description
- Status
- Notes

### Variant / Block

- ID
- Product ID
- Variant name
- Block/version
- Hardware revision
- Software/firmware version
- Status
- Configuration notes

### Capability

- ID
- Name
- Category
- Description
- Units if performance-based
- Threshold/objective if applicable

### Capability Claim

- ID
- Variant/block ID
- Capability ID
- Status: supported, partial, not supported, planned, unknown
- Value/performance
- Evidence maturity
- Confidence
- Notes

### Evidence

- ID
- Evidence title
- Evidence type: test, demo, analysis, simulation, similarity, assumption
- Source/reference/link
- Applies-to configuration
- Summary
- Confidence

### Gap

- ID
- Target need/capability
- Product/variant affected
- Gap description
- Severity
- Business impact
- Technical impact
- Evidence gap versus true design gap

### Roadmap Candidate

- ID
- Name
- Description
- Driver/rationale
- Target block
- Benefits
- Rough cost/effort
- Schedule drivers
- Risks
- Assumptions
- Decision status
- Decision rationale

### Design Element

- ID
- Name
- Type: hardware, software, firmware, mechanical, thermal, interface, test equipment, etc.
- Description
- Owner/team
- Configuration reference

### Impact

- ID
- Roadmap candidate ID
- Impacted design element
- Impact type
- Severity
- Confidence
- Effort estimate/range
- Schedule implication
- Verification implication
- Risk implication
- Notes

### Requirement Reference

- ID
- Requirement text or summary
- Source/reference
- Related capability
- Related roadmap candidate
- Status

### Decision Record

- ID
- Decision title
- Decision date
- Options considered
- Decision
- Rationale
- Assumptions
- Risks accepted
- Revisit trigger
- Supporting evidence

### Assumption

- ID
- Statement
- Related candidate/impact/capability
- Confidence
- Owner
- Validation plan
- Consequence if false

### Risk / Opportunity

- ID
- Type: risk or opportunity
- Description
- Related product/candidate/capability
- Probability
- Consequence
- Mitigation or capture plan
- Status

---

## 9. Important Design Principles

### 9.1 Source-of-Truth Discipline

The tool should not become an uncontrolled duplicate of formal systems.

For each important item, it should be clear whether the tool is:

- The source of truth
- A summary of another source
- A link/reference to another source
- A planning assumption

Formal requirements should still live in Jama/DOORS or the official requirements system. Released drawings should still live in PLM or the controlled drawing system. Test evidence should still live in the official test/report repository. This tool should summarize and link them for roadmap decision-making.

### 9.2 Configuration Management

Capability claims must be tied to specific baselines.

Avoid generic statements like:

> Product X supports capability Y.

Prefer:

> Product X, Block 1, HW Rev B, SW v2.3 supports capability Y based on test report Z.

This prevents the tool from becoming misleading when product variants diverge.

### 9.3 Assumptions Must Be Explicit

Every estimate, impact conclusion, or roadmap recommendation should be able to carry assumptions.

Examples:

- Assumes the existing Subsystem board can be modified instead of fully redesigned.
- Assumes thermal margin remains sufficient.
- Assumes existing EVT equipment can support the required measurement.
- Assumes supplier part remains available.
- Assumes current controller has enough resource margin.
- Assumes customer does not require a new qualification campaign.

The tool should make assumptions visible because they often drive whether a roadmap is realistic.

### 9.4 Avoid False Precision

Early roadmap planning should use rough, defensible estimates.

Recommended estimate formats:

- T-shirt size: S/M/L/XL
- Range: 100–200 hours
- Confidence: low/medium/high
- Basis of estimate: prior similar effort, SME judgment, vendor quote, actual historical data

Avoid making the tool appear more precise than the underlying data supports.

### 9.5 Separate Claim Types

The tool should clearly separate:

- Verified current capability
- Demonstrated but not formally verified capability
- Analyzed or simulated capability
- Planned future capability
- Stretch/potential capability
- Unsupported capability
- Unknown capability

This is especially important for business development and customer-facing discussions.

### 9.6 Local-First and Controlled-Data Friendly

Because the tool may contain proprietary, export-controlled, or sensitive technical data, the design should favor:

- No cloud dependency
- No automatic telemetry
- No external API calls unless explicitly enabled
- Local-only storage
- Optional project-file encryption later
- Marking/banners for controlled data
- Ability to generate sanitized exports for BD or management
- Audit trail or change notes for important changes

---

## 10. Good Ideas to Keep in Scope Early

These are strong candidates for the MVP or near-MVP:

1. Product/variant/block capability matrix
2. Capability filtering by product or market need
3. Gap analysis against target capability set
4. Feature/function/performance to design impact analysis
5. Evidence maturity and confidence tracking
6. Roadmap candidate scoring and decision tracking
7. Include/defer/reject decision rationale
8. Assumption tracking
9. Rough cost/schedule/risk/benefit comparison
10. BD-safe capability view
11. Engineering impact view
12. Management summary view
13. Local `.plroadmap.json` open/import/export workflow

---

## 11. Ideas to Defer Until Later

These ideas are useful but should not be part of the first implementation unless the MVP proves the need.

### 11.1 Full FMECA Module

FMECA is valuable, especially if failure modes drive roadmap upgrades, but it has enough structure to become a separate tool. For the first version, allow roadmap candidates to cite a reliability/FMECA-driven rationale without implementing a full FMECA system.

### 11.2 Full N2 Diagram Editor

N2/interface visualization may be valuable later, but a graphical editor is likely to consume a lot of effort. First capture structured dependencies and interface impacts in tables. Generate visualizations later.

### 11.3 Auto-Generated Formal Requirements

The tool may generate draft requirement candidates, but it should not generate authoritative requirements without human review and formal approval. Requirements are commitments and must stay controlled.

### 11.4 Detailed Resource/Schedule Planning

The tool can identify schedule drivers, test equipment needs, and rough effort ranges. It should not try to replace project scheduling tools or produce overly precise resource plans too early.

### 11.5 Full MBSE/PLM/Jama Replacement

The tool should link to or summarize official sources. It should not try to replace controlled engineering systems.

### 11.6 AI-Generated Conclusions

AI assistance may be useful later for drafting summaries, identifying missing fields, or suggesting impact areas. However, the underlying data model and review workflow should come first.

### 11.7 SQLite or Desktop Executable

SQLite and desktop packaging may be useful later, but they are not the preferred MVP path. The first version should prove the workflow as a local-first static browser app using JSON project snapshots.

---

## 12. Potential Views / Screens

### 12.1 Product Line Dashboard

Shows products, variants, blocks, status, high-level capability coverage, evidence maturity distribution, top gaps, and top roadmap candidates.

### 12.2 Capability Matrix

Rows are capabilities; columns are products/variants/blocks. Cells show supported, partial, not supported, planned, or unknown, with evidence maturity indicators.

### 12.3 Capability Detail View

Shows a specific capability, which products support it, the evidence basis, confidence, related requirements, gaps, and roadmap candidates.

### 12.4 Gap Analysis View

Compares a desired target capability set against selected product baselines.

### 12.5 Roadmap Candidate View

Shows candidate upgrades, rationale, benefits, impacts, risks, assumptions, status, and decision rationale.

### 12.6 Impact Analysis View

Shows the blast radius of a candidate upgrade across design elements, requirements, interfaces, test, verification, and risks.

### 12.7 Decision Log

Shows include/defer/reject/study decisions, rationale, assumptions, risks accepted, and revisit triggers.

### 12.8 BD Capability View

A sanitized view showing what can be said externally or to BD without overclaiming unverified capabilities.

### 12.9 Management Summary View

Summarizes roadmap options, recommended block plan, cost/benefit/risk trade, and major assumptions.

### 12.10 Project File / Snapshot View

Shows loaded project name, schema version, data marking, last loaded time, last exported time, unsaved changes, snapshot notes, and export controls.

---

## 13. UI Design Guidelines for Candidate Front-End Designs

These guidelines are intended to be given to an LLM, designer, or coding agent to generate candidate front-end UI concepts.

### 13.1 Overall UI Intent

Design a local-first browser application for a chief engineer managing product-line roadmap planning. The UI should make complex product-line information understandable without hiding traceability, assumptions, evidence maturity, or decision rationale.

The app should feel like an engineering decision cockpit, not a generic spreadsheet clone. It should help the user answer:

- What does each product/variant/block support today?
- What is verified versus only simulated, planned, assumed, or unknown?
- What gaps exist against a target market or future block?
- What roadmap candidates close those gaps?
- What architecture/design/test impacts follow from each candidate?
- What should BD safely claim?
- What should management fund and why?

### 13.2 UI Design Principles

1. **Decision-first, data-backed** — prioritize views that support decisions, but always allow drill-down into supporting data.
2. **Evidence maturity must be visible** — never show a capability claim without a visual indication of maturity/confidence.
3. **Avoid false precision** — show rough estimates as ranges, t-shirt sizes, and confidence levels.
4. **Make uncertainty obvious** — unknowns, assumptions, and low-confidence claims should stand out.
5. **Separate audiences** — CE, engineering, BD, and management views should not all show the same level of detail.
6. **Traceability by click-through** — users should be able to move from need → capability → claim → evidence → gap → roadmap candidate → impact → decision.
7. **Local-file status must be obvious** — show loaded project name, unsaved changes, snapshot/export status, and data marking.
8. **Do not require network access** — assume the app is running from local files in a restricted environment.
9. **Favor tables plus focused visual summaries** — tables are needed for engineering rigor; cards, filters, badges, and charts make them digestible.
10. **Every export should be audience-safe** — especially BD and management outputs.

### 13.3 Recommended Navigation Structure

Use a left-side navigation rail or top-level tabs with these main areas:

1. **Dashboard**
2. **Products & Variants**
3. **Capability Matrix**
4. **Gap Analysis**
5. **Roadmap Candidates**
6. **Impact Analysis**
7. **Evidence & Maturity**
8. **Decisions & Assumptions**
9. **Reports / Exports**
10. **Project Settings**

The Dashboard should be the landing page.

### 13.4 Dashboard Requirements

The dashboard should provide a quick executive/CE summary:

- Product-line health summary
- Number of current, retired, planned, and prototype variants
- Capability coverage summary
- Count of verified/demonstrated/simulated/assumed/unknown claims
- Top capability gaps
- Top roadmap candidates by value/risk
- High-impact design areas
- Open assumptions that could invalidate roadmap decisions
- BD-safe claim warnings

Use summary cards, simple charts, and prioritized lists. Avoid decorative visuals that do not drive a decision.

### 13.5 Capability Matrix UI

The capability matrix is a core screen.

Rows: capabilities, functions, features, or performance parameters.  
Columns: products, variants, blocks, or selected baselines.  
Cells: support status and maturity/confidence.

Each cell should show:

- Support status: supported, partial, not supported, planned, unknown
- Evidence maturity: verified, demonstrated, analyzed, simulated, assumed, unknown
- Confidence: low, medium, high
- Optional value/performance number
- Caveat indicator if BD should not claim it freely

Recommended interactions:

- Filter by capability category
- Filter by product/variant/block
- Filter by maturity/confidence
- Filter to BD-safe only
- Compare selected variants
- Click a cell to open capability claim detail
- Highlight gaps against a selected target capability set

### 13.6 Roadmap Candidate UI

The roadmap candidate screen should combine a table and detail panel.

Candidate table columns:

- Candidate name
- Target block
- Driver/rationale
- Gap addressed
- Business value
- Technical value
- Effort size
- Risk level
- Confidence
- Decision status
- Revisit trigger

Candidate detail panel should show:

- Problem/opportunity statement
- Benefits
- Affected variants
- Impact summary
- Required teams
- Verification/test implications
- Assumptions
- Risks introduced/retired
- Decision history
- Export-ready summary

Recommended interactions:

- Kanban/status view: include, defer, reject, study, blocked
- Scorecard view: value versus effort/risk
- Filter by block, driver, owner, decision status, and confidence
- Compare two or more candidates

### 13.7 Impact Analysis UI

Impact analysis should make the blast radius of a candidate obvious.

Recommended views:

- Impact table by design element
- Heatmap by severity and confidence
- Grouped impact summary by domain: software, firmware, mechanical, thermal, test, manufacturing, supplier, requirements, interfaces
- Optional simple dependency graph later, but not required for MVP

Each impact record should show:

- Impacted item
- Impact type
- Severity
- Confidence
- Required owner/team
- Effort size/range
- Schedule driver
- Verification consequence
- Risk consequence
- Basis of estimate

The UI should make low-confidence high-severity impacts especially visible.

### 13.8 Evidence & Maturity UI

The evidence screen should help prevent overclaiming.

Recommended features:

- Evidence library table
- Claim-to-evidence traceability
- Maturity distribution chart
- Evidence gaps list
- Claims with no evidence
- Claims based only on simulation or assumption
- Claims marked unsafe for BD use

Capability detail pages should include an evidence timeline or evidence list showing what supports the claim.

### 13.9 Gap Analysis UI

The gap analysis screen should allow the user to select or define a target capability set, then compare selected product variants against it.

Recommended output:

- Met / partial / missing / unknown summary
- Blocker gaps
- Evidence gaps versus true design gaps
- Roadmap candidates that could close each gap
- Estimated impact to close each gap
- BD/customer implication

The UI should clearly distinguish:

- The product truly cannot do this
- We do not know if the product can do this
- The product can likely do this but lacks verification evidence
- The product can do this only in a different variant/configuration

### 13.10 Reports and Export UI

Reports should be generated from the same underlying data but tailored by audience.

Required report types:

- BD capability view
- Management roadmap summary
- Engineering impact report
- Gap analysis report
- Decision log
- Assumptions and risk summary

Export formats to consider:

- Markdown
- HTML
- CSV
- JSON snapshot
- PDF later if practical
- PowerPoint later if leadership reporting becomes important

The export UI should let the user select:

- Audience
- Included products/variants
- Included roadmap candidates
- Whether to include sensitive/internal-only notes
- Whether to include low-confidence or non-BD-safe claims

### 13.11 Visual Language

Use a clean engineering/business style:

- Dense enough for technical users, but not cluttered
- Clear badges for status/maturity/confidence
- Tables with filters and sorting
- Cards for summaries
- Heatmaps for impact and risk
- Timeline or block-roadmap view for future upgrades
- Minimal animation
- No unnecessary decorative graphics

Recommended status badge families:

- Support status: supported, partial, not supported, planned, unknown
- Maturity: verified, demonstrated, analyzed, simulated, assumed, unknown
- Confidence: high, medium, low
- Decision: include, defer, reject, study, blocked
- BD claim status: claimable, caveat, internal only, do not claim

### 13.12 Candidate UI Concepts to Generate

Ask the design LLM to produce at least three candidate designs:

1. **Matrix-first design** — capability matrix is the central experience, with drill-down panels.
2. **Roadmap-first design** — candidate upgrades and block planning are central, with capability and impact data supporting them.
3. **Dashboard-first design** — executive/CE overview is central, with guided workflows into gaps, impacts, and decisions.

Each candidate design should include:

- Main navigation layout
- Dashboard wireframe
- Capability matrix wireframe
- Roadmap candidate detail wireframe
- Impact analysis wireframe
- Export/reporting flow
- Pros and cons
- Best use case

### 13.13 UI Prompt for an LLM / Coding Agent

```text
Design candidate front-end UI concepts for a local-first browser application called Product-Line Roadmap Decision Tool.

The app is for a chief engineer planning product-line block upgrades. It runs locally in a browser from static files, with no hosted backend, no server, no installed database, and no internet dependency. Users open/import a .plroadmap.json project snapshot, edit or review locally, then export updated snapshots and audience-specific reports.

Primary workflow:
Given a current product/variant/block baseline and a proposed future capability, determine what gaps exist, what design elements are impacted, what evidence supports current claims, what the cost/schedule/risk/benefit looks like, and whether the candidate should be included, deferred, rejected, or studied.

Core data objects:
products, variants, capabilities, capabilityClaims, evidence, requirements, targetCapabilitySets, gaps, roadmapCandidates, designElements, interfaces, impactAssessments, decisions, assumptions, risks, opportunities, and viewSettings.

Design principles:
- Decision-first, data-backed
- Evidence maturity and confidence must be visible everywhere a capability is shown
- Distinguish verified, demonstrated, analyzed, simulated, assumed, planned, unsupported, and unknown
- Avoid false precision; use rough estimates, ranges, t-shirt sizes, basis-of-estimate, and confidence
- Make assumptions, unknowns, and low-confidence claims obvious
- Support different audiences: chief engineer, engineering, business development, and management
- Make local project-file status obvious: project name, data marking, unsaved changes, last export time
- Do not assume network access or cloud storage

Produce three candidate UI designs:
1. Matrix-first design
2. Roadmap-first design
3. Dashboard-first design

For each design, provide:
- Navigation structure
- Dashboard layout
- Capability matrix layout
- Gap analysis flow
- Roadmap candidate page layout
- Impact analysis layout
- Evidence/maturity display
- Decision/assumption display
- Report/export flow
- Pros and cons
- Best-fit use case

Favor practical engineering UI over decorative visuals. Use tables, filters, badges, summary cards, heatmaps, and drill-down detail panels.
```

---

## 14. Example Roadmap Candidate Template

```text
Candidate Name:

Description:

Driving Need / Rationale:

Target Capability or Gap Addressed:

Affected Products / Variants:

Business Benefit:

Technical Benefit:

Cost Reduction / Sustainment Benefit:

Evidence Supporting Need:

Impacted Design Elements:

Requirement Impacts:

Interface Impacts:

Verification / Test Impacts:

Rough Effort Estimate:

Schedule Drivers:

Risks Introduced:

Risks Retired:

Key Assumptions:

Confidence Level:

Decision:

Decision Rationale:

Revisit Trigger:
```

---

## 15. Example Capability Claim Template

```text
Capability Name:

Product / Variant / Block:

Claimed Status:
Supported / Partial / Not Supported / Planned / Unknown

Performance Value, if applicable:

Evidence Type:
Verified Test / Demonstration / Analysis / Simulation / Similarity / Assumption / Unknown

Evidence Reference:

Applicable Configuration:

Confidence Level:

Limitations / Caveats:

Can BD Claim This?:
Yes / No / With Caveat / Internal Only

Notes:
```

---

## 16. First Validation Step Before Building

Before writing the app, create a small realistic dataset manually in Excel, CSV, or JSON for one product line.

The validation dataset should include:

1. 2–3 products or variants
2. 15–30 capabilities
3. 5–10 roadmap candidates
4. 5–10 design elements
5. 10–20 impact records
6. Several evidence maturity examples
7. Several include/defer/reject decisions
8. A sample BD-safe view
9. A sample management summary
10. A sample engineering impact report

Then evaluate whether the resulting views actually help answer:

- What can the product do today?
- What cannot be claimed yet?
- What gaps block a target market or future capability?
- What upgrades are worth considering?
- What is impacted if we pursue each upgrade?
- Which roadmap choices are defensible?
- Which assumptions could invalidate the plan?

If the manual dataset and mock reports are useful, then build the app around that proven data model.

---

## 17. Success Criteria

The tool is successful if it helps a chief engineer quickly and defensibly answer:

1. What capabilities does each product/variant/block currently have?
2. Which capabilities are verified, demonstrated, simulated, assumed, or unknown?
3. What gaps exist relative to a target market, customer, or future block?
4. What roadmap candidates close those gaps?
5. What design elements, requirements, interfaces, tests, and teams are impacted?
6. What are the main cost, schedule, risk, and complexity drivers?
7. What assumptions are the roadmap based on?
8. What should be included, deferred, rejected, or studied further?
9. What can BD safely claim?
10. What should management fund and why?

---

## 18. Main Risks in the Tool Design

### Risk 1: Scope Creep

The tool could become too broad if it tries to replace requirements management, MBSE, PLM, project scheduling, risk management, FMECA, and business-case tools.

Mitigation: Keep the first version focused on capability, gap, roadmap, impact, evidence, and decision traceability.

### Risk 2: Poor Data Quality

The tool will only be useful if capability claims, evidence, assumptions, and impacts are maintained.

Mitigation: Make it easy to import/export, review missing fields, and flag low-confidence claims.

### Risk 3: False Precision

The tool could make rough estimates look more certain than they are.

Mitigation: Use ranges, confidence levels, basis-of-estimate fields, and explicit assumptions.

### Risk 4: Uncontrolled Duplicate Data

The tool could become an unofficial duplicate of requirements, drawings, test reports, or schedules.

Mitigation: Link to source-of-truth artifacts and clearly label summaries versus authoritative data.

### Risk 5: Overclaiming Capabilities

BD or management could treat planned/simulated capabilities as verified.

Mitigation: Make evidence maturity and claim status visually obvious in every relevant view/export.

### Risk 6: Sensitive Data Handling

The tool may contain proprietary or controlled technical data.

Mitigation: Keep the tool local-first, avoid telemetry/cloud dependencies, support sanitized exports, and consider optional encryption.

### Risk 7: Browser File-Save Friction

A pure local browser app cannot freely overwrite local files without user interaction. Users may accidentally download multiple project snapshots or edit an outdated copy.

Mitigation: Make project name, loaded filename, unsaved changes, export timestamp, and snapshot notes highly visible. Encourage a CE-owned master snapshot and disciplined archive/export practice.

### Risk 8: Too Many Editors Too Early

If the live project file is broadly distributed before the workflow is mature, different users may create conflicting snapshots and treat rough planning data as formal commitments.

Mitigation: Start as a CE-owned master tool and export audience-specific reports. Add broader editing only after governance is clear.

---

## 19. Recommended Build Order

1. Define the flat `.plroadmap.json` schema and create a realistic sample project snapshot.
2. Create static mock reports/views from the sample data.
3. Generate 2–3 candidate front-end UI designs and select the best workflow.
4. Build the local static browser app shell with open/import project and export snapshot functions.
5. Build basic CRUD screens for products, variants, capabilities, roadmap candidates, design elements, evidence, assumptions, and decisions.
6. Add capability matrix and gap analysis.
7. Add roadmap candidate and impact analysis workflow.
8. Add evidence maturity/confidence tracking.
9. Add exports for BD, engineering, and management.
10. Add decision log and assumption tracking.
11. Only then consider graphical N2/PBL views, FMECA import, requirement draft generation, AI assistance, SQLite, or a packaged desktop version.
