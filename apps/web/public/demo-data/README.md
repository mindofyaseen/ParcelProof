# ParcelProof public demo data

These three packing photographs are public, realistic synthetic fixtures so judges can exercise the live workflow without preparing their own parcel.

| File | Scenario | Expected policy path |
| --- | --- | --- |
| `wrong-parcel.webp` | Red mug and “Alisha” card against the blue mug and “Ayesha” order | `BLOCK` |
| `corrected-parcel.webp` | Blue mug, chocolate bar, and correct “Ayesha” card | `PASS` |
| `unclear-parcel.webp` | Correct parcel photographed with motion blur, glare, and poor visibility | `REVIEW` |

The labels are expected outcomes for product testing, not a promise of model accuracy. Amazon Bedrock remains probabilistic, and the deterministic policy may safely select `REVIEW` whenever evidence is insufficient.

Provenance:

- All three images were generated for ParcelProof.
- No customer photograph, customer name, address, order, or other personal data is included.
- “Ayesha” and “Alisha” are fictional demonstration names.
- The unclear fixture is a deliberately degraded derivative of the corrected synthetic parcel.
