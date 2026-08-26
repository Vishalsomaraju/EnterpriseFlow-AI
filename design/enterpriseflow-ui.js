const workflowNodes = Array.from(document.querySelectorAll(".workflow-node"));
const routeLines = Array.from(document.querySelectorAll(".link"));
const selectedLabel = document.getElementById("selected-label");
const selectedKind = document.getElementById("selected-kind");
const inspectorTitle = document.getElementById("inspector-title");
const inspectorBadge = document.getElementById("inspector-badge");
const ruleList = document.getElementById("rule-list");

const nodeRules = {
  "Invoice Received": [
    "Captures invoice payload and source metadata.",
    "Begins the auditable workflow run.",
    "Triggers vendor and duplicate validation."
  ],
  "Vendor Validation": [
    "Vendor exists in the master record.",
    "Vendor status is active and not blocked.",
    "Validation failure routes to exception review."
  ],
  "Duplicate Check": [
    "Matches invoice number, amount, and vendor.",
    "Flags probable duplicates before PO lookup.",
    "Duplicate detection prevents downstream ERP writes."
  ],
  "PO Matching": [
    "Confirms referenced purchase order exists.",
    "Checks vendor and amount alignment against PO.",
    "Missing PO forces manual review."
  ],
  "Amount Verification": [
    "Validates threshold and variance rules.",
    "Prepares routing context for manager vs CFO path.",
    "Writes a deterministic decision trace."
  ],
  "Approval Routing": [
    "Amounts below ₹10,00,000 route to Finance Manager.",
    "Amounts at or above ₹10,00,000 route to CFO.",
    "Every branch creates an auditable approval event."
  ],
  "Manager Approval": [
    "Human review remains explicit and revocable.",
    "Approved invoices continue to ERP update.",
    "Rejected invoices stop execution and log cause."
  ],
  "CFO Approval": [
    "High-value invoices require CFO authorization.",
    "Escalation is deterministic, not model-dependent.",
    "Approval decision propagates to tests and docs."
  ],
  "ERP Update": [
    "Writes final approval result to ERP.",
    "Emits a state transition to audit logging.",
    "Failure places the workflow in a recoverable hold state."
  ]
};

function clearActiveLines() {
  routeLines.forEach((line) => line.classList.remove("active-link"));
}

function activateLineGroups(groups) {
  clearActiveLines();
  groups.forEach((group) => {
    document.querySelectorAll(`.${group}`).forEach((line) => line.classList.add("active-link"));
  });
}

function badgeForKind(kind) {
  if (kind.toLowerCase().includes("human")) {
    return { className: "pill warning", label: kind };
  }
  return { className: "pill success", label: kind };
}

function selectNode(node) {
  workflowNodes.forEach((item) => item.classList.remove("selected"));
  node.classList.add("selected");

  const label = node.dataset.label;
  const kind = node.dataset.kind;
  const groups = node.dataset.group.split(" ");

  activateLineGroups(groups);

  if (selectedLabel) selectedLabel.textContent = label;
  if (selectedKind) selectedKind.textContent = kind;
  if (inspectorTitle) inspectorTitle.textContent = label;
  if (inspectorBadge) {
    const badge = badgeForKind(kind);
    inspectorBadge.className = badge.className;
    inspectorBadge.textContent = badge.label;
  }
  if (ruleList) {
    ruleList.innerHTML = "";
    (nodeRules[label] || []).forEach((rule) => {
      const item = document.createElement("li");
      item.textContent = rule;
      ruleList.appendChild(item);
    });
  }
}

workflowNodes.forEach((node) => {
  node.addEventListener("mouseenter", () => activateLineGroups(node.dataset.group.split(" ")));
  node.addEventListener("focus", () => activateLineGroups(node.dataset.group.split(" ")));
  node.addEventListener("click", () => selectNode(node));
});

const defaultNode = document.querySelector(".workflow-node.selected") || workflowNodes[0];
if (defaultNode) {
  selectNode(defaultNode);
}
