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
