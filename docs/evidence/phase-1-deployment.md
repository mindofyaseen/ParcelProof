# Phase 1 deployment evidence

Date: 2026-10-01 (PKT)  
Region: `us-east-1`  
Stack: `ParcelProofStack`

## Result

- CloudFormation status: `CREATE_COMPLETE`
- Public application: <https://d1ia8x26lvtay4.cloudfront.net>
- Public health endpoint: <https://ebuk0g78lb.execute-api.us-east-1.amazonaws.com/health>
- External HTTP check: application returned `200` and contained the ParcelProof title.
- External API check: returned `status: ok` and `service: parcelproof-api`.

## Deployment issue and resolution

The first application deployment stopped before resource creation because the account had no CDK bootstrap stack. The coding agent identified the missing `/cdk-bootstrap/hnb659fds/version` parameter, ran the one-time CDK bootstrap in `us-east-1`, and redeployed. CloudFormation then completed successfully.

The local CDK command remained open after CloudFormation reported `CREATE_COMPLETE`. The agent independently confirmed the stack status and named outputs, stopped only the lingering local process, and verified the public URLs. No production resource was rolled back or deleted.

Account identifiers, role ARNs, bucket names, and table names are intentionally omitted.
