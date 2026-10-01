# Urgent execution checklist

## Phase 0 — connection and evidence

- [x] Read the master brief completely.
- [x] Inspect repository, Git remote, and local toolchain.
- [x] Verify `aws-mcp` with redacted `sts:GetCallerIdentity`.
- [x] Discover Bedrock vision-capable model metadata in `us-east-1`.
- [x] Start the build log and evidence index.
- [ ] Commit and push the verified scaffold.

## Phase 1 — public skeleton

- [x] Scaffold npm workspaces, React, Lambda, shared package, and CDK.
- [x] Implement `/health` and the judge-facing demo entry screen.
- [x] Add CDK assertions.
- [x] Pass lint, typecheck, tests, build, and CDK synth.
- [ ] Bootstrap/deploy the AWS stack.
- [ ] Verify public CloudFront and API URLs externally; record evidence.

## Next milestone — constrained Phase 2 vertical slice

- [ ] Implement tested deterministic comparator, orders, private uploads, Bedrock observations, and history.
- [ ] Prove wrong parcel `BLOCK`, corrected parcel `PASS` or safe `REVIEW`, and ambiguous photo `REVIEW`.
