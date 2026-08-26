EnterpriseFlow AI
Product Requirements Document
From broken workflow to working software.
PRODUCT EnterpriseFlow AI
MVP SCOPE Invoice Approval workflow
ENGINEERING PARTNER IBM Bob (Plan / Subagents / Agent)
DOCUMENT STATUS Draft v1.0 — Hackathon PRD

EnterpriseFlow AI — PRD From broken workflow to working software.
Table of Contents
1. Product in one sentence
2. What are we actually building?
3. Why this is a legitimate problem
4. Who is the user?
5. The concrete MVP
6. The exact workflow we're going to demonstrate
7. What EnterpriseFlow does to it
8–12. Five major outputs (Workflow Map, Automation Plan, Technical Blueprint, Risk & Governance, Build Pipeline)
13–18. IBM Bob's role, workflow stages, subagents, testing, human approval
19–20. The major demo moment
21. Full system architecture
22. Frontend screens
23–29. Backend structure, data design, rules engine, workflow graph, impact engine, repository, /init
30. Suggested technology stack
31. AI vs. deterministic code
32–33. What not to build / what must be built
34. Demo video structure
35–37. Judge takeaways, biggest risk, final product definition
1 Product in one sentence
EnterpriseFlow AI converts a messy business workflow into a structured automation blueprint, then uses
IBM Bob as the engineering agent to turn that blueprint into working, tested, and documented software.
The original concept describes exactly this lifecycle: business fi workflow fi blueprint fi Bob fi software.
Tagline: “From broken workflow to working software.”
2 What are we actually building?
This is the most important part of the document.
We are NOT building:
(cid:127) An enterprise chatbot
(cid:127) An AI workflow chatbot
(cid:127) A generic “AI automation platform”
(cid:127) Another code generator
(cid:127) A SaaS dashboard that merely calls an LLM
(cid:127) An AI agent that autonomously runs a company's business
Confidential — Draft PRD Page 1

EnterpriseFlow AI — PRD From broken workflow to working software.
Instead, we're building a prototype of a bridge between business requirements and software
engineering.
The problem
Imagine a finance manager says: “Our invoice approval process is too slow. Employees receive invoices by
email, manually check vendors, find the purchase order, verify the amount, email managers for approval,
update the ERP, and store the records.”
Today, translating that sentence into software requires many people and handoffs: business person fi
business analyst fi requirements document fi architect fi developer fi backend developer fi tester fi
documentation fi deployment.
EnterpriseFlow tries to compress this chain into a single pipeline:
Business requirement
|
EnterpriseFlow
|
Workflow understanding
|
Automation blueprint
|
IBM Bob
|
Working software
|
Tests + documentation
|
Human approval
The original concept explicitly frames the problem as fragmented workflows, plus the slow journey from
business requirement fi design fi implementation fi testing fi deployment fi documentation.
3 Why this is a legitimate problem
A judge should be able to understand the problem without knowing AI.
Large organizations run processes such as:
(cid:127) Invoice approval
(cid:127) Employee onboarding
(cid:127) Customer escalation
(cid:127) Internal IT requests
(cid:127) Procurement
(cid:127) Leave / approval workflows
(cid:127) Compliance processes
(cid:127) Support escalation
Confidential — Draft PRD Page 2

EnterpriseFlow AI — PRD From broken workflow to working software.
These often cross multiple systems:
(cid:127) Email
(cid:127) Spreadsheets
(cid:127) Databases
(cid:127) APIs
(cid:127) ERP systems
(cid:127) Dashboards
(cid:127) Legacy applications
The original EnterpriseFlow document explicitly uses invoice approval as its concrete example, and
identifies long approval cycles, duplicate or incorrect invoices, poor auditability, manual context switching,
and engineering effort every time the workflow changes.
The important insight
The problem isn't simply “Companies have inefficient workflows.” That's too generic. The stronger, sharper
framing is:
Companies know which workflows they want to automate — but converting those business
requirements into reliable software still requires too many engineering handoffs.
That is precisely where EnterpriseFlow lives.
4 Who is the user?
There are two users.
Primary user — Business / process owner (example: Finance Manager)
They know:
(cid:127) What the process is
(cid:127) Where it is slow
(cid:127) What rules exist
(cid:127) What they want changed
But they don't necessarily know:
(cid:127) API architecture
(cid:127) Database schema
(cid:127) Backend services
(cid:127) Test architecture
(cid:127) Deployment
(cid:127) Code structure
Confidential — Draft PRD Page 3

EnterpriseFlow AI — PRD From broken workflow to working software.
They should be able to simply say: “Here is our SOP. This is what's wrong with the process.”
Secondary user — Engineering team
Developers receive a fully-formed package:
(cid:127) Workflow
(cid:127) Requirements
(cid:127) Rules
(cid:127) Acceptance criteria
(cid:127) Affected components
(cid:127) Implementation plan
IBM Bob then helps turn this package into actual software.
5 The concrete MVP
Do not attempt: “EnterpriseFlow can automate any enterprise workflow.” That's a pitch, not an MVP.
The original concept itself recommends keeping the MVP focused on one use case, such as invoice
approval or employee onboarding.
Our MVP: one workflow — Invoice Approval. That's it. The entire hackathon demo revolves around
it.
6 The exact workflow we're going to demonstrate
Current (manual) process:
Invoice arrives
|
Employee checks vendor
|
Find purchase order
|
Verify amount
|
Email manager
|
Wait for approval
|
Update ERP
|
Store records
This is the workflow given in the original concept.
Confidential — Draft PRD Page 4

EnterpriseFlow AI — PRD From broken workflow to working software.
7 What EnterpriseFlow does to it
The system identifies actors, systems, decisions, and problems.
Actors Systems Problems
Employee Email Manual vendor verification
Finance manager Purchase-order database Manual PO matching
CFO Vendor database Duplicate invoices
Vendor ERP Email-based approval
ERP system EnterpriseFlow Unclear audit trail
Slow handoffs
Decisions the workflow must resolve:
Is vendor valid?
|
Does PO exist?
|
Does invoice match PO?
|
Is amount above approval threshold?
|
Who must approve?
Confidential — Draft PRD Page 5

EnterpriseFlow AI — PRD From broken workflow to working software.
8-1
EnterpriseFlow's five major outputs
2
The original concept defines these five outputs explicitly.
Output 1 — Workflow Map
Invoice Received
|
v
Vendor Validation
|
v
Duplicate Check
|
v
PO Matching
|
v
Amount Verification
|
v
Approval Routing
/ \
Manager CFO
\ /
v
ERP Update
|
v
Audit Log
This gives the business user a visual representation of their process.
Output 2 — Automation Plan
EnterpriseFlow decides what should happen automatically versus what stays human.
Step Automation Human
Vendor validation 3 —
Duplicate detection 3 —
PO matching 3 —
Amount verification 3 —
Approval routing 3 —
High-value approval — CFO
ERP update 3 —
Exception handling Partial 3
Confidential — Draft PRD Page 6

EnterpriseFlow AI — PRD From broken workflow to working software.
The important thing: AI does not automatically eliminate human decision-making. The original
architecture explicitly keeps a human review gate so AI accelerates the process while humans retain
control over important business/production decisions.
Output 3 — Technical Blueprint
This is where EnterpriseFlow becomes technically interesting: it transforms a business requirement into a
technical specification.
workflow:
name: invoice_approval
actors:
- employee
- finance_manager
- cfo
steps:
- vendor_validation
- duplicate_detection
- po_matching
- amount_verification
- approval_routing
- erp_update
rules:
approval_threshold:
amount: 500000
approver: CFO
integrations:
- vendor_api
- purchase_order_api
- erp_api
requirements:
- duplicate invoices must be rejected
- unmatched PO requires manual review
- invoices above threshold require CFO approval
This structured representation is extremely important. Do not let the entire application be prompt fi
LLM fi paragraph — that will look weak under AI code review.
Output 4 — Risk & Governance Check
EnterpriseFlow should proactively surface:
Confidential — Draft PRD Page 7

EnterpriseFlow AI — PRD From broken workflow to working software.
Security Data Failure cases
Sensitive financial data Invoice information Vendor API unavailable
Authentication Vendor information PO doesn't exist
Authorization Purchase-order data Invoice is duplicate
API credentials ERP unavailable
Manager doesn't respond
Invoice exceeds threshold
Human-control requirement (example):
EnterpriseFlow must never automatically approve a high-value invoice.
AI detects high-value invoice
|
CFO approval required
|
Human decision
|
Continue
Output 5 — Build Pipeline
This is where the IBM Bob part begins. EnterpriseFlow passes the structured blueprint into a Bob-enabled
development workspace.
The original concept proposes this lifecycle: Plan fi parallel workstreams / subagents fi
implementation fi testing fi documentation.
Confidential — Draft PRD Page 8

EnterpriseFlow AI — PRD From broken workflow to working software.
13-
IBM Bob's exact role
18
This needs to be extremely clear: IBM Bob is not the business workflow engine — it is the
engineering agent.
Current IBM documentation describes Bob as an AI SDLC partner that works with real codebases. Its
capabilities include generating code, refactoring/debugging, documentation, codebase Q&A, task
automation, project scaffolding, and specialized modes.
Its current built-in modes are:
Mode Purpose
Ask Understand the existing codebase.
Plan Design the implementation.
Agent Actually modify / build the code.
IBM specifically recommends starting complex projects in Plan mode and then switching to Agent mode for
implementation.
Bob workflow inside EnterpriseFlow
Stage 1 — Ask. Bob examines the existing sample repository. Example prompt: “Analyze this invoice
automation repository and explain its architecture.” Bob reads the code.
Stage 2 — Plan. EnterpriseFlow gives Bob the automation blueprint, and Bob produces an implementation
plan:
1 Create invoice service
2 Add vendor validation API
3 Add duplicate detection
4 Add PO matching
5 Add approval routing
6 Add CFO threshold rule
7 Add audit logging
8 Add tests
9 Update API documentation
Bob's Plan mode is explicitly intended for architecture, technical specifications, and breaking complex work
into implementation tasks.
Stage 3 — Subagents. This is where the demo can become visually impressive. Bob can spawn focused
subagents for self-contained tasks — isolated agents that work on focused tasks and return their results to
the main Bob conversation.
Confidential — Draft PRD Page 9

EnterpriseFlow AI — PRD From broken workflow to working software.
IBM BOB
|
+---------+---------+
v v v
Backend Testing Docs
Agent Agent Agent
| | |
v v v
APIs Test suite README
| | |
+---------+---------+
v
Main project
Possible workstreams:
(cid:127) Agent 1 — Backend: build invoice APIs
(cid:127) Agent 2 — Workflow: implement the approval state machine
(cid:127) Agent 3 — Testing: generate and execute tests
(cid:127) Agent 4 — Documentation: update technical documentation
Do not use subagents merely because they look impressive — the tasks need to be genuinely
separable.
Stage 4 — Agent mode. Bob now actually modifies the repository: create files, modify files, refactor, run
commands, run tests, debug, create documentation. IBM's current docs explicitly describe Agent mode as
the mode for writing, modifying and refactoring code, with file access and command execution.
This is where the judge should see: Bob isn't just being mentioned — Bob is actually building the
product.
Stage 5 — Testing. Bob generates tests that verify the actual workflow rules.
Invoice = INR 2,00,000 --> Manager approval
Invoice = INR 8,00,000 --> CFO approval
Example test checklist:
(cid:127) Valid vendor accepted
(cid:127) Duplicate invoice rejected
(cid:127) Matching PO accepted
(cid:127) Missing PO routed to exception
(cid:127) INR 2L fi manager
(cid:127) INR 8L fi CFO
Confidential — Draft PRD Page 10

EnterpriseFlow AI — PRD From broken workflow to working software.
Stage 6 — Human approval. The system should never say “AI built it, therefore deploy.”
Bob proposes changes
|
Diff / implementation
|
Tests
|
Human review
|
Approve / Reject
The original concept explicitly specifies this human review gate.
Confidential — Draft PRD Page 11

EnterpriseFlow AI — PRD From broken workflow to working software.
19-
The major demo moment
20
This is the part the entire demo video should be built around.
Initial rule:
Invoice < INR 5,00,000 --> Finance Manager
Invoice >= INR 5,00,000 --> CFO
The business manager then changes the requirement: “Invoices above INR 10,00,000 now require CFO
approval instead.”
EnterpriseFlow should understand the ripple effect:
Business rule changed
|
Workflow node affected
|
Automation blueprint updated
|
Implementation affected
|
Tests affected
|
Documentation affected
The original concept specifically identifies changing the approval threshold as the “wow” moment, and
proposes showing the affected workflow logic, implementation plan, code, tests, and documentation all
changing with Bob's assistance.
Why this demo is much stronger than “AI generates code”
Initial state:
Requirement --> Workflow --> Software
Then, on a requirement change:
Business rule changes
|
EnterpriseFlow understands impact
|
Workflow changes
|
Code changes
|
Tests change
|
Documentation changes
Confidential — Draft PRD Page 12

EnterpriseFlow AI — PRD From broken workflow to working software.
That is a much stronger demonstration of agentic software engineering than a single generated snippet.
Confidential — Draft PRD Page 13

EnterpriseFlow AI — PRD From broken workflow to working software.
21 Full system architecture
This should be the team's mental model of the whole system:
BUSINESS USER
|
"Our invoice process
is too slow"
|
v
+-------------------+
| EnterpriseFlow UI |
+---------+---------+
|
SOP / requirements
|
v
+------------------------+
| Workflow Intelligence |
| |
| Process extraction |
| Bottleneck detection |
| Decision extraction |
+-----------+------------+
|
v
+------------------------+
| Automation Blueprint |
| |
| Workflow graph |
| Rules |
| Integrations |
| Human approvals |
| Acceptance criteria |
+-----------+------------+
|
v
+-----------------+
| IBM BOB |
| |
| Ask |
| Plan |
| Subagents |
| Agent |
| Test |
| Document |
+--------+--------+
|
v
+-------------------+
| Working Software |
+---------+---------+
|
+--------+--------+
v v
Tests Docs
| |
+--------+--------+
v
+-----------------+
| Human Review |
| |
| Approve/Reject |
+--------+--------+
|
v
Workflow Execution
This follows the architecture in the original concept.
Confidential — Draft PRD Page 14

EnterpriseFlow AI — PRD From broken workflow to working software.
22 What YOU need to build — Frontend
A polished web application with roughly the following screens.
Screen 1 — Dashboard
EnterpriseFlow
Active Workflows
----------------------------
Invoice Approval * Active
Employee Onboarding o Draft
For MVP, only Invoice Approval needs to exist.
Screen 2 — Create Workflow
Describe your process
[ Our finance team receives invoices... ]
Upload supporting documents
[ invoice-approval-SOP.pdf ]
[ Analyze Workflow ]
Screen 3 — Workflow Analysis
Workflow detected
Actors
[x] Employee
[x] Finance Manager
[x] CFO
Systems
[x] Email
[x] PO System
[x] ERP
Bottlenecks
! Manual PO matching
! Email approval
! Duplicate checking
Screen 4 — Workflow Graph
Visual state machine.
Confidential — Draft PRD Page 15

EnterpriseFlow AI — PRD From broken workflow to working software.
Invoice
|
Validate Vendor
|
Duplicate?
/ \
YES NO
| |
Reject Match PO
|
Verify Amount
|
Approval Router
/ \
Manager CFO
\ /
ERP
Screen 5 — Automation Blueprint
(cid:127) Services
(cid:127) APIs
(cid:127) Rules
(cid:127) Integrations
(cid:127) Approval points
(cid:127) Acceptance criteria
Screen 6 — Bob Build
IBM Bob
PLAN
[x] Analyze repository
[x] Identify affected modules
[x] Create implementation plan
SUBAGENTS
[x] Backend
[x] Workflow
[x] Testing
[x] Documentation
IMPLEMENTATION
[x] 14 files changed
[x] 3 services added
[x] 27 tests generated
You should also show actual Bob in the recorded video, not only recreate its UI inside your product.
Screen 7 — Review
Confidential — Draft PRD Page 16

EnterpriseFlow AI — PRD From broken workflow to working software.
Implementation Ready
Files changed: 14
Tests: 27
Documentation: Updated
Business Rules:
[x] Invoice validation
[x] Duplicate detection
[x] Approval routing
[ Review Changes ]
[ Approve ]
[ Reject ]
Confidential — Draft PRD Page 17

EnterpriseFlow AI — PRD From broken workflow to working software.
23 Backend structure
Suggested backend directory layout:
backend/
|
+-- workflow/
| +-- parser
| +-- extractor
| +-- analyzer
| +-- graph
|
+-- blueprint/
| +-- generator
| +-- validator
| +-- schema
|
+-- rules/
| +-- approvalRules
| +-- invoiceRules
| +-- validationRules
|
+-- bob/
| +-- planner
| +-- taskGenerator
| +-- workspace
|
+-- execution/
| +-- workflowEngine
| +-- stateMachine
|
+-- review/
| +-- diff
| +-- approval
|
+-- audit/
|
+-- tests/
24 The most important technical design decision
Use structured data between every major stage.
Don't do:
User -> LLM -> Huge paragraph -> LLM -> Code
Do:
User -> LLM -> Workflow JSON -> Validator -> Workflow Graph
-> Automation Blueprint JSON -> Validator -> Bob -> Code
Example structured payload:
Confidential — Draft PRD Page 18

EnterpriseFlow AI — PRD From broken workflow to working software.
{
"workflow": "invoice_approval",
"actors": [
"employee",
"finance_manager",
"cfo"
],
"steps": [
{ "id": "validate_vendor", "type": "automated" },
{ "id": "match_po", "type": "automated" },
{ "id": "approval", "type": "human" }
],
"rules": [
{ "condition": "amount >= 500000",
"action": "require_cfo_approval" }
]
}
That makes the system much easier to test and far more credible under AI code review.
25 Business-rule engine
This should not be entirely LLM-driven.
if (invoice.amount >= approvalThreshold) {
return "CFO";
}
return "FINANCE_MANAGER";
The LLM can interpret the business requirement, but the actual business rule should become deterministic
code/configuration. This gives:
(cid:127) Reproducibility
(cid:127) Tests
(cid:127) Predictable behavior
(cid:127) Explainability
(cid:127) Easier code review
26 Workflow graph
Internally, represent the workflow as a graph / state machine:
Confidential — Draft PRD Page 19

EnterpriseFlow AI — PRD From broken workflow to working software.
InvoiceReceived
|
VendorValidation
|
DuplicateCheck
|
POMatching
|
AmountVerification
|
ApprovalRouting
|
ERPUpdate
|
AuditLog
Each node can carry:
{
id,
type,
actor,
automated,
inputs,
outputs,
rules,
nextStates
}
This becomes the bridge between business language and actual software.
Confidential — Draft PRD Page 20

EnterpriseFlow AI — PRD From broken workflow to working software.
27 Business-rule impact engine
This is potentially the most technically valuable part of EnterpriseFlow.
Suppose 500000 changes to 1000000. Your system should know:
Rule changed
|
ApprovalRouting affected
|
ApprovalService affected
|
Tests affected
|
Documentation affected
Not simply “Here is some new code.” This is what makes EnterpriseFlow more than an LLM wrapper.
28 What Bob should actually modify
Create a small but real repository, for example:
invoice-automation/
|
+-- src/
| +-- invoices/
| +-- vendors/
| +-- purchase-orders/
| +-- approval/
| +-- audit/
| +-- api/
|
+-- tests/
|
+-- docs/
|
+-- package.json
Bob should actually work inside this repository. IBM's own documentation demonstrates Bob working
against real repositories, reading project context, planning changes, editing files, running commands, and
iterating on failures.
29 Use /init
This is something I would explicitly use in the project. IBM Bob's /init creates AGENTS.md project-context
files that describe:
(cid:127) Project purpose
(cid:127) Architecture
(cid:127) Directory structure
(cid:127) Conventions
Confidential — Draft PRD Page 21

EnterpriseFlow AI — PRD From broken workflow to working software.
(cid:127) Development workflow
Bob then uses that persistent project context in future conversations.
invoice-automation/
|
+-- AGENTS.md
|
+-- .bob/
| +-- rules-code/
| +-- rules-plan/
| +-- rules-ask/
|
...
This also gives a nice moment to show in the video: “We initialize Bob with the project's engineering
context.”
Confidential — Draft PRD Page 22

EnterpriseFlow AI — PRD From broken workflow to working software.
30 Suggested technology stack
Layer Recommendation
Frontend Next.js + TypeScript, or React + Vite
Backend Node.js + TypeScript
Database PostgreSQL (SQLite/PostgreSQL is enough for the hackathon MVP)
Workflow Custom TypeScript state-machine / graph layer
AI interpretation Whatever runtime AI technology the hackathon rules permit
Important: don't assume IBM Bob itself is an end-user runtime API. IBM's official documentation
positions Bob as an AI SDLC partner working inside the development environment, with
Plan/Agent/Ask modes, tools, and subagents.
The architecture should distinguish:
EnterpriseFlow runtime
+
IBM Bob development workflow
rather than pretending:
EnterpriseFlow frontend
|
IBM Bob API
...unless the organizers explicitly provide/support such an integration.
31 What AI should do vs. what normal code should do
This distinction is critical to the credibility of the project.
Task AI Deterministic code
Understand SOP 3 —
Extract workflow 3 validation
Identify bottlenecks 3 —
Generate blueprint 3 schema
Validate blueprint — 3
Execute approval rules — 3
Store workflow state — 3
Confidential — Draft PRD Page 23

EnterpriseFlow AI — PRD From broken workflow to working software.
Task AI Deterministic code
Calculate threshold — 3
Generate implementation plan Bob —
Write application code Bob —
Run tests — 3
Human approval — 3
Audit trail — 3
This architecture will make the repository much more credible.
Confidential — Draft PRD Page 24

EnterpriseFlow AI — PRD From broken workflow to working software.
What NOT to build / What you absolutely MUST
32-
33 build
This is just as important as what to build.
Do not build:
(cid:127) 6 Generic chatbot
(cid:127) 6 “Ask AI about your workflow”
(cid:127) 6 20 enterprise workflows
(cid:127) 6 Real SAP integration
(cid:127) 6 Real Oracle integration
(cid:127) 6 Production ERP deployment
(cid:127) 6 Enterprise authentication system
(cid:127) 6 Billing
(cid:127) 6 Multi-tenancy
(cid:127) 6 Complex Kubernetes deployment
(cid:127) 6 Autonomous financial approval
(cid:127) 6 Huge RAG system
(cid:127) 6 50 AI agents
The original concept itself says to keep the MVP focused rather than attempting to automate every
enterprise process.
What you absolutely MUST build — if time becomes tight, prioritize in this order:
Tier 1 — Non-negotiable
1 Invoice workflow
2 Workflow extraction
3 Workflow graph
4 Automation blueprint
5 Real sample repository
6 IBM Bob Plan
7 IBM Bob Agent implementation
8 Tests
9 Business-rule change
10 Human approval
Tier 2
1 Subagents
2 Documentation generation
Confidential — Draft PRD Page 25

EnterpriseFlow AI — PRD From broken workflow to working software.
3 Audit trail
4 Before/after metrics
Tier 3
1 Beautiful dashboard
2 Additional workflow types
3 Advanced analytics
4 Enterprise integrations
If Tier 1 works, you have a hackathon project.
Confidential — Draft PRD Page 26

EnterpriseFlow AI — PRD From broken workflow to working software.
34 What the video should show
Because this is an online submission and the video is human-reviewed, don't make the video a generic
product tour. Suggested story beats:
Timestamp Beat
Show the problem — “This invoice process requires 8 manual steps across email,
0–10 sec
purchase orders and ERP.”
10–25 sec Business manager gives EnterpriseFlow the workflow/SOP.
25–40 sec Workflow graph appears.
40–55 sec Automation blueprint appears.
55–80 sec Show IBM Bob: Plan fi tasks fi subagents.
80–105 sec Bob actually modifies the repository.
105–120 sec Tests run.
120–135 sec Human approves.
The big moment: change INR 5,00,000 to INR 10,00,000, then show rule fi workflow fi
135–160 sec
code fi tests fi docs all changing.
Show before/after: 8 manual steps & 2 email handoffs vs. automated validation,
160–175 sec
automated routing, audit trail, human approval retained.
Final 5 sec “EnterpriseFlow AI — From broken workflow to working software.”
Confidential — Draft PRD Page 27

EnterpriseFlow AI — PRD From broken workflow to working software.
35-
Judge takeaways, biggest risk, and final definition
37
What the judge should understand after the video
If executed correctly, the judge should leave with exactly three thoughts:
1 “They solved a real enterprise problem.”
2 “Bob is actually doing substantial engineering work.”
3 “This isn't just another chatbot.”
That is the target.
The biggest danger
The biggest danger is not technical difficulty. It's this:
EnterpriseFlow becomes a beautiful workflow diagram generator that then asks Bob to write some
code.
If that happens, the project becomes weak. The actual product needs to be:
Business requirement
|
Structured workflow
|
Automation blueprint
|
Real codebase
|
Bob engineering lifecycle
|
Working automation
|
Rule change
|
Impact analysis
|
Updated code + tests + docs
The original concept's strongest differentiator is precisely the translation from business language to a
structured engineering artifact before Bob takes over.
Final product definition
Confidential — Draft PRD Page 28

EnterpriseFlow AI — PRD From broken workflow to working software.
ENTERPRISEFLOW AI
|
"Our process is broken"
|
v
+------------------+
| Workflow Analyzer|
+---------+--------+
|
v
WORKFLOW GRAPH
|
v
AUTOMATION BLUEPRINT
|
+---------+---------+
| |
Rules Acceptance
Criteria
| |
+---------+---------+
|
v
IBM BOB
|
+-------------+-------------+
| | |
PLAN SUBAGENTS AGENT
| | |
+-------------+-------------+
v
REAL CODEBASE
|
+----+----+
v v
TESTS DOCS
| |
+----+----+
v
HUMAN REVIEW
|
v
WORKFLOW RUNS
|
v
BUSINESS RULE
CHANGES
|
v
IMPACT ANALYSIS
|
+---------+---------+
v v v
CODE TESTS DOCS
| | |
+---------+---------+
v
UPDATED SYSTEM
The key point: the original concept already supports this structure — workflow extraction, automation
blueprint, Bob across Plan/subagents/implementation/testing/documentation, human review, and the
business-rule-change demonstration are all explicitly present in the source.
EnterpriseFlow AI — From broken workflow to working software.
Confidential — Draft PRD Page 29

EnterpriseFlow AI — PRD From broken workflow to working software.
38 Exact input/output contracts
Before the PRD is called final, the schemas for every stage of the pipeline need to be defined explicitly —
not represented only by examples. This matters because AI-assisted code review should be able to see that
the system passes structured data between stages, not blobs of LLM text.
SOP
|
v
WorkflowExtraction
|
v
WorkflowGraph
|
v
AutomationBlueprint
|
v
ImplementationPlan
|
v
ChangeImpact
This is consistent with the project's existing recommendation to use explicit schemas, deterministic rules, an
inspectable blueprint, and a clear rule fi workflow fi code mapping (see Section 24).
39 Acceptance criteria
Every stage needs measurable acceptance criteria, not just a description of intent. Otherwise the project is
difficult to prove correct. Examples:
Stage Acceptance criterion
Workflow extraction Given the invoice SOP, identify all defined actors, steps, decisions, and systems.
Blueprint Every automated workflow node must map to a component/service.
Rule engine Every approval threshold must have deterministic tests.
Bob implementation All generated code must pass the existing test suite.
40 Failure states
The PRD has so far focused heavily on the happy path. The following failure states need explicit, defined
behavior:
SOP cannot be parsed --> Show extraction failure
Invalid workflow schema --> Reject blueprint
Ambiguous business rule --> Ask human
Bob implementation fails --> Show failed task + retry/fix
Generated tests fail --> Return to implementation
Human rejects change --> Do not execute/deploy
Confidential — Draft PRD Page 30

EnterpriseFlow AI — PRD From broken workflow to working software.
This aligns with risks already identified elsewhere in this document — schema inconsistency, unreliable
integrations, and incorrect rule propagation (see Section 8–12, Output 4) — which call for validation and
deterministic normalization at each stage.
41 Exact before vs. after metric
“8 manual steps fi automated validation/routing” is directionally correct but not precise enough to demo or
defend. The metric needs to be pinned down exactly, for example:
BEFORE AFTER
8 workflow steps 3 automated verification steps
2 email handoffs 1 human approval point
4 manual verification points 1 audit trail
Do not invent claims such as “80% faster” unless they can actually be measured. One before/after impact metric,
defined precisely, is sufficient for the MVP.
42 Bob evidence strategy
This is critical for the hackathon specifically: the project needs to make Bob's contribution undeniable to a
judge. The repository should visibly contain:
(cid:127) AGENTS.md
(cid:127) Bob task prompts
(cid:127) Bob-generated commits
(cid:127) Implementation changes
(cid:127) Tests
(cid:127) Documentation
The demo video should also visibly show Bob doing meaningful work, not just being mentioned. This
addresses the open question — already flagged elsewhere in the broader project analysis — of what “using
IBM Bob” concretely means, and guards against superficial Bob usage.
Formal acceptance criterion:
“Can a judge clearly see that Bob materially contributed to building this?”
43 Submission-specific requirements
This is the one area that should not be treated as settled by the PRD alone. The working assumption is:
Online submission fi a human watches the video, and the code is reviewed.
Before submission, the actual organizer requirements still need to be verified separately, covering:
(cid:127) Video duration
(cid:127) Repository requirements
(cid:127) README requirements
Confidential — Draft PRD Page 31

EnterpriseFlow AI — PRD From broken workflow to working software.
(cid:127) Bob usage evidence
(cid:127) Required IBM technologies
(cid:127) Deployment / demo URL requirements
(cid:127) File-size limits
(cid:127) Judging criteria
(cid:127) Whether screenshots / session recordings are required
(cid:127) Whether external APIs are permitted
These are submission constraints, not product architecture, and should be tracked separately from the PRD.
44 One correction to preserve
One thing this pass explicitly does not change: Bob should not be presented as the runtime workflow
engine. The distinction already drawn in Section 13–18 is correct and should stay fixed:
EnterpriseFlow = business / workflow intelligence
Bob = engineering agent
That framing is materially more defensible than positioning EnterpriseFlow as a thin wrapper around an “IBM
Bob API” chatbot.
45 Readiness assessment
Area Status
Product definition 95% complete
Architecture 95% complete
MVP scope 100% clear
Demo story 100% clear
Bob integration concept 90% clear
Implementation contracts Need to formalize
Submission requirements Need final verification
There is enough here to start — but one more pass is warranted before anyone writes production code. That
next document should be a Build Specification, not another idea document, and should contain:
1. Exact features 2. Exact screens
3. Exact API endpoints 4. Exact database/schema
5. Exact JSON schemas 6. Exact workflow graph schema
7. Exact blueprint schema 8. Exact rule engine
9. Exact Bob workflow/prompts 10. Exact repository structure
11. Exact test cases 12. Exact failure states
13. Exact acceptance criteria 14. Exact demo data
Confidential — Draft PRD Page 32

EnterpriseFlow AI — PRD From broken workflow to working software.
15. Exact 2–3 minute video script 16. Exact team task split
17. Exact 48-hour build order 18. Definition of Done
Confidential — Draft PRD Page 33

