"use strict";

const SCHEMA_VERSION = "0.1.0";
const nowIso = () => new Date().toISOString();

const navItems = [
  ["dashboard", "Dashboard", "grid"],
  ["products", "Products", "box"],
  ["matrix", "Variation Points", "layers"],
  ["gaps", "Gap Analysis", "split"],
  ["candidates", "Roadmap Candidates", "route"],
  ["impacts", "Impact Analysis", "bars"],
  ["evidence", "Evidence & Maturity", "doc"],
  ["decisions", "Assumptions", "alert"],
  ["reports", "Reports / Exports", "export"],
  ["settings", "Project Settings", "gear"],
];

const state = {
  project: null,
  view: "dashboard",
  loadedAt: null,
  lastExportedAt: null,
  dirty: false,
};

const $ = (selector) => document.querySelector(selector);
const byId = (items, id) => (items || []).find((item) => item.id === id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[char]));
const title = (value) => String(value || "unknown").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const badgeClass = (value) => String(value || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const badge = (value) => `<span class="badge ${badgeClass(value)}">${esc(title(value))}</span>`;
const fmtDate = (value) => value ? new Date(value).toLocaleString() : "Not recorded";
const makeId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

function blankProject() {
  return {
    schemaVersion: SCHEMA_VERSION,
    project: {
      id: "proj_" + Date.now(),
      name: "Untitled Product Line Project",
      ownerRole: "Project Lead",
      dataMarking: "Internal Use",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      snapshotNotes: "",
    },
    products: [],
    variants: [],
    capabilities: [],
    capabilityClaims: [],
    evidence: [],
    requirements: [],
    targetCapabilitySets: [],
    gaps: [],
    roadmapCandidates: [],
    designElements: [],
    interfaces: [],
    impactAssessments: [],
    decisions: [],
    assumptions: [],
    risks: [],
    opportunities: [],
    viewSettings: {},
  };
}

function sampleProject() {
  const p = blankProject();
  p.project = {
    id: "proj_sample",
    name: "Example Product Line Roadmap",
    ownerRole: "Project Lead",
    dataMarking: "Internal Use",
    createdAt: "2026-04-25T08:00:00.000Z",
    updatedAt: nowIso(),
    snapshotNotes: "Sample data for local-first MVP evaluation.",
  };
  p.products = [
    { id: "prod_product_1", name: "Product 1.0", status: "retired", description: "Retired production product retained for lineage and reference.", notes: "Historical baseline only.", successorProductId: "prod_product_2" },
    { id: "prod_product_2", name: "Product 2.0", status: "current", description: "Active production product for current roadmap decisions.", notes: "Primary active baseline.", successorProductId: "prod_product_3" },
    { id: "prod_product_25", name: "Product 2.5", status: "current", description: "Active intermediate product with selected capability upgrades.", notes: "Parallel active configuration.", successorProductId: "" },
    { id: "prod_product_3", name: "Product 3.0", status: "planned", description: "Planned next-generation product target.", notes: "Future block planning baseline.", successorProductId: "" },
  ];
  p.variants = [
    { id: "var_product_1_b1", productId: "prod_product_1", name: "Released Baseline", block: "Product 1.0", hardwareRevision: "HW Rev A", softwareVersion: "SW 1.0", status: "retired", configurationNotes: "Retired production baseline." },
    { id: "var_product_2_b2", productId: "prod_product_2", name: "Active Baseline", block: "Product 2.0", hardwareRevision: "HW Rev B", softwareVersion: "SW 2.0", status: "current", configurationNotes: "Active production baseline." },
    { id: "var_product_25_b25", productId: "prod_product_25", name: "Active Baseline", block: "Product 2.5", hardwareRevision: "HW Rev B.5", softwareVersion: "SW 2.5", status: "current", configurationNotes: "Active intermediate baseline." },
    { id: "var_product_3_b3", productId: "prod_product_3", name: "Planned Baseline", block: "Product 3.0", hardwareRevision: "HW Rev C", softwareVersion: "SW 3.0", status: "planned", configurationNotes: "Planned future baseline." },
  ];
  p.capabilities = [
    { id: "cap_remote_update", name: "Secure Remote Update", category: "Software Feature", description: "Support secure remote software update workflow." },
    { id: "cap_diag", name: "Automated Fault Isolation", category: "Diagnostics", description: "Localize field faults without SME intervention." },
    { id: "cap_performance_envelope", name: "Performance Envelope", category: "Performance", description: "Meet the target performance envelope for a future product." },
    { id: "cap_input_power", name: "Input Power Envelope", category: "Power Constraint", description: "Supported platform input power constraint, such as 28VDC or 40VDC operation." },
  ];
  p.evidence = [
    { id: "ev_remote_update_demo_001", title: "Secure Remote Update Lab Demo", type: "demonstrated", reference: "UPDATE-DEMO-001", appliesTo: "prod_product_1", summary: "Lab demonstration of baseline remote update workflow.", confidence: "medium" },
    { id: "ev_diag_test_014", title: "Diagnostic Regression Test", type: "verified", reference: "TEST-014", appliesTo: "prod_product_2", summary: "Automated fault isolation passed representative regression suite.", confidence: "high" },
    { id: "ev_performance_analysis_003", title: "Performance Envelope Analysis", type: "simulation", reference: "ANALYSIS-PERF-003", appliesTo: "prod_product_3", summary: "Analysis only. Requires verification evidence before claim.", confidence: "low" },
  ];
  p.capabilityClaims = [
    { id: "claim_product_1_remote_update", variantId: "var_product_1_b1", capabilityId: "cap_remote_update", supportStatus: "partial", maturity: "demonstrated", confidence: "medium", evidenceIds: ["ev_remote_update_demo_001"], bdCaveat: "Do not claim formal qualification.", notes: "Demonstrated in a controlled lab setting." },
    { id: "claim_product_2_remote_update", variantId: "var_product_2_b2", capabilityId: "cap_remote_update", supportStatus: "planned", maturity: "assumption", confidence: "low", evidenceIds: [], bdCaveat: "Future roadmap only.", notes: "Depends on controller resource margin." },
    { id: "claim_product_2_diag", variantId: "var_product_2_b2", capabilityId: "cap_diag", supportStatus: "supported", maturity: "verified", confidence: "high", evidenceIds: ["ev_diag_test_014"], bdCaveat: "", notes: "Good candidate for Block 2 include." },
    { id: "claim_product_25_diag", variantId: "var_product_25_b25", capabilityId: "cap_diag", supportStatus: "supported", maturity: "verified", confidence: "high", evidenceIds: ["ev_diag_test_014"], bdCaveat: "", notes: "Shared with Product 2.0." },
    { id: "claim_product_3_performance", variantId: "var_product_3_b3", capabilityId: "cap_performance_envelope", supportStatus: "planned", maturity: "unknown", confidence: "low", evidenceIds: [], bdCaveat: "Do not promise.", notes: "Planned architecture not assessed for data throughput." },
    { id: "claim_product_1_power", variantId: "var_product_1_b1", capabilityId: "cap_input_power", supportStatus: "supported", maturity: "verified", confidence: "high", evidenceIds: [], bdCaveat: "", notes: "28VDC input envelope." },
    { id: "claim_product_2_power", variantId: "var_product_2_b2", capabilityId: "cap_input_power", supportStatus: "supported", maturity: "verified", confidence: "high", evidenceIds: [], bdCaveat: "", notes: "40VDC input envelope." },
  ];
  p.gaps = [
    { id: "gap_remote_update", title: "Remote Update Verification Gap", targetCapabilityId: "cap_remote_update", variantId: "var_product_1_b1", description: "Current baseline has only demonstrated a manual update workflow; target requires verified remote update support.", severity: "high", businessImpact: "Blocks target segment claim.", technicalImpact: "controller, subsystem interface, verification campaign.", gapType: "true design gap" },
    { id: "gap_performance_evidence", title: "Performance Evidence Gap", targetCapabilityId: "cap_performance_envelope", variantId: "var_product_2_b2", description: "Performance envelope is analysis-only and not verified on target hardware.", severity: "medium", businessImpact: "Target segment proposal caveat.", technicalImpact: "Subsystem model, verification test, supplier quote.", gapType: "evidence gap" },
  ];
  p.roadmapCandidates = [
    { id: "rc_048", name: "Secure Update Enablement", description: "Enable secure remote update workflow for planned products.", driver: "Remote update gap", targetProductId: "prod_product_3", gapIds: ["gap_remote_update"], businessValue: "high", effort: "L", riskLevel: "high", scheduleDrivers: "Integration lab availability", assumptions: "Assumes existing controller has sufficient memory and security hooks.", decisionStatus: "study" },
    { id: "rc_051", name: "Automated Fault Isolation Matrix", description: "Add field diagnostic decision matrix.", driver: "Reduce MTTR and support burden", targetProductId: "prod_product_25", gapIds: [], businessValue: "medium", effort: "M", riskLevel: "low", scheduleDrivers: "Test equipment scripting", assumptions: "Assumes existing telemetry is sufficient.", decisionStatus: "include" },
  ];
  p.designElements = [
    { id: "de_control_module", name: "Control Module", type: "firmware", owner: "Firmware", description: "Primary control and processing module." },
    { id: "de_diag", name: "Diagnostic Service", type: "software", owner: "Software", description: "Built-in-test and fault isolation service." },
  ];
  p.impactAssessments = [
    { id: "imp_001", roadmapCandidateId: "rc_048", designElementId: "de_control_module", impactType: "resource margin", severity: "major redesign", confidence: "low", owner: "Firmware", effort: "L-XL", scheduleDriver: "controller utilization estimate", verificationConsequence: "New regression and verification demo required.", riskConsequence: "May force hardware respin.", basis: "SME judgment from similar effort." },
  ];
  p.assumptions = [
    { id: "asm_001", statement: "Existing controller has enough margin for secure update hooks.", relatedId: "rc_048", confidence: "low", owner: "Firmware", validationPlan: "Complete utilization estimate.", consequenceIfFalse: "Candidate may require HW Rev D." },
  ];
  return p;
}

function normalizeProject(project) {
  const base = blankProject();
  const normalized = { ...base, ...project, project: { ...base.project, ...(project.project || {}) } };
  for (const key of Object.keys(base)) {
    if (Array.isArray(base[key]) && !Array.isArray(normalized[key])) normalized[key] = [];
  }
  normalized.viewSettings = normalized.viewSettings || {};
  normalized.schemaVersion = normalized.schemaVersion || SCHEMA_VERSION;
  return normalized;
}

function setProject(project, message) {
  state.project = normalizeProject(project);
  state.loadedAt = new Date();
  state.lastExportedAt = null;
  state.dirty = false;
  state.view = "dashboard";
  $("#landing").classList.add("hidden");
  $("#app").classList.remove("hidden");
  render();
  toast(message);
}

function markDirty() {
  state.dirty = true;
  state.project.project.updatedAt = nowIso();
  renderShell();
}

function render() {
  if (!state.project) return;
  renderShell();
  renderNav();
  const renderers = {
    dashboard: renderDashboard,
    products: renderProducts,
    matrix: renderCapabilities,
    gaps: renderGaps,
    candidates: renderCandidates,
    impacts: renderImpacts,
    evidence: renderEvidence,
    decisions: renderAssumptions,
    reports: renderReports,
    settings: renderSettings,
  };
  $("#content").innerHTML = renderers[state.view]();
  bindContentActions();
}

function renderShell() {
  $("#projectName").textContent = state.project.project.name;
  $("#schemaLabel").textContent = `Schema v${state.project.schemaVersion}`;
  $("#dataMarking").textContent = state.project.project.dataMarking || "Unmarked";
  $("#projectMeta").textContent = [
    state.dirty ? "Unsaved changes" : "No unsaved changes",
    `Loaded ${fmtDate(state.loadedAt)}`,
    state.lastExportedAt ? `Exported ${fmtDate(state.lastExportedAt)}` : null,
  ].filter(Boolean).join(" | ");
}

function renderNav() {
  $("#nav").innerHTML = navItems.map(([id, label, icon]) => `
    <button class="${state.view === id ? "active" : ""}" data-view="${id}">
      <span class="nav-icon nav-symbol nav-${icon}"></span><span>${label}</span>
    </button>
  `).join("");
}

function pageHeader(titleText, description, actionHtml = "") {
  return `
    <header class="page-header">
      <div><h1>${esc(titleText)}</h1>${description ? `<p>${esc(description)}</p>` : ""}</div>
      <div class="toolbar">${actionHtml}</div>
    </header>
  `;
}

function metric(label, value, note = "") {
  return `<article class="card"><div class="metric-label">${esc(label)}</div><div class="metric-value">${esc(value)}</div><div class="metric-note">${esc(note)}</div></article>`;
}

function renderDashboard() {
  const p = state.project;
  const currentVariants = p.variants.filter((v) => ["current", "supported", "planned"].includes(String(v.status).toLowerCase())).length;
  return `
    ${pageHeader("Product-Line Dashboard", "Current product-line health, evidence maturity, top gaps, and roadmap decision pressure.")}
    <section class="summary-grid dashboard-metrics">
      ${metric("Products", p.products.length, `${currentVariants} active/supported/planned variants`)}
      ${metric("Open Gaps", p.gaps.length, `${p.gaps.filter((g) => g.severity === "high").length} high severity`)}
    </section>
    <section class="grid-two dashboard-split">
      <article class="card">
        <h2 class="section-title">Top Variation Gaps</h2>
        <div class="list">
          ${p.gaps.slice(0, 5).map((g) => `<div class="list-item"><div><strong>${esc(g.title || g.description)}</strong><span>${esc(capabilityName(g.targetCapabilityId))} against ${esc(productNameForVariant(g.variantId))}</span></div>${badge(g.severity)}</div>`).join("") || empty("No gaps captured.")}
        </div>
      </article>
      <article class="card">
        <h2 class="section-title">Evidence Maturity</h2>
        ${smallTable(["Maturity", "Claims"], countBy(p.capabilityClaims, "maturity").map(([k, v]) => [badge(k), v]))}
      </article>
    </section>
    ${productRoadmapSection()}
  `;
}

function renderProducts() {
  const p = state.project;
  return `
    ${pageHeader("Products", "", `<button class="btn primary" data-add="product">Add Product</button>`)}
    <section class="filters compact-filters">
      <div class="filter">
        <label>Lifecycle Status</label>
        <select data-product-filter>
          <option value="">All</option>
          <option value="retired">Retired</option>
          <option value="current">Current</option>
          <option value="planned">Planned</option>
        </select>
      </div>
    </section>
    ${productTable(p.products)}
    ${productRoadmapSection()}
  `;
}

function productRoadmapSection() {
  const lanes = [
    ["retired", "Retired"],
    ["current", "Active Primary"],
    ["planned", "Planned / Future"],
  ];
  return `
    <section class="baseline-roadmap">
      <h2 class="section-title">Product Roadmap</h2>
      <div class="roadmap-board">
        ${lanes.map(([status, label]) => `
          <div class="roadmap-lane">
            <div class="roadmap-lane-title">${esc(label)}</div>
            <div class="roadmap-lane-body">
              ${state.project.products.filter((product) => String(product.status).toLowerCase() === status).map((product) => roadmapNode(product)).join("") || `<div class="roadmap-empty">No products</div>`}
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function roadmapNode(product) {
  const variants = productVariants(product.id);
  const variantIds = variants.map((variant) => variant.id);
  const claims = state.project.capabilityClaims.filter((claim) => variantIds.includes(claim.variantId));
  const verified = claims.filter((claim) => claim.maturity === "verified").length;
  const readiness = claims.length ? Math.round((verified / claims.length) * 100) : 0;
  const successor = byId(state.project.products, product.successorProductId);
  return `
    <button class="roadmap-node ${successor ? "has-successor" : ""}" data-detail="product:${product.id}" ${successor ? `data-successor="${esc(successor.name)}"` : ""}>
      <strong>${esc(product.name)}</strong>
      <span>${esc(variants[0]?.name || "Product")} ${esc(variants[0]?.block || "")}</span>
      <div>${badge(product.status)} <span class="roadmap-readiness">${readiness}%</span></div>
      ${successor ? `<span class="roadmap-successor">Successor → ${esc(successor.name)}</span>` : ""}
    </button>
  `;
}

function productTable(products) {
  if (!products.length) return `<div class="table-wrap">${empty("No products yet. Add a product to start the product line.")}</div>`;
  return `
    <div class="table-wrap product-table-wrap">
      <table class="product-table">
        <thead><tr><th>Product</th><th>Lifecycle</th><th>Successor</th><th>Notes</th></tr></thead>
        <tbody>
          ${products.map((product) => `<tr class="clickable-row" data-row-detail="product:${product.id}" data-product-status="${esc(product.status)}">
            <td><strong>${esc(product.name)}</strong><br><span class="muted">${esc(product.description || "No description captured")}</span></td>
            <td>${badge(product.status)}</td>
            <td>${esc(byId(state.project.products, product.successorProductId)?.name || "None")}</td>
            <td>${esc(product.notes || "-")}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCapabilities() {
  const p = state.project;
  const selectedProductId = selectedCapabilityProductId();
  const selectedProduct = byId(p.products, selectedProductId);
  const categories = [...new Set(p.capabilities.map((cap) => cap.category).filter(Boolean))];
  return `
    ${pageHeader("Variation Points", "Track product differences across capabilities, constraints, interfaces, and operating envelopes.", `<button class="btn primary" data-add="capability">Add Variation Point</button>`)}
    <section class="filters capability-filters">
      <div class="filter">
        <label>Product Focus</label>
        <select data-capability-product>
          ${p.products.map((product) => `<option value="${esc(product.id)}" ${product.id === selectedProductId ? "selected" : ""}>${esc(product.name)}</option>`).join("")}
        </select>
      </div>
      <div class="filter">
        <label>Variation Type</label>
        <select data-capability-filter="category">
          <option value="">All</option>
          ${categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join("")}
        </select>
      </div>
      <div class="filter">
        <label>Evidence</label>
        <select data-capability-filter="maturity">
          <option value="">All</option>
          <option value="verified">Verified</option>
          <option value="demonstrated">Demonstrated</option>
          <option value="analysis">Analysis</option>
          <option value="simulation">Simulation</option>
          <option value="assumption">Assumption</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
      <div class="filter">
        <label>Claim Status</label>
        <select data-capability-filter="claimability">
          <option value="">All</option>
          <option value="claimable">Claimable</option>
          <option value="caveat">Caveat</option>
          <option value="not-claimable">Not Claimable</option>
        </select>
      </div>
    </section>
    <div class="table-wrap capability-page-table">
      <table class="capability-table">
        <thead><tr><th>Variation Point</th><th>Type</th><th>${esc(selectedProduct?.name || "Product")} Status</th><th>Evidence Maturity</th><th>Claim Status</th></tr></thead>
        <tbody>
          ${p.capabilities.map((cap) => {
            const claim = claimForProductCapability(selectedProductId, cap.id);
            return `<tr class="clickable-row" data-row-detail="capability:${cap.id}" data-capability-category="${esc(cap.category || "")}" data-capability-maturity="${esc(claim?.maturity || "unknown")}" data-capability-claimability="${esc(claimability(claim))}">
              <td><strong>${esc(cap.name)}</strong><br><span class="muted">${esc(cap.description || "No description captured")}</span></td>
              <td>${esc(cap.category || "-")}</td>
              <td>${badge(claim?.supportStatus || "unknown")}</td>
              <td>${badge(claim?.maturity || "unknown")}</td>
              <td>${badge(claimabilityLabel(claim))}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderGaps() {
  const p = state.project;
  const targetNeedIds = [...new Set(p.gaps.map((gap) => gap.targetCapabilityId).filter(Boolean))];
  const comparedProductIds = [...new Set(p.gaps.map((gap) => byId(p.variants, gap.variantId)?.productId).filter(Boolean))];
  return `
    ${pageHeader("Gap Analysis", "Define target needs, compare selected products against them, and separate true design gaps from evidence gaps.", `<button class="btn secondary" data-add="targetNeed">Add Target Need</button><button class="btn primary" data-add="gap">Add Gap</button>`)}
    <section class="analysis-setup">
      <div>
        <span class="setup-kicker">Target Analysis Setup</span>
        <h2>What need are we trying to satisfy?</h2>
        <p>Use target needs to state the future capability, customer requirement, market expectation, or block objective. Each gap below compares one target need against one or more selected products.</p>
      </div>
      <div class="setup-grid">
        <article>
          <span>Target Needs In This Analysis</span>
          <strong>${esc(targetNeedIds.length || "None")}</strong>
          <small>${esc(targetNeedIds.map((id) => capabilityName(id)).join(", ") || "Add a target need or create a gap to begin.")}</small>
        </article>
        <article>
          <span>Products Being Compared</span>
          <strong>${esc(comparedProductIds.length || "None")}</strong>
          <small>${esc(comparedProductIds.map((id) => productName(id)).join(", ") || "Select products affected by each gap.")}</small>
        </article>
        <article>
          <span>How To Classify</span>
          <strong>Design or Evidence</strong>
          <small>Design gaps need product change; evidence gaps need proof before making the claim.</small>
        </article>
      </div>
    </section>
    <section class="summary-grid">
      ${metric("Design Gaps", p.gaps.filter((g) => g.gapType === "true design gap").length, "Require product change")}
      ${metric("Evidence Gaps", p.gaps.filter((g) => g.gapType === "evidence gap").length, "Require proof before claim")}
      ${metric("High Severity", p.gaps.filter((g) => g.severity === "high").length, "Potential blockers")}
    </section>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Gap</th><th>Target Need / Capability</th><th>Compared Product</th><th>Closing Candidate</th><th>Severity</th><th>Gap Type</th><th>Business Impact</th><th>Technical Impact</th></tr></thead>
        <tbody>
          ${p.gaps.map((g) => `<tr class="clickable-row" data-row-detail="gap:${g.id}">
            <td><strong>${esc(g.title || g.description)}</strong><br><span class="muted">${esc(g.description || "")}</span></td>
            <td>${esc(capabilityName(g.targetCapabilityId))}</td>
            <td>${esc(productNameForVariant(g.variantId))}</td>
            <td>${esc(closingCandidateNamesForGap(g.id))}</td>
            <td>${badge(g.severity)}</td>
            <td>${badge(g.gapType)}</td>
            <td>${esc(g.businessImpact)}</td>
            <td>${esc(g.technicalImpact)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCandidates() {
  const p = state.project;
  return `
    ${pageHeader("Roadmap Candidates", "Potential upgrades, value, risk, assumptions, and product targets.", `<button class="btn primary" data-add="candidate">Add Candidate</button>`)}
    <section class="summary-grid">
      ${metric("Total", p.roadmapCandidates.length, "Candidates")}
      ${metric("Include", p.roadmapCandidates.filter((c) => c.decisionStatus === "include").length, "Fund / plan now")}
      ${metric("Study", p.roadmapCandidates.filter((c) => c.decisionStatus === "study").length, "Needs evidence")}
      ${metric("Deferred", p.roadmapCandidates.filter((c) => c.decisionStatus === "defer").length, "Preserved rationale")}
    </section>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Product</th><th>Driver</th><th>Gap Closed</th><th>Value</th><th>Effort</th><th>Risk</th><th>Confidence</th><th>Status</th></tr></thead>
        <tbody>
          ${p.roadmapCandidates.map((c) => `<tr class="clickable-row" data-row-detail="candidate:${c.id}">
            <td><strong>${esc(c.name)}</strong></td>
            <td>${esc(candidateProductName(c))}</td>
            <td>${esc(c.driver)}</td>
            <td>${esc(idsToNames(c.gapIds, p.gaps, "No linked gap"))}</td>
            <td>${badge(c.businessValue)}</td>
            <td>${badge(c.effort)}</td>
            <td>${badge(c.riskLevel === "high" ? "high risk" : c.riskLevel)}</td>
            <td>${esc(candidateConfidence(c.id))}</td>
            <td>${badge(c.decisionStatus)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderImpacts() {
  const p = state.project;
  return `
    ${pageHeader("Impact Analysis", "Blast radius by design element, owner, estimate range, schedule driver, and verification consequence.", `<button class="btn primary" data-add="impact">Add Impact</button>`)}
    ${table(["Candidate", "Impacted Item", "Type", "Severity", "Confidence", "Owner", "Effort", "Schedule Driver", "Verification Consequence", "Basis"], p.impactAssessments.map((i) => [
      esc(candidateName(i.roadmapCandidateId)),
      `<button class="link-button" data-detail="impact:${i.id}">${esc(designElementName(i.designElementId))}</button>`,
      esc(i.impactType),
      badge(i.severity),
      badge(i.confidence),
      esc(i.owner),
      badge(i.effort),
      esc(i.scheduleDriver),
      esc(i.verificationConsequence),
      esc(i.basis),
    ]))}
  `;
}

function renderEvidence() {
  const p = state.project;
  return `
    ${pageHeader("Evidence & Maturity", "Evidence library and claim traceability to prevent unsupported or overconfident capability claims.", `<button class="btn primary" data-add="evidence">Add Evidence</button>`)}
    <div class="table-wrap">
      <table>
        <thead><tr><th>Evidence</th><th>Type</th><th>Applies To</th><th>Confidence</th><th>Reference</th><th>Linked Claims</th><th>Summary</th></tr></thead>
        <tbody>
          ${p.evidence.map((e) => `<tr class="clickable-row" data-row-detail="evidence:${e.id}">
            <td><strong>${esc(e.title)}</strong></td>
            <td>${badge(e.type)}</td>
            <td>${esc(productName(e.appliesTo) || e.appliesTo)}</td>
            <td>${badge(e.confidence)}</td>
            <td>${esc(e.reference)}</td>
            <td>${p.capabilityClaims.filter((c) => (c.evidenceIds || []).includes(e.id)).length}</td>
            <td>${esc(e.summary)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAssumptions() {
  const p = state.project;
  return `
    ${pageHeader("Assumptions", "Track assumptions, validation plans, and consequences if assumptions prove false.", `<button class="btn primary" data-add="assumption">Add Assumption</button>`)}
    ${table(["Statement", "Related", "Confidence", "Owner", "Validation Plan", "Consequence If False"], p.assumptions.map((a) => [
      `<button class="link-button" data-detail="assumption:${a.id}">${esc(a.statement)}</button>`,
      esc(a.relatedId),
      badge(a.confidence),
      esc(a.owner),
      esc(a.validationPlan),
      esc(a.consequenceIfFalse),
    ]))}
  `;
}

function renderReports() {
  return `
    ${pageHeader("Reports / Exports", "Generate audience-oriented local files.")}
    <section class="grid-two">
      ${reportCard("Management Summary", "Capability summary, candidate trade space, high risks, assumptions, and recommendations.", "management")}
      ${reportCard("Engineering Impact View", "Impacted design elements, owners, schedule drivers, verification consequences, and basis of estimate.", "engineering")}
      ${reportCard("Claim-Safe Capability View", "What can be claimed, what is planned, and what should not be promised yet.", "bd")}
      ${reportCard("Full JSON Snapshot", "Portable project file using the flat schema from the plan.", "project")}
    </section>
  `;
}

function renderSettings() {
  const p = state.project.project;
  return `
    ${pageHeader("Project Settings", "Project metadata, source-of-truth discipline, marking, and snapshot notes.")}
    <form id="settingsForm" class="card form-grid">
      ${input("name", "Project Name", p.name)}
      ${input("ownerRole", "Owner Role", p.ownerRole)}
      ${input("dataMarking", "Data Marking", p.dataMarking)}
      ${textarea("snapshotNotes", "Snapshot Notes", p.snapshotNotes)}
      <button class="btn primary" type="submit">Save Settings</button>
    </form>
  `;
}

function table(headers, rows) {
  if (!rows.length) return `<div class="table-wrap">${empty("No records yet.")}</div>`;
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function smallTable(headers, rows) {
  return table(headers, rows.map((r) => r.map(String)));
}

function reportCard(name, description, type) {
  return `<article class="card"><h2 class="section-title">${esc(name)}</h2><p>${esc(description)}</p><button class="btn primary" data-report="${type}">Export ${esc(name)}</button></article>`;
}

function empty(message) {
  return `<div class="muted" style="padding: 12px;">${esc(message)}</div>`;
}

function countBy(items, key) {
  const counts = items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts);
}

function productName(id) { return byId(state.project.products, id)?.name || ""; }
function productVariants(productId) { return state.project.variants.filter((variant) => variant.productId === productId); }
function capabilityName(id) { return byId(state.project.capabilities, id)?.name || id || "Unknown variation point"; }
function variantName(id) {
  const v = byId(state.project.variants, id);
  if (!v) return id || "Unknown variant";
  return `${productName(v.productId)} ${v.name} ${v.block}`.trim();
}
function productNameForVariant(variantId) {
  const variant = byId(state.project.variants, variantId);
  return productName(variant?.productId) || variantId || "Unknown product";
}
function candidateName(id) { return byId(state.project.roadmapCandidates, id)?.name || id || "Unknown candidate"; }
function designElementName(id) { return byId(state.project.designElements, id)?.name || id || "Unknown design element"; }
function candidateProductName(candidate) {
  const product = byId(state.project.products, candidate.targetProductId);
  if (product) return product.name;
  const variant = byId(state.project.variants, candidate.affectedVariantIds?.[0]);
  return productName(variant?.productId) || candidate.targetBlock || "No product selected";
}
function idsToNames(ids, collection, fallback = "None") {
  const names = (ids || []).map((id) => byId(collection, id)?.name || byId(collection, id)?.title || id);
  return names.length ? names.join(", ") : fallback;
}
function candidatesForGap(gapId) {
  return state.project.roadmapCandidates.filter((candidate) => (candidate.gapIds || []).includes(gapId));
}
function candidateForGap(gapId) {
  return candidatesForGap(gapId)[0];
}
function closingCandidateNamesForGap(gapId) {
  const names = candidatesForGap(gapId).map((candidate) => candidate.name);
  return names.length ? names.join(", ") : "None linked";
}
function assignCandidateToGap(candidateId, gapId) {
  state.project.roadmapCandidates.forEach((candidate) => {
    candidate.gapIds = (candidate.gapIds || []).filter((id) => id !== gapId);
  });
  if (!candidateId) return;
  const candidate = byId(state.project.roadmapCandidates, candidateId);
  if (!candidate) return;
  candidate.gapIds = [gapId];
}
function primaryGapForCandidate(candidate) {
  return byId(state.project.gaps, candidate?.gapIds?.[0]);
}
function variationTraceGraphic({ gap, candidate } = {}) {
  const resolvedGap = gap || primaryGapForCandidate(candidate);
  const resolvedCandidate = candidate || candidatesForGap(resolvedGap?.id).find(Boolean);
  const variation = byId(state.project.capabilities, resolvedGap?.targetCapabilityId);
  const product = byId(state.project.products, resolvedCandidate?.targetProductId);
  const candidates = resolvedGap ? candidatesForGap(resolvedGap.id) : [];
  const candidateNodes = resolvedCandidate
    ? [resolvedCandidate]
    : candidates;
  return `
    <section class="drawer-section">
      <h3>Closure Trace</h3>
      <div class="trace-flow">
        <div class="trace-node trace-source">
          <span>Variation Point</span>
          <strong>${esc(variation?.name || "No variation point linked")}</strong>
          <small>${esc(variation?.category || "Capability / constraint / envelope")}</small>
        </div>
        <div class="trace-arrow">→</div>
        <div class="trace-node trace-gap">
          <span>Gap</span>
          <strong>${esc(resolvedGap?.title || resolvedGap?.description || "No gap linked")}</strong>
          <small>${resolvedGap ? `${badge(resolvedGap.severity)} ${badge(resolvedGap.gapType)}` : "Select a gap to build the trace"}</small>
        </div>
        <div class="trace-arrow">→</div>
        <div class="trace-node trace-candidate">
          <span>Roadmap Candidate</span>
          ${candidateNodes.length ? candidateNodes.map((item) => `<strong>${esc(item.name)}</strong><small>${esc(candidateProductName(item))}${item.decisionStatus ? ` · ${esc(title(item.decisionStatus))}` : ""}</small>`).join("") : "<strong>No closing candidate linked</strong><small>Select this gap in a roadmap candidate to close the loop.</small>"}
          ${product ? `<small>Target product: ${esc(product.name)}</small>` : ""}
        </div>
      </div>
    </section>
  `;
}
function candidateConfidence(id) {
  const impacts = state.project.impactAssessments.filter((i) => i.roadmapCandidateId === id);
  if (!impacts.length) return "No impact basis";
  if (impacts.some((i) => i.confidence === "low")) return "Low";
  if (impacts.some((i) => i.confidence === "medium")) return "Medium";
  return "High";
}
function productClaims(productId) {
  const variantIds = productVariants(productId).map((variant) => variant.id);
  return state.project.capabilityClaims.filter((claim) => variantIds.includes(claim.variantId));
}
function productSupportedCapabilities(productId) {
  return productClaims(productId).map((claim) => ({ claim, capability: byId(state.project.capabilities, claim.capabilityId) })).filter((item) => item.capability);
}
function selectedCapabilityProductId() {
  const savedId = state.project.viewSettings?.capabilityProductId;
  return byId(state.project.products, savedId)?.id || state.project.products[0]?.id || "";
}
function primaryVariantForProduct(productId) {
  let variant = productVariants(productId)[0];
  if (!variant) {
    const product = byId(state.project.products, productId);
    variant = {
      id: makeId("var"),
      productId,
      name: "Default Baseline",
      block: product?.name || "Product Baseline",
      hardwareRevision: "",
      softwareVersion: "",
      status: product?.status || "planned",
      configurationNotes: "Created automatically for product-level linking.",
    };
    state.project.variants.push(variant);
  }
  return variant;
}
function claimForProductCapability(productId, capabilityId) {
  const variantIds = productVariants(productId).map((variant) => variant.id);
  return state.project.capabilityClaims.find((claim) => variantIds.includes(claim.variantId) && claim.capabilityId === capabilityId);
}
function productIdsForCapability(capabilityId) {
  return state.project.products.filter((product) => claimForProductCapability(product.id, capabilityId)).map((product) => product.id);
}
function claimability(claim) {
  if (!claim || claim.supportStatus === "not supported" || claim.supportStatus === "unknown") return "not-claimable";
  if (claim.bdCaveat || ["planned", "partial"].includes(claim.supportStatus) || ["simulation", "assumption", "unknown"].includes(claim.maturity)) return "caveat";
  return "claimable";
}
function claimabilityLabel(claim) {
  const value = claimability(claim);
  if (value === "claimable") return "claimable";
  if (value === "caveat") return "claimable with caveat";
  return "not claimable";
}
function capabilityEvidenceSummary(capabilityId) {
  const evidenceIds = state.project.capabilityClaims.filter((claim) => claim.capabilityId === capabilityId).flatMap((claim) => claim.evidenceIds || []);
  const uniqueEvidence = new Set(evidenceIds);
  return uniqueEvidence.size ? `${uniqueEvidence.size} evidence item${uniqueEvidence.size === 1 ? "" : "s"}` : "No linked evidence";
}

function bindContentActions() {
  $("#content").querySelectorAll("[data-detail]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    openDetail(button.dataset.detail);
  }));
  $("#content").querySelectorAll("[data-row-detail]").forEach((row) => row.addEventListener("click", () => openDetail(row.dataset.rowDetail)));
  $("#content").querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => openAdd(button.dataset.add)));
  $("#content").querySelectorAll("[data-report]").forEach((button) => button.addEventListener("click", () => exportReport(button.dataset.report)));
  $("#content").querySelectorAll("[data-product-filter]").forEach((selectEl) => {
    selectEl.addEventListener("change", () => {
      $("#content").querySelectorAll("[data-product-status]").forEach((row) => {
        row.hidden = selectEl.value && row.dataset.productStatus !== selectEl.value;
      });
    });
  });
  $("#content").querySelectorAll("[data-capability-product]").forEach((selectEl) => {
    selectEl.addEventListener("change", () => {
      state.project.viewSettings.capabilityProductId = selectEl.value;
      render();
    });
  });
  $("#content").querySelectorAll("[data-capability-filter]").forEach((selectEl) => selectEl.addEventListener("change", applyCapabilityFilters));
  const settings = $("#settingsForm");
  if (settings) {
    settings.addEventListener("submit", (event) => {
      event.preventDefault();
      Object.assign(state.project.project, Object.fromEntries(new FormData(settings).entries()));
      markDirty();
      render();
      toast("Project settings saved.");
    });
  }
}

function applyCapabilityFilters() {
  const filters = {};
  $("#content").querySelectorAll("[data-capability-filter]").forEach((selectEl) => {
    filters[selectEl.dataset.capabilityFilter] = selectEl.value;
  });
  $("#content").querySelectorAll("[data-capability-category]").forEach((row) => {
    row.hidden = Boolean(
      (filters.category && row.dataset.capabilityCategory !== filters.category) ||
      (filters.maturity && row.dataset.capabilityMaturity !== filters.maturity) ||
      (filters.claimability && row.dataset.capabilityClaimability !== filters.claimability)
    );
  });
}

function openDetail(token) {
  const [type, id] = token.split(":");
  if (type === "product") return openProductDrawer(byId(state.project.products, id), false);
  if (type === "capability") return openCapabilityDrawer(byId(state.project.capabilities, id), false);
  if (type === "gap") return openGapDrawer(byId(state.project.gaps, id), false);
  if (type === "candidate") return openCandidateDrawer(byId(state.project.roadmapCandidates, id), false);
  const map = {
    variant: ["Variant", state.project.variants, variantFields()],
    claim: ["Capability Claim", state.project.capabilityClaims, claimFields()],
    impact: ["Impact", state.project.impactAssessments, impactFields()],
    evidence: ["Evidence", state.project.evidence, evidenceFields()],
    decision: ["Decision", state.project.decisions, decisionFields()],
    assumption: ["Assumption", state.project.assumptions, assumptionFields()],
  };
  const [label, collection, fields, normalize] = map[type] || [];
  const record = byId(collection, id);
  if (!record) return;
  openForm(label, record.name || record.title || record.id, record, fields, (values) => {
    Object.assign(record, normalize ? normalize(values) : values);
    markDirty();
    render();
    closeDrawer();
    toast(`${label} updated.`);
  });
}

function openAdd(type) {
  if (type === "product") return openProductDrawer({ id: makeId("prod"), name: "New Product", status: "planned", description: "", notes: "", successorProductId: "" }, true);
  if (type === "capability") return openCapabilityDrawer({ id: makeId("cap"), name: "New Variation Point", category: "", description: "" }, true);
  if (type === "targetNeed") return openCapabilityDrawer({ id: makeId("cap"), name: "New Target Need", category: "", description: "" }, true, "Target Need");
  if (type === "gap") return openGapDrawer({ id: makeId("gap"), title: "New Gap", targetCapabilityId: state.project.capabilities[0]?.id || "", variantId: state.project.variants[0]?.id || "", description: "", severity: "medium", businessImpact: "", technicalImpact: "", gapType: "evidence gap" }, true);
  if (type === "candidate") return openCandidateDrawer({ id: makeId("rc"), name: "New Roadmap Candidate", decisionStatus: "study", effort: "M", riskLevel: "medium", targetProductId: state.project.products[0]?.id || "", gapIds: [] }, true);
  const map = {
    variant: ["Variant", state.project.variants, variantFields(), { id: makeId("var"), productId: state.project.products[0]?.id || "", name: "New Variant", block: "Block TBD", status: "planned" }],
    impact: ["Impact", state.project.impactAssessments, impactFields(), { id: makeId("imp"), severity: "medium", confidence: "low" }],
    evidence: ["Evidence", state.project.evidence, evidenceFields(), { id: makeId("ev"), title: "New Evidence", type: "analysis", confidence: "medium", appliesTo: state.project.products[0]?.id || "" }],
    assumption: ["Assumption", state.project.assumptions, assumptionFields(), { id: makeId("asm"), confidence: "medium" }],
  };
  const [label, collection, fields, record, normalize] = map[type];
  openForm(`Add ${label}`, record.name || record.title || record.id, record, fields, (values) => {
    collection.push({ ...record, ...(normalize ? normalize(values) : values) });
    markDirty();
    render();
    closeDrawer();
    toast(`${label} added.`);
  });
}

function openGapDrawer(gap, isNew) {
  if (!gap) return;
  const currentVariant = byId(state.project.variants, gap.variantId);
  const currentProductId = currentVariant?.productId || state.project.products[0]?.id || "";
  const linkedCandidate = candidateForGap(gap.id);
  $("#drawerKicker").innerHTML = `${badge(gap.severity || "medium")} <span class="drawer-type">Gap</span>`;
  $("#drawerTitle").textContent = gap.title || gap.description || "New Gap";
  $("#drawerBody").innerHTML = `
    <form id="drawerForm" class="product-drawer-form">
      <section class="drawer-section">
        <h3>Target Need And Comparison</h3>
        <div class="form-grid">
          ${capabilitySelect("targetCapabilityId", "Target Need / Capability", gap.targetCapabilityId)}
          ${productCheckboxes("productIds", "Products To Compare Against This Need", [currentProductId])}
        </div>
      </section>
      <section class="drawer-section">
        <h3>Observed Gap</h3>
        <div class="form-grid">
          ${input("title", "Gap Title", gap.title || "")}
          ${textarea("description", "Gap Description", gap.description)}
          ${select("severity", "Severity", ["low", "medium", "high"], gap.severity || "medium")}
          ${select("gapType", "Gap Type", ["true design gap", "evidence gap", "unknown"], gap.gapType || "evidence gap")}
          ${candidateSelect("closingCandidateId", "Roadmap Candidate Addressing This Gap", linkedCandidate?.id || "", gap.id)}
          ${textarea("businessImpact", "Business Impact", gap.businessImpact)}
          ${textarea("technicalImpact", "Technical Impact", gap.technicalImpact)}
        </div>
      </section>
      ${isNew ? "" : variationTraceGraphic({ gap })}
    </form>
  `;
  $("#drawerFooter").innerHTML = `<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-gap">${isNew ? "Add Gap" : "Save Gap"}</button>`;
  $("#drawer").classList.add("open", "trace-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  $("#drawerFooter [data-action='save-gap']").addEventListener("click", () => {
    const form = $("#drawerForm");
    const values = Object.fromEntries(new FormData(form).entries());
    const selectedProductIds = new FormData(form).getAll("productIds");
    const productIds = selectedProductIds.length ? selectedProductIds : [currentProductId].filter(Boolean);
    const [primaryProductId, ...additionalProductIds] = productIds;
    const variant = primaryVariantForProduct(primaryProductId);
    Object.assign(gap, {
      title: values.title,
      description: values.description,
      targetCapabilityId: values.targetCapabilityId,
      variantId: variant.id,
      severity: values.severity,
      gapType: values.gapType,
      businessImpact: values.businessImpact,
      technicalImpact: values.technicalImpact,
    });
    if (isNew && !byId(state.project.gaps, gap.id)) state.project.gaps.push(gap);
    additionalProductIds.forEach((productId) => {
      const extraVariant = primaryVariantForProduct(productId);
      const exists = state.project.gaps.some((item) => item.id !== gap.id && item.targetCapabilityId === values.targetCapabilityId && item.variantId === extraVariant.id && (item.title || item.description) === (values.title || values.description));
      if (!exists) state.project.gaps.push({ ...gap, id: makeId("gap"), variantId: extraVariant.id });
    });
    assignCandidateToGap(values.closingCandidateId, gap.id);
    markDirty();
    render();
    closeDrawer();
    toast(isNew ? "Gap added." : "Gap updated.");
  });
}

function openProductDrawer(product, isNew) {
  if (!product) return;
  const supportedCapabilities = isNew ? [] : productSupportedCapabilities(product.id);
  $("#drawerKicker").innerHTML = `${badge(product.status || "planned")} <span class="drawer-type">Product</span>`;
  $("#drawerTitle").textContent = product.name || "New Product";
  $("#drawerBody").innerHTML = `
    <form id="drawerForm" class="product-drawer-form">
      <section class="drawer-section">
        <h3>Product Metadata</h3>
        <div class="form-grid">
          ${input("name", "Product Name", product.name)}
          ${select("status", "Lifecycle Status", ["retired", "current", "supported", "planned", "obsolete", "prototype"], product.status)}
          ${productSelect("successorProductId", "Successor Product", product.successorProductId || "", true, product.id)}
          ${textarea("description", "Description", product.description)}
          ${textarea("notes", "Planning Notes", product.notes)}
        </div>
      </section>
      <section class="drawer-section">
        <h3>Product Variation Points</h3>
        <ul class="drawer-list">
          ${supportedCapabilities.map(({ capability, claim }) => `<li><span>${esc(capability.name)}</span><span>${badge(claim.supportStatus)} ${badge(claim.maturity)}</span></li>`).join("") || "<li><span>No variation points linked to this product yet.</span></li>"}
        </ul>
      </section>
      <section class="drawer-section">
        <h3>Actions</h3>
        <div class="drawer-action-stack">
          <button class="btn secondary" type="button" data-jump-view="matrix" data-focus-product="${esc(product.id)}">View in Variation Points</button>
          <button class="btn primary" type="button" data-jump-view="gaps">Run Gap Analysis from This Product</button>
          <button class="btn secondary" type="button" data-jump-view="candidates">Create Upgrade Candidate</button>
        </div>
      </section>
    </form>
  `;
  $("#drawerFooter").innerHTML = `${isNew ? "" : `<button class="btn danger mr-auto" data-action="delete-product">Delete Product</button>`}<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-product">${isNew ? "Add Product" : "Save Product"}</button>`;
  $("#drawer").classList.add("open", "product-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  const deleteButton = $("#drawerFooter [data-action='delete-product']");
  if (deleteButton) deleteButton.addEventListener("click", () => {
    if (!confirm(`Delete ${product.name}? This will also remove linked variants, capability claims, and gaps for this product.`)) return;
    deleteProduct(product.id);
    markDirty();
    render();
    closeDrawer();
    toast("Product deleted.");
  });
  $("#drawerFooter [data-action='save-product']").addEventListener("click", () => {
    Object.assign(product, Object.fromEntries(new FormData($("#drawerForm")).entries()));
    if (isNew) state.project.products.push(product);
    markDirty();
    render();
    closeDrawer();
    toast(isNew ? "Product added." : "Product updated.");
  });
  $("#drawerBody").querySelectorAll("[data-jump-view]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.focusProduct) state.project.viewSettings.capabilityProductId = button.dataset.focusProduct;
      state.view = button.dataset.jumpView;
      render();
      closeDrawer();
    });
  });
}

function openCandidateDrawer(candidate, isNew) {
  if (!candidate) return;
  $("#drawerKicker").innerHTML = `${badge(candidate.decisionStatus || "study")} <span class="drawer-type">Roadmap Candidate</span>`;
  $("#drawerTitle").textContent = candidate.name || "New Roadmap Candidate";
  $("#drawerBody").innerHTML = `
    <form id="drawerForm" class="form-grid">
      ${candidateFields(candidate.id).map((field) => renderField(field, candidate[field.name] ?? (field.name === "gapId" ? candidate.gapIds?.[0] : ""))).join("")}
    </form>
    ${variationTraceGraphic({ candidate })}
  `;
  $("#drawerFooter").innerHTML = `<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-candidate">${isNew ? "Add Candidate" : "Save Candidate"}</button>`;
  $("#drawer").classList.add("open", "trace-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  $("#drawerFooter [data-action='save-candidate']").addEventListener("click", () => {
    const values = Object.fromEntries(new FormData($("#drawerForm")).entries());
    const normalized = normalizeCandidateForm(values);
    Object.assign(candidate, normalized);
    if (isNew && !byId(state.project.roadmapCandidates, candidate.id)) state.project.roadmapCandidates.push(candidate);
    if (normalized.gapIds[0]) assignCandidateToGap(candidate.id, normalized.gapIds[0]);
    markDirty();
    render();
    closeDrawer();
    toast(isNew ? "Roadmap candidate added." : "Roadmap candidate updated.");
  });
}

function openCapabilityDrawer(capability, isNew, contextLabel = "Variation Point") {
  if (!capability) return;
  const focusProductId = selectedCapabilityProductId();
  const focusProduct = byId(state.project.products, focusProductId);
  const focusClaim = isNew ? null : claimForProductCapability(focusProductId, capability.id);
  const linkedProductIds = isNew ? [] : productIdsForCapability(capability.id);
  const claims = isNew ? [] : state.project.capabilityClaims.filter((claim) => claim.capabilityId === capability.id);
  const gaps = isNew ? [] : state.project.gaps.filter((gap) => gap.targetCapabilityId === capability.id);
  $("#drawerKicker").innerHTML = `${badge(capability.category || contextLabel.toLowerCase())} <span class="drawer-type">${esc(contextLabel)}</span>`;
  $("#drawerTitle").textContent = capability.name || "New Variation Point";
  $("#drawerBody").innerHTML = `
    <form id="drawerForm" class="capability-drawer-form">
      <section class="drawer-section">
        <h3>${esc(contextLabel)} Definition</h3>
        <div class="form-grid">
          ${input("name", `${contextLabel} Name`, capability.name)}
          ${input("category", "Type", capability.category)}
          ${textarea("description", "Description", capability.description)}
        </div>
      </section>
      <section class="drawer-section status-panel">
        <h3>Product Support / Evidence Link</h3>
        <div class="support-link-grid">
          ${productCheckboxes("supportProductIds", `Products Associated With This ${contextLabel}`, linkedProductIds)}
          ${select("supportStatus", "Primary Status", ["supported", "partial", "not supported", "planned", "unknown"], focusClaim?.supportStatus || "unknown")}
          ${select("maturity", "Evidence Maturity", ["verified", "demonstrated", "analysis", "simulation", "assumption", "unknown"], focusClaim?.maturity || "unknown")}
          ${select("confidence", "Confidence", ["low", "medium", "high"], focusClaim?.confidence || "medium")}
        </div>
        <button class="btn primary full-width" type="button" data-action="save-support-link">Save Product Links</button>
      </section>
      <section class="drawer-section">
        <h3>Trace Summary</h3>
        <div class="summary-panel">
          <div><span>Claims</span><strong>${claims.length}</strong></div>
          <div><span>Open Gaps</span><strong>${gaps.length}</strong></div>
          <div><span>Evidence</span><strong>${esc(capabilityEvidenceSummary(capability.id))}</strong></div>
        </div>
      </section>
    </form>
  `;
  $("#drawerFooter").innerHTML = `${isNew ? "" : `<button class="btn danger mr-auto" data-action="delete-capability">Delete ${esc(contextLabel)}</button>`}<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-capability">${isNew ? `Add ${esc(contextLabel)}` : `Save ${esc(contextLabel)}`}</button>`;
  $("#drawer").classList.add("open", "capability-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  $("#drawerBody [data-action='save-support-link']").addEventListener("click", () => {
    const form = $("#drawerForm");
    const values = Object.fromEntries(new FormData(form).entries());
    Object.assign(capability, { name: values.name, category: values.category, description: values.description });
    if (isNew && !byId(state.project.capabilities, capability.id)) state.project.capabilities.push(capability);
    const selectedProductIds = new FormData(form).getAll("supportProductIds");
    state.project.products.forEach((product) => {
      const existingClaim = claimForProductCapability(product.id, capability.id);
      if (!selectedProductIds.includes(product.id)) {
        if (existingClaim) state.project.capabilityClaims = state.project.capabilityClaims.filter((claim) => claim.id !== existingClaim.id);
        return;
      }
      const variant = primaryVariantForProduct(product.id);
      let claim = state.project.capabilityClaims.find((item) => item.variantId === variant.id && item.capabilityId === capability.id);
      if (!claim) {
        claim = { id: makeId("claim"), variantId: variant.id, capabilityId: capability.id, evidenceIds: [], notes: "" };
        state.project.capabilityClaims.push(claim);
      }
      Object.assign(claim, { supportStatus: values.supportStatus, maturity: values.maturity, confidence: values.confidence });
    });
    state.project.viewSettings.capabilityProductId = selectedProductIds[0] || focusProductId;
    markDirty();
    render();
    openCapabilityDrawer(capability, false, contextLabel);
    toast(`${contextLabel} linked to product.`);
  });
  const deleteButton = $("#drawerFooter [data-action='delete-capability']");
  if (deleteButton) deleteButton.addEventListener("click", () => {
    if (!confirm(`Delete ${capability.name}? This will also remove linked claims, gaps, and target references.`)) return;
    deleteCapability(capability.id);
    markDirty();
    render();
    closeDrawer();
    toast(`${contextLabel} deleted.`);
  });
  $("#drawerFooter [data-action='save-capability']").addEventListener("click", () => {
    const values = Object.fromEntries(new FormData($("#drawerForm")).entries());
    Object.assign(capability, { name: values.name, category: values.category, description: values.description });
    if (isNew && !byId(state.project.capabilities, capability.id)) state.project.capabilities.push(capability);
    markDirty();
    render();
    closeDrawer();
    toast(isNew ? `${contextLabel} added.` : `${contextLabel} updated.`);
  });
}

function deleteProduct(productId) {
  const variantIds = state.project.variants.filter((variant) => variant.productId === productId).map((variant) => variant.id);
  const gapIds = state.project.gaps.filter((gap) => variantIds.includes(gap.variantId)).map((gap) => gap.id);
  state.project.products = state.project.products.filter((product) => product.id !== productId);
  state.project.products.forEach((product) => {
    if (product.successorProductId === productId) product.successorProductId = "";
  });
  state.project.variants = state.project.variants.filter((variant) => variant.productId !== productId);
  state.project.capabilityClaims = state.project.capabilityClaims.filter((claim) => !variantIds.includes(claim.variantId));
  state.project.gaps = state.project.gaps.filter((gap) => !variantIds.includes(gap.variantId));
  state.project.roadmapCandidates.forEach((candidate) => {
    candidate.gapIds = (candidate.gapIds || []).filter((id) => !gapIds.includes(id));
    if (candidate.targetProductId === productId) candidate.targetProductId = "";
  });
}

function deleteCapability(capabilityId) {
  const gapIds = state.project.gaps.filter((gap) => gap.targetCapabilityId === capabilityId).map((gap) => gap.id);
  state.project.capabilities = state.project.capabilities.filter((capability) => capability.id !== capabilityId);
  state.project.capabilityClaims = state.project.capabilityClaims.filter((claim) => claim.capabilityId !== capabilityId);
  state.project.gaps = state.project.gaps.filter((gap) => gap.targetCapabilityId !== capabilityId);
  state.project.roadmapCandidates.forEach((candidate) => {
    candidate.gapIds = (candidate.gapIds || []).filter((id) => !gapIds.includes(id));
  });
}

function normalizeCandidateForm(values) {
  return {
    name: values.name,
    description: values.description,
    driver: values.driver,
    targetProductId: values.targetProductId,
    gapIds: values.gapId ? [values.gapId] : [],
    businessValue: values.businessValue,
    effort: values.effort,
    riskLevel: values.riskLevel,
    scheduleDrivers: values.scheduleDrivers,
    assumptions: values.assumptions,
    decisionStatus: values.decisionStatus,
  };
}

function openForm(kicker, titleText, record, fields, onSave) {
  $("#drawerKicker").textContent = kicker;
  $("#drawerTitle").textContent = titleText;
  $("#drawerBody").innerHTML = `<form id="drawerForm" class="form-grid">${fields.map((f) => renderField(f, record[f.name] ?? (f.name === "gapId" ? record.gapIds?.[0] : ""))).join("")}</form>`;
  $("#drawerFooter").innerHTML = `<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-drawer">Save</button>`;
  $("#drawer").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  $("#drawerFooter [data-action='save-drawer']").addEventListener("click", () => {
    const values = Object.fromEntries(new FormData($("#drawerForm")).entries());
    fields.forEach((f) => {
      if (f.type === "ids") values[f.name] = String(values[f.name] || "").split(",").map((v) => v.trim()).filter(Boolean);
      if (f.type === "date" && !values[f.name]) values[f.name] = "";
    });
    onSave(values);
  });
}

function renderField(field, value) {
  if (field.type === "textarea") return textarea(field.name, field.label, value);
  if (field.type === "select") return select(field.name, field.label, field.options, value);
  if (field.type === "product") return productSelect(field.name, field.label, value);
  if (field.type === "gap") return gapSelect(field.name, field.label, value, field.currentCandidateId || "");
  if (field.type === "ids") return input(field.name, `${field.label} (comma-separated IDs)`, (value || []).join(", "));
  return input(field.name, field.label, value, field.type || "text");
}

function input(name, labelText, value = "", type = "text") {
  return `<label>${esc(labelText)}<input class="field" type="${esc(type)}" name="${esc(name)}" value="${esc(value)}"></label>`;
}
function textarea(name, labelText, value = "") {
  return `<label>${esc(labelText)}<textarea name="${esc(name)}">${esc(value)}</textarea></label>`;
}
function select(name, labelText, options, value = "") {
  return `<label>${esc(labelText)}<select name="${esc(name)}">${options.map((option) => `<option value="${esc(option)}" ${option === value ? "selected" : ""}>${esc(title(option))}</option>`).join("")}</select></label>`;
}
function productSelect(name, labelText, value = "", allowNone = false, excludeProductId = "") {
  const products = state.project.products.filter((product) => product.id !== excludeProductId);
  return `<label>${esc(labelText)}<select name="${esc(name)}">${allowNone ? `<option value="">No successor</option>` : ""}${products.map((product) => `<option value="${esc(product.id)}" ${product.id === value ? "selected" : ""}>${esc(product.name)}</option>`).join("")}</select></label>`;
}
function capabilitySelect(name, labelText, value = "") {
  return `<label>${esc(labelText)}<select name="${esc(name)}">${state.project.capabilities.map((capability) => `<option value="${esc(capability.id)}" ${capability.id === value ? "selected" : ""}>${esc(capability.name)}</option>`).join("")}</select></label>`;
}
function gapSelect(name, labelText, value = "", currentCandidateId = "") {
  return `<label>${esc(labelText)}<select name="${esc(name)}"><option value="">No linked gap</option>${state.project.gaps.filter((gap) => {
    const linkedCandidates = candidatesForGap(gap.id);
    return gap.id === value || linkedCandidates.length === 0 || linkedCandidates.every((candidate) => candidate.id === currentCandidateId);
  }).map((gap) => `<option value="${esc(gap.id)}" ${gap.id === value ? "selected" : ""}>${esc(gap.title || gap.description || gap.id)}</option>`).join("")}</select></label>`;
}
function candidateSelect(name, labelText, value = "", currentGapId = "") {
  const options = state.project.roadmapCandidates.filter((candidate) => {
    const linkedGapIds = candidate.gapIds || [];
    return candidate.id === value || linkedGapIds.length === 0 || linkedGapIds.includes(currentGapId);
  });
  return `<label>${esc(labelText)}<select name="${esc(name)}"><option value="">No linked candidate</option>${options.map((candidate) => `<option value="${esc(candidate.id)}" ${candidate.id === value ? "selected" : ""}>${esc(candidate.name || candidate.id)}</option>`).join("")}</select></label>`;
}
function productCheckboxes(name, labelText, selectedIds = []) {
  return `
    <fieldset class="checkbox-field">
      <legend>${esc(labelText)}</legend>
      <div class="checkbox-list">
        ${state.project.products.map((product) => `<label><input type="checkbox" name="${esc(name)}" value="${esc(product.id)}" ${selectedIds.includes(product.id) ? "checked" : ""}> <span>${esc(product.name)}</span></label>`).join("")}
      </div>
    </fieldset>
  `;
}

function productFields() {
  return [{ name: "name", label: "Name" }, selectField("status", "Status", ["retired", "current", "supported", "planned", "obsolete", "prototype"]), { name: "description", label: "Description", type: "textarea" }, { name: "notes", label: "Notes", type: "textarea" }];
}
function variantFields() {
  return [{ name: "id", label: "ID" }, { name: "productId", label: "Product ID" }, { name: "name", label: "Variant Name" }, { name: "block", label: "Block / Version" }, { name: "hardwareRevision", label: "Hardware Revision" }, { name: "softwareVersion", label: "Software/Firmware Version" }, selectField("status", "Status", ["retired", "current", "supported", "planned", "obsolete", "prototype"]), { name: "configurationNotes", label: "Configuration Notes", type: "textarea" }];
}
function claimFields() {
  return [{ name: "id", label: "ID" }, { name: "variantId", label: "Variant ID" }, { name: "capabilityId", label: "Capability ID" }, selectField("supportStatus", "Support Status", ["supported", "partial", "not supported", "planned", "unknown"]), selectField("maturity", "Evidence Maturity", ["verified", "demonstrated", "analysis", "simulation", "assumption", "unknown"]), selectField("confidence", "Confidence", ["low", "medium", "high"]), { name: "evidenceIds", label: "Evidence IDs", type: "ids" }, { name: "bdCaveat", label: "BD Caveat" }, { name: "notes", label: "Notes", type: "textarea" }];
}
function candidateFields(currentCandidateId = "") {
  return [{ name: "name", label: "Name" }, { name: "description", label: "Description", type: "textarea" }, { name: "driver", label: "Driving Need / Rationale" }, { name: "targetProductId", label: "Product", type: "product" }, { name: "gapId", label: "Gap Closed", type: "gap", currentCandidateId }, selectField("businessValue", "Business Value", ["low", "medium", "high"]), selectField("effort", "Effort", ["S", "M", "L", "XL"]), selectField("riskLevel", "Risk Level", ["low", "medium", "high"]), { name: "scheduleDrivers", label: "Schedule Drivers", type: "textarea" }, { name: "assumptions", label: "Assumptions", type: "textarea" }, selectField("decisionStatus", "Decision Status", ["include", "study", "defer", "reject", "blocked"])];
}
function impactFields() {
  return [{ name: "id", label: "ID" }, { name: "roadmapCandidateId", label: "Roadmap Candidate ID" }, { name: "designElementId", label: "Design Element ID" }, { name: "impactType", label: "Impact Type" }, selectField("severity", "Severity", ["low", "medium", "high", "major redesign"]), selectField("confidence", "Confidence", ["low", "medium", "high"]), { name: "owner", label: "Owner / Team" }, { name: "effort", label: "Effort Range / Size" }, { name: "scheduleDriver", label: "Schedule Driver", type: "textarea" }, { name: "verificationConsequence", label: "Verification Consequence", type: "textarea" }, { name: "riskConsequence", label: "Risk Consequence", type: "textarea" }, { name: "basis", label: "Basis of Estimate", type: "textarea" }];
}
function evidenceFields() {
  return [{ name: "title", label: "Evidence Title" }, selectField("type", "Evidence Type", ["verified", "demonstrated", "analysis", "simulation", "similarity", "assumption", "unknown"]), { name: "reference", label: "Source / Reference" }, { name: "appliesTo", label: "Applies To Product", type: "product" }, { name: "summary", label: "Summary", type: "textarea" }, selectField("confidence", "Confidence", ["low", "medium", "high"]) ];
}
function decisionFields() {
  return [{ name: "title", label: "Decision Title" }, { name: "date", label: "Decision Date", type: "date" }, { name: "owner", label: "Owner / Approver" }, { name: "optionsConsidered", label: "Options Considered", type: "textarea" }, { name: "selectedOption", label: "Selected Option" }, { name: "rejectedOptions", label: "Rejected / Deferred Options", type: "textarea" }, { name: "rationale", label: "Rationale", type: "textarea" }, { name: "assumptions", label: "Key Assumptions", type: "textarea" }, { name: "risksAccepted", label: "Risks Accepted", type: "textarea" }, { name: "supportingEvidenceIds", label: "Supporting Evidence IDs", type: "ids" }];
}
function assumptionFields() {
  return [{ name: "statement", label: "Statement", type: "textarea" }, { name: "relatedId", label: "Related Candidate / Impact / Capability" }, selectField("confidence", "Confidence", ["low", "medium", "high"]), { name: "owner", label: "Owner" }, { name: "validationPlan", label: "Validation Plan", type: "textarea" }, { name: "consequenceIfFalse", label: "Consequence If False", type: "textarea" }];
}
function selectField(name, label, options) {
  return { name, label, type: "select", options };
}

function closeDrawer() {
  $("#drawer").classList.remove("open", "product-detail-drawer", "capability-detail-drawer", "trace-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "true");
}

function download(filename, contents, type = "application/json") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportProject() {
  state.project.project.updatedAt = nowIso();
  download(`${safeName(state.project.project.name)}.plroadmap.json`, JSON.stringify(state.project, null, 2));
  state.dirty = false;
  state.lastExportedAt = new Date();
  renderShell();
  toast("Project snapshot exported.");
}

function exportReport(type = "management") {
  if (type === "project") return exportProject();
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(state.project.project.name)} report</title></head><body><h1>${esc(state.project.project.name)}</h1><pre>${esc(JSON.stringify(state.project, null, 2))}</pre></body></html>`;
  download(`${safeName(state.project.project.name)}-${type}-report.html`, html, "text/html");
  toast(`${title(type)} report exported.`);
}

function safeName(value) {
  return String(value || "project").replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "");
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.add("hidden"), 2600);
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  if (action === "open-file") $("#fileInput").click();
  if (action === "load-sample") setProject(sampleProject(), "Sample project loaded.");
  if (action === "new-project") setProject(blankProject(), "Blank project created.");
  if (action === "show-landing") {
    $("#app").classList.add("hidden");
    $("#landing").classList.remove("hidden");
  }
  if (action === "export-project") exportProject();
  if (action === "export-report") exportReport("management");
  if (action === "close-drawer") closeDrawer();
});

$("#fileInput").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    setProject(JSON.parse(await file.text()), `${file.name} loaded.`);
  } catch (error) {
    toast("Could not read project JSON. Check the file format.");
  } finally {
    event.target.value = "";
  }
});

$("#nav").addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  closeDrawer();
  state.view = button.dataset.view;
  render();
});
