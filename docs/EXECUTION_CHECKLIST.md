# Urgent execution checklist

## Phase 0 — connection and evidence

- [x] Read the master brief completely.
- [x] Inspect repository, Git remote, and local toolchain.
- [x] Verify `aws-mcp` with redacted `sts:GetCallerIdentity`.
- [x] Discover Bedrock vision-capable model metadata in `us-east-1`.
- [x] Start the build log and evidence index.
- [x] Commit and push the verified scaffold.

## Phase 1 — public skeleton

- [x] Scaffold npm workspaces, React, Lambda, shared package, and CDK.
- [x] Implement `/health` and the judge-facing demo entry screen.
- [x] Add CDK assertions.
- [x] Pass lint, typecheck, tests, build, and CDK synth.
- [x] Bootstrap/deploy the AWS stack.
- [x] Verify public CloudFront and API URLs externally; record evidence.

## Phase 2 — constrained vertical slice

- [x] Implement the deterministic comparator with tests first.
- [x] Implement orders, private uploads, Bedrock observations, and history.
- [x] Prove wrong parcel `BLOCK`, corrected parcel `PASS`, and invalid model output safely degrades to `REVIEW`.
- [x] Add client/server file validation, API throttling, and forced structured Bedrock output.
- [x] Verify the production CTA and upload workflow with Chromium.

## Phase 3 — evaluation and submission

- [x] Preserve controlled wrong/corrected fixtures and live-flow evidence.
- [x] Record model variability honestly instead of claiming perfect accuracy.
- [x] Add a browser smoke test and final quality gates.
- [ ] Record a short submission demo video and complete the hackathon submission form (manual owner task).
