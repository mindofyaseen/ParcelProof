# ParcelProof — Zero to Shipped Master Brief

> **Purpose:** This file is the single source of truth for a fresh Codex chat. Read it completely before changing code or AWS resources. The product decision is final: build and ship ParcelProof. Do not restart idea hunting unless the user explicitly changes the product.

## First message for the new Codex chat

Copy and send this message after opening the `ParcelProof` folder in a new Codex chat:

```text
Read PARCELPROOF_MASTER_BRIEF.md completely and treat it as the source of truth. We are building ParcelProof for the AWS Zero to Shipped Hackathon and the deadline is urgent. First verify the AWS MCP connection using a read-only call, inspect the repository, create a concise execution checklist, and then begin Phase 1 immediately. Use the coding agent for AWS work so we preserve evidence. Do not return to idea hunting and do not expand the MVP beyond the brief. Make reasonable decisions and keep shipping.
```

## 1. Current verified status

As of **October 1, 2026, Pakistan time**:

- GitHub repository: <https://github.com/mindofyaseen/ParcelProof>
- Repository is public and was empty when this brief was created.
- Local AWS CLI is installed and an authenticated AWS identity responds successfully.
- Git, Node.js, npm, Codex CLI, and `uvx` are installed.
- The official managed AWS MCP Server is registered globally in Codex as `aws-mcp`.
- MCP transport is local stdio through the AWS SigV4 proxy.
- AWS MCP endpoint: `https://aws-mcp.us-east-1.api.aws/mcp`
- Default AWS Region for this project: `us-east-1`.
- Do not display, commit, screenshot, or publish access keys, secret keys, account IDs, full ARNs, tokens, or private customer data.

Registered MCP configuration:

```text
name: aws-mcp
command: uvx
args: mcp-proxy-for-aws-cli@latest
      https://aws-mcp.us-east-1.api.aws/mcp
      --metadata AWS_REGION=us-east-1
```

The new chat must test this connection with a **read-only** MCP call before deployment work. A suitable test is `sts:GetCallerIdentity`, with account-specific values masked in any public evidence.

## 2. Hackathon facts and non-negotiable requirements

Hackathon: **AWS Zero to Shipped**

- Official submission deadline: **October 2, 2026 at 11:59 PM PDT**.
- Equivalent Pakistan deadline: **October 3, 2026 at 11:59 AM PKT** because PDT is UTC-7 and PKT is UTC+5.
- Treat October 2 Pakistan time as the internal build deadline. Keep the remaining hours as deployment/submission buffer.
- There are approximately 3,530 registered participants, but registrations are not the same as eligible shipped submissions.
- There are five total winners selected across categories. The rules do **not** promise one winner per category.
- Limit: one entry per person.

Mandatory ship gate:

1. A coding agent must be connected to AWS, with documented proof.
2. The application must be live on AWS.
3. It must have a public URL accessible to both automated scoring and human judges.
4. The submission must be an original application that was not previously published.
5. The Builder Center project must explain the product, development process, AWS services, and coding-agent usage.
6. It must name one category and one lane.

Judging criteria, each worth 25%:

- Technical Innovation and Originality
- Implementation Quality
- Community or Market Impact
- Creativity and Storytelling

The top 100 qualifying submissions advance from Gate 1. Five winners are then selected by human judges from the shortlist.

### Final category and lane

- **Category:** `#commercial-potential`
- **Lane:** `#startups`

Reason: ParcelProof is a vertical SaaS product for small online sellers and fulfilment teams. Do not misclassify it merely to seek a less crowded category; category fit and credible product-market story matter.

## 3. Product decision

### Name

**ParcelProof**

Working tagline:

> Catch the wrong item before the parcel leaves the table.

### One-sentence pitch

ParcelProof compares a seller's order with a packing photo, blocks visible mistakes such as missing items, wrong variants, wrong quantities, or incorrect personalised text, and verifies the corrected parcel before shipment.

### The problem

Small online sellers often pack visually varied, personalised orders by hand. Barcode-only systems do not fully describe colour, printed names, gift-card messages, handmade items, or mixed gift boxes. One mistake causes a refund, reshipment, lost margin, and a disappointed customer.

### Target user

Initial target:

- Instagram, WhatsApp, Etsy-style, and home-based sellers
- Gift-box and hamper businesses
- Personalised mug, shirt, stationery, jewellery, and bakery sellers
- Small teams that cannot afford warehouse-grade hardware or enterprise software

### Demonstration order

Expected order:

- 1 blue mug
- 1 chocolate bar
- 1 greeting card
- Exact visible personalisation: `Happy Birthday Ayesha`

Deliberately incorrect packed order:

- 1 red mug
- 1 chocolate bar
- 1 greeting card
- Visible text: `Happy Birthday Alisha`

Expected ParcelProof result:

- Status: `BLOCK`
- Wrong variant: expected blue mug; observed red mug
- Personalisation mismatch: expected Ayesha; observed Alisha
- Chocolate present
- Greeting card present
- Clear instruction to correct and rescan

Corrected photo result:

- Status: `PASS`, but only when every required check is confidently satisfied
- A second inspection is saved and linked to the same order
- The UI visibly shows the correction history from blocked to passed

## 4. Why this idea can compete

ParcelProof has five useful strengths:

1. The problem can be understood in seconds.
2. The live demo has a visible failure, correction, and verified outcome.
3. The result is commercially meaningful: preventing refunds and reshipments.
4. AI is used for perception while deterministic code retains authority over the final decision.
5. AWS is part of the product workflow, not merely static hosting.

### Honest prior-art position

Do not claim ParcelProof is the world's first packing-verification product. Enterprise tools such as PackVision already use barcode scanning and packing video. ParcelProof's focused hypothesis is:

> Small sellers need lightweight visual verification for personalised, non-barcoded, and visually variable orders.

This is a hypothesis to test, not a proven market claim. The submission should state the distinction honestly.

### Competitive quality bar

Strong submissions observed during research include AgentSentry, Chaperone, Firsthand, Buyable, PlateGap, SpecLoom, Rapport, and MisconceptionMap. Their strongest qualities are real deployment evidence, bounded scope, transparent limitations, measurable tests, and a complete before/after story. ParcelProof must meet that standard through execution rather than inflated claims.

## 5. MVP boundaries

### Must ship

- Public judge-friendly web application
- Create or load a demo order
- Structured order requirements: item, quantity, colour/variant, and optional exact personalisation
- Private image upload using a short-lived presigned S3 URL
- A real multimodal model on Amazon Bedrock inspects the image
- Model output is validated against a strict JSON schema
- Deterministic comparison produces `PASS`, `REVIEW`, or `BLOCK`
- Human-readable evidence for every decision
- Correction and reinspection flow
- Inspection history for an order
- One-click seeded judge demo
- Loading, failure, retry, and low-confidence states
- Unit, integration, infrastructure, and browser tests
- Live AWS deployment and public URL
- Coding-agent/AWS evidence and a strong Builder Center write-up

### Explicitly out of scope

- Continuous warehouse video processing
- Live CCTV integration
- Shipping-label purchase or courier integration
- Full inventory management
- Payments or subscriptions
- Multi-tenant enterprise administration
- Automatic claims that a sealed or hidden product is present
- Weight verification
- Authentication unless the core app is already fully shipped
- Native mobile application
- Training a custom computer-vision model
- Supporting every product category

Do not expand scope until the public vertical slice works end to end.

## 6. Trust model and decision logic

The key implementation principle is:

> The model observes; deterministic code decides.

The Bedrock model must return structured observations rather than a final shipping decision.

Suggested model response schema:

```json
{
  "observedItems": [
    {
      "label": "mug",
      "quantity": 1,
      "attributes": { "color": "red" },
      "visibleText": [],
      "confidence": 0.96,
      "evidence": "A red ceramic mug is visible on the left."
    }
  ],
  "visibleTexts": [
    {
      "text": "Happy Birthday Alisha",
      "confidence": 0.91,
      "evidence": "Text is visible on the greeting card."
    }
  ],
  "imageQuality": {
    "adequate": true,
    "issues": []
  },
  "uncertainties": []
}
```

Validate it with a runtime schema library such as Zod. Reject malformed output and return `REVIEW`; never silently coerce it into a pass.

### Deterministic policy

- `PASS`: every required visible item and attribute matches, quantities match, required text matches, image quality is adequate, and relevant confidence values meet the configured threshold.
- `BLOCK`: a confident observation contradicts a critical requirement, a required item is confidently missing, quantity is wrong, or exact personalised text does not match.
- `REVIEW`: image is blurry/occluded, confidence is below threshold, observations conflict, model output is invalid, or the app cannot establish the requirement from the image.

Initial confidence threshold: `0.85`. Keep it configurable and do not claim it is scientifically calibrated.

Text comparison:

- Normalize outer whitespace and Unicode representation.
- Preserve meaningful spelling, numbers, and names.
- Personalised names/messages should default to exact normalized comparison.
- Never auto-correct a customer's name and then mark it as passed.

Image limitations must be visible in the UI:

- ParcelProof verifies only what is visible.
- It cannot prove an obscured or sealed item is present.
- It does not verify that electronics function.
- Low confidence requires human review.

## 7. Proposed AWS architecture

Use one language where practical to move quickly: TypeScript across frontend, backend, and infrastructure.

### Frontend

- React + TypeScript + Vite
- Responsive, accessible interface
- Static build hosted on private Amazon S3 behind Amazon CloudFront
- CloudFront public HTTPS URL is the ship-gate URL
- A custom domain is optional and should not delay shipping

### Backend

- Amazon API Gateway HTTP API
- AWS Lambda using a current supported Node.js runtime
- Amazon DynamoDB for orders and inspection history
- Private Amazon S3 bucket for packing images
- Short-lived presigned upload URLs
- Amazon Bedrock Converse API with a vision-capable model available in `us-east-1`
- Amazon CloudWatch logs and metrics
- AWS X-Ray only if it can be enabled without delaying the core workflow

### Infrastructure and deployment

- AWS CDK v2 in TypeScript
- One deployable stack for the MVP unless splitting materially improves reliability
- GitHub Actions with AWS OIDC is a stretch goal after local CDK deployment succeeds
- Every resource tagged:
  - `Project=ParcelProof`
  - `Hackathon=ZeroToShipped`
  - `Environment=prod`

### Data design

A simple DynamoDB single-table design is sufficient:

```text
PK = ORDER#<orderId>
SK = META

PK = ORDER#<orderId>
SK = INSPECTION#<timestamp>#<inspectionId>
```

Order fields:

- order ID and display number
- customer display name or demo alias
- expected item requirements
- creation/update timestamps
- latest inspection status

Inspection fields:

- S3 object key, never a public object URL
- structured model observations
- deterministic comparison results
- final status
- model ID and prompt/schema version
- latency and approximate inference usage if available
- timestamps

### API sketch

```text
POST /orders
GET  /orders/{orderId}
POST /orders/{orderId}/upload-url
POST /orders/{orderId}/inspections
GET  /orders/{orderId}/inspections
GET  /health
```

The inspection endpoint should accept an S3 object key, not a large base64 image.

## 8. Security, privacy, and cost guardrails

- Use least-privilege IAM policies.
- Never put AWS credentials in source code, `.env` committed to Git, screenshots, logs, or the Builder Center post.
- Keep image bucket private with Block Public Access enabled.
- Use S3 server-side encryption.
- Presigned upload URLs should expire quickly, such as five minutes.
- Validate MIME type and maximum image size before processing.
- Add an S3 lifecycle rule to delete demo uploads after a short documented period, but not before judging finishes if evidence depends on them.
- Do not log base64 image data, credentials, or raw sensitive customer details.
- Configure API Gateway throttling and Lambda concurrency conservatively.
- Use demo aliases rather than real customer information.
- Apply short CloudWatch log retention appropriate for the judging window.
- Tag resources so costs can be found and cleaned up later.
- Do not delete the production stack until judging and winner verification are over.
- Before destructive AWS actions, resolve the exact resource and obtain explicit user confirmation.

## 9. Repository target structure

```text
ParcelProof/
├── .github/
│   └── workflows/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── shared/
├── infrastructure/
├── docs/
│   ├── evidence/
│   ├── architecture/
│   └── submission/
├── test-fixtures/
│   ├── images/
│   └── expected-results.json
├── .gitignore
├── BUILD_LOG.md
├── PARCELPROOF_MASTER_BRIEF.md
├── README.md
├── package.json
└── LICENSE
```

Use npm workspaces. Keep scripts simple and runnable from repository root.

Expected root commands after setup:

```text
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run cdk:synth
npm run deploy
```

## 10. Urgent execution plan

### Phase 0 — Connection and evidence, 30–45 minutes

1. Read this brief.
2. Inspect the repository and current tools.
3. Use `aws-mcp` for a read-only identity call.
4. Check which Bedrock vision-capable models are available in `us-east-1`.
5. Save redacted connection evidence in `docs/evidence/`.
6. Start `BUILD_LOG.md` with timestamped factual entries.
7. Confirm Git remote and make the first commit containing planning/scaffolding files.

Exit condition: agent/AWS connection is proven and no secret appears in the repo.

### Phase 1 — Ship a public skeleton first, 2–3 hours

1. Scaffold npm workspaces, React application, Lambda API, shared schemas, and CDK stack.
2. Implement `/health`.
3. Add a simple branded landing page and judge-demo entry point.
4. Add CDK infrastructure tests.
5. Bootstrap CDK if necessary and deploy.
6. Verify the public CloudFront URL and API health endpoint from outside the local environment.
7. Record URLs, stack outputs, screenshots, and deployment evidence.

Exit condition: ship gate has a live public AWS application, even before image verification is complete.

### Phase 2 — End-to-end ParcelProof flow, 4–6 hours

1. Implement order schema and DynamoDB persistence.
2. Implement presigned image upload.
3. Check Bedrock access with one small controlled image.
4. Implement structured observation prompt and response validation.
5. Implement the deterministic comparator with unit tests first.
6. Implement inspection persistence and history.
7. Build the complete web flow.
8. Deploy and verify in production.

Exit condition: incorrect demo photo blocks, corrected photo passes or safely requests review, and both inspections appear in history.

### Phase 3 — Evaluation and trust, 3–4 hours

Create a small labelled test set. Suggested minimum is 12–20 images covering:

- correct parcel
- wrong colour
- missing item
- extra item
- wrong quantity
- wrong personalised name
- similar spelling in a name
- partly hidden item
- blurry image
- low light
- multiple items touching
- irrelevant image

For every fixture, record expected and actual status. Publish the real result, including failures. Do not fabricate perfect accuracy.

Required automated tests:

- comparator unit tests
- JSON schema validation tests
- invalid/partial model response tests
- API tests with Bedrock mocked
- DynamoDB repository tests or a narrow integration test
- CDK assertions for private S3, encryption, IAM scope, and public frontend
- Playwright browser test for the seeded judge flow

Exit condition: `PASS`, `BLOCK`, and `REVIEW` are all reachable and tested.

### Phase 4 — Polish, story, and submission, 4–6 hours

1. Improve mobile layout, accessibility, empty/error states, and response explanations.
2. Add a one-click judge demo with the sample order already populated.
3. Capture a clean 60–90 second demo video.
4. Complete README, architecture diagram, evidence index, test report, and limitations.
5. Draft and publish the Builder Center project.
6. Add category and lane tags.
7. Recheck the public app in an incognito browser and from a second network if possible.
8. Recheck that the automated scorer can reach the application without login.
9. Submit before the internal deadline; keep time for a final production smoke test.

## 11. Evidence plan

Create `docs/evidence/EVIDENCE_INDEX.md` and link every item.

Capture during work, not afterward:

- Redacted `codex mcp get aws-mcp` output
- Successful read-only AWS MCP call
- CloudTrail event showing an MCP-initiated AWS request where available
- Agent-created CDK diff or commit
- First successful stack deployment
- A real deployment/debugging problem and the agent-assisted diagnosis
- CloudFormation stack status
- CloudWatch Lambda logs with secrets and identifiers redacted
- Public CloudFront URL
- Incorrect packing photo and `BLOCK` result
- Corrected photo and `PASS` result
- Low-quality photo and `REVIEW` result
- Test command output and honest test totals
- AWS cost snapshot or clearly labelled estimate
- Git commit history showing incremental development

Never claim that a test, user interview, cost saving, model accuracy, or AWS call occurred unless there is evidence.

Suggested `BUILD_LOG.md` entry format:

```markdown
## 2026-10-01 14:30 PKT — Bedrock access check

- Goal:
- Agent action:
- AWS services/API calls:
- Result:
- Evidence:
- Decision/next step:
```

## 12. User experience specification

### Judge landing state

The first screen should answer immediately:

- What problem does this solve?
- Who is it for?
- What should I click?

Primary button: **Run the demo order**

Secondary button: **Create a custom order**

### Inspection result

Show one dominant result:

- Green: `Ready to ship`
- Red: `Shipment blocked`
- Amber: `Needs human review`

Below it, show a requirement-by-requirement table:

```text
Requirement                 Observation                 Result
Blue mug ×1                 Red mug ×1                  Mismatch
Chocolate ×1                Chocolate ×1                Match
Greeting card ×1            Greeting card ×1            Match
Text: Ayesha                Text: Alisha                Mismatch
```

Include:

- concise evidence from the image
- confidence without pretending it is certainty
- visible limitations
- `Correct parcel and inspect again` action
- chronological inspection history

Avoid a generic chatbot. The product is a task workflow.

## 13. Evaluation metrics

Measure only what the project actually observes:

- Total labelled fixture images
- Correct final statuses / total fixtures
- False passes, which are the most serious failure
- False blocks
- Review rate
- Median and p95 inspection latency if enough runs exist
- Approximate cost per inspection, labelled as an estimate unless billing data proves it
- Successful correction loops

Do not turn a tiny fixture set into a broad accuracy claim. Suitable wording:

> On our labelled 16-image demo set, ParcelProof produced X correct statuses, Y false blocks, Z reviews, and zero/one false passes. This is a product test, not a general computer-vision benchmark.

## 14. Failure handling

- Bedrock unavailable: return `REVIEW`, preserve the order, and offer retry. Never fake a pass.
- Malformed model JSON: record a sanitized error, return `REVIEW`, and test this path.
- Upload fails: show retry without creating a phantom inspection.
- Image too large or wrong format: reject before issuing/using processing request.
- DynamoDB write fails: do not display a final success state.
- Duplicate submission: use an idempotency key or disable the button while processing.
- Model detects no relevant objects: return `REVIEW` with image guidance.
- Public demo abuse: throttle requests and keep upload limits small.

## 15. Builder Center article outline

Working title:

> ParcelProof: Catching personalised-order mistakes before the parcel ships

Outline:

1. **The expensive small mistake** — tell one concrete Ayesha/Alisha order story.
2. **What ParcelProof does** — show the 20-second workflow.
3. **The live result** — wrong parcel blocked, corrected parcel verified.
4. **How trust works** — model observes; deterministic policy decides; uncertainty becomes review.
5. **AWS architecture** — explain each service's actual role.
6. **How Codex connected to AWS** — MCP setup, calls, deployment, logs, and redacted evidence.
7. **What broke during development** — one or two real failures and how the agent helped resolve them.
8. **Testing** — publish real fixture outcomes and reachable negative paths.
9. **Security, privacy, cost, and limitations** — private images, short-lived links, no hidden-item claims.
10. **Commercial direction** — small personalised sellers first; barcode/inventory integrations later.
11. **Links** — live app, repository, demo video, and evidence index.

Use the tags `#commercial-potential` and `#startups`.

## 16. README checklist

The repository README should include:

- One-line pitch and screenshot/GIF
- Live application URL
- Demo instructions requiring no account
- Architecture diagram
- AWS services and why each is used
- Trust/decision model
- Local development instructions
- Deployment instructions
- Test instructions and measured results
- Security/privacy notes
- Known limitations
- Coding-agent connection evidence link
- Builder Center project link when published
- Licence

## 17. Definition of done

ParcelProof is ready to submit only when all are true:

- [ ] Public application loads over HTTPS without sign-in
- [ ] API health endpoint works
- [ ] Demo order can be opened in one click
- [ ] Private photo upload works in production
- [ ] Real Bedrock vision call runs in production
- [ ] Wrong parcel produces an evidence-backed `BLOCK`
- [ ] Corrected parcel produces `PASS` or an honest `REVIEW`
- [ ] Ambiguous photo reaches `REVIEW`
- [ ] Inspection history persists
- [ ] Unit, integration, CDK, and browser tests pass
- [ ] AWS resources and permissions have been reviewed
- [ ] No secrets or account identifiers are published
- [ ] AWS MCP/coding-agent proof is documented
- [ ] Live URL is tested in incognito mode
- [ ] README is complete
- [ ] Demo video is accessible
- [ ] Builder Center article is published
- [ ] Correct category and lane tags are attached
- [ ] Submission is completed before the official deadline

## 18. Decision rules for the coding agent

The new Codex chat should follow these rules:

1. Start with a read-only MCP connection check, then ship a minimal public skeleton early.
2. Use the official AWS MCP Server for relevant AWS discovery and operations so the agent connection is demonstrable.
3. Prefer infrastructure as code over undocumented console clicking.
4. Keep a factual build log and evidence index as work happens.
5. Make small commits at meaningful milestones.
6. Never invent benchmark results, user counts, savings, tests, costs, or AWS evidence.
7. Preserve uncertainty in the product: ambiguous input must become `REVIEW`.
8. Keep all images private and all secrets out of Git.
9. Do not add authentication, payments, analytics dashboards, inventory management, or continuous video until the core flow is live and tested.
10. If a Bedrock model is unavailable, inspect the account's actual available models and adapt; do not silently replace real inference with a mock in production.
11. If blocked, exhaust safe read-only diagnostics and continue with any independent work.
12. Prioritize ship-gate compliance, reliable demo flow, evidence, and submission quality over feature count.

## 19. Immediate first tasks

The new chat should perform these without reopening product selection:

1. Verify `aws-mcp` is visible and make a read-only AWS identity request.
2. Inspect actual Bedrock multimodal model availability in `us-east-1`.
3. Check Git status and remote.
4. Scaffold the monorepo and `BUILD_LOG.md`.
5. Write comparator tests before the comparator implementation.
6. Create the CDK stack and deploy a public landing page plus `/health`.
7. Commit and push the first live vertical-slice milestone.

The first status report to the user should be concise and include: what was verified, what is now live, any blocker, and the next concrete milestone.

---

This brief contains strategic recommendations based on the supplied hackathon rules and prior competitor research. It does not guarantee a win. The strongest path is to ship a reliable, honest, memorable product and document the evidence clearly.
