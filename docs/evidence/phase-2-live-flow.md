# Phase 2 live vertical-slice evidence

Verified on 2026-10-01 against the deployed AWS environment.

## Production path

- CloudFront served the responsive React application over HTTPS.
- The judge CTA created a real DynamoDB-backed order through API Gateway and Lambda.
- The browser requested a five-minute, order-scoped presigned URL and uploaded directly to the private encrypted S3 bucket.
- Lambda loaded the object, invoked Amazon Nova Lite through Bedrock Converse with a forced observation tool schema, validated the response with Zod, and applied deterministic policy code.
- The wrong controlled fixture produced `BLOCK` in the latest run. A prior run safely returned `REVIEW` when structured model output was incomplete; it did not silently pass.
- The corrected controlled fixture has produced `PASS` and the same order retained both inspections as a correction trail. Bedrock output remains probabilistic, so the UI explicitly supports safe review and retry.

## Controlled fixtures

- `test-fixtures/images/wrong-parcel-alisha.png`: red mug and card addressed to Alisha; order expects blue and Ayesha.
- `test-fixtures/images/corrected-parcel-ayesha.png`: blue mug and card addressed to Ayesha.

These synthetic fixtures were created specifically for repeatable product testing; they contain no user data.

## Automated gates

- 12 unit/infrastructure tests pass across four suites.
- Live Chromium smoke test verified landing page, demo-order creation, and private-upload control.
- Lint, TypeScript, production build, and CDK synthesis pass.
- CDK assertions cover private encrypted buckets, DynamoDB recovery, HTTPS delivery, workflow routes, and API rate limits.

## Safety behavior

- Unsupported formats and declared files over 8 MB are rejected before upload.
- Stored object type and actual S3 content length are checked before inference.
- Missing/invalid model fields trigger one explicit structured retry; continued invalidity returns `REVIEW`.
- The model records observations only. Exact personalization, quantities, variants, confidence threshold, and final PASS/REVIEW/BLOCK are deterministic code.

Screenshot: `docs/evidence/live-judge-workflow.png`.
