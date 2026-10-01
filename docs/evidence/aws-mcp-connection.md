# AWS coding-agent connection proof

Date: 2026-10-01 (PKT)

Region: `us-east-1`

Coding agent: OpenAI Codex

Connection: official managed AWS MCP Server over local stdio/SigV4 proxy

This document records reproducible, safely redacted evidence that the coding agent—not a copied terminal result—connected to AWS and used read-only AWS tools. It follows the verification approach in AWS Builder Center's [Connect your AI coding agent to AWS](https://builder.aws.com/content/3JQdUYne1ujIvtoLgWiV7iBGklF/connect-your-ai-coding-agent-to-aws) guide.

## 1. Registered managed server

`codex mcp get aws-mcp` returned:

```text
aws-mcp
  enabled: true
  transport: stdio
  command: uvx
  args: mcp-proxy-for-aws-cli@latest
        https://aws-mcp.us-east-1.api.aws/mcp
        --metadata AWS_REGION=us-east-1
```

No credentials are stored in the repository. Authentication remains in the user's existing AWS sign-in context, and AWS permissions continue to control which operations the agent may perform.

## 2. Official connection check: available Regions

AWS recommends starting a new agent conversation and asking a question that requires the server, such as “What AWS Regions are available?” A fresh ephemeral Codex coding-agent run was instructed to use only the registered `aws-mcp` server and not the AWS CLI or shell for AWS access.

The coding-agent transcript recorded the tool event:

```text
mcp: aws-mcp/aws___list_regions started
mcp: aws-mcp/aws___list_regions completed
```

Redacted result:

```json
{
  "mcpServer": "aws-mcp",
  "regionsCall": {
    "operation": "ListRegions",
    "status": "success",
    "count": 34,
    "includesUsEast1": true
  },
  "verifiedAtUtc": "2026-10-01T16:27:31.894Z"
}
```

## 3. Read-only identity check

A second fresh Codex run made exactly one read-only `sts:GetCallerIdentity` request through `aws-mcp`. The prompt explicitly prohibited printing account IDs, user IDs, ARNs, credentials, tokens, or resource identifiers.

The coding-agent transcript recorded:

```text
mcp: aws-mcp/aws___run_script started
mcp: aws-mcp/aws___run_script completed
```

Safe result retained for public evidence:

```json
{
  "mcpServer": "aws-mcp",
  "operation": "sts:GetCallerIdentity",
  "status": "success",
  "principalType": "redacted",
  "identifiersPublished": false,
  "verifiedAtUtc": "2026-10-01T16:28:56.316256Z"
}
```

The account ID, caller ID, and full ARN were intentionally discarded rather than masked after publication.

## 4. Bedrock discovery through the agent

The original pre-deployment coding-agent verification also completed these read-only calls:

```json
[
  { "service": "sts", "operation": "GetCallerIdentity", "status": "success" },
  {
    "service": "bedrock",
    "operation": "ListFoundationModels",
    "status": "success",
    "items": 120
  }
]
```

The returned metadata included `amazon.nova-lite-v1:0` and `amazon.nova-pro-v1:0` among models advertising text-and-image input, text output, and on-demand inference. ParcelProof subsequently used Nova Lite in the live production inspection workflow.

## 5. What the agent used the connection for

- Confirming the AWS identity was available without exposing it.
- Discovering actual multimodal Bedrock models available in `us-east-1`.
- Selecting the deployed Nova Lite model based on current account-visible metadata.
- Supporting deployment diagnostics while CDK and CloudFormation remained the reproducible source of infrastructure changes.

## 6. Safety and troubleshooting record

- The initial MCP handshake timed out while `uvx` downloaded the proxy package. Warming the package cache allowed the next connection to succeed.
- An early general script was rejected because it contained a blocked Python introspection attribute. The agent removed the attribute and repeated the same read-only calls.
- During the 2026-10-01 recheck, a strict read-only nested harness completed `ListRegions` but cancelled the general `run_script` tool at its approval boundary. The identity check was rerun in an approval-aware coding-agent session and completed successfully. No write AWS operation was requested.
- Public evidence contains no AWS account number, full ARN, access key, secret key, session token, or private customer information.

## Verification summary

| Requirement | Evidence | Status |
| --- | --- | --- |
| Coding agent configured with AWS MCP | Redacted `codex mcp get aws-mcp` output | Verified |
| AWS-recommended Regions question works | `aws___list_regions`, 34 Regions, `us-east-1` present | Verified |
| Agent can make an account-scoped read-only call | Redacted `sts:GetCallerIdentity` success | Verified |
| Agent can inspect current AWS service metadata | Bedrock `ListFoundationModels` success | Verified |
| Secrets and account identifiers excluded | Repository scan plus intentionally discarded identifiers | Verified |
