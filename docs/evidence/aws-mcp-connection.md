# AWS MCP connection evidence

Date: 2026-10-01 (PKT)  
Region: `us-east-1`  
Actor: Codex coding agent using the registered `aws-mcp` stdio server

## Registered transport (redacted)

```text
name: aws-mcp
enabled: true
transport: stdio
command: uvx
endpoint: https://aws-mcp.us-east-1.api.aws/mcp
metadata: AWS_REGION=us-east-1
```

## Verified read-only call audit

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

- Caller identity type: `user/***`
- Account ID and full ARN: intentionally omitted.
- The returned model metadata included `amazon.nova-lite-v1:0` and `amazon.nova-pro-v1:0` among models advertising `TEXT` + `IMAGE` input, `TEXT` output, and `ON_DEMAND` inference.
- This proves discovery only. Runtime invocation access will be tested separately with a controlled non-sensitive image.

## Troubleshooting record

The first MCP handshake timed out while `uvx` downloaded and installed the proxy package. Running the proxy help command warmed its local package cache. The next MCP connection succeeded. The first submitted script was rejected by server-side validation for Python introspection; the coding agent removed that attribute and reran the same two read-only API calls successfully.

