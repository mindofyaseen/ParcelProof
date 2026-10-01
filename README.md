# ParcelProof

Catch the wrong item before the parcel leaves the table.

ParcelProof is a focused packing-verification workflow for small sellers of personalised and visually variable products. A vision model observes the packing photo; deterministic code decides whether the parcel can ship, must be blocked, or needs human review.

## Current milestone

Phase 1 builds a public AWS skeleton with a judge-friendly React page and a Lambda `/health` endpoint. The image-verification vertical slice follows without expanding the MVP.

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

