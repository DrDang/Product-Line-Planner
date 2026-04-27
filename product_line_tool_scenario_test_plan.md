# Product-Line Roadmap Decision Tool — Scenario Test Plan

This document collects the user-facing validation scenarios for testing the Product-Line Roadmap Decision Tool after implementation. Each scenario is written as an end-to-end workflow test with expected UI behavior and pass/fail criteria.

## Purpose

Use these scenarios to verify that the app supports the chief engineer's intended workflows:

1. Evaluating whether an existing or planned Sample Product baseline supports a customer mission or market segment.
2. Planning what should go into the next product baseline.
3. Answering BD/customer-facing claimability questions without overclaiming.
4. Adding a new proposed feature and understanding its roadmap, impact, evidence, claim, and decision implications.

## General Test Assumptions

The app should be a local-first browser app using a `.plroadmap.json` project snapshot. The tool should not require hosting, telemetry, or an installed database.

The test project should include sample Sample Product product-line data with at least:

- Main Variant v1.4 as the current active primary baseline.
- Main Variant v1.5 as the planned successor baseline.
- Customer Segment v2.0 and Customer Segment v2.1 as customer-specific variants.
- Customer B v1.2 as a supported/sustainment variant.
- Block 2 Prototype as a future/planned concept.
- Capability claims with evidence maturity and BD claim guidance.
- Target configurations such as Target Patrol Segment 2025 and Customer Segment Extended Range Mission.
- Roadmap candidates such as Active Fins v2, Next-Gen Thermal Management, Sensor Suite B, Secure Update Enablement, and RC-083 optional feature Transmit Feature.

## Terminology Expectations

The UI should use clear, consistent terminology:

- **Target Configuration**: a mission, customer need, market segment, or future block objective.
- **Compared Against Baseline**: the baseline being evaluated against the target configuration.
- **Roadmap Candidate**: a proposed upgrade, design change, verification effort, or improvement under consideration.
- **Potential Upgrade**: a roadmap candidate that may close a gap.
- **Baseline Match**: Met, Partial, Not Met, Unknown.
- **Evidence Status**: Evidence OK, Evidence Gap, No Evidence, Sim Only, Outdated Evidence.
- **BD Claim Guidance**: approved claim text, caveats, forbidden claims, and evidence basis.
- **Decision Trace / Decision Reference**: local trace to a formal decision record, especially if the official decision/risk register lives in a separate tool.

The app should avoid automated recommendation language unless the recommendation is explicitly marked as manually entered by the chief engineer.

---

# Scenario 1 — Customer asks whether Sample Product v1.4 can support a Target Patrol mission

## Goal

A customer or program asks:

> Can Sample Product support a Target Patrol Segment 2025 mission requiring Sea-State 5 operation, long-range connectivity, 100+ target tracking, and secure remote update?

The chief engineer needs to answer:

- Which baseline is closest?
- What capabilities are met?
- What gaps exist?
- Which gaps are blockers?
- What upgrade candidates close the gaps?
- What evidence supports the claim?
- What decision needs leadership/customer input?

## Step 1 — Start on Dashboard

### User Action

Open the Sample Product product-line project and land on the Dashboard.

### Expected UI

Dashboard should show:

- Current active baseline: Main Variant v1.4.
- Planned successor: Main v1.5.
- Planning blockers.
- Roadmap decisions.
- Baseline landscape.
- Baseline roadmap / lineage.
- CTA: **Evaluate Target Configuration**.

### User Action

Click **Evaluate Target Configuration**.

### Expected Result

A setup modal or workflow opens asking for:

1. Target Configuration.
2. Compared Against Baseline.
3. Optional additional baselines for trade comparison.

## Step 2 — Select Target Configuration and Baseline

### User Action

Select:

- Target Configuration: Target Patrol Segment 2025.
- Compared Against Baseline: Main Variant v1.4.
- Optional comparison baselines: Main v1.5, Block 2 Prototype, Customer Segment v2.1.

Click **Open Gap Analysis**.

### Expected Result

The app opens the Capability Gap Analysis page.

## Step 3 — Review Capability Gap Analysis

### Expected UI

The Gap Analysis page should clearly show:

- Target Configuration: Target Patrol Segment 2025.
- Compared Against Baseline: Main Variant v1.4.
- Required Capabilities Met.
- Gaps Identified.
- Unknown / Evidence Needed.
- Blockers.
- Target Definition summary.
- Target-vs-Baseline Gap Matrix.
- Selected gap detail panel.

### Expected Matrix Rows

The table should include rows similar to:

| Required Capability | Category | Baseline Match | Gap Severity | Evidence Status | Potential Upgrade | Disposition |
|---|---|---|---|---|---|---|
| Sea-State 5 Stability | Environmental / Platform | Not Met | Blocker | Evidence OK | Active Fins v2 | Link roadmap candidate |
| L-Band connectivity Integration | Communications | Partial | Medium | Evidence OK | None | Create roadmap candidate |
| Multi-Target Tracking 100+ | Tracking | Met | None | Evidence OK | None | No action |
| Quantum-Resistant Crypto | Security | Unknown | High | Evidence Gap | Project AES-Q | Collect evidence |
| Acoustic Signature Reduction | Signature / Survivability | Partial | High | Evidence Gap | Hull Coating Mk4 | Needs study |

## Step 4 — Inspect the Sea-State 5 gap

### User Action

Click the Sea-State 5 Stability row.

### Expected Detail Panel

The gap detail panel should show:

- Target need: maintain full operational capability in Sea State 5.
- Current baseline state: rated to Sea State 3.
- Gap rationale: baseline v1.4 does not meet the Sea-State 5 target.
- Evidence basis: TR-23-09A or equivalent.
- Linked roadmap candidate: Active Fins v2.
- Gap severity: Blocker.
- Disposition: Link roadmap candidate.
- Decision owner.
- Due date.
- Required evidence.
- Impact if unresolved.

### Expected CE Conclusion

Main v1.4 is not sufficient for this target configuration without a stabilization upgrade or a customer/leadership concession.

## Step 5 — Open linked Roadmap Candidate

### User Action

Click **Active Fins v2** from the gap detail panel.

### Expected UI

The Roadmap Candidate detail page should open and show:

- Candidate name.
- Capability added or improved.
- Problem / gap closed.
- Target configuration link.
- Affected baselines.
- Evidence maturity.
- Cost / effort.
- Schedule impact.
- Technical risk.
- Integration risk.
- Verification burden.
- Decision state.
- Decision needed / owner.
- Supporting references.

### Expected Behavior

The page should not automatically recommend a decision. It should present evidence and structured fields for chief engineer judgment.

## Step 6 — Compare baselines

### User Action

Open Baseline Trade Comparison for Target Patrol Segment 2025.

### Expected UI

The comparison should show a table like:

| Baseline | Lifecycle Status | Required Capabilities Met | Partial Matches | Blockers | Unknown / Evidence Needed | Potential Upgrades | Key Notes |
|---|---|---:|---:|---:|---:|---|---|
| Main Variant v1.4 | Active Primary | 4 / 12 | 2 | 1 | 2 | Active Fins v2 | Not sufficient as-is for sea-state target |
| Main Variant v1.5 | Planned | 7 / 12 | 3 | 0 | 3 | Evidence closure only | Strong near-term option, several claims need evidence |
| Block 2 Prototype | Prototype / Study | 9 / 12 | 1 | 0 | 5 | Verification campaign | Strong future option with low maturity |
| Customer Segment v2.1 | Customer-Specific Planned | 6 / 12 | 2 | 1 | 1 | connectivity integration | Customer-specific path |

### Expected Behavior

Clicking a baseline should open a detail panel with:

- Baseline summary.
- Target fit summary.
- Key gaps.
- Potential upgrades.
- Evidence notes.
- CE notes.

## Step 7 — Export or record decision trace

### User Action

From the gap analysis, candidate detail, or baseline comparison page, create a decision trace or link a formal decision record.

### Expected UI

The tool should allow the CE to capture or reference:

- Decision statement.
- Options considered.
- Selected disposition.
- Rationale.
- Evidence basis.
- Assumptions.
- Risks accepted.
- BD claim impact.
- Revisit trigger.
- External formal decision ID if using a separate risk/decision register.

## Pass Criteria

Scenario passes if the CE can answer:

- Main v1.4 does not meet Target Patrol Segment 2025 as-is.
- Sea-State 5 is a blocker.
- Active Fins v2 is the linked potential upgrade.
- Main v1.5 or Block 2 may be stronger planning baselines, subject to evidence closure.
- Unknown evidence and claim limitations are clearly visible.
- No unsafe BD/customer claim is implied.

---

# Scenario 2 — Product-line chief engineer planning Main v1.5

## Goal

The chief engineer is deciding what should go into Main Variant v1.5.

The question is:

> Given current gaps, customer variants, and roadmap candidates, what should be included in the next baseline?

## Step 1 — Start on Dashboard

### Expected UI

Dashboard should show:

- Next-version planning:
  - Main v1.4 → Main v1.5.
  - Customer Segment v2.0 → Customer Segment v2.1.
- Roadmap decisions:
  - 5 upgrade candidates.
  - Include / Study / Defer counts.
- Planning blockers:
  - CE decisions needed.
  - Missing evidence blockers.
- CTA: **Plan Next Baseline**.

### User Action

Click **Plan Main v1.5**.

### Expected Result

The app opens the Baseline Planning page for Main Variant v1.5.

## Step 2 — Review Main v1.5 Baseline Planning

### Expected UI

The Baseline Planning page should show:

- Planned Baseline: Main Variant v1.5.
- Derived From: Main Variant v1.4.
- Lifecycle Status: Planned.
- Planning Owner: Project Lead.
- Planning Summary.
- Candidate Planning Table.
- Capability Delta Preview.
- Open Decisions.
- Traceability links.

## Step 3 — Review Candidate Planning Table

### Expected Table

| Roadmap Candidate | Capability Added / Improved | Gaps Closed | Applies To | Evidence | Cost / Effort | Risk | CE Disposition | Decision Needed |
|---|---|---|---|---|---|---|---|---|
| Active Fins v2 | Sea-State 5 Stability | Sea-State 5 Gap | Main v1.5 | Simulation | High | Medium | Include | Needs CE |
| Next-Gen Thermal Management | Secure Remote Update | Thermal Margin Gap | Main v1.5 / Block 2 | Missing Evidence | Medium | High | Study | Needs evidence |
| Sensor Suite B | Range / SNR | Sensor Performance Gap | Main v1.5 | Verified | Medium | Low | Include | Approved |
| Coordination Feature | Module | Module Coordination | Future Block | Assumed | High | High | Defer | Open |

### Expected Behavior

The table should be manually dispositioned. The tool should not auto-recommend include/defer/study.

## Step 4 — Inspect a Roadmap Candidate

### User Action

Click a candidate such as Next-Gen Thermal Management or Secure Update Enablement.

### Expected Candidate Detail

Candidate page should show:

- Description.
- Capability added / improved.
- Gaps closed.
- Target configurations supported.
- Affected baselines.
- Evidence status.
- Cost / effort.
- Schedule impact.
- Technical risk.
- Verification burden.
- Impact summary.
- Open decisions.
- Decision trace links.

## Step 5 — Review Capability Delta Preview

### Expected UI

Capability Delta Preview should show current baseline claim versus planned baseline claim:

| Capability | Main v1.4 Claim | Main v1.5 Claim | Driving Candidate | Evidence Status | BD Claim Status |
|---|---|---|---|---|---|
| Secure Remote Update | verified baseline workflow | remote update planned pending review | Next-Gen Thermal Management | Missing Evidence | Do not claim remote update |
| Sea-State Stability | Sea-State 3 | Sea-State 5 planned | Active Fins v2 | Simulation | Internal only until verified |
| Sensor Range / SNR | Current sensor suite | Improved Sensor Suite B | Sensor Suite B | Verified | Claim with caveat |

### Expected Behavior

The delta preview should distinguish:

- Verified current capability.
- Planned future capability.
- Missing evidence.
- BD claim caveat.
- Customer-specific exceptions.

## Step 6 — Create or link decision trace

### User Action

Use the Open Decisions panel or candidate detail to add/link decision trace items.

### Expected Decision Trace Examples

- Include Active Fins v2 in Main v1.5.
- Defer Coordination Feature to Block 2.
- Study secure remote update pending thermal evidence.
- Do not claim Sea-State 5 until verification evidence is available.

### Expected Fields

Each decision trace should connect to:

- Product baseline.
- Roadmap candidate.
- Capability.
- Gap.
- Risk / assumption.
- Evidence.
- External decision register ID if applicable.

## Pass Criteria

Scenario passes if the CE can:

- Navigate directly from Dashboard to Main v1.5 planning.
- See all candidates under review for Main v1.5.
- Distinguish include/study/defer/blocked states.
- See capability deltas from Main v1.4 to Main v1.5.
- Identify claim restrictions caused by missing evidence.
- Create or link decision traces for the planned baseline.
- Export a baseline plan.

---

# Scenario 3 — BD wants to know what they can safely claim

## Goal

Business development asks:

> Can we say Sample Product supports secure remote update?

The chief engineer needs to answer without overclaiming.

## Step 1 — Go to Capabilities

### User Action

Click **Capabilities**.

Filter or search for:

- Secure Remote Update.

Click the capability row.

### Expected UI

The capability detail drawer should show:

- Capability name: Secure Remote Update.
- Primary status: Supported.
- Evidence maturity: Verified.
- Confidence: High.
- BD Claim Guidance.
- Baseline Support Summary.
- Evidence References.

## Step 2 — Review BD Claim Guidance

### Expected BD Claim Fields

The drawer should include structured fields:

| Field | Expected Example |
|---|---|
| BD Claim Status | Claimable with caveat |
| Approved Claim Text | Sample Product Main v1.4 supports up to verified baseline operating envelope within the specified operational envelope. |
| Required Caveat | Do not claim secure remote update capability for Main v1.4. secure remote update requires engineering review of thermal margins and supporting evidence. |
| Forbidden Claim Text | Do not state “Sample Product supports secure remote update” as a current verified capability. Do not imply the secure remote update claim applies to all baselines or variants. |
| Evidence References | Test Report TR-405; Secure Update Validation v1.1 |
| Applicable Baselines | Main Variant v1.4 |
| Applicable Envelope | Specified thermal and operational envelope only |
| Approval Owner | Project Lead |
| Review / Expiration Date | Date shown or field available |

## Step 3 — Review Baseline Support Summary

### Expected Table

| Baseline | Engineering Status | BD Claim Status |
|---|---|---|
| Main v1.4 | Supported | Claimable with caveat |
| Customer Segment v2.0 | Supported | Internal only |
| Block 2 Planned | Planned | Planned / roadmap only |

## Step 4 — Answer BD

### Expected CE Answer

The tool should support an answer like:

> We can claim up to verified baseline workflow for Main v1.4 within the specified envelope. We should not claim secure remote update as a current verified capability unless we limit the claim, complete an engineering review, or explicitly tie it to a future planned baseline with caveats.

## Step 5 — Optional Export

### User Action

Click **Export BD Claim Summary** or go to Export Center.

### Expected Report

The BD export should include:

- Capability.
- Baseline.
- BD claim status.
- Approved claim text.
- Required caveat.
- Forbidden claim text.
- Evidence basis.
- Review date.

## Pass Criteria

Scenario passes if the CE can:

- Find Secure Remote Update quickly.
- See that baseline update workflow is verified for Main v1.4.
- See that secure remote update support is not externally claimable as a current verified capability.
- See approved and forbidden claim language.
- Trace the claim to evidence references.
- Export BD-safe guidance.

---

# Scenario 4 — Adding optional feature transmit support to Sample Product Main v1.5

## Goal

A new customer opportunity asks whether Sample Product can support an optional feature transmit feature in addition to the existing baseline existing baseline capability.

The chief engineer needs to understand:

> If we add optional feature TX, what parts of the current baseline design are affected, what existing claims become risky, what roadmap candidate should capture the change, and what decision needs to be made?

## Step 1 — Open the product-line project

### User Action

Start on the landing screen.

Click:

- **Open .plroadmap.json**.

Load the Sample Product product-line project file.

### Expected UI

Landing screen should establish:

- Local-first project behavior.
- No cloud/hosting dependency.
- Project data remains local unless exported.

## Step 2 — Start from Dashboard

### Expected UI

Dashboard should show:

- Current baseline: Main v1.4.
- Planned successor: Main v1.5.
- Planning blockers.
- Roadmap decisions.
- Baseline landscape.
- Baseline roadmap.
- CTA: **Plan Main v1.5**.

### User Action

Click **Plan Main v1.5**.

### Expected Result

The app opens the Baseline Planning page for Main Variant v1.5.

## Step 3 — Add or evaluate new Roadmap Candidate

### Expected UI

On the Planned Baseline: Main Variant v1.5 page, the CE should see:

- Candidate planning table.
- Capability delta preview.
- Open decisions.
- Traceability links.
- Action: **Add Roadmap Candidate**.

### User Action

Click **Add Roadmap Candidate**.

Create:

| Field | Example |
|---|---|
| Candidate | RC-083 optional feature Transmit Feature |
| Capability Added | optional feature TX |
| Gaps Closed | optional feature customer mission gap |
| Applies To | Main v1.5 / Block 2 |
| Evidence | Missing / Analysis Needed |
| Initial Disposition | Study |
| Decision Needed | Yes, CE decision required |

### Expected Behavior

The tool should immediately treat the new feature as:

- Unverified.
- Not externally claimable.
- Study/disposition pending.
- Not automatically supported in the capability matrix.

Adding a roadmap candidate should not silently convert the capability to “supported.”

## Step 4 — Run Impact / Blast Radius Analysis

### User Action

Open:

- Roadmap Candidates → RC-083 optional feature Transmit Feature → Open Full Impact Analysis.

or:

- Impact Analysis → RC-083 optional feature Transmit Feature.

### Expected UI

The Blast Radius Analysis should show impact domains such as:

- Subsystem Engineering.
- Update Package Service.
- Firmware.
- Mechanical.
- Power Systems.
- Thermal.
- Test Automation.
- Software API.
- Requirements.
- Verification.
- BD Claims.

### Expected Impact Table

| Impacted Item | Impact Type | Severity | Confidence | Effort Range | Risk Implication |
|---|---|---|---|---|---|
| Update Package Service | Package validation update | High | Medium | 8–12 weeks | Existing update workflow may not support remote deployment |
| Subsystem Module | Add optional feature TX chain | High | Low | 10–16 weeks | External fabrication and Subsystem qualification likely needed |
| Update Package Validation | Package validation path | High | Medium | 6–8 weeks | Risk of invalid package handling or rollback failure |
| Power Amplifier Chain | New PA or driver stage | High | Low | 8–10 weeks | Power, thermal, and linearity impacts |
| Main controller Firmware | Waveform/control updates | Medium | Medium | 4–8 weeks | Timing/control updates needed |
| Thermal Design | Increased heat load | High | Medium | 4–6 weeks | May invalidate current thermal margins |
| Mechanical Housing | Possible layout change | Medium | Low | 4–6 weeks | Packaging impact if subsystem interface grows |
| Test Automation | New ATP/ESS coverage | Medium | High | 2–4 weeks | Existing test scripts do not cover optional feature TX |
| BD Claims | Claim restriction needed | High | High | 1 week | Do not externally claim until evidence exists |

## Step 5 — Inspect impacted design component

### User Action

Click:

- Update Package Service — High Impact.

### Expected Detail Panel

The detail panel should show:

- Current component: Sample Product Main v1.4 update package service.
- Current baseline assumption: optimized for existing update workflow and control interface.
- Proposed change: add optional feature TX capability.
- Impact: update package validation, rollback behavior, audit logging, and deployment controls may change.
- Concern: this is not a software-only feature; it may alter the physical Subsystem design baseline.

### Expected Warning

The UI should clearly communicate:

> Adding optional feature TX likely requires update package and rollback redesign. Current Main v1.4 update workflow evidence should not be assumed applicable to Main v1.5 with optional feature TX.

## Step 6 — Review Capability Delta Preview

### User Action

Return to Baseline Planning.

### Expected Delta Preview

The Capability Delta Preview should show a row for optional feature TX and rows for existing capabilities potentially affected by optional feature TX.

| Capability | Main v1.4 Claim | Main v1.5 Claim | Driving Candidate | BD Claim Guidance |
|---|---|---|---|---|
| optional feature TX | Not supported | Planned / under study | RC-083 optional feature TX | Do not claim externally |
| Secure Remote Update | verified baseline workflow | verified baseline workflow, revalidation needed | RC-083 impact | Claim may need caveat |
| Thermal Margin | Verified for v1.4 envelope | Unknown with optional feature TX | RC-083 | Evidence required |
| Subsystem Isolation | Verified for current Subsystem paths | Unknown with TX path | RC-083 | Not claimable |

### Expected Behavior

The delta preview should show not only new capabilities added, but also existing capabilities potentially degraded, invalidated, or requiring revalidation.

## Step 7 — Check Capability page for optional feature TX

### User Action

Go to **Capabilities**.

Find or create:

- optional feature TX.

Click the capability row.

### Expected Detail Drawer

The capability detail should show:

- Primary status: Planned / Not Verified.
- Evidence maturity: Missing or Analysis Needed.
- Confidence: Low.
- BD claim status: Not claimable or Planned / roadmap only.
- Approved claim text: none.
- Required caveat: do not offer as current capability.
- Forbidden claim: “Sample Product Main v1.5 supports optional feature TX” unless decision and evidence are complete.

### Expected Warning

The UI should communicate:

> optional feature TX is a roadmap candidate only. Do not include in external capability summaries unless marked as planned/future and explicitly caveated.

### Optional Action

Click:

- Create Claim Review Action.

Expected result:

- A claim review action, decision trace, or external decision reference can be created for CE/BD review.

## Step 8 — Compare baselines against target need

### User Action

Go to:

- Target Configurations.

Select or create:

- Customer Segment Extended Range Mission.

Add required or desired capability:

- optional feature TX.

Click:

- Analyze Against Baselines.

In modal, select:

- Target Configuration: Customer Segment Extended Range Mission.
- Primary Compared Against Baseline: Main Variant v1.4.
- Additional baselines: Main Variant v1.5, Block 2 Prototype, Customer Segment v2.1.

### Expected Result

The tool opens Baseline Trade Comparison.

### Expected Table

| Baseline | Required Met | Partial | Blockers | Unknown | Potential Upgrades |
|---|---:|---:|---:|---:|---|
| Main v1.4 | 4 / 12 | 2 | 2 | 2 | RC-083 optional feature TX |
| Main v1.5 | 6 / 12 | 3 | 1 | 4 | RC-083 + thermal evidence |
| Block 2 Prototype | 8 / 12 | 2 | 0 | 5 | Verification campaign |
| Customer Segment v2.1 | 5 / 12 | 3 | 1 | 3 | connectivity/optional feature integration |

### User Action

Click Main Variant v1.5 in the table.

### Expected Detail Drawer

Drawer should show:

- Key blockers.
- Potential upgrades.
- Evidence notes.
- CE notes.
- Target fit summary.

For optional feature TX, the tool should communicate:

> Main v1.5 can be used as the planning baseline only if RC-083 is included, remote update workflow risk is accepted, and software/security verification evidence is generated.

## Step 9 — Create Decision Trace / Decision Reference

### User Action

From the candidate page, baseline planning page, or gap detail panel, click:

- Add Decision Trace.

or:

- Link Decision Record.

If the official decision/risk register is external, link to the formal record there.

### Expected Decision Trace

Create or link a decision such as:

> Include RC-083 optional feature TX in Main v1.5 study scope.

### Expected Fields

| Field | Example |
|---|---|
| Decision | Whether to include optional feature TX in Main v1.5 |
| Options | Exclude; study only; include in Main v1.5; defer to Block 2 |
| CE Disposition | Study only for Main v1.5; defer verified claim to Block 2 |
| Rationale | High software/security/verification impact; evidence missing |
| Required Evidence | Update package analysis, subsystem interface architecture, thermal model, verification plan |
| Impacted Components | update package service, subsystem module, PA chain, filtering, firmware, thermal, test automation |
| Decision Owner | Project Lead |
| Supporting Stakeholders | Subsystem lead, firmware lead, mechanical lead, BD |
| Due Date | Before Main v1.5 roadmap freeze |
| Status | Open |
| External Decision ID | Optional reference to external risk/decision register |

### Expected Traceability

The decision trace should link to:

- RC-083 optional feature TX.
- Main v1.5.
- Customer Segment Extended Range Mission.
- optional feature TX capability.
- Impact analysis.
- Evidence gaps.
- Risks and assumptions.

## Step 10 — Export decision package

### User Action

Go to **Export Center**.

Select one or more exports:

- Management Roadmap Summary.
- Engineering Impact Report.
- BD Capability Claim Summary.

### Expected Management Roadmap Summary

Should communicate:

> optional feature TX is a high-value customer-driven candidate, but it is not a low-risk feature addition. It likely impacts update package handling, subsystem module, thermal margins, firmware control, and verification scope. Include as a study candidate for Main v1.5 and defer external claimability until evidence is complete.

### Expected Engineering Impact Report

Should include:

- Component-level blast radius.
- software/security changes.
- Firmware/API changes.
- Verification changes.
- Test automation changes.
- Evidence gaps.
- Risk implications.
- Effort ranges.

### Expected BD Capability Claim Summary

Should explicitly state:

- optional feature TX is not currently claimable for Main v1.4.
- optional feature TX is under study for Main v1.5 or Block 2.
- Do not imply it is verified.
- Do not imply existing manual update evidence applies.
- Approved language should say “planned” or “under evaluation” only.

## Pass Criteria

Scenario passes if the tool can:

- Add a proposed feature/change as a roadmap candidate.
- Keep the new feature unverified and not externally claimable by default.
- Link the feature to a target configuration and gap.
- Compare affected baselines.
- Identify gaps and blockers.
- Show design-component blast radius.
- Capture engineering impact.
- Show affected existing capabilities and claims.
- Create or link a decision trace.
- Prevent unsafe BD claims.
- Export audience-specific summaries.

---

# Cross-Scenario Regression Checklist

Use this checklist after running all scenarios.

## Navigation and Workflow

- [ ] Dashboard supports both **Evaluate Target Configuration** and **Plan Next Baseline** workflows.
- [ ] Products & Baselines shows baseline lineage and selected-baseline details.
- [ ] Capabilities supports capability catalog, evidence maturity, BD claim guidance, and baseline support summary.
- [ ] Gap Analysis compares Target Configuration to Compared Against Baseline.
- [ ] Roadmap Candidates function as mini business cases for upgrade decisions.
- [ ] Baseline Planning supports planned-baseline candidate disposition and capability delta preview.
- [ ] Baseline Trade Comparison compares multiple baselines against one target configuration.
- [ ] Impact Analysis shows component/domain blast radius for a roadmap candidate.
- [ ] Decision Trace links roadmap choices to formal decision records or external decision registry IDs.
- [ ] Export Center supports management, engineering, and BD-safe exports.

## Data Integrity

- [ ] Planned capability does not automatically become verified support.
- [ ] Roadmap candidate does not automatically become externally claimable.
- [ ] Capability claims are baseline-specific, not global by default.
- [ ] Evidence maturity is visible wherever claims appear.
- [ ] BD claim guidance is explicit and includes caveats/forbidden claims.
- [ ] Design gaps and evidence gaps are distinguishable.
- [ ] Baseline lineage is consistent across Dashboard, Products, and Baseline Planning.
- [ ] Target Configuration source and required capabilities are visible.
- [ ] Candidate dispositions are manually set, not auto-recommended.
- [ ] Decision/risk references do not duplicate the external register unless intentionally imported.

## Export Behavior

- [ ] Management exports summarize roadmap tradeoffs without unsafe claims.
- [ ] Engineering exports include impact, verification, assumptions, and evidence gaps.
- [ ] BD exports include approved claim text, required caveats, forbidden claims, and evidence basis.
- [ ] Exported reports reflect the selected baseline/target/candidate context.

