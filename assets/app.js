"use strict";

const SCHEMA_VERSION = "0.3.0";
const nowIso = () => new Date().toISOString();

const navItems = [
  ["dashboard", "Dashboard", "grid"],
  ["products", "Products", "box"],
  ["matrix", "Variation Points", "layers"],
  ["design", "Design Elements", "grid"],
  ["constraints", "Constraints", "alert"],
  ["gaps", "Needs & Gaps", "split"],
  ["trace", "Trace View", "route"],
  ["candidates", "Roadmap Candidates", "route"],
  ["blocks", "Block Upgrades", "box"],
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
  drawerBeforeClose: null,
  drawerCloseGuard: null,
  drawerPointerStartedInside: false,
  selectedDetail: "",
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
const selectedRowClass = (token) => state.selectedDetail === token ? " selected-row" : "";
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
    blockUpgrades: [],
    designElements: [],
    capabilityDesignLinks: [],
    constraints: [],
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
    { id: "cap_enterprise_bulk_export", recordType: "targetNeed", name: "Enterprise Bulk Export Readiness", category: "target need", marketSegment: "Enterprise Operations", stakeholder: "Customer Segment", satisfactionStatus: "not met", satisfiedProductIds: [], linkedCapabilityIds: ["cap_bulk_export"], description: "Support customer segments that require scheduled export of large operational datasets." },
    { id: "cap_remote_update", name: "Secure Remote Update", category: "Software Feature", description: "Support secure remote software update workflow." },
    { id: "cap_diag", name: "Automated Fault Isolation", category: "Diagnostics", description: "Localize field faults without SME intervention." },
    { id: "cap_bulk_export", name: "Bulk Data Export", category: "Data Workflow", description: "Export large operational datasets on a scheduled or on-demand basis without interrupting normal use." },
    { id: "cap_performance_envelope", name: "Performance Envelope", category: "Performance", description: "Meet the target performance envelope for a future product." },
    { id: "cap_input_power", name: "Input Power Envelope", category: "Power Constraint", description: "Supported platform input power constraint, such as 28VDC or 40VDC operation." },
  ];
  p.evidence = [
    { id: "ev_remote_update_demo_001", title: "Secure Remote Update Lab Verification", type: "verified", reference: "UPDATE-DEMO-001", appliesTo: "prod_product_1", summary: "Lab verification record for the baseline remote update workflow.", confidence: "medium" },
    { id: "ev_diag_test_014", title: "Diagnostic Regression Test", type: "verified", reference: "TEST-014", appliesTo: "prod_product_2", summary: "Automated fault isolation passed representative regression suite.", confidence: "high" },
    { id: "ev_performance_analysis_003", title: "Performance Envelope Analysis", type: "simulation", reference: "ANALYSIS-PERF-003", appliesTo: "prod_product_3", summary: "Analysis only. Requires verification evidence before claim.", confidence: "low" },
  ];
  p.capabilityClaims = [
    { id: "claim_product_1_remote_update", variantId: "var_product_1_b1", capabilityId: "cap_remote_update", supportStatus: "not supported", maturity: "verified", confidence: "medium", evidenceIds: ["ev_remote_update_demo_001"], bdCaveat: "Do not claim formal qualification.", notes: "Verified in a controlled lab setting." },
    { id: "claim_product_2_remote_update", variantId: "var_product_2_b2", capabilityId: "cap_remote_update", supportStatus: "planned", maturity: "assumption", confidence: "low", evidenceIds: [], bdCaveat: "Future roadmap only.", notes: "Depends on controller resource margin." },
    { id: "claim_product_2_diag", variantId: "var_product_2_b2", capabilityId: "cap_diag", supportStatus: "supported", maturity: "verified", confidence: "high", evidenceIds: ["ev_diag_test_014"], bdCaveat: "", notes: "Good candidate for Block 2 include." },
    { id: "claim_product_25_diag", variantId: "var_product_25_b25", capabilityId: "cap_diag", supportStatus: "supported", maturity: "verified", confidence: "high", evidenceIds: ["ev_diag_test_014"], bdCaveat: "", notes: "Shared with Product 2.0." },
    { id: "claim_product_3_bulk_export", variantId: "var_product_3_b3", capabilityId: "cap_bulk_export", supportStatus: "planned", maturity: "analysis", confidence: "medium", evidenceIds: [], bdCaveat: "Requires export service and storage impact review.", notes: "High-volume export workflow under study." },
    { id: "claim_product_3_performance", variantId: "var_product_3_b3", capabilityId: "cap_performance_envelope", supportStatus: "planned", maturity: "unknown", confidence: "low", evidenceIds: [], bdCaveat: "Do not promise.", notes: "Planned architecture not assessed for high-volume export workloads." },
    { id: "claim_product_1_power", variantId: "var_product_1_b1", capabilityId: "cap_input_power", supportStatus: "supported", maturity: "verified", confidence: "high", evidenceIds: [], bdCaveat: "", notes: "28VDC input envelope." },
    { id: "claim_product_2_power", variantId: "var_product_2_b2", capabilityId: "cap_input_power", supportStatus: "supported", maturity: "verified", confidence: "high", evidenceIds: [], bdCaveat: "", notes: "40VDC input envelope." },
  ];
  p.gaps = [
    { id: "gap_remote_update", title: "Remote Update Verification Gap", targetCapabilityId: "cap_remote_update", variantId: "var_product_1_b1", description: "Current baseline has only limited verification for a manual update workflow; target requires verified remote update support.", severity: "high", businessImpact: "Blocks target segment claim.", technicalImpact: "controller, subsystem interface, verification campaign.", gapType: "true design gap" },
    { id: "gap_bulk_export", title: "Bulk Export Design Gap", targetCapabilityId: "cap_bulk_export", variantId: "var_product_2_b2", description: "Target product needs high-volume export support; current export workflow is not assessed for large operational datasets.", severity: "high", businessImpact: "Blocks enterprise operations segment claim.", technicalImpact: "export service, storage layer, queue handling, verification dataset.", gapType: "true design gap" },
    { id: "gap_performance_evidence", title: "Performance Evidence Gap", targetCapabilityId: "cap_performance_envelope", variantId: "var_product_2_b2", description: "Performance envelope is analysis-only and not verified on target hardware.", severity: "medium", businessImpact: "Target segment proposal caveat.", technicalImpact: "Subsystem model, verification test, supplier quote.", gapType: "evidence gap" },
  ];
  p.roadmapCandidates = [
    { id: "rc_048", name: "Secure Update Enablement", description: "Enable secure remote update workflow for planned products.", driver: "Remote update gap", targetProductId: "prod_product_3", gapIds: ["gap_remote_update"], businessValue: "high", effort: "L", riskLevel: "high", scheduleDrivers: "Integration lab availability", assumptions: "Assumes existing controller has sufficient memory and security hooks.", decisionStatus: "study" },
    { id: "rc_051", name: "Automated Fault Isolation Matrix", description: "Add field diagnostic decision matrix.", driver: "Reduce MTTR and support burden", targetProductId: "prod_product_25", gapIds: [], businessValue: "medium", effort: "M", riskLevel: "low", scheduleDrivers: "Test equipment scripting", assumptions: "Assumes existing telemetry is sufficient.", decisionStatus: "include" },
    { id: "rc_062", name: "Bulk Export Enablement", description: "Enable high-volume operational data export for planned products.", driver: "Enterprise bulk export need", targetProductId: "prod_product_3", gapIds: ["gap_bulk_export"], businessValue: "high", effort: "L", riskLevel: "high", scheduleDrivers: "Representative dataset availability and storage migration window", assumptions: "Assumes export workloads can be queued without degrading interactive workflows.", decisionStatus: "study" },
  ];
  p.blockUpgrades = [
    { id: "blk_product_3", name: "Product 3.0 Block Upgrade", targetProductId: "prod_product_3", fromProductId: "prod_product_2", status: "planning", plannedRelease: "TBD", objective: "Close priority target needs for expanded segment support while capturing design and verification impacts.", candidateIds: ["rc_048", "rc_062"], notes: "Initial upgrade package built from unmet needs and high-value candidates." },
  ];
  p.designElements = [
    { id: "de_export_service", name: "Export Service", type: "software", owner: "Platform Engineering", description: "Background export orchestration, file generation, retry handling, and delivery workflow." },
    { id: "de_storage_layer", name: "Storage Layer", type: "software", owner: "Data Platform", description: "Operational data model, query paths, retention strategy, and bulk read performance." },
    { id: "de_control_module", name: "Control Module", type: "firmware", owner: "Firmware", description: "Primary control and processing module." },
    { id: "de_diag", name: "Diagnostic Service", type: "software", owner: "Software", description: "Built-in-test and fault isolation service." },
  ];
  p.capabilityDesignLinks = [
    { id: "cdl_bulk_export_service", capabilityId: "cap_bulk_export", designElementId: "de_export_service", impactType: "export workflow", rationale: "Bulk export changes require background job orchestration, retry handling, and delivery behavior." },
    { id: "cdl_bulk_export_storage", capabilityId: "cap_bulk_export", designElementId: "de_storage_layer", impactType: "data access performance", rationale: "Bulk export changes can affect query performance, retention, and storage throughput." },
    { id: "cdl_remote_update_control", capabilityId: "cap_remote_update", designElementId: "de_control_module", impactType: "firmware resource margin", rationale: "Secure update workflows depend on controller memory, boot flow, and security hooks." },
    { id: "cdl_diag_service", capabilityId: "cap_diag", designElementId: "de_diag", impactType: "software function", rationale: "Diagnostic capability changes map directly to the diagnostic service." },
    { id: "cdl_performance_storage", capabilityId: "cap_performance_envelope", designElementId: "de_storage_layer", impactType: "large dataset performance", rationale: "High-volume export readiness depends on validated storage and query performance." },
  ];
  p.constraints = [
    { id: "con_dataset_limit", name: "Dataset Size Operating Limit", description: "Current active baseline is not assessed for export jobs above the validated dataset size.", productIds: ["prod_product_2"], limitType: "performance", limitValue: "Exports limited to validated dataset size", basis: "SME assessment pending verification evidence.", severity: "major caveat", workaround: "Route large-export opportunities to planned product assessment.", relatedTargetNeedIds: ["cap_enterprise_bulk_export"], relatedCapabilityIds: ["cap_bulk_export", "cap_performance_envelope"], evidenceIds: [] },
  ];
  p.impactAssessments = [
    { id: "imp_001", roadmapCandidateId: "rc_048", designElementId: "de_control_module", impactType: "resource margin", severity: "major redesign", confidence: "low", owner: "Firmware", effort: "L-XL", scheduleDriver: "controller utilization estimate", verificationConsequence: "New regression and verification demo required.", riskConsequence: "May force hardware respin.", basis: "SME judgment from similar effort." },
    { id: "imp_002", roadmapCandidateId: "rc_062", designElementId: "de_export_service", impactType: "export workflow", severity: "high", confidence: "medium", owner: "Platform Engineering", effort: "L", scheduleDriver: "Representative dataset and load-test environment availability", verificationConsequence: "Large dataset export and retry verification required.", riskConsequence: "May require queueing or storage architecture changes.", basis: "Suggested by bulk export to export service link." },
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
  normalized.capabilityClaims.forEach((claim) => {
    if (claim.maturity === "demonstrated") claim.maturity = "verified";
  });
  normalized.evidence.forEach((evidence) => {
    if (evidence.type === "demonstrated") evidence.type = "verified";
  });
  normalized.capabilityDesignLinks.forEach((link) => {
    link.id = link.id || makeId("cdl");
  });
  normalized.roadmapCandidates.forEach((candidate) => {
    if (candidate.blockUpgradeId) {
      const block = byId(normalized.blockUpgrades, candidate.blockUpgradeId);
      if (block) block.candidateIds = [...new Set([...(block.candidateIds || []), candidate.id])];
    }
  });
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
    design: renderDesignElements,
    constraints: renderConstraints,
    gaps: renderGaps,
    trace: renderTraceView,
    candidates: renderCandidates,
    blocks: renderBlockUpgrades,
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
  const focusedProduct = p.viewSettings?.showProductFocus ? byId(p.products, p.viewSettings?.productFocusId) : null;
  if (focusedProduct) return renderProductFocusPage(focusedProduct);
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
  const successor = byId(state.project.products, product.successorProductId);
  return `
    <button class="roadmap-node ${successor ? "has-successor" : ""}" data-product-page="${esc(product.id)}" ${successor ? `data-successor="${esc(successor.name)}"` : ""}>
      <strong>${esc(product.name)}</strong>
      <span>${esc(variants[0]?.name || "Product")} ${esc(variants[0]?.block || "")}</span>
      <div>${badge(product.status)}</div>
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
          ${products.map((product) => `<tr class="clickable-row ${state.project.viewSettings?.productFocusId === product.id ? "focused-row" : ""}${selectedRowClass(`product:${product.id}`)}" data-product-focus="${esc(product.id)}" data-product-status="${esc(product.status)}">
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
  const variationPoints = p.capabilities.filter((cap) => !isTargetNeedCapability(cap));
  const categories = [...new Set(variationPoints.map((cap) => cap.category).filter(Boolean))];
  const rows = variationPoints.map((cap) => {
    const claim = claimForProductCapability(selectedProductId, cap.id);
    const linkedDesign = linkedDesignElementsForCapability(cap.id);
    const supportStatus = claim?.supportStatus || "unassigned";
    const group = supportStatus === "supported" ? "Supported" : supportStatus === "planned" ? "Planned" : supportStatus === "not supported" ? "Not Supported" : "Unassigned / Unknown";
    return { cap, claim, linkedDesign, group };
  });
  const groupedRows = ["Supported", "Planned", "Not Supported", "Unassigned / Unknown"].map((group) => ({ group, rows: rows.filter((row) => row.group === group) }));
  const collapsedGroups = p.viewSettings.capabilityGroupsCollapsed || {};
  const capabilityTableHead = `<thead><tr><th>Variation Point</th><th>Type</th><th>${esc(selectedProduct?.name || "Product")} Status</th><th>Evidence Maturity</th><th>Confidence</th><th>Linked Design</th></tr></thead>`;
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
          <option value="analysis">Analysis</option>
          <option value="simulation">Simulation</option>
          <option value="assumption">Assumption</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
      <div class="filter">
        <label>Confidence</label>
        <select data-capability-filter="confidence">
          <option value="">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
    </section>
    <div class="capability-section-stack">
      ${groupedRows.map(({ group, rows: groupRows }) => {
        const groupId = badgeClass(group);
        const collapsed = Boolean(collapsedGroups[groupId]);
        return `
          <section class="capability-section" data-capability-section="${esc(groupId)}">
            <button class="capability-section-toggle" type="button" data-capability-group-toggle="${esc(groupId)}" aria-expanded="${collapsed ? "false" : "true"}">
              <span>${esc(group)}</span>
              <strong>${groupRows.length}</strong>
            </button>
            <div class="table-wrap capability-page-table ${collapsed ? "hidden" : ""}">
              <table class="capability-table">
                ${capabilityTableHead}
                <tbody>
                  ${groupRows.map(({ cap, claim, linkedDesign }) => `<tr class="clickable-row${selectedRowClass(`capability:${cap.id}`)}" data-row-detail="capability:${cap.id}" data-capability-category="${esc(cap.category || "")}" data-capability-maturity="${esc(claim?.maturity || "unknown")}" data-capability-confidence="${esc(claim?.confidence || "unknown")}">
                    <td><strong>${esc(cap.name)}</strong><br><span class="muted">${esc(cap.description || "No description captured")}</span></td>
                    <td>${esc(cap.category || "-")}</td>
                    <td>${badge(claim?.supportStatus || "unassigned")}</td>
                    <td>${badge(claim?.maturity || "unknown")}</td>
                    <td>${badge(claim?.confidence || "unknown")}</td>
                    <td>${esc(linkedDesign.map((item) => item.design.name).join(", ") || "None")}</td>
                  </tr>`).join("") || `<tr class="capability-empty-row"><td colspan="6">No variation points in this group.</td></tr>`}
                </tbody>
              </table>
            </div>
          </section>
        `;
      }).join("")}
    </div>
  `;
}

function renderProductFocusPage(product) {
  const variants = productVariants(product.id);
  const needs = targetNeedsAddressedByProduct(product.id);
  const capabilityRows = state.project.capabilities
    .filter((capability) => !isTargetNeedCapability(capability))
    .map((capability) => ({ capability, claim: claimForProductCapability(product.id, capability.id) }));
  const groups = [
    ["supported", "Supported"],
    ["planned", "Planned"],
    ["not supported", "Not Supported"],
    ["unknown", "Unknown / Unassigned"],
  ].map(([status, label]) => ({
    status,
    label,
    rows: capabilityRows.filter(({ claim }) => status === "unknown" ? !claim || !["supported", "planned", "not supported"].includes(claim.supportStatus) : claim?.supportStatus === status),
  }));

  return `
    ${pageHeader(product.name, product.description || "Product-focused variation-point and target-need coverage.", `<button class="btn secondary" data-product-list>Back to Products</button><button class="btn primary" data-detail="product:${esc(product.id)}">Edit Product</button>`)}
    <section class="summary-grid">
      ${metric("Lifecycle", title(product.status || "unknown"), "Product status")}
      ${metric("Variants", variants.length, variants.map((variant) => variant.name || variant.block || variant.id).join(", ") || "No variants")}
      ${metric("Needs Addressed", needs.length, "Target needs linked to this product")}
    </section>
    <section class="grid-two dashboard-split">
      <article class="card">
        <h2 class="section-title">Product Notes</h2>
        <p>${esc(product.notes || "No planning notes captured.")}</p>
        <p class="muted">Successor: ${esc(byId(state.project.products, product.successorProductId)?.name || "None")}</p>
      </article>
      <article class="card">
        <h2 class="section-title">Target Needs Addressed</h2>
        ${needs.length ? `<div class="list">${needs.map(({ need, basis }) => `<button class="list-item linked-list-item" type="button" data-detail="capability:${esc(need.id)}"><div><strong>${esc(need.name)}</strong><span>${esc([need.marketSegment, need.stakeholder, basis].filter(Boolean).join(" | "))}</span></div>${badge(need.satisfactionStatus || "unassessed")}</button>`).join("")}</div>` : empty("No target needs list this product yet.")}
      </article>
    </section>
    <article class="card product-variation-card">
      <h2 class="section-title">Constraints / Operating Limits</h2>
      ${constraintsForProduct(product.id).length ? `<div class="table-wrap"><table><thead><tr><th>Constraint</th><th>Type</th><th>Limit</th><th>Severity</th><th>Workaround</th></tr></thead><tbody>${constraintsForProduct(product.id).map((constraint) => `<tr class="clickable-row${selectedRowClass(`constraint:${constraint.id}`)}" data-row-detail="constraint:${constraint.id}"><td><strong>${esc(constraint.name)}</strong><br><span class="muted">${esc(constraint.description || "")}</span></td><td>${badge(constraint.limitType || "operational")}</td><td>${esc(constraint.limitValue || "-")}</td><td>${badge(constraint.severity || "major caveat")}</td><td>${esc(constraint.workaround || "-")}</td></tr>`).join("")}</tbody></table></div>` : empty("No constraints linked to this product yet.")}
    </article>
    <article class="card product-variation-card">
      <h2 class="section-title">Variation Points</h2>
      <div class="capability-section-stack">
        ${groups.map(({ status, label, rows }) => `
          <section class="capability-section" data-capability-section="${esc(badgeClass(label))}">
            <button class="capability-section-toggle" type="button" data-static-toggle aria-expanded="true">
              <span>${esc(label)}</span>
              <strong>${rows.length}</strong>
            </button>
            <div class="table-wrap capability-page-table">
              <table class="capability-table">
                <thead><tr><th>Variation Point</th><th>Type</th><th>Status</th><th>Evidence</th><th>Confidence</th><th>Linked Design</th></tr></thead>
                <tbody>
                  ${rows.map(({ capability, claim }) => {
                    const linkedDesign = linkedDesignElementsForCapability(capability.id);
                    return `<tr class="clickable-row${selectedRowClass(`capability:${capability.id}`)}" data-row-detail="capability:${capability.id}">
                      <td><strong>${esc(capability.name)}</strong><br><span class="muted">${esc(capability.description || "No description captured")}</span></td>
                      <td>${esc(capability.category || "-")}</td>
                      <td>${badge(claim?.supportStatus || "unassigned")}</td>
                      <td>${badge(claim?.maturity || "unknown")}</td>
                      <td>${badge(claim?.confidence || "unknown")}</td>
                      <td>${esc(linkedDesign.map((item) => item.design.name).join(", ") || "None")}</td>
                    </tr>`;
                  }).join("") || `<tr class="capability-empty-row"><td colspan="6">No variation points in this group.</td></tr>`}
                </tbody>
              </table>
            </div>
          </section>
        `).join("")}
      </div>
    </article>
  `;
}

function renderDesignElements() {
  const p = state.project;
  return `
    ${pageHeader("Design Elements", "Map product-facing variation points to the parts of the design that change when those capabilities move.", `<button class="btn primary" data-add="design">Add Design Element</button>`)}
    <section class="summary-grid">
      ${metric("Design Elements", p.designElements.length, "Tracked architecture items")}
      ${metric("Feature Links", p.capabilityDesignLinks.length, "Variation-to-design links")}
      ${metric("Open Impacts", p.impactAssessments.length, "Candidate impact rows")}
    </section>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Design Element</th><th>Type</th><th>Owner</th><th>Linked Variation Points</th><th>Open Candidate Impacts</th><th>Description</th></tr></thead>
        <tbody>
          ${p.designElements.map((design) => {
            const linkedCapabilities = linkedCapabilitiesForDesign(design.id);
            const impacts = p.impactAssessments.filter((impact) => impact.designElementId === design.id);
            return `<tr class="clickable-row${selectedRowClass(`design:${design.id}`)}" data-row-detail="design:${design.id}">
              <td><strong>${esc(design.name)}</strong></td>
              <td>${badge(design.type || "unknown")}</td>
              <td>${esc(design.owner || "-")}</td>
              <td>${esc(linkedCapabilities.map((item) => item.capability.name).join(", ") || "None")}</td>
              <td>${esc(impacts.map((impact) => candidateName(impact.roadmapCandidateId)).join(", ") || "None")}</td>
              <td>${esc(design.description || "-")}</td>
            </tr>`;
          }).join("") || `<tr><td colspan="6">${empty("No design elements yet.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderConstraints() {
  const p = state.project;
  return `
    ${pageHeader("Constraints / Operating Limits", "Capture where products cannot operate, have caveats, or need workarounds before a need can be claimed.", `<button class="btn primary" data-add="constraint">Add Constraint</button>`)}
    <section class="summary-grid">
      ${metric("Constraints", p.constraints.length, "Tracked limits")}
      ${metric("Blockers", p.constraints.filter((constraint) => constraint.severity === "blocker").length, "Hard disqualifiers")}
      ${metric("Product Caveats", p.constraints.filter((constraint) => (constraint.productIds || []).length).length, "Linked to products")}
    </section>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Constraint</th><th>Products</th><th>Type</th><th>Limit</th><th>Severity</th><th>Related Needs</th><th>Related Variation Points</th><th>Basis / Workaround</th></tr></thead>
        <tbody>
          ${p.constraints.map((constraint) => `<tr class="clickable-row${selectedRowClass(`constraint:${constraint.id}`)}" data-row-detail="constraint:${constraint.id}">
            <td><strong>${esc(constraint.name)}</strong><br><span class="muted">${esc(constraint.description || "No description captured")}</span></td>
            <td>${productLinks(constraint.productIds, "No products linked")}</td>
            <td>${badge(constraint.limitType || "operational")}</td>
            <td>${esc(constraint.limitValue || "-")}</td>
            <td>${badge(constraint.severity || "major caveat")}</td>
            <td>${capabilityLinks(constraint.relatedTargetNeedIds, "None")}</td>
            <td>${capabilityLinks(constraint.relatedCapabilityIds, "None")}</td>
            <td><strong>${esc(constraint.basis || "-")}</strong><br><span class="muted">${esc(constraint.workaround || "No workaround captured")}</span></td>
          </tr>`).join("") || `<tr><td colspan="8">${empty("No constraints yet.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderGaps() {
  const p = state.project;
  const targetNeedIds = targetNeedIdsForGapAnalysis();
  const targetNeeds = targetNeedIds.map((id) => byId(p.capabilities, id)).filter(Boolean);
  const selectedProductId = selectedNeedsProductId();
  const selectedProduct = byId(p.products, selectedProductId);
  const comparedProductIds = selectedProductId ? [selectedProductId] : [...new Set(p.gaps.map((gap) => byId(p.variants, gap.variantId)?.productId).filter(Boolean))];
  const needEvaluations = targetNeeds.map((need) => ({ need, evaluation: evaluateNeedForProduct(need, selectedProductId) }));
  return `
    ${pageHeader("Needs & Gaps", "Start with the need, link it to product-facing variation points, then evaluate whether a product meets it.", `<button class="btn primary" data-add="targetNeed">Add Need</button>`)}
    <section class="analysis-setup">
      <div>
        <span class="setup-kicker">Guided Evaluation</span>
        <h2>Which needs are unmet for this product?</h2>
        <p>Needs are the source of truth. A gap is created only when a selected product does not meet a need, the need has no linked variation point, or the supporting evidence is not strong enough.</p>
      </div>
      <div class="setup-grid">
        <article>
          <span>Needs In This Analysis</span>
          <strong>${esc(targetNeedIds.length || "None")}</strong>
          <small>${esc(targetNeedIds.map((id) => capabilityName(id)).join(", ") || "Add a need to begin.")}</small>
        </article>
        <article>
          <span>Product Being Evaluated</span>
          <strong>${esc(selectedProduct?.name || "None")}</strong>
          <small>${esc(selectedProduct ? `Baseline: ${productVariants(selectedProduct.id)[0]?.block || selectedProduct.name}` : "Add a product to evaluate needs.")}</small>
        </article>
        <article>
          <span>Next Step</span>
          <strong>Gap → Candidate → Block</strong>
          <small>Create a gap from an unmet need, create a candidate to close it, then assign that candidate to a block upgrade.</small>
        </article>
      </div>
    </section>
    <section class="filters compact-filters">
      <div class="filter">
        <label>Evaluate Product</label>
        <select data-needs-product>
          ${p.products.map((product) => `<option value="${esc(product.id)}" ${product.id === selectedProductId ? "selected" : ""}>${esc(product.name)}</option>`).join("")}
        </select>
      </div>
    </section>
    <section class="summary-grid">
      ${metric("Met", needEvaluations.filter(({ evaluation }) => evaluation.status === "met").length, "Need is supported and verified")}
      ${metric("Unmet / Partial", needEvaluations.filter(({ evaluation }) => ["unmet", "partial", "unverified"].includes(evaluation.status)).length, "Needs work or evidence")}
      ${metric("Unmapped", needEvaluations.filter(({ evaluation }) => evaluation.status === "unmapped").length, "No linked variation point")}
    </section>
    <section>
      <h2 class="section-title">Need Evaluation</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Need</th><th>Market / Stakeholder</th><th>${esc(selectedProduct?.name || "Product")} Status</th><th>Linked Variation Points</th><th>Existing Gaps</th><th>Candidate</th><th>Action</th></tr></thead>
          <tbody>
            ${needEvaluations.map(({ need, evaluation }) => {
              const linkedGaps = p.gaps.filter((gap) => gap.targetCapabilityId === need.id);
              const gapForProduct = linkedGaps.find((gap) => byId(p.variants, gap.variantId)?.productId === selectedProductId);
              const candidate = gapForProduct ? candidateForGap(gapForProduct.id) : null;
              const needsGap = ["unmapped", "unmet", "partial", "unverified", "unknown"].includes(evaluation.status);
              return `<tr class="clickable-row${selectedRowClass(`capability:${need.id}`)}" data-row-detail="capability:${need.id}">
                <td><strong>${esc(need.name)}</strong><br><span class="muted">${esc(need.category || "target need")}</span></td>
                <td>${esc([need.marketSegment, need.stakeholder].filter(Boolean).join(" / ") || "-")}</td>
                <td>${badge(evaluation.status)}<br><span class="muted">${esc(evaluation.reason)}</span></td>
                <td>${capabilityLinks(need.linkedCapabilityIds, "None linked")}</td>
                <td>${esc(linkedGaps.map((gap) => gap.title || gap.description || gap.id).join(", ") || "No gaps yet")}</td>
                <td>${candidate ? `<button class="link-button" type="button" data-detail="candidate:${esc(candidate.id)}">${esc(candidate.name)}</button>` : "None"}</td>
                <td>${needsGap ? `<button class="btn secondary" type="button" data-create-gap-for-need="${esc(need.id)}" data-product-id="${esc(selectedProductId)}">${gapForProduct ? "Open Gap" : "Create Gap"}</button>` : `<span class="muted">No gap</span>`}</td>
              </tr>`;
            }).join("") || `<tr><td colspan="7">${empty("No needs yet.")}</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
    <h2 class="section-title">Gap Records</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Gap</th><th>Need</th><th>Compared Product</th><th>Closing Candidate</th><th>Severity</th><th>Gap Type</th><th>Action</th></tr></thead>
        <tbody>
          ${p.gaps.map((g) => `<tr class="clickable-row${selectedRowClass(`gap:${g.id}`)}" data-row-detail="gap:${g.id}">
            <td><strong>${esc(g.title || g.description)}</strong><br><span class="muted">${esc(g.description || "")}</span></td>
            <td>${esc(capabilityName(g.targetCapabilityId))}</td>
            <td>${esc(productNameForVariant(g.variantId))}</td>
            <td>${esc(closingCandidateNamesForGap(g.id))}</td>
            <td>${badge(g.severity)}</td>
            <td>${badge(g.gapType)}</td>
            <td><button class="btn secondary" type="button" data-create-candidate-for-gap="${esc(g.id)}">${candidateForGap(g.id) ? "Open Candidate" : "Create Candidate"}</button></td>
          </tr>`).join("") || `<tr><td colspan="7">${empty("No gap records yet. Create one from an unmet need above.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderTraceView() {
  const needs = traceNeeds();
  const selectedNeedId = selectedTraceNeedId(needs);
  const selectedNeed = byId(state.project.capabilities, selectedNeedId) || needs[0];
  const trace = selectedNeed ? traceRowsForNeed(selectedNeed) : [];
  const variationCount = new Set(trace.map((row) => row.capability?.id).filter(Boolean)).size;
  const designCount = new Set(trace.map((row) => row.design?.id).filter(Boolean)).size;
  const productCount = new Set(trace.map((row) => row.product?.id).filter(Boolean)).size;

  return `
    ${pageHeader("Trace View", "Follow a target need into variation points, design elements, and products so the planning story is visible end to end.")}
    <section class="filters trace-filters">
      <label class="filter">Starting Need
        <select data-trace-need>
          ${needs.map((need) => `<option value="${esc(need.id)}" ${need.id === selectedNeedId ? "selected" : ""}>${esc(need.name)}</option>`).join("")}
        </select>
      </label>
      <div class="trace-legend">
        <span><i class="trace-dot need"></i>Need</span>
        <span><i class="trace-dot variation"></i>Variation Point</span>
        <span><i class="trace-dot design"></i>Design Element</span>
        <span><i class="trace-dot product"></i>Product</span>
      </div>
    </section>
    ${selectedNeed ? `
      <section class="summary-grid">
        ${metric("Variation Points", variationCount, "Linked capabilities")}
        ${metric("Design Elements", designCount, "Impacted architecture")}
        ${metric("Products", productCount, "Claimed or planned products")}
        ${metric("Trace Paths", trace.length, "Visible branches")}
      </section>
      ${traceDiagram(selectedNeed, trace)}
    ` : empty("No target needs or gap-driving capabilities are available yet. Add a target need or gap to begin tracing.")}
  `;
}

function traceDiagram(need, rows) {
  const rootMeta = [
    need.marketSegment,
    need.stakeholder,
    isTargetNeedCapability(need) ? title(need.satisfactionStatus || "unassessed") : "Gap-driving capability",
  ].filter(Boolean).join(" | ");

  return `
    <section class="trace-board" style="--trace-rows: ${Math.max(rows.length, 1)};">
      <div class="trace-root">
        ${traceNode({
          kind: "need",
          label: "Need",
          titleText: need.name,
          meta: rootMeta || need.description || "Starting point",
          detail: `capability:${need.id}`,
        })}
      </div>
      <div class="trace-paths">
        <div class="trace-column-labels">
          <span>Variation Point</span>
          <span>Design Element</span>
          <span>Product</span>
        </div>
        ${rows.map((row) => `
          <div class="trace-path-row">
            <div class="trace-branch-line"></div>
            ${traceNode({
              kind: "variation",
              label: "Variation Point",
              titleText: row.capability?.name || "No variation point linked",
              meta: row.capability ? row.capability.category || row.capability.description || "Capability" : "Link a variation point from the target need.",
              detail: row.capability ? `capability:${row.capability.id}` : "",
              muted: !row.capability,
            })}
            <div class="trace-connector"></div>
            ${traceNode({
              kind: "design",
              label: "Design Element",
              titleText: row.design?.name || "No design element linked",
              meta: row.design ? [row.design.type, row.design.owner].filter(Boolean).join(" | ") || row.link?.impactType || "Design impact" : "Link design elements from the variation point.",
              detail: row.design ? `design:${row.design.id}` : "",
              muted: !row.design,
            })}
            <div class="trace-connector"></div>
            ${traceNode({
              kind: "product",
              label: "Product",
              titleText: row.product?.name || "No product claim linked",
              meta: row.product ? `${title(row.claim?.supportStatus || row.product.status || "unknown")} | ${title(row.claim?.maturity || "unknown")} evidence` : "Add a product support claim for this variation point.",
              productId: row.product?.id || "",
              muted: !row.product,
            })}
          </div>
        `).join("") || `<div class="trace-empty-path">${empty("This need has no trace links yet.")}</div>`}
      </div>
    </section>
  `;
}

function traceNode({ kind, label, titleText, meta = "", detail = "", productId = "", muted = false }) {
  const action = productId ? `data-product-page="${esc(productId)}"` : detail ? `data-detail="${esc(detail)}"` : "";
  const tag = action ? "button" : "div";
  const typeAttr = tag === "button" ? ` type="button"` : "";
  return `
    <${tag} class="trace-map-node ${esc(kind)}${muted ? " muted-node" : ""}" ${action}${typeAttr}>
      <span>${esc(label)}</span>
      <strong>${esc(titleText)}</strong>
      <small>${esc(meta || "-")}</small>
    </${tag}>
  `;
}

function renderCandidates() {
  const p = state.project;
  return `
    ${pageHeader("Roadmap Candidates", "Candidate upgrades are proposed feature/design packages that close unmet needs and feed block plans.", `<button class="btn primary" data-add="candidate">Add Candidate</button>`)}
    <section class="summary-grid">
      ${metric("Total", p.roadmapCandidates.length, "Candidates")}
      ${metric("Include", p.roadmapCandidates.filter((c) => c.decisionStatus === "include").length, "Fund / plan now")}
      ${metric("Study", p.roadmapCandidates.filter((c) => c.decisionStatus === "study").length, "Needs evidence")}
      ${metric("Deferred", p.roadmapCandidates.filter((c) => c.decisionStatus === "defer").length, "Preserved rationale")}
    </section>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Product</th><th>Driver</th><th>Gap Closed</th><th>Block</th><th>Value</th><th>Effort</th><th>Risk</th><th>Confidence</th><th>Status</th></tr></thead>
        <tbody>
          ${p.roadmapCandidates.map((c) => `<tr class="clickable-row${selectedRowClass(`candidate:${c.id}`)}" data-row-detail="candidate:${c.id}">
            <td><strong>${esc(c.name)}</strong></td>
            <td>${esc(candidateProductName(c))}</td>
            <td>${esc(c.driver)}</td>
            <td>${esc(idsToNames(c.gapIds, p.gaps, "No linked gap"))}</td>
            <td>${esc(blockForCandidate(c.id)?.name || "Unassigned")}</td>
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

function renderBlockUpgrades() {
  const p = state.project;
  return `
    ${pageHeader("Block Upgrades", "Bundle selected roadmap candidates into a product block plan with scope, risk, verification work, and release intent.", `<button class="btn primary" data-add="block">Add Block Upgrade</button>`)}
    <section class="summary-grid">
      ${metric("Blocks", p.blockUpgrades.length, "Planned upgrade packages")}
      ${metric("Candidates Assigned", new Set(p.blockUpgrades.flatMap((block) => block.candidateIds || [])).size, "Candidate links")}
      ${metric("Unassigned Candidates", p.roadmapCandidates.filter((candidate) => !blockForCandidate(candidate.id)).length, "Available for planning")}
    </section>
    <section class="block-upgrade-board">
      ${p.blockUpgrades.map((block) => blockUpgradeCard(block)).join("") || empty("No block upgrades yet. Create one from a candidate or add a block upgrade.")}
    </section>
    <h2 class="section-title">Unassigned Candidates</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Candidate</th><th>Product</th><th>Gap / Need</th><th>Value</th><th>Effort</th><th>Risk</th><th>Action</th></tr></thead>
        <tbody>
          ${p.roadmapCandidates.filter((candidate) => !blockForCandidate(candidate.id)).map((candidate) => `<tr class="clickable-row${selectedRowClass(`candidate:${candidate.id}`)}" data-row-detail="candidate:${candidate.id}">
            <td><strong>${esc(candidate.name)}</strong><br><span class="muted">${esc(candidate.description || candidate.driver || "")}</span></td>
            <td>${esc(candidateProductName(candidate))}</td>
            <td>${esc(idsToNames(candidate.gapIds, p.gaps, "No linked gap"))}</td>
            <td>${badge(candidate.businessValue || "unknown")}</td>
            <td>${badge(candidate.effort || "unknown")}</td>
            <td>${badge(candidate.riskLevel === "high" ? "high risk" : candidate.riskLevel || "unknown")}</td>
            <td><button class="btn secondary" type="button" data-plan-block-from-candidate="${esc(candidate.id)}">Plan Block</button></td>
          </tr>`).join("") || `<tr><td colspan="7">${empty("All candidates are assigned to a block upgrade.")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function blockUpgradeCard(block) {
  const candidates = (block.candidateIds || []).map((id) => byId(state.project.roadmapCandidates, id)).filter(Boolean);
  const impacts = candidates.flatMap((candidate) => state.project.impactAssessments.filter((impact) => impact.roadmapCandidateId === candidate.id));
  const gaps = candidates.flatMap((candidate) => (candidate.gapIds || []).map((id) => byId(state.project.gaps, id)).filter(Boolean));
  return `
    <article class="card block-upgrade-card">
      <header class="block-upgrade-header">
        <div>
          <h2 class="section-title">${esc(block.name)}</h2>
          <p>${esc(block.objective || "No objective captured.")}</p>
        </div>
        <button class="btn secondary" type="button" data-detail="block:${esc(block.id)}">Edit</button>
      </header>
      <div class="summary-panel block-summary">
        <div><span>Target</span><strong>${esc(productName(block.targetProductId) || "No target")}</strong></div>
        <div><span>From</span><strong>${esc(productName(block.fromProductId) || "No source")}</strong></div>
        <div><span>Candidates</span><strong>${candidates.length}</strong></div>
        <div><span>Design Impacts</span><strong>${impacts.length}</strong></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Candidate</th><th>Need / Gap</th><th>Status</th><th>Value</th><th>Risk</th><th>Effort</th></tr></thead>
          <tbody>
            ${candidates.map((candidate) => `<tr class="clickable-row${selectedRowClass(`candidate:${candidate.id}`)}" data-row-detail="candidate:${candidate.id}">
              <td><strong>${esc(candidate.name)}</strong></td>
              <td>${esc(idsToNames(candidate.gapIds, state.project.gaps, "No linked gap"))}</td>
              <td>${badge(candidate.decisionStatus || "study")}</td>
              <td>${badge(candidate.businessValue || "unknown")}</td>
              <td>${badge(candidate.riskLevel === "high" ? "high risk" : candidate.riskLevel || "unknown")}</td>
              <td>${badge(candidate.effort || "unknown")}</td>
            </tr>`).join("") || `<tr><td colspan="6">${empty("No candidates assigned to this block.")}</td></tr>`}
          </tbody>
        </table>
      </div>
      <p class="muted">Gaps covered: ${esc(gaps.map((gap) => gap.title || gap.description || gap.id).join(", ") || "None")}</p>
      <p class="muted">Release: ${esc(block.plannedRelease || "TBD")} | Status: ${esc(title(block.status || "planning"))}</p>
    </article>
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
          ${p.evidence.map((e) => `<tr class="clickable-row${selectedRowClass(`evidence:${e.id}`)}" data-row-detail="evidence:${e.id}">
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
function productLinks(ids, fallback = "None") {
  const products = (ids || []).map((id) => byId(state.project.products, id)).filter(Boolean);
  return products.length ? `<div class="link-chip-list">${products.map((product) => `<button class="link-chip" type="button" data-product-page="${esc(product.id)}">${esc(product.name)}</button>`).join("")}</div>` : `<span class="muted">${esc(fallback)}</span>`;
}
function productNames(ids, fallback = "None") {
  const names = (ids || []).map((id) => productName(id) || id).filter(Boolean);
  return names.length ? names.join(", ") : fallback;
}
function productSatisfactionLabel(product) {
  const status = String(product?.status || "").toLowerCase();
  if (["current", "supported"].includes(status)) return "Satisfies now";
  if (["planned", "prototype"].includes(status)) return "Planned to satisfy";
  if (["retired", "obsolete"].includes(status)) return "Legacy / not active";
  return "Status not set";
}
function productSatisfactionHtml(ids = []) {
  const products = ids.map((id) => byId(state.project.products, id)).filter(Boolean);
  if (!products.length) return `<span class="muted">None selected</span>`;
  return `<ul class="product-satisfaction-list">${products.map((product) => `<li><button class="link-button" type="button" data-product-page="${esc(product.id)}">${esc(product.name)}</button><small>${esc(productSatisfactionLabel(product))} ${badge(product.status || "unknown")}</small></li>`).join("")}</ul>`;
}
function targetNeedsAddressedByProduct(productId) {
  return state.project.capabilities
    .filter(isTargetNeedCapability)
    .map((need) => {
      if ((need.satisfiedProductIds || []).includes(productId)) return { need, basis: productSatisfactionLabel(byId(state.project.products, productId)) };
      const linkedClaims = (need.linkedCapabilityIds || []).map((capabilityId) => claimForProductCapability(productId, capabilityId)).filter(Boolean);
      const activeClaim = linkedClaims.find((claim) => ["supported", "planned"].includes(claim.supportStatus));
      if (activeClaim) return { need, basis: `Via linked variation point: ${title(activeClaim.supportStatus)}` };
      return null;
    })
    .filter(Boolean);
}
function constraintsForProduct(productId) {
  return state.project.constraints.filter((constraint) => (constraint.productIds || []).includes(productId));
}
function targetNeedConstraints(targetNeedId) {
  return state.project.constraints.filter((constraint) => (constraint.relatedTargetNeedIds || []).includes(targetNeedId));
}
function productVariants(productId) { return state.project.variants.filter((variant) => variant.productId === productId); }
function capabilityName(id) { return byId(state.project.capabilities, id)?.name || id || "Unknown variation point"; }
function capabilityNames(ids, fallback = "None") {
  const names = (ids || []).map((id) => capabilityName(id)).filter(Boolean);
  return names.length ? names.join(", ") : fallback;
}
function capabilityLinks(ids, fallback = "None") {
  const links = (ids || []).map((id) => byId(state.project.capabilities, id)).filter(Boolean);
  return links.length ? `<div class="link-chip-list">${links.map((capability) => `<button class="link-chip" type="button" data-detail="capability:${esc(capability.id)}">${esc(capability.name)}</button>`).join("")}</div>` : `<span class="muted">${esc(fallback)}</span>`;
}
function linkedNeedsForCapability(capabilityId) {
  return state.project.capabilities.filter((capability) => isTargetNeedCapability(capability) && (capability.linkedCapabilityIds || []).includes(capabilityId));
}
function variantName(id) {
  const v = byId(state.project.variants, id);
  if (!v) return id || "Unknown variant";
  return `${productName(v.productId)} ${v.name} ${v.block}`.trim();
}
function productNameForVariant(variantId) {
  const variant = byId(state.project.variants, variantId);
  return productName(variant?.productId) || variantId || "Unknown product";
}
function isTargetNeedCapability(capability) {
  return capability?.recordType === "targetNeed" || String(capability?.category || "").toLowerCase() === "target need";
}
function targetNeedIdsForGapAnalysis() {
  const explicitTargetNeedIds = state.project.capabilities.filter(isTargetNeedCapability).map((capability) => capability.id);
  const linkedTargetNeedIds = state.project.gaps.map((gap) => gap.targetCapabilityId).filter(Boolean);
  return [...new Set([...explicitTargetNeedIds, ...linkedTargetNeedIds])];
}
function traceNeeds() {
  return targetNeedIdsForGapAnalysis()
    .map((id) => byId(state.project.capabilities, id))
    .filter(Boolean);
}
function selectedTraceNeedId(needs = traceNeeds()) {
  const storedId = state.project.viewSettings.traceNeedId;
  if (needs.some((need) => need.id === storedId)) return storedId;
  return needs[0]?.id || "";
}
function variationPointsForTraceNeed(need) {
  if (!need) return [];
  const linkedIds = isTargetNeedCapability(need) ? (need.linkedCapabilityIds || []) : [];
  const ids = linkedIds.length ? linkedIds : [need.id];
  return [...new Set(ids)]
    .map((id) => byId(state.project.capabilities, id))
    .filter(Boolean)
    .filter((capability) => capability.id === need.id || !isTargetNeedCapability(capability));
}
function traceProductsForCapability(capabilityId) {
  const byProductId = new Map();
  state.project.capabilityClaims
    .filter((claim) => claim.capabilityId === capabilityId)
    .forEach((claim) => {
      const variant = byId(state.project.variants, claim.variantId);
      const product = byId(state.project.products, variant?.productId);
      if (!product || byProductId.has(product.id)) return;
      byProductId.set(product.id, { product, claim });
    });
  return [...byProductId.values()];
}
function traceRowsForNeed(need) {
  const rows = [];
  variationPointsForTraceNeed(need).forEach((capability) => {
    const designLinks = linkedDesignElementsForCapability(capability.id);
    const products = traceProductsForCapability(capability.id);
    const designs = designLinks.length ? designLinks : [{ link: null, design: null }];
    const productLinks = products.length ? products : [{ product: null, claim: null }];
    designs.forEach(({ link, design }) => {
      productLinks.forEach(({ product, claim }) => {
        rows.push({ capability, link, design, product, claim });
      });
    });
  });
  return rows;
}
function candidateName(id) { return byId(state.project.roadmapCandidates, id)?.name || id || "Unknown candidate"; }
function blockName(id) { return byId(state.project.blockUpgrades, id)?.name || id || "No block"; }
function designElementName(id) { return byId(state.project.designElements, id)?.name || id || "Unknown design element"; }
function linkedDesignElementsForCapability(capabilityId) {
  return state.project.capabilityDesignLinks
    .filter((link) => link.capabilityId === capabilityId)
    .map((link) => ({ link, design: byId(state.project.designElements, link.designElementId) }))
    .filter((item) => item.design);
}
function linkedCapabilitiesForDesign(designElementId) {
  return state.project.capabilityDesignLinks
    .filter((link) => link.designElementId === designElementId)
    .map((link) => ({ link, capability: byId(state.project.capabilities, link.capabilityId) }))
    .filter((item) => item.capability);
}
function suggestedDesignImpactsForCapability(capabilityId, candidateId = "") {
  return linkedDesignElementsForCapability(capabilityId).map(({ link, design }) => {
    const existingImpact = state.project.impactAssessments.find((impact) => impact.roadmapCandidateId === candidateId && impact.designElementId === design.id);
    return { link, design, existingImpact };
  });
}
function suggestedDesignImpactsForCandidate(candidate) {
  const gap = primaryGapForCandidate(candidate);
  return suggestedDesignImpactsForCapability(gap?.targetCapabilityId, candidate?.id);
}
function candidateProductName(candidate) {
  const product = byId(state.project.products, candidate.targetProductId);
  if (product) return product.name;
  const variant = byId(state.project.variants, candidate.affectedVariantIds?.[0]);
  return productName(variant?.productId) || candidate.targetBlock || "No product selected";
}
function selectedNeedsProductId() {
  const savedId = state.project.viewSettings?.needsProductId;
  return byId(state.project.products, savedId)?.id || state.project.products.find((product) => ["current", "planned"].includes(product.status))?.id || state.project.products[0]?.id || "";
}
function evaluateNeedForProduct(need, productId) {
  if (!productId) return { status: "unknown", reason: "No product selected." };
  const linkedCapabilityIds = need.linkedCapabilityIds || [];
  if (!linkedCapabilityIds.length) return { status: "unmapped", reason: "Need is not linked to a variation point yet." };
  const claims = linkedCapabilityIds.map((capabilityId) => ({ capabilityId, claim: claimForProductCapability(productId, capabilityId) }));
  if (claims.some(({ claim }) => !claim || ["not supported", "unknown"].includes(claim.supportStatus))) return { status: "unmet", reason: "At least one linked variation point is unsupported or unknown." };
  if (claims.some(({ claim }) => claim.supportStatus === "planned")) return { status: "partial", reason: "Linked variation point is planned, not current." };
  if (claims.some(({ claim }) => !["verified"].includes(claim.maturity) || ["low", "unknown"].includes(claim.confidence))) return { status: "unverified", reason: "Support exists but evidence/confidence is not strong enough." };
  return { status: "met", reason: "Linked variation points are supported with verified evidence." };
}
function blockForCandidate(candidateId) {
  return state.project.blockUpgrades.find((block) => (block.candidateIds || []).includes(candidateId));
}
function blockIdForCandidate(candidateId) {
  return blockForCandidate(candidateId)?.id || "";
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
function assignCandidateToBlock(candidateId, blockId) {
  state.project.blockUpgrades.forEach((block) => {
    block.candidateIds = (block.candidateIds || []).filter((id) => id !== candidateId);
  });
  const candidate = byId(state.project.roadmapCandidates, candidateId);
  if (candidate) candidate.blockUpgradeId = blockId || "";
  const block = byId(state.project.blockUpgrades, blockId);
  if (block && candidateId) block.candidateIds = [...new Set([...(block.candidateIds || []), candidateId])];
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
  const designImpacts = suggestedDesignImpactsForCapability(variation?.id, resolvedCandidate?.id || "");
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
      <div class="trace-design-links">
        <h3>Design Impact Hints</h3>
        ${designImpacts.length ? `<ul class="drawer-list">${designImpacts.map(({ link, design, existingImpact }) => `<li><span><strong>${esc(design.name)}</strong><small>${esc(link.impactType || design.type || "Linked design element")} · ${esc(link.rationale || "Review this design element when this variation point changes.")}</small></span>${existingImpact ? badge("impact captured") : badge("suggested")}</li>`).join("")}</ul>` : `<div class="muted">No design elements linked to this variation point yet.</div>`}
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
function claimsForCapability(capabilityId) {
  return state.project.capabilityClaims.filter((claim) => claim.capabilityId === capabilityId);
}
function productCoverageForCapability(capabilityId) {
  return state.project.capabilityClaims.map((claim) => {
    const variant = byId(state.project.variants, claim.variantId);
    const product = byId(state.project.products, variant?.productId);
    return { claim, product };
  }).filter(({ claim, product }) => product && claim.capabilityId === capabilityId && ["supported", "planned"].includes(claim.supportStatus));
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
  $("#content").querySelectorAll("[data-product-page]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    state.view = "products";
    state.project.viewSettings.productFocusId = button.dataset.productPage;
    state.project.viewSettings.showProductFocus = true;
    render();
  }));
  $("#content").querySelectorAll("[data-product-focus]").forEach((row) => row.addEventListener("click", () => {
    state.project.viewSettings.productFocusId = row.dataset.productFocus;
    state.project.viewSettings.showProductFocus = true;
    state.selectedDetail = `product:${row.dataset.productFocus}`;
    render();
  }));
  $("#content").querySelectorAll("[data-product-list]").forEach((button) => button.addEventListener("click", () => {
    state.project.viewSettings.productFocusId = "";
    state.project.viewSettings.showProductFocus = false;
    render();
  }));
  $("#content").querySelectorAll("[data-static-toggle]").forEach((button) => button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    const collapsed = button.getAttribute("aria-expanded") === "false";
    button.setAttribute("aria-expanded", collapsed ? "true" : "false");
    if (panel) panel.classList.toggle("hidden", !collapsed);
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
  $("#content").querySelectorAll("[data-trace-need]").forEach((selectEl) => {
    selectEl.addEventListener("change", () => {
      state.project.viewSettings.traceNeedId = selectEl.value;
      render();
    });
  });
  $("#content").querySelectorAll("[data-needs-product]").forEach((selectEl) => {
    selectEl.addEventListener("change", () => {
      state.project.viewSettings.needsProductId = selectEl.value;
      render();
    });
  });
  $("#content").querySelectorAll("[data-create-gap-for-need]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      createOrOpenGapForNeed(button.dataset.createGapForNeed, button.dataset.productId);
    });
  });
  $("#content").querySelectorAll("[data-create-candidate-for-gap]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      createOrOpenCandidateForGap(button.dataset.createCandidateForGap);
    });
  });
  $("#content").querySelectorAll("[data-create-candidate-for-need]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const gap = createGapRecordForNeed(button.dataset.createCandidateForNeed, button.dataset.productId, { save: true });
      createOrOpenCandidateForGap(gap.id);
    });
  });
  $("#content").querySelectorAll("[data-plan-block-from-candidate]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      createOrOpenBlockForCandidate(button.dataset.planBlockFromCandidate);
    });
  });
  $("#content").querySelectorAll("[data-capability-filter]").forEach((selectEl) => selectEl.addEventListener("change", applyCapabilityFilters));
  $("#content").querySelectorAll("[data-capability-group-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const groupId = button.dataset.capabilityGroupToggle;
      state.project.viewSettings.capabilityGroupsCollapsed = state.project.viewSettings.capabilityGroupsCollapsed || {};
      state.project.viewSettings.capabilityGroupsCollapsed[groupId] = !state.project.viewSettings.capabilityGroupsCollapsed[groupId];
      render();
    });
  });
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
      (filters.confidence && row.dataset.capabilityConfidence !== filters.confidence)
    );
  });
}

function highlightSelectedRows() {
  document.querySelectorAll(".selected-row").forEach((row) => row.classList.remove("selected-row"));
  if (!state.selectedDetail) return;
  document.querySelectorAll(`[data-row-detail="${CSS.escape(state.selectedDetail)}"]`).forEach((row) => row.classList.add("selected-row"));
}

async function openDetail(token) {
  if ($("#drawer").classList.contains("open")) {
    if (state.selectedDetail === token) {
      await closeDrawer();
      return;
    }
    const closed = await closeDrawer();
    if (!closed) return;
  }
  state.selectedDetail = token;
  highlightSelectedRows();
  const [type, id] = token.split(":");
  if (type === "product") return openProductDrawer(byId(state.project.products, id), false);
  if (type === "capability") {
    const capability = byId(state.project.capabilities, id);
    state.view = isTargetNeedCapability(capability) ? "gaps" : "matrix";
    render();
    return openCapabilityDrawer(capability, false, isTargetNeedCapability(capability) ? "Target Need" : "Variation Point");
  }
  if (type === "design") return openDesignDrawer(byId(state.project.designElements, id), false);
  if (type === "gap") return openGapDrawer(byId(state.project.gaps, id), false);
  if (type === "candidate") return openCandidateDrawer(byId(state.project.roadmapCandidates, id), false);
  if (type === "block") return openBlockDrawer(byId(state.project.blockUpgrades, id), false);
  const map = {
    variant: ["Variant", state.project.variants, variantFields(), null, () => deleteVariant(record.id), "This will also remove linked capability claims and gaps for this variant."],
    claim: ["Capability Claim", state.project.capabilityClaims, claimFields()],
    impact: ["Impact", state.project.impactAssessments, impactFields()],
    evidence: ["Evidence", state.project.evidence, evidenceFields()],
    decision: ["Decision", state.project.decisions, decisionFields()],
    assumption: ["Assumption", state.project.assumptions, assumptionFields()],
  };
  const [label, collection, fields, normalize, onDelete, deleteMessage] = map[type] || [];
  if (type === "constraint") return openConstraintDrawer(byId(state.project.constraints, id), false);
  const record = byId(collection, id);
  if (!record) return;
  openForm(label, record.name || record.title || record.id, record, fields, (values) => {
    Object.assign(record, normalize ? normalize(values) : values);
    markDirty();
    render();
    closeDrawer();
    toast(`${label} updated.`);
  }, onDelete ? {
    deleteText: `Delete ${label}`,
    deleteMessage,
    onDelete: () => {
      onDelete();
      markDirty();
      render();
      closeDrawer();
      toast(`${label} deleted.`);
    },
  } : {});
}

async function openAdd(type) {
  if ($("#drawer").classList.contains("open")) {
    const closed = await closeDrawer();
    if (!closed) return;
  }
  if (type === "product") return openProductDrawer({ id: makeId("prod"), name: "New Product", status: "planned", description: "", notes: "", successorProductId: "" }, true);
  if (type === "capability") return openCapabilityDrawer({ id: makeId("cap"), name: "New Variation Point", category: "", description: "" }, true);
  if (type === "design") return openDesignDrawer({ id: makeId("de"), name: "New Design Element", type: "hardware", owner: "", description: "" }, true);
  if (type === "targetNeed") return openCapabilityDrawer({ id: makeId("cap"), recordType: "targetNeed", name: "New Target Need", category: "target need", marketSegment: "", stakeholder: "", satisfactionStatus: "unassessed", satisfiedProductIds: [], linkedCapabilityIds: [], description: "" }, true, "Target Need");
  if (type === "gap") return openGapDrawer({ id: makeId("gap"), title: "New Gap", targetCapabilityId: state.project.capabilities[0]?.id || "", variantId: state.project.variants[0]?.id || "", description: "", severity: "medium", businessImpact: "", technicalImpact: "", gapType: "evidence gap" }, true);
  if (type === "candidate") return openCandidateDrawer({ id: makeId("rc"), name: "New Roadmap Candidate", decisionStatus: "study", effort: "M", riskLevel: "medium", targetProductId: state.project.products[0]?.id || "", gapIds: [] }, true);
  if (type === "constraint") return openConstraintDrawer({ id: makeId("con"), name: "New Constraint", description: "", productIds: [], limitType: "operational", limitValue: "", basis: "", severity: "major caveat", workaround: "", relatedTargetNeedIds: [], relatedCapabilityIds: [], evidenceIds: [] }, true);
  if (type === "block") return openBlockDrawer({ id: makeId("blk"), name: "New Block Upgrade", targetProductId: state.project.products.find((product) => product.status === "planned")?.id || state.project.products[0]?.id || "", fromProductId: state.project.products.find((product) => product.status === "current")?.id || "", status: "planning", plannedRelease: "TBD", objective: "", candidateIds: [], notes: "" }, true);
  const map = {
    variant: ["Variant", state.project.variants, variantFields(), { id: makeId("var"), productId: state.project.products[0]?.id || "", name: "New Variant", block: "Block TBD", status: "planned" }],
    impact: ["Impact", state.project.impactAssessments, impactFields(), { id: makeId("imp"), roadmapCandidateId: state.project.roadmapCandidates[0]?.id || "", designElementId: state.project.designElements[0]?.id || "", impactType: "impact review", severity: "medium", confidence: "low", effort: "M" }],
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
  }, { isNew: true, createText: `Create ${label}`, draftLabel: label });
}

function openConstraintDrawer(constraint, isNew) {
  if (!constraint) return;
  openForm(isNew ? "Add Constraint" : "Constraint", constraint.name || constraint.id, constraint, constraintFields(), (values) => {
    Object.assign(constraint, values);
    if (isNew && !byId(state.project.constraints, constraint.id)) state.project.constraints.push(constraint);
    markDirty();
    render();
    closeDrawer();
    toast(`Constraint ${isNew ? "added" : "updated"}.`);
  }, {
    isNew,
    createText: isNew ? "Create Constraint" : "Save",
    draftLabel: "Constraint",
    ...(!isNew ? {
      deleteText: "Delete Constraint",
      deleteMessage: "This will remove the operating limit record but not linked products, needs, variation points, or evidence.",
      onDelete: () => {
        state.project.constraints = state.project.constraints.filter((item) => item.id !== constraint.id);
        markDirty();
        render();
        closeDrawer();
        toast("Constraint deleted.");
      },
    } : {}),
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
  $("#drawerFooter").innerHTML = `${isNew ? `<button class="btn danger mr-auto" data-action="discard-draft">Delete Draft</button>` : ""}<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-gap">${isNew ? "Create Gap" : "Save Gap"}</button>`;
  $("#drawer").classList.add("open", "trace-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  $("#drawerFooter [data-action='save-gap']").addEventListener("click", () => {
    if (isNew) state.drawerCloseGuard = null;
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
  if (isNew) {
    installDraftGuard({ label: "Gap", create: () => $("#drawerFooter [data-action='save-gap']")?.click() });
    $("#drawerFooter [data-action='discard-draft']").addEventListener("click", () => {
      state.drawerCloseGuard = null;
      closeDrawer({ force: true });
      toast("Gap draft deleted.");
    });
  }
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
          <button class="btn primary" type="button" data-jump-view="gaps">Evaluate Needs for This Product</button>
          <button class="btn secondary" type="button" data-jump-view="candidates">Create Upgrade Candidate</button>
        </div>
      </section>
    </form>
  `;
  $("#drawerFooter").innerHTML = `${isNew ? `<button class="btn danger mr-auto" data-action="discard-draft">Delete Draft</button>` : `<button class="btn danger mr-auto" data-action="delete-product">Delete Product</button>`}<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-product">${isNew ? "Create Product" : "Save Product"}</button>`;
  $("#drawer").classList.add("open", "product-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  const deleteButton = $("#drawerFooter [data-action='delete-product']");
  if (deleteButton) deleteButton.addEventListener("click", async () => {
    const confirmed = await confirmDestructive({
      titleText: `Delete ${product.name}?`,
      message: "This will also remove linked variants, capability claims, and gaps for this product.",
      confirmText: "Delete Product",
    });
    if (!confirmed) return;
    deleteProduct(product.id);
    markDirty();
    render();
    closeDrawer();
    toast("Product deleted.");
  });
  $("#drawerFooter [data-action='save-product']").addEventListener("click", () => {
    if (isNew) state.drawerCloseGuard = null;
    Object.assign(product, Object.fromEntries(new FormData($("#drawerForm")).entries()));
    if (isNew) state.project.products.push(product);
    markDirty();
    render();
    closeDrawer();
    toast(isNew ? "Product added." : "Product updated.");
  });
  if (isNew) {
    installDraftGuard({ label: "Product", create: () => $("#drawerFooter [data-action='save-product']")?.click() });
    $("#drawerFooter [data-action='discard-draft']").addEventListener("click", () => {
      state.drawerCloseGuard = null;
      closeDrawer({ force: true });
      toast("Product draft deleted.");
    });
  }
  $("#drawerBody").querySelectorAll("[data-jump-view]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.focusProduct) state.project.viewSettings.capabilityProductId = button.dataset.focusProduct;
      state.view = button.dataset.jumpView;
      render();
      closeDrawer();
    });
  });
}

function openDesignDrawer(design, isNew) {
  if (!design) return;
  const linkedCapabilities = isNew ? [] : linkedCapabilitiesForDesign(design.id);
  const linkedCapabilityIds = linkedCapabilities.map((item) => item.capability.id);
  const impacts = isNew ? [] : state.project.impactAssessments.filter((impact) => impact.designElementId === design.id);
  $("#drawerKicker").innerHTML = `${badge(design.type || "design")} <span class="drawer-type">Design Element</span>`;
  $("#drawerTitle").textContent = design.name || "New Design Element";
  $("#drawerBody").innerHTML = `
    <form id="drawerForm" class="capability-drawer-form">
      <section class="drawer-section">
        <h3>Design Definition</h3>
        <div class="form-grid">
          ${input("name", "Design Element Name", design.name)}
          ${select("type", "Type", ["hardware", "software", "firmware", "interface", "mechanical", "electrical", "verification", "other"], design.type || "hardware")}
          ${input("owner", "Owner / Team", design.owner)}
          ${textarea("description", "Description", design.description)}
        </div>
      </section>
      <section class="drawer-section">
        <h3>Linked Variation Points</h3>
        ${capabilityCheckboxes("capabilityIds", "Variation Points That Can Impact This Design Element", linkedCapabilityIds)}
      </section>
      <section class="drawer-section">
        <h3>Trace Summary</h3>
        <ul class="drawer-list">
          ${impacts.map((impact) => `<li><span>${esc(candidateName(impact.roadmapCandidateId))}<small>${esc(impact.impactType || "Impact")} · ${esc(impact.owner || design.owner || "No owner")}</small></span>${badge(impact.severity || "unknown")}</li>`).join("") || "<li><span>No roadmap impacts captured for this design element yet.</span></li>"}
        </ul>
      </section>
    </form>
  `;
  $("#drawerFooter").innerHTML = `${isNew ? `<button class="btn danger mr-auto" data-action="discard-draft">Delete Draft</button>` : `<button class="btn danger mr-auto" data-action="delete-design">Delete Design Element</button>`}<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-design">${isNew ? "Create Design Element" : "Save Design Element"}</button>`;
  $("#drawer").classList.add("open", "capability-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  const deleteButton = $("#drawerFooter [data-action='delete-design']");
  if (deleteButton) deleteButton.addEventListener("click", async () => {
    const confirmed = await confirmDestructive({
      titleText: `Delete ${design.name}?`,
      message: "This will remove its variation-point links and impact rows.",
      confirmText: "Delete Design Element",
    });
    if (!confirmed) return;
    deleteDesignElement(design.id);
    markDirty();
    render();
    closeDrawer();
    toast("Design element deleted.");
  });
  $("#drawerFooter [data-action='save-design']").addEventListener("click", () => {
    if (isNew) state.drawerCloseGuard = null;
    const form = $("#drawerForm");
    const values = Object.fromEntries(new FormData(form).entries());
    Object.assign(design, { name: values.name, type: values.type, owner: values.owner, description: values.description });
    if (isNew && !byId(state.project.designElements, design.id)) state.project.designElements.push(design);
    syncDesignCapabilityLinks(design.id, new FormData(form).getAll("capabilityIds"));
    markDirty();
    render();
    closeDrawer();
    toast(isNew ? "Design element added." : "Design element updated.");
  });
  if (isNew) {
    installDraftGuard({ label: "Design Element", create: () => $("#drawerFooter [data-action='save-design']")?.click() });
    $("#drawerFooter [data-action='discard-draft']").addEventListener("click", () => {
      state.drawerCloseGuard = null;
      closeDrawer({ force: true });
      toast("Design element draft deleted.");
    });
  }
}

function openBlockDrawer(block, isNew) {
  if (!block) return;
  openForm(isNew ? "Add Block Upgrade" : "Block Upgrade", block.name || block.id, block, blockFields(), (values) => {
    Object.assign(block, values);
    if (isNew && !byId(state.project.blockUpgrades, block.id)) state.project.blockUpgrades.push(block);
    state.project.roadmapCandidates.forEach((candidate) => {
      if ((block.candidateIds || []).includes(candidate.id)) candidate.blockUpgradeId = block.id;
      else if (candidate.blockUpgradeId === block.id) candidate.blockUpgradeId = "";
    });
    markDirty();
    render();
    closeDrawer();
    toast(`Block upgrade ${isNew ? "added" : "updated"}.`);
  }, {
    isNew,
    createText: isNew ? "Create Block Upgrade" : "Save",
    draftLabel: "Block Upgrade",
    ...(!isNew ? {
      deleteText: "Delete Block Upgrade",
      deleteMessage: "This removes the block plan but keeps products, needs, candidates, gaps, and impacts.",
      onDelete: () => {
        state.project.roadmapCandidates.forEach((candidate) => {
          if (candidate.blockUpgradeId === block.id) candidate.blockUpgradeId = "";
        });
        state.project.blockUpgrades = state.project.blockUpgrades.filter((item) => item.id !== block.id);
        markDirty();
        render();
        closeDrawer();
        toast("Block upgrade deleted.");
      },
    } : {}),
  });
}

function openCandidateDrawer(candidate, isNew) {
  if (!candidate) return;
  candidate.blockUpgradeId = candidate.blockUpgradeId || blockIdForCandidate(candidate.id);
  const suggestedImpacts = isNew ? [] : suggestedDesignImpactsForCandidate(candidate);
  $("#drawerKicker").innerHTML = `${badge(candidate.decisionStatus || "study")} <span class="drawer-type">Roadmap Candidate</span>`;
  $("#drawerTitle").textContent = candidate.name || "New Roadmap Candidate";
  $("#drawerBody").innerHTML = `
    <form id="drawerForm" class="form-grid">
      ${candidateFields(candidate.id).map((field) => renderField(field, candidate[field.name] ?? (field.name === "gapId" ? candidate.gapIds?.[0] : ""))).join("")}
    </form>
    ${variationTraceGraphic({ candidate })}
    <section class="drawer-section">
      <h3>Suggested Design Impacts</h3>
      ${suggestedImpacts.length ? `<ul class="drawer-list">${suggestedImpacts.map(({ link, design, existingImpact }) => `<li><span><strong>${esc(design.name)}</strong><small>${esc(link.impactType || "Impact review")} · ${esc(link.rationale || "Linked to the selected variation point.")}</small></span>${existingImpact ? badge("captured") : badge("missing")}</li>`).join("")}</ul><button class="btn primary full-width" type="button" data-action="create-suggested-impacts">Create Missing Impact Rows</button>` : `<div class="muted">Link this candidate to a gap whose variation point has design links to get impact suggestions.</div>`}
    </section>
  `;
  $("#drawerFooter").innerHTML = `${isNew ? `<button class="btn danger mr-auto" data-action="discard-draft">Delete Draft</button>` : ""}<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-candidate">${isNew ? "Create Candidate" : "Save Candidate"}</button>`;
  $("#drawer").classList.add("open", "trace-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  $("#drawerFooter [data-action='save-candidate']").addEventListener("click", () => {
    if (isNew) state.drawerCloseGuard = null;
    const values = Object.fromEntries(new FormData($("#drawerForm")).entries());
    const normalized = normalizeCandidateForm(values);
    Object.assign(candidate, normalized);
    if (isNew && !byId(state.project.roadmapCandidates, candidate.id)) state.project.roadmapCandidates.push(candidate);
    if (normalized.gapIds[0]) assignCandidateToGap(candidate.id, normalized.gapIds[0]);
    assignCandidateToBlock(candidate.id, normalized.blockUpgradeId);
    markDirty();
    render();
    closeDrawer();
    toast(isNew ? "Roadmap candidate added." : "Roadmap candidate updated.");
  });
  if (isNew) {
    installDraftGuard({ label: "Roadmap Candidate", create: () => $("#drawerFooter [data-action='save-candidate']")?.click() });
    $("#drawerFooter [data-action='discard-draft']").addEventListener("click", () => {
      state.drawerCloseGuard = null;
      closeDrawer({ force: true });
      toast("Roadmap candidate draft deleted.");
    });
  }
  const createImpactsButton = $("#drawerBody [data-action='create-suggested-impacts']");
  if (createImpactsButton) createImpactsButton.addEventListener("click", () => {
    const normalized = normalizeCandidateForm(Object.fromEntries(new FormData($("#drawerForm")).entries()));
    Object.assign(candidate, normalized);
    if (normalized.gapIds[0]) assignCandidateToGap(candidate.id, normalized.gapIds[0]);
    assignCandidateToBlock(candidate.id, normalized.blockUpgradeId);
    const created = createMissingSuggestedImpacts(candidate);
    markDirty();
    if (!created) {
      render();
      openCandidateDrawer(candidate, false);
      return toast("No missing impact rows to create.");
    }
    render();
    openCandidateDrawer(candidate, false);
    toast(`${created} impact row${created === 1 ? "" : "s"} created.`);
  });
}

function openCapabilityDrawer(capability, isNew, contextLabel = "Variation Point", options = {}) {
  if (!capability) return;
  let drawerDirty = false;
  const isTargetNeed = contextLabel === "Target Need";
  const referenceTargetNeed = byId(state.project.capabilities, options.referenceTargetNeedId);
  const focusProductId = selectedCapabilityProductId();
  const focusClaim = isNew ? null : claimForProductCapability(focusProductId, capability.id);
  const capabilityClaims = isNew ? [] : claimsForCapability(capability.id);
  const selectedSupportProductIds = isNew ? (referenceTargetNeed?.satisfiedProductIds || []) : productIdsForCapability(capability.id);
  const defaultSupportStatus = capabilityClaims.find((claim) => claim.supportStatus && claim.supportStatus !== "unknown")?.supportStatus || focusClaim?.supportStatus || "planned";
  const defaultMaturity = capabilityClaims.find((claim) => claim.maturity && claim.maturity !== "unknown")?.maturity || focusClaim?.maturity || "unknown";
  const defaultConfidence = capabilityClaims.find((claim) => claim.confidence && claim.confidence !== "unknown")?.confidence || focusClaim?.confidence || "unknown";
  const linkedDesign = isNew ? [] : linkedDesignElementsForCapability(capability.id);
  const linkedDesignIds = linkedDesign.map((item) => item.design.id);
  const claims = capabilityClaims;
  const gaps = isNew ? [] : state.project.gaps.filter((gap) => gap.targetCapabilityId === capability.id);
  const categoryLabel = capability.category || "";
  $("#drawerKicker").innerHTML = categoryLabel && title(categoryLabel) !== contextLabel ? `${badge(categoryLabel)} <span class="drawer-type">${esc(contextLabel)}</span>` : esc(contextLabel);
  $("#drawerTitle").textContent = capability.name || "New Variation Point";
  $("#drawerBody").innerHTML = `
    <form id="drawerForm" class="capability-drawer-form">
      <section class="drawer-section">
        <div class="form-grid">
          ${input("name", `${contextLabel} Name`, capability.name)}
          ${capabilityTypeInput("category", "Type", capability.category, contextLabel)}
          ${textarea("description", "Description", capability.description)}
        </div>
      </section>
      ${referenceTargetNeed ? `<section class="drawer-section reference-panel">
        <h3>Need Reference</h3>
        <div class="reference-summary">
          <strong>${esc(referenceTargetNeed.name)}</strong>
          <span>${esc([referenceTargetNeed.marketSegment, referenceTargetNeed.stakeholder].filter(Boolean).join(" · ") || "Target need")}</span>
          <p>${esc(referenceTargetNeed.description || "No description captured.")}</p>
        </div>
      </section>` : ""}
      ${isTargetNeed ? `<section class="drawer-section status-panel">
        <h3>Stakeholder And Satisfaction</h3>
        <div class="support-link-grid">
          ${input("marketSegment", "Market Segment", capability.marketSegment || "")}
          ${input("stakeholder", "Stakeholder", capability.stakeholder || "")}
          ${select("satisfactionStatus", "Need Status", ["unassessed", "met", "partially met", "not met"], capability.satisfactionStatus || "unassessed")}
          ${productCheckboxes("satisfiedProductIds", "Products That Meet This Need", capability.satisfiedProductIds || [])}
        </div>
      </section>` : ""}
      ${isTargetNeed ? `<section class="drawer-section">
        <h3>Linked Variation Points</h3>
        ${variationPointCheckboxes("linkedCapabilityIds", "Variation Points That Satisfy Or Drive This Need", capability.linkedCapabilityIds || [])}
        <button class="btn primary full-width" type="button" data-action="create-linked-capability">Create Linked Variation Point</button>
      </section>` : ""}
      ${isTargetNeed ? `<section class="drawer-section">
        <h3>Constraints / Operating Limits</h3>
        ${targetNeedConstraints(capability.id).length ? `<ul class="drawer-list">${targetNeedConstraints(capability.id).map((constraint) => `<li><button class="link-button" type="button" data-detail="constraint:${esc(constraint.id)}">${esc(constraint.name)}</button><span>${badge(constraint.severity || "major caveat")}</span></li>`).join("")}</ul>` : `<div class="muted">No constraints linked to this target need yet.</div>`}
        <button class="btn secondary full-width" type="button" data-action="create-linked-constraint">Create Linked Constraint</button>
      </section>` : ""}
      ${isTargetNeed ? "" : `<section class="drawer-section status-panel">
        <h3>Product Support / Evidence</h3>
        <div class="support-link-grid">
          ${select("supportStatus", "Support Status For Selected Products", ["supported", "not supported", "planned", "unknown"], defaultSupportStatus)}
          ${select("maturity", "Evidence Maturity", ["verified", "analysis", "simulation", "assumption", "unknown"], defaultMaturity)}
          ${select("confidence", "Confidence", ["low", "medium", "high", "unknown"], defaultConfidence)}
          ${productCheckboxes("supportProductIds", "Products That Get This Variation Point", selectedSupportProductIds)}
        </div>
      </section>`}
      <section class="drawer-section">
        <h3>Design Impact Links</h3>
        ${designElementCheckboxes("designElementIds", `Design Elements Impacted By This ${contextLabel}`, linkedDesignIds)}
      </section>
      <section class="drawer-section">
        <h3>Trace Summary</h3>
        <div class="summary-panel">
          <div><span>Claims</span><strong>${claims.length}</strong></div>
          <div><span>Open Gaps</span><strong>${gaps.length}</strong></div>
          <div><span>Design Links</span><strong>${linkedDesign.length}</strong></div>
          <div><span>Evidence</span><strong>${esc(capabilityEvidenceSummary(capability.id))}</strong></div>
        </div>
      </section>
      ${!isTargetNeed ? `<section class="drawer-section">
        <h3>Linked Target Needs</h3>
        ${capabilityLinks(linkedNeedsForCapability(capability.id).map((need) => need.id), "No linked needs yet")}
      </section>` : ""}
    </form>
  `;
  $("#drawerFooter").innerHTML = isNew
    ? `<button class="btn danger mr-auto" data-action="discard-draft">Delete Draft</button><button class="btn primary" data-action="create-capability">Create ${esc(contextLabel)}</button>`
    : `<button class="btn danger mr-auto" data-action="delete-capability">Delete ${esc(contextLabel)}</button>`;
  $("#drawer").classList.add("open", "capability-detail-drawer", "autosave-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "false");
  const saveCapabilityForm = ({ keepOpen = false, showToast = false } = {}) => {
    const form = $("#drawerForm");
    if (!form) return false;
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    Object.assign(capability, { name: values.name, category: values.category, description: values.description });
    if (isTargetNeed) {
      Object.assign(capability, {
        recordType: "targetNeed",
        marketSegment: values.marketSegment || "",
        stakeholder: values.stakeholder || "",
        satisfactionStatus: values.satisfactionStatus || "unassessed",
        satisfiedProductIds: formData.getAll("satisfiedProductIds"),
        linkedCapabilityIds: formData.getAll("linkedCapabilityIds"),
      });
    }
    if (isNew && !byId(state.project.capabilities, capability.id)) state.project.capabilities.push(capability);
    if (referenceTargetNeed) {
      referenceTargetNeed.linkedCapabilityIds = [...new Set([...(referenceTargetNeed.linkedCapabilityIds || []), capability.id])];
    }
    syncCapabilityDesignLinks(capability.id, formData.getAll("designElementIds"));
    if (!isTargetNeed) {
      const selectedProductIds = formData.getAll("supportProductIds");
      const selectedVariantIds = selectedProductIds.map((productId) => primaryVariantForProduct(productId).id);
      state.project.capabilityClaims = state.project.capabilityClaims.filter((claim) => claim.capabilityId !== capability.id || selectedVariantIds.includes(claim.variantId));
      selectedProductIds.forEach((productId) => {
        const variant = primaryVariantForProduct(productId);
        let claim = state.project.capabilityClaims.find((item) => item.variantId === variant.id && item.capabilityId === capability.id);
        if (!claim) {
          claim = { id: makeId("claim"), variantId: variant.id, capabilityId: capability.id, supportStatus: "unknown", maturity: "unknown", confidence: "unknown", evidenceIds: [], notes: "" };
          state.project.capabilityClaims.push(claim);
        }
        Object.assign(claim, { supportStatus: values.supportStatus || "unknown", maturity: values.maturity || "unknown", confidence: values.confidence || "unknown" });
      });
    }
    state.project.viewSettings.capabilityProductId = focusProductId || "";
    markDirty();
    render();
    drawerDirty = false;
    if (keepOpen) openCapabilityDrawer(capability, false, contextLabel, options);
    if (showToast) toast(isNew ? `${contextLabel} added.` : `${contextLabel} updated.`);
    return true;
  };
  state.drawerBeforeClose = isNew ? null : () => {
    if (drawerDirty) saveCapabilityForm();
  };
  if (isNew) installDraftGuard({
    label: contextLabel,
    create: () => {
      saveCapabilityForm({ showToast: true });
    },
  });
  $("#drawerForm").addEventListener("input", () => { drawerDirty = true; });
  $("#drawerForm").addEventListener("change", (event) => {
    drawerDirty = true;
    if (event.target?.name === "supportStatus") saveCapabilityForm();
  });
  const createLinkedButton = $("#drawerBody [data-action='create-linked-capability']");
  if (createLinkedButton) createLinkedButton.addEventListener("click", () => {
    saveCapabilityForm();
    const linkedCapability = {
      id: makeId("cap"),
      name: capability.name && capability.name !== "New Target Need" ? `${capability.name} Capability` : "New Variation Point",
      category: "",
      description: capability.description || "",
    };
    openCapabilityDrawer(linkedCapability, true, "Variation Point", { referenceTargetNeedId: capability.id });
  });
  const createLinkedConstraintButton = $("#drawerBody [data-action='create-linked-constraint']");
  if (createLinkedConstraintButton) createLinkedConstraintButton.addEventListener("click", () => {
    saveCapabilityForm();
    state.drawerBeforeClose = null;
    state.drawerCloseGuard = null;
    const linkedConstraint = {
      id: makeId("con"),
      name: capability.name && capability.name !== "New Target Need" ? `${capability.name} Constraint` : "New Constraint",
      description: capability.description || "",
      productIds: [],
      limitType: "operational",
      limitValue: "",
      basis: "",
      severity: capability.satisfactionStatus === "not met" ? "blocker" : "major caveat",
      workaround: "",
      relatedTargetNeedIds: [capability.id],
      relatedCapabilityIds: capability.linkedCapabilityIds || [],
      evidenceIds: [],
    };
    state.selectedDetail = `constraint:${linkedConstraint.id}`;
    openConstraintDrawer(linkedConstraint, true);
  });
  const createButton = $("#drawerFooter [data-action='create-capability']");
  if (createButton) createButton.addEventListener("click", () => {
    state.drawerCloseGuard = null;
    saveCapabilityForm({ showToast: true });
    closeDrawer({ force: true });
  });
  const discardButton = $("#drawerFooter [data-action='discard-draft']");
  if (discardButton) discardButton.addEventListener("click", () => {
    state.drawerCloseGuard = null;
    closeDrawer({ force: true });
    toast(`${contextLabel} draft deleted.`);
  });
  const deleteButton = $("#drawerFooter [data-action='delete-capability']");
  if (deleteButton) deleteButton.addEventListener("click", async () => {
    const confirmed = await confirmDestructive({
      titleText: `Delete ${capability.name}?`,
      message: "This will also remove linked claims, gaps, and target references.",
      confirmText: `Delete ${contextLabel}`,
    });
    if (!confirmed) return;
    state.drawerBeforeClose = null;
    deleteCapability(capability.id);
    markDirty();
    render();
    closeDrawer();
    toast(`${contextLabel} deleted.`);
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
  state.project.constraints.forEach((constraint) => {
    constraint.productIds = (constraint.productIds || []).filter((id) => id !== productId);
  });
  state.project.roadmapCandidates.forEach((candidate) => {
    candidate.gapIds = (candidate.gapIds || []).filter((id) => !gapIds.includes(id));
    if (candidate.targetProductId === productId) candidate.targetProductId = "";
  });
}

function deleteVariant(variantId) {
  const gapIds = state.project.gaps.filter((gap) => gap.variantId === variantId).map((gap) => gap.id);
  state.project.variants = state.project.variants.filter((variant) => variant.id !== variantId);
  state.project.capabilityClaims = state.project.capabilityClaims.filter((claim) => claim.variantId !== variantId);
  state.project.gaps = state.project.gaps.filter((gap) => gap.variantId !== variantId);
  state.project.roadmapCandidates.forEach((candidate) => {
    candidate.gapIds = (candidate.gapIds || []).filter((id) => !gapIds.includes(id));
  });
}

function deleteCapability(capabilityId) {
  const gapIds = state.project.gaps.filter((gap) => gap.targetCapabilityId === capabilityId).map((gap) => gap.id);
  state.project.capabilities = state.project.capabilities.filter((capability) => capability.id !== capabilityId);
  state.project.capabilityClaims = state.project.capabilityClaims.filter((claim) => claim.capabilityId !== capabilityId);
  state.project.capabilityDesignLinks = state.project.capabilityDesignLinks.filter((link) => link.capabilityId !== capabilityId);
  state.project.gaps = state.project.gaps.filter((gap) => gap.targetCapabilityId !== capabilityId);
  state.project.constraints.forEach((constraint) => {
    constraint.relatedTargetNeedIds = (constraint.relatedTargetNeedIds || []).filter((id) => id !== capabilityId);
    constraint.relatedCapabilityIds = (constraint.relatedCapabilityIds || []).filter((id) => id !== capabilityId);
  });
  state.project.capabilities.forEach((capability) => {
    if (capability.linkedCapabilityIds) capability.linkedCapabilityIds = capability.linkedCapabilityIds.filter((id) => id !== capabilityId);
  });
  state.project.roadmapCandidates.forEach((candidate) => {
    candidate.gapIds = (candidate.gapIds || []).filter((id) => !gapIds.includes(id));
  });
}

function deleteDesignElement(designElementId) {
  state.project.designElements = state.project.designElements.filter((design) => design.id !== designElementId);
  state.project.capabilityDesignLinks = state.project.capabilityDesignLinks.filter((link) => link.designElementId !== designElementId);
  state.project.impactAssessments = state.project.impactAssessments.filter((impact) => impact.designElementId !== designElementId);
}

function syncCapabilityDesignLinks(capabilityId, designElementIds) {
  const selectedIds = new Set(designElementIds);
  state.project.capabilityDesignLinks = state.project.capabilityDesignLinks.filter((link) => link.capabilityId !== capabilityId || selectedIds.has(link.designElementId));
  designElementIds.forEach((designElementId) => {
    const exists = state.project.capabilityDesignLinks.some((link) => link.capabilityId === capabilityId && link.designElementId === designElementId);
    if (!exists) {
      state.project.capabilityDesignLinks.push({ id: makeId("cdl"), capabilityId, designElementId, impactType: "impact review", rationale: "Review this design element when this variation point changes." });
    }
  });
}

function syncDesignCapabilityLinks(designElementId, capabilityIds) {
  const selectedIds = new Set(capabilityIds);
  state.project.capabilityDesignLinks = state.project.capabilityDesignLinks.filter((link) => link.designElementId !== designElementId || selectedIds.has(link.capabilityId));
  capabilityIds.forEach((capabilityId) => {
    const exists = state.project.capabilityDesignLinks.some((link) => link.capabilityId === capabilityId && link.designElementId === designElementId);
    if (!exists) {
      state.project.capabilityDesignLinks.push({ id: makeId("cdl"), capabilityId, designElementId, impactType: "impact review", rationale: "Review this design element when this variation point changes." });
    }
  });
}

function createMissingSuggestedImpacts(candidate) {
  let created = 0;
  suggestedDesignImpactsForCandidate(candidate).forEach(({ link, design, existingImpact }) => {
    if (existingImpact) return;
    state.project.impactAssessments.push({
      id: makeId("imp"),
      roadmapCandidateId: candidate.id,
      designElementId: design.id,
      impactType: link.impactType || "impact review",
      severity: "medium",
      confidence: "medium",
      owner: design.owner || "",
      effort: "M",
      scheduleDriver: "",
      verificationConsequence: "",
      riskConsequence: "",
      basis: link.rationale || `Suggested from ${capabilityName(link.capabilityId)} design link.`,
    });
    created += 1;
  });
  return created;
}

function createGapRecordForNeed(needId, productId, { save = false } = {}) {
  const existing = state.project.gaps.find((gap) => gap.targetCapabilityId === needId && byId(state.project.variants, gap.variantId)?.productId === productId);
  if (existing) return existing;
  const need = byId(state.project.capabilities, needId);
  const variant = primaryVariantForProduct(productId || selectedNeedsProductId());
  const evaluation = evaluateNeedForProduct(need, variant.productId);
  const gap = {
    id: makeId("gap"),
    title: `${need?.name || "Need"} Gap`,
    targetCapabilityId: needId,
    variantId: variant.id,
    description: evaluation.reason || "Need is not met by the selected product.",
    severity: evaluation.status === "unmapped" ? "medium" : "high",
    businessImpact: need?.marketSegment ? `Blocks ${need.marketSegment} need.` : "Blocks target need.",
    technicalImpact: (need?.linkedCapabilityIds || []).map((id) => capabilityName(id)).join(", ") || "Map this need to variation points and design elements.",
    gapType: evaluation.status === "unverified" ? "evidence gap" : "true design gap",
  };
  if (save) state.project.gaps.push(gap);
  return gap;
}

function createOrOpenGapForNeed(needId, productId) {
  const existing = state.project.gaps.find((gap) => gap.targetCapabilityId === needId && byId(state.project.variants, gap.variantId)?.productId === productId);
  if (existing) return openDetail(`gap:${existing.id}`);
  openGapDrawer(createGapRecordForNeed(needId, productId), true);
}

function createOrOpenCandidateForGap(gapId) {
  const existing = candidateForGap(gapId);
  if (existing) return openDetail(`candidate:${existing.id}`);
  const gap = byId(state.project.gaps, gapId);
  const productId = byId(state.project.variants, gap?.variantId)?.productId || selectedNeedsProductId();
  const candidate = {
    id: makeId("rc"),
    name: `${capabilityName(gap?.targetCapabilityId)} Upgrade`,
    description: `Close ${gap?.title || "selected gap"}.`,
    driver: gap?.title || gap?.description || "Unmet need",
    targetProductId: productId,
    gapIds: [gapId],
    businessValue: "medium",
    effort: "M",
    riskLevel: gap?.severity === "high" ? "high" : "medium",
    scheduleDrivers: "",
    assumptions: "",
    decisionStatus: "study",
    blockUpgradeId: "",
  };
  openCandidateDrawer(candidate, true);
}

function createOrOpenBlockForCandidate(candidateId) {
  const existing = blockForCandidate(candidateId);
  if (existing) return openDetail(`block:${existing.id}`);
  const candidate = byId(state.project.roadmapCandidates, candidateId);
  const block = {
    id: makeId("blk"),
    name: `${candidateProductName(candidate)} Block Upgrade`,
    targetProductId: candidate?.targetProductId || state.project.products[0]?.id || "",
    fromProductId: state.project.products.find((product) => product.status === "current")?.id || "",
    status: "planning",
    plannedRelease: "TBD",
    objective: candidate ? `Plan a block upgrade around ${candidate.name}.` : "",
    candidateIds: [candidateId],
    notes: "",
  };
  openBlockDrawer(block, true);
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
    blockUpgradeId: values.blockUpgradeId || "",
  };
}

function openForm(kicker, titleText, record, fields, onSave, options = {}) {
  $("#drawerKicker").textContent = kicker;
  $("#drawerTitle").textContent = titleText;
  $("#drawerBody").innerHTML = `<form id="drawerForm" class="form-grid">${fields.map((f) => renderField(f, record[f.name] ?? (f.name === "gapId" ? record.gapIds?.[0] : ""))).join("")}</form>`;
  $("#drawerFooter").innerHTML = `${options.isNew ? `<button class="btn danger mr-auto" data-action="discard-draft">Delete Draft</button>` : options.onDelete ? `<button class="btn danger mr-auto" data-action="delete-drawer-record">${esc(options.deleteText || "Delete")}</button>` : ""}<button class="btn secondary" data-action="close-drawer">Cancel</button><button class="btn primary" data-action="save-drawer">${esc(options.createText || "Save")}</button>`;
  $("#drawer").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerFooter [data-action='close-drawer']").addEventListener("click", closeDrawer);
  const deleteButton = $("#drawerFooter [data-action='delete-drawer-record']");
  if (deleteButton) deleteButton.addEventListener("click", async () => {
    const confirmed = await confirmDestructive({
      titleText: `${options.deleteText || "Delete"}?`,
      message: options.deleteMessage || "This action cannot be undone.",
      confirmText: options.deleteText || "Delete",
    });
    if (confirmed) options.onDelete();
  });
  $("#drawerFooter [data-action='save-drawer']").addEventListener("click", () => {
    if (options.isNew) state.drawerCloseGuard = null;
    const formData = new FormData($("#drawerForm"));
    const values = Object.fromEntries(formData.entries());
    fields.forEach((f) => {
      if (f.type === "ids") values[f.name] = String(values[f.name] || "").split(",").map((v) => v.trim()).filter(Boolean);
      if (["products", "targetNeeds", "variationPoints", "evidence", "candidates"].includes(f.type)) values[f.name] = formData.getAll(f.name);
      if (f.type === "date" && !values[f.name]) values[f.name] = "";
    });
    onSave(values);
  });
  if (options.isNew) {
    installDraftGuard({ label: options.draftLabel || kicker, create: () => $("#drawerFooter [data-action='save-drawer']")?.click() });
    $("#drawerFooter [data-action='discard-draft']").addEventListener("click", () => {
      state.drawerCloseGuard = null;
      closeDrawer({ force: true });
      toast(`${options.draftLabel || kicker} draft deleted.`);
    });
  }
}

function renderField(field, value) {
  if (field.type === "textarea") return textarea(field.name, field.label, value);
  if (field.type === "select") return select(field.name, field.label, field.options, value);
  if (field.type === "product") return productSelect(field.name, field.label, value);
  if (field.type === "products") return productCheckboxes(field.name, field.label, value || []);
  if (field.type === "targetNeeds") return targetNeedCheckboxes(field.name, field.label, value || []);
  if (field.type === "variationPoints") return variationPointCheckboxes(field.name, field.label, value || []);
  if (field.type === "evidence") return evidenceCheckboxes(field.name, field.label, value || []);
  if (field.type === "gap") return gapSelect(field.name, field.label, value, field.currentCandidateId || "");
  if (field.type === "design") return designElementSelect(field.name, field.label, value);
  if (field.type === "candidate") return roadmapCandidateSelect(field.name, field.label, value);
  if (field.type === "block") return blockUpgradeSelect(field.name, field.label, value);
  if (field.type === "candidates") return candidateCheckboxes(field.name, field.label, value || []);
  if (field.type === "ids") return input(field.name, `${field.label} (comma-separated IDs)`, (value || []).join(", "));
  return input(field.name, field.label, value, field.type || "text");
}

function input(name, labelText, value = "", type = "text") {
  return `<label>${esc(labelText)}<input class="field" type="${esc(type)}" name="${esc(name)}" value="${esc(value)}"></label>`;
}
function capabilityTypeInput(name, labelText, value = "", contextLabel = "Variation Point") {
  const listId = `${name}-${badgeClass(contextLabel)}-options`;
  const types = [...new Set(state.project.capabilities
    .filter((capability) => contextLabel === "Target Need" ? isTargetNeedCapability(capability) : !isTargetNeedCapability(capability))
    .map((capability) => capability.category)
    .filter(Boolean))];
  return `<label>${esc(labelText)}<input class="field" list="${esc(listId)}" name="${esc(name)}" value="${esc(value)}"><datalist id="${esc(listId)}">${types.map((type) => `<option value="${esc(type)}"></option>`).join("")}</datalist></label>`;
}
function textarea(name, labelText, value = "") {
  return `<label>${esc(labelText)}<textarea name="${esc(name)}">${esc(value)}</textarea></label>`;
}
function select(name, labelText, options, value = "") {
  const selectedValue = options.includes(value) ? value : options.includes("unknown") ? "unknown" : value;
  return `<label>${esc(labelText)}<select name="${esc(name)}">${options.map((option) => `<option value="${esc(option)}" ${option === selectedValue ? "selected" : ""}>${esc(title(option))}</option>`).join("")}</select></label>`;
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
function designElementSelect(name, labelText, value = "") {
  return `<label>${esc(labelText)}<select name="${esc(name)}">${state.project.designElements.map((design) => `<option value="${esc(design.id)}" ${design.id === value ? "selected" : ""}>${esc(design.name)}</option>`).join("")}</select></label>`;
}
function roadmapCandidateSelect(name, labelText, value = "") {
  return `<label>${esc(labelText)}<select name="${esc(name)}">${state.project.roadmapCandidates.map((candidate) => `<option value="${esc(candidate.id)}" ${candidate.id === value ? "selected" : ""}>${esc(candidate.name)}</option>`).join("")}</select></label>`;
}
function blockUpgradeSelect(name, labelText, value = "") {
  return `<label>${esc(labelText)}<select name="${esc(name)}"><option value="">No block assigned</option>${state.project.blockUpgrades.map((block) => `<option value="${esc(block.id)}" ${block.id === value ? "selected" : ""}>${esc(block.name)}</option>`).join("")}</select></label>`;
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
function productCoverageList(items = []) {
  return `
    <ul class="product-coverage-list">
      ${items.map(({ product, claim }) => `<li><span>${esc(product.name)}</span>${badge(claim.supportStatus)}</li>`).join("") || `<li><span>No products currently show this variation point as supported or planned.</span>${badge("none")}</li>`}
    </ul>
  `;
}
function capabilityCheckboxes(name, labelText, selectedIds = []) {
  const capabilities = state.project.capabilities.filter((capability) => !isTargetNeedCapability(capability));
  return `
    <fieldset class="checkbox-field">
      <legend>${esc(labelText)}</legend>
      <div class="checkbox-list">
        ${capabilities.map((capability) => `<label><input type="checkbox" name="${esc(name)}" value="${esc(capability.id)}" ${selectedIds.includes(capability.id) ? "checked" : ""}> <span>${esc(capability.name)}</span></label>`).join("") || `<span class="muted">No variation points yet.</span>`}
      </div>
    </fieldset>
  `;
}
function variationPointCheckboxes(name, labelText, selectedIds = []) {
  const capabilities = state.project.capabilities.filter((capability) => !isTargetNeedCapability(capability));
  return `
    <fieldset class="checkbox-field">
      <legend>${esc(labelText)}</legend>
      <div class="checkbox-list">
        ${capabilities.map((capability) => `<label><input type="checkbox" name="${esc(name)}" value="${esc(capability.id)}" ${selectedIds.includes(capability.id) ? "checked" : ""}> <span>${esc(capability.name)}</span></label>`).join("") || `<span class="muted">No variation points yet.</span>`}
      </div>
    </fieldset>
  `;
}
function targetNeedCheckboxes(name, labelText, selectedIds = []) {
  const targetNeeds = state.project.capabilities.filter(isTargetNeedCapability);
  return `
    <fieldset class="checkbox-field">
      <legend>${esc(labelText)}</legend>
      <div class="checkbox-list">
        ${targetNeeds.map((need) => `<label><input type="checkbox" name="${esc(name)}" value="${esc(need.id)}" ${selectedIds.includes(need.id) ? "checked" : ""}> <span>${esc(need.name)}</span></label>`).join("") || `<span class="muted">No target needs yet.</span>`}
      </div>
    </fieldset>
  `;
}
function evidenceCheckboxes(name, labelText, selectedIds = []) {
  return `
    <fieldset class="checkbox-field">
      <legend>${esc(labelText)}</legend>
      <div class="checkbox-list">
        ${state.project.evidence.map((evidence) => `<label><input type="checkbox" name="${esc(name)}" value="${esc(evidence.id)}" ${selectedIds.includes(evidence.id) ? "checked" : ""}> <span>${esc(evidence.title)}</span></label>`).join("") || `<span class="muted">No evidence yet.</span>`}
      </div>
    </fieldset>
  `;
}
function designElementCheckboxes(name, labelText, selectedIds = []) {
  return `
    <fieldset class="checkbox-field">
      <legend>${esc(labelText)}</legend>
      <div class="checkbox-list">
        ${state.project.designElements.map((design) => `<label><input type="checkbox" name="${esc(name)}" value="${esc(design.id)}" ${selectedIds.includes(design.id) ? "checked" : ""}> <span>${esc(design.name)}</span></label>`).join("") || `<span class="muted">No design elements yet. Add them from the Design Elements page.</span>`}
      </div>
    </fieldset>
  `;
}
function candidateCheckboxes(name, labelText, selectedIds = []) {
  return `
    <fieldset class="checkbox-field">
      <legend>${esc(labelText)}</legend>
      <div class="checkbox-list">
        ${state.project.roadmapCandidates.map((candidate) => `<label><input type="checkbox" name="${esc(name)}" value="${esc(candidate.id)}" ${selectedIds.includes(candidate.id) ? "checked" : ""}> <span>${esc(candidate.name)}</span></label>`).join("") || `<span class="muted">No candidates yet.</span>`}
      </div>
    </fieldset>
  `;
}

function productFields() {
  return [{ name: "name", label: "Name" }, selectField("status", "Status", ["retired", "current", "supported", "planned", "obsolete", "prototype"]), { name: "description", label: "Description", type: "textarea" }, { name: "notes", label: "Notes", type: "textarea" }];
}
function constraintFields() {
  return [
    { name: "name", label: "Constraint Name" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "productIds", label: "Applies To Products", type: "products" },
    selectField("limitType", "Limit Type", ["physical", "electrical", "environmental", "interface", "regulatory", "operational", "performance", "other"]),
    { name: "limitValue", label: "Limit Value" },
    selectField("severity", "Severity", ["blocker", "major caveat", "minor caveat", "unknown"]),
    { name: "basis", label: "Basis / Evidence Summary", type: "textarea" },
    { name: "workaround", label: "Workaround", type: "textarea" },
    { name: "relatedTargetNeedIds", label: "Related Target Needs", type: "targetNeeds" },
    { name: "relatedCapabilityIds", label: "Related Variation Points", type: "variationPoints" },
    { name: "evidenceIds", label: "Linked Evidence", type: "evidence" },
  ];
}
function blockFields() {
  return [
    { name: "name", label: "Block Name" },
    { name: "objective", label: "Objective", type: "textarea" },
    { name: "targetProductId", label: "Target Product", type: "product" },
    { name: "fromProductId", label: "Upgrade From Product", type: "product" },
    selectField("status", "Status", ["planning", "approved", "in progress", "deferred", "released"]),
    { name: "plannedRelease", label: "Planned Release" },
    { name: "candidateIds", label: "Candidate Scope", type: "candidates" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
}
function variantFields() {
  return [{ name: "id", label: "ID" }, { name: "productId", label: "Product ID" }, { name: "name", label: "Variant Name" }, { name: "block", label: "Block / Version" }, { name: "hardwareRevision", label: "Hardware Revision" }, { name: "softwareVersion", label: "Software/Firmware Version" }, selectField("status", "Status", ["retired", "current", "supported", "planned", "obsolete", "prototype"]), { name: "configurationNotes", label: "Configuration Notes", type: "textarea" }];
}
function claimFields() {
  return [{ name: "id", label: "ID" }, { name: "variantId", label: "Variant ID" }, { name: "capabilityId", label: "Capability ID" }, selectField("supportStatus", "Support Status", ["supported", "not supported", "planned", "unknown"]), selectField("maturity", "Evidence Maturity", ["verified", "analysis", "simulation", "assumption", "unknown"]), selectField("confidence", "Confidence", ["low", "medium", "high", "unknown"]), { name: "evidenceIds", label: "Evidence IDs", type: "ids" }, { name: "bdCaveat", label: "BD Caveat" }, { name: "notes", label: "Notes", type: "textarea" }];
}
function candidateFields(currentCandidateId = "") {
  return [{ name: "name", label: "Name" }, { name: "description", label: "Description", type: "textarea" }, { name: "driver", label: "Driving Need / Rationale" }, { name: "targetProductId", label: "Product", type: "product" }, { name: "gapId", label: "Gap Closed", type: "gap", currentCandidateId }, { name: "blockUpgradeId", label: "Block Upgrade", type: "block" }, selectField("businessValue", "Business Value", ["low", "medium", "high"]), selectField("effort", "Effort", ["S", "M", "L", "XL"]), selectField("riskLevel", "Risk Level", ["low", "medium", "high"]), { name: "scheduleDrivers", label: "Schedule Drivers", type: "textarea" }, { name: "assumptions", label: "Assumptions", type: "textarea" }, selectField("decisionStatus", "Decision Status", ["include", "study", "defer", "reject", "blocked"])];
}
function impactFields() {
  return [{ name: "id", label: "ID" }, { name: "roadmapCandidateId", label: "Roadmap Candidate", type: "candidate" }, { name: "designElementId", label: "Design Element", type: "design" }, { name: "impactType", label: "Impact Type" }, selectField("severity", "Severity", ["low", "medium", "high", "major redesign"]), selectField("confidence", "Confidence", ["low", "medium", "high"]), { name: "owner", label: "Owner / Team" }, { name: "effort", label: "Effort Range / Size" }, { name: "scheduleDriver", label: "Schedule Driver", type: "textarea" }, { name: "verificationConsequence", label: "Verification Consequence", type: "textarea" }, { name: "riskConsequence", label: "Risk Consequence", type: "textarea" }, { name: "basis", label: "Basis of Estimate", type: "textarea" }];
}
function evidenceFields() {
  return [{ name: "title", label: "Evidence Title" }, selectField("type", "Evidence Type", ["verified", "analysis", "simulation", "similarity", "assumption", "unknown"]), { name: "reference", label: "Source / Reference" }, { name: "appliesTo", label: "Applies To Product", type: "product" }, { name: "summary", label: "Summary", type: "textarea" }, selectField("confidence", "Confidence", ["low", "medium", "high"]) ];
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

function confirmDestructive({ titleText, message, confirmText = "Delete", cancelText = "Cancel" }) {
  return new Promise((resolve) => {
    const existing = $(".confirm-backdrop");
    if (existing) existing.remove();

    const backdrop = document.createElement("div");
    backdrop.className = "confirm-backdrop";
    backdrop.innerHTML = `
      <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmMessage">
        <header>
          <h2 id="confirmTitle">${esc(titleText)}</h2>
          <p id="confirmMessage">${esc(message)}</p>
        </header>
        <footer>
          <button class="btn secondary" type="button" data-confirm-cancel>${esc(cancelText)}</button>
          <button class="btn danger" type="button" data-confirm-ok>${esc(confirmText)}</button>
        </footer>
      </section>
    `;
    document.body.appendChild(backdrop);

    const previousFocus = document.activeElement;
    const okButton = backdrop.querySelector("[data-confirm-ok]");
    const cancelButton = backdrop.querySelector("[data-confirm-cancel]");
    const finish = (value) => {
      backdrop.remove();
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.focus) previousFocus.focus();
      resolve(value);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") finish(false);
    };

    okButton.addEventListener("click", () => finish(true));
    cancelButton.addEventListener("click", () => finish(false));
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) finish(false);
    });
    document.addEventListener("keydown", onKeyDown);
    cancelButton.focus();
  });
}

function confirmDraftAction({ titleText, message, createText = "Create", discardText = "Delete Draft" }) {
  return new Promise((resolve) => {
    const existing = $(".confirm-backdrop");
    if (existing) existing.remove();

    const backdrop = document.createElement("div");
    backdrop.className = "confirm-backdrop";
    backdrop.innerHTML = `
      <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="draftConfirmTitle" aria-describedby="draftConfirmMessage">
        <header>
          <h2 id="draftConfirmTitle">${esc(titleText)}</h2>
          <p id="draftConfirmMessage">${esc(message)}</p>
        </header>
        <footer>
          <button class="btn secondary mr-auto" type="button" data-draft-keep>Keep Editing</button>
          <button class="btn danger" type="button" data-draft-discard>${esc(discardText)}</button>
          <button class="btn primary" type="button" data-draft-create>${esc(createText)}</button>
        </footer>
      </section>
    `;
    document.body.appendChild(backdrop);

    const previousFocus = document.activeElement;
    const finish = (value) => {
      backdrop.remove();
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.focus) previousFocus.focus();
      resolve(value);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") finish("keep");
    };
    backdrop.querySelector("[data-draft-create]").addEventListener("click", () => finish("create"));
    backdrop.querySelector("[data-draft-discard]").addEventListener("click", () => finish("discard"));
    backdrop.querySelector("[data-draft-keep]").addEventListener("click", () => finish("keep"));
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) finish("keep");
    });
    document.addEventListener("keydown", onKeyDown);
    backdrop.querySelector("[data-draft-create]").focus();
  });
}

function installDraftGuard({ label, create, discard = () => {} }) {
  state.drawerCloseGuard = async () => {
    const action = await confirmDraftAction({
      titleText: `${label} draft`,
      message: `Create this ${label.toLowerCase()} or delete the draft?`,
      createText: `Create ${label}`,
    });
    if (action === "keep") return false;
    state.drawerCloseGuard = null;
    if (action === "create") create();
    if (action === "discard") discard();
    return true;
  };
}

async function closeDrawer({ force = false } = {}) {
  if (!force && state.drawerCloseGuard) {
    const shouldClose = await state.drawerCloseGuard();
    if (!shouldClose) return false;
  }
  const beforeClose = state.drawerBeforeClose;
  state.drawerBeforeClose = null;
  state.drawerCloseGuard = null;
  if (beforeClose) beforeClose();
  $("#drawer").classList.remove("open", "product-detail-drawer", "capability-detail-drawer", "trace-detail-drawer", "autosave-detail-drawer");
  $("#drawer").setAttribute("aria-hidden", "true");
  state.selectedDetail = "";
  highlightSelectedRows();
  return true;
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

document.addEventListener("pointerdown", (event) => {
  const drawer = $("#drawer");
  state.drawerPointerStartedInside = Boolean(drawer?.contains(event.target));
});

document.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-detail]");
  if (detailButton && !$("#content").contains(detailButton)) {
    event.preventDefault();
    openDetail(detailButton.dataset.detail);
    return;
  }
  const drawer = $("#drawer");
  const drawerIsOpen = drawer.classList.contains("open");
  const clickedInsideDrawer = drawer.contains(event.target);
  const clickedInsideConfirm = Boolean(event.target.closest(".confirm-backdrop"));
  const opensDrawer = event.target.closest("[data-detail], [data-row-detail], [data-add]");
  const selectingText = !window.getSelection()?.isCollapsed;
  if (drawerIsOpen && !clickedInsideDrawer && !clickedInsideConfirm && !opensDrawer && !state.drawerPointerStartedInside && !selectingText) closeDrawer();
  state.drawerPointerStartedInside = false;

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
