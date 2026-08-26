FRONTEND DESIGN DOCUMENT
EnterpriseFlow AI
Complete Frontend Specification
From broken workflow to working software.
Product EnterpriseFlow AI
Scope Full frontend: information architecture, navigation, page-level specs, component
system, routing, and build priority
MVP workflow Invoice Approval
Engineering partner IBM Bob (Plan / Subagents / Agent)
Companion EnterpriseFlow AI — Product Requirements Document (v1.1)
document
Document status Draft v1.0 — Hackathon Frontend Spec
Confidential — Draft Frontend Spec Page 1

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Table of Contents
0. Overall frontend structure 26. Approval page
1. Design language 27. Audit Trail page
2. Global layout 28. Impact Analysis page
3. Global navbar / topbar 29. Change Review page
4. Sidebar 30. Activity page
5. Sidebar behavior 31. Profile page
6. Landing page 32. Settings page
7. App entry / demo access 33. Notifications
8. Dashboard 34. Global search
9. Workflows page 35. Help / Documentation
10. Create Workflow page 36. Error states
11. Analysis loading state 37. Loading states
12. Workflow Analysis page 38. Reusable components
13. Workflow Graph page 39. Component — WorkflowNode
14. Automation Blueprint page 40. Component — Change Impact Graph
15. The Rule Editor 41. Component — Build Pipeline
16. Acceptance Criteria page 42. Final route structure
17. Build / Engineering page 43. Build priority (don't build everything equally)
18. Bob Plan panel 44. The final frontend experience
19. Subagents panel 45. Exact wireframes for every important page
20. Code Changes page 46. Exact component states
21. Testing page 47. Exact click behavior
22. Documentation page 48. Real demo data
23. Human Review page 49. Responsive behavior
24. Workflow Execution page 50. Design system
25. Execution status 51. Recommended build path (revised)
Confidential — Draft Frontend Spec Page 2

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
0. Overall frontend structure
The product should read as a modern enterprise workflow platform — not as an AI chatbot. Every screen
should reinforce that EnterpriseFlow is structured, inspectable software, not a prompt box with a nice UI around
it.
Landing Page
|
v
App
+-----------------------------------------------+
| Sidebar | Main Content |
| | |
| Dashboard | |
| Workflows | |
| Activity | |
| | |
| Profile | |
| Settings | |
+-----------------------------------------------+
The central product flow that every page must serve:
Dashboard
|
v
Create Workflow
|
v
Workflow Analysis
|
v
Workflow Graph
|
v
Automation Blueprint
|
v
Build / IBM Bob
|
v
Testing
|
v
Human Review
|
v
Workflow Execution
|
v
Rule Change
|
v
Impact Analysis
Confidential — Draft Frontend Spec Page 3

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
This mirrors the PRD architecture: EnterpriseFlow UI fi Workflow Intelligence fi Automation Blueprint fi Bob fi
Working Software fi Tests/Docs fi Human Review fi Workflow Execution.
1. Design language
Lock the visual identity before building pages.
Brand
EnterpriseFlow AI — “From broken workflow to working software.”
The product should feel
Should feel Should avoid
Enterprise Excessive gradients
Technical Giant glowing AI brains
Trustworthy Chatbot-first UI
Clean / structured Cartoon illustrations
Slightly futuristic 20 animated cards
Not an “AI toy” Generic SaaS templates
2. Global layout
Desktop
+------------------------------------------------------------+
| Topbar |
+---------------+----------------------------------------------+
| | |
| Sidebar | Main Content |
| | |
| | |
+---------------+----------------------------------------------+
Element Spec
Sidebar width ~240–260px
Main content Centered, max-width ~1400px
Topbar height ~64px
3. Global navbar / topbar
Every authenticated page shares the same topbar.
+---------------------------------------------------------------+
| EnterpriseFlow Invoice Approval [search] [bell] Vishal v |
+---------------------------------------------------------------+
Confidential — Draft Frontend Spec Page 4

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Left: sidebar toggle / product name, or the current page title (e.g. “Invoice Approval”). Right: global search,
notifications, help, and the user avatar/menu.
4. Sidebar
One of the most important reusable components in the product.
EnterpriseFlow
--------------------
OVERVIEW
Dashboard
Workflows
Activity
--------------------
WORKSPACE
+ Create Workflow
--------------------
SYSTEM
Settings
Help
--------------------
[V] Vishal
Finance Manager
Item Purpose
Dashboard Main overview
Workflows All workflows
Activity Changes, builds, approvals, and workflow events
Create Workflow Primary call-to-action
Settings Application settings
Help Documentation / demo guidance
5. Sidebar behavior
Active item
+---------------------+
| Workflows | <- highlighted
+---------------------+
Collapsed (small screens)
[dash] [diamond] [clock] [+] [gear]
Mobile
Sidebar becomes a drawer.
Confidential — Draft Frontend Spec Page 5

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
6. Landing page
Route /
Outside the application. Its job is to explain EnterpriseFlow, establish credibility, demonstrate the problem, and
get the visitor into the app. It should not be ten sections long.
Section 1 — Navbar
EnterpriseFlow AI Product How it works Technology About [ Open Demo ]
Because this is a hackathon, “Open Demo” is the main CTA — no signup funnel needed.
Section 2 — Hero
Headline — Turn business workflows into working software.
Subheading — EnterpriseFlow transforms messy business processes into structured automation blueprints,
then uses IBM Bob to help turn those blueprints into tested, documented software.
Buttons — [ Try EnterpriseFlow ] [ See how it works ]
Hero visual — not a chatbot. Show the actual product pipeline:
             SOP / Documents
                    |
                    v
             AI Interpretation
                    |
                    v
          Structured JSON Schema
                    |
                    v
          Deterministic Validator
                    |
                    v
             Workflow Graph
                    |
                    v
          Automation Blueprint
                    |
                    v
            Implementation Plan
                    |
                    v
                 IBM Bob
                    |
                    v
              Real Codebase
                    |
          +---------+---------+
          v                   v
        Tests              Security
          |                   |
          +---------+---------+
                    v
               Human Review
Section 3 — Problem
Headline — Business processes change faster than software.
Confidential — Draft Frontend Spec Page 6

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Email
|
v
Spreadsheet
|
v
Manual verification
|
v
Manager email
|
v
ERP
|
v
Another spreadsheet
Enterprise teams often know what needs to change. Translating that change into reliable software takes
multiple handoffs — the same fragmented-workflow framing used in the PRD.
Section 4 — How it works
01 — Describe Give EnterpriseFlow your existing workflow or SOP.
02 — Understand EnterpriseFlow extracts actors, systems, decisions, and bottlenecks.
03 — Build Turn the workflow into an automation blueprint and let IBM Bob assist with implementation.
04 — Evolve When business rules change, trace the impact across workflow, code, tests, and documentation.
Section 5 — The Bob relationship
Important framing for the hackathon. Not: “EnterpriseFlow is powered by Bob.” Instead: “EnterpriseFlow
translates business intent. IBM Bob helps engineers turn that intent into software.”
EnterpriseFlow
(business intelligence)
|
v
Structured JSON / Deterministic Validation
|
v
Automation Blueprint
|
v
IBM Bob
(engineering intelligence)
|
v
Working software
Section 6 — Rule change demo
One of the strongest sections — this is the PRD's “wow moment,” shown before the visitor even opens the app.
Confidential — Draft Frontend Spec Page 7

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Approval threshold
Rs 5,00,000
|
v
Rs 10,00,000
animates into:
Rule -> Workflow -> Code -> Tests -> Documentation
Section 7 — Final CTA & footer
CTA — “Your business changes. Your software should keep up.” [ Open EnterpriseFlow ]
Footer — keep it small: Product / How it works / Documentation / GitHub, plus “IBM Bob Hackathon” and a
copyright line.
7. App entry / demo access
Real enterprise authentication is explicitly out of scope. Do not build OAuth, SSO, MFA, forgot-password, or
email verification flows — this is a hackathon prototype, not a production identity platform.
EnterpriseFlow Demo
Continue as
[ Vishal ]
Finance Manager
[ Enter Workspace ]
Or a simple “Open Demo” button directly from the landing page.
Confidential — Draft Frontend Spec Page 8

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
8. Dashboard
Route /app
The first screen after entering the application. The PRD explicitly calls for a dashboard showing active
workflows.
Header
Good afternoon, Vishal
Here's what's happening across your workflows.
[ + Create Workflow ]
KPI row
3 1 2 4
Workflows Active Pending Changes
For the hackathon MVP, these numbers reflect the demo data.
Active workflows
Invoice Approval
Finance *Active
Last updated 8 min ago [ Open ]
Recent activity
* Approval threshold updated — Invoice Approval — 5 min ago
* Bob implementation completed — Invoice Approval — 22 min ago
* 27 tests passed — Invoice Approval — 25 min ago
Pending actions
Needs your attention
1 implementation awaiting approval
Invoice Approval — 12 files changed, 27 tests passed
[ Review Changes ]
9. Workflows page
Route /app/workflows
The main workflow library.
Confidential — Draft Frontend Spec Page 9

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Workflows
Manage and monitor your business processes. [ + Create Workflow ]
Search workflows... [All] [Active] [Draft] [Needs Review]
Workflow Owner Status Last Updated Action
Invoice Approval Finance Active 8m ago Open
Employee Onboarding HR Draft 2d ago Open
Even though only Invoice Approval is functional, the UI can demonstrate extensibility. The PRD is explicit that only
Invoice Approval needs to exist for the MVP.
10. Create Workflow page
Route /app/workflows/new
A core page. The PRD explicitly specifies a description field, supporting-document upload, and an “Analyze
Workflow” CTA.
Step indicator (persists through the creation flow)
1 Describe -> 2 Analyze -> 3 Blueprint -> 4 Build -> 5 Review
Form
Workflow name
[ Invoice Approval ]
Describe your current process
+---------------------------------------------+
| Our company receives invoices by email... |
+---------------------------------------------+
Supporting documents
+---------------------------------------------+
| Drop your SOP here |
| PDF, DOCX |
| [ Browse files ] |
+---------------------------------------------+
[ Save Draft ] [ Analyze Workflow -> ]
11. Analysis loading state
Important for the demo — do not show a generic spinner.
Confidential — Draft Frontend Spec Page 10

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Analyzing workflow...
[x] Reading process description
[x] Identifying actors
[x] Identifying systems
[x] Extracting decisions
[.] Detecting bottlenecks
[ ] Building workflow graph
Confidential — Draft Frontend Spec Page 11

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
12. Workflow Analysis page
Route /app/workflows/:id/analysis
Explicitly specified in the PRD.
Invoice Approval — Analysis
Status: * Analysis Complete
Actors Systems Bottlenecks (impact)
Employee Email Manual PO matching — High
Finance Manager Purchase Order System Email-based approval — High
CFO ERP Manual duplicate checking — Medium
Actors, systems, and bottlenecks above come directly from the PRD's worked example.
Summary
4
8 3 3 2
Automation
Steps Actors Systems opportunities Human approvals
CTA — [ ‹ Edit Analysis ] [ View Workflow fi ]
13. Workflow Graph page
Route /app/workflows/:id/graph
One of the most visually important pages in the product — the PRD calls for a visual state machine.
Confidential — Draft Frontend Spec Page 12

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
+------------------+
| Invoice Received |
+---------+--------+
v
+------------------+
| Vendor Validate |
+---------+--------+
v
+------------------+
| Duplicate Check |
+----+--------+----+
YES NO
v v
REJECT Match PO
v
Verify Amount
v
Approval Router
/ \
Manager CFO
\ /
ERP
v
Audit
Node design
Automated node Human node
Vendor Validation CFO Approval
Type: Automated Type: Human
Owner: System Required
3 3 checks
Right-side inspector (on node click)
Node Details — Vendor Validation
Type Automated
Inputs Vendor ID
Outputs Validated Vendor
Rules Vendor exists / Vendor active / Vendor not blocked
This makes the graph interactive rather than a static diagram.
Confidential — Draft Frontend Spec Page 13

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
14. Automation Blueprint page
Route /app/workflows/:id/blueprint
The PRD defines the blueprint as containing the workflow graph, rules, integrations, human approvals, and
acceptance criteria.
Automation Blueprint — Invoice Approval
Status: Ready for Engineering [ Edit Blueprint ] [ Send to Bob -> ]
Overview | Workflow | Rules | Integrations | Approvals | Acceptance Criteria
Overview tab
6 2 3 7 12
Automated steps Human steps Integrations Business rules Acceptance criteria
Rules tab
ID Rule Actions
R-001 Duplicate invoice fi Reject Edit / View Impact
R-002 Missing PO fi Manual Review Edit / View Impact
R-003 Invoice < n5L fi Finance Manager Edit / View Impact
R-004 Invoice ‡ n5L fi CFO Edit / View Impact
15. The Rule Editor
This becomes the gateway to the product's signature “wow moment” and deserves careful design.
Edit Business Rule — Approval Threshold
Invoices above [ Rs 5,00,000 ] require [ CFO Approval v ]
[ Cancel ] [ Save Change ]
On save:
Rule Change Detected
This change affects:
[x] Approval Router
[x] Approval Service
[x] 8 tests
[x] API documentation
[ View Impact ]
Confidential — Draft Frontend Spec Page 14

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
16. Acceptance Criteria page
Acceptance Criteria
[x] Valid vendor accepted
[x] Invalid vendor rejected
[x] Duplicate invoice rejected
[x] Matching PO accepted
[x] Missing PO routed to review
[x] Rs 2L -> Manager
[x] Rs 8L -> CFO
[x] All approvals logged
Each criterion shows either 3 Passed or n Not implemented.
Confidential — Draft Frontend Spec Page 15

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
17. Build / Engineering page
Route /app/workflows/:id/build
Where EnterpriseFlow and IBM Bob visually meet.
Build Workflow — Invoice Approval
Blueprint validated 3
Pipeline (current stage highlighted)
Blueprint -> Bob Plan -> Implementation -> Testing -> Documentation -> Review
18. Bob Plan panel
IBM Bob — PLAN
[x] Repository analyzed
[x] Architecture understood
[x] Implementation plan generated
Plan
1. Update approval service
2. Add invoice validation
3. Implement duplicate detection
4. Add PO matching
5. Add approval routing
6. Add audit logging
7. Generate tests
8. Update documentation
[ Open in Bob ]
The app can show status and results, but the actual Bob interaction needs to be genuine in the development workflow.
The PRD expects the demo to show Bob Plan fi tasks fi subagents, then Bob actually modifying the repository.
19. Subagents panel
Bob Workstreams
Backend * Complete
Workflow * Complete
Testing * Running
Documentation o Pending
Clicking a workstream:
Testing Agent
Task Generate tests for approval routing.
Status Running
Tests 27 generated
Confidential — Draft Frontend Spec Page 16

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
The PRD treats subagents as Tier 2 rather than mandatory — don't sacrifice core functionality to build a flashy fake
agent dashboard.
20. Code Changes page
Implementation Changes — 14 files changed
+ approval.service.ts
+ invoice.service.ts
+ audit.service.ts
~ workflow.ts
~ routes.ts
[ View Diff ]
Diff viewer
approval.service.ts
- if (amount >= 500000)
+ if (amount >= 1000000)
return CFO;
Especially useful during the rule-change demo.
Confidential — Draft Frontend Spec Page 17

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
21. Testing page
Route /app/workflows/:id/tests
Test Results — 27 / 27 Passed
[x] Vendor validation
[x] Duplicate detection
[x] PO matching
[x] Manager approval
[x] CFO approval
[x] Missing PO
[x] Audit logging
* All tests passing
22. Documentation page
Route /app/workflows/:id/docs
Invoice Approval API
POST /invoices
Description Submit an invoice...
Approval Rules ...
Error Codes ...
Workflow States ...
Documentation is part of Bob's engineering lifecycle in the PRD, so this page should reflect real generated docs.
23. Human Review page
Route /app/workflows/:id/review
A Tier 1 requirement.
Ready for Review — Invoice Approval
Implementation completed. 27 tests passed. Documentation updated.
Files changed 14
Tests 27
Passed 27
Failed 0
Rules changed 4
Business impact
Before After
Confidential — Draft Frontend Spec Page 18

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
8 manual steps Automated validation
2 email handoffs Automated routing
4 manual checks Audit trail
Human approval retained
The PRD's video plan specifically calls for this before/after comparison.
Buttons — [ Reject Changes ] [ Approve & Activate ]. There is deliberately no “Auto Deploy” option — human
approval is intentional product design, not a missing feature.
Confidential — Draft Frontend Spec Page 19

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
24. Workflow Execution page
Route /app/workflows/:id/run
Where the application behaves like an operational workflow, not just a design tool.
New Invoice
Vendor [ ABC Supplies ]
Invoice Number [ INV-1042 ]
Purchase Order [ PO-8831 ]
Amount [ Rs 2,40,000 ]
Invoice [ Upload PDF ]
[ Submit Invoice ]
25. Execution status
Invoice INV-1042
* Received
[x] Vendor validated
[x] Duplicate check
[x] PO matched
[x] Amount verified
* Awaiting Manager Approval
Timeline
09:31 Invoice received
09:31 Vendor validated
09:31 PO matched
09:32 Routed to Finance Manager
26. Approval page
Approval Required
ABC Supplies — Rs 2,40,000
Vendor 3 Verified
PO 3 Matched
Duplicate 3 No duplicate
Approval route Finance Manager
Reason Amount below CFO threshold.
[ Reject ] [ Approve ]
27. Audit Trail page
Route /app/workflows/:id/activity
Confidential — Draft Frontend Spec Page 20

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Activity — Today
16:42 Invoice INV-1042 approved — Vishal, Finance Manager
16:40 Invoice submitted — Employee
16:39 PO matched
16:39 Vendor validated
Useful for the hackathon but a Tier 2 feature — don't sacrifice the core workflow to build this out.
Confidential — Draft Frontend Spec Page 21

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
28. Impact Analysis page
Route /app/workflows/:id/impact
This should be one of the best-looking pages in the application — it is the direct visualization of the PRD's
central rule-change concept.
Business rule changed: Rs 5,00,000 -> Rs 10,00,000
Impact Analysis — 1 business rule changed
Affected components
[x] Approval Router
[x] Approval Service
[x] Workflow Graph
[x] 8 Tests
[x] API Documentation
Change flow
RULE -> WORKFLOW -> BLUEPRINT -> CODE -> TESTS -> DOCS
29. Change Review page
Shown after Bob updates everything.
Change Review
Business rule Rs 5L -> Rs 10L
Workflow Updated 3
Code Updated 3
Tests Updated 3
Documentation Updated 3
Regression tests 27 / 27 3
[ Reject Change ] [ Approve Change ]
30. Activity page
Route /app/activity
The global, workspace-wide timeline.
Filters: All | Workflow | Build | Test | Approval | Rule Change
16:42 Rule changed — Invoice Approval
16:40 Bob implementation completed — Invoice Approval
16:35 Tests passed — Invoice Approval
16:31 Blueprint approved — Invoice Approval
31. Profile page
Confidential — Draft Frontend Spec Page 22

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Route /app/profile
Not required by the PRD — keep it lightweight.
Profile
[ Vishal ] — Finance Manager
vishal@example.com
Personal Information
Name [ Vishal ]
Role [ Finance Manager ]
Email [ vishal@example.com ]
Workspace
EnterpriseFlow Demo — Role: Finance Manager
No real account management required.
Confidential — Draft Frontend Spec Page 23

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
32. Settings page
Route /app/settings
Tabs: General | Workflow | Notifications | Appearance
Tab Controls
General Workspace name; default currency (INR)
Workflow Require human approval [ON] · Run validation before activation [ON] · Require tests to pass [ON]
Notifications Rule changes [ON] · Approval requests [ON] · Build failures [ON]
Appearance Theme: Light / Dark / System
UI-level settings are fine; don't build backend preference infrastructure unless it's actually needed.
33. Notifications
Topbar bell — on click:
Notifications
* Rule change requires review — Invoice Approval
* Implementation completed — Invoice Approval
* 27 tests passed — Invoice Approval
34. Global search
Topbar search can span workflows, rules, and activity, e.g. “Invoice Approval,” “INV-1042,” “approval
threshold,” “Bob implementation.”
Results
Workflows Invoice Approval
Rules Approval Threshold
Activity Threshold changed
Polish, not an MVP priority.
35. Help / Documentation
Route /app/help
EnterpriseFlow Help
Getting Started
How workflows work
Understanding blueprints
Reviewing changes
Understanding impact analysis
Not a core feature.
Confidential — Draft Frontend Spec Page 24

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
36. Error states
These matter a lot — an EnterpriseFlow that fails silently undermines the entire “inspectable, deterministic”
positioning.
Workflow analysis failed
We couldn't understand this workflow.
The process description is missing enough information
to identify the approval path.
[ Edit Workflow ]
Invalid blueprint
Blueprint needs attention
2 rules are ambiguous.
! Approval threshold has no approver.
! ERP integration has no target.
[ Fix Issues ]
Build failure
Implementation failed
Bob's generated implementation did not pass validation.
3 tests failed.
[ View Errors ] [ Retry Build ]
Rule ambiguity
Clarification required
You changed the approval threshold, but the new
approval owner was not specified.
Who should approve invoices above Rs 10,00,000?
[ Finance Manager v ]
[ Continue ]
This is much better than allowing an LLM to silently invent a business rule.
37. Loading states
Every AI operation should show meaningful progress rather than a generic spinner.
Confidential — Draft Frontend Spec Page 25

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Analyzing Workflow
[x] Reading requirements
[x] Identifying actors
[x] Identifying systems
[.] Extracting decisions
[ ] Detecting bottlenecks
[ ] Building workflow graph
Building Workflow
[x] Blueprint validated
[x] Bob repository analyzed
[x] Implementation plan created
[.] Backend implementation
[ ] Tests
[ ] Documentation
This also makes the demo video much easier to follow.
Confidential — Draft Frontend Spec Page 26

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
38. Reusable components
Don't build every page independently — build a component system.
Category Components
Layout AppShell (Sidebar, Topbar, PageContainer)
Navigation Sidebar, NavItem, NavSection, UserMenu, NotificationMenu, Breadcrumbs
Common UI Button, IconButton, Input, Textarea, Select, Dropdown, Checkbox, Switch, Modal, Drawer, Tooltip, Tabs, Badge, Toast, Alert, Card, Table, Pagination, EmptyState, Skeleton
EnterpriseFlow-specific WorkflowCard, WorkflowStatus, WorkflowStep, WorkflowGraph, WorkflowNode, WorkflowEdge, WorkflowInspector, RuleCard, RuleEditor, BlueprintPanel, AcceptanceCriterion, BuildPipeline, BobActivity, SubagentCard, CodeDiff, TestResult, ApprovalCard, ImpactGraph, ActivityTimeline
39. Component — WorkflowNode
Worth designing properly; it appears throughout the Workflow Graph page.
Automated node Human node
3 Vendor Validation n CFO Approval
Automated Human approval required
3 validation rules Threshold: n10,00,000
System
40. Component — Change Impact Graph
Should visually communicate the product's unique value — a dependency graph, not another card grid.
BUSINESS RULE
Rs 5L -> Rs 10L
|
v
WORKFLOW NODE
(Approval Router)
|
+---------+---------+
v         v         v
CODE    TESTS     DOCS
|         |         |
+---------+---------+
v
HUMAN REVIEW
41. Component — Build Pipeline
Use this everywhere the workflow is progressing through build stages.
Confidential — Draft Frontend Spec Page 27

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Blueprint 3
|
v
Bob Plan 3
|
v
Implementation 3
|
v
Tests 3
|
v
Documentation 3
|
v
Human Review *
Confidential — Draft Frontend Spec Page 28

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
42. Final route structure
/
|-- Landing
|
|-- demo
| `-- Demo Access
|
`-- app
|
|-- /dashboard
|
|-- /workflows
| |-- /new
| `-- /:workflowId
| |-- /overview
| |-- /analysis
| |-- /graph
| |-- /blueprint
| |-- /build
| |-- /tests
| |-- /docs
| |-- /review
| |-- /run
| |-- /activity
| |-- /impact
| `-- /changes
|
|-- /activity
|-- /profile
|-- /settings
`-- /help
43. Build priority — don't build everything equally
The PRD ranks the frontend/dashboard shell as Tier 3, while the invoice workflow itself — extraction, graph,
blueprint, Bob Plan/Agent, tests, the business-rule change, and human approval — is Tier 1. Frontend build
order should follow the same ranking.
Tier A — must work
Landing -> Dashboard -> Create Workflow -> Analysis -> Graph -> Blueprint
-> Build/Bob -> Tests -> Review -> Run Workflow -> Change Rule
-> Impact Analysis -> Review Change
Tier B — polish
Workflows list · Activity · Audit trail · Notifications · Documentation viewer
Tier C — nice-to-have
Profile · Settings · Help · Search · Additional workflow types · Advanced analytics
Confidential — Draft Frontend Spec Page 29

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
This keeps the build aligned with the PRD rather than spending half the hackathon on a beautiful settings page while the
actual product doesn't work.
44. The final frontend experience
When a judge opens the product, the journey should read as a single, coherent story:
LANDING PAGE "See the problem"
|
v
DASHBOARD "Create workflow"
|
v
CREATE WORKFLOW Upload SOP
|
v
WORKFLOW ANALYSIS "Here's what's broken"
|
v
WORKFLOW GRAPH "Here's the process"
|
v
AUTOMATION BLUEPRINT "Here's how to automate"
|
v
IBM BOB / BUILD "Here's how software gets built"
|
v
TESTS
|
v
HUMAN REVIEW
|
v
WORKFLOW RUNS
|
v
RULE CHANGES
|
v
IMPACT ANALYSIS "Here's everything affected"
|
v
UPDATED SYSTEM
This mirrors the actual architecture rather than inventing unrelated dashboard features: EnterpriseFlow UI fi
workflow intelligence fi blueprint fi Bob fi working software fi tests/docs fi human review fi execution fi
change impact.
Confidential — Draft Frontend Spec Page 30

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
45. Exact wireframes for every important page
This section pins down layout specifics — grid structure, region placement, card sizing, and the tables-vs-cards
decision — for the six pages that carry the demo. Every other page in Sections 6–37 inherits the same grid and
spacing rules unless noted.
Shared layout constants
Constant Value
Page grid 12-column grid, 24px gutter, content max-width 1400px, 32px outer page padding
Sidebar width 252px expanded / 64px collapsed
Topbar height 64px, fixed, 1px bottom border
Card corner radius 12px
Card padding 20px (24px for hero/summary cards)
Default vertical rhythm 24px between stacked sections, 16px between related cards
Dashboard — /app
Region Contents / placement
Top-left Greeting (“Good afternoon, Vishal”) + subline, left-aligned, 28px top margin
Top-right Primary CTA “+ Create Workflow”, button anchored to the header's right edge, same
baseline as greeting
Row 2 KPI row — 4 equal-width cards, 16px gutter, each 132px tall, spans full 12 columns (3
columns each)
Row 3 (left, 8 cols) Active Workflows list — cards, not a table (small count, needs status + recency at a
glance)
Row 3 (right, 4 cols) Pending Actions panel — single elevated card, sticky on scroll
Row 4 (full width) Recent Activity — compact list rows, 48px row height, timestamp right-aligned
Empty space 24px breathing room below the KPI row before any list begins; no dense stacking
Tables vs. cards: KPIs and the workflow list use cards because the MVP has 1–2 workflows — a table would look
sparse. Switch the workflow list to a table once there are 5+ workflows (see Section 9).
Workflow Graph — /app/workflows/:id/graph
Region Contents / placement
Top bar (within page, below Workflow title (left) + “Edit” / “Generate Blueprint” (right), 56px tall
topbar)
Main canvas (9 cols) Pan/zoom graph canvas, minimum height 640px, dot-grid background at 5%
opacity
Confidential — Draft Frontend Spec Page 31

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Right inspector (3 cols) Slides in from the right, 320px wide, only visible when a node is selected; canvas
re-flows to 9/12 width when open, otherwise canvas uses the full 12
Node card size 220px × 84px (automated), 220px × 96px (human — extra row for the approver)
Node spacing Minimum 64px vertical gap between connected nodes, 96px horizontal gap on
branches
Empty space Canvas should never feel cramped — default zoom leaves 20% margin around
the full graph
Automation Blueprint — /app/workflows/:id/blueprint
Region Contents / placement
Header Title + status pill (left), “Edit Blueprint” / “Send to Bob” (right)
Tab bar 6 tabs, underline-style, 44px tall, directly below header, full width
Overview tab 5 KPI cards in a single row (Automated steps, Human steps, Integrations,
Business rules, Acceptance criteria) — same card component as the Dashboard
KPI row
Rules tab Table, not cards — rules are structured, comparable rows (ID, rule, actions) that
benefit from column scanning
Row height (rules table) 52px, with Edit / View Impact as inline text links in the last column
Build / Bob — /app/workflows/:id/build
Region Contents / placement
Left column (4 cols) Vertical Build Pipeline component (Section 41) — sticky, shows current stage
Right column (8 cols) Stage-specific panel: Bob Plan panel, Subagents panel, or Code Changes,
depending on pipeline position
Subagents panel layout 2×2 card grid, each card 100% width in its cell, 140px tall
Empty space Right column keeps 40px top padding so the active panel never touches the
tab/header edge
Human Review — /app/workflows/:id/review
Region Contents / placement
Header Status banner, full width, colored left border (green when all checks pass)
Row 2 (left, 7 cols) Review summary table (Files changed / Tests / Passed / Failed / Rules changed)
— table, since these are label–value pairs best scanned in a fixed column
Row 2 (right, 5 cols) Business impact card — Before / After, two stacked mini-lists inside one card
Confidential — Draft Frontend Spec Page 32

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Footer bar Sticky footer, [ Reject Changes ] left-aligned (secondary), [ Approve & Activate ]
right-aligned (primary)
Impact Analysis — /app/workflows/:id/impact
Region Contents / placement
Header Rule delta shown as a single line: old value fi new value, large monospace
figures
Main (full width) Change Impact Graph component (Section 40), centered, min-height 420px
Below graph Affected-components checklist, single column, max-width 480px, centered under
the graph
Empty space Generous — this page's job is to be read in 5 seconds during the demo, not to
pack in data
Confidential — Draft Frontend Spec Page 33

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
46. Exact component states
Every interactive component needs all eight states defined before it's built, not discovered during
implementation. Default / hover / active / disabled are visual-only; loading / success / warning / error also
change what the component communicates.
Primary Button
State Treatment
Default Solid navy fill, white text, 8px radius
Hover Fill darkens ~8%, cursor pointer
Active / pressed Fill darkens ~15%, slight scale (0.98)
Loading Fill unchanged, label replaced with spinner, button width locked to prevent layout shift
Success Momentary green fill + checkmark icon (600ms), then reverts to default or navigates
away
Disabled 40% opacity, no hover/active response, cursor not-allowed
Input / Textarea
State Treatment
Default 1px slate-200 border, 8px radius
Hover Border darkens to slate-300
Focus / active 2px accent-blue border, subtle blue focus ring
Warning Amber border + inline helper text below the field
Error Red border + red helper text with the specific problem (never just “Invalid”)
Disabled Light gray background, muted text, no border change on hover
WorkflowNode
State Treatment
Default White card, 1px slate-200 border, subtle shadow
Hover Border becomes accent-blue, shadow lifts slightly (cursor: pointer, signals
it's clickable)
Active / selected 2px accent-blue border, right inspector opens
Loading (Bob editing this node's logic) Border pulses, small spinner replaces the status icon
Success Green left-edge bar + checkmark; used once a node's
implementation/tests pass
Confidential — Draft Frontend Spec Page 34

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Warning Amber left-edge bar + n icon; used for ambiguous rules
Error Red left-edge bar + 5 icon; used for failed validation or failed tests on that
node
Disabled (not yet reachable) 50% opacity, dashed border, no hover state
Card (generic — WorkflowCard, RuleCard, etc.)
State Treatment
Default White background, 1px border, 12px radius, low shadow
Hover (if clickable) Shadow increases one step, border unchanged
Active / selected Accent-blue left border (4px), background tinted 3%
Loading Skeleton version of the same card shape — never a spinner floating over blank space
Disabled 60% opacity, no hover/shadow change
Status badge (Active / Draft / Passed / Failed / Pending)
Value Color Icon
Active / Passed / Approved Green (#15803d) on green-tint background 3
Draft / Pending / Awaiting Slate on slate-tint background l (hollow)
Running / In progress Blue on blue-tint background spinner
Needs review / Warning Amber on amber-tint background n
Failed / Rejected / Error Red on red-tint background 5
Confidential — Draft Frontend Spec Page 35

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
47. Exact click behavior
Every primary action needs its full behavior specified: what happens immediately, what state or modal appears,
what data changes, and where the user ends up. This removes ambiguity during the build.
Action Immediate response Modal / state change Data updated Destination
Analyze Workflow Button enters loading No modal — full-panel Creates a draft Auto-navigates to
(Create Workflow state; page transitions progress checklist WorkflowExtraction Workflow Analysis
page) to the analysis loading (Section 11) replaces the record; SOP text/file page on completion,
view form attached or shows the
“Workflow analysis
failed” error state
(Section 36) in place
View Workflow fi Button shows brief None Marks analysis as Workflow Graph
(Analysis page) loading pulse reviewed page
Generate Button enters loading None — inline banner Creates Automation
Blueprint (Graph state appears: “Generating AutomationBlueprint Blueprint page,
page) automation blueprint…” from the current Overview tab
WorkflowGraph
Send to Bob fi Confirmation modal Modal: “Send blueprint to Locks the blueprint Build / Engineering
(Blueprint page) opens (blueprint is Bob? You can still review as read-only; page, Bob Plan
about to leave the plan before anything creates a Bob Plan panel (loading state
EnterpriseFlow's is built.” [Cancel] [Send] request until Bob responds)
editable state)
Save Change Modal stays open, On success, the Rule Updates the rule “View Impact”
(Rule Editor) Save button enters Editor modal is replaced value; triggers an button in the same
loading state in place by the “Rule Impact Analysis modal leads to the
Change Detected” panel computation in the Impact Analysis
(Section 15) — same background page; closing the
modal, new content, no modal returns to the
close/reopen Blueprint Rules tab
with the rule row
flagged “Changed”
Submit Invoice Form validates None — page transitions Creates an invoice Execution Status
(Run Workflow client-side; on submit, to Execution Status view execution instance; page for that
page) button enters loading kicks off invoice, with the
state vendor/duplicate/PO timeline animating
checks step by step
Approve (Approval Button enters loading Toast confirmation: Updates execution Returns to the
page) state “Invoice approved” state to Approved; workflow's
writes an audit entry Activity/Execution
list
Confidential — Draft Frontend Spec Page 36

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Approve & Confirmation modal: On confirm, footer bar Marks Workflow Execution
Activate (Human “Activate this shows a success state implementation as page, showing the
Review page) implementation? This (green) for 2s approved; activates newly-activated
updates the live the updated version
workflow.” [Cancel] workflow version
[Approve & Activate]
Retry Build (Build Button enters loading Error banner is replaced Re-queues the Stays on Build
failure error state) state by the Bob Plan loading same page; advances
panel implementation plan automatically if the
for another Bob retry succeeds
Agent pass
Approve Change Confirmation modal: On confirm, each row Commits the Workflow Execution
(Change Review “Apply this change to (Workflow / Code / Tests rule/code/test/doc page — next
page, post the live workflow?” / Documentation) changes as the new submitted invoice
rule-change) [Cancel] [Approve animates from active version uses the new
Change] “Updated3” to a final threshold
“Live” badge
Every destructive or state-changing action (Send to Bob, Approve & Activate, Approve Change) confirms first — nothing
auto-deploys, consistent with the PRD's human-approval requirement.
Confidential — Draft Frontend Spec Page 37

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
48. Real demo data
Concrete data the demo and build should actually use — not placeholder Lorem Ipsum, and not invented on the
fly during the recording.
Invoice examples
Invoice # Vendor Amount PO match Duplicate? Routes to
INV-1042 ABC Supplies n2,40,000 PO-8831 3 No Finance Manager
INV-1043 Everest Traders n8,10,000 PO-8832 3 No CFO
INV-1044 ABC Supplies n2,40,000 PO-8831 3 Yes (dup of INV-1042) Rejected
INV-1045 Northline Logistics n1,15,000 No PO found No Manual review
Workflow nodes (Invoice Approval graph)
Invoice Received fi Vendor Validation fi Duplicate Check fi PO Matching fi Amount Verification fi Approval
Routing (Manager / CFO) fi ERP Update fi Audit Log.
Business rules
ID Rule
R-001 Duplicate invoice fi Reject
R-002 Missing PO fi Manual Review
R-003 Invoice < n5,00,000 fi Finance Manager approval
R-004 Invoice ‡ n5,00,000 fi CFO approval
R-005 Vendor not in vendor master fi Reject at Vendor Validation
R-006 ERP write failure fi Hold at ERP Update, alert Finance Manager
R-007 (post rule-change Invoice ‡ n10,00,000 fi CFO approval (replaces R-004)
demo)
Bob tasks (implementation plan)
1. Update approval service · 2. Add invoice validation · 3. Implement duplicate detection · 4. Add PO matching ·
5. Add approval routing · 6. Add audit logging · 7. Generate tests · 8. Update documentation.
Test results (27 total)
Category Count Example
Vendor validation 5 Valid vendor accepted / unknown vendor rejected
Duplicate detection 3 Duplicate invoice number + amount rejected
PO matching 4 Matching PO accepted / missing PO routed to review
Confidential — Draft Frontend Spec Page 38

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Amount / routing 8 n2L fi Manager; n8L fi CFO; boundary at n5L
ERP + audit 4 ERP update recorded; audit entry written per state change
Regression (post rule-change) 3 Threshold now n10L; n8L now routes to Manager, not CFO
Approval states
Pending · Approved · Rejected · Escalated (auto-escalates to CFO if Finance Manager doesn't respond within
the demo's simulated SLA).
Rule-change scenario (the demo's “wow moment”)
Before Invoices >= Rs 5,00,000 -> CFO approval
After Invoices >= Rs 10,00,000 -> CFO approval
Immediate effect on demo invoices:
INV-1043 (Rs 8,10,000) CFO -> Finance Manager [changed by this rule]
A new INV-1046 (Rs 12,00,000) would still require CFO
Confidential — Draft Frontend Spec Page 39

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
49. Responsive behavior
The demo will be recorded on desktop, but the app should degrade sensibly rather than break if a judge opens
it on a laptop or tablet.
Breakpoint Width Sidebar Topbar Graph / canvas Tables
pages
Desktop ‡ 1440 Expanded (252px), Full width, all icons + Full pan/zoom Full columns
px always visible search bar visible canvas, inspector as visible
a 320px side panel
Laptop 1024– Expanded, same as Search collapses to Canvas scales down Full columns,
1439p desktop an icon that expands proportionally; tighter padding
x on click inspector still a side
panel
Tablet 768– 1 Collapsed to icon rail Page title only, icons Inspector becomes a Lower-priority
023px (64px) by default, condensed into an bottom sheet instead columns (e.g.
expandable on tap overflow menu of a side panel “Owner”) hidden
behind a details
expander
Mobile < 768p Becomes a slide-in Hamburger + page Canvas becomes Tables convert
x drawer, closed by title + avatar only scroll/pinch-zoom to stacked
default only; node inspector cards (one card
opens as a per row,
full-screen sheet label/value
pairs)
KPI rows go from 4-across (desktop/laptop) to 2×2 (tablet) to a single stacked column (mobile). The Build Pipeline and
Change Impact Graph components keep their vertical/graph shape at every breakpoint — they just shrink, they never
re-flow into a table.
50. Design system
Typography
Role Font / size / weight Use
Display Helvetica-Bold, 27px Landing hero headline only
H1 Helvetica-Bold, 20px Page titles
H2 Helvetica-Bold, 15px Section headers within a page
H3 Helvetica-Bold, 13px Card / panel headers
Body Helvetica-Regular, 13px / 1.5 Default text
line-height
Small / meta Helvetica-Regular, 11px Timestamps, helper text, captions
Confidential — Draft Frontend Spec Page 40

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
Mono Courier / monospace, 12px Rule values, code diffs, IDs, currency figures in impact
views
Spacing scale (4px base unit)
4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64px. Component-internal padding uses the smaller half of the scale (4–20px);
layout gaps between sections use the larger half (24–64px).
Border radius
Element Radius
Buttons, inputs, badges 8px
Cards, panels, modals 12px
Avatars Full circle (50%)
Toasts 10px
Shadows
Level Use Value
sm Default card resting state 0 1px 2px rgba(15,23,42,0.06)
md Hovered card, dropdowns 0 4px 12px rgba(15,23,42,0.10)
lg Modals, drawers 0 12px 32px rgba(15,23,42,0.18)
Icons
Single icon set throughout (line-style, 1.5px stroke, 20px default size). Status icons (3 n 5 l) always pair with
color, never color alone, so states remain readable without relying on color perception.
Component size variants
Component sm md (default) lg
Button 28px tall, 12px text 36px tall, 13px text 44px tall, 14px text — used
for primary page CTAs
Input 28px tall 36px tall 44px tall — used for the
Create Workflow name field
Badge 18px tall, 10px text 22px tall, 11px text not used
Confidential — Draft Frontend Spec Page 41

EnterpriseFlow AI — Frontend Design Document From broken workflow to working software.
51. Recommended build path (revised)
One change from the route structure and priority tiers in Section 42–43: don't build out every listed route as a
first pass. For the hackathon, treat the following as the one real, fully-working path, and build it end-to-end
before anything else:
Landing
|
v
Dashboard
|
v
Create Workflow
|
v
Workflow Analysis
|
v
Workflow Graph
|
v
Automation Blueprint
|
v
Bob / Build
|
v
Tests
|
v
Human Review
|
v
Run Workflow
|
v
Change Business Rule
|
v
Impact Analysis
|
v
Review & Approve
Everything else — Workflows list, global Activity, Audit Trail, Notifications, Documentation viewer, Profile,
Settings, Help, Search — is polish built around this path, not a prerequisite for it. This is a sharper version of the
Tier A/B/C split in Section 43: it's not just a priority ordering, it's the literal sequence of screens that should work,
in order, without a dead end, before any Tier B or Tier C page is touched.
In practice: if the demo can walk this exact chain live, the hackathon submission works, even if every other route in
Section 42 is a static placeholder.
Confidential — Draft Frontend Spec Page 42

