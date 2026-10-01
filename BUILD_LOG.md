# ParcelProof Build Log

Factual development record for the AWS Zero to Shipped submission. Public evidence is redacted.

## 2026-10-01 13:32 PKT — AWS MCP connection and model discovery

- Goal: Prove the coding agent can make read-only AWS calls and discover eligible Bedrock vision models.
- Agent action: Used the globally registered `aws-mcp` server from a non-interactive Codex coding-agent run. The first handshake timed out while `uvx` installed the proxy dependencies; after warming the package cache, a retry reached the server. A second retry was needed because the initial script used a blocked Python introspection attribute.
- AWS services/API calls: `sts:GetCallerIdentity`; `bedrock:ListFoundationModels` in `us-east-1`.
- Result: Both read-only calls succeeded. Caller type was redacted to `user/***`. Bedrock returned 120 model summaries; metadata included on-demand text-and-image-to-text candidates such as `amazon.nova-lite-v1:0` and `amazon.nova-pro-v1:0`.
- Evidence: [AWS MCP connection](docs/evidence/aws-mcp-connection.md)
- Decision/next step: Use Amazon Nova Lite as the initial cost-conscious candidate, subject to a real controlled-image access test in Phase 2.

## 2026-10-01 13:35 PKT — Phase 1 scaffolding started

- Goal: Ship a public AWS skeleton before building the inspection workflow.
- Agent action: Created the npm workspace layout, React/Vite landing page, Lambda health handler, shared schemas, and CDK stack/test foundation.
- AWS services/API calls: None for this entry.
- Result: Local gate passed after two concrete fixes: API response type narrowing and repository-root asset resolution for compiled CDK code. Lint, typecheck, production build, four tests, and CDK synthesis pass.
- Evidence: Test total: 4 passed across 2 files. CDK assertions cover private encrypted S3 buckets, CloudFront, `/health`, DynamoDB on-demand billing, encryption, and point-in-time recovery.
- Decision/next step: Commit the scaffold, deploy, and externally verify both public endpoints.

## 2026-10-01 13:56 PKT — Dependency security check

- Goal: Check the installed production dependency graph before deployment.
- Agent action: Ran `npm audit --omit=dev` and attempted the non-breaking automatic remediation.
- AWS services/API calls: None.
- Result: One high-severity denial-of-service advisory remains in `brace-expansion`, bundled inside the CDK library. It is in the infrastructure/deployment toolchain, not the browser or Lambda runtime bundle, and npm cannot override the bundled copy. Two moderate Vitest advisories are development-only. No issue is being hidden or represented as fixed.
- Evidence: Local command output in the coding-agent transcript.
- Decision/next step: Proceed with the urgent deployment; recheck updated CDK/Vitest releases without delaying the ship gate.

## 2026-10-01 14:08 PKT — First production deployment

- Goal: Satisfy the public AWS ship gate with a landing page and health endpoint.
- Agent action: Attempted CDK deployment, diagnosed a missing bootstrap stack, bootstrapped `us-east-1`, redeployed, and checked CloudFormation plus both public endpoints. The local CDK process lingered after CloudFormation reached `CREATE_COMPLETE`; it was stopped locally only after AWS completion was independently verified.
- AWS services/API calls: CloudFormation/CDK bootstrap and deployment; read-only CloudFormation status/output checks; HTTPS requests to CloudFront and API Gateway.
- Result: `ParcelProofStack` reached `CREATE_COMPLETE`. The CloudFront page returned HTTP 200 and included the ParcelProof title. `/health` returned `status: ok` and `service: parcelproof-api`.
- Evidence: [Phase 1 deployment](docs/evidence/phase-1-deployment.md)
- Decision/next step: Preserve the live stack and begin the deterministic comparator with tests first.

## 2026-10-01 14:15 PKT — Deterministic policy test-first milestone

- Goal: Make the model-observes/policy-decides trust boundary executable before adding Bedrock inference.
- Agent action: Wrote comparator tests first for correct parcel, wrong variant and name, missing item, low-quality/low-confidence review, and near-spelling personalization. Implemented strict observation schemas and the configurable `0.85` policy.
- AWS services/API calls: None.
- Result: 9 tests pass across API, policy, and infrastructure suites. Type checking passes.
- Evidence: Repository test output and commit history.
- Decision/next step: Build order persistence, private presigned upload, observation validation, and inspection orchestration around the tested policy.

## 2026-10-01 15:18 PKT — Production vertical slice and premium judge UI

- Goal: Ship the complete brief-defined workflow without adding auth, payments, or unrelated features.
- Agent action: Rebuilt the public experience around the judge path; implemented order persistence, private presigned uploads, Bedrock Converse observation, strict Zod validation, deterministic comparison, correction history, responsive states, API throttling, and stored-object size/type validation.
- AWS services/API calls: API Gateway, Lambda, DynamoDB, S3, Bedrock, CloudFront, CloudFormation.
- Result: The stack reached `UPDATE_COMPLETE`. A live Chromium test created an order and reached the private upload control. The wrong fixture produced `BLOCK` in the latest run; the corrected fixture has produced `PASS` and a two-inspection history. One earlier model-structure run returned safe `REVIEW`, which is retained as honest evidence of probabilistic variability.
- Problems found and fixed: CDK reserved concurrency could not be updated during the same Lambda operation and was removed; signed upload headers initially made browser PUTs fail and were reduced to the required content type; unconstrained JSON output was replaced with a forced Bedrock tool schema plus one explicit retry; item aliases were bounded to canonical mug/card/chocolate labels; runtime config loading now retries on the first action and surfaces pre-order failures.
- Evidence: [Phase 2 live flow](docs/evidence/phase-2-live-flow.md), controlled fixtures, and `docs/evidence/live-judge-workflow.png`.
- Quality gate: lint, typecheck, production build, CDK synth, 12 tests across four suites, and live Chromium smoke test pass.
- Decision/next step: Keep the MVP frozen to the brief. Remaining submission work is the manual demo recording and hackathon form.

## 2026-10-01 20:29 PKT — Product-grade 3D interface upgrade

- Goal: Make the live experience read as a complete commercial product while preserving the exact MVP boundary.
- Agent action: Added a cursor-responsive 3D inspection deck, animated scan and evidence overlays, live dispatch dashboard, privacy-vault visualization, decision-engine widget, stronger product navigation, responsive motion, and reduced-motion fallbacks. No WebGL or heavy runtime dependency was introduced.
- Result: Desktop and 390 px mobile visual QA passed against CloudFront. The real judge CTA still creates an order and reaches the private upload workflow. The stack returned to `UPDATE_COMPLETE`.
- Quality gate: lint and typecheck pass; 12 unit/infrastructure tests and the dedicated production Playwright test pass.
- Evidence: `docs/evidence/product-ui-desktop.png` and `docs/evidence/product-ui-mobile.png`.

## 2026-10-01 20:38 PKT — Skill-led visual redesign

- Goal: Replace the overly synthetic CSS composition with a clearer, more memorable product identity.
- Design process: Installed the official `figma-generate-design` and `figma-implement-design` skills, then applied their design-system, token, section-by-section, responsive, and screenshot-validation methodology. A Figma source file was not available, so no Figma MCP write was attempted.
- Asset process: Used the built-in ImageGen workflow to create a bespoke transparent 3D ParcelProof inspection hero, then saved the final asset at `apps/web/public/assets/parcelproof-3d-hero.png`.
- Result: Reworked the hero around a single premium focal asset, stronger commercial copy, restrained verification overlays, cleaner spacing, and responsive scale. Production desktop and 390 px mobile screenshots contain no runtime error banner.
- Quality gate: lint, typecheck, 12 unit/infrastructure tests, production build, live Playwright CTA/order workflow, and AWS deployment pass. Stack status is `UPDATE_COMPLETE`.
- Evidence: `docs/evidence/ui-v3-desktop.png` and `docs/evidence/ui-v3-mobile.png`.

## 2026-10-01 21:02 PKT — Diverse synthetic evaluation dataset

- Goal: Build controlled, realistic evaluation evidence without using or claiming real customer data.
- Agent action: Used the built-in ImageGen workflow to create distinct packing photographs across nine merchant segments. A repetitive first pass was deliberately curated down to 12 cases with only four mug scenarios and eight materially different product/quality scenarios.
- Coverage: two expected `PASS`, seven expected `BLOCK`, and three expected `REVIEW` cases; correct parcels, color/quantity/personalization mismatches, missing items, glare, shallow focus, and underexposure.
- Provenance: Every record is marked synthetic; the manifest declares that it contains no customer data. Pseudonymous order references exist only to make the fixtures operationally realistic.
- Validation: `npm run test:data` verifies the 12–20 case bound, unique IDs/files, allowed outcome labels, provenance flags, and the existence of every referenced image.
- Evidence: `test-fixtures/synthetic/manifest.json`, dataset README, and `docs/evidence/synthetic-dataset-contact-sheet.jpg`.

## 2026-10-01 21:24 PKT — Submission audit and judge package

- Goal: Convert the shipped product and factual evidence into a complete Builder Center submission without expanding the MVP.
- Agent action: Rechecked the official form and hackathon requirements, audited the repository against the master brief, expanded the README for judges, removed an unmeasured `98%` hero claim, prepared exact form copy and long-form Markdown, generated a text-free 1200 × 675 cover, and wrote a 60–90 second demo script plus final publish checklist.
- Result: All technical ship-gate items are documented as complete. The remaining owner-only actions are recording/hosting the demo video, previewing and publishing the Builder Center project, and saving the confirmation. The official current lane tag is recorded as singular `#startup`.
- Domain decision: Keep the verified CloudFront URL for the deadline. A custom hostname is optional and requires control of a registered domain or delegated subdomain; it will not block submission.
- Evidence: `docs/submission/` and the updated repository README.
