# Evidence index

Only completed, reproducible evidence is marked verified.

| Evidence | Status | Location |
| --- | --- | --- |
| AWS coding-agent/MCP registration | Verified | [Reproducible connection proof](aws-mcp-connection.md) |
| AWS-recommended Regions connection check | Verified | 34 Regions returned through `aws-mcp`; `us-east-1` present |
| Redacted account-scoped read-only call | Verified | `sts:GetCallerIdentity` succeeded through a fresh Codex run; identifiers discarded |
| Bedrock model discovery | Verified | [Connection proof and model metadata](aws-mcp-connection.md) |
| Automated quality gates | Verified | 13 tests across four suites; lint, typecheck, build, CDK synth, and two live Chromium journeys passed |
| CloudFormation deployment | Verified | [Phase 1 deployment](phase-1-deployment.md) |
| Public CloudFront application | Verified | [Live application](https://d1ia8x26lvtay4.cloudfront.net) |
| Public API health response | Verified | [Health endpoint](https://ebuk0g78lb.execute-api.us-east-1.amazonaws.com/health) |
| Live order/upload/Bedrock/policy/history slice | Verified | [Phase 2 live flow](phase-2-live-flow.md) |
| Browser-rendered judge workflow | Verified | [Screenshot](live-judge-workflow.png) |
| Product UI — desktop | Verified | [Screenshot](product-ui-desktop.png) |
| Product UI — mobile | Verified | [Screenshot](product-ui-mobile.png) |
| Skill-led UI v3 — desktop | Verified | [Screenshot](ui-v3-desktop.png) |
| Skill-led UI v3 — mobile | Verified | [Screenshot](ui-v3-mobile.png) |
| Synthetic evaluation dataset | Verified | [12-case contact sheet](synthetic-dataset-contact-sheet.jpg) and `test-fixtures/synthetic/manifest.json` |
| Public one-click judge fixtures | Verified | Three realistic synthetic samples with [browser evidence](public-demo-data.png) and provenance in `apps/web/public/demo-data/` |
| Custom-order product workflow | Verified | [Production browser screenshot](product-v4-custom-order.png) and automated create-order journey |
| Live public-fixture evaluation | Verified | [Dated 3/3 scenario run](public-demo-live-results.md) through private S3 upload, Bedrock, and deterministic policy |
| Builder Center submission package | Prepared | [`docs/submission`](../submission/) — form copy, Markdown article, cover artwork, demo script, and final checklist |
