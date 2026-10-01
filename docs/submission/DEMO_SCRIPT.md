# ParcelProof demo script (60–90 seconds)

Record at 1080p with browser zoom at 100%, notifications disabled, and no AWS console or private identifiers visible.

## Shot list and voiceover

**0:00–0:08 — Problem**

Show the landing page and hero.

> “A personalised order can look almost right and still be expensive. ParcelProof catches visible packing mistakes before the parcel leaves the table.”

**0:08–0:18 — Load the contract**

Select **Run the demo order** and briefly show the blue mug, chocolate, card, and exact Ayesha message.

> “The seller loads the order contract in one click: items, quantities, variant, and exact personalised text.”

**0:18–0:38 — Wrong parcel**

Upload the controlled incorrect photo. Hold on the red `Shipment blocked` result and scroll through the evidence rows.

> “One private photo goes to Amazon Bedrock for observation. The model never decides whether to ship. Validated TypeScript policy blocks the red mug and the Alisha text mismatch.”

**0:38–0:58 — Correction loop**

Choose **Correct parcel and inspect again**, upload the corrected photo, and hold on the green result.

> “After correction, ParcelProof inspects again and returns Ready to ship only when every visible requirement is confidently satisfied.”

**0:58–1:10 — Evidence trail**

Show inspection history with the blocked and passed entries.

> “Both inspections remain linked, creating a simple dispatch evidence trail.”

**1:10–1:22 — Trust and architecture**

Scroll to the trust section.

> “CloudFront, Lambda, API Gateway, private S3, DynamoDB, and Amazon Bedrock form the live AWS workflow. Ambiguity or invalid model output becomes human review—never a fake pass.”

**1:22–1:28 — Close**

Return to the product mark and live URL.

> “ParcelProof: catch the wrong item before the parcel leaves the table.”

## Recording checklist

- Use the controlled wrong and corrected demo fixtures; do not depend on an improvised image.
- Confirm the live health endpoint immediately before recording.
- Wait for the result before moving the cursor.
- Do not edit away model latency; a short cut is fine, but keep the flow honest.
- Upload the final video to an accessible public or unlisted host and add its link to the Builder Center body and README.
