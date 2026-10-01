# AWS Builder Center submission — ready to paste

## Form fields

**Title**

ParcelProof: Catching personalised-order mistakes before dispatch

**Description**

ParcelProof helps small sellers catch wrong items, variants, quantities, and personalised text before dispatch. Amazon Bedrock observes one private packing photo; validated, deterministic policy returns PASS, REVIEW, or BLOCK with evidence and correction history.

**Tags**

- `#commercial-potential`
- `#startup`
- `#amazon-bedrock`
- `#serverless`
- `#ai-ml`

Use the exact tags offered by the Builder Center picker. The official 2026 hackathon page currently shows the lane as singular `#startup`; do not use both singular and plural.

**GitHub repository**

https://github.com/mindofyaseen/ParcelProof

**Endpoint or live demo**

https://d1ia8x26lvtay4.cloudfront.net

**Jupyter or SageMaker notebook**

Leave blank. ParcelProof is a deployed application, not a notebook project.

**Cover image**

Upload `parcelproof-builder-cover.jpg` from this folder. It is 1200 × 675 pixels, contains no text, and is under 2 MB.

---

## Body (Markdown)

# The expensive small mistake

A personalised gift seller receives a simple order: one blue mug, one chocolate bar, one greeting card, and the exact message **“Happy Birthday Ayesha.”**

At the packing table, the parcel contains a red mug and the card says **“Happy Birthday Alisha.”** Everything looks almost right. That is exactly the problem: one small visual mistake can become a refund, a reshipment, lost margin, and a disappointed customer.

Barcode systems are excellent for standard inventory, but a barcode does not confirm colour, visible custom text, a handwritten message, or the composition of a mixed gift box. Small personalised sellers need a lightweight final check before dispatch—not warehouse hardware.

That is why I built **ParcelProof**.

## What ParcelProof does

ParcelProof compares a structured order with one packing photo and returns one operational decision:

- **PASS — Ready to ship:** every visible requirement is confidently satisfied.
- **BLOCK — Shipment blocked:** a confident item, quantity, variant, or exact-text mismatch must be corrected.
- **REVIEW — Human review needed:** the image or model output is too uncertain for a safe automated result.

The judge flow requires no account:

1. Select **Run the demo order**.
2. Upload a JPG, PNG, or WebP packing photo.
3. See requirement-by-requirement evidence, confidence, and the final policy result.
4. Correct a blocked parcel and inspect it again.
5. See the full recovery trail retained against the same order.

**Live application:** https://d1ia8x26lvtay4.cloudfront.net

**Source and evidence:** https://github.com/mindofyaseen/ParcelProof

## The trust model: AI sees, policy decides

ParcelProof does not ask a model whether a parcel should ship.

Amazon Bedrock observes only what is visible: items, quantity, attributes, text, image quality, confidence, and uncertainty. The response is forced through a structured tool schema and validated at runtime with Zod. Deterministic TypeScript policy then owns the decision.

The MVP threshold is `0.85`. Exact personalised text remains exact after safe whitespace and Unicode normalisation. “Ayesha” cannot be silently corrected to “Alisha” and passed. Low confidence, poor image quality, contradictory evidence, malformed output, or a Bedrock failure becomes `REVIEW`—never a fabricated pass.

This separation is the core technical idea: use generative AI for perception while keeping business authority predictable, inspectable, and testable.

## A real AWS product, not a static mock-up

The public product runs entirely on AWS:

- **Amazon CloudFront** serves the no-login HTTPS experience.
- A private **Amazon S3** origin stores the web build.
- **Amazon API Gateway** exposes a throttled HTTP API.
- **AWS Lambda** orchestrates orders, uploads, inference, policy, and history.
- A second private **Amazon S3** bucket stores packing images uploaded through five-minute presigned URLs.
- **Amazon Bedrock**, using Amazon Nova Lite, performs real multimodal observation.
- **Amazon DynamoDB** persists orders and chronological inspection history.
- **AWS CDK and CloudFormation** make the complete stack reproducible.
- **Amazon CloudWatch** provides runtime logs and operational evidence.

Packing images never become public URLs. Public access is blocked, server-side encryption is enabled, uploads expire automatically after 14 days, and Lambda permissions are scoped to the required resources and Bedrock model.

## Building with Codex connected to AWS

Before deployment, I connected the coding agent to the official managed AWS MCP Server through a SigV4 proxy. The first recorded operations were deliberately read-only: a redacted identity check and Bedrock foundation-model discovery in `us-east-1`. This established that the agent could inspect the real AWS environment without publishing account-specific values.

Codex then helped me:

- build the React, Lambda, shared policy, and CDK workspaces in TypeScript;
- write comparator and infrastructure tests before the full workflow;
- bootstrap and deploy the AWS stack;
- diagnose a signed-upload header mismatch that caused browser PUT failures;
- replace unconstrained model JSON with a forced Bedrock tool schema and one bounded retry;
- validate the public flow in Chromium at desktop and mobile sizes;
- preserve a timestamped build log and redacted evidence index.

The connection proof and troubleshooting record are public in the repository without credentials, account IDs, or full resource identifiers: https://github.com/mindofyaseen/ParcelProof/blob/main/docs/evidence/aws-mcp-connection.md

## What broke—and why that improved the product

The first CDK deployment found that the AWS account had not been bootstrapped. The agent diagnosed the missing bootstrap parameter, ran the one-time bootstrap, and redeployed. The stack then reached `CREATE_COMPLETE`.

The initial presigned upload included headers the browser did not reproduce consistently, so valid images failed before inference. The upload contract was reduced to the required content type and verified in the live browser.

The first unconstrained Bedrock response also demonstrated why models should not own dispatch decisions. I replaced free-form output with a forced structured tool call, strict runtime validation, and one explicit repair retry. If valid evidence still cannot be established, the product records `REVIEW`.

These were not hidden demo issues; they shaped the final trust boundary.

## Evidence and testing

The current quality gate includes:

- 12 automated unit, API, and CDK tests;
- lint, TypeScript checking, production build, and CDK synthesis;
- a Playwright smoke test against the deployed no-login workflow;
- a verified production `BLOCK` for the incorrect demo parcel;
- a verified corrected `PASS` with two linked history entries;
- an earlier uncertain/invalid model response safely retained as `REVIEW` evidence;
- desktop and 390 px mobile visual checks;
- a provenance-labelled 12-image synthetic dataset across nine merchant segments.

The synthetic set contains two expected `PASS`, seven expected `BLOCK`, and three expected `REVIEW` cases. These are labelled expectations and regression fixtures—not a claim of general model accuracy. The repository deliberately distinguishes expected outcomes from measured production results.

## Honest limitations

ParcelProof verifies only what a single image makes visible. It cannot see through sealed packaging, prove an obscured item is present, test whether electronics work, verify weight or authenticity, or replace a person when evidence is ambiguous. The `0.85` threshold is an MVP guardrail, not a scientifically calibrated confidence score.

The product is also not claiming to invent packing verification. Enterprise systems already serve barcode and warehouse workflows. ParcelProof is testing a narrower hypothesis: small sellers of personalised, non-barcoded, visually variable products need a lightweight visual control point.

## Commercial direction

The initial customer is a home-based or small-team seller working through Instagram, WhatsApp, Etsy-style storefronts, or a gift-box operation. The value proposition is concrete: catch an avoidable visible mistake before it becomes a refund and reshipment.

The next commercial step is not more demo features. It is a seller pilot measuring false passes, false blocks, review rate, inspection latency, and successful correction loops on consented real packing workflows. Only after that evidence would barcode, inventory, courier, or team-management integrations make sense.

ParcelProof is intentionally a bounded product: one order, one private photo, visible evidence, and one safe dispatch decision.

## Links

- **Live app:** https://d1ia8x26lvtay4.cloudfront.net
- **Repository:** https://github.com/mindofyaseen/ParcelProof
- **Evidence index:** https://github.com/mindofyaseen/ParcelProof/blob/main/docs/evidence/EVIDENCE_INDEX.md
- **AWS coding-agent proof:** https://github.com/mindofyaseen/ParcelProof/blob/main/docs/evidence/aws-mcp-connection.md
- **Build log:** https://github.com/mindofyaseen/ParcelProof/blob/main/BUILD_LOG.md
