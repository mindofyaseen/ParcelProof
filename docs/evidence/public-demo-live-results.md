# Public demo live evaluation

Verified on **2026-10-02 at 11:35 UTC** against the deployed ParcelProof AWS API. The evaluation created an order, uploaded each public synthetic fixture through a private presigned S3 URL, invoked the live Amazon Bedrock inspection path, and compared the policy result with the fixture's intended scenario.

| Synthetic fixture | Intended scenario | Live result | Bedrock + policy latency |
|---|---|---:|---:|
| `wrong-parcel.webp` | Wrong mug colour and incorrect card | **BLOCK** | 3,618 ms |
| `corrected-parcel.webp` | Correct items, colour, quantity, and exact card text | **PASS** | 2,356 ms |
| `unclear-parcel.webp` | Motion blur and glare make the evidence unsafe | **REVIEW** | 2,160 ms |

All **3 of 3** scenario outcomes matched their intended safety state in this dated run. This is a small product-demo evaluation, not a statistical accuracy claim. Model output may vary, and ParcelProof deliberately sends uncertain evidence to human review.

## Reproduce

From the repository root:

```bash
npm run test:live-demo
```

The runner is [`scripts/run-public-demo-evaluation.mjs`](../../scripts/run-public-demo-evaluation.mjs). It prints the timestamp, expected and actual status, latency, decision reasons, and every deterministic requirement check. Set `PARCELPROOF_API_URL` to target another deployment or `PARCELPROOF_FIXTURE` to run one named fixture.
