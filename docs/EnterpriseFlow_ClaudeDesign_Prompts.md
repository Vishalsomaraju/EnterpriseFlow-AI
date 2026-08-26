# EnterpriseFlow AI — Prompts for Claude Design

Paste **Prompt 0** first to lock the design system, then paste each screen prompt one at a time in the same project so Claude Design carries the system forward. Every prompt asks for both a light and dark variant.

---

## Prompt 0 — Design System (paste this first)

```
You are designing the visual identity and design system for "EnterpriseFlow AI" — an
enterprise workflow-intelligence product, built for an IBM Bob hackathon, that turns a
messy business SOP into a workflow graph, an automation blueprint, and then working,
tested, documented code (via IBM Bob as the engineering agent). The audience is a
finance/process owner on one side and an engineering team on the other — think "software
that a real enterprise ops team would actually deploy," not a Dribbble concept.

Reference inspiration (blend, don't copy):
- Linear (~30%): overall polish, restrained chrome, dense typography, subtle borders,
  quiet sidebar, detail panels.
- Retool (~25%): internal-tool grammar — tables, forms, config panels, side inspectors,
  structured data, dense-but-understandable layouts.
- IBM enterprise software (~15%): visual restraint and enterprise credibility, modernized —
  not literally IBM Carbon, just its seriousness.
- Workflow-builder tools like Synthex (~20%): three-pane layout — left nav, center canvas
  (node graph), right contextual inspector with live metrics/config.
- ServiceNow Horizon (~10%): information hierarchy, status systems, approval/workflow
  patterns — inspiration for structure, not skin.

Build a compact design token system:

COLOR — define both a light mode and a dark mode palette, each as 5-7 named hex values:
- Light mode: very light neutral background (near #F8F9FB), white cards, extremely subtle
  borders, near-black (not pure black) text, an IBM-inspired blue as the primary accent.
- Dark mode: a dark neutral (not pure black — this product is enterprise business software,
  not a dev/SOC console, so avoid the "AI dev tool #847" look) with the same blue accent
  adjusted for contrast, and cards a step lighter than the background.
- Semantic status colors used in BOTH modes, consistent meaning: blue = active/information,
  green = automated/success, amber = waiting on a human, red = error/risk, purple = AI/Bob
  activity. Color should carry meaning, not decorate — use it sparingly against the neutral
  chrome.

TYPE — a UI-grade sans for interface text (dense, technical, legible at small sizes) plus a
monospace for code/schema/IDs. No display serif — this is operational software, not
editorial. Define a type scale with real hierarchy (page title, section header, card title,
body, label/caption, mono data).

LAYOUT — the core shell: fixed left sidebar (nav + workspace switcher), main content area,
and for graph/inspector screens a collapsible right panel. Define spacing scale, border
radius (small — this is not a soft consumer app), and border/elevation treatment (hairline
borders over heavy shadows).

SIGNATURE — the one element that makes this memorable: a live-updating dependency graph
where a change to one node (e.g. a business rule) visibly ripples through connected nodes
(workflow → code → tests → docs) with animated connectors and status color shifts. This
should appear on the Workflow Graph and Impact Analysis screens specifically, not scattered
everywhere.

Do not: use a warm cream/serif "editorial AI" look, a near-black-with-neon-accent "dev tool"
look, heavy shadows/gradients, or rounded consumer-app styling. This should look like real,
credible enterprise software a judge would believe is deployable — with one or two genuinely
distinctive interactions (the graph/ripple) rather than decoration everywhere.

Output: a token reference sheet (colors for both modes with hex + usage, type scale,
spacing/radius scale) plus a small sample — sidebar + a generic card + a status badge in
both light and dark — so the system can be reused across every subsequent screen.
```

---

## Prompt 1 — Dashboard

```
Using the EnterpriseFlow AI design system established above, design the Dashboard screen,
in both light and dark mode.

Content:
- Top bar: product name, search, notifications bell, user (Vishal).
- Left sidebar: Dashboard, Workflows, Activity, divider, "Create Workflow" (primary
  action), divider, Settings, Help.
- Greeting header: "Good afternoon" + 4 stat cards (Workflows, Active, In Review, Recent
  Changes) with small numerals, quiet — data should carry the interest, not decoration.
- "Active Workflows" list: one row per workflow (MVP has one: "Invoice Approval") showing
  status badge (Active, semantic green/blue), step count, systems touched, last-updated
  time, and an "Open" action.
- "Needs attention" section: a card surfacing something waiting on a human, e.g.
  "Implementation ready for review — 14 files · 27 tests passed" with a "Review" action,
  using the amber/waiting semantic color for the badge.

Keep density high and decoration low, per the Linear/Retool references — this is a tool for
someone who operates the system daily, not a marketing page.
```

---

## Prompt 2 — Create Workflow

```
Using the EnterpriseFlow AI design system, design the "Create Workflow" screen, light and
dark mode.

This is the entry point where a business/process owner (non-technical) describes their
process in plain language — write the UI copy from their side of the screen, not the
system's.

Content:
- A large, clearly-labeled textarea: "Describe your process" with helper text framed as
  what the person already knows (e.g. "Tell us what happens today, step by step — we'll
  turn it into a workflow.").
- A file upload zone below it for supporting documents (e.g. an SOP PDF), shown with a
  sample attached file "invoice-approval-SOP.pdf".
- A primary action button "Analyze Workflow".
- Keep the rest of the screen calm and uncluttered — this should feel like the simplest,
  least intimidating screen in the product, in contrast to the denser screens that follow.
```

---

## Prompt 3 — Workflow Analysis

```
Using the EnterpriseFlow AI design system, design the "Workflow Analysis" screen (results
of analyzing the SOP), light and dark mode.

Content, organized as scannable checklist-style groups:
- "Workflow detected" header confirming what was found.
- Actors group: checked items — Employee, Finance Manager, CFO.
- Systems group: checked items — Email, Purchase Order System, ERP.
- Bottlenecks group: flagged items using the amber/risk semantic color — Manual PO
  matching, Email-based approval, Duplicate checking — each with a one-line plain-language
  explanation of why it's a bottleneck.
- A confirming action to proceed to the Workflow Graph.

This is a review/confirmation screen — the person should be able to see at a glance what
the system understood and correct anything before proceeding, Retool-style structured
review, not a chat transcript.
```

---

## Prompt 4 — Workflow Graph (Invoice Approval)

```
Using the EnterpriseFlow AI design system, design the "Workflow Graph" screen — this is
where the product should look visually impressive, closer to Linear + a workflow-builder
canvas + a technical dependency graph, light and dark mode.

Layout: three-pane —
- Left: thin sidebar (navigation stays consistent with the rest of the product).
- Center: the workflow canvas showing the Invoice Approval state machine as connected
  nodes: Invoice Received → Vendor Validation → Duplicate Check → PO Matching → Amount
  Verification → Approval Routing (branches to Manager and CFO) → ERP Update → Audit Log.
  Use clean orthogonal or gently curved connectors, small status dots per node (automated =
  green, human = amber), and a zoom/pan control.
- Right: an inspector panel for the selected node (e.g. "Vendor Validation") showing its
  type (Automated), the rules it enforces (checklist style, e.g. "✓ Vendor exists," "✓
  Vendor active"), and an Edit action.

This screen should demonstrate the SIGNATURE interaction from the design system: selecting
or hovering a node should visibly highlight its connections to downstream nodes. Keep the
canvas background quiet (dot grid or plain) so the graph itself is the visual interest.
```

---

## Prompt 5 — Automation Blueprint

```
Using the EnterpriseFlow AI design system, design the "Automation Blueprint" screen, light
and dark mode.

This is the technical-specification screen — the moment the product proves it produces
structured engineering artifacts, not prose. Show it as a Retool-style structured document
with distinct sections, each collapsible:
- Services (e.g. invoice-service, vendor-service)
- APIs / Integrations (vendor_api, purchase_order_api, erp_api)
- Rules (e.g. "approval_threshold: amount ≥ ₹5,00,000 → CFO", shown as a real rule row with
  a condition and action, not free text)
- Human approval points (highlighted with the amber semantic color to make clear these
  stay human)
- Acceptance criteria (checklist style)

Include a small code/schema panel showing a fragment of the underlying YAML/JSON blueprint
in the monospace type — this reinforces that the system passes structured data, not LLM
paragraphs, between stages.
```

---

## Prompt 6 — Bob Build

```
Using the EnterpriseFlow AI design system, design the "Bob Build" screen — where IBM Bob
(the engineering agent) turns the blueprint into code, light and dark mode.

Content, shown as a vertical build pipeline with live status per stage:
- PLAN stage: checklist — Analyze repository, Identify affected modules, Create
  implementation plan (each with a check once complete).
- SUBAGENTS stage: four parallel workstream cards — Backend, Workflow, Testing,
  Documentation — each with its own progress state, using the purple "AI/Bob activity"
  semantic color for anything actively running.
- IMPLEMENTATION stage: a compact results summary — "14 files changed," "3 services
  added," "27 tests generated."

Make the parallel-subagents moment the visual highlight of this screen (distinct cards
running concurrently, not a single spinner) since this is the strongest evidence that Bob
is doing real engineering work, not just being name-checked.
```

---

## Prompt 7 — Review (Human Approval Gate)

```
Using the EnterpriseFlow AI design system, design the "Review" screen — the human approval
gate before anything ships, light and dark mode.

Content:
- Header: "Implementation ready for review."
- Summary stats: Files changed (14), Tests (27 passing), Documentation (Updated).
- A checklist of the business rules this implementation covers (Invoice validation,
  Duplicate detection, Approval routing), each checked.
- A "Review changes" action that would open a diff view.
- Two clear, distinct primary actions: "Approve" (green) and "Reject" (red) — make it
  visually unambiguous that a human, not the AI, makes this call. This screen should feel
  deliberate and slightly weighty compared to the rest of the product — it's the control
  point.
```

---

## Prompt 8 — Impact Analysis (signature screen)

```
Using the EnterpriseFlow AI design system, design the "Impact Analysis" screen — this is
the flagship screen the product should be remembered by, light and dark mode.

Scenario: a business rule changed — the CFO approval threshold moved from ₹5,00,000 to
₹10,00,000. Show this change prominently at the top (old value struck through or arrowed
into the new value).

Below it, render the SIGNATURE ripple-effect graph from the design system as a vertical
dependency tree:
BUSINESS RULE (₹5L → ₹10L)
  → WORKFLOW (Approval Route)
    → CODE (3 files), TESTS (8 tests), DOCS (2 pages) — shown as three sibling nodes
      → HUMAN REVIEW (final node, amber)

Each node should visually indicate it was just affected by the change (a highlight pulse,
color shift, or animated connector — describe the intended motion even as a static
design). This is the "wow" moment referenced in the product's demo script, so it should
read as more dramatic and technically impressive than any other screen, while staying
inside the same restrained token system — the drama should come from the interaction/
motion and the clarity of the cascade, not from breaking the visual language.
```
