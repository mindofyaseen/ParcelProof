# ParcelProof

Catch the wrong item before the parcel leaves the table.

ParcelProof is a focused packing-verification workflow for small sellers of personalised and visually variable products. A vision model observes the packing photo; deterministic code decides whether the parcel can ship, must be blocked, or needs human review.

## Live product

- [Open ParcelProof](https://d1ia8x26lvtay4.cloudfront.net)
- [API health](https://ebuk0g78lb.execute-api.us-east-1.amazonaws.com/health)

The vertical slice is live: create a demo order, upload a private packing photo, receive a Bedrock observation, get a deterministic `PASS`, `REVIEW`, or `BLOCK`, correct the parcel, and retain the inspection history.

## Architecture

```text
Browser → CloudFront → private S3 web origin
Browser → API Gateway → Lambda → DynamoDB
                    ↘ presigned PUT → private S3 image bucket
                      Lambda → Amazon Bedrock (Nova Lite)
```

The model can only observe. Zod validates its structured output and TypeScript policy owns the shipment decision. Low confidence, poor image quality, or invalid model output safely becomes `REVIEW`.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run cdk:synth
npm run deploy
```

See [the execution checklist](docs/EXECUTION_CHECKLIST.md) and [evidence index](docs/evidence/EVIDENCE_INDEX.md).
