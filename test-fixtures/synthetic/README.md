# ParcelProof synthetic evaluation dataset

This directory contains 12 realistic but fully synthetic packing photographs created for controlled ParcelProof evaluation. It contains no customer images, orders, or personal data.

The dataset intentionally spans seven small-seller categories and three decision classes:

- 2 expected `PASS` cases
- 7 expected `BLOCK` cases
- 3 expected `REVIEW` cases

Cases cover correct parcels, color/quantity/personalization mismatches, missing items, glare, shallow focus, and underexposure. `manifest.json` is the source of truth for expected requirements and outcomes.

The images were generated with the built-in ImageGen workflow. They should be described publicly as **realistic synthetic evaluation data**, never as real customer data or independent production accuracy evidence.
